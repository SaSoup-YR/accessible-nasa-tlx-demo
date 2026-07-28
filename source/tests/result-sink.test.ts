// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  QUALTRICS_RECEIPT_MESSAGE,
  QUALTRICS_REVEAL_MESSAGE,
  QUALTRICS_SUBMIT_MESSAGE,
  configuredResultSink,
  createQualtricsParentResultSink,
  requestQualtricsParentReveal,
  submitToApprovedResultSink,
} from '../src/result-sink';
import type { StudyResultRecord } from '../src/study';

const record = {
  submissionId: 'submission-fixed',
} as StudyResultRecord;

afterEach(() => {
  delete window.accessibleQuestionnaireResultSink;
  delete window.accessibleNasaTlxResultSink;
});

describe('approved host result sink', () => {
  it('is absent unless the host page explicitly installs a named submit function', () => {
    expect(configuredResultSink()).toBeNull();
    window.accessibleNasaTlxResultSink = { name: '', async submit() {
      return { accepted: true, submissionId: 'submission-fixed' };
    } };
    expect(configuredResultSink()).toBeNull();
  });

  it('accepts only a receipt for the same idempotent submission ID', async () => {
    const sink = {
      name: 'Approved platform',
      async submit() {
        return { accepted: true as const, submissionId: 'submission-fixed', receiptId: 'receipt-001' };
      },
    };
    await expect(submitToApprovedResultSink(record, sink)).resolves.toEqual({
      accepted: true,
      submissionId: 'submission-fixed',
      receiptId: 'receipt-001',
    });
  });

  it('rejects a mismatched receipt instead of falsely reporting completion', async () => {
    const sink = {
      name: 'Approved platform',
      async submit() {
        return { accepted: true as const, submissionId: 'different-submission' };
      },
    };
    await expect(submitToApprovedResultSink(record, sink)).rejects.toThrow(/invalid submission receipt/i);
  });

  it('times out a host that never confirms receipt', async () => {
    const sink = {
      name: 'Unresponsive platform',
      async submit() {
        return new Promise<never>(() => undefined);
      },
    };
    await expect(submitToApprovedResultSink(record, sink, 5)).rejects.toThrow(/did not confirm receipt in time/i);
  });

  it('sends a record only to the configured Qualtrics origin and accepts a matching parent receipt', async () => {
    let receiveMessage: ((event: MessageEvent) => void) | undefined;
    const parent = {
      postMessage(message: any, targetOrigin: string) {
        expect(message.type).toBe(QUALTRICS_SUBMIT_MESSAGE);
        expect(message.record).toBe(record);
        expect(targetOrigin).toBe('https://ucl-example.eu.qualtrics.com');
        queueMicrotask(() => receiveMessage?.({
          source: parent,
          origin: targetOrigin,
          data: {
            type: QUALTRICS_RECEIPT_MESSAGE,
            accepted: true,
            submissionId: record.submissionId,
            receiptId: 'qualtrics-accepted-submission-fixed',
          },
        } as unknown as MessageEvent));
      },
    };
    const windowRef = {
      parent,
      setTimeout: window.setTimeout.bind(window),
      clearTimeout: window.clearTimeout.bind(window),
      addEventListener(type: string, listener: EventListener) {
        if (type === 'message') receiveMessage = listener as (event: MessageEvent) => void;
      },
      removeEventListener() {
        receiveMessage = undefined;
      },
    } as unknown as Window;
    const sink = createQualtricsParentResultSink(
      'https://ucl-example.eu.qualtrics.com',
      windowRef,
      20,
    );

    await expect(sink.submit(record)).resolves.toEqual({
      accepted: true,
      submissionId: 'submission-fixed',
      receiptId: 'qualtrics-accepted-submission-fixed',
    });
  });

  it('rejects direct opening instead of pretending Qualtrics collected the response', async () => {
    const directWindow = {
      setTimeout: window.setTimeout.bind(window),
      clearTimeout: window.clearTimeout.bind(window),
    } as unknown as Window;
    Object.defineProperty(directWindow, 'parent', { value: directWindow });
    const sink = createQualtricsParentResultSink('https://ucl-example.eu.qualtrics.com', directWindow);
    await expect(sink.submit(record)).rejects.toThrow(/opened through its Qualtrics survey/i);
  });

  it('requests parent-level visual reveal only from an embedded questionnaire and uses the exact origin', () => {
    const parent = { postMessage: vi.fn() };
    const windowRef = {
      parent,
      scrollY: 25,
      pageYOffset: 25,
    } as unknown as Window;
    const element = {
      getBoundingClientRect: () => ({
        top: 175,
        height: 80,
      }),
    } as unknown as HTMLElement;

    expect(requestQualtricsParentReveal(
      element,
      'https://ucl-example.eu.qualtrics.com',
      windowRef,
    )).toBe(true);
    expect(parent.postMessage).toHaveBeenCalledWith(
      {
        type: QUALTRICS_REVEAL_MESSAGE,
        offsetTop: 200,
        targetHeight: 80,
      },
      'https://ucl-example.eu.qualtrics.com',
    );

    Object.defineProperty(windowRef, 'parent', { value: windowRef });
    expect(requestQualtricsParentReveal(
      element,
      'https://ucl-example.eu.qualtrics.com',
      windowRef,
    )).toBe(false);
  });

  it('ships a syntactically valid Qualtrics parent bridge with exact-origin messaging and bounded raw fields', () => {
    const bridge = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/qualtrics-question.js'),
      'utf8',
    );
    expect(() => new Function(bridge)).not.toThrow();
    expect(bridge).toContain("var childOrigin = 'https://sasoup-yr.github.io'");
    expect(bridge).toContain('var rawChunkLength = 900');
    expect(bridge).toContain('var maximumRawChunks = 24');
    expect(bridge).toContain('var completionDelayMs = 1500');
    expect(bridge).toContain('}, completionDelayMs);');
    expect(bridge).toContain('question.showNextButton();');
    expect(bridge).not.toContain('No further action is required.');
    expect(bridge).toContain('Please keep this page open until the next page appears by itself.');
    expect(bridge).toContain('No backup download is required during this automatic transition.');
    expect(bridge).toContain('Qualtrics did not open the recorded result page.');
    expect(bridge).not.toContain('five minutes');
    expect(bridge).toContain('window.clearTimeout(completionTimerId);');
    expect(bridge).toContain('window.clearTimeout(advanceWatchdogTimerId);');
    expect(bridge).toContain('Qualtrics.SurveyEngine.setJSEmbeddedData(');
    expect(bridge).toContain(
      "setField('AQP_PRIMARY_SCORE', Number(record.result.primaryScore).toFixed(2));",
    );
    expect(bridge).toContain("setField('AQP_INSTRUMENT_ID', record.instrument.id);");
    expect(bridge).not.toContain('Qualtrics.SurveyEngine.setEmbeddedData(');
    expect(bridge).not.toMatch(/postMessage\([^)]*,\s*['"]\*['"]\s*\)/);

    const embeddedDataFields = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/embedded-data-fields.txt'),
      'utf8',
    )
      .trim()
      .split(/\r?\n/);
    expect(embeddedDataFields).toHaveLength(60);
    expect(embeddedDataFields.every((field) => field.startsWith('__js_AQP_'))).toBe(true);

    const questionHtml = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/question-html-template.html'),
      'utf8',
    );
    expect(questionHtml).toContain('id="accessible-questionnaire-recorded-summary"');
    expect(questionHtml).toContain('REFERENCE TEMPLATE ONLY');
    expect(questionHtml).toContain('style="display:none"');
    expect(questionHtml).toContain('display: block !important');
    expect(questionHtml).toContain('data-recorded="${e://Field/__js_AQP_ACCEPTED}"');
    expect(questionHtml).toContain(
      '#accessible-questionnaire-recorded-summary[data-recorded="1"] + #accessible-questionnaire-live-question',
    );
    expect(questionHtml).toContain('${e://Field/__js_AQP_PARTICIPANT_CODE}');
    expect(questionHtml).toContain('${e://Field/__js_AQP_PRIMARY_SCORE}');
    expect(questionHtml).toContain('${e://Field/__js_AQP_INSTRUMENT_NAME}');
    expect(questionHtml).not.toContain('__js_AQP_RAW_01');
    const summaryFields = [...questionHtml.matchAll(/\$\{e:\/\/Field\/(__js_AQP_[A-Z0-9_]+)\}/g)]
      .map((match) => match[1]);
    expect(summaryFields.length).toBeGreaterThan(20);
    expect(summaryFields.every((field) => embeddedDataFields.includes(field))).toBe(true);

    const endOfSurveyMessage = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/end-of-survey-message.txt'),
      'utf8',
    );
    expect(endOfSurveyMessage).toContain('Questionnaire complete');
    expect(endOfSurveyMessage).toContain('{{OPTIONAL_SCORE_BLOCK}}');
    expect(endOfSurveyMessage).toContain('Your questionnaire responses have been recorded successfully.');
    expect(endOfSurveyMessage).toContain(
      'accessibility-support choices and input-route information have been saved separately',
    );
    expect(endOfSurveyMessage).not.toMatch(/<[^>]+>/);
  });

  it('moves the Qualtrics parent viewport for a validated reveal request from its own iframe', () => {
    const bridge = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/qualtrics-question.js'),
      'utf8',
    );
    let onReady: (() => void) | undefined;
    let receiveMessage: ((event: MessageEvent) => void) | undefined;
    const frameWindow = { postMessage: vi.fn() };
    const iframe = {
      contentWindow: frameWindow,
      style: { height: '' },
      getBoundingClientRect: () => ({ top: 400 }),
    };
    const status = { textContent: '' };
    const scrollTo = vi.fn();
    const fakeWindow = {
      innerHeight: 800,
      scrollY: 100,
      scrollX: 0,
      pageYOffset: 100,
      pageXOffset: 0,
      scrollTo,
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
      requestAnimationFrame: vi.fn(),
      addEventListener(type: string, listener: EventListener) {
        if (type === 'message') receiveMessage = listener as (event: MessageEvent) => void;
      },
      removeEventListener: vi.fn(),
    };
    const fakeDocument = {
      getElementById(id: string) {
        if (id === 'accessible-questionnaire-frame') return iframe;
        if (id === 'accessible-questionnaire-collection-status') return status;
        return null;
      },
    };
    const fakeQualtrics = {
      SurveyEngine: {
        addOnReady(callback: () => void) {
          onReady = callback;
        },
        addOnUnload: vi.fn(),
        setJSEmbeddedData: vi.fn(),
      },
    };

    new Function('Qualtrics', 'document', 'window', bridge)(
      fakeQualtrics,
      fakeDocument,
      fakeWindow,
    );
    onReady!.call({
      hideNextButton: vi.fn(),
      showNextButton: vi.fn(),
      clickNextButton: vi.fn(),
    });

    receiveMessage!({
      source: frameWindow,
      origin: 'https://attacker.example',
      data: { type: QUALTRICS_REVEAL_MESSAGE, offsetTop: 600, targetHeight: 100 },
    } as unknown as MessageEvent);
    expect(scrollTo).not.toHaveBeenCalled();

    receiveMessage!({
      source: frameWindow,
      origin: 'https://sasoup-yr.github.io',
      data: { type: QUALTRICS_REVEAL_MESSAGE, offsetTop: 600, targetHeight: 100 },
    } as unknown as MessageEvent);
    expect(scrollTo).toHaveBeenCalledWith({
      top: 750,
      left: 0,
      behavior: 'auto',
    });

    const callsAfterValidRequest = scrollTo.mock.calls.length;
    receiveMessage!({
      source: frameWindow,
      origin: 'https://sasoup-yr.github.io',
      data: { type: QUALTRICS_REVEAL_MESSAGE, offsetTop: 1000000, targetHeight: 100 },
    } as unknown as MessageEvent);
    expect(scrollTo).toHaveBeenCalledTimes(callsAfterValidRequest);
  });

  it('stages a complete SUS record through the generic bridge and advances after the bounded hand-off', () => {
    const bridge = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/qualtrics-question.js'),
      'utf8',
    );
    const items = Array.from({ length: 10 }, (_, index) => `sus${String(index + 1).padStart(2, '0')}`);
    const ratings = Object.fromEntries(items.map((item, index) => [item, index % 2 === 0 ? 5 : 1]));
    const contributions = Object.fromEntries(items.map((item) => [item, 4]));
    const completeRecord = {
      schemaVersion: 4,
      submissionId: 'submission-complete',
      study: { studyId: 'SUS-TEST', configId: 'config-test' },
      participantCode: 'TEST-001',
      timing: {
        startedAt: '2026-07-27T10:00:00.000Z',
        completedAt: '2026-07-27T10:05:00.000Z',
      },
      prototype: { name: 'Accessible Questionnaire Platform', version: '0.8.0' },
      instrument: {
        id: 'system-usability-scale',
        name: 'System Usability Scale',
        version: 'brooke-1996',
        definitionSchemaVersion: 1,
        scoringStrategy: 'sus-standard-v1',
      },
      collection: { mode: 'qualtrics' },
      configuration: {
        showSimpleLanguage: false,
        answerMode: 'standard',
        largeText: false,
        audioGuidance: false,
        recoveryEnabled: true,
        participantAdjustmentPolicy: 'presentation-only',
        voiceInputAvailable: true,
        gazeInputAvailable: false,
      },
      responses: {
        ratings,
        pairwiseChoices: {},
        pairPresentationOrder: [],
      },
      result: {
        strategy: 'sus-standard-v1',
        scoreName: 'SUS score',
        primaryScore: 100,
        scoreMinimum: 0,
        scoreMaximum: 100,
        ratings,
        details: {
          kind: 'sus-contributions',
          contributions,
        },
      },
      supportMetadata: {
        ratingInputRoutes: { sus01: 'voice' },
        pairInputRoutes: {},
        supportChanges: [],
        simplerExplanationsShownAtSubmission: false,
        answerModeAtSubmission: 'standard',
        largeTextUsedAtSubmission: false,
        automaticAudioGuidanceEnabledAtSubmission: false,
        recoveryEnabledAtSubmission: true,
        readAloudUsed: false,
        interruptionSummaryShown: false,
        gazeUsed: false,
        gazeActionCount: 0,
      },
    };
    let onReady: (() => void) | undefined;
    let receiveMessage: ((event: MessageEvent) => void) | undefined;
    let completionCallback: (() => void) | undefined;
    let completionDelay: number | undefined;
    const setJSEmbeddedData = vi.fn();
    const hideNextButton = vi.fn();
    const showNextButton = vi.fn();
    const clickNextButton = vi.fn();
    const frameWindow = { postMessage: vi.fn() };
    const iframe = { contentWindow: frameWindow, style: { height: '' } };
    const status = { textContent: '' };
    const fakeQualtrics = {
      SurveyEngine: {
        addOnReady(callback: () => void) {
          onReady = callback;
        },
        addOnUnload: vi.fn(),
        setJSEmbeddedData,
      },
    };
    const fakeDocument = {
      getElementById(id: string) {
        if (id === 'accessible-questionnaire-frame') return iframe;
        if (id === 'accessible-questionnaire-collection-status') return status;
        return null;
      },
    };
    const fakeWindow = {
      setTimeout(callback: () => void, delay: number) {
        completionCallback = callback;
        completionDelay = delay;
        return 1;
      },
      clearTimeout: vi.fn(),
      addEventListener(type: string, listener: EventListener) {
        if (type === 'message') receiveMessage = listener as (event: MessageEvent) => void;
      },
      removeEventListener: vi.fn(),
    };

    new Function('Qualtrics', 'document', 'window', bridge)(
      fakeQualtrics,
      fakeDocument,
      fakeWindow,
    );
    onReady!.call({ hideNextButton, showNextButton, clickNextButton });
    receiveMessage!({
      source: frameWindow,
      origin: 'https://sasoup-yr.github.io',
      data: {
        type: QUALTRICS_SUBMIT_MESSAGE,
        record: completeRecord,
      },
    } as unknown as MessageEvent);

    expect(hideNextButton).toHaveBeenCalledOnce();
    expect(showNextButton).not.toHaveBeenCalled();
    expect(setJSEmbeddedData).toHaveBeenCalledTimes(60);
    expect(setJSEmbeddedData).toHaveBeenCalledWith('AQP_ACCEPTED', '1');
    expect(setJSEmbeddedData).toHaveBeenCalledWith('AQP_INSTRUMENT_ID', 'system-usability-scale');
    expect(setJSEmbeddedData).toHaveBeenCalledWith('AQP_PRIMARY_SCORE', '100.00');
    expect(frameWindow.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        accepted: true,
        submissionId: 'submission-complete',
        receiptId: 'qualtrics-accepted-submission-complete',
      }),
      'https://sasoup-yr.github.io',
    );
    expect(status.textContent).toContain('Please keep this page open');
    expect(completionDelay).toBe(1500);
    completionCallback!();
    expect(clickNextButton).toHaveBeenCalledOnce();
    expect(completionDelay).toBe(6000);
    completionCallback!();
    expect(showNextButton).toHaveBeenCalledOnce();
    expect(status.textContent).toContain('did not open the recorded result page');
  });

  it('restores Qualtrics navigation when an invalid record cannot be staged', () => {
    const bridge = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/qualtrics-question.js'),
      'utf8',
    );
    let onReady: (() => void) | undefined;
    let receiveMessage: ((event: MessageEvent) => void) | undefined;
    const showNextButton = vi.fn();
    const frameWindow = { postMessage: vi.fn() };
    const iframe = { contentWindow: frameWindow, style: { height: '' } };
    const status = { textContent: '' };
    const fakeWindow = {
      setTimeout,
      clearTimeout,
      addEventListener(type: string, listener: EventListener) {
        if (type === 'message') receiveMessage = listener as (event: MessageEvent) => void;
      },
      removeEventListener: vi.fn(),
    };
    const fakeQualtrics = {
      SurveyEngine: {
        addOnReady(callback: () => void) {
          onReady = callback;
        },
        addOnUnload: vi.fn(),
        setJSEmbeddedData: vi.fn(),
      },
    };
    const fakeDocument = {
      getElementById(id: string) {
        if (id === 'accessible-questionnaire-frame') return iframe;
        if (id === 'accessible-questionnaire-collection-status') return status;
        return null;
      },
    };
    new Function('Qualtrics', 'document', 'window', bridge)(
      fakeQualtrics,
      fakeDocument,
      fakeWindow,
    );
    onReady!.call({
      hideNextButton: vi.fn(),
      showNextButton,
      clickNextButton: vi.fn(),
    });

    receiveMessage!({
      source: frameWindow,
      origin: 'https://sasoup-yr.github.io',
      data: {
        type: QUALTRICS_SUBMIT_MESSAGE,
        record: { submissionId: 'incomplete' },
      },
    } as unknown as MessageEvent);

    expect(showNextButton).toHaveBeenCalledOnce();
    expect(status.textContent).toContain('Return to the questionnaire and try again');
    expect(frameWindow.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ accepted: false, submissionId: 'incomplete' }),
      'https://sasoup-yr.github.io',
    );
  });

  it('keeps native navigation available when the Qualtrics iframe is missing', () => {
    const bridge = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/qualtrics-question.js'),
      'utf8',
    );
    let onReady: (() => void) | undefined;
    const showNextButton = vi.fn();
    const hideNextButton = vi.fn();
    const status = { textContent: '' };
    const fakeQualtrics = {
      SurveyEngine: {
        addOnReady(callback: () => void) {
          onReady = callback;
        },
        addOnUnload: vi.fn(),
        setJSEmbeddedData: vi.fn(),
      },
    };
    const fakeDocument = {
      getElementById(id: string) {
        if (id === 'accessible-questionnaire-collection-status') return status;
        return null;
      },
    };
    const fakeWindow = {
      setTimeout,
      clearTimeout,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    new Function('Qualtrics', 'document', 'window', bridge)(
      fakeQualtrics,
      fakeDocument,
      fakeWindow,
    );
    onReady!.call({
      hideNextButton,
      showNextButton,
      clickNextButton: vi.fn(),
    });

    expect(hideNextButton).not.toHaveBeenCalled();
    expect(showNextButton).toHaveBeenCalledOnce();
    expect(status.textContent).toContain('iframe is missing');
  });
});
