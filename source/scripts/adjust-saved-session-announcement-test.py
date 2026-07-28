from pathlib import Path

Path('source/src/saved-session-announcement.test.ts').write_text("""// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibleNasaTlx } from './accessible-nasa-tlx';

const savedSession = {
  version: 3,
  savedAt: 1722123456789,
  startedAt: '2026-07-27T12:00:00.000Z',
  configId: 'route-study',
  participantCode: 'P006',
  stage: 'ratings',
  ratingIndex: 2,
  pairIndex: 0,
  pairOrder: [],
  pairResponses: {},
  ratings: { mental: 40, physical: 25, temporal: 60, performance: 55, effort: 70, frustration: 35 },
  ratingInputRoutes: {},
  pairInputRoutes: {},
  supportChanges: [],
  support: {
    answerMode: 'standard',
    showSimpleLanguage: false,
    largeText: false,
    audioGuidance: true,
  },
};

describe('saved questionnaire recovery announcement', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.replaceChildren();
  });

  afterEach(() => {
    document.body.replaceChildren();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('updates the existing live-region message and uses the existing speech pathway after refresh recovery', async () => {
    const component = new AccessibleNasaTlx() as any;
    document.body.append(component);
    await component.updateComplete;

    component.savedSession = savedSession;
    component.audioGuidance = true;
    const speakText = vi.spyOn(component, 'speakText').mockImplementation(() => undefined);

    component.announceSavedSessionOffer(savedSession);
    await component.updateComplete;
    await vi.advanceTimersByTimeAsync(400);

    expect(component.statusMessage).toContain('Saved questionnaire found.');
    expect(component.statusMessage).toContain('6 of 21 responses');
    expect(speakText).toHaveBeenCalledWith(component.statusMessage);
  });

  it('offers an integrated replay action through the same speakText function', () => {
    const component = new AccessibleNasaTlx() as any;
    component.savedSession = savedSession;
    const speakText = vi.spyOn(component, 'speakText').mockImplementation(() => undefined);

    component.repeatSavedSessionOffer();

    expect(speakText).toHaveBeenCalledTimes(1);
    expect(speakText.mock.calls[0][0]).toContain('Resume saved questionnaire');
    expect(speakText.mock.calls[0][0]).toContain('Erase saved answers');
  });
});
""", encoding='utf-8')
