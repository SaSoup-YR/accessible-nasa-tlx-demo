import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import {
  buildParticipantUrl,
  clearCompletedResults,
  createStudyConfig,
  downloadTextFile,
  isStudyConfig,
  loadCompletedResults,
  resultsToCsv,
  type AnswerMode,
  type StudyConfig,
  type StudyResultRecord,
  type StudySupportConfig,
} from './study';

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
  @state() private allowParticipantChanges = false;
  @state() private voiceInputAvailable = true;
  @state() private gazeInputAvailable = false;
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
          <p class="eyebrow">Study conductor · Version 0.5 candidate</p>
          <h1>Prepare an accessible NASA-TLX study</h1>
          <p class="subtitle">Create one configuration, give participants a prepared link, and export completed records.</p>
        </header>

        <aside class="boundary-note important-boundary">
          <h2>What this page does</h2>
          <p>
            This separates study setup from participant answering. Participants receive a configured questionnaire and do not
            have to set it up themselves. This researcher page generates a separate participant page. Participant adjustments
            are locked by default and should be enabled only when the approved protocol permits them.
          </p>
          <p>
            <strong>Current storage boundary:</strong> completed records stay in this browser on this device until the study conductor
            exports them. GitHub Pages does not provide a research database. Use this local mode only for an approved,
            researcher-controlled same-device procedure. A remote study needs an approved UCL data-collection platform.
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
            ${this.booleanOption('Allow optional participant adjustments after opening the link', this.allowParticipantChanges, (value) => { this.allowParticipantChanges = value; }, 'Default off for a controlled study. Turn on only when the approved protocol allows personalisation; the final settings are recorded.')}
            ${this.booleanOption('Show the weighted score to the participant', this.showScoreToParticipant, (value) => { this.showScoreToParticipant = value; }, 'Default off for a study; the conductor receives the score in the export.')}
          </div>

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

        <section class="panel conductor-panel" aria-labelledby="link-heading">
          <h2 id="link-heading">3. Generate the participant link</h2>
          <div class="button-row compact">
            <button class="primary-button large-answer-button" type="button" @click=${this.generateParticipantLink}>Generate link</button>
            <label class="file-button secondary-button">
              Import saved configuration JSON
              <input class="sr-only" type="file" accept="application/json,.json" @change=${this.importConfiguration} />
            </label>
          </div>

          ${this.generatedConfig
            ? html`<div class="generated-link" role="region" aria-labelledby="generated-link-heading">
                <h3 id="generated-link-heading">Configuration ready</h3>
                <dl class="study-details">
                  <div><dt>Study ID</dt><dd>${this.generatedConfig.studyId}</dd></div>
                  <div><dt>Configuration ID</dt><dd>${this.generatedConfig.configId}</dd></div>
                  <div><dt>Created</dt><dd>${this.generatedConfig.createdAt}</dd></div>
                </dl>
                <label for="participant-link"><strong>Participant link</strong></label>
                <textarea id="participant-link" readonly rows="5" .value=${this.participantUrl}></textarea>
                <div class="button-row compact">
                  <button class="secondary-button" type="button" @click=${this.copyParticipantLink}>Copy link</button>
                  <a class="secondary-button link-button" href=${this.participantUrl} target="_blank" rel="noopener">Open participant page</a>
                  <button class="secondary-button" type="button" @click=${this.downloadConfiguration}>Download configuration JSON</button>
                </div>
                <p class="support-boundary">
                  Save the JSON with the study protocol. Importing it later regenerates the same configuration ID and participant link.
                  The link contains settings only; it contains no participant name, email or answer.
                </p>
              </div>`
            : nothing}
        </section>

        <section class="panel conductor-panel" aria-labelledby="results-heading">
          <h2 id="results-heading">4. Results saved on this device</h2>
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
            A participant using another device would otherwise keep the result in that device's browser. Do not make the participant
            download and email data as the normal study procedure. For remote collection, the host platform should listen for the
            <code>nasa-tlx-complete</code> event and send the versioned result record to the UCL-approved Qualtrics or REDCap workflow
            named in the ethics and data-management documents.
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
      allowParticipantChanges: this.allowParticipantChanges,
      voiceInputAvailable: this.voiceInputAvailable,
      gazeInputAvailable: this.gazeInputAvailable,
    };
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
    this.allowParticipantChanges = config.support.allowParticipantChanges;
    this.voiceInputAvailable = config.support.voiceInputAvailable;
    this.gazeInputAvailable = config.support.gazeInputAvailable;
    this.participantUrl = buildParticipantUrl(new URL('index.html', window.location.href).toString(), config);
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
      });
      this.useConfiguration(config);
      this.message = 'Participant link and configuration generated.';
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'The study configuration could not be generated.';
      void this.updateComplete.then(() => this.querySelector<HTMLElement>('#conductor-error')?.focus());
    }
  };

  private copyParticipantLink = async () => {
    if (!this.participantUrl) return;
    try {
      await navigator.clipboard.writeText(this.participantUrl);
      this.message = 'Participant link copied.';
    } catch {
      this.message = 'Automatic copy was unavailable. Select and copy the link from the text box.';
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
      if (!isStudyConfig(candidate)) throw new Error('This is not a valid Version 0.5 study configuration.');
      this.useConfiguration(candidate);
      this.message = 'Configuration imported and participant link regenerated.';
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'The configuration file could not be read.';
    } finally {
      input.value = '';
    }
  };

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
