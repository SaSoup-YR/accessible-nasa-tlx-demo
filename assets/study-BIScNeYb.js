import{a as o,t as h,i as g,m,b as c,n as y,o as b,f,q as v,A as u,h as l,u as w}from"./study-D8YKTcJL.js";var C=Object.defineProperty,k=Object.getOwnPropertyDescriptor,s=(e,i,r,a)=>{for(var n=a>1?void 0:a?k(i,r):i,d=e.length-1,p;d>=0;d--)(p=e[d])&&(n=(a?p(i,r,n):p(n))||n);return a&&n&&C(i,r,n),n};function S(e){const i=Array.isArray(e)?e:[e];return i.length>0&&i.some(r=>{if(!r||typeof r!="object")return!1;const a=r;return"study"in a&&"responses"in a&&"result"in a})}let t=class extends g{constructor(){super(...arguments),this.studyId="",this.studyTitle="",this.taskLabel="",this.showScoreToParticipant=!1,this.showSimpleLanguage=!1,this.answerMode="standard",this.largeText=!1,this.audioGuidance=!1,this.recoveryEnabled=!0,this.allowParticipantChanges=!1,this.voiceInputAvailable=!0,this.gazeInputAvailable=!1,this.generatedConfig=null,this.participantUrl="",this.message="",this.errorMessage="",this.completedResults=[],this.generateParticipantLink=()=>{this.errorMessage="";try{const e=m({studyId:this.studyId,studyTitle:this.studyTitle,taskLabel:this.taskLabel,showScoreToParticipant:this.showScoreToParticipant,support:this.currentSupportConfig()});this.useConfiguration(e),this.message="Participant link and configuration generated."}catch(e){this.showError(e instanceof Error?e.message:"The study configuration could not be generated.")}},this.copyParticipantLink=async()=>{if(this.participantUrl)try{await navigator.clipboard.writeText(this.participantUrl),this.message="Participant link copied."}catch{this.message="Automatic copy was unavailable. Select and copy the link from the text box."}},this.downloadConfiguration=()=>{this.generatedConfig&&c(`${this.generatedConfig.studyId}-${this.generatedConfig.configId}.json`,JSON.stringify(this.generatedConfig,null,2),"application/json")},this.importConfiguration=async e=>{const i=e.currentTarget,r=i.files?.[0];if(r){this.errorMessage="";try{const a=JSON.parse(await r.text());if(!y(a))throw S(a)?new Error("This is a completed result file, not a study configuration. Import the JSON downloaded from Configuration ready."):new Error("This is not a valid Version 0.5 study configuration.");this.useConfiguration(a),this.message="Configuration imported and participant link regenerated."}catch(a){this.showError(a instanceof Error?a.message:"The configuration file could not be read.")}finally{i.value=""}}},this.refreshResults=()=>{this.completedResults=b()},this.exportResultsJson=()=>{this.completedResults.length&&c(`accessible-nasa-tlx-results-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(this.completedResults,null,2),"application/json")},this.exportResultsCsv=()=>{this.completedResults.length&&c(`accessible-nasa-tlx-results-${new Date().toISOString().slice(0,10)}.csv`,`\uFEFF${f(this.completedResults)}`,"text/csv")},this.eraseResults=()=>{window.confirm("Erase every completed NASA-TLX record stored by this site in this browser? Confirm only after checking the exported files.")&&(v(),this.refreshResults(),this.message="Local completed records erased.")}}connectedCallback(){super.connectedCallback(),this.refreshResults(),window.addEventListener("storage",this.refreshResults)}disconnectedCallback(){window.removeEventListener("storage",this.refreshResults),super.disconnectedCallback()}createRenderRoot(){return this}render(){return l`
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

        ${this.errorMessage?l`<div class="error-summary" role="alert" tabindex="-1" id="conductor-error">
              <h2>There is a problem</h2><p>${this.errorMessage}</p>
            </div>`:u}
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
            ${this.booleanOption("Allow optional participant adjustments after opening the link",this.allowParticipantChanges,e=>{this.allowParticipantChanges=e},"Default off for a controlled study. Turn on only when the approved protocol allows personalisation; the final settings are recorded.")}
            ${this.booleanOption("Show the weighted score to the participant",this.showScoreToParticipant,e=>{this.showScoreToParticipant=e},"Default off for a study; the conductor receives the score in the export.")}
          </div>

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

        <section class="panel conductor-panel" aria-labelledby="link-heading">
          <h2 id="link-heading">3. Generate the participant link</h2>
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

          ${this.generatedConfig?l`<div class="generated-link" role="region" aria-labelledby="generated-link-heading">
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
              </div>`:u}
        </section>

        <section class="panel conductor-panel" aria-labelledby="results-heading">
          <h2 id="results-heading">4. Results saved on this device</h2>
          <p><strong>${this.completedResults.length}</strong> completed record${this.completedResults.length===1?"":"s"} found in this browser.</p>
          ${this.completedResults.length?l`
                <div class="table-scroll">
                  <table>
                    <thead><tr><th>Study ID</th><th>Participant code</th><th>Completed</th><th>Weighted score</th></tr></thead>
                    <tbody>
                      ${this.completedResults.map(e=>l`<tr>
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
              `:l`<p>After a configured questionnaire is completed in this same browser, its pseudonymous record will appear here.</p>`}
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
    `}booleanOption(e,i,r,a=""){return l`<label class="toggle-card conductor-toggle">
      <input type="checkbox" .checked=${i} @change=${n=>r(n.currentTarget.checked)} />
      <span><strong>${e}</strong>${a?l`<small>${a}</small>`:u}</span>
    </label>`}currentSupportConfig(){return{showSimpleLanguage:this.showSimpleLanguage,answerMode:this.answerMode,largeText:this.largeText,audioGuidance:this.audioGuidance,recoveryEnabled:this.recoveryEnabled,allowParticipantChanges:this.allowParticipantChanges,voiceInputAvailable:this.voiceInputAvailable,gazeInputAvailable:this.gazeInputAvailable}}useConfiguration(e){this.generatedConfig=e,this.studyId=e.studyId,this.studyTitle=e.studyTitle,this.taskLabel=e.taskLabel,this.showScoreToParticipant=e.showScoreToParticipant,this.showSimpleLanguage=e.support.showSimpleLanguage,this.answerMode=e.support.answerMode,this.largeText=e.support.largeText,this.audioGuidance=e.support.audioGuidance,this.recoveryEnabled=e.support.recoveryEnabled,this.allowParticipantChanges=e.support.allowParticipantChanges,this.voiceInputAvailable=e.support.voiceInputAvailable,this.gazeInputAvailable=e.support.gazeInputAvailable,this.participantUrl=w(new URL("index.html",window.location.href).toString(),e)}showError(e){this.errorMessage=e,this.updateComplete.then(()=>{const i=this.querySelector("#conductor-error");i&&(i.focus(),i.scrollIntoView?.({block:"start"}))})}};s([o()],t.prototype,"studyId",2);s([o()],t.prototype,"studyTitle",2);s([o()],t.prototype,"taskLabel",2);s([o()],t.prototype,"showScoreToParticipant",2);s([o()],t.prototype,"showSimpleLanguage",2);s([o()],t.prototype,"answerMode",2);s([o()],t.prototype,"largeText",2);s([o()],t.prototype,"audioGuidance",2);s([o()],t.prototype,"recoveryEnabled",2);s([o()],t.prototype,"allowParticipantChanges",2);s([o()],t.prototype,"voiceInputAvailable",2);s([o()],t.prototype,"gazeInputAvailable",2);s([o()],t.prototype,"generatedConfig",2);s([o()],t.prototype,"participantUrl",2);s([o()],t.prototype,"message",2);s([o()],t.prototype,"errorMessage",2);s([o()],t.prototype,"completedResults",2);t=s([h("study-conductor-app")],t);
