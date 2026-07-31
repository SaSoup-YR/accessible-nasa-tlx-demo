// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibleNasaTlx } from '../src/accessible-nasa-tlx';
import {
  buildQuestionnairePairs,
  getQuestionnaireDefinition,
} from '../src/questionnaire-definition';
import { progressStorageKey } from '../src/study';

const nasaTlx = getQuestionnaireDefinition('nasa-tlx-weighted')!;
const savedSession = {
  version: 4,
  instrumentId: 'nasa-tlx-weighted',
  savedAt: 1722123456789,
  startedAt: '2026-07-27T12:00:00.000Z',
  configId: 'demo-config',
  participantCode: 'DEMO',
  stage: 'ratings',
  ratingIndex: 2,
  pairIndex: 0,
  pairOrder: buildQuestionnairePairs(nasaTlx),
  pairResponses: {},
  ratings: { mental: 40, physical: 25 },
  ratingInputRoutes: {},
  pairInputRoutes: {},
  supportChanges: [],
  support: {
    answerMode: 'standard',
    showSimpleLanguage: false,
    largeText: false,
    audioGuidance: true,
  },
} as const;

async function renderComponent() {
  const component = document.createElement('accessible-nasa-tlx') as AccessibleNasaTlx;
  document.body.append(component);
  await component.updateComplete;
  return component as any;
}

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  sessionStorage.clear();
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  document.body.replaceChildren();
  localStorage.clear();
  sessionStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('saved questionnaire recovery announcement', () => {
  it('loads a real saved session after refresh and automatically sends the exact message to opted-in audio', async () => {
    localStorage.setItem(
      progressStorageKey('demo-config', 'DEMO'),
      JSON.stringify(savedSession),
    );
    const speakText = vi
      .spyOn(AccessibleNasaTlx.prototype as any, 'speakText')
      .mockImplementation(() => undefined);

    const component = await renderComponent();
    await Promise.resolve();
    await component.updateComplete;
    await vi.advanceTimersByTimeAsync(650);

    expect(component.querySelector('#saved-session-offer')).not.toBeNull();
    expect(document.activeElement).toBe(component.querySelector('#saved-session-offer'));
    expect(speakText).toHaveBeenCalledWith(
      'Saved questionnaire found. 2 of 21 responses are saved in this browser. Resume saved questionnaire. Erase saved answers.',
    );
  });

  it('migrates a valid Version 0.7 weighted NASA-TLX recovery copy before offering resume', async () => {
    const legacyKey = 'accessible-nasa-tlx-v0.7-progress:demo-config:DEMO';
    const { instrumentId: _instrumentId, ...legacySession } = savedSession;
    localStorage.setItem(
      legacyKey,
      JSON.stringify({ ...legacySession, version: 3 }),
    );

    const component = await renderComponent();
    await Promise.resolve();
    await component.updateComplete;

    expect(component.querySelector('#saved-session-offer')).not.toBeNull();
    expect(localStorage.getItem(legacyKey)).toBeNull();
    expect(JSON.parse(
      localStorage.getItem(progressStorageKey('demo-config', 'DEMO'))!,
    )).toMatchObject({
      version: 4,
      instrumentId: 'nasa-tlx-weighted',
      ratingIndex: 2,
      ratings: { mental: 40, physical: 25 },
    });
  });

  it('leaves an invalid Version 0.7 recovery copy untouched instead of guessing', async () => {
    const legacyKey = 'accessible-nasa-tlx-v0.7-progress:demo-config:DEMO';
    const { instrumentId: _instrumentId, ...legacySession } = savedSession;
    const invalidLegacy = { ...legacySession, version: 3, pairOrder: [] };
    localStorage.setItem(legacyKey, JSON.stringify(invalidLegacy));

    const component = await renderComponent();
    await component.updateComplete;

    expect(component.querySelector('#saved-session-offer')).toBeNull();
    expect(localStorage.getItem(legacyKey)).toBe(JSON.stringify(invalidLegacy));
    expect(localStorage.getItem(progressStorageKey('demo-config', 'DEMO'))).toBeNull();
  });

  it('focuses the saved-session region and exposes the exact saved count and choices', async () => {
    const component = await renderComponent();
    component.savedSession = savedSession;
    component.announceSavedSessionOffer(savedSession);
    await component.updateComplete;
    await Promise.resolve();

    const offer = component.querySelector('#saved-session-offer') as HTMLElement;
    const resume = component.querySelector('#resume-saved-questionnaire') as HTMLButtonElement;
    expect(document.activeElement).toBe(offer);
    expect(offer.getAttribute('aria-describedby')).toBe(
      'saved-session-count saved-session-actions',
    );
    expect(resume.getAttribute('aria-describedby')).toBe(
      'saved-session-count saved-session-actions',
    );
    expect(component.querySelector('#saved-session-count')?.textContent).toContain('2 of 21');
    expect(component.querySelector('#saved-session-actions')?.textContent?.trim()).toBe(
      'Resume saved questionnaire. Erase saved answers.',
    );
  });

  it('creates a delayed live-region change and attempts built-in speech only after prior opt-in', async () => {
    const component = await renderComponent();
    component.savedSession = savedSession;
    component.audioGuidance = true;
    const speakText = vi.spyOn(component, 'speakText').mockImplementation(() => undefined);

    component.announceSavedSessionOffer(savedSession);
    await component.updateComplete;
    await vi.advanceTimersByTimeAsync(650);

    expect(component.statusMessage).toBe(
      'Saved questionnaire found. 2 of 21 responses are saved in this browser. Resume saved questionnaire. Erase saved answers.',
    );
    expect(speakText).toHaveBeenCalledWith(component.statusMessage);
  });

  it('provides a user-activated replay route for browsers that block speech after reload', async () => {
    const component = await renderComponent();
    component.savedSession = savedSession;
    const speakText = vi.spyOn(component, 'speakText').mockImplementation(() => undefined);

    component.repeatSavedSessionOffer();

    expect(component.readAloudUsed).toBe(true);
    expect(speakText).toHaveBeenCalledTimes(1);
    expect(speakText.mock.calls[0][0]).toContain('Resume saved questionnaire');
    expect(speakText.mock.calls[0][0]).toContain('Erase saved answers');
  });
});
