import{r as E,a as l,t as M,i as G,v as S,d as g,c as L,b as O,s as V,e as x,f as k,g as q,h as A,j as N,A as c,k as r,l as m,p as z,P as D,m as B}from"./study-z5_sWaHR.js";const H="accessible-nasa-tlx:qualtrics-submit:v1",j="accessible-nasa-tlx:qualtrics-receipt:v1",U="accessible-nasa-tlx:qualtrics-resize:v1";function F(e=window){const t=e.accessibleNasaTlxResultSink;return!t||typeof t.name!="string"||!t.name.trim()||typeof t.submit!="function"?null:t}function W(e,t=window){if(e.collection.mode!=="qualtrics")return null;const s=Q(e.collection.parentOrigin,t);return t.accessibleNasaTlxResultSink=s,_(e.collection.parentOrigin,t),s}function _(e,t=window){const s=t.ResizeObserver;if(t.parent===t||typeof s!="function")return null;const i=()=>{const d=t.document.documentElement,u=t.document.body,h=Math.ceil(Math.max(d?.scrollHeight??0,d?.offsetHeight??0,u?.scrollHeight??0,u?.offsetHeight??0));h>0&&t.parent.postMessage({type:U,height:h},e)},a=new s(i);return t.document.documentElement&&a.observe(t.document.documentElement),t.document.body&&a.observe(t.document.body),t.requestAnimationFrame(i),a}function Q(e,t=window,s=12e3){return{name:"UCL Qualtrics",submit(i){return t.parent===t?Promise.reject(new Error("This centrally collected questionnaire must be opened through its Qualtrics survey.")):new Promise((a,d)=>{let u=!1;const h=v=>{u||(u=!0,t.clearTimeout(f),t.removeEventListener("message",p),v())},p=v=>{if(v.source!==t.parent||v.origin!==e)return;const b=v.data;if(!(!b||b.type!==j||b.submissionId!==i.submissionId)){if(b.accepted!==!0){h(()=>d(new Error(typeof b.error=="string"&&b.error?b.error:"Qualtrics did not accept the response.")));return}h(()=>a({accepted:!0,submissionId:i.submissionId,receiptId:typeof b.receiptId=="string"?b.receiptId:void 0}))}},f=t.setTimeout(()=>{h(()=>d(new Error("Qualtrics did not acknowledge the response in time.")))},s);t.addEventListener("message",p),t.parent.postMessage({type:H,record:i},e)})}}}async function Y(e,t,s=15e3){let i;const a=new Promise((u,h)=>{i=setTimeout(()=>h(new Error("The study platform did not confirm receipt in time.")),s)});let d;try{d=await Promise.race([t.submit(e),a])}finally{i!==void 0&&clearTimeout(i)}if(!d||d.accepted!==!0||d.submissionId!==e.submissionId||d.receiptId!==void 0&&typeof d.receiptId!="string")throw new Error("The study platform returned an invalid submission receipt.");return d}const J=new Map([["zero",0],["five",5],["ten",10],["fifteen",15],["twenty",20],["twenty five",25],["thirty",30],["thirty five",35],["forty",40],["forty five",45],["fifty",50],["fifty five",55],["sixty",60],["sixty five",65],["seventy",70],["seventy five",75],["eighty",80],["eighty five",85],["ninety",90],["ninety five",95],["one hundred",100],["hundred",100]]),K={mental:["mental demand","mental"],physical:["physical demand","physical"],temporal:["temporal demand","temporal","time pressure"],performance:["performance"],effort:["effort"],frustration:["frustration"]};function T(e){return e.toLowerCase().replace(/[-–—]/g," ").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim()}function X(e,t){const s=T(e),i=s.match(/(?:^|\s)(100|[0-9]{1,2})(?:\s|$)/);if(i){const a=Number(i[1]);if(E.includes(a))return a}for(const[a,d]of[...J].sort((u,h)=>h[0].length-u[0].length))if(s===a||s.includes(` ${a} `)||s.startsWith(`${a} `)||s.endsWith(` ${a}`))return d;if(/\b(middle|midpoint|centre|center)\b/.test(s))return 50;if(t.id==="performance"){if(/\b(good|successful)\b/.test(s))return 0;if(/\b(poor|bad|unsuccessful)\b/.test(s))return 100}else{if(/\blow\b/.test(s))return 0;if(/\bhigh\b/.test(s))return 100}return null}function Z(e,t){const s=T(e),i=t.filter(a=>K[a].some(d=>s===d||s.includes(d)));return i.length===1?i[0]:null}const C="3.5.3",ee=`https://cdn.jsdelivr.net/npm/webgazer@${C}/dist/webgazer.js`,te=`https://cdn.jsdelivr.net/npm/webgazer@${C}/dist/mediapipe/face_mesh`,se="sha384-N9TfYQEjUGiaDcITkzB/MtVHEfF2JtTWCwHG8NUhjOSvJ8zObGwfebHUFLBS+4Rb";let w=null;function I(e){return e.protocol==="https:"||e.hostname==="localhost"||e.hostname==="127.0.0.1"}function ie(e=document){return window.webgazer?Promise.resolve(window.webgazer):w||(w=new Promise((t,s)=>{const i=e.querySelector("#webgazer-loader"),a=i??e.createElement("script"),d=()=>{window.webgazer?t(window.webgazer):s(new Error("WebGazer loaded without exposing its browser API."))};a.addEventListener("load",d,{once:!0}),a.addEventListener("error",()=>{a.remove(),s(new Error("WebGazer could not be downloaded. Check the connection and content-blocking settings."))},{once:!0}),i||(a.id="webgazer-loader",a.src=ee,a.integrity=se,a.crossOrigin="anonymous",a.referrerPolicy="no-referrer",e.head.append(a))}).catch(t=>{throw w=null,t}),w)}class R{constructor(t){this.durationMs=t,this.key=null,this.startedAt=0}update(t,s){if(!t)return this.reset(),{progress:0,activated:!1};if(t!==this.key)return this.key=t,this.startedAt=s,{progress:0,activated:!1};const i=Math.min(1,Math.max(0,(s-this.startedAt)/this.durationMs));return i>=1?(this.reset(),{progress:1,activated:!0}):{progress:i,activated:!1}}reset(){this.key=null,this.startedAt=0}}var ae=Object.defineProperty,re=Object.getOwnPropertyDescriptor,o=(e,t,s,i)=>{for(var a=i>1?void 0:i?re(t,s):t,d=e.length-1,u;d>=0;d--)(u=e[d])&&(a=(i?u(t,s,a):u(a))||a);return i&&a&&ae(t,s,a),a};const $=[{x:12,y:12},{x:50,y:12},{x:88,y:12},{x:12,y:50},{x:50,y:50},{x:88,y:50},{x:12,y:88},{x:50,y:88},{x:88,y:88}],y=3;function P(){const e=[...z];for(let t=e.length-1;t>0;t-=1){const s=Math.floor(Math.random()*(t+1));[e[t],e[s]]=[e[s],e[t]]}return e}let n=class extends G{constructor(){super(...arguments),this.stage="intro",this.ratingIndex=0,this.pairIndex=0,this.pairOrder=P(),this.pairResponses={},this.ratings={},this.ratingInputRoutes={},this.pairInputRoutes={},this.supportChanges=[],this.answerMode="standard",this.showSimpleLanguage=!1,this.largeText=!1,this.recoveryEnabled=!1,this.resumeSummaryVisible=!1,this.savedSession=null,this.readingAloud=!1,this.readAloudUsed=!1,this.audioGuidance=!1,this.audioStatusMessage="",this.interruptionSummaryShown=!1,this.voiceState="idle",this.voiceMessage="",this.pendingVoiceAnswer=null,this.errorMessage="",this.statusMessage="",this.result=null,this.gazeState="off",this.gazeMessage="",this.gazeCalibrationIndex=0,this.gazeCalibrationRepetition=0,this.gazePendingLabel="",this.gazeDwellProgress=0,this.gazeUsed=!1,this.gazeActionCount=0,this.studyConfig=null,this.configurationError="",this.participantCode="",this.participantCodeError="",this.startedAt="",this.submittedRecord=null,this.completionSavedLocally=!1,this.completionSavedByHost=!1,this.hostSinkName="",this.hostReceipt=null,this.submittingResult=!1,this.hiddenAt=null,this.recognition=null,this.webgazer=null,this.gazeCandidateElement=null,this.gazePendingElement=null,this.gazeActivationInProgress=!1,this.speechRequestId=0,this.configurationApplied=!1,this.gazeCandidateTracker=new R(1e3),this.gazeConfirmationTracker=new R(1200),this.setParticipantCode=e=>{this.participantCode=e.currentTarget.value.trim(),this.participantCodeError=this.participantCode&&!S(this.participantCode)?"Use 1–32 letters, numbers, hyphens or underscores, starting with a letter or number.":"",this.savedSession=null,S(this.participantCode)&&this.findSavedSession()},this.setAudioGuidance=e=>{const t=e.currentTarget.checked;this.recordSupportChange("automatic-audio",this.audioGuidance,t),this.audioGuidance=t,this.invalidatePendingSubmission(),this.audioGuidance?this.speakText("Built-in audio guidance is on. New questions and selected answers will be spoken."):this.stopReading(),this.persistProgress()},this.startQuestionnaire=()=>{if(this.configurationError){this.showError(this.configurationError);return}if(this.studyConfig&&(this.participantCode=this.participantCode.trim(),!S(this.participantCode))){this.participantCodeError="Enter the valid pseudonymous participant code supplied by the study conductor.",this.showError(this.participantCodeError);return}this.startedAt=new Date().toISOString(),this.stage="ratings",this.ratingIndex=0,this.clearError(),this.persistProgress(),this.focusHeading()},this.goBack=()=>{this.stopReading(),this.clearVoiceAnswer(),this.stage==="ratings"&&this.ratingIndex>0?this.ratingIndex-=1:this.stage==="pairs"&&(this.pairIndex>0?this.pairIndex-=1:(this.stage="ratings",this.ratingIndex=g.length-1)),this.clearError(),this.persistProgress(),this.focusHeading()},this.returnToRatings=()=>{this.invalidatePendingSubmission(),this.stage="ratings",this.ratingIndex=g.length-1,this.persistProgress(),this.focusHeading()},this.returnToPairs=()=>{this.invalidatePendingSubmission(),this.stage="pairs",this.pairIndex=this.pairOrder.length-1,this.persistProgress(),this.focusHeading()},this.submitResponses=async()=>{if(!this.submittingResult)try{(!this.result||!this.submittedRecord)&&(this.result=L(this.pairOrder,this.pairResponses,this.ratings),this.submittedRecord=O({config:this.effectiveStudyConfig(),participantCode:this.studyConfig?this.participantCode:"DEMO",startedAt:this.startedAt||new Date().toISOString(),pairPresentationOrder:this.pairOrder.map(({id:t})=>t),pairwiseChoices:this.pairResponses,result:this.result,supportMetadata:this.currentSupportMetadata()}));const e=this.studyConfig?F():null;if(this.completionSavedLocally=!1,this.completionSavedByHost=!1,this.hostSinkName="",this.hostReceipt=null,e){this.submittingResult=!0,this.statusMessage=`Submitting responses to ${e.name}.`;try{this.hostReceipt=await Y(this.submittedRecord,e),this.completionSavedByHost=!0,this.hostSinkName=e.name}catch(t){const s=t instanceof Error?t.message:"The study platform did not accept the response.";this.showError(`${s} Your answers remain on this page. Try submitting again or ask the study conductor for help.`);return}finally{this.submittingResult=!1}}else this.completionSavedLocally=this.studyConfig?V(this.submittedRecord):!1;this.dispatchEvent(new CustomEvent("nasa-tlx-complete",{detail:this.submittedRecord,bubbles:!0,composed:!0})),this.stage="complete",this.clearSavedProgress(),this.stopGazeInput(),this.clearError(),this.focusHeading()}catch(e){this.submittingResult=!1,this.showError(e instanceof Error?e.message:"Responses could not be calculated.")}},this.downloadResultJson=()=>{this.submittedRecord&&x(`${k(this.submittedRecord)}.json`,JSON.stringify(this.submittedRecord,null,2),"application/json")},this.downloadResultCsv=()=>{this.submittedRecord&&x(`${k(this.submittedRecord)}.csv`,`\uFEFF${q([this.submittedRecord])}`,"text/csv")},this.restart=()=>{this.stopReading(!1),this.stopGazeInput(),this.releaseRecognition(),this.clearSavedProgress(),this.stage="intro",this.ratingIndex=0,this.pairIndex=0,this.pairOrder=P(),this.pairResponses={},this.ratings={},this.ratingInputRoutes={},this.pairInputRoutes={},this.supportChanges=[],this.resumeSummaryVisible=!1,this.savedSession=null,this.result=null,this.submittedRecord=null,this.completionSavedLocally=!1,this.completionSavedByHost=!1,this.hostSinkName="",this.hostReceipt=null,this.submittingResult=!1,this.startedAt="",this.participantCodeError="",this.studyConfig&&(this.participantCode=""),this.errorMessage="",this.voiceState="idle",this.pendingVoiceAnswer=null,this.audioGuidance=!1,this.audioStatusMessage="",this.gazeUsed=!1,this.gazeActionCount=0,this.applyConfiguredSupport(),this.statusMessage="A new questionnaire has started.",window.scrollTo({top:0,behavior:"smooth"})},this.toggleReadAloud=()=>{if(this.readingAloud){this.stopReading(!0);return}this.speakText(this.currentStepSpeech())},this.startGazeInput=async()=>{if(!I(window.location)){this.gazeState="error",this.gazeMessage="Gaze input requires an HTTPS-hosted page or localhost.";return}this.gazeState="loading",this.gazeMessage="Loading the pinned WebGazer library. Webcam permission will be requested next.";try{const e=await ie();if(!e.detectCompatibility())throw new Error("This browser does not expose a compatible webcam API.");this.webgazer=e,e.params.faceMeshSolutionPath=te,e.saveDataAcrossSessions(!1),await e.clearData(),e.showVideoPreview(!0),e.showFaceOverlay(!0),e.showFaceFeedbackBox(!0),e.showPredictionPoints(!1),e.setGazeListener(t=>this.handleGazePoint(t)),await e.begin(),e.removeMouseEventListeners(),await this.showGazePositioningStep("Camera started. Position your face, then continue to calibration.")}catch(e){this.gazeState="error",this.gazeMessage=e instanceof Error?`Gaze setup did not start: ${e.message}`:"Gaze setup did not start. Use another answer route.",this.releaseGazeResources()}},this.restartGazeCalibration=async()=>{this.webgazer&&(this.cancelGazeProposal(),await this.webgazer.clearData(),await this.showGazePositioningStep("Recalibration started. Check your position before continuing."))},this.beginGazeCalibration=()=>{this.webgazer&&(this.restoreWebGazerPreviewContainer(),this.webgazer.showVideoPreview(!1),this.webgazer.showFaceOverlay(!1),this.webgazer.showFaceFeedbackBox(!1),this.webgazer.showPredictionPoints(!1),this.gazeCalibrationIndex=0,this.gazeCalibrationRepetition=0,this.gazeState="calibrating",this.gazeMessage="Camera preview hidden. Complete all 27 calibration samples.",this.updateComplete.then(()=>this.querySelector(".calibration-point")?.focus()))},this.recordCalibrationPoint=e=>{if(!this.webgazer||this.gazeState!=="calibrating")return;const t=e.currentTarget.getBoundingClientRect();if(this.webgazer.recordScreenPosition(t.left+t.width/2,t.top+t.height/2,"click"),this.gazeCalibrationRepetition<y-1){this.gazeCalibrationRepetition+=1;return}if(this.gazeCalibrationIndex<$.length-1){this.gazeCalibrationIndex+=1,this.gazeCalibrationRepetition=0;return}this.gazeCalibrationRepetition=y,this.gazeState="ready",this.gazeUsed=!0,this.gazeMessage="Calibration complete. A red gaze dot is visible. Look at a large answer or navigation control for one second.",this.webgazer.showVideoPreview(!1),this.webgazer.showFaceOverlay(!1),this.webgazer.showFaceFeedbackBox(!1),this.webgazer.showPredictionPoints(!0),this.statusMessage="Gaze-assisted answering is ready."},this.confirmGazeProposal=()=>{const e=this.gazePendingElement;if(!e)return;const t=this.gazePendingLabel;this.gazePendingElement=null,this.gazePendingLabel="",this.gazeDwellProgress=0,this.gazeConfirmationTracker.reset(),this.gazeActivationInProgress=!0;try{e.click(),this.gazeActionCount+=1,this.gazeUsed=!0,this.statusMessage=`${t} activated by confirmed gaze.`}finally{this.gazeActivationInProgress=!1}},this.cancelGazeProposal=()=>{this.gazePendingElement=null,this.gazePendingLabel="",this.gazeDwellProgress=0,this.gazeConfirmationTracker.reset(),this.statusMessage="Gaze proposal cancelled."},this.stopGazeInput=()=>{this.cancelGazeProposal(),this.resetGazeHover(),this.restoreWebGazerPreviewContainer(),this.releaseGazeResources(),this.gazeState="off",this.gazeMessage="Gaze input and camera stopped."},this.confirmVoiceAnswer=()=>{const e=this.pendingVoiceAnswer;if(!e)return;let t="";if(e.context==="rating"){const s=g[this.ratingIndex],i=e.value;this.selectRating(s.id,i,"voice"),t=this.answerMode==="smiley"&&A.some(d=>d.value===i)?`smiley-${s.id}-${i}`:`rating-${s.id}-${i}`}else{const s=this.pairOrder[this.pairIndex],i=e.value;this.selectPair(s.id,i,"voice"),t=`${s.id}-${i}`}this.voiceState="idle",this.voiceMessage="",this.pendingVoiceAnswer=null,this.updateComplete.then(()=>this.querySelector(`#${t}`)?.focus())},this.clearVoiceAnswer=()=>{this.releaseRecognition(),this.voiceState="idle",this.voiceMessage="",this.pendingVoiceAnswer=null},this.handleVisibilityChange=()=>{if(document.hidden){this.hiddenAt=Date.now();return}this.hiddenAt&&this.recoveryEnabled&&this.isInProgress()&&(this.resumeSummaryVisible=!0,this.interruptionSummaryShown=!0,this.statusMessage="Welcome back. A summary of your saved position is available.",this.updateComplete.then(()=>this.querySelector("#resume-heading")?.focus())),this.hiddenAt=null},this.dismissResumeSummary=()=>{this.resumeSummaryVisible=!1,this.statusMessage=`Continuing at ${this.currentPositionDescription()}.`,this.focusHeading()},this.restoreSavedSession=()=>{const e=this.savedSession;e&&(this.stage=e.stage,this.ratingIndex=e.ratingIndex,this.pairIndex=e.pairIndex,this.pairOrder=e.pairOrder,this.pairResponses=e.pairResponses,this.ratings=e.ratings,this.ratingInputRoutes=e.ratingInputRoutes,this.pairInputRoutes=e.pairInputRoutes,this.supportChanges=e.supportChanges,this.startedAt=e.startedAt,this.canAdjustAllSupport?(this.answerMode=e.support.answerMode,this.showSimpleLanguage=e.support.showSimpleLanguage,this.largeText=e.support.largeText,this.audioGuidance=!!e.support.audioGuidance):(this.applyConfiguredSupport(),this.canAdjustPresentationSupport&&(this.largeText=e.support.largeText,this.audioGuidance=!!e.support.audioGuidance)),this.recoveryEnabled=!0,this.savedSession=null,this.resumeSummaryVisible=!0,this.interruptionSummaryShown=!0,this.updateComplete.then(()=>this.querySelector("#resume-heading")?.focus()))},this.eraseSavedSession=()=>{this.clearSavedProgress(),this.savedSession=null,this.statusMessage="Saved answers erased."}}connectedCallback(){super.connectedCallback(),this.loadStudyConfiguration(),document.addEventListener("visibilitychange",this.handleVisibilityChange),queueMicrotask(()=>this.findSavedSession())}disconnectedCallback(){document.removeEventListener("visibilitychange",this.handleVisibilityChange),this.stopReading(!1),this.releaseRecognition(),this.stopGazeInput(),super.disconnectedCallback()}createRenderRoot(){return this}loadStudyConfiguration(){if(this.configurationApplied)return;this.configurationApplied=!0;const e=new URLSearchParams(window.location.hash.startsWith("#")?window.location.hash.slice(1):window.location.hash),t=N(window.location.hash);if(e.has("study")&&!t){this.configurationError="This participant link contains an invalid or incompatible study configuration. Ask the study conductor for a new link.";return}if(t&&(this.studyConfig=t,this.applyConfiguredSupport(),t.collection.mode==="qualtrics")){if(window.parent===window){this.configurationError="This centrally collected questionnaire must be opened from the approved Qualtrics survey link. Ask the study conductor for that link.";return}if(document.referrer)try{if(new URL(document.referrer).origin!==t.collection.parentOrigin){this.configurationError="This questionnaire was embedded by an unexpected website. Ask the study conductor for the approved Qualtrics survey link.";return}}catch{this.configurationError="The embedding website could not be verified. Ask the study conductor for the approved Qualtrics survey link.";return}W(t)}}applyConfiguredSupport(){const e=this.studyConfig?.support;e&&(this.showSimpleLanguage=e.showSimpleLanguage,this.answerMode=e.answerMode,this.largeText=e.largeText,this.audioGuidance=e.audioGuidance,this.recoveryEnabled=e.recoveryEnabled)}get canAdjustAllSupport(){return!this.studyConfig||this.studyConfig.support.participantAdjustmentPolicy==="participant-choice"}get canAdjustPresentationSupport(){return!this.studyConfig||this.studyConfig.support.participantAdjustmentPolicy==="presentation-only"||this.studyConfig.support.participantAdjustmentPolicy==="participant-choice"}get voiceInputAvailable(){return!this.studyConfig||this.studyConfig.support.voiceInputAvailable}get gazeInputAvailable(){return!this.studyConfig||this.studyConfig.support.gazeInputAvailable}render(){return r`
      <a class="skip-link" href="#question-panel">Skip to the current question</a>
      <main class=${`app-shell${this.largeText?" large-text":""}`} id="main-content">
        <p class="sr-only" aria-live="polite" aria-atomic="true">${this.statusMessage}</p>
        <header class="app-header">
          <p class="eyebrow">Research prototype · Version 0.7 release candidate</p>
          <h1>NASA Task Load Index</h1>
          <p class="subtitle">Weighted NASA-TLX with configurable reading, answering and recovery support</p>
        </header>

        ${this.resumeSummaryVisible?this.renderResumeSummary():c}
        ${this.stage!=="intro"&&this.stage!=="complete"?this.renderProgress():c}
        ${this.stage!=="intro"&&this.stage!=="complete"?this.renderInQuestionSupport():c}
        ${this.gazePendingElement?this.renderGazeConfirmation():c}
        ${this.errorMessage?r`<div class="error-summary" role="alert" tabindex="-1" id="error-summary">
              <h2>There is a problem</h2>
              <p>${this.errorMessage}</p>
            </div>`:c}

        ${this.renderStage()}
      </main>
      ${this.gazeState==="positioning"?this.renderGazePositioning():c}
      ${this.gazeState==="calibrating"?this.renderGazeCalibration():c}
    `}renderInQuestionSupport(){return r`
      ${this.studyConfig?this.canAdjustAllSupport?r`<details class="support-toolbar">
              <summary>Adjust accessibility support (optional)</summary>
              <p>
                The study conductor has already prepared usable starting settings. You may change optional support if it
                helps you complete the questionnaire; every change is recorded separately from your NASA-TLX answers.
              </p>
              ${this.renderSupportSettings("toolbar","all")}
            </details>`:this.canAdjustPresentationSupport?r`<details class="support-toolbar">
              <summary>Adjust display, audio or recovery (optional)</summary>
              <p>
                The study answer presentation and simpler-explanation setting remain fixed. You do not need to
                change these optional preferences to continue.
              </p>
              ${this.renderSupportSettings("toolbar","presentation-only")}
            </details>`:this.renderConfiguredSupportSummary():r`<details class="support-toolbar">
            <summary>Adjust accessibility support (optional)</summary>
            ${this.renderSupportSettings("toolbar","all")}
          </details>`}
      ${this.renderReadAloudControl()}
      ${this.renderGazeSetup()}
    `}renderStage(){switch(this.stage){case"intro":return this.renderIntro();case"ratings":return this.renderRating();case"pairs":return this.renderPair();case"review":return this.renderReview();case"complete":return this.renderComplete()}}renderIntro(){return r`
      <section class="panel" id="question-panel" aria-labelledby="intro-heading">
        <h2 id="intro-heading">Before you begin</h2>
        ${this.configurationError?r`<div class="error-summary" role="alert"><h3>Study link problem</h3><p>${this.configurationError}</p></div>`:c}
        ${this.renderStudyContext()}
        ${this.savedSession?this.renderSavedSessionOffer():c}
        <p>
          Think about ${this.studyConfig?r`the task: <strong>${this.studyConfig.taskLabel}</strong>`:"one task that you have just completed"}.
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
          ${g.map(e=>r`
              <div class="reference-item">
                <h3>${e.name}</h3>
                <p>${e.officialDefinition}</p>
              </div>
            `)}
        </details>

        ${this.studyConfig?this.renderConfiguredSupportSummary():c}
        ${this.studyConfig?this.canAdjustAllSupport?r`<details class="support-toolbar participant-support-setup">
                <summary>Adjust accessibility support (optional)</summary>
                <p>
                  The study settings are already applied. You do not need to change anything before starting. If an
                  optional support preference helps, you may change it and the change will be recorded for the researcher.
                </p>
                ${this.renderSupportSettings("intro","all")}
              </details>`:this.canAdjustPresentationSupport?r`<details class="support-toolbar participant-support-setup">
                <summary>Adjust display, audio or recovery (optional)</summary>
                <p>
                  The study settings are already applied. You do not need to change anything before starting.
                  Simpler explanations and the standard/smiley answer presentation remain fixed by the study conductor.
                </p>
                ${this.renderSupportSettings("intro","presentation-only")}
              </details>`:c:r`<details class="support-toolbar participant-support-setup">
              <summary>Adjust accessibility support (optional)</summary>
              ${this.renderSupportSettings("intro","all")}
            </details>`}
        ${this.renderReadAloudControl()} ${this.renderGazeSetup()}

        <button
          class="primary-button large-answer-button"
          type="button"
          data-gaze-target
          data-gaze-label="Start the six ratings"
          ?disabled=${!!this.configurationError}
          @click=${this.startQuestionnaire}
        >
          Start the six ratings
        </button>
      </section>
    `}renderStudyContext(){return this.studyConfig?r`
      <aside class="study-context" aria-labelledby="study-context-heading">
        <h3 id="study-context-heading">Participant questionnaire</h3>
        <dl class="study-details">
          <div><dt>Study</dt><dd>${this.studyConfig.studyTitle}</dd></div>
          <div><dt>Study ID</dt><dd>${this.studyConfig.studyId}</dd></div>
          <div><dt>Task</dt><dd>${this.studyConfig.taskLabel}</dd></div>
          <div>
            <dt>Result collection</dt>
            <dd>${this.studyConfig.collection.mode==="qualtrics"?"UCL Qualtrics":"This browser only"}</dd>
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
            aria-invalid=${this.participantCodeError?"true":"false"}
            @input=${this.setParticipantCode}
          />
        </label>
        <p id="participant-code-help" class=${this.participantCodeError?"field-error":"support-boundary"}>
          ${this.participantCodeError||"Letters, numbers, hyphens and underscores only; maximum 32 characters."}
        </p>
      </aside>
    `:r`<aside class="study-context demo-context">
        <h3>Demonstration mode</h3>
        <p>This page is a technical demonstration. It does not upload answers or act as a remote research-data system.</p>
      </aside>`}renderConfiguredSupportSummary(){const e=this.studyConfig?.support;return e?r`
      <aside class="configured-support" aria-labelledby="configured-support-heading">
        <h3 id="configured-support-heading">Support prepared by the study conductor</h3>
        <p>You do not need to configure the questionnaire before starting.</p>
        <ul>
          <li>${e.showSimpleLanguage?"Simpler explanations shown":"Official wording with optional help hidden"}</li>
          <li>${e.answerMode==="smiley"?"Smiley landmark rating view":"Standard 21-point rating scale"}</li>
          <li>${e.largeText?"Large text":"Standard text size"}</li>
          <li>${e.recoveryEnabled?"Interruption recovery on":"Interruption recovery off"}</li>
          <li>${e.voiceInputAvailable?"Confirmed voice input available":"Built-in voice input not included"}</li>
          <li>${e.gazeInputAvailable?"Experimental gaze input available":"Experimental gaze input not included"}</li>
        </ul>
        <p>
          ${e.participantAdjustmentPolicy==="participant-choice"?"The starting settings are already applied. You may optionally change simpler explanations, answer presentation, text size, automatic spoken guidance or interruption recovery. Each change is recorded separately from your answers.":e.participantAdjustmentPolicy==="presentation-only"?"You may optionally change text size, automatic spoken guidance or interruption recovery. The answer presentation and simpler-explanation setting remain fixed.":"The prepared settings remain fixed for this study. You can still use any answer route that the study conductor made available."}
        </p>
      </aside>
    `:c}renderSupportSettings(e,t){const s=`support-${e}`;return r`
      <fieldset class="support-settings">
        <legend>${t==="all"?"Accessibility support options":"Display and recovery preferences"}</legend>

        ${t==="all"?r`<label class="toggle-card" for=${`${s}-simple`}>
            <input
              id=${`${s}-simple`}
              type="checkbox"
              .checked=${this.showSimpleLanguage}
              @change=${i=>this.setSimpleLanguage(i)}
            />
            <span>
              <strong>Show simpler explanations</strong>
              <small>The official NASA wording remains visible once, without being duplicated inside the help.</small>
            </span>
          </label>

          <fieldset class="answer-mode-control">
            <legend>Rating answer format</legend>
            <label for=${`${s}-standard-answer`}>
              <input
                id=${`${s}-standard-answer`}
                type="radio"
                name=${`${s}-answer-mode`}
                value="standard"
                .checked=${this.answerMode==="standard"}
                @change=${()=>this.setAnswerMode("standard")}
              />
              <span><strong>Standard 21-point scale</strong><small>Default NASA-TLX presentation.</small></span>
            </label>
            <label for=${`${s}-smiley-answer`}>
              <input
                id=${`${s}-smiley-answer`}
                type="radio"
                name=${`${s}-answer-mode`}
                value="smiley"
                .checked=${this.answerMode==="smiley"}
                @change=${()=>this.setAnswerMode("smiley")}
              />
              <span>
                <strong>Smiley landmarks</strong>
                <small>Experimental five-value view; the precise scale is available only on request.</small>
              </span>
            </label>
          </fieldset>`:c}

        <fieldset class="text-size-control">
          <legend>Text size</legend>
          <label for=${`${s}-standard-text`}>
            <input
              id=${`${s}-standard-text`}
              type="radio"
              name=${`${s}-text-size`}
              value="standard"
              .checked=${!this.largeText}
              @change=${()=>this.setLargeText(!1)}
            />
            Standard
          </label>
          <label for=${`${s}-large-text`}>
            <input
              id=${`${s}-large-text`}
              type="radio"
              name=${`${s}-text-size`}
              value="large"
              .checked=${this.largeText}
              @change=${()=>this.setLargeText(!0)}
            />
            Large
          </label>
        </fieldset>

        <label class="toggle-card" for=${`${s}-recovery`}>
          <input
            id=${`${s}-recovery`}
            type="checkbox"
            .checked=${this.recoveryEnabled}
            @change=${i=>this.setRecovery(i)}
          />
          <span>
            <strong>Save progress and show a return summary</strong>
            <small>Stores incomplete answers only in this browser so an interruption or reload can be recovered.</small>
          </span>
        </label>
      </fieldset>
    `}renderReadAloudControl(){const e="speechSynthesis"in window&&"SpeechSynthesisUtterance"in window;return r`
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
          ?disabled=${!e}
          @click=${this.toggleReadAloud}
        >
          ${this.readingAloud?"Stop summary":"Hear a summary of this step"}
        </button>
        ${this.audioStatusMessage?r`<p class="audio-status" role="status" aria-atomic="true">${this.audioStatusMessage}</p>`:c}
        ${this.canAdjustPresentationSupport?r`<label class="audio-guidance-toggle">
              <input
                type="checkbox"
                .checked=${this.audioGuidance}
                ?disabled=${!e}
                @change=${this.setAudioGuidance}
              />
              <span>
                <strong>Automatically read new questions and selected answers aloud</strong>
                <small>Default off. Turning this on plays an immediate spoken confirmation.</small>
              </span>
            </label>`:r`<small>Automatic spoken guidance is ${this.audioGuidance?"on":"off"} in the study configuration.</small>`}
        <small>
          ${e?"Uses the browser speech-synthesis voice; no audio is recorded.":"Built-in audio is unavailable in this browser. External screen readers can still use the semantic page."}
        </small>
      </div>
    `}renderGazeSetup(){if(!this.gazeInputAvailable)return c;const e=I(window.location),t=this.gazeState==="loading"||this.gazeState==="positioning"||this.gazeState==="calibrating"||this.gazeState==="ready";return r`
      <details class="gaze-setup" .open=${this.gazeState!=="off"}>
        <summary>Gaze-assisted answering with WebGazer (experimental)</summary>
        <div class="gaze-setup-content">
          <p>
            Uses the webcam to estimate where you look. After calibration, look at a large answer or navigation control
            for one second to propose it, then look at the separate Confirm control for 1.2 seconds. Looking alone never submits immediately.
          </p>
          <ul>
            <li>Requires webcam permission and an HTTPS website or localhost; it is not available from the downloaded file.</li>
            <li>Video is processed in this browser and is not stored by this questionnaire.</li>
            <li>WebGazer ${C} is loaded only after you start this feature; its code and face model come from jsDelivr.</li>
            <li>The camera preview is shown only while you position your face. It is hidden before calibration and answering.</li>
            <li>Webcam gaze estimation can be inaccurate and needs recalibration. Standard, keyboard and voice controls remain available.</li>
          </ul>
          ${e?c:r`<p class="gaze-warning" role="status">
                Gaze input requires the future HTTPS-hosted demo. Continue using the other answer routes in this downloaded file.
              </p>`}
          <div class="button-row compact">
            ${t?r`<button class="secondary-button large-answer-button" type="button" @click=${this.stopGazeInput}>
                  Stop gaze and camera
                </button>`:r`<button
                  class="secondary-button large-answer-button"
                  type="button"
                  ?disabled=${!e}
                  @click=${this.startGazeInput}
                >
                  ${this.gazeState==="error"?"Try gaze setup again":"Start camera and calibration"}
                </button>`}
            ${this.gazeState==="ready"?r`<button class="secondary-button" type="button" @click=${this.restartGazeCalibration}>
                  Recalibrate
                </button>`:c}
          </div>
          ${this.gazeMessage?r`<p class="gaze-status" role="status">${this.gazeMessage}</p>`:c}
        </div>
      </details>
    `}renderGazePositioning(){return r`
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
    `}renderGazeCalibration(){const e=$[this.gazeCalibrationIndex],t=this.gazeCalibrationIndex*y+this.gazeCalibrationRepetition,s=$.length*y;return r`
      <div class="gaze-calibration" role="dialog" aria-modal="true" aria-labelledby="gaze-calibration-heading">
        <div class="gaze-calibration-instructions">
          <h2 id="gaze-calibration-heading">Gaze calibration</h2>
          <p>Keep your head steady. Look at the numbered target, then click it or press Enter/Space three times.</p>
          <p><strong>${t} of ${s}</strong> calibration samples completed.</p>
          <button class="secondary-button" type="button" @click=${this.stopGazeInput}>Cancel gaze setup</button>
        </div>
        <div class="gaze-calibration-field">
          <button
            class="calibration-point"
            type="button"
            style=${`left: clamp(3rem, ${e.x}%, calc(100% - 3rem)); top: clamp(3rem, ${e.y}%, calc(100% - 3rem))`}
            aria-label=${`Calibration point ${this.gazeCalibrationIndex+1} of ${$.length}, sample ${this.gazeCalibrationRepetition+1} of ${y}`}
            @click=${this.recordCalibrationPoint}
          >
            ${this.gazeCalibrationIndex+1}
            <span>${this.gazeCalibrationRepetition+1}/${y}</span>
          </button>
        </div>
      </div>
    `}renderGazeConfirmation(){return r`
      <aside class="gaze-confirmation" aria-labelledby="gaze-confirmation-heading">
        <h2 id="gaze-confirmation-heading">Gaze proposal</h2>
        <p>You looked at: <strong>${this.gazePendingLabel}</strong></p>
        <p>Look at Confirm for 1.2 seconds, or cancel. This second step prevents an ordinary glance from becoming an answer.</p>
        <div class="gaze-confirmation-actions">
          <button
            class="primary-button large-answer-button gaze-confirm-target"
            type="button"
            data-gaze-confirm
            style=${`--gaze-progress: ${this.gazeDwellProgress*100}%`}
            @click=${this.confirmGazeProposal}
          >
            Confirm ${this.gazePendingLabel}
          </button>
          <button
            class="secondary-button large-answer-button gaze-cancel-target"
            type="button"
            data-gaze-cancel
            style=${`--gaze-progress: ${this.gazeDwellProgress*100}%`}
            @click=${this.cancelGazeProposal}
          >
            Cancel gaze proposal
          </button>
        </div>
      </aside>
    `}renderProgress(){const e=Object.keys(this.ratings).length+Object.keys(this.pairResponses).length,t=g.length+this.pairOrder.length,s=this.stage==="ratings"?"Ratings":this.stage==="pairs"?"Comparisons":"Review";return r`
      <nav class="progress-card" aria-label="Questionnaire progress">
        <p><strong>${s}:</strong> ${e} of ${t} responses completed</p>
        <progress max=${t} value=${e}>${e} of ${t}</progress>
      </nav>
    `}renderRating(){const e=g[this.ratingIndex],t=this.ratings[e.id];return r`
      <section class="panel" id="question-panel" aria-labelledby="rating-heading">
        <p class="step-label">Rating ${this.ratingIndex+1} of ${g.length}</p>
        <h2 id="rating-heading">${e.name}</h2>
        <p class="official-definition"><strong>Official definition:</strong> ${e.officialDefinition}</p>

        ${this.showSimpleLanguage?r`<aside class="simple-language-panel" aria-label="Simpler explanation">
              <p class="support-label">Simpler explanation</p>
              <p>${e.simpleExplanation}</p>
              <p class="support-boundary">Use the official scale when choosing your response.</p>
            </aside>`:r`<details class="optional-explanation">
              <summary>Show a simpler explanation</summary>
              <div class="explanation-block">
                <p>${e.simpleExplanation}</p>
                <p class="support-boundary">This help does not replace the official definition.</p>
              </div>
            </details>`}

        ${this.answerMode==="smiley"?r`
              ${this.renderSmileyResponse(e,t)}
              <details class="precision-scale">
                <summary>Choose a more precise value on the full scale</summary>
                ${this.renderFullRatingScale(e,t)}
              </details>
            `:this.renderFullRatingScale(e,t)}

        ${this.renderVoiceInput("rating",e)}
        ${this.renderNavigation(this.ratingIndex>0,"rating")}
      </section>
    `}renderFullRatingScale(e,t){return r`
      <fieldset class="rating-fieldset">
        <legend>Rate ${e.name}: 0 is ${e.lowAnchor}; 100 is ${e.highAnchor}</legend>
        <div class="rating-anchors" aria-hidden="true">
          <span>0 — ${e.lowAnchor}</span><span>100 — ${e.highAnchor}</span>
        </div>
        <div class="rating-grid">
          ${E.map(s=>{const i=`rating-${e.id}-${s}`;return r`
              <label
                class="rating-option"
                for=${i}
                data-gaze-target
                data-gaze-label=${`${s} for ${e.name}`}
              >
                <input
                  id=${i}
                  type="radio"
                  name=${`rating-${e.id}`}
                  value=${s}
                  .checked=${t===s}
                  @change=${()=>this.selectRating(e.id,s,"standard-scale")}
                />
                <span>${s}</span>
              </label>
            `})}
        </div>
      </fieldset>
    `}renderSmileyResponse(e,t){return r`
      <fieldset class="smiley-response">
        <legend>Rate ${e.name} with a smiley landmark</legend>
        <p id=${`smiley-help-${e.id}`}>
          Each face is one official value. Facial expression may imply good or bad, so this route is experimental.
        </p>
        <div class="smiley-grid">
          ${A.map(({value:s,cue:i})=>{const a=`smiley-${e.id}-${s}`;return r`
              <label
                class="smiley-option"
                for=${a}
                data-gaze-target
                data-gaze-label=${`${s} for ${e.name}`}
              >
                <input
                  id=${a}
                  type="radio"
                  name=${`smiley-${e.id}`}
                  value=${s}
                  .checked=${t===s}
                  aria-label=${`${s}, ${this.landmarkLabel(e,s)}, for ${e.name}`}
                  aria-describedby=${`smiley-help-${e.id}`}
                  @change=${()=>this.selectRating(e.id,s,"smiley-landmark")}
                />
                <span class="smiley-option-content">
                  <span class="smiley-face" aria-hidden="true">${i}</span>
                  <strong>${s}</strong>
                  <small>${this.landmarkLabel(e,s)}</small>
                </span>
              </label>
            `})}
        </div>
      </fieldset>
    `}renderPair(){const e=this.pairOrder[this.pairIndex],t=m.get(e.left),s=m.get(e.right),i=this.pairResponses[e.id];return r`
      <section class="panel" id="question-panel" aria-labelledby="pair-heading">
        <p class="step-label">Comparison ${this.pairIndex+1} of ${this.pairOrder.length}</p>
        <h2 id="pair-heading">Which factor contributed more to the workload you experienced?</h2>
        <p class="pair-instruction">
          This is not a Low-to-High rating. Choose the factor that was the more important source of workload in the task.
        </p>

        ${this.renderPairHelp(t,s)}
        <fieldset class="choice-fieldset">
          <legend>Choose one factor</legend>
          ${this.renderPairChoice(e.id,t,i===t.id)}
          ${this.renderPairChoice(e.id,s,i===s.id)}
        </fieldset>

        ${this.renderVoiceInput("pair",t,s)}
        ${this.renderNavigation(!0,"pair")}
      </section>
    `}renderPairChoice(e,t,s){const i=`${e}-${t.id}`;return r`
      <label
        class="choice-card"
        for=${i}
        data-gaze-target
        data-gaze-label=${t.name}
      >
        <input
          id=${i}
          type="radio"
          name=${e}
          value=${t.id}
          .checked=${s}
          @change=${()=>this.selectPair(e,t.id,"standard-choice")}
        />
        <span>
          <strong>${t.name}</strong>
          ${this.showSimpleLanguage?r`<small>${t.shortMeaning}</small>`:c}
        </span>
      </label>
    `}renderPairHelp(e,t){return this.showSimpleLanguage?r`<p class="simple-pair-prompt">In simpler words: which one added more to the work you had to do?</p>`:r`
      <details class="optional-explanation pair-help">
        <summary>Need help with these factor names?</summary>
        <div class="explanation-grid">
          ${[e,t].map(s=>r`
              <div class="explanation-block">
                <h3>${s.name}</h3>
                <p>${s.simpleExplanation}</p>
              </div>
            `)}
        </div>
      </details>
    `}renderVoiceInput(e,t,s){if(!this.voiceInputAvailable)return c;const i=!!(window.SpeechRecognition??window.webkitSpeechRecognition),a=this.pendingVoiceAnswer?.context===e,d=e==="rating"?"Say a number from 0 to 100 in steps of 5, such as 25 or 70.":`Say “${t.name}” or “${s.name}”.`;return r`
      <details class="voice-input" .open=${this.voiceState!=="idle"}>
        <summary>Answer this question by voice</summary>
        <div class="voice-input-content">
          <p>${d}</p>
          <p class="support-boundary">
            Voice is optional. Your browser may use its speech service. This prototype does not store audio,
            and buttons remain available if recognition is unsupported or incorrect.
          </p>
          <button
            class="secondary-button large-answer-button"
            type="button"
            ?disabled=${!i||this.voiceState==="listening"}
            @click=${()=>this.startVoiceInput(e,t,s)}
          >
            ${this.voiceState==="listening"?"Listening…":"Start voice input"}
          </button>
          ${i?c:r`<p role="status">
                Built-in voice recognition is unavailable in this browser. System voice control can still activate
                the visible buttons by name.
              </p>`}
          ${this.voiceMessage?r`<p role="status">${this.voiceMessage}</p>`:c}
          ${a&&this.pendingVoiceAnswer?r`
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
              `:c}
        </div>
      </details>
    `}renderNavigation(e,t){const s=t==="rating"&&this.ratingIndex===g.length-1,i=t==="pair"&&this.pairIndex===this.pairOrder.length-1;return r`
      <div class="button-row">
        <button
          class="secondary-button large-answer-button"
          type="button"
          data-gaze-target
          data-gaze-label="Previous question"
          ?disabled=${!e}
          @click=${this.goBack}
        >
          Previous question
        </button>
        <button
          class="primary-button large-answer-button"
          type="button"
          data-gaze-target
          data-gaze-label=${s?"Continue to comparisons":i?"Review responses":"Next question"}
          @click=${()=>this.goNext(t)}
        >
          ${s?"Continue to comparisons":i?"Review responses":"Next question"}
        </button>
      </div>
    `}renderReview(){return r`
      <section class="panel" id="question-panel" aria-labelledby="review-heading">
        <h2 id="review-heading">Review your responses</h2>
        <p>Check every response before calculating the weighted workload score.</p>

        <h3>Magnitude ratings</h3>
        <dl class="review-ratings">
          ${g.map(e=>r`
              <div>
                <dt>${e.name}</dt>
                <dd>
                  ${this.ratings[e.id]}
                  <small>(${this.ratingRouteLabel(e.id)})</small>
                </dd>
              </div>
            `)}
        </dl>

        <h3>Sources-of-workload comparisons</h3>
        <ol class="review-list">
          ${this.pairOrder.map(e=>{const t=m.get(e.left),s=m.get(e.right),i=m.get(this.pairResponses[e.id]);return r`<li>${t.name} or ${s.name}: <strong>${i.name}</strong></li>`})}
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
            ${this.submittingResult?"Submitting responses…":"Calculate and submit responses"}
          </button>
        </div>
      </section>
    `}renderComplete(){if(!this.result||!this.submittedRecord)return c;const e=!this.studyConfig||this.studyConfig.showScoreToParticipant;return r`
      <section class="panel confirmation" id="question-panel" aria-labelledby="complete-heading">
        <h2 id="complete-heading">${this.studyConfig?"Questionnaire complete":"Responses calculated"}</h2>
        ${e?r`<p class="score">Weighted workload score: <strong>${this.result.weightedScore.toFixed(2)}</strong></p>`:r`<p>Your responses have been recorded. The study configuration does not display the calculated score on the participant page.</p>`}
        ${this.studyConfig?this.completionSavedByHost?r`<div class="save-status" role="status">
                <h3>Scheduled for automatic completion</h3>
                <p>
                  ${this.hostSinkName} acknowledged submission
                  <strong>${this.hostReceipt?.receiptId||this.submittedRecord.submissionId}</strong>.
                  No further action is required. The study platform will finish the survey automatically after the result-review period.
                  The final page will confirm when it has been recorded.
                </p>
              </div>`:this.completionSavedLocally?r`<div class="save-status" role="status">
                <h3>Saved on this device</h3>
                <p>
                  The completed record is stored only in this browser. It has not been sent to GitHub or to a server.
                  The study conductor must export it from the study setup page before browser data are cleared.
                </p>
              </div>`:r`<div class="error-summary" role="alert">
                <h3>The browser could not save the completed record</h3>
                <p>Use the JSON or CSV backup button below and give the file to the study conductor through the approved study procedure.</p>
              </div>`:r`<p>No response, audio or webcam video has been uploaded. Demonstration results are not retained after this page is closed.</p>`}
        <p>Support and input-route metadata remain separate from the NASA-TLX score.</p>
        ${this.studyConfig?c:r`<details>
              <summary>Show the complete result record</summary>
              <pre>${JSON.stringify(this.submittedRecord,null,2)}</pre>
            </details>`}
        <div class="button-row compact">
          ${this.completionSavedByHost?c:r`<button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultJson}>
                Download JSON backup
              </button>
              <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultCsv}>
                Download CSV backup
              </button>`}
          ${this.studyConfig?c:r`<button class="secondary-button large-answer-button" type="button" @click=${this.restart}>Start again</button>`}
        </div>
        ${this.studyConfig?r`<p>
              <strong>Participant:</strong>
              ${this.completionSavedByHost?"review this result. The study platform will complete the survey automatically.":"please return the device or completion notice to the study conductor."}
            </p>`:c}
      </section>
    `}renderSavedSessionOffer(){if(!this.savedSession)return c;const e=Object.keys(this.savedSession.ratings).length+Object.keys(this.savedSession.pairResponses).length;return r`
      <aside class="saved-session" aria-labelledby="saved-session-heading">
        <h3 id="saved-session-heading">Saved questionnaire found</h3>
        <p>${e} of ${g.length+z.length} responses are saved in this browser.</p>
        <div class="button-row compact">
          <button class="primary-button large-answer-button" type="button" @click=${this.restoreSavedSession}>
            Resume saved questionnaire
          </button>
          <button class="secondary-button" type="button" @click=${this.eraseSavedSession}>Erase saved answers</button>
        </div>
      </aside>
    `}renderResumeSummary(){return r`
      <aside class="resume-summary" aria-labelledby="resume-heading">
        <h2 id="resume-heading" tabindex="-1">Welcome back — here is where you stopped</h2>
        <dl class="resume-details">
          <div><dt>Completed</dt><dd>${this.completedCount()} of ${g.length+z.length} responses</dd></div>
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
    `}setSimpleLanguage(e){const t=e.currentTarget.checked;this.recordSupportChange("simpler-explanations",this.showSimpleLanguage,t),this.showSimpleLanguage=t,this.invalidatePendingSubmission(),this.persistProgress()}recordSupportChange(e,t,s){!this.studyConfig||t===s||this.stage==="complete"||(this.supportChanges=[...this.supportChanges,{setting:e,from:t,to:s,stage:this.stage,changedAt:new Date().toISOString()}])}setAnswerMode(e){this.recordSupportChange("answer-mode",this.answerMode,e),this.answerMode=e,this.invalidatePendingSubmission(),this.persistProgress()}setLargeText(e){this.recordSupportChange("text-size",this.largeText?"large":"standard",e?"large":"standard"),this.largeText=e,this.invalidatePendingSubmission(),this.persistProgress()}setRecovery(e){const t=e.currentTarget.checked;this.recordSupportChange("interruption-recovery",this.recoveryEnabled,t),this.recoveryEnabled=t,this.invalidatePendingSubmission(),this.recoveryEnabled?this.persistProgress():this.clearSavedProgress()}landmarkLabel(e,t){return t===0?e.lowAnchor:t===25?`Closer to ${e.lowAnchor}`:t===50?"Middle":t===75?`Closer to ${e.highAnchor}`:e.highAnchor}ratingRouteLabel(e){const t=this.ratingInputRoutes[e];return t==="smiley-landmark"?"smiley landmark":t==="voice"?"voice, confirmed":t==="gaze-standard-scale"?"gaze, standard scale, confirmed":t==="gaze-smiley-landmark"?"gaze, smiley landmark, confirmed":"full scale"}selectRating(e,t,s){s!=="voice"&&this.voiceState!=="idle"&&this.clearVoiceAnswer();const i=this.gazeActivationInProgress?s==="smiley-landmark"?"gaze-smiley-landmark":"gaze-standard-scale":s;this.ratings={...this.ratings,[e]:t},this.ratingInputRoutes={...this.ratingInputRoutes,[e]:i},this.clearError(),this.statusMessage=`${m.get(e).name}, ${t}, selected.`,this.audioGuidance&&this.speakText(this.statusMessage),this.persistProgress()}selectPair(e,t,s){s!=="voice"&&this.voiceState!=="idle"&&this.clearVoiceAnswer();const i=this.gazeActivationInProgress?"gaze":s;this.pairResponses={...this.pairResponses,[e]:t},this.pairInputRoutes={...this.pairInputRoutes,[e]:i},this.clearError(),this.statusMessage=`${m.get(t).name} selected.`,this.audioGuidance&&this.speakText(this.statusMessage),this.persistProgress()}goNext(e){if(this.stopReading(),this.clearVoiceAnswer(),e==="rating"){const t=g[this.ratingIndex];if(this.ratings[t.id]===void 0){this.showError(`Choose a rating for ${t.name} before continuing.`);return}this.ratingIndex<g.length-1?this.ratingIndex+=1:(this.stage="pairs",this.pairIndex=0)}else{const t=this.pairOrder[this.pairIndex];if(!this.pairResponses[t.id]){this.showError("Choose which factor contributed more to workload before continuing.");return}this.pairIndex<this.pairOrder.length-1?this.pairIndex+=1:this.stage="review"}this.clearError(),this.persistProgress(),this.focusHeading()}effectiveStudyConfig(){return this.studyConfig?this.studyConfig:{schemaVersion:3,configId:"demo-config",createdAt:this.startedAt||new Date().toISOString(),prototypeVersion:D,studyId:"DEMO",studyTitle:"Technical demonstration",taskLabel:"a task completed before the questionnaire",showScoreToParticipant:!0,support:{showSimpleLanguage:!1,answerMode:"standard",largeText:!1,audioGuidance:!1,recoveryEnabled:!1,participantAdjustmentPolicy:"presentation-only",voiceInputAvailable:!0,gazeInputAvailable:!0},collection:{mode:"local"}}}currentSupportMetadata(){return{simplerExplanationsShownAtSubmission:this.showSimpleLanguage,largeTextUsedAtSubmission:this.largeText,answerModeAtSubmission:this.answerMode,recoveryEnabledAtSubmission:this.recoveryEnabled,interruptionSummaryShown:this.interruptionSummaryShown,readAloudUsed:this.readAloudUsed,automaticAudioGuidanceEnabledAtSubmission:this.audioGuidance,gazeUsed:this.gazeUsed,gazeActionCount:this.gazeActionCount,gazeEngine:this.gazeUsed?`WebGazer ${C}`:null,ratingInputRoutes:this.ratingInputRoutes,pairInputRoutes:this.pairInputRoutes,supportChanges:[...this.supportChanges]}}invalidatePendingSubmission(){this.result=null,this.submittedRecord=null,this.completionSavedLocally=!1,this.completionSavedByHost=!1,this.hostSinkName="",this.hostReceipt=null}speakText(e){if(!("speechSynthesis"in window)||!("SpeechSynthesisUtterance"in window)){this.audioStatusMessage="Built-in audio is unavailable in this browser. External screen readers can still read the page.";return}const t=window.speechSynthesis,s=this.readingAloud||t.speaking||t.pending||t.paused,i=++this.speechRequestId,a=new SpeechSynthesisUtterance(e);a.lang="en-GB",a.rate=.9;const d=window.speechSynthesis.getVoices?.()??[],u=d.find(p=>p.lang.toLowerCase()==="en-gb")??d.find(p=>p.lang.toLowerCase().startsWith("en"));u&&(a.voice=u),a.onend=()=>{i===this.speechRequestId&&(this.readingAloud=!1,this.audioStatusMessage="Spoken summary finished.")},a.onerror=p=>{if(i!==this.speechRequestId)return;this.readingAloud=!1;const f=p.error?` (${p.error})`:"";this.audioStatusMessage=`No audio was played because the browser reported a speech error${f}. Check the device volume and try the button again.`};const h=()=>{if(i===this.speechRequestId)try{t.speak(a),this.readingAloud=!0,this.readAloudUsed=!0,this.audioStatusMessage="Playing a spoken summary of the current step."}catch{this.readingAloud=!1,this.audioStatusMessage="Built-in audio could not start in this browser. Check the device volume and try the button again."}};s?(t.cancel(),window.setTimeout(h,0)):h()}stopReading(e=!1){this.speechRequestId+=1,"speechSynthesis"in window&&window.speechSynthesis.cancel(),this.readingAloud=!1,e&&(this.audioStatusMessage="Spoken summary stopped.")}currentStepSpeech(){if(this.stage==="intro")return`Before you begin. ${this.studyConfig?`Think about ${this.studyConfig.taskLabel}.`:"Think about one task that you have just completed."} First rate six aspects of workload. Then make fifteen comparisons. Finally review and submit.`;if(this.stage==="ratings"){const e=g[this.ratingIndex],t=this.showSimpleLanguage?` Simpler explanation: ${e.simpleExplanation}`:"";return`Rating ${this.ratingIndex+1} of 6. ${e.name}. Official definition: ${e.officialDefinition}.${t} Rate from 0, ${e.lowAnchor}, to 100, ${e.highAnchor}.`}if(this.stage==="pairs"){const e=this.pairOrder[this.pairIndex],t=m.get(e.left),s=m.get(e.right);return`Comparison ${this.pairIndex+1} of 15. Which factor contributed more to workload? This is not a low to high rating. Choose ${t.name} or ${s.name}.`}return this.stage==="review"?"Review your six ratings and fifteen source of workload comparisons before submitting.":"Responses calculated."}async showGazePositioningStep(e){this.webgazer&&(this.restoreWebGazerPreviewContainer(),this.webgazer.showPredictionPoints(!1),this.webgazer.showVideoPreview(!0),this.webgazer.showFaceOverlay(!0),this.webgazer.showFaceFeedbackBox(!0),this.gazeState="positioning",this.gazeMessage=e,await this.updateComplete,this.mountWebGazerPreview(),this.querySelector("#gaze-positioning-heading")?.focus())}mountWebGazerPreview(){const e=this.querySelector(".gaze-camera-preview-slot"),t=document.querySelector("#webgazerVideoContainer");!e||!t||(t.setAttribute("aria-hidden","true"),e.append(t))}restoreWebGazerPreviewContainer(){const e=document.querySelector("#webgazerVideoContainer");e&&e.parentElement!==document.body&&document.body.append(e)}handleGazePoint(e){if(this.gazeState!=="ready"||!e){this.resetGazeHover();return}const t=this.elementsAtGazePoint(e);if(this.gazePendingElement){const u=t.map(f=>f.closest("[data-gaze-confirm], [data-gaze-cancel]")).find(f=>f!==null)??null,h=u?.hasAttribute("data-gaze-confirm")?"confirm":u?.hasAttribute("data-gaze-cancel")?"cancel":null,p=this.gazeConfirmationTracker.update(h,performance.now());this.gazeDwellProgress=p.progress,p.activated&&h==="confirm"&&this.confirmGazeProposal(),p.activated&&h==="cancel"&&this.cancelGazeProposal();return}const s=t.map(u=>u.closest("[data-gaze-target]")).find(u=>u!==null)??null,i=s&&!s.matches(":disabled")?s:null;i!==this.gazeCandidateElement&&(this.resetGazeHover(),this.gazeCandidateElement=i);const a=i?.dataset.gazeLabel??i?.textContent?.trim()??null,d=this.gazeCandidateTracker.update(a,performance.now());this.setGazeHover(i,d.progress),i&&d.activated&&(this.gazePendingElement=i,this.gazePendingLabel=a??"selected control",this.gazeDwellProgress=0,this.resetGazeHover(),this.statusMessage=`${this.gazePendingLabel} proposed by gaze. Confirm or cancel.`)}elementsAtGazePoint(e){if(typeof document.elementsFromPoint=="function")return document.elementsFromPoint(e.x,e.y).filter(s=>s instanceof HTMLElement);const t=document.elementFromPoint(e.x,e.y);return t instanceof HTMLElement?[t]:[]}setGazeHover(e,t){this.gazeCandidateElement=e,this.gazeDwellProgress=t,e&&(e.classList.add("gaze-hover"),e.style.setProperty("--gaze-progress",`${t*100}%`))}resetGazeHover(){this.gazeCandidateTracker.reset(),this.gazeCandidateElement&&(this.gazeCandidateElement.classList.remove("gaze-hover"),this.gazeCandidateElement.style.removeProperty("--gaze-progress")),this.gazeCandidateElement=null,this.gazePendingElement||(this.gazeDwellProgress=0)}releaseGazeResources(){const e=this.webgazer;if(e){this.restoreWebGazerPreviewContainer();try{e.clearGazeListener()}catch{}try{e.removeMouseEventListeners()}catch{}try{e.stopVideo()}catch{}try{e.end()}catch{}Promise.resolve(e.clearData()).catch(()=>{}),this.webgazer=null}}startVoiceInput(e,t,s){this.stopReading();const i=window.SpeechRecognition??window.webkitSpeechRecognition;if(!i)return;this.releaseRecognition(),this.pendingVoiceAnswer=null,this.voiceMessage="Listening for one answer.",this.voiceState="listening";const a=new i;this.recognition=a,a.lang="en-GB",a.continuous=!1,a.interimResults=!1,a.maxAlternatives=5,a.onresult=d=>{if(this.recognition!==a)return;const u=Array.from({length:d.results[0].length},(h,p)=>d.results[0][p].transcript);for(const h of u)if(e==="rating"){const p=X(h,t);if(p!==null){this.releaseRecognition(a),this.pendingVoiceAnswer={context:e,transcript:h,value:p,label:`${p} for ${t.name}`},this.voiceState="pending",this.voiceMessage="Check the proposed answer, then confirm it.";return}}else{const p=Z(h,[t.id,s.id]);if(p){this.releaseRecognition(a),this.pendingVoiceAnswer={context:e,transcript:h,value:p,label:m.get(p).name},this.voiceState="pending",this.voiceMessage="Check the proposed answer, then confirm it.";return}}this.releaseRecognition(a),this.voiceState="error",this.voiceMessage=`The answer was not recognised. ${e==="rating"?"Say a multiple of five from 0 to 100.":`Say ${t.name} or ${s.name}.`}`},a.onerror=d=>{this.recognition===a&&(this.releaseRecognition(a),this.voiceState="error",this.voiceMessage=d.error==="not-allowed"?"Microphone permission was not granted. Use the visible answer buttons or system voice control.":"Voice recognition did not complete. Use the visible answer buttons or try again.")},a.onend=()=>{this.recognition===a&&(this.recognition=null,this.voiceState==="listening"&&(this.voiceState="error",this.voiceMessage="No answer was recognised. Try again or use the visible answer buttons."))};try{a.start()}catch{this.releaseRecognition(a),this.voiceState="error",this.voiceMessage="Voice recognition could not start in this browser context."}}releaseRecognition(e=this.recognition){if(e){this.recognition===e&&(this.recognition=null),e.onresult=null,e.onerror=null,e.onend=null;try{e.stop()}catch{}}}currentProgressStorageKey(){const e=this.studyConfig?this.participantCode:"DEMO";return S(e)?B(this.studyConfig?.configId??"demo-config",e):null}persistProgress(){if(!this.recoveryEnabled||!this.isInProgress())return;const e=this.currentProgressStorageKey();if(!e)return;const t={version:3,savedAt:Date.now(),startedAt:this.startedAt||new Date().toISOString(),configId:this.studyConfig?.configId??"demo-config",participantCode:this.studyConfig?this.participantCode:"DEMO",stage:this.stage,ratingIndex:this.ratingIndex,pairIndex:this.pairIndex,pairOrder:this.pairOrder,pairResponses:this.pairResponses,ratings:this.ratings,ratingInputRoutes:this.ratingInputRoutes,pairInputRoutes:this.pairInputRoutes,supportChanges:this.supportChanges,support:{answerMode:this.answerMode,showSimpleLanguage:this.showSimpleLanguage,largeText:this.largeText,audioGuidance:this.audioGuidance}};try{localStorage.setItem(e,JSON.stringify(t))}catch{this.statusMessage="Progress could not be saved by this browser."}}findSavedSession(){const e=this.currentProgressStorageKey();if(e)try{const t=localStorage.getItem(e);if(!t)return;const s=JSON.parse(t);this.validSavedSession(s)?this.savedSession=s:this.clearSavedProgress()}catch{this.clearSavedProgress()}}validSavedSession(e){return e?.version===3&&e.configId===(this.studyConfig?.configId??"demo-config")&&e.participantCode===(this.studyConfig?this.participantCode:"DEMO")&&typeof e.startedAt=="string"&&["ratings","pairs","review"].includes(e.stage)&&Array.isArray(e.pairOrder)&&e.pairOrder.length===z.length&&Number.isInteger(e.ratingIndex)&&Number.isInteger(e.pairIndex)&&Array.isArray(e.supportChanges)}clearSavedProgress(){const e=this.currentProgressStorageKey();if(e)try{localStorage.removeItem(e)}catch{}}isInProgress(){return this.stage==="ratings"||this.stage==="pairs"||this.stage==="review"}completedCount(){return Object.keys(this.ratings).length+Object.keys(this.pairResponses).length}lastSavedDescription(){if(this.stage==="ratings"){const e=this.ratings[g[this.ratingIndex].id]!==void 0?this.ratingIndex:this.ratingIndex-1;return e>=0?`${g[e].name} rating`:"No response yet"}return this.stage==="pairs"?this.pairResponses[this.pairOrder[this.pairIndex].id]?`Comparison ${this.pairIndex+1}`:this.pairIndex>0?`Comparison ${this.pairIndex}`:"Frustration rating":"Comparison 15"}currentPositionDescription(){return this.stage==="ratings"?`Rating ${this.ratingIndex+1} of ${g.length}: ${g[this.ratingIndex].name}`:this.stage==="pairs"?`Comparison ${this.pairIndex+1} of ${this.pairOrder.length}`:this.stage==="review"?"Review responses":"Questionnaire introduction"}nextActionDescription(){if(this.stage==="ratings")return`Choose or check the ${g[this.ratingIndex].name} rating, then select Next.`;if(this.stage==="pairs"){const e=this.pairOrder[this.pairIndex];return`Choose ${m.get(e.left).name} or ${m.get(e.right).name}, then select Next.`}return"Check the saved answers, then submit or return to a question."}showError(e){this.errorMessage=e,this.updateComplete.then(()=>{const t=this.querySelector("#error-summary");t&&(t.focus(),t.scrollIntoView?.({block:"start"}))})}clearError(){this.errorMessage=""}focusHeading(){this.updateComplete.then(()=>{window.scrollTo({top:0});const e=this.querySelector("#question-panel h2");e&&(e.tabIndex=-1,e.focus(),this.statusMessage=e.textContent?.trim()??"",this.audioGuidance&&this.speakText(this.currentStepSpeech()))})}};o([l()],n.prototype,"stage",2);o([l()],n.prototype,"ratingIndex",2);o([l()],n.prototype,"pairIndex",2);o([l()],n.prototype,"pairOrder",2);o([l()],n.prototype,"pairResponses",2);o([l()],n.prototype,"ratings",2);o([l()],n.prototype,"ratingInputRoutes",2);o([l()],n.prototype,"pairInputRoutes",2);o([l()],n.prototype,"supportChanges",2);o([l()],n.prototype,"answerMode",2);o([l()],n.prototype,"showSimpleLanguage",2);o([l()],n.prototype,"largeText",2);o([l()],n.prototype,"recoveryEnabled",2);o([l()],n.prototype,"resumeSummaryVisible",2);o([l()],n.prototype,"savedSession",2);o([l()],n.prototype,"readingAloud",2);o([l()],n.prototype,"readAloudUsed",2);o([l()],n.prototype,"audioGuidance",2);o([l()],n.prototype,"audioStatusMessage",2);o([l()],n.prototype,"interruptionSummaryShown",2);o([l()],n.prototype,"voiceState",2);o([l()],n.prototype,"voiceMessage",2);o([l()],n.prototype,"pendingVoiceAnswer",2);o([l()],n.prototype,"errorMessage",2);o([l()],n.prototype,"statusMessage",2);o([l()],n.prototype,"result",2);o([l()],n.prototype,"gazeState",2);o([l()],n.prototype,"gazeMessage",2);o([l()],n.prototype,"gazeCalibrationIndex",2);o([l()],n.prototype,"gazeCalibrationRepetition",2);o([l()],n.prototype,"gazePendingLabel",2);o([l()],n.prototype,"gazeDwellProgress",2);o([l()],n.prototype,"gazeUsed",2);o([l()],n.prototype,"gazeActionCount",2);o([l()],n.prototype,"studyConfig",2);o([l()],n.prototype,"configurationError",2);o([l()],n.prototype,"participantCode",2);o([l()],n.prototype,"participantCodeError",2);o([l()],n.prototype,"startedAt",2);o([l()],n.prototype,"submittedRecord",2);o([l()],n.prototype,"completionSavedLocally",2);o([l()],n.prototype,"completionSavedByHost",2);o([l()],n.prototype,"hostSinkName",2);o([l()],n.prototype,"hostReceipt",2);o([l()],n.prototype,"submittingResult",2);n=o([M("accessible-nasa-tlx")],n);
