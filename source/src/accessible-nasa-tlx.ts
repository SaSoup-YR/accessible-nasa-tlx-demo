import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import {
  dimensionById,
  dimensions,
  pairs,
  ratingValues,
  smileyLandmarks,
  type DimensionId,
  type TlxDimension,
  type TlxPair,
} from './nasa-tlx';
import { calculateResult, type PairResponses, type Ratings, type TlxResult } from './scoring';
import {
  configuredResultSink,
  installStudyResultSink,
  submitToApprovedResultSink,
  type ResultSinkReceipt,
} from './result-sink';
import {
  PROTOTYPE_VERSION,
  createStudyResultRecord,
  downloadTextFile,
  progressStorageKey,
  readStudyConfigFromHash,
  resultFileBase,
  resultsToCsv,
  saveCompletedResult,
  validParticipantCode,
  type AnswerMode,
  type StudyConfig,
  type StudyResultRecord,
  type SupportChange,
  type SupportChangeSetting,
  type SupportMetadata,
} from './study';
import { parsePairTranscript, parseRatingTranscript } from './voice-input';
import {
  DwellTracker,
  WEBGAZER_FACE_MESH_URL,
  WEBGAZER_VERSION,
  isSecureGazeContext,
  loadWebGazer,
  type GazePoint,
  type WebGazerLike,
} from './webgazer-adapter';

type Stage = 'intro' | 'ratings' | 'pairs' | 'review' | 'complete';
type RatingInputRoute = 'standard-scale' | 'smiley-landmark' | 'voice' | 'gaze-standard-scale' | 'gaze-smiley-landmark';
type PairInputRoute = 'standard-choice' | 'voice' | 'gaze';
type VoiceState = 'idle' | 'listening' | 'pending' | 'error';
type GazeState = 'off' | 'loading' | 'positioning' | 'calibrating' | 'ready' | 'error';

interface PendingVoiceAnswer {
  context: 'rating' | 'pair';
  transcript: string;
  value: number | DimensionId;
  label: string;
}

