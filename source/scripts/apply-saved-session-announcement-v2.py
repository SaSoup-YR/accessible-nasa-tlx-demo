from pathlib import Path

source_path = Path('source/src/accessible-nasa-tlx.ts')
text = source_path.read_text(encoding='utf-8')


def replace_once(old: str, new: str, label: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly one match, found {count}.')
    text = text.replace(old, new, 1)


replace_once(
    "  private speechRequestId = 0;\n  private configurationApplied = false;",
    "  private speechRequestId = 0;\n  private savedSessionAnnouncementKey = '';\n  private configurationApplied = false;",
    'announcement guard field',
)

replace_once(
    "          if (this.savedSession) {\n            this.announceAutomatic(this.savedSessionOfferSpeech(this.savedSession));\n          }\n",
    "",
    'premature saved-session speech call',
)

marker = "  private savedSessionOfferSpeech(session: SavedSession) {"
methods = """  private announceSavedSessionOffer(session: SavedSession) {
    const announcementKey = `${session.configId}:${session.participantCode}:${session.savedAt}`;
    if (this.savedSessionAnnouncementKey === announcementKey) return;
    this.savedSessionAnnouncementKey = announcementKey;

    const message = this.savedSessionOfferSpeech(session);
    this.statusMessage = '';
    void this.updateComplete.then(() => {
      window.setTimeout(() => {
        const current = this.savedSession;
        if (
          !current ||
          current.savedAt !== session.savedAt ||
          current.configId !== session.configId ||
          current.participantCode !== session.participantCode
        ) {
          return;
        }

        // Updating the existing live region after rendering gives external screen
        // readers a genuine content change to announce. Built-in audio uses the
        // same speakText pathway as the rest of the questionnaire, but is delayed
        // slightly so a page refresh does not race the browser speech engine.
        this.statusMessage = message;
        if (this.audioGuidance) this.speakText(message);
      }, 400);
    });
  }

  private repeatSavedSessionOffer = () => {
    if (!this.savedSession) return;
    this.speakText(this.savedSessionOfferSpeech(this.savedSession));
  };

"""
if text.count(marker) != 1:
    raise SystemExit('saved-session speech marker was not found exactly once.')
text = text.replace(marker, methods + marker, 1)

replace_once(
    "        this.savedSession = session;\n        this.applySavedRecoveryPresentation(session);",
    "        this.savedSession = session;\n        this.applySavedRecoveryPresentation(session);\n        this.announceSavedSessionOffer(session);",
    'saved-session load announcement',
)

replace_once(
    "    this.savedSession = null;\n    this.resumeSummaryVisible = true;",
    "    this.savedSession = null;\n    this.savedSessionAnnouncementKey = '';\n    this.resumeSummaryVisible = true;",
    'restore reset',
)

replace_once(
    "    this.savedSession = null;\n    this.statusMessage = 'Saved answers erased.';",
    "    this.savedSession = null;\n    this.savedSessionAnnouncementKey = '';\n    this.statusMessage = 'Saved answers erased.';",
    'erase reset',
)

replace_once(
    "          <button class=\"secondary-button\" type=\"button\" @click=${this.eraseSavedSession}>Erase saved answers</button>",
    "          <button class=\"secondary-button\" type=\"button\" @click=${this.repeatSavedSessionOffer}>\n            Hear saved-progress message\n          </button>\n          <button class=\"secondary-button\" type=\"button\" @click=${this.eraseSavedSession}>Erase saved answers</button>",
    'integrated replay control',
)

source_path.write_text(text, encoding='utf-8')

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
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('updates the existing live-region message and uses the existing speech pathway after refresh recovery', async () => {
    const component = new AccessibleNasaTlx() as any;
    component.savedSession = savedSession;
    component.audioGuidance = true;
    const speakText = vi.spyOn(component, 'speakText').mockImplementation(() => undefined);

    component.announceSavedSessionOffer(savedSession);
    await Promise.resolve();
    await Promise.resolve();
    vi.advanceTimersByTime(400);

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
