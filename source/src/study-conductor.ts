import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import embeddedDataFields from '../../integrations/qualtrics/embedded-data-fields.txt?raw';
import endOfSurveyMessage from '../../integrations/qualtrics/end-of-survey-message.txt?raw';
import qualtricsQuestionJavaScript from '../../integrations/qualtrics/qualtrics-question.js?raw';
import qualtricsQuestionTemplate from '../../integrations/qualtrics/question-html-template.html?raw';
import {
  buildParticipantUrl,
  clearCompletedResults,
  createStudyConfig,
  downloadTextFile,
  isStudyConfig,
  loadCompletedResults,
  normaliseHttpsOrigin,
  resultsToCsv,
  type AnswerMode,
  type ParticipantAdjustmentPolicy,
  type StudyCollectionConfig,
  type StudyConfig,
  type StudyResultRecord,
  type StudySupportConfig,
} from './study';

function looksLikeCompletedResult(value: unknown) {
  const records = Array.isArray(value) ? value : [value];
  return records.length > 0 && records.some((candidate) => {
    if (!candidate || typeof candidate !== 'object') return false;
    const record = candidate as Record<string, unknown>;
    return 'study' in record && 'responses' in record && 'result' in record;
  });
}

export function buildQualtricsQuestionHtml(participantUrl: string) {
  const placeholder = 'PASTE_THE_GENERATED_PARTICIPANT_PAGE_URL_HERE';
  if (!participantUrl || participantUrl.includes(placeholder)) {
    throw new Error('A generated participant URL is required for the Qualtrics question HTML.');
  }
  const escapedUrl = participantUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return qualtricsQuestionTemplate.trim().replace(placeholder, escapedUrl);
}

@customElement('study-conductor-app')
export class StudyConductorApp extends LitElement {
  @state() private studyId = '';
  @state() private studyTitle = '';
  @state() private taskLabel = '';
  @state() private showScoreToParticipant = false;
  @state() private showSimpleLanguage = false;
  @state() private answerMode: AnswerMode = 'standard';
  @state() private largeText = false;
  @state() private audioGuidance = false;
  @state() private recoveryEnabled = true;
  @state() private participantAdjustmentPolicy: ParticipantAdjustmentPolicy = 'participant-choice';
  @state() private voiceInputAvailable = true;
  @state() private gazeInputAvailable = false;
  @state() private collectionMode: StudyCollectionConfig['mode'] = 'local';
  @state() private qualtricsSurveyUrl = '';
  @state() private generatedConfig: StudyConfig | null = null;
  @state() private participantUrl = '';
  @state() private message = '';
  @state() private errorMessage = '';
  @state() private completedResults: StudyResultRecord[] = [];

  connectedCallback() {
    super.connectedCallback();
    this.refreshResults();
    window.addEventListener('storage', this.refreshResults);
  }

