// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  QUALTRICS_RECEIPT_MESSAGE,
  QUALTRICS_SUBMIT_MESSAGE,
  configuredResultSink,
  createQualtricsParentResultSink,
  submitToApprovedResultSink,
} from '../src/result-sink';
import type { StudyResultRecord } from '../src/study';

const record = {
  submissionId: 'submission-fixed',
} as StudyResultRecord;

afterEach(() => {
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

  it('ships a syntactically valid Qualtrics parent bridge with exact-origin messaging and bounded raw fields', () => {
    const bridge = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/qualtrics-question.js'),
      'utf8',
    );
    expect(() => new Function(bridge)).not.toThrow();
    expect(bridge).toContain("var childOrigin = 'https://sasoup-yr.github.io'");
    expect(bridge).toContain('var rawChunkLength = 900');
    expect(bridge).toContain('var maximumRawChunks = 24');
    expect(bridge).toContain('var advanceDelayMs = 5 * 60 * 1000');
    expect(bridge).toContain('}, advanceDelayMs);');
    expect(bridge).not.toContain('question.showNextButton();');
    expect(bridge).toContain('No further action is required.');
    expect(bridge).toContain('window.clearTimeout(advanceTimerId);');
    expect(bridge).toContain('Qualtrics.SurveyEngine.setJSEmbeddedData(');
    expect(bridge).toContain(
      "setField('ANTLX_WEIGHTED_SCORE', Number(record.result.weightedScore).toFixed(2));",
    );
    expect(bridge).not.toContain('Qualtrics.SurveyEngine.setEmbeddedData(');
    expect(bridge).not.toMatch(/postMessage\([^)]*,\s*['"]\*['"]\s*\)/);

    const embeddedDataFields = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/embedded-data-fields.txt'),
      'utf8',
    )
      .trim()
      .split(/\r?\n/);
    expect(embeddedDataFields).toHaveLength(63);
    expect(embeddedDataFields.every((field) => field.startsWith('__js_ANTLX_'))).toBe(true);

    const endOfSurveyMessage = readFileSync(
      resolve(process.cwd(), '../integrations/qualtrics/end-of-survey-message.txt'),
      'utf8',
    );
    expect(endOfSurveyMessage).toContain(
      'Thank you for completing the Accessible NASA-TLX questionnaire.',
    );
    expect(endOfSurveyMessage).toContain('${e://Field/__js_ANTLX_WEIGHTED_SCORE}/100');
    expect(endOfSurveyMessage).toContain('It is not a measure of your ability or a clinical assessment.');
    expect(endOfSurveyMessage).toContain('Your response has been recorded successfully.');
    expect(endOfSurveyMessage).not.toMatch(/<[^>]+>/);
  });
});