interface SavedSession {
  version: 3;
  savedAt: number;
  startedAt: string;
  configId: string;
  participantCode: string;
  stage: 'ratings' | 'pairs' | 'review';
  ratingIndex: number;
  pairIndex: number;
  pairOrder: TlxPair[];
  pairResponses: PairResponses;
  ratings: Partial<Ratings>;
  ratingInputRoutes: Partial<Record<DimensionId, RatingInputRoute>>;
  pairInputRoutes: Record<string, PairInputRoute>;
  supportChanges: SupportChange[];
  support: {
    answerMode: AnswerMode;
    showSimpleLanguage: boolean;
    largeText: boolean;
    audioGuidance?: boolean;
  };
}

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  results: {
    readonly length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: Event & { error?: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const CALIBRATION_POINTS = [
  { x: 12, y: 12 },
  { x: 50, y: 12 },
  { x: 88, y: 12 },
  { x: 12, y: 50 },
  { x: 50, y: 50 },
  { x: 88, y: 50 },
  { x: 12, y: 88 },
  { x: 50, y: 88 },
  { x: 88, y: 88 },
] as const;
const CALIBRATION_REPETITIONS = 3;

function shuffledPairs() {
  const order = [...pairs];
  for (let index = order.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[randomIndex]] = [order[randomIndex], order[index]];
  }
  return order;
}

@customElement('accessible-nasa-tlx')
export class AccessibleNasaTlx extends LitElement {
  @state() private stage: Stage = 'intro';
  @state() private ratingIndex = 0;
  @state() private pairIndex = 0;
  @state() private pairOrder = shuffledPairs();
  @state() private pairResponses: PairResponses = {};
  @state() private ratings: Partial<Ratings> = {};
  @state() private ratingInputRoutes: Partial<Record<DimensionId, RatingInputRoute>> = {};
  @state() private pairInputRoutes: Record<string, PairInputRoute> = {};
  @state() private supportChanges: SupportChange[] = [];
  @state() private answerMode: AnswerMode = 'standard';
  @state() private showSimpleLanguage = false;
  @state() private largeText = false;
  @state() private recoveryEnabled = false;
  @state() private resumeSummaryVisible = false;
  @state() private savedSession: SavedSession | null = null;
  @state() private readingAloud = false;
  @state() private readAloudUsed = false;
  @state() private audioGuidance = false;
  @state() private audioStatusMessage = '';
  @state() private interruptionSummaryShown = false;
  @state() private voiceState: VoiceState = 'idle';
  @state() private voiceMessage = '';
  @state() private pendingVoiceAnswer: PendingVoiceAnswer | null = null;
  @state() private errorMessage = '';
  @state() private statusMessage = '';
  @state() private result: TlxResult | null = null;
  @state() private gazeState: GazeState = 'off';
  @state() private gazeMessage = '';
  @state() private gazeCalibrationIndex = 0;
  @state() private gazeCalibrationRepetition = 0;
  @state() private gazePendingLabel = '';
  @state() private gazeDwellProgress = 0;
  @state() private gazeUsed = false;
  @state() private gazeActionCount = 0;
  @state() private studyConfig: StudyConfig | null = null;
  @state() private configurationError = '';
  @state() private participantCode = '';
  @state() private participantCodeError = '';
  @state() private startedAt = '';
  @state() private submittedRecord: StudyResultRecord | null = null;
  @state() private completionSavedLocally = false;
  @state() private completionSavedByHost = false;
  @state() private hostSinkName = '';
  @state() private hostReceipt: ResultSinkReceipt | null = null;
  @state() private submittingResult = false;

  private hiddenAt: number | null = null;
  private recognition: SpeechRecognitionLike | null = null;
  private webgazer: WebGazerLike | null = null;
  private gazeCandidateElement: HTMLElement | null = null;
  private gazePendingElement: HTMLElement | null = null;
  private gazeActivationInProgress = false;
  private speechRequestId = 0;
  private configurationApplied = false;
  private readonly gazeCandidateTracker = new DwellTracker(1000);
  private readonly gazeConfirmationTracker = new DwellTracker(1200);

  connectedCallback() {
    super.connectedCallback();
    this.loadStudyConfiguration();
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    queueMicrotask(() => this.findSavedSession());
  }

  disconnectedCallback() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.stopReading(false);
    this.releaseRecognition();
    this.stopGazeInput();
    super.disconnectedCallback();
  }

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  private loadStudyConfiguration() {
    if (this.configurationApplied) return;
    this.configurationApplied = true;
    const parameters = new URLSearchParams(window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash);
    const config = readStudyConfigFromHash(window.location.hash);
    if (parameters.has('study') && !config) {
      this.configurationError = 'This participant link contains an invalid or incompatible study configuration. Ask the study conductor for a new link.';
      return;
    }
    if (!config) return;
    this.studyConfig = config;
    this.applyConfiguredSupport();
    if (config.collection.mode === 'qualtrics') {
      if (window.parent === window) {
        this.configurationError =
          'This centrally collected questionnaire must be opened from the approved Qualtrics survey link. Ask the study conductor for that link.';
        return;
      }
      if (document.referrer) {
        try {
          if (new URL(document.referrer).origin !== config.collection.parentOrigin) {
            this.configurationError =
              'This questionnaire was embedded by an unexpected website. Ask the study conductor for the approved Qualtrics survey link.';
            return;
          }
        } catch {
          this.configurationError =
            'The embedding website could not be verified. Ask the study conductor for the approved Qualtrics survey link.';
          return;
        }
      }
      installStudyResultSink(config);
    }
  }

  private applyConfiguredSupport() {
    const support = this.studyConfig?.support;
    if (!support) return;
    this.showSimpleLanguage = support.showSimpleLanguage;
    this.answerMode = support.answerMode;
    this.largeText = support.largeText;
    this.audioGuidance = support.audioGuidance;
    this.recoveryEnabled = support.recoveryEnabled;
  }

  private get canAdjustAllSupport() {
    return !this.studyConfig || this.studyConfig.support.participantAdjustmentPolicy === 'participant-choice';
  }

  private get canAdjustPresentationSupport() {
    return (
      !this.studyConfig ||
      this.studyConfig.support.participantAdjustmentPolicy === 'presentation-only' ||
      this.studyConfig.support.participantAdjustmentPolicy === 'participant-choice'
    );
  }

  private get voiceInputAvailable() {
    return !this.studyConfig || this.studyConfig.support.voiceInputAvailable;
  }

  private get gazeInputAvailable() {
    return !this.studyConfig || this.studyConfig.support.gazeInputAvailable;
  }

  protected render() {
    return html`
      <a class="skip-link" href="#question-panel">Skip to the current question</a>
      <main class=${`app-shell${this.largeText ? ' large-text' : ''}`} id="main-content">
        <p class="sr-only" aria-live="polite" aria-atomic="true">${this.statusMessage}</p>
        <header class="app-header">
          <p class="eyebrow">Research prototype · Version 0.7 release candidate</p>
          <h1>NASA Task Load Index</h1>
          <p class="subtitle">Weighted NASA-TLX with configurable reading, answering and recovery support</p>
        </header>

        ${this.resumeSummaryVisible ? this.renderResumeSummary() : nothing}
        ${this.stage !== 'intro' && this.stage !== 'complete' ? this.renderProgress() : nothing}
        ${this.stage !== 'intro' && this.stage !== 'complete' ? this.renderInQuestionSupport() : nothing}
        ${this.gazePendingElement ? this.renderGazeConfirmation() : nothing}
        ${this.errorMessage
          ? html`<div class="error-summary" role="alert" tabindex="-1" id="error-summary">
              <h2>There is a problem</h2>
              <p>${this.errorMessage}</p>
            </div>`
          : nothing}

        ${this.renderStage()}
      </main>
      ${this.gazeState === 'positioning' ? this.renderGazePositioning() : nothing}
      ${this.gazeState === 'calibrating' ? this.renderGazeCalibration() : nothing}
    `;
  }

  private renderInQuestionSupport() {
    return html`
      ${this.studyConfig
        ? this.canAdjustAllSupport
          ? html`<details class="support-toolbar">
              <summary>Adjust accessibility support (optional)</summary>
              <p>
                The study conductor has already prepared usable starting settings. You may change optional support if it
                helps you complete the questionnaire; every change is recorded separately from your NASA-TLX answers.
              </p>
              ${this.renderSupportSettings('toolbar', 'all')}
            </details>`
          : this.canAdjustPresentationSupport
          ? html`<details class="support-toolbar">
              <summary>Adjust display, audio or recovery (optional)</summary>
              <p>
                The study answer presentation and simpler-explanation setting remain fixed. You do not need to
                change these optional preferences to continue.
              </p>
              ${this.renderSupportSettings('toolbar', 'presentation-only')}
            </details>`
          : this.renderConfiguredSupportSummary()
        : html`<details class="support-toolbar">
            <summary>Adjust accessibility support (optional)</summary>
            ${this.renderSupportSettings('toolbar', 'all')}
          </details>`}
      ${this.renderReadAloudControl()}
      ${this.renderGazeSetup()}
    `;
  }

  private renderStage() {
    switch (this.stage) {
      case 'intro':
        return this.renderIntro();
      case 'ratings':
        return this.renderRating();
      case 'pairs':
        return this.renderPair();
      case 'review':
        return this.renderReview();
      case 'complete':
        return this.renderComplete();
    }
  }

  private renderIntro() {
    return html`
      <section class="panel" id="question-panel" aria-labelledby="intro-heading">
        <h2 id="intro-heading">Before you begin</h2>
        ${this.configurationError
          ? html`<div class="error-summary" role="alert"><h3>Study link problem</h3><p>${this.configurationError}</p></div>`
          : nothing}
        ${this.renderStudyContext()}
        ${this.savedSession ? this.renderSavedSessionOffer() : nothing}
        <p>
          Think about ${this.studyConfig ? html`the task: <strong>${this.studyConfig.taskLabel}</strong>` : 'one task that you have just completed'}.
        </p>
        <ol class="process-overview">
          <li>First, rate six aspects of the workload from 0 to 100.</li>
          <li>Then, make fifteen comparisons about which aspect contributed more to workload.</li>
          <li>Finally, review and submit your responses.</li>
        </ol>

        <div class="boundary-note">
          <h3>Official questionnaire and optional support</h3>
          <p>
            The official NASA-TLX dimensions, values, direction and scoring remain authoritative.
            Simpler explanations, smileys, built-in audio, voice, gaze and recovery are separate support routes.
          </p>
          <p>
            Screen-reader compatibility is always on through headings, native controls, labels,
            focus movement and status announcements. It produces speech only when external software such as
            NVDA or VoiceOver is running. Built-in audio guidance is a separate option for users who want the page itself to speak.
          </p>
        </div>

        <details class="factor-reference">
          <summary>Review the six official factor definitions</summary>
          ${dimensions.map(
            (dimension) => html`
              <div class="reference-item">
                <h3>${dimension.name}</h3>
                <p>${dimension.officialDefinition}</p>
              </div>
            `,
          )}
        </details>

        ${this.studyConfig ? this.renderConfiguredSupportSummary() : nothing}
        ${this.studyConfig
          ? this.canAdjustAllSupport
            ? html`<details class="support-toolbar participant-support-setup">
                <summary>Adjust accessibility support (optional)</summary>
                <p>
                  The study settings are already applied. You do not need to change anything before starting. If an
                  optional support preference helps, you may change it and the change will be recorded for the researcher.
                </p>
                ${this.renderSupportSettings('intro', 'all')}
              </details>`
            : this.canAdjustPresentationSupport
            ? html`<details class="support-toolbar participant-support-setup">
                <summary>Adjust display, audio or recovery (optional)</summary>
                <p>
                  The study settings are already applied. You do not need to change anything before starting.
                  Simpler explanations and the standard/smiley answer presentation remain fixed by the study conductor.
                </p>
                ${this.renderSupportSettings('intro', 'presentation-only')}
              </details>`
            : nothing
          : html`<details class="support-toolbar participant-support-setup">
              <summary>Adjust accessibility support (optional)</summary>
              ${this.renderSupportSettings('intro', 'all')}
            </details>`}
        ${this.renderReadAloudControl()} ${this.renderGazeSetup()}

        <button
          class="primary-button large-answer-button"
          type="button"
          data-gaze-target
          data-gaze-label="Start the six ratings"
          ?disabled=${Boolean(this.configurationError)}
          @click=${this.startQuestionnaire}
        >
          Start the six ratings
        </button>
      </section>
    `;
  }

  private renderStudyContext() {
    if (!this.studyConfig) {
      return html`<aside class="study-context demo-context">
        <h3>Demonstration mode</h3>
        <p>This page is a technical demonstration. It does not upload answers or act as a remote research-data system.</p>
      </aside>`;
    }
    return html`
      <aside class="study-context" aria-labelledby="study-context-heading">
        <h3 id="study-context-heading">Participant questionnaire</h3>
        <dl class="study-details">
          <div><dt>Study</dt><dd>${this.studyConfig.studyTitle}</dd></div>
          <div><dt>Study ID</dt><dd>${this.studyConfig.studyId}</dd></div>
          <div><dt>Task</dt><dd>${this.studyConfig.taskLabel}</dd></div>
          <div>
            <dt>Result collection</dt>
            <dd>${this.studyConfig.collection.mode === 'qualtrics' ? 'UCL Qualtrics' : 'This browser only'}</dd>
          </div>
        </dl>
        <label class="participant-code-field" for="participant-code">
          <strong>Pseudonymous participant code</strong>
          <span>Use the code provided by the study conductor. Do not enter your name or email address.</span>
          <input
            id="participant-code"
            name="participant-code"
            type="text"
            maxlength="32"
            autocomplete="off"
            spellcheck="false"
            .value=${this.participantCode}
            aria-describedby="participant-code-help"
            aria-invalid=${this.participantCodeError ? 'true' : 'false'}
            @input=${this.setParticipantCode}
          />
        </label>
        <p id="participant-code-help" class=${this.participantCodeError ? 'field-error' : 'support-boundary'}>
          ${this.participantCodeError || 'Letters, numbers, hyphens and underscores only; maximum 32 characters.'}
        </p>
      </aside>
    `;
  }

  private renderConfiguredSupportSummary() {
    const support = this.studyConfig?.support;
    if (!support) return nothing;
    return html`
      <aside class="configured-support" aria-labelledby="configured-support-heading">
        <h3 id="configured-support-heading">Support prepared by the study conductor</h3>
        <p>You do not need to configure the questionnaire before starting.</p>
        <ul>
          <li>${support.showSimpleLanguage ? 'Simpler explanations shown' : 'Official wording with optional help hidden'}</li>
          <li>${support.answerMode === 'smiley' ? 'Smiley landmark rating view' : 'Standard 21-point rating scale'}</li>
          <li>${support.largeText ? 'Large text' : 'Standard text size'}</li>
          <li>${support.recoveryEnabled ? 'Interruption recovery on' : 'Interruption recovery off'}</li>
          <li>${support.voiceInputAvailable ? 'Confirmed voice input available' : 'Built-in voice input not included'}</li>
          <li>${support.gazeInputAvailable ? 'Experimental gaze input available' : 'Experimental gaze input not included'}</li>
        </ul>
        <p>
          ${support.participantAdjustmentPolicy === 'participant-choice'
            ? 'The starting settings are already applied. You may optionally change simpler explanations, answer presentation, text size, automatic spoken guidance or interruption recovery. Each change is recorded separately from your answers.'
            : support.participantAdjustmentPolicy === 'presentation-only'
              ? 'You may optionally change text size, automatic spoken guidance or interruption recovery. The answer presentation and simpler-explanation setting remain fixed.'
              : 'The prepared settings remain fixed for this study. You can still use any answer route that the study conductor made available.'}
        </p>
      </aside>
    `;
  }

  private renderSupportSettings(context: 'intro' | 'toolbar', scope: 'all' | 'presentation-only') {
    const prefix = `support-${context}`;
    return html`
      <fieldset class="support-settings">
        <legend>${scope === 'all' ? 'Accessibility support options' : 'Display and recovery preferences'}</legend>

        ${scope === 'all'
          ? html`<label class="toggle-card" for=${`${prefix}-simple`}>
            <input
              id=${`${prefix}-simple`}
              type="checkbox"
              .checked=${this.showSimpleLanguage}
              @change=${(event: Event) => this.setSimpleLanguage(event)}
            />
            <span>
              <strong>Show simpler explanations</strong>
              <small>The official NASA wording remains visible once, without being duplicated inside the help.</small>
            </span>
          </label>

          <fieldset class="answer-mode-control">
            <legend>Rating answer format</legend>
            <label for=${`${prefix}-standard-answer`}>
              <input
                id=${`${prefix}-standard-answer`}
                type="radio"
                name=${`${prefix}-answer-mode`}
                value="standard"
                .checked=${this.answerMode === 'standard'}
                @change=${() => this.setAnswerMode('standard')}
              />
              <span><strong>Standard 21-point scale</strong><small>Default NASA-TLX presentation.</small></span>
            </label>
            <label for=${`${prefix}-smiley-answer`}>
              <input
                id=${`${prefix}-smiley-answer`}
                type="radio"
                name=${`${prefix}-answer-mode`}
                value="smiley"
                .checked=${this.answerMode === 'smiley'}
                @change=${() => this.setAnswerMode('smiley')}
              />
              <span>
                <strong>Smiley landmarks</strong>
                <small>Experimental five-value view; the precise scale is available only on request.</small>
              </span>
            </label>
          </fieldset>`
          : nothing}

        <fieldset class="text-size-control">
          <legend>Text size</legend>
          <label for=${`${prefix}-standard-text`}>
            <input
              id=${`${prefix}-standard-text`}
              type="radio"
              name=${`${prefix}-text-size`}
              value="standard"
              .checked=${!this.largeText}
              @change=${() => this.setLargeText(false)}
            />
            Standard
          </label>
          <label for=${`${prefix}-large-text`}>
            <input
              id=${`${prefix}-large-text`}
              type="radio"
              name=${`${prefix}-text-size`}
              value="large"
              .checked=${this.largeText}
              @change=${() => this.setLargeText(true)}
            />
            Large
          </label>
        </fieldset>

        <label class="toggle-card" for=${`${prefix}-recovery`}>
          <input
            id=${`${prefix}-recovery`}
            type="checkbox"
            .checked=${this.recoveryEnabled}
            @change=${(event: Event) => this.setRecovery(event)}
          />
          <span>
            <strong>Save progress and show a return summary</strong>
            <small>Stores incomplete answers only in this browser so an interruption or reload can be recovered.</small>
          </span>
        </label>
      </fieldset>
    `;
  }

  private renderReadAloudControl() {
    const available = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    return html`
      <div class="quick-support audio-guidance" aria-label="Built-in audio guidance">
        <div>
          <strong>Built-in audio guidance (produces sound)</strong>
          <p>
            This is separate from screen-reader compatibility. Leave automatic audio off when using NVDA or VoiceOver
            to avoid two voices speaking at once.
          </p>
        </div>
        <button
          class="secondary-button large-answer-button"
          type="button"
          ?disabled=${!available}
          @click=${this.toggleReadAloud}
        >
          ${this.readingAloud ? 'Stop summary' : 'Hear a summary of this step'}
        </button>
        ${this.audioStatusMessage
          ? html`<p class="audio-status" role="status" aria-atomic="true">${this.audioStatusMessage}</p>`
          : nothing}
        ${this.canAdjustPresentationSupport
          ? html`<label class="audio-guidance-toggle">
              <input
                type="checkbox"
                .checked=${this.audioGuidance}
                ?disabled=${!available}
                @change=${this.setAudioGuidance}
              />
              <span>
                <strong>Automatically read new questions and selected answers aloud</strong>
                <small>Default off. Turning this on plays an immediate spoken confirmation.</small>
              </span>
            </label>`
          : html`<small>Automatic spoken guidance is ${this.audioGuidance ? 'on' : 'off'} in the study configuration.</small>`}
        <small>
          ${available
            ? 'Uses the browser speech-synthesis voice; no audio is recorded.'
            : 'Built-in audio is unavailable in this browser. External screen readers can still use the semantic page.'}
        </small>
      </div>
    `;
  }

  private renderGazeSetup() {
    if (!this.gazeInputAvailable) return nothing;
    const secureContext = isSecureGazeContext(window.location);
    const active =
      this.gazeState === 'loading' ||
      this.gazeState === 'positioning' ||
      this.gazeState === 'calibrating' ||
      this.gazeState === 'ready';
    return html`
      <details class="gaze-setup" .open=${this.gazeState !== 'off'}>
        <summary>Gaze-assisted answering with WebGazer (experimental)</summary>
        <div class="gaze-setup-content">
          <p>
            Uses the webcam to estimate where you look. After calibration, look at a large answer or navigation control
            for one second to propose it, then look at the separate Confirm control for 1.2 seconds. Looking alone never submits immediately.
          </p>
          <ul>
            <li>Requires webcam permission and an HTTPS website or localhost; it is not available from the downloaded file.</li>
            <li>Video is processed in this browser and is not stored by this questionnaire.</li>
            <li>WebGazer ${WEBGAZER_VERSION} is loaded only after you start this feature; its code and face model come from jsDelivr.</li>
            <li>The camera preview is shown only while you position your face. It is hidden before calibration and answering.</li>
            <li>Webcam gaze estimation can be inaccurate and needs recalibration. Standard, keyboard and voice controls remain available.</li>
          </ul>
          ${!secureContext
            ? html`<p class="gaze-warning" role="status">
                Gaze input requires the future HTTPS-hosted demo. Continue using the other answer routes in this downloaded file.
              </p>`
            : nothing}
          <div class="button-row compact">
            ${active
              ? html`<button class="secondary-button large-answer-button" type="button" @click=${this.stopGazeInput}>
                  Stop gaze and camera
                </button>`
              : html`<button
                  class="secondary-button large-answer-button"
                  type="button"
                  ?disabled=${!secureContext}
                  @click=${this.startGazeInput}
                >
                  ${this.gazeState === 'error' ? 'Try gaze setup again' : 'Start camera and calibration'}
                </button>`}
            ${this.gazeState === 'ready'
              ? html`<button class="secondary-button" type="button" @click=${this.restartGazeCalibration}>
                  Recalibrate
                </button>`
              : nothing}
          </div>
          ${this.gazeMessage ? html`<p class="gaze-status" role="status">${this.gazeMessage}</p>` : nothing}
        </div>
      </details>
    `;
  }

  private renderGazePositioning() {
    return html`
      <div class="gaze-positioning" role="dialog" aria-modal="true" aria-labelledby="gaze-positioning-heading">
        <section class="gaze-positioning-card">
          <h2 id="gaze-positioning-heading" tabindex="-1">Position your camera</h2>
          <p>
            Centre your face in the preview and keep the device steady. This preview is for positioning only and will
            disappear before calibration.
          </p>
          <div class="gaze-camera-preview-slot" aria-label="Live camera positioning preview"></div>
          <p class="gaze-positioning-tip">
            Make sure your whole face is visible, the lighting is even and your eyes are not covered. On a phone or
            tablet, place the device on a stable support if possible.
          </p>
          <div class="button-row gaze-positioning-actions">
            <button class="primary-button large-answer-button" type="button" @click=${this.beginGazeCalibration}>
              Continue to calibration
            </button>
            <button class="secondary-button large-answer-button" type="button" @click=${this.stopGazeInput}>
              Cancel gaze setup
            </button>
          </div>
        </section>
      </div>
    `;
  }

  private renderGazeCalibration() {
    const point = CALIBRATION_POINTS[this.gazeCalibrationIndex];
    const completed = this.gazeCalibrationIndex * CALIBRATION_REPETITIONS + this.gazeCalibrationRepetition;
    const total = CALIBRATION_POINTS.length * CALIBRATION_REPETITIONS;
    return html`
      <div class="gaze-calibration" role="dialog" aria-modal="true" aria-labelledby="gaze-calibration-heading">
        <div class="gaze-calibration-instructions">
          <h2 id="gaze-calibration-heading">Gaze calibration</h2>
          <p>Keep your head steady. Look at the numbered target, then click it or press Enter/Space three times.</p>
          <p><strong>${completed} of ${total}</strong> calibration samples completed.</p>
          <button class="secondary-button" type="button" @click=${this.stopGazeInput}>Cancel gaze setup</button>
        </div>
        <div class="gaze-calibration-field">
          <button
            class="calibration-point"
            type="button"
            style=${`left: clamp(3rem, ${point.x}%, calc(100% - 3rem)); top: clamp(3rem, ${point.y}%, calc(100% - 3rem))`}
            aria-label=${`Calibration point ${this.gazeCalibrationIndex + 1} of ${CALIBRATION_POINTS.length}, sample ${this.gazeCalibrationRepetition + 1} of ${CALIBRATION_REPETITIONS}`}
            @click=${this.recordCalibrationPoint}
          >
            ${this.gazeCalibrationIndex + 1}
            <span>${this.gazeCalibrationRepetition + 1}/${CALIBRATION_REPETITIONS}</span>
          </button>
        </div>
      </div>
    `;
  }

  private renderGazeConfirmation() {
    return html`
      <aside class="gaze-confirmation" aria-labelledby="gaze-confirmation-heading">
        <h2 id="gaze-confirmation-heading">Gaze proposal</h2>
        <p>You looked at: <strong>${this.gazePendingLabel}</strong></p>
        <p>Look at Confirm for 1.2 seconds, or cancel. This second step prevents an ordinary glance from becoming an answer.</p>
        <div class="gaze-confirmation-actions">
          <button
            class="primary-button large-answer-button gaze-confirm-target"
            type="button"
            data-gaze-confirm
            style=${`--gaze-progress: ${this.gazeDwellProgress * 100}%`}
            @click=${this.confirmGazeProposal}
          >
            Confirm ${this.gazePendingLabel}
          </button>
          <button
            class="secondary-button large-answer-button gaze-cancel-target"
            type="button"
            data-gaze-cancel
            style=${`--gaze-progress: ${this.gazeDwellProgress * 100}%`}
            @click=${this.cancelGazeProposal}
          >
            Cancel gaze proposal
          </button>
        </div>
      </aside>
    `;
  }

  private renderProgress() {
    const completed = Object.keys(this.ratings).length + Object.keys(this.pairResponses).length;
    const total = dimensions.length + this.pairOrder.length;
    const section = this.stage === 'ratings' ? 'Ratings' : this.stage === 'pairs' ? 'Comparisons' : 'Review';
    return html`
      <nav class="progress-card" aria-label="Questionnaire progress">
        <p><strong>${section}:</strong> ${completed} of ${total} responses completed</p>
        <progress max=${total} value=${completed}>${completed} of ${total}</progress>
      </nav>
    `;
  }

  private renderRating() {
    const dimension = dimensions[this.ratingIndex];
    const selected = this.ratings[dimension.id];
    return html`
      <section class="panel" id="question-panel" aria-labelledby="rating-heading">
        <p class="step-label">Rating ${this.ratingIndex + 1} of ${dimensions.length}</p>
        <h2 id="rating-heading">${dimension.name}</h2>
        <p class="official-definition"><strong>Official definition:</strong> ${dimension.officialDefinition}</p>

        ${this.showSimpleLanguage
          ? html`<aside class="simple-language-panel" aria-label="Simpler explanation">
              <p class="support-label">Simpler explanation</p>
              <p>${dimension.simpleExplanation}</p>
              <p class="support-boundary">Use the official scale when choosing your response.</p>
            </aside>`
          : html`<details class="optional-explanation">
              <summary>Show a simpler explanation</summary>
              <div class="explanation-block">
                <p>${dimension.simpleExplanation}</p>
                <p class="support-boundary">This help does not replace the official definition.</p>
              </div>
            </details>`}

        ${this.answerMode === 'smiley'
          ? html`
              ${this.renderSmileyResponse(dimension, selected)}
              <details class="precision-scale">
                <summary>Choose a more precise value on the full scale</summary>
                ${this.renderFullRatingScale(dimension, selected)}
              </details>
            `
          : this.renderFullRatingScale(dimension, selected)}

        ${this.renderVoiceInput('rating', dimension)}
        ${this.renderNavigation(this.ratingIndex > 0, 'rating')}
      </section>
    `;
  }

  private renderFullRatingScale(dimension: TlxDimension, selected: number | undefined) {
    return html`
      <fieldset class="rating-fieldset">
        <legend>Rate ${dimension.name}: 0 is ${dimension.lowAnchor}; 100 is ${dimension.highAnchor}</legend>
        <div class="rating-anchors" aria-hidden="true">
          <span>0 — ${dimension.lowAnchor}</span><span>100 — ${dimension.highAnchor}</span>
        </div>
        <div class="rating-grid">
          ${ratingValues.map((value) => {
            const inputId = `rating-${dimension.id}-${value}`;
            return html`
              <label
                class="rating-option"
                for=${inputId}
                data-gaze-target
                data-gaze-label=${`${value} for ${dimension.name}`}
              >
                <input
                  id=${inputId}
                  type="radio"
                  name=${`rating-${dimension.id}`}
                  value=${value}
                  .checked=${selected === value}
                  @change=${() => this.selectRating(dimension.id, value, 'standard-scale')}
                />
                <span>${value}</span>
              </label>
            `;
          })}
        </div>
      </fieldset>
    `;
  }

  private renderSmileyResponse(dimension: TlxDimension, selected: number | undefined) {
    return html`
      <fieldset class="smiley-response">
        <legend>Rate ${dimension.name} with a smiley landmark</legend>
        <p id=${`smiley-help-${dimension.id}`}>
          Each face is one official value. Facial expression may imply good or bad, so this route is experimental.
        </p>
        <div class="smiley-grid">
          ${smileyLandmarks.map(({ value, cue }) => {
            const inputId = `smiley-${dimension.id}-${value}`;
            return html`
              <label
                class="smiley-option"
                for=${inputId}
                data-gaze-target
                data-gaze-label=${`${value} for ${dimension.name}`}
              >
                <input
                  id=${inputId}
                  type="radio"
                  name=${`smiley-${dimension.id}`}
                  value=${value}
                  .checked=${selected === value}
                  aria-label=${`${value}, ${this.landmarkLabel(dimension, value)}, for ${dimension.name}`}
                  aria-describedby=${`smiley-help-${dimension.id}`}
                  @change=${() => this.selectRating(dimension.id, value, 'smiley-landmark')}
                />
                <span class="smiley-option-content">
                  <span class="smiley-face" aria-hidden="true">${cue}</span>
                  <strong>${value}</strong>
                  <small>${this.landmarkLabel(dimension, value)}</small>
                </span>
              </label>
            `;
          })}
        </div>
      </fieldset>
    `;
  }

  private renderPair() {
    const pair = this.pairOrder[this.pairIndex];
    const left = dimensionById.get(pair.left)!;
    const right = dimensionById.get(pair.right)!;
    const selected = this.pairResponses[pair.id];
    return html`
      <section class="panel" id="question-panel" aria-labelledby="pair-heading">
        <p class="step-label">Comparison ${this.pairIndex + 1} of ${this.pairOrder.length}</p>
        <h2 id="pair-heading">Which factor contributed more to the workload you experienced?</h2>
        <p class="pair-instruction">
          This is not a Low-to-High rating. Choose the factor that was the more important source of workload in the task.
        </p>

        ${this.renderPairHelp(left, right)}
        <fieldset class="choice-fieldset">
          <legend>Choose one factor</legend>
          ${this.renderPairChoice(pair.id, left, selected === left.id)}
          ${this.renderPairChoice(pair.id, right, selected === right.id)}
        </fieldset>

        ${this.renderVoiceInput('pair', left, right)}
        ${this.renderNavigation(true, 'pair')}
      </section>
    `;
  }

  private renderPairChoice(pairId: string, dimension: TlxDimension, checked: boolean) {
    const inputId = `${pairId}-${dimension.id}`;
    return html`
      <label
        class="choice-card"
        for=${inputId}
        data-gaze-target
        data-gaze-label=${dimension.name}
      >
        <input
          id=${inputId}
          type="radio"
          name=${pairId}
          value=${dimension.id}
          .checked=${checked}
          @change=${() => this.selectPair(pairId, dimension.id, 'standard-choice')}
        />
        <span>
          <strong>${dimension.name}</strong>
          ${this.showSimpleLanguage ? html`<small>${dimension.shortMeaning}</small>` : nothing}
        </span>
      </label>
    `;
  }

  private renderPairHelp(left: TlxDimension, right: TlxDimension) {
    if (this.showSimpleLanguage) {
      return html`<p class="simple-pair-prompt">In simpler words: which one added more to the work you had to do?</p>`;
    }
    return html`
      <details class="optional-explanation pair-help">
        <summary>Need help with these factor names?</summary>
        <div class="explanation-grid">
          ${[left, right].map(
            (dimension) => html`
              <div class="explanation-block">
                <h3>${dimension.name}</h3>
                <p>${dimension.simpleExplanation}</p>
              </div>
            `,
          )}
        </div>
      </details>
    `;
  }

  private renderVoiceInput(context: 'rating' | 'pair', first: TlxDimension, second?: TlxDimension) {
    if (!this.voiceInputAvailable) return nothing;
    const available = Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);
    const activeForContext = this.pendingVoiceAnswer?.context === context;
    const prompt =
      context === 'rating'
        ? `Say a number from 0 to 100 in steps of 5, such as 25 or 70.`
        : `Say “${first.name}” or “${second!.name}”.`;
    return html`
      <details class="voice-input" .open=${this.voiceState !== 'idle'}>
        <summary>Answer this question by voice</summary>
        <div class="voice-input-content">
          <p>${prompt}</p>
          <p class="support-boundary">
            Voice is optional. Your browser may use its speech service. This prototype does not store audio,
            and buttons remain available if recognition is unsupported or incorrect.
          </p>
          <button
            class="secondary-button large-answer-button"
            type="button"
            ?disabled=${!available || this.voiceState === 'listening'}
            @click=${() => this.startVoiceInput(context, first, second)}
          >
            ${this.voiceState === 'listening' ? 'Listening…' : 'Start voice input'}
          </button>
          ${!available
            ? html`<p role="status">
                Built-in voice recognition is unavailable in this browser. System voice control can still activate
                the visible buttons by name.
              </p>`
            : nothing}
          ${this.voiceMessage ? html`<p role="status">${this.voiceMessage}</p>` : nothing}
          ${activeForContext && this.pendingVoiceAnswer
            ? html`
                <div class="voice-confirmation">
                  <p>I heard: <strong>${this.pendingVoiceAnswer.transcript}</strong></p>
                  <p>Proposed answer: <strong>${this.pendingVoiceAnswer.label}</strong></p>
                  <div class="button-row compact">
                    <button class="primary-button large-answer-button" type="button" @click=${this.confirmVoiceAnswer}>
                      Confirm ${this.pendingVoiceAnswer.label}
                    </button>
                    <button class="secondary-button" type="button" @click=${this.clearVoiceAnswer}>Try again</button>
                  </div>
                </div>
              `
            : nothing}
        </div>
      </details>
    `;
  }

  private renderNavigation(canGoBack: boolean, context: 'rating' | 'pair') {
    const finalRating = context === 'rating' && this.ratingIndex === dimensions.length - 1;
    const finalPair = context === 'pair' && this.pairIndex === this.pairOrder.length - 1;
    return html`
      <div class="button-row">
        <button
          class="secondary-button large-answer-button"
          type="button"
          data-gaze-target
          data-gaze-label="Previous question"
          ?disabled=${!canGoBack}
          @click=${this.goBack}
        >
          Previous question
        </button>
        <button
          class="primary-button large-answer-button"
          type="button"
          data-gaze-target
          data-gaze-label=${finalRating ? 'Continue to comparisons' : finalPair ? 'Review responses' : 'Next question'}
          @click=${() => this.goNext(context)}
        >
          ${finalRating ? 'Continue to comparisons' : finalPair ? 'Review responses' : 'Next question'}
        </button>
      </div>
    `;
  }

  private renderReview() {
    return html`
      <section class="panel" id="question-panel" aria-labelledby="review-heading">
        <h2 id="review-heading">Review your responses</h2>
        <p>Check every response before calculating the weighted workload score.</p>

        <h3>Magnitude ratings</h3>
        <dl class="review-ratings">
          ${dimensions.map(
            (dimension) => html`
              <div>
                <dt>${dimension.name}</dt>
                <dd>
                  ${this.ratings[dimension.id]}
                  <small>(${this.ratingRouteLabel(dimension.id)})</small>
                </dd>
              </div>
            `,
          )}
        </dl>

        <h3>Sources-of-workload comparisons</h3>
        <ol class="review-list">
          ${this.pairOrder.map((pair) => {
            const left = dimensionById.get(pair.left)!;
            const right = dimensionById.get(pair.right)!;
            const selected = dimensionById.get(this.pairResponses[pair.id])!;
            return html`<li>${left.name} or ${right.name}: <strong>${selected.name}</strong></li>`;
          })}
        </ol>

        <div class="button-row review-actions">
          <button
            class="secondary-button large-answer-button"
            type="button"
            data-gaze-target
            data-gaze-label="Return to ratings"
            @click=${this.returnToRatings}
          >
            Return to ratings
          </button>
          <button
            class="secondary-button large-answer-button"
            type="button"
            data-gaze-target
            data-gaze-label="Return to comparisons"
            @click=${this.returnToPairs}
          >
            Return to comparisons
          </button>
          <button
            class="primary-button large-answer-button"
            type="button"
            data-gaze-target
            data-gaze-label="Calculate and submit responses"
            ?disabled=${this.submittingResult}
            @click=${this.submitResponses}
          >
            ${this.submittingResult ? 'Submitting responses…' : 'Calculate and submit responses'}
          </button>
        </div>
      </section>
    `;
  }

  private renderComplete() {
    if (!this.result || !this.submittedRecord) return nothing;
    const showScore = !this.studyConfig || this.studyConfig.showScoreToParticipant;
    return html`
      <section class="panel confirmation" id="question-panel" aria-labelledby="complete-heading">
        <h2 id="complete-heading">${this.studyConfig ? 'Questionnaire complete' : 'Responses calculated'}</h2>
        ${showScore
          ? html`<p class="score">Weighted workload score: <strong>${this.result.weightedScore.toFixed(2)}</strong></p>`
          : html`<p>Your responses have been recorded. The study configuration does not display the calculated score on the participant page.</p>`}
        ${this.studyConfig
          ? this.completionSavedByHost
            ? html`<div class="save-status" role="status">
                <h3>Submitted to the study platform</h3>
                <p>
                  ${this.hostSinkName} confirmed receipt of submission
                  <strong>${this.hostReceipt?.receiptId || this.submittedRecord.submissionId}</strong>.
                  The researcher should retrieve it from that approved platform.
                </p>
              </div>`
            : this.completionSavedLocally
            ? html`<div class="save-status" role="status">
                <h3>Saved on this device</h3>
                <p>
                  The completed record is stored only in this browser. It has not been sent to GitHub or to a server.
                  The study conductor must export it from the study setup page before browser data are cleared.
                </p>
              </div>`
            : html`<div class="error-summary" role="alert">
                <h3>The browser could not save the completed record</h3>
                <p>Use the JSON or CSV backup button below and give the file to the study conductor through the approved study procedure.</p>
              </div>`
          : html`<p>No response, audio or webcam video has been uploaded. Demonstration results are not retained after this page is closed.</p>`}
        <p>Support and input-route metadata remain separate from the NASA-TLX score.</p>
        ${!this.studyConfig
          ? html`<details>
              <summary>Show the complete result record</summary>
              <pre>${JSON.stringify(this.submittedRecord, null, 2)}</pre>
            </details>`
          : nothing}
        <div class="button-row compact">
          ${this.completionSavedByHost
            ? nothing
            : html`<button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultJson}>
                Download JSON backup
              </button>
              <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultCsv}>
                Download CSV backup
              </button>`}
          ${!this.studyConfig
            ? html`<button class="secondary-button large-answer-button" type="button" @click=${this.restart}>Start again</button>`
            : nothing}
        </div>
        ${this.studyConfig
          ? html`<p>
              <strong>Participant:</strong>
              ${this.completionSavedByHost
                ? 'you may now follow the study platform instructions.'
                : 'please return the device or completion notice to the study conductor.'}
            </p>`
          : nothing}
      </section>
    `;
  }

  private renderSavedSessionOffer() {
    if (!this.savedSession) return nothing;
    const count = Object.keys(this.savedSession.ratings).length + Object.keys(this.savedSession.pairResponses).length;
    return html`
      <aside class="saved-session" aria-labelledby="saved-session-heading">
        <h3 id="saved-session-heading">Saved questionnaire found</h3>
        <p>${count} of ${dimensions.length + pairs.length} responses are saved in this browser.</p>
        <div class="button-row compact">
          <button class="primary-button large-answer-button" type="button" @click=${this.restoreSavedSession}>
            Resume saved questionnaire
          </button>
          <button class="secondary-button" type="button" @click=${this.eraseSavedSession}>Erase saved answers</button>
        </div>
      </aside>
    `;
  }

  private renderResumeSummary() {
    return html`
      <aside class="resume-summary" aria-labelledby="resume-heading">
        <h2 id="resume-heading" tabindex="-1">Welcome back — here is where you stopped</h2>
        <dl class="resume-details">
          <div><dt>Completed</dt><dd>${this.completedCount()} of ${dimensions.length + pairs.length} responses</dd></div>
          <div><dt>Last saved response</dt><dd>${this.lastSavedDescription()}</dd></div>
          <div><dt>Current position</dt><dd>${this.currentPositionDescription()}</dd></div>
          <div><dt>Next action</dt><dd>${this.nextActionDescription()}</dd></div>
        </dl>
        <p>Your current answers are saved in this browser.</p>
        <div class="button-row compact">
          <button class="primary-button large-answer-button" type="button" @click=${this.dismissResumeSummary}>
            Continue from here
          </button>
          <button class="secondary-button" type="button" @click=${this.restart}>
            Erase answers and start again
          </button>
        </div>
      </aside>
    `;
  }

  private setSimpleLanguage(event: Event) {
    const value = (event.currentTarget as HTMLInputElement).checked;
    this.recordSupportChange('simpler-explanations', this.showSimpleLanguage, value);
    this.showSimpleLanguage = value;
    this.invalidatePendingSubmission();
    this.persistProgress();
  }

  private recordSupportChange(
    setting: SupportChangeSetting,
    from: SupportChange['from'],
    to: SupportChange['to'],
  ) {
    if (!this.studyConfig || from === to || this.stage === 'complete') return;
    this.supportChanges = [
      ...this.supportChanges,
      {
        setting,
        from,
        to,
        stage: this.stage,
        changedAt: new Date().toISOString(),
      },
    ];
  }

  private setParticipantCode = (event: Event) => {
    this.participantCode = (event.currentTarget as HTMLInputElement).value.trim();
    this.participantCodeError =
      this.participantCode && !validParticipantCode(this.participantCode)
        ? 'Use 1–32 letters, numbers, hyphens or underscores, starting with a letter or number.'
        : '';
    this.savedSession = null;
    if (validParticipantCode(this.participantCode)) this.findSavedSession();
  };

  private setAnswerMode(mode: AnswerMode) {
    this.recordSupportChange('answer-mode', this.answerMode, mode);
    this.answerMode = mode;
    this.invalidatePendingSubmission();
    this.persistProgress();
  }

  private setLargeText(value: boolean) {
    this.recordSupportChange('text-size', this.largeText ? 'large' : 'standard', value ? 'large' : 'standard');
    this.largeText = value;
    this.invalidatePendingSubmission();
    this.persistProgress();
  }

  private setRecovery(event: Event) {
    const value = (event.currentTarget as HTMLInputElement).checked;
    this.recordSupportChange('interruption-recovery', this.recoveryEnabled, value);
    this.recoveryEnabled = value;
    this.invalidatePendingSubmission();
    if (this.recoveryEnabled) this.persistProgress();
    else this.clearSavedProgress();
  }

  private setAudioGuidance = (event: Event) => {
    const value = (event.currentTarget as HTMLInputElement).checked;
    this.recordSupportChange('automatic-audio', this.audioGuidance, value);
    this.audioGuidance = value;
    this.invalidatePendingSubmission();
    if (this.audioGuidance) this.speakText('Built-in audio guidance is on. New questions and selected answers will be spoken.');
    else this.stopReading();
    this.persistProgress();
  };

  private landmarkLabel(dimension: TlxDimension, value: number) {
    if (value === 0) return dimension.lowAnchor;
    if (value === 25) return `Closer to ${dimension.lowAnchor}`;
    if (value === 50) return 'Middle';
    if (value === 75) return `Closer to ${dimension.highAnchor}`;
    return dimension.highAnchor;
  }

  private ratingRouteLabel(dimension: DimensionId) {
    const route = this.ratingInputRoutes[dimension];
    if (route === 'smiley-landmark') return 'smiley landmark';
    if (route === 'voice') return 'voice, confirmed';
    if (route === 'gaze-standard-scale') return 'gaze, standard scale, confirmed';
    if (route === 'gaze-smiley-landmark') return 'gaze, smiley landmark, confirmed';
    return 'full scale';
  }

  private selectRating(dimension: DimensionId, value: number, route: RatingInputRoute) {
    if (route !== 'voice' && this.voiceState !== 'idle') this.clearVoiceAnswer();
    const effectiveRoute = this.gazeActivationInProgress
      ? route === 'smiley-landmark'
        ? 'gaze-smiley-landmark'
        : 'gaze-standard-scale'
      : route;
    this.ratings = { ...this.ratings, [dimension]: value };
    this.ratingInputRoutes = { ...this.ratingInputRoutes, [dimension]: effectiveRoute };
    this.clearError();
    this.statusMessage = `${dimensionById.get(dimension)!.name}, ${value}, selected.`;
    if (this.audioGuidance) this.speakText(this.statusMessage);
    this.persistProgress();
  }

  private selectPair(pairId: string, dimension: DimensionId, route: PairInputRoute) {
    if (route !== 'voice' && this.voiceState !== 'idle') this.clearVoiceAnswer();
    const effectiveRoute = this.gazeActivationInProgress ? 'gaze' : route;
    this.pairResponses = { ...this.pairResponses, [pairId]: dimension };
    this.pairInputRoutes = { ...this.pairInputRoutes, [pairId]: effectiveRoute };
    this.clearError();
    this.statusMessage = `${dimensionById.get(dimension)!.name} selected.`;
    if (this.audioGuidance) this.speakText(this.statusMessage);
    this.persistProgress();
  }

  private startQuestionnaire = () => {
    if (this.configurationError) {
      this.showError(this.configurationError);
      return;
    }
    if (this.studyConfig) {
      this.participantCode = this.participantCode.trim();
      if (!validParticipantCode(this.participantCode)) {
        this.participantCodeError = 'Enter the valid pseudonymous participant code supplied by the study conductor.';
        this.showError(this.participantCodeError);
        return;
      }
    }
    this.startedAt = new Date().toISOString();
    this.stage = 'ratings';
    this.ratingIndex = 0;
    this.clearError();
    this.persistProgress();
    this.focusHeading();
  };

  private goNext(context: 'rating' | 'pair') {
    this.stopReading();
    this.clearVoiceAnswer();
    if (context === 'rating') {
      const dimension = dimensions[this.ratingIndex];
      if (this.ratings[dimension.id] === undefined) {
        this.showError(`Choose a rating for ${dimension.name} before continuing.`);
        return;
      }
      if (this.ratingIndex < dimensions.length - 1) this.ratingIndex += 1;
      else {
        this.stage = 'pairs';
        this.pairIndex = 0;
      }
    } else {
      const pair = this.pairOrder[this.pairIndex];
      if (!this.pairResponses[pair.id]) {
        this.showError('Choose which factor contributed more to workload before continuing.');
        return;
      }
      if (this.pairIndex < this.pairOrder.length - 1) this.pairIndex += 1;
      else this.stage = 'review';
    }
    this.clearError();
    this.persistProgress();
    this.focusHeading();
  }

  private goBack = () => {
    this.stopReading();
    this.clearVoiceAnswer();
    if (this.stage === 'ratings' && this.ratingIndex > 0) this.ratingIndex -= 1;
    else if (this.stage === 'pairs') {
      if (this.pairIndex > 0) this.pairIndex -= 1;
      else {
        this.stage = 'ratings';
        this.ratingIndex = dimensions.length - 1;
      }
    }
    this.clearError();
    this.persistProgress();
    this.focusHeading();
  };

  private returnToRatings = () => {
    this.invalidatePendingSubmission();
    this.stage = 'ratings';
    this.ratingIndex = dimensions.length - 1;
    this.persistProgress();
    this.focusHeading();
  };

  private returnToPairs = () => {
    this.invalidatePendingSubmission();
    this.stage = 'pairs';
    this.pairIndex = this.pairOrder.length - 1;
    this.persistProgress();
    this.focusHeading();
  };

  private effectiveStudyConfig(): StudyConfig {
    if (this.studyConfig) return this.studyConfig;
    return {
      schemaVersion: 3,
      configId: 'demo-config',
      createdAt: this.startedAt || new Date().toISOString(),
      prototypeVersion: PROTOTYPE_VERSION,
      studyId: 'DEMO',
      studyTitle: 'Technical demonstration',
      taskLabel: 'a task completed before the questionnaire',
      showScoreToParticipant: true,
      support: {
        showSimpleLanguage: false,
        answerMode: 'standard',
        largeText: false,
        audioGuidance: false,
        recoveryEnabled: false,
        participantAdjustmentPolicy: 'presentation-only',
        voiceInputAvailable: true,
        gazeInputAvailable: true,
      },
      collection: { mode: 'local' },
    };
  }

  private currentSupportMetadata(): SupportMetadata {
    return {
      simplerExplanationsShownAtSubmission: this.showSimpleLanguage,
      largeTextUsedAtSubmission: this.largeText,
      answerModeAtSubmission: this.answerMode,
      recoveryEnabledAtSubmission: this.recoveryEnabled,
      interruptionSummaryShown: this.interruptionSummaryShown,
      readAloudUsed: this.readAloudUsed,
      automaticAudioGuidanceEnabledAtSubmission: this.audioGuidance,
      gazeUsed: this.gazeUsed,
      gazeActionCount: this.gazeActionCount,
      gazeEngine: this.gazeUsed ? `WebGazer ${WEBGAZER_VERSION}` : null,
      ratingInputRoutes: this.ratingInputRoutes,
      pairInputRoutes: this.pairInputRoutes,
      supportChanges: [...this.supportChanges],
    };
  }

  private submitResponses = async () => {
    if (this.submittingResult) return;
    try {
      if (!this.result || !this.submittedRecord) {
        this.result = calculateResult(this.pairOrder, this.pairResponses, this.ratings as Ratings);
        this.submittedRecord = createStudyResultRecord({
          config: this.effectiveStudyConfig(),
          participantCode: this.studyConfig ? this.participantCode : 'DEMO',
          startedAt: this.startedAt || new Date().toISOString(),
          pairPresentationOrder: this.pairOrder.map(({ id }) => id),
          pairwiseChoices: this.pairResponses,
          result: this.result,
          supportMetadata: this.currentSupportMetadata(),
        });
      }
      const sink = this.studyConfig ? configuredResultSink() : null;
      this.completionSavedLocally = false;
      this.completionSavedByHost = false;
      this.hostSinkName = '';
      this.hostReceipt = null;
      if (sink) {
        this.submittingResult = true;
        this.statusMessage = `Submitting responses to ${sink.name}.`;
        try {
          this.hostReceipt = await submitToApprovedResultSink(this.submittedRecord, sink);
          this.completionSavedByHost = true;
          this.hostSinkName = sink.name;
        } catch (error) {
          const detail = error instanceof Error ? error.message : 'The study platform did not accept the response.';
          this.showError(
            `${detail} Your answers remain on this page. Try submitting again or ask the study conductor for help.`,
          );
          return;
        } finally {
          this.submittingResult = false;
        }
      } else {
        this.completionSavedLocally = this.studyConfig
          ? saveCompletedResult(this.submittedRecord)
          : false;
      }
      this.dispatchEvent(new CustomEvent<StudyResultRecord>('nasa-tlx-complete', {
        detail: this.submittedRecord,
        bubbles: true,
        composed: true,
      }));
      this.stage = 'complete';
      this.clearSavedProgress();
      this.stopGazeInput();
      this.clearError();
      this.focusHeading();
    } catch (error) {
      this.submittingResult = false;
      this.showError(error instanceof Error ? error.message : 'Responses could not be calculated.');
    }
  };

  private downloadResultJson = () => {
    if (!this.submittedRecord) return;
    downloadTextFile(
      `${resultFileBase(this.submittedRecord)}.json`,
      JSON.stringify(this.submittedRecord, null, 2),
      'application/json',
    );
  };

  private downloadResultCsv = () => {
    if (!this.submittedRecord) return;
    downloadTextFile(
      `${resultFileBase(this.submittedRecord)}.csv`,
      `\uFEFF${resultsToCsv([this.submittedRecord])}`,
      'text/csv',
    );
  };

  private restart = () => {
    this.stopReading(false);
    this.stopGazeInput();
    this.releaseRecognition();
    this.clearSavedProgress();
    this.stage = 'intro';
    this.ratingIndex = 0;
    this.pairIndex = 0;
    this.pairOrder = shuffledPairs();
    this.pairResponses = {};
    this.ratings = {};
    this.ratingInputRoutes = {};
    this.pairInputRoutes = {};
    this.supportChanges = [];
    this.resumeSummaryVisible = false;
    this.savedSession = null;
    this.result = null;
    this.submittedRecord = null;
    this.completionSavedLocally = false;
    this.completionSavedByHost = false;
    this.hostSinkName = '';
    this.hostReceipt = null;
    this.submittingResult = false;
    this.startedAt = '';
    this.participantCodeError = '';
    if (this.studyConfig) this.participantCode = '';
    this.errorMessage = '';
    this.voiceState = 'idle';
    this.pendingVoiceAnswer = null;
    this.audioGuidance = false;
    this.audioStatusMessage = '';
    this.gazeUsed = false;
    this.gazeActionCount = 0;
    this.applyConfiguredSupport();
    this.statusMessage = 'A new questionnaire has started.';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  private invalidatePendingSubmission() {
    this.result = null;
    this.submittedRecord = null;
    this.completionSavedLocally = false;
    this.completionSavedByHost = false;
    this.hostSinkName = '';
    this.hostReceipt = null;
  }

  private toggleReadAloud = () => {
    if (this.readingAloud) {
      this.stopReading(true);
      return;
    }
    this.speakText(this.currentStepSpeech());
  };

  private speakText(text: string) {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      this.audioStatusMessage = 'Built-in audio is unavailable in this browser. External screen readers can still read the page.';
      return;
    }
    const synthesis = window.speechSynthesis;
    const replaceExistingSpeech = this.readingAloud || synthesis.speaking || synthesis.pending || synthesis.paused;
    const requestId = ++this.speechRequestId;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-GB';
    utterance.rate = 0.9;
    const voices = window.speechSynthesis.getVoices?.() ?? [];
    const preferredVoice = voices.find((voice) => voice.lang.toLowerCase() === 'en-gb')
      ?? voices.find((voice) => voice.lang.toLowerCase().startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.onend = () => {
      if (requestId !== this.speechRequestId) return;
      this.readingAloud = false;
      this.audioStatusMessage = 'Spoken summary finished.';
    };
    utterance.onerror = (event) => {
      if (requestId !== this.speechRequestId) return;
      this.readingAloud = false;
      const error = event.error ? ` (${event.error})` : '';
      this.audioStatusMessage = `No audio was played because the browser reported a speech error${error}. Check the device volume and try the button again.`;
    };

    const startSpeech = () => {
      if (requestId !== this.speechRequestId) return;
      try {
        synthesis.speak(utterance);
        this.readingAloud = true;
        this.readAloudUsed = true;
        this.audioStatusMessage = 'Playing a spoken summary of the current step.';
      } catch {
        this.readingAloud = false;
        this.audioStatusMessage = 'Built-in audio could not start in this browser. Check the device volume and try the button again.';
      }
    };

    // Some browsers fail the first utterance when cancel() or resume() is called
    // before speech has ever started. Only clear a queue that actually exists.
    if (replaceExistingSpeech) {
      synthesis.cancel();
      window.setTimeout(startSpeech, 0);
    } else {
      startSpeech();
    }
  }

  private stopReading(announce = false) {
    this.speechRequestId += 1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    this.readingAloud = false;
    if (announce) this.audioStatusMessage = 'Spoken summary stopped.';
  }

  private currentStepSpeech() {
    if (this.stage === 'intro') {
      const task = this.studyConfig
        ? `Think about ${this.studyConfig.taskLabel}.`
        : 'Think about one task that you have just completed.';
      return `Before you begin. ${task} First rate six aspects of workload. Then make fifteen comparisons. Finally review and submit.`;
    }
    if (this.stage === 'ratings') {
      const dimension = dimensions[this.ratingIndex];
      const support = this.showSimpleLanguage ? ` Simpler explanation: ${dimension.simpleExplanation}` : '';
      return `Rating ${this.ratingIndex + 1} of 6. ${dimension.name}. Official definition: ${dimension.officialDefinition}.${support} Rate from 0, ${dimension.lowAnchor}, to 100, ${dimension.highAnchor}.`;
    }
    if (this.stage === 'pairs') {
      const pair = this.pairOrder[this.pairIndex];
      const left = dimensionById.get(pair.left)!;
      const right = dimensionById.get(pair.right)!;
      return `Comparison ${this.pairIndex + 1} of 15. Which factor contributed more to workload? This is not a low to high rating. Choose ${left.name} or ${right.name}.`;
    }
    if (this.stage === 'review') return 'Review your six ratings and fifteen source of workload comparisons before submitting.';
    return 'Responses calculated.';
  }

  private startGazeInput = async () => {
    if (!isSecureGazeContext(window.location)) {
      this.gazeState = 'error';
      this.gazeMessage = 'Gaze input requires an HTTPS-hosted page or localhost.';
      return;
    }
    this.gazeState = 'loading';
    this.gazeMessage = 'Loading the pinned WebGazer library. Webcam permission will be requested next.';
    try {
      const webgazer = await loadWebGazer();
      if (!webgazer.detectCompatibility()) throw new Error('This browser does not expose a compatible webcam API.');
      this.webgazer = webgazer;
      webgazer.params.faceMeshSolutionPath = WEBGAZER_FACE_MESH_URL;
      webgazer.saveDataAcrossSessions(false);
      await webgazer.clearData();
      webgazer.showVideoPreview(true);
      webgazer.showFaceOverlay(true);
      webgazer.showFaceFeedbackBox(true);
      webgazer.showPredictionPoints(false);
      webgazer.setGazeListener((point) => this.handleGazePoint(point));
      await webgazer.begin();
      // Explicit calibration samples are recorded below. Removing WebGazer's
      // global click listener prevents a single click from being learned twice
      // and keeps keyboard-triggered samples at the visible target centre.
      webgazer.removeMouseEventListeners();
      await this.showGazePositioningStep('Camera started. Position your face, then continue to calibration.');
    } catch (error) {
      this.gazeState = 'error';
      this.gazeMessage = error instanceof Error
        ? `Gaze setup did not start: ${error.message}`
        : 'Gaze setup did not start. Use another answer route.';
      this.releaseGazeResources();
    }
  };

  private restartGazeCalibration = async () => {
    if (!this.webgazer) return;
    this.cancelGazeProposal();
    await this.webgazer.clearData();
    await this.showGazePositioningStep('Recalibration started. Check your position before continuing.');
  };

  private async showGazePositioningStep(message: string) {
    if (!this.webgazer) return;
    this.restoreWebGazerPreviewContainer();
    this.webgazer.showPredictionPoints(false);
    this.webgazer.showVideoPreview(true);
    this.webgazer.showFaceOverlay(true);
    this.webgazer.showFaceFeedbackBox(true);
    this.gazeState = 'positioning';
    this.gazeMessage = message;
    await this.updateComplete;
    this.mountWebGazerPreview();
    this.querySelector<HTMLElement>('#gaze-positioning-heading')?.focus();
  }

  private mountWebGazerPreview() {
    const slot = this.querySelector<HTMLElement>('.gaze-camera-preview-slot');
    const preview = document.querySelector<HTMLElement>('#webgazerVideoContainer');
    if (!slot || !preview) return;
    preview.setAttribute('aria-hidden', 'true');
    slot.append(preview);
  }

  private restoreWebGazerPreviewContainer() {
    const preview = document.querySelector<HTMLElement>('#webgazerVideoContainer');
    if (preview && preview.parentElement !== document.body) document.body.append(preview);
  }

  private beginGazeCalibration = () => {
    if (!this.webgazer) return;
    this.restoreWebGazerPreviewContainer();
    this.webgazer.showVideoPreview(false);
    this.webgazer.showFaceOverlay(false);
    this.webgazer.showFaceFeedbackBox(false);
    this.webgazer.showPredictionPoints(false);
    this.gazeCalibrationIndex = 0;
    this.gazeCalibrationRepetition = 0;
    this.gazeState = 'calibrating';
    this.gazeMessage = 'Camera preview hidden. Complete all 27 calibration samples.';
    void this.updateComplete.then(() => this.querySelector<HTMLButtonElement>('.calibration-point')?.focus());
  };

  private recordCalibrationPoint = (event: MouseEvent) => {
    if (!this.webgazer || this.gazeState !== 'calibrating') return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.webgazer.recordScreenPosition(rect.left + rect.width / 2, rect.top + rect.height / 2, 'click');
    if (this.gazeCalibrationRepetition < CALIBRATION_REPETITIONS - 1) {
      this.gazeCalibrationRepetition += 1;
      return;
    }
    if (this.gazeCalibrationIndex < CALIBRATION_POINTS.length - 1) {
      this.gazeCalibrationIndex += 1;
      this.gazeCalibrationRepetition = 0;
      return;
    }
    this.gazeCalibrationRepetition = CALIBRATION_REPETITIONS;
    this.gazeState = 'ready';
    this.gazeUsed = true;
    this.gazeMessage = 'Calibration complete. A red gaze dot is visible. Look at a large answer or navigation control for one second.';
    this.webgazer.showVideoPreview(false);
    this.webgazer.showFaceOverlay(false);
    this.webgazer.showFaceFeedbackBox(false);
    this.webgazer.showPredictionPoints(true);
    this.statusMessage = 'Gaze-assisted answering is ready.';
  };

  private handleGazePoint(point: GazePoint | null) {
    if (this.gazeState !== 'ready' || !point) {
      this.resetGazeHover();
      return;
    }
    const hits = this.elementsAtGazePoint(point);
    if (this.gazePendingElement) {
      const action =
        hits
          .map((hit) => hit.closest<HTMLElement>('[data-gaze-confirm], [data-gaze-cancel]'))
          .find((candidate): candidate is HTMLElement => candidate !== null) ?? null;
      const actionKey = action?.hasAttribute('data-gaze-confirm')
        ? 'confirm'
        : action?.hasAttribute('data-gaze-cancel')
          ? 'cancel'
          : null;
      const update = this.gazeConfirmationTracker.update(actionKey, performance.now());
      this.gazeDwellProgress = update.progress;
      if (update.activated && actionKey === 'confirm') this.confirmGazeProposal();
      if (update.activated && actionKey === 'cancel') this.cancelGazeProposal();
      return;
    }

    const target =
      hits
        .map((hit) => hit.closest<HTMLElement>('[data-gaze-target]'))
        .find((candidate): candidate is HTMLElement => candidate !== null) ?? null;
    const eligible = target && !target.matches(':disabled') ? target : null;
    if (eligible !== this.gazeCandidateElement) {
      this.resetGazeHover();
      this.gazeCandidateElement = eligible;
    }
    const key = eligible?.dataset.gazeLabel ?? eligible?.textContent?.trim() ?? null;
    const update = this.gazeCandidateTracker.update(key, performance.now());
    this.setGazeHover(eligible, update.progress);
    if (eligible && update.activated) {
      this.gazePendingElement = eligible;
      this.gazePendingLabel = key ?? 'selected control';
      this.gazeDwellProgress = 0;
      this.resetGazeHover();
      this.statusMessage = `${this.gazePendingLabel} proposed by gaze. Confirm or cancel.`;
    }
  }

  private elementsAtGazePoint(point: GazePoint) {
    if (typeof document.elementsFromPoint === 'function') {
      return document.elementsFromPoint(point.x, point.y).filter((element): element is HTMLElement => element instanceof HTMLElement);
    }
    const hit = document.elementFromPoint(point.x, point.y);
    return hit instanceof HTMLElement ? [hit] : [];
  }

  private setGazeHover(target: HTMLElement | null, progress: number) {
    this.gazeCandidateElement = target;
    this.gazeDwellProgress = progress;
    if (!target) return;
    target.classList.add('gaze-hover');
    target.style.setProperty('--gaze-progress', `${progress * 100}%`);
  }

  private resetGazeHover() {
    this.gazeCandidateTracker.reset();
    if (this.gazeCandidateElement) {
      this.gazeCandidateElement.classList.remove('gaze-hover');
      this.gazeCandidateElement.style.removeProperty('--gaze-progress');
    }
    this.gazeCandidateElement = null;
    if (!this.gazePendingElement) this.gazeDwellProgress = 0;
  }

  private confirmGazeProposal = () => {
    const target = this.gazePendingElement;
    if (!target) return;
    const label = this.gazePendingLabel;
    this.gazePendingElement = null;
    this.gazePendingLabel = '';
    this.gazeDwellProgress = 0;
    this.gazeConfirmationTracker.reset();
    this.gazeActivationInProgress = true;
    try {
      target.click();
      this.gazeActionCount += 1;
      this.gazeUsed = true;
      this.statusMessage = `${label} activated by confirmed gaze.`;
    } finally {
      this.gazeActivationInProgress = false;
    }
  };

  private cancelGazeProposal = () => {
    this.gazePendingElement = null;
    this.gazePendingLabel = '';
    this.gazeDwellProgress = 0;
    this.gazeConfirmationTracker.reset();
    this.statusMessage = 'Gaze proposal cancelled.';
  };

  private stopGazeInput = () => {
    this.cancelGazeProposal();
    this.resetGazeHover();
    this.restoreWebGazerPreviewContainer();
    this.releaseGazeResources();
    this.gazeState = 'off';
    this.gazeMessage = 'Gaze input and camera stopped.';
  };

  private releaseGazeResources() {
    const webgazer = this.webgazer;
    if (!webgazer) return;
    this.restoreWebGazerPreviewContainer();
    try { webgazer.clearGazeListener(); } catch { /* Already stopped. */ }
    try { webgazer.removeMouseEventListeners(); } catch { /* Already stopped. */ }
    try { webgazer.stopVideo(); } catch { /* Camera may not have opened. */ }
    try { webgazer.end(); } catch { /* DOM preview may not exist. */ }
    void Promise.resolve(webgazer.clearData()).catch(() => undefined);
    this.webgazer = null;
  }

  private startVoiceInput(context: 'rating' | 'pair', first: TlxDimension, second?: TlxDimension) {
    this.stopReading();
    const Constructor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Constructor) return;
    this.releaseRecognition();
    this.pendingVoiceAnswer = null;
    this.voiceMessage = 'Listening for one answer.';
    this.voiceState = 'listening';
    const recognition = new Constructor();
    this.recognition = recognition;
    recognition.lang = 'en-GB';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;
    recognition.onresult = (event) => {
      if (this.recognition !== recognition) return;
      const alternatives = Array.from({ length: event.results[0].length }, (_, index) => event.results[0][index].transcript);
      for (const transcript of alternatives) {
        if (context === 'rating') {
          const value = parseRatingTranscript(transcript, first);
          if (value !== null) {
            this.releaseRecognition(recognition);
            this.pendingVoiceAnswer = { context, transcript, value, label: `${value} for ${first.name}` };
            this.voiceState = 'pending';
            this.voiceMessage = 'Check the proposed answer, then confirm it.';
            return;
          }
        } else {
          const value = parsePairTranscript(transcript, [first.id, second!.id]);
          if (value) {
            this.releaseRecognition(recognition);
            this.pendingVoiceAnswer = { context, transcript, value, label: dimensionById.get(value)!.name };
            this.voiceState = 'pending';
            this.voiceMessage = 'Check the proposed answer, then confirm it.';
            return;
          }
        }
      }
      this.releaseRecognition(recognition);
      this.voiceState = 'error';
      this.voiceMessage = `The answer was not recognised. ${context === 'rating' ? 'Say a multiple of five from 0 to 100.' : `Say ${first.name} or ${second!.name}.`}`;
    };
    recognition.onerror = (event) => {
      if (this.recognition !== recognition) return;
      this.releaseRecognition(recognition);
      this.voiceState = 'error';
      this.voiceMessage = event.error === 'not-allowed'
        ? 'Microphone permission was not granted. Use the visible answer buttons or system voice control.'
        : 'Voice recognition did not complete. Use the visible answer buttons or try again.';
    };
    recognition.onend = () => {
      if (this.recognition !== recognition) return;
      this.recognition = null;
      if (this.voiceState === 'listening') {
        this.voiceState = 'error';
        this.voiceMessage = 'No answer was recognised. Try again or use the visible answer buttons.';
      }
    };
    try {
      recognition.start();
    } catch {
      this.releaseRecognition(recognition);
      this.voiceState = 'error';
      this.voiceMessage = 'Voice recognition could not start in this browser context.';
    }
  }

  private confirmVoiceAnswer = () => {
    const pending = this.pendingVoiceAnswer;
    if (!pending) return;
    let confirmedControlId = '';
    if (pending.context === 'rating') {
      const dimension = dimensions[this.ratingIndex];
      const value = pending.value as number;
      this.selectRating(dimension.id, value, 'voice');
      const visibleAsLandmark = this.answerMode === 'smiley' && smileyLandmarks.some((landmark) => landmark.value === value);
      confirmedControlId = visibleAsLandmark
        ? `smiley-${dimension.id}-${value}`
        : `rating-${dimension.id}-${value}`;
    } else {
      const pair = this.pairOrder[this.pairIndex];
      const dimension = pending.value as DimensionId;
      this.selectPair(pair.id, dimension, 'voice');
      confirmedControlId = `${pair.id}-${dimension}`;
    }
    this.voiceState = 'idle';
    this.voiceMessage = '';
    this.pendingVoiceAnswer = null;
    void this.updateComplete.then(() => this.querySelector<HTMLInputElement>(`#${confirmedControlId}`)?.focus());
  };

  private clearVoiceAnswer = () => {
    this.releaseRecognition();
    this.voiceState = 'idle';
    this.voiceMessage = '';
    this.pendingVoiceAnswer = null;
  };

  private releaseRecognition(recognition = this.recognition) {
    if (!recognition) return;
    if (this.recognition === recognition) this.recognition = null;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    try {
      recognition.stop();
    } catch {
      // Browsers may report InvalidStateError when a one-shot recogniser has already ended.
    }
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.hiddenAt = Date.now();
      return;
    }
    if (this.hiddenAt && this.recoveryEnabled && this.isInProgress()) {
      this.resumeSummaryVisible = true;
      this.interruptionSummaryShown = true;
      this.statusMessage = 'Welcome back. A summary of your saved position is available.';
      void this.updateComplete.then(() => this.querySelector<HTMLElement>('#resume-heading')?.focus());
    }
    this.hiddenAt = null;
  };

  private dismissResumeSummary = () => {
    this.resumeSummaryVisible = false;
    this.statusMessage = `Continuing at ${this.currentPositionDescription()}.`;
    this.focusHeading();
  };

  private currentProgressStorageKey() {
    const code = this.studyConfig ? this.participantCode : 'DEMO';
    if (!validParticipantCode(code)) return null;
    return progressStorageKey(this.studyConfig?.configId ?? 'demo-config', code);
  }

  private persistProgress() {
    if (!this.recoveryEnabled || !this.isInProgress()) return;
    const storageKey = this.currentProgressStorageKey();
    if (!storageKey) return;
    const session: SavedSession = {
      version: 3,
      savedAt: Date.now(),
      startedAt: this.startedAt || new Date().toISOString(),
      configId: this.studyConfig?.configId ?? 'demo-config',
      participantCode: this.studyConfig ? this.participantCode : 'DEMO',
      stage: this.stage as SavedSession['stage'],
      ratingIndex: this.ratingIndex,
      pairIndex: this.pairIndex,
      pairOrder: this.pairOrder,
      pairResponses: this.pairResponses,
      ratings: this.ratings,
      ratingInputRoutes: this.ratingInputRoutes,
      pairInputRoutes: this.pairInputRoutes,
      supportChanges: this.supportChanges,
      support: {
        answerMode: this.answerMode,
        showSimpleLanguage: this.showSimpleLanguage,
        largeText: this.largeText,
        audioGuidance: this.audioGuidance,
      },
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(session));
    } catch {
      this.statusMessage = 'Progress could not be saved by this browser.';
    }
  }

  private findSavedSession() {
    const storageKey = this.currentProgressStorageKey();
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const session = JSON.parse(raw) as SavedSession;
      if (this.validSavedSession(session)) this.savedSession = session;
      else this.clearSavedProgress();
    } catch {
      this.clearSavedProgress();
    }
  }

  private validSavedSession(session: SavedSession) {
    return (
      session?.version === 3 &&
      session.configId === (this.studyConfig?.configId ?? 'demo-config') &&
      session.participantCode === (this.studyConfig ? this.participantCode : 'DEMO') &&
      typeof session.startedAt === 'string' &&
      ['ratings', 'pairs', 'review'].includes(session.stage) &&
      Array.isArray(session.pairOrder) &&
      session.pairOrder.length === pairs.length &&
      Number.isInteger(session.ratingIndex) &&
      Number.isInteger(session.pairIndex) &&
      Array.isArray(session.supportChanges)
    );
  }

  private restoreSavedSession = () => {
    const session = this.savedSession;
    if (!session) return;
    this.stage = session.stage;
    this.ratingIndex = session.ratingIndex;
    this.pairIndex = session.pairIndex;
    this.pairOrder = session.pairOrder;
    this.pairResponses = session.pairResponses;
    this.ratings = session.ratings;
    this.ratingInputRoutes = session.ratingInputRoutes;
    this.pairInputRoutes = session.pairInputRoutes;
    this.supportChanges = session.supportChanges;
    this.startedAt = session.startedAt;
    if (this.canAdjustAllSupport) {
      this.answerMode = session.support.answerMode;
      this.showSimpleLanguage = session.support.showSimpleLanguage;
      this.largeText = session.support.largeText;
      this.audioGuidance = Boolean(session.support.audioGuidance);
    } else {
      this.applyConfiguredSupport();
      if (this.canAdjustPresentationSupport) {
        this.largeText = session.support.largeText;
        this.audioGuidance = Boolean(session.support.audioGuidance);
      }
    }
    this.recoveryEnabled = true;
    this.savedSession = null;
    this.resumeSummaryVisible = true;
    this.interruptionSummaryShown = true;
    void this.updateComplete.then(() => this.querySelector<HTMLElement>('#resume-heading')?.focus());
  };

  private eraseSavedSession = () => {
    this.clearSavedProgress();
    this.savedSession = null;
    this.statusMessage = 'Saved answers erased.';
  };

  private clearSavedProgress() {
    const storageKey = this.currentProgressStorageKey();
    if (!storageKey) return;
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Storage may be unavailable in a restricted browser context.
    }
  }

  private isInProgress(): boolean {
    return this.stage === 'ratings' || this.stage === 'pairs' || this.stage === 'review';
  }

  private completedCount() {
    return Object.keys(this.ratings).length + Object.keys(this.pairResponses).length;
  }

  private lastSavedDescription() {
    if (this.stage === 'ratings') {
      const index = this.ratings[dimensions[this.ratingIndex].id] !== undefined ? this.ratingIndex : this.ratingIndex - 1;
      return index >= 0 ? `${dimensions[index].name} rating` : 'No response yet';
    }
    if (this.stage === 'pairs') {
      if (this.pairResponses[this.pairOrder[this.pairIndex].id]) return `Comparison ${this.pairIndex + 1}`;
      if (this.pairIndex > 0) return `Comparison ${this.pairIndex}`;
      return 'Frustration rating';
    }
    return 'Comparison 15';
  }

  private currentPositionDescription() {
    if (this.stage === 'ratings') return `Rating ${this.ratingIndex + 1} of ${dimensions.length}: ${dimensions[this.ratingIndex].name}`;
    if (this.stage === 'pairs') return `Comparison ${this.pairIndex + 1} of ${this.pairOrder.length}`;
    if (this.stage === 'review') return 'Review responses';
    return 'Questionnaire introduction';
  }

  private nextActionDescription() {
    if (this.stage === 'ratings') return `Choose or check the ${dimensions[this.ratingIndex].name} rating, then select Next.`;
    if (this.stage === 'pairs') {
      const pair = this.pairOrder[this.pairIndex];
      return `Choose ${dimensionById.get(pair.left)!.name} or ${dimensionById.get(pair.right)!.name}, then select Next.`;
    }
    return 'Check the saved answers, then submit or return to a question.';
  }

  private showError(message: string) {
    this.errorMessage = message;
    void this.updateComplete.then(() => {
      const summary = this.querySelector<HTMLElement>('#error-summary');
      if (!summary) return;
      summary.focus();
      summary.scrollIntoView?.({ block: 'start' });
    });
  }

  private clearError() {
    this.errorMessage = '';
  }

  private focusHeading() {
    void this.updateComplete.then(() => {
      window.scrollTo({ top: 0 });
      const heading = this.querySelector<HTMLElement>('#question-panel h2');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus();
        this.statusMessage = heading.textContent?.trim() ?? '';
        if (this.audioGuidance) this.speakText(this.currentStepSpeech());
      }
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'accessible-nasa-tlx': AccessibleNasaTlx;
  }
}