  disconnectedCallback() {
    window.removeEventListener('storage', this.refreshResults);
    super.disconnectedCallback();
  }

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected render() {
    return html`
      <a class="skip-link" href="#conductor-main">Skip to study setup</a>
      <main class="app-shell conductor-shell" id="conductor-main">
        <header class="app-header">
          <p class="eyebrow">Study conductor · Version 0.7 release candidate</p>
          <h1>Prepare an accessible NASA-TLX study</h1>
          <p class="subtitle">Create one configuration, give participants a prepared link, and export completed records.</p>
        </header>

        <aside class="boundary-note important-boundary">
          <h2>What this page does</h2>
          <p>
            This separates study setup from participant answering. Participants receive a configured questionnaire and do not
            have to set it up themselves. This researcher page generates a separate participant page. Measurement-adjacent
            support starts from the study configuration. The conductor can keep it fixed or allow documented participant
            preferences without making initial configuration a participant task.
          </p>
          <p>
            <strong>Collection boundary:</strong> local mode stays in this browser. Qualtrics mode sends a completed,
            pseudonymous record to the exact approved Qualtrics survey origin through the documented bridge. It places no
            account token in the participant page.
          </p>
        </aside>

        ${this.errorMessage
          ? html`<div class="error-summary" role="alert" tabindex="-1" id="conductor-error">
              <h2>There is a problem</h2><p>${this.errorMessage}</p>
            </div>`
          : nothing}
        <p class="sr-only" aria-live="polite">${this.message}</p>

        <section class="panel conductor-panel" aria-labelledby="study-details-heading">
          <h2 id="study-details-heading">1. Study details</h2>
          <p class="support-boundary">
            These fields identify the questionnaire configuration, not the participant. Give each participant a separate
            pseudonymous code such as P-001; they enter that code on the participant page.
          </p>
          <div class="form-grid">
            <label>
              <strong>Study ID</strong>
              <span>Internal label shared by records from one study or condition. Example: TLX-TECH-01. Do not use a participant name.</span>
              <input placeholder="TLX-TECH-01" autocomplete="off" spellcheck="false" .value=${this.studyId} maxlength="64" @input=${(event: Event) => { this.studyId = (event.currentTarget as HTMLInputElement).value; }} />
            </label>
            <label>
              <strong>Study title</strong>
              <span>Participant-facing name of the study. Example: Route-planning workload study.</span>
              <input placeholder="Route-planning workload study" autocomplete="off" .value=${this.studyTitle} maxlength="120" @input=${(event: Event) => { this.studyTitle = (event.currentTarget as HTMLInputElement).value; }} />
            </label>
            <label class="full-width">
              <strong>Task label</strong>
              <span>Exact activity the participant has just completed and must rate. Example: planning a route from A to B using the prototype.</span>
              <input placeholder="planning a route from A to B using the prototype" autocomplete="off" .value=${this.taskLabel} maxlength="160" @input=${(event: Event) => { this.taskLabel = (event.currentTarget as HTMLInputElement).value; }} />
            </label>
          </div>
        </section>

        <section class="panel conductor-panel" aria-labelledby="support-config-heading">
          <h2 id="support-config-heading">2. Prepare the participant questionnaire</h2>
          <p>
            These are the starting settings. The official six dimensions, 0–100 values, fifteen comparisons and scoring do not change.
          </p>
          <div class="config-grid">
            ${this.booleanOption('Show simpler explanations from the start', this.showSimpleLanguage, (value) => { this.showSimpleLanguage = value; })}
            ${this.booleanOption('Use large text from the start', this.largeText, (value) => { this.largeText = value; })}
            ${this.booleanOption('Use automatic spoken guidance from the start', this.audioGuidance, (value) => { this.audioGuidance = value; })}
            ${this.booleanOption('Save incomplete progress on this device', this.recoveryEnabled, (value) => { this.recoveryEnabled = value; })}
            ${this.booleanOption('Allow confirmed built-in voice answers', this.voiceInputAvailable, (value) => { this.voiceInputAvailable = value; })}
            ${this.booleanOption('Allow experimental webcam gaze input', this.gazeInputAvailable, (value) => { this.gazeInputAvailable = value; }, 'Default off because current gaze accuracy is recorded as Partial.')}
            ${this.booleanOption('Show the weighted score to the participant', this.showScoreToParticipant, (value) => { this.showScoreToParticipant = value; }, 'Default off for a study; the conductor receives the score in the export.')}
          </div>

          <fieldset class="answer-mode-control conductor-answer-mode">
            <legend>Participant personalisation policy</legend>
            <label>
              <input
                type="radio"
                name="participant-adjustment-policy"
                value="locked"
                .checked=${this.participantAdjustmentPolicy === 'locked'}
                @change=${() => { this.participantAdjustmentPolicy = 'locked'; }}
              />
              <span>
                <strong>Prepared settings only</strong>
                <small>Use for a controlled measurement condition. The participant can still use any permitted answer route.</small>
              </span>
            </label>
            <label>
              <input
                type="radio"
                name="participant-adjustment-policy"
                value="presentation-only"
                .checked=${this.participantAdjustmentPolicy === 'presentation-only'}
                @change=${() => { this.participantAdjustmentPolicy = 'presentation-only'; }}
              />
              <span>
                <strong>Allow display, audio and recovery preferences</strong>
                <small>
                  The participant may change text size, automatic spoken guidance and interruption recovery. Simpler
                  explanations and the standard/smiley answer presentation remain fixed.
                </small>
              </span>
            </label>
            <label>
              <input
                type="radio"
                name="participant-adjustment-policy"
                value="participant-choice"
                .checked=${this.participantAdjustmentPolicy === 'participant-choice'}
                @change=${() => { this.participantAdjustmentPolicy = 'participant-choice'; }}
              />
              <span>
                <strong>Prepared defaults with optional participant choice</strong>
                <small>
                  Recommended for evaluating the accessibility support. Nothing must be configured before starting; the
                  participant may change optional support, and every change is exported separately from the NASA-TLX answers.
                </small>
              </span>
            </label>
          </fieldset>

          <fieldset class="answer-mode-control conductor-answer-mode">
            <legend>Starting rating presentation</legend>
            <label>
              <input type="radio" name="conductor-answer-mode" value="standard" .checked=${this.answerMode === 'standard'} @change=${() => { this.answerMode = 'standard'; }} />
              <span><strong>Standard 21-point scale</strong><small>Recommended default.</small></span>
            </label>
            <label>
              <input type="radio" name="conductor-answer-mode" value="smiley" .checked=${this.answerMode === 'smiley'} @change=${() => { this.answerMode = 'smiley'; }} />
              <span><strong>Experimental smiley landmarks</strong><small>Use only when this presentation is part of the approved protocol.</small></span>
            </label>
          </fieldset>
        </section>

        <section class="panel conductor-panel" aria-labelledby="collection-heading">
          <h2 id="collection-heading">3. Choose where completed results are collected</h2>
          <fieldset class="answer-mode-control conductor-answer-mode">
            <legend>Result collection route</legend>
            <label>
              <input
                type="radio"
                name="collection-mode"
                value="local"
                .checked=${this.collectionMode === 'local'}
                @change=${() => { this.collectionMode = 'local'; }}
              />
              <span>
                <strong>This browser only</strong>
                <small>Use for development and supervised same-device testing. It does not collect results across devices.</small>
              </span>
            </label>
            <label>
              <input
                type="radio"
                name="collection-mode"
                value="qualtrics"
                .checked=${this.collectionMode === 'qualtrics'}
                @change=${() => { this.collectionMode = 'qualtrics'; }}
              />
              <span>
                <strong>UCL Qualtrics central collection</strong>
                <small>Recommended for an approved remote study that does not collect highly confidential data.</small>
              </span>
            </label>
          </fieldset>
          ${this.collectionMode === 'qualtrics'
            ? html`<label class="full-width">
                <strong>Qualtrics survey or preview URL</strong>
                <span>
                  Paste the HTTPS URL opened by your UCL Qualtrics survey. Only its exact origin is stored in the
                  questionnaire configuration; the survey identifier is not exposed in the result record.
                </span>
                <input
                  placeholder="https://your-ucl-brand.eu.qualtrics.com/jfe/form/SV_..."
                  autocomplete="off"
                  spellcheck="false"
                  .value=${this.qualtricsSurveyUrl}
                  @input=${(event: Event) => { this.qualtricsSurveyUrl = (event.currentTarget as HTMLInputElement).value; }}
                />
              </label>
              <p class="support-boundary">
                Participants must receive the Qualtrics distribution link, not the embedded GitHub page URL. Complete the
                one-question bridge setup and verify a synthetic record in Qualtrics Data &amp; Analysis before recruitment.
              </p>`
            : nothing}
        </section>

        <section class="panel conductor-panel" aria-labelledby="link-heading">
          <h2 id="link-heading">4. Generate the participant configuration</h2>
          <div class="button-row compact">
            <button class="primary-button large-answer-button" type="button" @click=${this.generateParticipantLink}>Generate link</button>
            <label class="file-button secondary-button">
              Import configuration JSON
              <input class="sr-only" type="file" accept="application/json,.json" @change=${this.importConfiguration} />
            </label>
          </div>
          <p class="support-boundary">
            Import only the JSON downloaded from <strong>Configuration ready</strong>. Completed-result JSON is a different
            record type and is not imported here.
          </p>

          ${this.generatedConfig
            ? html`<div class="generated-link" role="region" aria-labelledby="generated-link-heading">
                <h3 id="generated-link-heading">Configuration ready</h3>
                <dl class="study-details">
                  <div><dt>Study ID</dt><dd>${this.generatedConfig.studyId}</dd></div>
                  <div><dt>Configuration ID</dt><dd>${this.generatedConfig.configId}</dd></div>
                  <div><dt>Created</dt><dd>${this.generatedConfig.createdAt}</dd></div>
                </dl>
                <label for="participant-link">
                  <strong>${this.generatedConfig.collection.mode === 'qualtrics'
                    ? 'Participant page URL for the Qualtrics iframe'
                    : 'Participant link'}</strong>
                </label>
                <textarea id="participant-link" readonly rows="5" .value=${this.participantUrl}></textarea>
                <div class="button-row compact">
                  <button class="secondary-button" type="button" @click=${this.copyParticipantLink}>Copy link</button>
                  ${this.generatedConfig.collection.mode === 'local'
                    ? html`<a class="secondary-button link-button" href=${this.participantUrl} target="_blank" rel="noopener">Open participant page</a>`
                    : nothing}
                  <button class="secondary-button" type="button" @click=${this.downloadConfiguration}>Download configuration JSON</button>
                </div>
                ${this.generatedConfig.collection.mode === 'qualtrics'
                  ? this.renderQualtricsSetup()
                  : nothing}
                <p class="support-boundary">
                  Save the JSON with the study protocol. Importing it later regenerates the same configuration ID and participant link.
                  The link contains settings only; it contains no participant name, email or answer.
                </p>
              </div>`
            : nothing}
        </section>

        <section class="panel conductor-panel" aria-labelledby="results-heading">
          <h2 id="results-heading">5. Results saved on this device</h2>
          <p><strong>${this.completedResults.length}</strong> completed record${this.completedResults.length === 1 ? '' : 's'} found in this browser.</p>
          ${this.completedResults.length
            ? html`
                <div class="table-scroll">
                  <table>
                    <thead><tr><th>Study ID</th><th>Participant code</th><th>Completed</th><th>Weighted score</th></tr></thead>
                    <tbody>
                      ${this.completedResults.map((record) => html`<tr>
                        <td>${record.study.studyId}</td>
                        <td>${record.participantCode}</td>
                        <td>${record.timing.completedAt}</td>
                        <td>${record.result.weightedScore.toFixed(2)}</td>
                      </tr>`)}
                    </tbody>
                  </table>
                </div>
                <div class="button-row compact">
                  <button class="primary-button" type="button" @click=${this.exportResultsCsv}>Export all as CSV</button>
                  <button class="secondary-button" type="button" @click=${this.exportResultsJson}>Export all as JSON</button>
                  <button class="danger-button" type="button" @click=${this.eraseResults}>Erase local results</button>
                </div>
                <p class="support-boundary">
                  Verify the exported files and move them through the approved data-management route before erasing the browser copy.
                </p>
              `
            : html`<p>After a configured questionnaire is completed in this same browser, its pseudonymous record will appear here.</p>`}
        </section>

        <section class="panel conductor-panel" aria-labelledby="remote-heading">
          <h2 id="remote-heading">Remote-study boundary</h2>
          <p>
            <strong>Central collection is not configured on this GitHub Pages deployment.</strong> A participant using another
            device will otherwise keep the result in that device's browser. Do not make the participant download and email data
            as the normal study procedure.
          </p>
          <p>
            Version 0.7 includes a tested Qualtrics parent bridge. The participant page sends a complete record only to the
            exact HTTPS origin stored by the conductor; Qualtrics writes the fields into the current response and returns a
            matching receipt before advancing. A failed save leaves the answers on Review for retry. Platform selection,
            consent, retention and access must still match the approved ethics and data-management documents.
          </p>
        </section>
      </main>
    `;
  }

