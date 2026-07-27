import{a,t as g,i as T,q as A,j as u,u as y,o as b,l as f,w as v,A as d,g as o,x as N,y as w}from"./study-Brf3uNQ9.js";const h=`__js_ANTLX_ACCEPTED
__js_ANTLX_SCHEMA
__js_ANTLX_SUBMISSION_ID
__js_ANTLX_STUDY_ID
__js_ANTLX_CONFIG_ID
__js_ANTLX_PARTICIPANT_CODE
__js_ANTLX_STARTED_AT
__js_ANTLX_COMPLETED_AT
__js_ANTLX_PROTOTYPE_VERSION
__js_ANTLX_COLLECTION_MODE
__js_ANTLX_WEIGHTED_SCORE
__js_ANTLX_RATING_MENTAL
__js_ANTLX_WEIGHT_MENTAL
__js_ANTLX_RATING_PHYSICAL
__js_ANTLX_WEIGHT_PHYSICAL
__js_ANTLX_RATING_TEMPORAL
__js_ANTLX_WEIGHT_TEMPORAL
__js_ANTLX_RATING_PERFORMANCE
__js_ANTLX_WEIGHT_PERFORMANCE
__js_ANTLX_RATING_EFFORT
__js_ANTLX_WEIGHT_EFFORT
__js_ANTLX_RATING_FRUSTRATION
__js_ANTLX_WEIGHT_FRUSTRATION
__js_ANTLX_PAIR_CHOICES_JSON
__js_ANTLX_PAIR_ORDER_JSON
__js_ANTLX_RATING_ROUTES_JSON
__js_ANTLX_PAIR_ROUTES_JSON
__js_ANTLX_CONFIGURED_SUPPORT_JSON
__js_ANTLX_SUPPORT_CHANGE_COUNT
__js_ANTLX_FINAL_SIMPLE_LANGUAGE
__js_ANTLX_FINAL_ANSWER_MODE
__js_ANTLX_FINAL_LARGE_TEXT
__js_ANTLX_FINAL_AUDIO
__js_ANTLX_FINAL_RECOVERY
__js_ANTLX_READ_ALOUD_USED
__js_ANTLX_INTERRUPTION_SUMMARY
__js_ANTLX_GAZE_USED
__js_ANTLX_GAZE_ACTION_COUNT
__js_ANTLX_RAW_CHUNK_COUNT
__js_ANTLX_RAW_01
__js_ANTLX_RAW_02
__js_ANTLX_RAW_03
__js_ANTLX_RAW_04
__js_ANTLX_RAW_05
__js_ANTLX_RAW_06
__js_ANTLX_RAW_07
__js_ANTLX_RAW_08
__js_ANTLX_RAW_09
__js_ANTLX_RAW_10
__js_ANTLX_RAW_11
__js_ANTLX_RAW_12
__js_ANTLX_RAW_13
__js_ANTLX_RAW_14
__js_ANTLX_RAW_15
__js_ANTLX_RAW_16
__js_ANTLX_RAW_17
__js_ANTLX_RAW_18
__js_ANTLX_RAW_19
__js_ANTLX_RAW_20
__js_ANTLX_RAW_21
__js_ANTLX_RAW_22
__js_ANTLX_RAW_23
__js_ANTLX_RAW_24
`,_=`Questionnaire complete

Your weighted NASA-TLX workload score is:
\${e://Field/__js_ANTLX_WEIGHTED_SCORE}/100

Your questionnaire responses have been recorded successfully.

Any accessibility-support choices and input-route information have been saved separately from your workload score.

This score reflects your perceived workload for the task you completed. It is not a measure of your ability or a clinical assessment.

No further action is required.
You may now close this page.
`,m=`/*
 * Accessible NASA-TLX Version 0.7 Qualtrics question bridge.
 *
 * Paste this complete file into the JavaScript editor of the Qualtrics
 * question that contains the iframe from question-html-template.html.
 * Keep the participant prototype on https://sasoup-yr.github.io.
 */
Qualtrics.SurveyEngine.addOnReady(function initialiseAccessibleNasaTlxBridge() {
  var question = this;
  var childOrigin = 'https://sasoup-yr.github.io';
  var submitType = 'accessible-nasa-tlx:qualtrics-submit:v1';
  var receiptType = 'accessible-nasa-tlx:qualtrics-receipt:v1';
  var resizeType = 'accessible-nasa-tlx:qualtrics-resize:v1';
  var iframe = document.getElementById('accessible-nasa-tlx-frame');
  var status = document.getElementById('accessible-nasa-tlx-collection-status');
  var acceptedSubmissionId = null;
  var advancing = false;
  var completionTimerId = null;
  var rawChunkLength = 900;
  var maximumRawChunks = 24;
  // setJSEmbeddedData only writes into the in-browser survey session; the values reach
  // the Qualtrics response when this page is submitted by clickNextButton() below.
  // Everything between the receipt and that submission is a window in which closing the
  // tab loses the response, so this hand-off is kept as short as the receipt round-trip
  // allows rather than being used as a reading pause.
  var completionDelayMs = 1500;

  function setStatus(message) {
    if (status) status.textContent = message;
  }

  function sendReceipt(target, accepted, submissionId, error) {
    target.postMessage({
      type: receiptType,
      accepted: accepted,
      submissionId: submissionId,
      receiptId: accepted ? 'qualtrics-accepted-' + submissionId : undefined,
      error: error || undefined
    }, childOrigin);
  }

  function setField(name, value) {
    Qualtrics.SurveyEngine.setJSEmbeddedData(
      name,
      value === null || value === undefined ? '' : String(value)
    );
  }

  function requireRecord(record) {
    if (!record || typeof record !== 'object') throw new Error('The questionnaire returned an empty record.');
    if (record.schemaVersion !== 3) throw new Error('The questionnaire record version is not supported.');
    if (!record.submissionId || typeof record.submissionId !== 'string') throw new Error('The submission ID is missing.');
    if (!record.study || !record.participantCode || !record.timing || !record.result) {
      throw new Error('The questionnaire record is incomplete.');
    }
    if (!Number.isFinite(record.result.weightedScore)) {
      throw new Error('The weighted NASA-TLX score is missing or invalid.');
    }
    if (!record.responses || !record.responses.ratings || !record.responses.pairwiseChoices) {
      throw new Error('The questionnaire answers are incomplete.');
    }
    if (!record.supportMetadata || !Array.isArray(record.supportMetadata.supportChanges)) {
      throw new Error('The questionnaire support metadata is incomplete.');
    }
  }

  function storeRecord(record) {
    var dimensions = ['mental', 'physical', 'temporal', 'performance', 'effort', 'frustration'];
    var raw = JSON.stringify(record);
    var chunkCount = Math.ceil(raw.length / rawChunkLength);
    if (chunkCount > maximumRawChunks) {
      throw new Error('The questionnaire record is larger than the approved Qualtrics field allocation.');
    }

    setField('ANTLX_ACCEPTED', 1);
    setField('ANTLX_SCHEMA', record.schemaVersion);
    setField('ANTLX_SUBMISSION_ID', record.submissionId);
    setField('ANTLX_STUDY_ID', record.study.studyId);
    setField('ANTLX_CONFIG_ID', record.study.configId);
    setField('ANTLX_PARTICIPANT_CODE', record.participantCode);
    setField('ANTLX_STARTED_AT', record.timing.startedAt);
    setField('ANTLX_COMPLETED_AT', record.timing.completedAt);
    setField('ANTLX_PROTOTYPE_VERSION', record.prototype.version);
    setField('ANTLX_COLLECTION_MODE', record.collection.mode);
    setField('ANTLX_WEIGHTED_SCORE', Number(record.result.weightedScore).toFixed(2));

    dimensions.forEach(function (dimension) {
      setField('ANTLX_RATING_' + dimension.toUpperCase(), record.result.ratings[dimension]);
      setField('ANTLX_WEIGHT_' + dimension.toUpperCase(), record.result.weights[dimension]);
    });

    setField('ANTLX_PAIR_CHOICES_JSON', JSON.stringify(record.responses.pairwiseChoices));
    setField('ANTLX_PAIR_ORDER_JSON', JSON.stringify(record.responses.pairPresentationOrder));
    setField('ANTLX_RATING_ROUTES_JSON', JSON.stringify(record.supportMetadata.ratingInputRoutes));
    setField('ANTLX_PAIR_ROUTES_JSON', JSON.stringify(record.supportMetadata.pairInputRoutes));
    setField('ANTLX_CONFIGURED_SUPPORT_JSON', JSON.stringify(record.configuration));
    setField('ANTLX_SUPPORT_CHANGE_COUNT', record.supportMetadata.supportChanges.length);
    setField('ANTLX_FINAL_SIMPLE_LANGUAGE', record.supportMetadata.simplerExplanationsShownAtSubmission);
    setField('ANTLX_FINAL_ANSWER_MODE', record.supportMetadata.answerModeAtSubmission);
    setField('ANTLX_FINAL_LARGE_TEXT', record.supportMetadata.largeTextUsedAtSubmission);
    setField('ANTLX_FINAL_AUDIO', record.supportMetadata.automaticAudioGuidanceEnabledAtSubmission);
    setField('ANTLX_FINAL_RECOVERY', record.supportMetadata.recoveryEnabledAtSubmission);
    setField('ANTLX_READ_ALOUD_USED', record.supportMetadata.readAloudUsed);
    setField('ANTLX_INTERRUPTION_SUMMARY', record.supportMetadata.interruptionSummaryShown);
    setField('ANTLX_GAZE_USED', record.supportMetadata.gazeUsed);
    setField('ANTLX_GAZE_ACTION_COUNT', record.supportMetadata.gazeActionCount);
    setField('ANTLX_RAW_CHUNK_COUNT', chunkCount);

    for (var index = 0; index < maximumRawChunks; index += 1) {
      var suffix = String(index + 1).padStart(2, '0');
      setField(
        'ANTLX_RAW_' + suffix,
        index < chunkCount ? raw.slice(index * rawChunkLength, (index + 1) * rawChunkLength) : ''
      );
    }
  }

  function receiveResult(event) {
    if (!iframe || event.source !== iframe.contentWindow || event.origin !== childOrigin) return;
    var message = event.data;
    if (message && message.type === resizeType) {
      var requestedHeight = Number(message.height);
      if (Number.isFinite(requestedHeight)) {
        iframe.style.height = Math.max(600, Math.min(10000, Math.ceil(requestedHeight))) + 'px';
      }
      return;
    }
    if (!message || message.type !== submitType) return;
    var submissionId = message.record && message.record.submissionId;

    if (acceptedSubmissionId === submissionId) {
      sendReceipt(event.source, true, submissionId);
      return;
    }
    if (acceptedSubmissionId || advancing) {
      sendReceipt(event.source, false, submissionId || '', 'A different response is already being saved.');
      return;
    }

    try {
      requireRecord(message.record);
      storeRecord(message.record);
      acceptedSubmissionId = message.record.submissionId;
      advancing = true;
      setStatus(
        'Your answers have been accepted and Qualtrics is saving your response now. ' +
        'Please keep this page open until the next page appears by itself.'
      );
      sendReceipt(event.source, true, acceptedSubmissionId);
      completionTimerId = window.setTimeout(function completeAcceptedResponse() {
        completionTimerId = null;
        question.clickNextButton();
      }, completionDelayMs);
    } catch (error) {
      var detail = error && error.message ? error.message : 'Qualtrics could not stage the response.';
      setStatus(
        detail +
        ' Return to the questionnaire and try again. If it keeps failing, use the download' +
        ' button on the questionnaire and tell the study conductor.'
      );
      sendReceipt(event.source, false, submissionId || '', detail);
      // Staging can fail deterministically — an oversized record fails identically on every
      // retry — so the navigation control is restored. Without it the participant is left on
      // a page with no way to submit and no way to advance.
      question.showNextButton();
    }
  }

  if (!iframe || !iframe.contentWindow) {
    setStatus('The Accessible NASA-TLX iframe is missing. The study conductor must correct this Qualtrics question.');
    // Keep the native navigation available on a misconfigured test page instead of
    // trapping the researcher or participant. This path must fail the synthetic
    // preflight and must never be used to collect a participant response.
    question.showNextButton();
    return;
  }

  question.hideNextButton();
  setStatus('The questionnaire will save into this Qualtrics response after submission.');
  window.addEventListener('message', receiveResult);
  Qualtrics.SurveyEngine.addOnUnload(function removeAccessibleNasaTlxListener() {
    if (completionTimerId !== null) {
      window.clearTimeout(completionTimerId);
      completionTimerId = null;
    }
    window.removeEventListener('message', receiveResult);
  });
});
`,L=`<!--
  REFERENCE TEMPLATE ONLY.
  Do not paste this file into Qualtrics unchanged. Use the complete generated
  question HTML from study.html so the iframe has the configured participant URL.
-->
<style>
  #accessible-nasa-tlx-recorded-summary {
    display: none;
    color: #172235;
    font-family: Arial, Helvetica, sans-serif;
    line-height: 1.5;
  }
  #accessible-nasa-tlx-recorded-summary[data-recorded="1"] { display: block !important; }
  #accessible-nasa-tlx-recorded-summary[data-recorded="1"] + #accessible-nasa-tlx-live-question { display: none; }
  #accessible-nasa-tlx-recorded-summary h2,
  #accessible-nasa-tlx-recorded-summary h3 { color: #173f63; }
  #accessible-nasa-tlx-recorded-summary table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 1.25rem;
  }
  #accessible-nasa-tlx-recorded-summary th,
  #accessible-nasa-tlx-recorded-summary td {
    border: 1px solid #9fb2c3;
    padding: 0.5rem;
    text-align: left;
    vertical-align: top;
  }
  #accessible-nasa-tlx-recorded-summary th { background: #edf4f8; }
  #accessible-nasa-tlx-recorded-summary .antlx-long-value {
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }
</style>
<section
  id="accessible-nasa-tlx-recorded-summary"
  data-recorded="\${e://Field/__js_ANTLX_ACCEPTED}"
  aria-labelledby="accessible-nasa-tlx-recorded-summary-heading"
  style="display:none"
>
  <h2 id="accessible-nasa-tlx-recorded-summary-heading">Accessible NASA-TLX recorded response</h2>
  <p>This read-only summary is generated from the values saved in this Qualtrics response.</p>
  <table>
    <caption>Submission details</caption>
    <tbody>
      <tr><th scope="row">Participant code</th><td>\${e://Field/__js_ANTLX_PARTICIPANT_CODE}</td></tr>
      <tr><th scope="row">Study ID</th><td>\${e://Field/__js_ANTLX_STUDY_ID}</td></tr>
      <tr><th scope="row">Submission ID</th><td class="antlx-long-value">\${e://Field/__js_ANTLX_SUBMISSION_ID}</td></tr>
      <tr><th scope="row">Started</th><td>\${e://Field/__js_ANTLX_STARTED_AT}</td></tr>
      <tr><th scope="row">Completed</th><td>\${e://Field/__js_ANTLX_COMPLETED_AT}</td></tr>
      <tr><th scope="row">Weighted workload score</th><td>\${e://Field/__js_ANTLX_WEIGHTED_SCORE}/100</td></tr>
    </tbody>
  </table>
  <h3>Ratings and weights</h3>
  <table>
    <thead><tr><th scope="col">Dimension</th><th scope="col">Rating (0–100)</th><th scope="col">Weight (0–5)</th></tr></thead>
    <tbody>
      <tr><th scope="row">Mental Demand</th><td>\${e://Field/__js_ANTLX_RATING_MENTAL}</td><td>\${e://Field/__js_ANTLX_WEIGHT_MENTAL}</td></tr>
      <tr><th scope="row">Physical Demand</th><td>\${e://Field/__js_ANTLX_RATING_PHYSICAL}</td><td>\${e://Field/__js_ANTLX_WEIGHT_PHYSICAL}</td></tr>
      <tr><th scope="row">Temporal Demand</th><td>\${e://Field/__js_ANTLX_RATING_TEMPORAL}</td><td>\${e://Field/__js_ANTLX_WEIGHT_TEMPORAL}</td></tr>
      <tr><th scope="row">Performance</th><td>\${e://Field/__js_ANTLX_RATING_PERFORMANCE}</td><td>\${e://Field/__js_ANTLX_WEIGHT_PERFORMANCE}</td></tr>
      <tr><th scope="row">Effort</th><td>\${e://Field/__js_ANTLX_RATING_EFFORT}</td><td>\${e://Field/__js_ANTLX_WEIGHT_EFFORT}</td></tr>
      <tr><th scope="row">Frustration</th><td>\${e://Field/__js_ANTLX_RATING_FRUSTRATION}</td><td>\${e://Field/__js_ANTLX_WEIGHT_FRUSTRATION}</td></tr>
    </tbody>
  </table>
  <h3>Pairwise comparisons</h3>
  <p class="antlx-long-value">\${e://Field/__js_ANTLX_PAIR_CHOICES_JSON}</p>
  <h3>Accessibility-support record</h3>
  <table>
    <tbody>
      <tr><th scope="row">Simpler explanations at submission</th><td>\${e://Field/__js_ANTLX_FINAL_SIMPLE_LANGUAGE}</td></tr>
      <tr><th scope="row">Answer presentation at submission</th><td>\${e://Field/__js_ANTLX_FINAL_ANSWER_MODE}</td></tr>
      <tr><th scope="row">Large text at submission</th><td>\${e://Field/__js_ANTLX_FINAL_LARGE_TEXT}</td></tr>
      <tr><th scope="row">Automatic audio at submission</th><td>\${e://Field/__js_ANTLX_FINAL_AUDIO}</td></tr>
      <tr><th scope="row">Recovery at submission</th><td>\${e://Field/__js_ANTLX_FINAL_RECOVERY}</td></tr>
      <tr><th scope="row">Read aloud used</th><td>\${e://Field/__js_ANTLX_READ_ALOUD_USED}</td></tr>
      <tr><th scope="row">Gaze used</th><td>\${e://Field/__js_ANTLX_GAZE_USED}</td></tr>
      <tr><th scope="row">Support changes</th><td>\${e://Field/__js_ANTLX_SUPPORT_CHANGE_COUNT}</td></tr>
    </tbody>
  </table>
  <p><strong>Rating input routes:</strong> <span class="antlx-long-value">\${e://Field/__js_ANTLX_RATING_ROUTES_JSON}</span></p>
  <p><strong>Pair input routes:</strong> <span class="antlx-long-value">\${e://Field/__js_ANTLX_PAIR_ROUTES_JSON}</span></p>
  <p>The CSV or JSON export remains the lossless research record. This section is a readable response/PDF summary.</p>
</section>
<div id="accessible-nasa-tlx-live-question">
  <iframe
    id="accessible-nasa-tlx-frame"
    src="PASTE_THE_GENERATED_PARTICIPANT_PAGE_URL_HERE"
    title="Accessible NASA Task Load Index participant questionnaire"
    allow="camera; microphone"
    style="width:100%;min-height:1200px;border:0"
  ></iframe>
  <p id="accessible-nasa-tlx-collection-status" role="status" aria-live="polite"></p>
</div>
`;var E=Object.defineProperty,S=Object.getOwnPropertyDescriptor,n=(e,t,r,i)=>{for(var l=i>1?void 0:i?S(t,r):t,c=e.length-1,p;c>=0;c--)(p=e[c])&&(l=(i?p(t,r,l):p(l))||l);return i&&l&&E(t,r,l),l};function R(e){const t=Array.isArray(e)?e:[e];return t.length>0&&t.some(r=>{if(!r||typeof r!="object")return!1;const i=r;return"study"in i&&"responses"in i&&"result"in i})}function I(e){const t="PASTE_THE_GENERATED_PARTICIPANT_PAGE_URL_HERE";if(!e||e.includes(t))throw new Error("A generated participant URL is required for the Qualtrics question HTML.");const r=e.replace(/&/g,"&amp;").replace(/"/g,"&quot;");return L.trim().replace(t,r)}let s=class extends T{constructor(){super(...arguments),this.studyId="",this.studyTitle="",this.taskLabel="",this.showScoreToParticipant=!1,this.showSimpleLanguage=!1,this.answerMode="standard",this.largeText=!1,this.audioGuidance=!1,this.recoveryEnabled=!0,this.participantAdjustmentPolicy="participant-choice",this.voiceInputAvailable=!0,this.gazeInputAvailable=!1,this.collectionMode="local",this.qualtricsSurveyUrl="",this.generatedConfig=null,this.participantUrl="",this.message="",this.errorMessage="",this.completedResults=[],this.generateParticipantLink=()=>{this.errorMessage="";try{const e=A({studyId:this.studyId,studyTitle:this.studyTitle,taskLabel:this.taskLabel,showScoreToParticipant:this.showScoreToParticipant,support:this.currentSupportConfig(),collection:this.currentCollectionConfig()});this.useConfiguration(e),this.message="Participant link and configuration generated."}catch(e){this.showError(e instanceof Error?e.message:"The study configuration could not be generated.")}},this.copyParticipantLink=async()=>{this.participantUrl&&await this.copySetupAsset(this.participantUrl,"participant link")},this.copySetupAsset=async(e,t)=>{try{if(!navigator.clipboard?.writeText)throw new Error("Clipboard API unavailable.");await navigator.clipboard.writeText(e),this.message=`${t.charAt(0).toUpperCase()}${t.slice(1)} copied.`}catch{this.message=`Automatic copy was unavailable. Select and copy the ${t} from its text box.`}},this.downloadConfiguration=()=>{this.generatedConfig&&u(`${this.generatedConfig.studyId}-${this.generatedConfig.configId}.json`,JSON.stringify(this.generatedConfig,null,2),"application/json")},this.importConfiguration=async e=>{const t=e.currentTarget,r=t.files?.[0];if(r){this.errorMessage="";try{const i=JSON.parse(await r.text());if(!y(i))throw R(i)?new Error("This is a completed result file, not a study configuration. Import the JSON downloaded from Configuration ready."):new Error("This is not a valid Version 0.7 study configuration.");this.useConfiguration(i),this.message="Configuration imported and participant link regenerated."}catch(i){this.showError(i instanceof Error?i.message:"The configuration file could not be read.")}finally{t.value=""}}},this.refreshResults=()=>{this.completedResults=b()},this.exportResultsJson=()=>{this.completedResults.length&&u(`accessible-nasa-tlx-results-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(this.completedResults,null,2),"application/json")},this.exportResultsCsv=()=>{this.completedResults.length&&u(`accessible-nasa-tlx-results-${new Date().toISOString().slice(0,10)}.csv`,`\uFEFF${f(this.completedResults)}`,"text/csv")},this.eraseResults=()=>{window.confirm("Erase every completed NASA-TLX record stored by this site in this browser? Confirm only after checking the exported files.")&&(v(),this.refreshResults(),this.message="Local completed records erased.")}}connectedCallback(){super.connectedCallback(),this.refreshResults(),window.addEventListener("storage",this.refreshResults)}disconnectedCallback(){window.removeEventListener("storage",this.refreshResults),super.disconnectedCallback()}createRenderRoot(){return this}render(){return o`
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

        ${this.errorMessage?o`<div class="error-summary" role="alert" tabindex="-1" id="conductor-error">
              <h2>There is a problem</h2><p>${this.errorMessage}</p>
            </div>`:d}
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
              <input placeholder="TLX-TECH-01" autocomplete="off" spellcheck="false" .value=${this.studyId} maxlength="64" @input=${e=>{this.studyId=e.currentTarget.value}} />
            </label>
            <label>
              <strong>Study title</strong>
              <span>Participant-facing name of the study. Example: Route-planning workload study.</span>
              <input placeholder="Route-planning workload study" autocomplete="off" .value=${this.studyTitle} maxlength="120" @input=${e=>{this.studyTitle=e.currentTarget.value}} />
            </label>
            <label class="full-width">
              <strong>Task label</strong>
              <span>Exact activity the participant has just completed and must rate. Example: planning a route from A to B using the prototype.</span>
              <input placeholder="planning a route from A to B using the prototype" autocomplete="off" .value=${this.taskLabel} maxlength="160" @input=${e=>{this.taskLabel=e.currentTarget.value}} />
            </label>
          </div>
        </section>

        <section class="panel conductor-panel" aria-labelledby="support-config-heading">
          <h2 id="support-config-heading">2. Prepare the participant questionnaire</h2>
          <p>
            These are the starting settings. The official six dimensions, 0–100 values, fifteen comparisons and scoring do not change.
          </p>
          <div class="config-grid">
            ${this.booleanOption("Show simpler explanations from the start",this.showSimpleLanguage,e=>{this.showSimpleLanguage=e})}
            ${this.booleanOption("Use large text from the start",this.largeText,e=>{this.largeText=e})}
            ${this.booleanOption("Use automatic spoken guidance from the start",this.audioGuidance,e=>{this.audioGuidance=e})}
            ${this.booleanOption("Save incomplete progress on this device",this.recoveryEnabled,e=>{this.recoveryEnabled=e})}
            ${this.booleanOption("Allow confirmed built-in voice answers",this.voiceInputAvailable,e=>{this.voiceInputAvailable=e})}
            ${this.booleanOption("Allow experimental webcam gaze input",this.gazeInputAvailable,e=>{this.gazeInputAvailable=e},"Default off because current gaze accuracy is recorded as Partial.")}
            ${this.booleanOption("Show the weighted score to the participant",this.showScoreToParticipant,e=>{this.showScoreToParticipant=e},"Default off for a study; the conductor receives the score in the export.")}
          </div>

          <fieldset class="answer-mode-control conductor-answer-mode">
            <legend>Participant personalisation policy</legend>
            <label>
              <input
                type="radio"
                name="participant-adjustment-policy"
                value="locked"
                .checked=${this.participantAdjustmentPolicy==="locked"}
                @change=${()=>{this.participantAdjustmentPolicy="locked"}}
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
                .checked=${this.participantAdjustmentPolicy==="presentation-only"}
                @change=${()=>{this.participantAdjustmentPolicy="presentation-only"}}
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
                .checked=${this.participantAdjustmentPolicy==="participant-choice"}
                @change=${()=>{this.participantAdjustmentPolicy="participant-choice"}}
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
              <input type="radio" name="conductor-answer-mode" value="standard" .checked=${this.answerMode==="standard"} @change=${()=>{this.answerMode="standard"}} />
              <span><strong>Standard 21-point scale</strong><small>Recommended default.</small></span>
            </label>
            <label>
              <input type="radio" name="conductor-answer-mode" value="smiley" .checked=${this.answerMode==="smiley"} @change=${()=>{this.answerMode="smiley"}} />
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
                .checked=${this.collectionMode==="local"}
                @change=${()=>{this.collectionMode="local"}}
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
                .checked=${this.collectionMode==="qualtrics"}
                @change=${()=>{this.collectionMode="qualtrics"}}
              />
              <span>
                <strong>UCL Qualtrics central collection</strong>
                <small>Recommended for an approved remote study that does not collect highly confidential data.</small>
              </span>
            </label>
          </fieldset>
          ${this.collectionMode==="qualtrics"?o`<label class="full-width">
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
                  @input=${e=>{this.qualtricsSurveyUrl=e.currentTarget.value}}
                />
              </label>
              <p class="support-boundary">
                Participants must receive the Qualtrics distribution link, not the embedded GitHub page URL. Complete the
                one-question bridge setup and verify a synthetic record in Qualtrics Data &amp; Analysis before recruitment.
              </p>`:d}
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

          ${this.generatedConfig?o`<div class="generated-link" role="region" aria-labelledby="generated-link-heading">
                <h3 id="generated-link-heading">Configuration ready</h3>
                <dl class="study-details">
                  <div><dt>Study ID</dt><dd>${this.generatedConfig.studyId}</dd></div>
                  <div><dt>Configuration ID</dt><dd>${this.generatedConfig.configId}</dd></div>
                  <div><dt>Created</dt><dd>${this.generatedConfig.createdAt}</dd></div>
                </dl>
                <label for="participant-link">
                  <strong>${this.generatedConfig.collection.mode==="qualtrics"?"Participant page URL for the Qualtrics iframe":"Participant link"}</strong>
                </label>
                <textarea id="participant-link" readonly rows="5" .value=${this.participantUrl}></textarea>
                <div class="button-row compact">
                  <button class="secondary-button" type="button" @click=${this.copyParticipantLink}>Copy link</button>
                  ${this.generatedConfig.collection.mode==="local"?o`<a class="secondary-button link-button" href=${this.participantUrl} target="_blank" rel="noopener">Open participant page</a>`:d}
                  <button class="secondary-button" type="button" @click=${this.downloadConfiguration}>Download configuration JSON</button>
                </div>
                ${this.generatedConfig.collection.mode==="qualtrics"?this.renderQualtricsSetup():d}
                <p class="support-boundary">
                  Save the JSON with the study protocol. Importing it later regenerates the same configuration ID and participant link.
                  The link contains settings only; it contains no participant name, email or answer.
                </p>
              </div>`:d}
        </section>

        <section class="panel conductor-panel" aria-labelledby="results-heading">
          <h2 id="results-heading">5. Results saved on this device</h2>
          <p><strong>${this.completedResults.length}</strong> completed record${this.completedResults.length===1?"":"s"} found in this browser.</p>
          ${this.completedResults.length?o`
                <div class="table-scroll">
                  <table>
                    <thead><tr><th>Study ID</th><th>Participant code</th><th>Completed</th><th>Weighted score</th></tr></thead>
                    <tbody>
                      ${this.completedResults.map(e=>o`<tr>
                        <td>${e.study.studyId}</td>
                        <td>${e.participantCode}</td>
                        <td>${e.timing.completedAt}</td>
                        <td>${e.result.weightedScore.toFixed(2)}</td>
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
              `:o`<p>After a configured questionnaire is completed in this same browser, its pseudonymous record will appear here.</p>`}
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
    `}booleanOption(e,t,r,i=""){return o`<label class="toggle-card conductor-toggle">
      <input type="checkbox" .checked=${t} @change=${l=>r(l.currentTarget.checked)} />
      <span><strong>${e}</strong>${i?o`<small>${i}</small>`:d}</span>
    </label>`}currentSupportConfig(){return{showSimpleLanguage:this.showSimpleLanguage,answerMode:this.answerMode,largeText:this.largeText,audioGuidance:this.audioGuidance,recoveryEnabled:this.recoveryEnabled,participantAdjustmentPolicy:this.participantAdjustmentPolicy,voiceInputAvailable:this.voiceInputAvailable,gazeInputAvailable:this.gazeInputAvailable}}currentCollectionConfig(){if(this.collectionMode==="local")return{mode:"local"};const e=N(this.qualtricsSurveyUrl);if(!e)throw new Error("Enter a valid HTTPS Qualtrics survey or preview URL for central collection.");if(e===window.location.origin)throw new Error("The Qualtrics origin must be different from this GitHub Pages website.");return{mode:"qualtrics",parentOrigin:e}}useConfiguration(e){this.generatedConfig=e,this.studyId=e.studyId,this.studyTitle=e.studyTitle,this.taskLabel=e.taskLabel,this.showScoreToParticipant=e.showScoreToParticipant,this.showSimpleLanguage=e.support.showSimpleLanguage,this.answerMode=e.support.answerMode,this.largeText=e.support.largeText,this.audioGuidance=e.support.audioGuidance,this.recoveryEnabled=e.support.recoveryEnabled,this.participantAdjustmentPolicy=e.support.participantAdjustmentPolicy,this.voiceInputAvailable=e.support.voiceInputAvailable,this.gazeInputAvailable=e.support.gazeInputAvailable,this.collectionMode=e.collection.mode,this.qualtricsSurveyUrl=e.collection.mode==="qualtrics"?e.collection.parentOrigin:"",this.participantUrl=w(new URL("index.html",window.location.href).toString(),e)}qualtricsIframeHtml(){return!this.generatedConfig||this.generatedConfig.collection.mode!=="qualtrics"?"":I(this.participantUrl)}renderQualtricsSetup(){const e=this.qualtricsIframeHtml();return o`
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
              .value=${e}
            ></textarea>
            <button
              class="secondary-button"
              type="button"
              @click=${()=>this.copySetupAsset(e,"question HTML")}
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
              .value=${h.trim()}
            ></textarea>
            <button
              class="secondary-button"
              type="button"
              @click=${()=>this.copySetupAsset(h.trim(),"Embedded Data field list")}
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
              .value=${m.trim()}
            ></textarea>
            <button
              class="secondary-button"
              type="button"
              @click=${()=>this.copySetupAsset(m.trim(),"question JavaScript")}
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
              .value=${_.trim()}
            ></textarea>
            <button
              class="secondary-button"
              type="button"
              @click=${()=>this.copySetupAsset(_.trim(),"End of Survey message")}
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
    `}showError(e){this.errorMessage=e,this.updateComplete.then(()=>{const t=this.querySelector("#conductor-error");t&&(t.focus(),t.scrollIntoView?.({block:"start"}))})}};n([a()],s.prototype,"studyId",2);n([a()],s.prototype,"studyTitle",2);n([a()],s.prototype,"taskLabel",2);n([a()],s.prototype,"showScoreToParticipant",2);n([a()],s.prototype,"showSimpleLanguage",2);n([a()],s.prototype,"answerMode",2);n([a()],s.prototype,"largeText",2);n([a()],s.prototype,"audioGuidance",2);n([a()],s.prototype,"recoveryEnabled",2);n([a()],s.prototype,"participantAdjustmentPolicy",2);n([a()],s.prototype,"voiceInputAvailable",2);n([a()],s.prototype,"gazeInputAvailable",2);n([a()],s.prototype,"collectionMode",2);n([a()],s.prototype,"qualtricsSurveyUrl",2);n([a()],s.prototype,"generatedConfig",2);n([a()],s.prototype,"participantUrl",2);n([a()],s.prototype,"message",2);n([a()],s.prototype,"errorMessage",2);n([a()],s.prototype,"completedResults",2);s=n([g("study-conductor-app")],s);