  private booleanOption(label: string, checked: boolean, update: (value: boolean) => void, help = '') {
    return html`<label class="toggle-card conductor-toggle">
      <input type="checkbox" .checked=${checked} @change=${(event: Event) => update((event.currentTarget as HTMLInputElement).checked)} />
      <span><strong>${label}</strong>${help ? html`<small>${help}</small>` : nothing}</span>
    </label>`;
  }

  private currentSupportConfig(): StudySupportConfig {
    return {
      showSimpleLanguage: this.showSimpleLanguage,
      answerMode: this.answerMode,
      largeText: this.largeText,
      audioGuidance: this.audioGuidance,
      recoveryEnabled: this.recoveryEnabled,
      participantAdjustmentPolicy: this.participantAdjustmentPolicy,
      voiceInputAvailable: this.voiceInputAvailable,
      gazeInputAvailable: this.gazeInputAvailable,
    };
  }

  private currentCollectionConfig(): StudyCollectionConfig {
    if (this.collectionMode === 'local') return { mode: 'local' };
    const parentOrigin = normaliseHttpsOrigin(this.qualtricsSurveyUrl);
    if (!parentOrigin) {
      throw new Error('Enter a valid HTTPS Qualtrics survey or preview URL for central collection.');
    }
    if (parentOrigin === window.location.origin) {
      throw new Error('The Qualtrics origin must be different from this GitHub Pages website.');
    }
    return { mode: 'qualtrics', parentOrigin };
  }

  private useConfiguration(config: StudyConfig) {
    this.generatedConfig = config;
    this.studyId = config.studyId;
    this.studyTitle = config.studyTitle;
    this.taskLabel = config.taskLabel;
    this.showScoreToParticipant = config.showScoreToParticipant;
    this.showSimpleLanguage = config.support.showSimpleLanguage;
    this.answerMode = config.support.answerMode;
    this.largeText = config.support.largeText;
    this.audioGuidance = config.support.audioGuidance;
    this.recoveryEnabled = config.support.recoveryEnabled;
    this.participantAdjustmentPolicy = config.support.participantAdjustmentPolicy;
    this.voiceInputAvailable = config.support.voiceInputAvailable;
    this.gazeInputAvailable = config.support.gazeInputAvailable;
    this.collectionMode = config.collection.mode;
    this.qualtricsSurveyUrl = config.collection.mode === 'qualtrics' ? config.collection.parentOrigin : '';
    this.participantUrl = buildParticipantUrl(new URL('index.html', window.location.href).toString(), config);
  }

  private qualtricsIframeHtml() {
    if (!this.generatedConfig || this.generatedConfig.collection.mode !== 'qualtrics') return '';
    return buildQualtricsQuestionHtml(this.participantUrl);
  }

  private renderQualtricsSetup() {
    const questionHtml = this.qualtricsIframeHtml();
    return html`
      <div class="qualtrics-setup" role="region" aria-labelledby="qualtrics-setup-heading">
        <h3 id="qualtrics-setup-heading">Qualtrics installation package for this configuration</h3>
        <aside class="boundary-note important-boundary">
          <p>
            <strong>Do not upload these repository files to Qualtrics and do not paste the static HTML template unchanged.</strong>
            They are four different installation inputs. Only the first block below contains this study's generated
            participant URL.
          </p>
        </aside>
        <ol class="qualtrics-install-steps">
          <li>
            <h4>Text/Graphic question: complete generated HTML</h4>
            <p>
              Add one Text/Graphic question on its own page. Open that question's HTML or source view, replace the
              whole question body with this block, and save it. Do not paste it into the ordinary rich-text view.
            </p>
            <label for="qualtrics-question-html"><strong>Complete question HTML</strong></label>
            <textarea
              id="qualtrics-question-html"
              data-qualtrics-asset="question-html"
              readonly
              rows="10"
              .value=${questionHtml}
            ></textarea>
            <button
              class="secondary-button"
              type="button"
              @click=${() => this.copySetupAsset(questionHtml, 'question HTML')}
            >
              Copy complete question HTML
            </button>
          </li>
          <li>
            <h4>Survey Flow: Embedded Data field names</h4>
            <p>
              Before the NASA-TLX block, add one Embedded Data element. Add every non-empty line below as a separate
              field name, including the <code>__js_</code> prefix, and leave each value unset. This list does not go
              into the question body.
            </p>
            <label for="qualtrics-embedded-fields"><strong>63 Embedded Data field names</strong></label>
            <textarea
              id="qualtrics-embedded-fields"
              data-qualtrics-asset="embedded-data"
              readonly
              rows="10"
              .value=${embeddedDataFields.trim()}
            ></textarea>
            <button
              class="secondary-button"
              type="button"
              @click=${() => this.copySetupAsset(embeddedDataFields.trim(), 'Embedded Data field list')}
            >
              Copy Embedded Data field list
            </button>
          </li>
          <li>
            <h4>Question behavior: JavaScript</h4>
            <p>
              Open JavaScript for the same Text/Graphic question. Replace the sample callback content with this
              complete script and save it. Do not add <code>&lt;script&gt;</code> tags and do not paste it into the
              question HTML.
            </p>
            <label for="qualtrics-question-javascript"><strong>Complete question JavaScript</strong></label>
            <textarea
              id="qualtrics-question-javascript"
              data-qualtrics-asset="question-javascript"
              readonly
              rows="10"
              .value=${qualtricsQuestionJavaScript.trim()}
            ></textarea>
            <button
              class="secondary-button"
              type="button"
              @click=${() => this.copySetupAsset(qualtricsQuestionJavaScript.trim(), 'question JavaScript')}
            >
              Copy complete question JavaScript
            </button>
          </li>
          <li>
            <h4>End of Survey: custom message</h4>
            <p>
              Create or select a custom End of Survey message, paste this as ordinary text, and do not configure a
              redirect. If Survey Flow contains a separate End of Survey element, apply the same message there.
            </p>
            <label for="qualtrics-end-message"><strong>End of Survey message</strong></label>
            <textarea
              id="qualtrics-end-message"
              data-qualtrics-asset="end-message"
              readonly
              rows="8"
              .value=${endOfSurveyMessage.trim()}
            ></textarea>
            <button
              class="secondary-button"
              type="button"
              @click=${() => this.copySetupAsset(endOfSurveyMessage.trim(), 'End of Survey message')}
            >
              Copy End of Survey message
            </button>
          </li>
        </ol>
        <p class="support-boundary">
          The Qualtrics editing canvas may show piped-text tokens such as
          <code>\${e://Field/__js_ANTLX_PARTICIPANT_CODE}</code>. That canvas is not the participant test. In Preview,
          before a response is recorded, the summary must be hidden and the configured participant iframe must be
          visible. If it is not, clear the question body and repeat step 1 in HTML or source view.
        </p>
        <p>
          <a href="docs/QUALTRICS-INTEGRATION.md">Open the full Qualtrics setup and adverse-test guide</a>
        </p>
      </div>
    `;
  }

  private generateParticipantLink = () => {
    this.errorMessage = '';
    try {
      const config = createStudyConfig({
        studyId: this.studyId,
        studyTitle: this.studyTitle,
        taskLabel: this.taskLabel,
        showScoreToParticipant: this.showScoreToParticipant,
        support: this.currentSupportConfig(),
        collection: this.currentCollectionConfig(),
      });
      this.useConfiguration(config);
      this.message = 'Participant link and configuration generated.';
    } catch (error) {
      this.showError(error instanceof Error ? error.message : 'The study configuration could not be generated.');
    }
  };

  private copyParticipantLink = async () => {
    if (!this.participantUrl) return;
    await this.copySetupAsset(this.participantUrl, 'participant link');
  };

  private copySetupAsset = async (value: string, label: string) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable.');
      await navigator.clipboard.writeText(value);
      this.message = `${label.charAt(0).toUpperCase()}${label.slice(1)} copied.`;
    } catch {
      this.message = `Automatic copy was unavailable. Select and copy the ${label} from its text box.`;
    }
  };

  private downloadConfiguration = () => {
    if (!this.generatedConfig) return;
    downloadTextFile(
      `${this.generatedConfig.studyId}-${this.generatedConfig.configId}.json`,
      JSON.stringify(this.generatedConfig, null, 2),
      'application/json',
    );
  };

  private importConfiguration = async (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.errorMessage = '';
    try {
      const candidate = JSON.parse(await file.text()) as unknown;
      if (!isStudyConfig(candidate)) {
        if (looksLikeCompletedResult(candidate)) {
          throw new Error(
            'This is a completed result file, not a study configuration. Import the JSON downloaded from Configuration ready.',
          );
        }
        throw new Error('This is not a valid Version 0.7 study configuration.');
      }
      this.useConfiguration(candidate);
      this.message = 'Configuration imported and participant link regenerated.';
    } catch (error) {
      this.showError(error instanceof Error ? error.message : 'The configuration file could not be read.');
    } finally {
      input.value = '';
    }
  };

  private showError(message: string) {
    this.errorMessage = message;
    void this.updateComplete.then(() => {
      const summary = this.querySelector<HTMLElement>('#conductor-error');
      if (!summary) return;
      summary.focus({ preventScroll: true });
      window.requestAnimationFrame(() => {
        summary.scrollIntoView?.({ behavior: 'auto', block: 'start', inline: 'nearest' });
      });
    });
  }

  private refreshResults = () => {
    this.completedResults = loadCompletedResults();
  };

  private exportResultsJson = () => {
    if (!this.completedResults.length) return;
    downloadTextFile(
      `accessible-nasa-tlx-results-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(this.completedResults, null, 2),
      'application/json',
    );
  };

  private exportResultsCsv = () => {
    if (!this.completedResults.length) return;
    downloadTextFile(
      `accessible-nasa-tlx-results-${new Date().toISOString().slice(0, 10)}.csv`,
      `\uFEFF${resultsToCsv(this.completedResults)}`,
      'text/csv',
    );
  };

  private eraseResults = () => {
    const confirmed = window.confirm(
      'Erase every completed NASA-TLX record stored by this site in this browser? Confirm only after checking the exported files.',
    );
    if (!confirmed) return;
    clearCompletedResults();
    this.refreshResults();
    this.message = 'Local completed records erased.';
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'study-conductor-app': StudyConductorApp;
  }
}
