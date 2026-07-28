import{r as R,s as D,a as d,t as N,i as _,g as E,D as k,v as b,b as Q,c as W,d as K,f as x,e as Y,h as H,j as J,P as T,A as c,k as n,l as M,m as L,n as Z,o as X,p as ee,q as te}from"./study-DO0I31Q8.js";const se="accessible-questionnaire:qualtrics-submit:v2",ie="accessible-questionnaire:qualtrics-receipt:v2",ae="accessible-questionnaire:qualtrics-resize:v2",ne="accessible-questionnaire:qualtrics-reveal:v2";function re(e=window){const t=e.accessibleQuestionnaireResultSink??e.accessibleNasaTlxResultSink;return!t||typeof t.name!="string"||!t.name.trim()||typeof t.submit!="function"?null:t}function oe(e,t=window){if(e.collection.mode!=="qualtrics")return null;const s=ce(e.collection.parentOrigin,t);return t.accessibleQuestionnaireResultSink=s,t.accessibleNasaTlxResultSink=s,le(e.collection.parentOrigin,t),s}function le(e,t=window){const s=t.ResizeObserver;if(t.parent===t||typeof s!="function")return null;const i=()=>{const r=t.document.documentElement,u=t.document.body,p=Math.ceil(Math.max(r?.scrollHeight??0,r?.offsetHeight??0,u?.scrollHeight??0,u?.offsetHeight??0));p>0&&t.parent.postMessage({type:ae,height:p},e)},a=new s(i);return t.document.documentElement&&a.observe(t.document.documentElement),t.document.body&&a.observe(t.document.body),t.requestAnimationFrame(i),a}function de(e,t,s=window){if(s.parent===s)return!1;const i=e.getBoundingClientRect(),a=i.top+(s.scrollY||s.pageYOffset||0);return!Number.isFinite(a)||!Number.isFinite(i.height)?!1:(s.parent.postMessage({type:ne,offsetTop:a,targetHeight:Math.max(1,i.height)},t),!0)}function ce(e,t=window,s=12e3){return{name:"UCL Qualtrics",submit(i){return t.parent===t?Promise.reject(new Error("This centrally collected questionnaire must be opened through its Qualtrics survey.")):new Promise((a,r)=>{let u=!1;const p=f=>{u||(u=!0,t.clearTimeout(g),t.removeEventListener("message",h),f())},h=f=>{if(f.source!==t.parent||f.origin!==e)return;const m=f.data;if(!(!m||m.type!==ie||m.submissionId!==i.submissionId)){if(m.accepted!==!0){p(()=>r(new Error(typeof m.error=="string"&&m.error?m.error:"Qualtrics did not accept the response.")));return}p(()=>a({accepted:!0,submissionId:i.submissionId,receiptId:typeof m.receiptId=="string"?m.receiptId:void 0}))}},g=t.setTimeout(()=>{p(()=>r(new Error("Qualtrics did not acknowledge the response in time.")))},s);t.addEventListener("message",h),t.parent.postMessage({type:se,record:i},e)})}}}async function ue(e,t,s=15e3){let i;const a=new Promise((u,p)=>{i=setTimeout(()=>p(new Error("The study platform did not confirm receipt in time.")),s)});let r;try{r=await Promise.race([t.submit(e),a])}finally{i!==void 0&&clearTimeout(i)}if(!r||r.accepted!==!0||r.submissionId!==e.submissionId||r.receiptId!==void 0&&typeof r.receiptId!="string")throw new Error("The study platform returned an invalid submission receipt.");return r}const U=new Map([["zero",0],["five",5],["one zero",10],["ten",10],["fifteen",15],["twenty",20],["twenty five",25],["thirty",30],["thirty five",35],["forty",40],["forty five",45],["fifty",50],["fifty five",55],["sixty",60],["sixty five",65],["seventy",70],["seventy five",75],["eighty",80],["eighty five",85],["ninety",90],["ninety five",95],["one zero zero",100],["one hundred",100],["hundred",100]]),S=new Map([["zero","0"],["oh","0"],["one","1"],["two","2"],["three","3"],["four","4"],["five","5"],["six","6"],["seven","7"],["eight","8"],["nine","9"]]);for(const e of R){const t=String(e).split("").map(s=>[...S].find(([,i])=>i===s)?.[0]).filter(s=>!!s).join(" ");t&&U.set(t,e)}const G=new Set([...S.keys(),"ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety","hundred"]),I=/\b(?:not|no|cancel|neither|except|without|instead|rather|unsure|uncertain|maybe|perhaps|mistake|wrong)\b|\b(?:anything\s+but|other\s+than|don\s+t)\b/,he={mental:["mental demand","mental"],physical:["physical demand","physical"],temporal:["temporal demand","temporal","time pressure"],performance:["performance"],effort:["effort"],frustration:["frustration"]};function P(e){return e.toLowerCase().replace(/[-–—]/g," ").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim()}function O(e){return I.test(P(e))}function j(e,t){const s=e.map(a=>a.trim()).filter(Boolean);if(s.length===0||O(s[0]))return null;const i=s.map((a,r)=>({transcript:a,value:t(a),index:r})).filter(a=>a.value!==null);return i.length===0||s.slice(0,i[0].index).some(O)||new Set(i.map(({value:a})=>a)).size!==1?null:{transcript:i[0].transcript,value:i[0].value}}function pe(e,t){const s=e.split(" ").filter(Boolean),i=[];for(const a of s)if(/^(?:100|[0-9]{1,2})$/.test(a)){const r=Number(a);i.push(t.includes(r)?r:null)}for(let a=0;a<s.length;){if(!G.has(s[a])){a+=1;continue}const r=[];for(;a<s.length&&G.has(s[a]);)r.push(s[a]),a+=1;const u=r.length===1&&S.has(r[0])?Number(S.get(r[0])):U.get(r.join(" "));i.push(u!==void 0&&t.includes(u)?u:null)}return i}function q(e){return e?.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")}function v(e,t){return e.find(s=>s.position===t)?.value}function ge(e,t,s){const i=/\b(middle|midpoint|centre|center)\b/.test(e),a=q(t.voiceLowAliases),r=q(t.voiceHighAliases);if(!a||!r||s.length!==5)return;const u=`(?:${a})`,p=`(?:${r})`,h=new RegExp(`\\bclose(?:r)?\\s+(?:to|too)\\s+${u}\\b`).test(e),g=new RegExp(`\\bclose(?:r)?\\s+(?:to|too)\\s+${p}\\b`).test(e),f=t.voiceLowAliases?.includes("low")===!0&&e==="hello",m=new RegExp(`\\b${u}\\b`).test(e)||f,z=new RegExp(`\\b${p}\\b`).test(e);if(h||g)return[i,h,g].filter(Boolean).length!==1||h&&z||g&&m?null:h?v(s,"closer-low")??null:v(s,"closer-high")??null;if([i,m,z].some(Boolean))return[i,m,z].filter(Boolean).length!==1?null:i?v(s,"middle")??null:m?v(s,"low")??null:v(s,"high")??null}function me(e,t,s=R,i=D){const a=P(e);if(!a||I.test(a))return null;const r=pe(a,s),u=ge(a,t,i);return r.length>0?r.length!==1||r[0]===null||u===null||u!==void 0&&u!==r[0]?null:r[0]:u??null}function be(e,t){const s=P(e);if(!s||I.test(s))return null;const i=t.map(a=>{const r=typeof a=="string"?a:a.id;return(typeof a=="string"?he[r]??[r.replace(/[-_]/g," ")]:[a.name.toLowerCase(),r.replace(/[-_]/g," ")]).some(p=>s===p||s.includes(p))?r:null}).filter(a=>!!a);return i.length===1?i[0]:null}function fe(e,t,s=R,i=D){return j(e,a=>me(a,t,s,i))}function ye(e,t){return j(e,s=>be(s,t))}const C="3.5.3",ve=`https://cdn.jsdelivr.net/npm/webgazer@${C}/dist/webgazer.js`,we=`https://cdn.jsdelivr.net/npm/webgazer@${C}/dist/mediapipe/face_mesh`,$e="sha384-N9TfYQEjUGiaDcITkzB/MtVHEfF2JtTWCwHG8NUhjOSvJ8zObGwfebHUFLBS+4Rb";let w=null;function V(e){return e.protocol==="https:"||e.hostname==="localhost"||e.hostname==="127.0.0.1"}function Se(e=document){return window.webgazer?Promise.resolve(window.webgazer):w||(w=new Promise((t,s)=>{const i=e.querySelector("#webgazer-loader"),a=i??e.createElement("script"),r=()=>{window.webgazer?t(window.webgazer):s(new Error("WebGazer loaded without exposing its browser API."))};a.addEventListener("load",r,{once:!0}),a.addEventListener("error",()=>{a.remove(),s(new Error("WebGazer could not be downloaded. Check the connection and content-blocking settings."))},{once:!0}),i||(a.id="webgazer-loader",a.src=ve,a.integrity=$e,a.crossOrigin="anonymous",a.referrerPolicy="no-referrer",e.head.append(a))}).catch(t=>{throw w=null,t}),w)}class B{constructor(t){this.durationMs=t,this.key=null,this.startedAt=0}update(t,s){if(!t)return this.reset(),{progress:0,activated:!1};if(t!==this.key)return this.key=t,this.startedAt=s,{progress:0,activated:!1};const i=Math.min(1,Math.max(0,(s-this.startedAt)/this.durationMs));return i>=1?(this.reset(),{progress:1,activated:!0}):{progress:i,activated:!1}}reset(){this.key=null,this.startedAt=0}}var Ce=Object.defineProperty,ze=Object.getOwnPropertyDescriptor,l=(e,t,s,i)=>{for(var a=i>1?void 0:i?ze(t,s):t,r=e.length-1,u;r>=0;r--)(u=e[r])&&(a=(i?u(t,s,a):u(a))||a);return i&&a&&Ce(t,s,a),a};const $=[{x:12,y:12},{x:50,y:12},{x:88,y:12},{x:12,y:50},{x:50,y:50},{x:88,y:50},{x:12,y:88},{x:50,y:88},{x:88,y:88}],y=3;function A(e){const t=H(e);for(let s=t.length-1;s>0;s-=1){const i=Math.floor(Math.random()*(s+1));[t[s],t[i]]=[t[i],t[s]]}return t}let o=class extends _{constructor(){super(...arguments),this.stage="intro",this.ratingIndex=0,this.pairIndex=0,this.pairOrder=A(E(k)),this.pairResponses={},this.ratings={},this.ratingInputRoutes={},this.pairInputRoutes={},this.supportChanges=[],this.answerMode="standard",this.showSimpleLanguage=!1,this.largeText=!1,this.recoveryEnabled=!1,this.resumeSummaryVisible=!1,this.savedSession=null,this.recoveredCompletedRecord=null,this.readingAloud=!1,this.readAloudUsed=!1,this.audioGuidance=!1,this.audioStatusMessage="",this.interruptionSummaryShown=!1,this.voiceState="idle",this.voiceMessage="",this.pendingVoiceAnswer=null,this.errorMessage="",this.statusMessage="",this.result=null,this.gazeState="off",this.gazeMessage="",this.gazeCalibrationIndex=0,this.gazeCalibrationRepetition=0,this.gazePendingLabel="",this.gazeDwellProgress=0,this.gazeUsed=!1,this.gazeActionCount=0,this.studyConfig=null,this.configurationError="",this.participantCode="",this.participantCodeError="",this.participantCodeRestoredForTab=!1,this.startedAt="",this.submittedRecord=null,this.completionSavedLocally=!1,this.completionSavedByHost=!1,this.hostSubmissionFailed=!1,this.hostSinkName="",this.hostReceipt=null,this.submittingResult=!1,this.hiddenAt=null,this.recognition=null,this.webgazer=null,this.gazeCandidateElement=null,this.gazePendingElement=null,this.gazeActivationInProgress=!1,this.speechRequestId=0,this.savedSessionAnnouncementKey="",this.configurationApplied=!1,this.gazeCandidateTracker=new B(1e3),this.gazeConfirmationTracker=new B(1200),this.repeatSavedSessionOffer=()=>{this.savedSession&&(this.readAloudUsed=!0,this.speakText(this.savedSessionOfferSpeech(this.savedSession)))},this.setParticipantCode=e=>{this.participantCode=e.currentTarget.value.trim(),this.participantCodeRestoredForTab=!1,this.participantCodeError=this.participantCode&&!b(this.participantCode)?"Use 1–32 letters, numbers, hyphens or underscores, starting with a letter or number.":"",this.savedSession=null,this.recoveredCompletedRecord=null,b(this.participantCode)?(this.rememberParticipantCodeForTab(),this.findSavedSession(),this.findCompletedBackup()):this.forgetParticipantCodeForTab()},this.setAudioGuidance=e=>{const t=e.currentTarget.checked;this.recordSupportChange("automatic-audio",this.audioGuidance,t),this.audioGuidance=t,this.invalidatePendingSubmission(),this.audioGuidance?this.speakText("Built-in audio guidance is on. New questions, selected answers, voice proposals, simpler help, recovery summaries, errors and completion feedback will be spoken while this page remains open."):this.stopReading(),this.persistProgress()},this.startQuestionnaire=()=>{if(this.configurationError){this.showError(this.configurationError);return}if(this.studyConfig&&(this.participantCode=this.participantCode.trim(),!b(this.participantCode))){this.participantCodeError="Enter the valid pseudonymous participant code supplied by the study conductor.",this.showError(this.participantCodeError);return}this.startedAt=new Date().toISOString(),this.stage="ratings",this.ratingIndex=0,this.clearError(),this.persistProgress(),this.focusHeading()},this.goBack=()=>{this.stopReading(),this.clearVoiceAnswer(),this.stage==="ratings"&&this.ratingIndex>0?this.ratingIndex-=1:this.stage==="pairs"&&(this.pairIndex>0?this.pairIndex-=1:(this.stage="ratings",this.ratingIndex=this.dimensions.length-1)),this.clearError(),this.persistProgress(),this.focusHeading()},this.returnToRatings=()=>{this.stage="ratings",this.ratingIndex=this.dimensions.length-1,this.persistProgress(),this.focusHeading()},this.returnToPairs=()=>{this.stage="pairs",this.pairIndex=this.pairOrder.length-1,this.persistProgress(),this.focusHeading()},this.submitResponses=async()=>{if(!this.submittingResult)try{(!this.result||!this.submittedRecord)&&(this.result=Q(this.definition,this.ratings,this.pairResponses),this.submittedRecord=W({config:this.effectiveStudyConfig(),participantCode:this.studyConfig?this.participantCode:"DEMO",startedAt:this.startedAt||new Date().toISOString(),pairPresentationOrder:this.pairOrder.map(({id:t})=>t),pairwiseChoices:this.pairResponses,result:this.result,supportMetadata:this.currentSupportMetadata()}));const e=this.studyConfig?re():null;if(this.completionSavedLocally=this.studyConfig?K(this.submittedRecord):!1,this.completionSavedByHost=!1,this.hostSubmissionFailed=!1,this.hostSinkName="",this.hostReceipt=null,e){this.submittingResult=!0,this.statusMessage=`Submitting responses to ${e.name}.`,this.announceAutomatic(this.statusMessage);try{this.hostReceipt=await ue(this.submittedRecord,e),this.completionSavedByHost=!0,this.hostSinkName=e.name}catch(t){this.hostSubmissionFailed=!0;const s=t instanceof Error?t.message:"The study platform did not accept the response.";this.showError(`${s} Your answers remain on this page. Retry submission, return to an answer, or use a backup button below.`);return}finally{this.submittingResult=!1}}this.dispatchEvent(new CustomEvent("questionnaire-complete",{detail:this.submittedRecord,bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("nasa-tlx-complete",{detail:this.submittedRecord,bubbles:!0,composed:!0})),this.stage="complete",(!this.studyConfig||this.completionSavedLocally)&&this.clearSavedProgress(),this.stopGazeInput(),this.clearError(),this.focusHeading()}catch(e){this.submittingResult=!1,this.showError(e instanceof Error?e.message:"Responses could not be calculated.")}},this.downloadResultJson=()=>{this.submittedRecord&&this.downloadRecordJson(this.submittedRecord)},this.downloadResultCsv=()=>{this.submittedRecord&&this.downloadRecordCsv(this.submittedRecord)},this.restart=()=>{this.stopReading(!1),this.stopGazeInput(),this.releaseRecognition(),this.clearSavedProgress(),this.forgetParticipantCodeForTab(),this.stage="intro",this.ratingIndex=0,this.pairIndex=0,this.pairOrder=A(this.definition),this.pairResponses={},this.ratings={},this.ratingInputRoutes={},this.pairInputRoutes={},this.supportChanges=[],this.resumeSummaryVisible=!1,this.savedSession=null,this.recoveredCompletedRecord=null,this.result=null,this.submittedRecord=null,this.completionSavedLocally=!1,this.completionSavedByHost=!1,this.hostSubmissionFailed=!1,this.hostSinkName="",this.hostReceipt=null,this.submittingResult=!1,this.startedAt="",this.participantCodeError="",this.participantCodeRestoredForTab=!1,this.studyConfig&&(this.participantCode=""),this.errorMessage="",this.voiceState="idle",this.pendingVoiceAnswer=null,this.audioGuidance=!1,this.audioStatusMessage="",this.gazeUsed=!1,this.gazeActionCount=0,this.applyConfiguredSupport(),this.statusMessage="A new questionnaire has started.",window.scrollTo({top:0,behavior:"smooth"})},this.toggleReadAloud=()=>{if(this.readingAloud){this.stopReading(!0);return}this.speakText(this.currentStepSpeech())},this.startGazeInput=async()=>{if(!V(window.location)){this.gazeState="error",this.gazeMessage="Gaze input requires an HTTPS-hosted page or localhost.",this.announceAutomatic(this.gazeMessage);return}this.gazeState="loading",this.gazeMessage="Loading the pinned WebGazer library. Webcam permission will be requested next.";try{const e=await Se();if(!e.detectCompatibility())throw new Error("This browser does not expose a compatible webcam API.");this.webgazer=e,e.params.faceMeshSolutionPath=we,e.saveDataAcrossSessions(!1),await e.clearData(),e.showVideoPreview(!0),e.showFaceOverlay(!0),e.showFaceFeedbackBox(!0),e.showPredictionPoints(!1),e.setGazeListener(t=>this.handleGazePoint(t)),await e.begin(),e.removeMouseEventListeners(),await this.showGazePositioningStep("Camera started. Position your face, then continue to calibration.")}catch(e){this.gazeState="error",this.gazeMessage=e instanceof Error?`Gaze setup did not start: ${e.message}`:"Gaze setup did not start. Use another answer route.",this.announceAutomatic(this.gazeMessage),this.releaseGazeResources()}},this.restartGazeCalibration=async()=>{this.webgazer&&(this.cancelGazeProposal(),await this.webgazer.clearData(),await this.showGazePositioningStep("Recalibration started. Check your position before continuing."))},this.beginGazeCalibration=()=>{this.webgazer&&(this.restoreWebGazerPreviewContainer(),this.webgazer.showVideoPreview(!1),this.webgazer.showFaceOverlay(!1),this.webgazer.showFaceFeedbackBox(!1),this.webgazer.showPredictionPoints(!1),this.gazeCalibrationIndex=0,this.gazeCalibrationRepetition=0,this.gazeState="calibrating",this.gazeMessage="Camera preview hidden. Complete all 27 calibration samples.",this.announceAutomatic(this.gazeMessage),this.updateComplete.then(()=>this.querySelector(".calibration-point")?.focus()))},this.recordCalibrationPoint=e=>{if(!this.webgazer||this.gazeState!=="calibrating")return;const t=e.currentTarget.getBoundingClientRect();if(this.webgazer.recordScreenPosition(t.left+t.width/2,t.top+t.height/2,"click"),this.gazeCalibrationRepetition<y-1){this.gazeCalibrationRepetition+=1;return}if(this.gazeCalibrationIndex<$.length-1){this.gazeCalibrationIndex+=1,this.gazeCalibrationRepetition=0;return}this.gazeCalibrationRepetition=y,this.gazeState="ready",this.gazeUsed=!0,this.gazeMessage="Calibration complete. A red gaze dot is visible. Look at a large answer or navigation control for one second.",this.webgazer.showVideoPreview(!1),this.webgazer.showFaceOverlay(!1),this.webgazer.showFaceFeedbackBox(!1),this.webgazer.showPredictionPoints(!0),this.statusMessage="Gaze-assisted answering is ready.",this.announceAutomatic(this.statusMessage)},this.confirmGazeProposal=()=>{const e=this.gazePendingElement;if(!e)return;const t=this.gazePendingLabel;this.gazePendingElement=null,this.gazePendingLabel="",this.gazeDwellProgress=0,this.gazeConfirmationTracker.reset(),this.gazeActivationInProgress=!0;try{e.click(),this.gazeActionCount+=1,this.gazeUsed=!0,this.statusMessage=`${t} activated by confirmed gaze.`}finally{this.gazeActivationInProgress=!1}},this.cancelGazeProposal=()=>{this.gazePendingElement=null,this.gazePendingLabel="",this.gazeDwellProgress=0,this.gazeConfirmationTracker.reset(),this.statusMessage="Gaze proposal cancelled."},this.stopGazeInput=()=>{this.cancelGazeProposal(),this.resetGazeHover(),this.restoreWebGazerPreviewContainer(),this.releaseGazeResources(),this.gazeState="off",this.gazeMessage="Gaze input and camera stopped.",this.announceAutomatic(this.gazeMessage)},this.confirmVoiceAnswer=()=>{const e=this.pendingVoiceAnswer;if(!e)return;let t="";if(e.context==="rating"){const s=this.dimensions[this.ratingIndex],i=e.value;this.selectRating(s.id,i,"voice"),t=this.answerMode==="smiley"&&this.smileyLandmarks.some(r=>r.value===i)?`smiley-${s.id}-${i}`:`rating-${s.id}-${i}`}else{const s=this.pairOrder[this.pairIndex],i=e.value;this.selectPair(s.id,i,"voice"),t=`${s.id}-${i}`}this.voiceState="idle",this.voiceMessage="",this.pendingVoiceAnswer=null,this.updateComplete.then(()=>this.querySelector(`#${t}`)?.focus())},this.clearVoiceAnswer=()=>{this.releaseRecognition(),this.voiceState="idle",this.voiceMessage="",this.pendingVoiceAnswer=null},this.handleVisibilityChange=()=>{if(document.hidden){this.hiddenAt=Date.now();return}this.hiddenAt&&this.recoveryEnabled&&this.isInProgress()&&(this.resumeSummaryVisible=!0,this.interruptionSummaryShown=!0,this.statusMessage="Welcome back. A summary of your saved position is available.",this.updateComplete.then(()=>{this.querySelector("#resume-heading")?.focus(),this.announceAutomatic(this.resumeSummarySpeech())})),this.hiddenAt=null},this.dismissResumeSummary=()=>{this.resumeSummaryVisible=!1,this.statusMessage=`Continuing at ${this.currentPositionDescription()}.`,this.focusHeading()},this.restoreSavedSession=()=>{const e=this.savedSession;e&&(this.stage=e.stage,this.ratingIndex=e.ratingIndex,this.pairIndex=e.pairIndex,this.pairOrder=e.pairOrder,this.pairResponses=e.pairResponses,this.ratings=e.ratings,this.ratingInputRoutes=e.ratingInputRoutes,this.pairInputRoutes=e.pairInputRoutes,this.supportChanges=e.supportChanges,this.startedAt=e.startedAt,this.canAdjustAllSupport?(this.answerMode=e.support.answerMode,this.showSimpleLanguage=e.support.showSimpleLanguage,this.largeText=e.support.largeText,this.audioGuidance=!!e.support.audioGuidance):(this.applyConfiguredSupport(),this.canAdjustPresentationSupport&&(this.largeText=e.support.largeText,this.audioGuidance=!!e.support.audioGuidance)),this.recoveryEnabled=!0,this.savedSession=null,this.savedSessionAnnouncementKey="",this.resumeSummaryVisible=!0,this.interruptionSummaryShown=!0,this.updateComplete.then(()=>{this.querySelector("#resume-heading")?.focus(),this.announceAutomatic(this.resumeSummarySpeech())}))},this.eraseSavedSession=()=>{this.clearSavedProgress(),this.savedSession=null,this.savedSessionAnnouncementKey="",this.statusMessage="Saved answers erased."}}connectedCallback(){super.connectedCallback(),this.loadStudyConfiguration(),document.addEventListener("visibilitychange",this.handleVisibilityChange),queueMicrotask(()=>{this.restoreParticipantCodeForTab(),this.findSavedSession(),this.findCompletedBackup(),this.participantCodeRestoredForTab&&!this.savedSession&&this.recoveredCompletedRecord&&this.updateComplete.then(()=>{const e=this.querySelector("#completed-backup-heading");e&&x(e,{block:"start",onReveal:()=>this.requestParentReveal(e)})})})}disconnectedCallback(){document.removeEventListener("visibilitychange",this.handleVisibilityChange),this.stopReading(!1),this.releaseRecognition(),this.stopGazeInput(),super.disconnectedCallback()}createRenderRoot(){return this}loadStudyConfiguration(){if(this.configurationApplied)return;this.configurationApplied=!0;const e=new URLSearchParams(window.location.hash.startsWith("#")?window.location.hash.slice(1):window.location.hash),t=Y(window.location.hash);if(e.has("study")&&!t){this.configurationError="This participant link contains an invalid or incompatible study configuration. Ask the study conductor for a new link.";return}if(t&&(this.studyConfig=t,this.pairOrder=A(this.definition),this.applyConfiguredSupport(),t.collection.mode==="qualtrics")){if(window.parent===window){this.configurationError="This centrally collected questionnaire must be opened from the approved Qualtrics survey link. Ask the study conductor for that link.";return}if(document.referrer)try{if(new URL(document.referrer).origin!==t.collection.parentOrigin){this.configurationError="This questionnaire was embedded by an unexpected website. Ask the study conductor for the approved Qualtrics survey link.";return}}catch{this.configurationError="The embedding website could not be verified. Ask the study conductor for the approved Qualtrics survey link.";return}oe(t)}}applyConfiguredSupport(){const e=this.studyConfig?.support;e&&(this.showSimpleLanguage=e.showSimpleLanguage,this.answerMode=e.answerMode,this.largeText=e.largeText,this.audioGuidance=e.audioGuidance,this.recoveryEnabled=e.recoveryEnabled)}get definition(){return E(this.studyConfig?.instrumentId??k)}get dimensions(){return this.definition.items}get pairs(){return H(this.definition)}get ratingValues(){return J(this.definition)}get smileyLandmarks(){return this.definition.landmarks??[]}get dimensionById(){return new Map(this.dimensions.map(e=>[e.id,e]))}get canAdjustAllSupport(){return!this.studyConfig||this.studyConfig.support.participantAdjustmentPolicy==="participant-choice"}get canAdjustPresentationSupport(){return!this.studyConfig||this.studyConfig.support.participantAdjustmentPolicy==="presentation-only"||this.studyConfig.support.participantAdjustmentPolicy==="participant-choice"}get voiceInputAvailable(){return!this.studyConfig||this.studyConfig.support.voiceInputAvailable}get gazeInputAvailable(){return!this.studyConfig||this.studyConfig.support.gazeInputAvailable}render(){return n`
      <a class="skip-link" href="#question-panel">Skip to the current question</a>
      <main class=${`app-shell${this.largeText?" large-text":""}`} id="main-content">
        <p class="sr-only" aria-live="polite" aria-atomic="true">${this.statusMessage}</p>
        <header class="app-header">
          <p class="eyebrow">Accessible questionnaire platform · Version ${T}</p>
          <h1>${this.definition.name}</h1>
          <p class="subtitle">${this.definition.description}</p>
        </header>

        ${this.resumeSummaryVisible?this.renderResumeSummary():c}
        ${this.stage!=="intro"&&this.stage!=="complete"?this.renderProgress():c}
        ${this.stage!=="intro"&&this.stage!=="complete"?this.renderInQuestionSupport():c}
        ${this.gazePendingElement?this.renderGazeConfirmation():c}
        ${this.errorMessage?n`<div class="error-summary" role="alert" tabindex="-1" id="error-summary">
              <h2>There is a problem</h2>
              <p>${this.errorMessage}</p>
            </div>`:c}

        ${this.renderStage()}
      </main>
      ${this.gazeState==="positioning"?this.renderGazePositioning():c}
      ${this.gazeState==="calibrating"?this.renderGazeCalibration():c}
    `}renderInQuestionSupport(){return n`
      ${this.studyConfig?this.canAdjustAllSupport?n`<details class="support-toolbar">
              <summary>Adjust accessibility support (optional)</summary>
              <p>
                The study conductor has already prepared usable starting settings. You may change optional support if it
                helps you complete the questionnaire; every change is recorded separately from your scored answers.
              </p>
              ${this.renderSupportSettings("toolbar","all")}
            </details>`:this.canAdjustPresentationSupport?n`<details class="support-toolbar">
              <summary>Adjust display, audio or recovery (optional)</summary>
              <p>
                The study answer presentation and simpler-explanation setting remain fixed. You do not need to
                change these optional preferences to continue.
              </p>
              ${this.renderSupportSettings("toolbar","presentation-only")}
            </details>`:this.renderConfiguredSupportSummary():n`<details class="support-toolbar">
            <summary>Adjust accessibility support (optional)</summary>
            ${this.renderSupportSettings("toolbar","all")}
          </details>`}
      ${this.renderReadAloudControl()}
      ${this.renderGazeSetup()}
    `}renderStage(){switch(this.stage){case"intro":return this.renderIntro();case"ratings":return this.renderRating();case"pairs":return this.renderPair();case"review":return this.renderReview();case"complete":return this.renderComplete()}}renderIntro(){const e=this.definition.id===k?"Start the six ratings":`Start the ${this.dimensions.length} items`;return n`
      <section class="panel" id="question-panel" aria-labelledby="intro-heading">
        <h2 id="intro-heading">Before you begin</h2>
        ${this.configurationError?n`<div class="error-summary" role="alert"><h3>Study link problem</h3><p>${this.configurationError}</p></div>`:c}
        ${this.renderStudyContext()}
        ${this.savedSession?this.renderSavedSessionOffer():c}
        ${this.recoveredCompletedRecord?this.renderCompletedBackupOffer():c}
        <p>${this.definition.introPrompt}</p>
        ${this.studyConfig?n`<p>Study task: <strong>${this.studyConfig.taskLabel}</strong></p>`:c}
        <ol class="process-overview">
          <li>
            First, answer ${this.dimensions.length} items using values from
            ${this.definition.scale.minimum} to ${this.definition.scale.maximum}.
          </li>
          ${this.pairs.length?n`<li>Then, make ${this.pairs.length} pairwise comparisons.</li>`:c}
          <li>Finally, review and submit your responses.</li>
        </ol>

        <div class="boundary-note">
          <h3>Official questionnaire and optional support</h3>
          <p>
            ${this.definition.officialContentNotice}
            Optional accessibility supports remain separate from the scored response.
          </p>
          <p>
            Screen-reader compatibility is always on through headings, native controls, labels,
            focus movement and status announcements. It produces speech only when external software such as
            NVDA or VoiceOver is running. Built-in audio guidance is a separate option for users who want the page itself to speak.
          </p>
        </div>

        <details class="factor-reference">
          <summary>Review the ${this.dimensions.length} official ${this.pairs.length?"factor definitions":"items"}</summary>
          ${this.dimensions.map(t=>n`
              <div class="reference-item">
                <h3>${t.name}</h3>
                <p>${t.prompt}</p>
              </div>
            `)}
        </details>

        ${this.studyConfig?this.renderConfiguredSupportSummary():c}
        ${this.studyConfig?this.canAdjustAllSupport?n`<details class="support-toolbar participant-support-setup">
                <summary>Adjust accessibility support (optional)</summary>
                <p>
                  The study settings are already applied. You do not need to change anything before starting. If an
                  optional support preference helps, you may change it and the change will be recorded for the researcher.
                </p>
                ${this.renderSupportSettings("intro","all")}
              </details>`:this.canAdjustPresentationSupport?n`<details class="support-toolbar participant-support-setup">
                <summary>Adjust display, audio or recovery (optional)</summary>
                <p>
                  The study settings are already applied. You do not need to change anything before starting.
                  Simpler explanations and the standard/smiley answer presentation remain fixed by the study conductor.
                </p>
                ${this.renderSupportSettings("intro","presentation-only")}
              </details>`:c:n`<details class="support-toolbar participant-support-setup">
              <summary>Adjust accessibility support (optional)</summary>
              ${this.renderSupportSettings("intro","all")}
            </details>`}
        ${this.renderReadAloudControl()} ${this.renderGazeSetup()}

        <button
          class="primary-button large-answer-button"
          type="button"
          data-gaze-target
          data-gaze-label=${e}
          ?disabled=${!!this.configurationError}
          @click=${this.startQuestionnaire}
        >
          ${e}
        </button>
      </section>
    `}renderStudyContext(){return this.studyConfig?n`
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
          ${this.participantCodeError||(this.recoveryEnabled?"Letters, numbers, hyphens and underscores only; maximum 32 characters. If this page reloads in the same tab, this code is restored for that tab so interrupted answers can be found.":"Letters, numbers, hyphens and underscores only; maximum 32 characters.")}
        </p>
        ${this.participantCodeRestoredForTab?n`<p class="restored-code-note" role="status">
              Participant code restored for this tab. It will be forgotten when this tab is closed.
            </p>`:c}
      </aside>
    `:n`<aside class="study-context demo-context">
        <h3>Demonstration mode</h3>
        <p>This page is a technical demonstration. It does not upload answers or act as a remote research-data system.</p>
      </aside>`}renderConfiguredSupportSummary(){const e=this.studyConfig?.support;return e?n`
      <aside class="configured-support" aria-labelledby="configured-support-heading">
        <h3 id="configured-support-heading">Support prepared by the study conductor</h3>
        <p>You do not need to configure the questionnaire before starting.</p>
        <ul>
          ${this.definition.supports.simplerExplanations?n`<li>${e.showSimpleLanguage?"Simpler explanations shown":"Optional simpler help hidden"}</li>`:n`<li>Official item wording only; no reworded item support is enabled for this instrument</li>`}
          <li>
            ${e.answerMode==="smiley"?"Smiley landmark rating view":`Standard ${this.ratingValues.length}-value rating scale`}
          </li>
          <li>${e.largeText?"Large text":"Standard text size"}</li>
          <li>${e.recoveryEnabled?"Interruption recovery on":"Interruption recovery off"}</li>
          <li>${e.voiceInputAvailable?"Confirmed voice input available":"Built-in voice input not included"}</li>
          <li>${e.gazeInputAvailable?"Experimental gaze input available":"Experimental gaze input not included"}</li>
        </ul>
        <p>
          ${e.participantAdjustmentPolicy==="participant-choice"?"The starting settings are already applied. You may optionally change simpler explanations, answer presentation, text size, automatic spoken guidance or interruption recovery. Each change is recorded separately from your answers.":e.participantAdjustmentPolicy==="presentation-only"?"You may optionally change text size, automatic spoken guidance or interruption recovery. The answer presentation and simpler-explanation setting remain fixed.":"The prepared settings remain fixed for this study. You can still use any answer route that the study conductor made available."}
        </p>
      </aside>
    `:c}renderSupportSettings(e,t){const s=`support-${e}`;return n`
      <fieldset class="support-settings">
        <legend>${t==="all"?"Accessibility support options":"Display and recovery preferences"}</legend>

        ${t==="all"&&this.definition.supports.simplerExplanations?n`<label class="toggle-card" for=${`${s}-simple`}>
            <input
              id=${`${s}-simple`}
              type="checkbox"
              .checked=${this.showSimpleLanguage}
              @change=${i=>this.setSimpleLanguage(i)}
            />
            <span>
              <strong>Show simpler explanations</strong>
              <small>The official item remains visible once, without being duplicated inside the help.</small>
            </span>
          </label>`:c}

        ${t==="all"&&this.definition.supports.smileyLandmarks?n`<fieldset class="answer-mode-control">
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
              <span>
                <strong>Standard ${this.ratingValues.length}-value scale</strong>
                <small>Official ${this.definition.shortName} response values.</small>
              </span>
              ${this.answerMode==="standard"?n`<span class="selected-marker" aria-hidden="true">✓ Selected</span>`:c}
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
              ${this.answerMode==="smiley"?n`<span class="selected-marker" aria-hidden="true">✓ Selected</span>`:c}
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
    `}renderReadAloudControl(){const e="speechSynthesis"in window&&"SpeechSynthesisUtterance"in window;return n`
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
          ${this.readingAloud?"Stop speech":"Hear a summary of this step"}
        </button>
        ${this.audioStatusMessage?n`<p class="audio-status" role="status" aria-atomic="true">${this.audioStatusMessage}</p>`:c}
        ${this.canAdjustPresentationSupport?n`<label class="audio-guidance-toggle">
              <input
                type="checkbox"
                .checked=${this.audioGuidance}
                ?disabled=${!e}
                @change=${this.setAudioGuidance}
              />
              <span>
                <strong>Automatically read new questions, selected answers and feedback aloud</strong>
                <small>
                  Default off. This includes voice proposals, simpler help, recovery summaries,
                  errors and completion feedback while this page remains open.
                </small>
              </span>
            </label>`:n`<small>Automatic spoken guidance is ${this.audioGuidance?"on":"off"} in the study configuration.</small>`}
        <small>
          ${e?"Uses the browser speech-synthesis voice; no audio is recorded.":"Built-in audio is unavailable in this browser. External screen readers can still use the semantic page."}
        </small>
      </div>
    `}renderCompletionReadAloudControl(){const e="speechSynthesis"in window&&"SpeechSynthesisUtterance"in window;return n`
      <div class="quick-support audio-guidance completion-audio" aria-label="Result audio guidance">
        <button
          class="secondary-button large-answer-button"
          type="button"
          ?disabled=${!e}
          @click=${this.toggleReadAloud}
        >
          ${this.readingAloud?"Stop speech":"Hear the result summary"}
        </button>
        ${this.audioStatusMessage?n`<p class="audio-status" role="status" aria-atomic="true">${this.audioStatusMessage}</p>`:c}
        <small>
          ${e?"Uses the browser speech-synthesis voice; no audio is recorded.":"Built-in audio is unavailable in this browser. External screen readers can still read the result."}
        </small>
      </div>
    `}renderGazeSetup(){if(!this.gazeInputAvailable)return c;const e=V(window.location),t=this.gazeState==="loading"||this.gazeState==="positioning"||this.gazeState==="calibrating"||this.gazeState==="ready";return n`
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
          ${e?c:n`<p class="gaze-warning" role="status">
                Gaze input requires the future HTTPS-hosted demo. Continue using the other answer routes in this downloaded file.
              </p>`}
          <div class="button-row compact">
            ${t?n`<button class="secondary-button large-answer-button" type="button" @click=${this.stopGazeInput}>
                  Stop gaze and camera
                </button>`:n`<button
                  class="secondary-button large-answer-button"
                  type="button"
                  ?disabled=${!e}
                  @click=${this.startGazeInput}
                >
                  ${this.gazeState==="error"?"Try gaze setup again":"Start camera and calibration"}
                </button>`}
            ${this.gazeState==="ready"?n`<button class="secondary-button" type="button" @click=${this.restartGazeCalibration}>
                  Recalibrate
                </button>`:c}
          </div>
          ${this.gazeMessage?n`<p class="gaze-status" role="status">${this.gazeMessage}</p>`:c}
        </div>
      </details>
    `}renderGazePositioning(){return n`
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
    `}renderGazeCalibration(){const e=$[this.gazeCalibrationIndex],t=this.gazeCalibrationIndex*y+this.gazeCalibrationRepetition,s=$.length*y;return n`
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
    `}renderGazeConfirmation(){return n`
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
    `}renderProgress(){const e=Object.keys(this.ratings).length+Object.keys(this.pairResponses).length,t=this.dimensions.length+this.pairOrder.length,s=this.stage==="ratings"?"Ratings":this.stage==="pairs"?"Comparisons":"Review";return n`
      <nav class="progress-card" aria-label="Questionnaire progress">
        <p><strong>${s}:</strong> ${e} of ${t} responses completed</p>
        <progress max=${t} value=${e}>${e} of ${t}</progress>
      </nav>
    `}renderRating(){const e=this.dimensions[this.ratingIndex],t=this.ratings[e.id];return n`
      <section class="panel" id="question-panel" aria-labelledby="rating-heading">
        <p class="step-label">Rating ${this.ratingIndex+1} of ${this.dimensions.length}</p>
        <h2 id="rating-heading">${e.name}</h2>
        <p class="official-definition">
          <strong>${this.pairs.length?"Official definition":"Official item"}:</strong>
          ${e.prompt}
        </p>

        ${this.definition.supports.simplerExplanations?this.showSimpleLanguage?n`<aside class="simple-language-panel" aria-label="Simpler explanation">
              <p class="support-label">Simpler explanation</p>
              <p>${e.simpleExplanation}</p>
              <p class="support-boundary">Use the official scale when choosing your response.</p>
            </aside>`:n`<details
              class="optional-explanation"
              @toggle=${s=>this.speakOpenedHelp(s,`Simpler explanation for ${e.name}. ${e.simpleExplanation}`)}
            >
              <summary>Show a simpler explanation</summary>
              <div class="explanation-block">
                <p>${e.simpleExplanation}</p>
                <p class="support-boundary">This help does not replace the official definition.</p>
              </div>
            </details>`:c}

        ${this.answerMode==="smiley"&&this.definition.supports.smileyLandmarks?n`
              ${this.renderSmileyResponse(e,t)}
              <details class="precision-scale">
                <summary>Choose a more precise value on the full scale</summary>
                ${this.renderFullRatingScale(e,t)}
              </details>
            `:this.renderFullRatingScale(e,t)}

        ${this.renderVoiceInput("rating",e)}
        ${this.renderNavigation(this.ratingIndex>0,"rating")}
      </section>
    `}renderFullRatingScale(e,t){return n`
      <fieldset class="rating-fieldset">
        <legend>
          Rate ${e.name}: ${this.definition.scale.minimum} is ${e.lowAnchor};
          ${this.definition.scale.maximum} is ${e.highAnchor}
        </legend>
        <div class="rating-anchors" aria-hidden="true">
          <span>${this.definition.scale.minimum} — ${e.lowAnchor}</span>
          <span>${this.definition.scale.maximum} — ${e.highAnchor}</span>
        </div>
        <div class="rating-grid">
          ${this.ratingValues.map(s=>{const i=`rating-${e.id}-${s}`;return n`
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
                ${t===s?n`<span class="selected-marker selected-check" aria-hidden="true">✓</span>`:c}
              </label>
            `})}
        </div>
      </fieldset>
    `}renderSmileyResponse(e,t){return n`
      <fieldset class="smiley-response">
        <legend>Rate ${e.name} with a smiley landmark</legend>
        <p id=${`smiley-help-${e.id}`}>
          Each face is one official value. Facial expression may imply good or bad, so this route is experimental.
        </p>
        <div class="smiley-grid">
          ${this.smileyLandmarks.map(({value:s,cue:i})=>{const a=`smiley-${e.id}-${s}`;return n`
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
                  ${t===s?n`<span class="selected-marker" aria-hidden="true">✓ Selected</span>`:c}
                </span>
              </label>
            `})}
        </div>
      </fieldset>
    `}renderPair(){const e=this.pairOrder[this.pairIndex],t=this.dimensionById.get(e.left),s=this.dimensionById.get(e.right),i=this.pairResponses[e.id];return n`
      <section class="panel" id="question-panel" aria-labelledby="pair-heading">
        <p class="step-label">Comparison ${this.pairIndex+1} of ${this.pairOrder.length}</p>
        <h2 id="pair-heading">${this.definition.pairwise.prompt}</h2>
        <p class="pair-instruction">
          ${this.definition.pairwise.instruction}
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
    `}renderPairChoice(e,t,s){const i=`${e}-${t.id}`;return n`
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
          ${this.showSimpleLanguage?n`<small>${t.shortMeaning}</small>`:c}
        </span>
        ${s?n`<span class="selected-marker" aria-hidden="true">✓ Selected</span>`:c}
      </label>
    `}renderPairHelp(e,t){return this.showSimpleLanguage?n`<p class="simple-pair-prompt">In simpler words: ${this.definition.pairwise.simplePrompt}</p>`:n`
      <details
        class="optional-explanation pair-help"
        @toggle=${s=>this.speakOpenedHelp(s,`Simpler explanations. ${e.name}: ${e.simpleExplanation} ${t.name}: ${t.simpleExplanation}`)}
      >
        <summary>Need help with these factor names?</summary>
        <div class="explanation-grid">
          ${[e,t].map(s=>n`
              <div class="explanation-block">
                <h3>${s.name}</h3>
                <p>${s.simpleExplanation}</p>
              </div>
            `)}
        </div>
      </details>
    `}renderVoiceInput(e,t,s){if(!this.voiceInputAvailable)return c;const i=!!(window.SpeechRecognition??window.webkitSpeechRecognition),a=this.pendingVoiceAnswer?.context===e,r=e==="rating"?this.ratingVoicePrompt(t):`Say “${t.name}” or “${s.name}”.`;return n`
      <details class="voice-input" .open=${this.voiceState!=="idle"}>
        <summary>Answer this question by voice</summary>
        <div class="voice-input-content">
          <p>${r}</p>
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
          ${i?c:n`<p role="status">
                Built-in voice recognition is unavailable in this browser. System voice control can still activate
                the visible buttons by name.
              </p>`}
          ${this.voiceMessage?n`<p role="status" aria-live="polite" aria-atomic="true">${this.voiceMessage}</p>`:c}
          ${a&&this.pendingVoiceAnswer?n`
                <div class="voice-confirmation">
                  <p>I heard: <strong>${this.pendingVoiceAnswer.transcript}</strong></p>
                  <p>Proposed answer: <strong>${this.pendingVoiceAnswer.label}</strong></p>
                  <div class="button-row compact">
                    <button
                      class="primary-button large-answer-button"
                      type="button"
                      data-voice-confirm
                      @click=${this.confirmVoiceAnswer}
                    >
                      Confirm ${this.pendingVoiceAnswer.label}
                    </button>
                    <button class="secondary-button" type="button" @click=${this.clearVoiceAnswer}>Try again</button>
                  </div>
                </div>
              `:c}
        </div>
      </details>
    `}renderNavigation(e,t){const s=t==="rating"&&this.ratingIndex===this.dimensions.length-1,i=t==="pair"&&this.pairIndex===this.pairOrder.length-1,a=s?this.pairOrder.length?"Continue to comparisons":"Review responses":i?"Review responses":"Next question";return n`
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
          data-gaze-label=${a}
          @click=${()=>this.goNext(t)}
        >
          ${a}
        </button>
      </div>
    `}renderReview(){return n`
      <section class="panel" id="question-panel" aria-labelledby="review-heading">
        <h2 id="review-heading">Review your responses</h2>
        <p>Check every response before calculating the ${this.definition.scoring.scoreName.toLowerCase()}.</p>

        ${this.hostSubmissionFailed&&this.submittedRecord?n`
              <section class="submission-recovery" aria-labelledby="submission-recovery-heading">
                <h3 id="submission-recovery-heading">The study platform has not confirmed this response</h3>
                <p>
                  Your answers remain available on this page. You can retry submission, return to an answer,
                  or save a backup now.
                </p>
                ${this.completionSavedLocally?n`<p>A complete backup is also stored in this browser on this device.</p>`:n`<p>
                      This browser could not store a backup. Download JSON or CSV before leaving this page.
                    </p>`}
                <div class="button-row compact">
                  <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultJson}>
                    Download JSON backup
                  </button>
                  <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultCsv}>
                    Download CSV backup
                  </button>
                </div>
              </section>
            `:c}

        <h3>Item responses</h3>
        <dl class="review-ratings">
          ${this.dimensions.map(e=>n`
              <div>
                <dt>${e.name}</dt>
                <dd>
                  ${this.ratings[e.id]}
                  <small>(${this.ratingRouteLabel(e.id)})</small>
                </dd>
              </div>
            `)}
        </dl>

        ${this.pairOrder.length?n`<h3>Pairwise comparisons</h3>
              <ol class="review-list">
                ${this.pairOrder.map(e=>{const t=this.dimensionById.get(e.left),s=this.dimensionById.get(e.right),i=this.dimensionById.get(this.pairResponses[e.id]);return n`<li>${t.name} or ${s.name}: <strong>${i.name}</strong></li>`})}
              </ol>`:c}

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
          ${this.pairOrder.length?n`<button
                class="secondary-button large-answer-button"
                type="button"
                data-gaze-target
                data-gaze-label="Return to comparisons"
                @click=${this.returnToPairs}
              >
                Return to comparisons
              </button>`:c}
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
    `}renderComplete(){if(!this.result||!this.submittedRecord)return c;const e=!this.studyConfig||this.studyConfig.showScoreToParticipant;return n`
      <section class="panel confirmation" id="question-panel" aria-labelledby="complete-heading">
        <h2 id="complete-heading">${this.studyConfig?"Result prepared":"Responses calculated"}</h2>
        ${e?n`<p class="score">
              ${this.result.scoreName}:
              <strong>${this.result.primaryScore.toFixed(2)}</strong>
              out of ${this.result.scoreMaximum}
            </p>`:n`<p>Your responses have been recorded. The study configuration does not display the calculated score on the participant page.</p>`}
        ${this.studyConfig?this.completionSavedByHost?n`<div class="save-status" role="status">
                <h3>Completing in the study platform — keep this page open</h3>
                <p>
                  ${this.hostSinkName} acknowledged submission
                  <strong>${this.hostReceipt?.receiptId||this.submittedRecord.submissionId}</strong>
                  and is completing the response now. Please keep this page open until the recorded
                  result page opens by itself. You do not need to press anything.
                </p>
                ${this.completionSavedLocally?c:n`<p>
                      This browser could not keep a backup copy. If the recorded result page does not
                      appear, use the JSON or CSV backup button below before closing the page.
                    </p>`}
              </div>`:this.completionSavedLocally?n`<div class="save-status" role="status">
                <h3>Saved on this device</h3>
                <p>
                  The completed record is stored only in this browser. It has not been sent to GitHub or to a server.
                  The study conductor must export it from the study setup page before browser data are cleared.
                </p>
              </div>`:n`<div class="error-summary" role="alert">
                <h3>The browser could not save the completed record</h3>
                <p>Use the JSON or CSV backup button below and give the file to the study conductor through the approved study procedure.</p>
              </div>`:n`<p>No response, audio or webcam video has been uploaded. Demonstration results are not retained after this page is closed.</p>`}
        <p>Support and input-route metadata remain separate from the questionnaire score.</p>
        ${!this.studyConfig||!this.completionSavedByHost?this.renderCompletionReadAloudControl():c}
        ${this.studyConfig?c:n`<details>
              <summary>Show the complete result record</summary>
              <pre>${JSON.stringify(this.submittedRecord,null,2)}</pre>
            </details>`}
        ${this.studyConfig&&this.completionSavedByHost?n`<aside class="submission-fallback" aria-labelledby="submission-fallback-heading">
              <h3 id="submission-fallback-heading">Emergency backup if this page does not advance</h3>
              <p>
                No download is required during the normal automatic transition. If this page remains visible
                instead of opening the recorded result page, or an error appears, use one backup button and
                contact the study conductor.
              </p>
              <div class="button-row compact">
                <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultJson}>
                  Download JSON backup
                </button>
                <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultCsv}>
                  Download CSV backup
                </button>
              </div>
            </aside>`:n`<div class="button-row compact">
              <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultJson}>
                Download JSON backup
              </button>
              <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultCsv}>
                Download CSV backup
              </button>
              ${this.studyConfig?c:n`<button class="secondary-button large-answer-button" type="button" @click=${this.restart}>Start again</button>`}
            </div>`}
        ${this.studyConfig?n`<p>
              <strong>Participant:</strong>
              ${this.completionSavedByHost?"please keep this page open and wait for the recorded result page to open automatically.":"please return the device or completion notice to the study conductor."}
            </p>`:c}
      </section>
    `}announceSavedSessionOffer(e){const t=`${e.configId}:${e.participantCode}:${e.savedAt}`;if(this.savedSessionAnnouncementKey===t)return;this.savedSessionAnnouncementKey=t;const s=this.savedSessionOfferSpeech(e);this.statusMessage="",this.updateComplete.then(()=>{const i=this.savedSession;if(!i||i.savedAt!==e.savedAt||i.configId!==e.configId||i.participantCode!==e.participantCode)return;const a=this.querySelector("#saved-session-offer");a&&x(a,{block:"center",forceCoordinateScroll:!0,onReveal:()=>this.requestParentReveal(a)}),window.setTimeout(()=>{const r=this.savedSession;!this.isConnected||!r||r.savedAt!==e.savedAt||r.configId!==e.configId||r.participantCode!==e.participantCode||(this.statusMessage=s,this.audioGuidance&&this.speakText(s))},650)})}savedSessionOfferSpeech(e){return`Saved questionnaire found. ${Object.keys(e.ratings).length+Object.keys(e.pairResponses).length} of ${this.dimensions.length+this.pairs.length} responses are saved in this browser. Resume saved questionnaire. Erase saved answers.`}renderSavedSessionOffer(){if(!this.savedSession)return c;const e=Object.keys(this.savedSession.ratings).length+Object.keys(this.savedSession.pairResponses).length;return n`
      <aside
        id="saved-session-offer"
        class="saved-session"
        role="region"
        tabindex="-1"
        aria-labelledby="saved-session-heading"
        aria-describedby="saved-session-count saved-session-actions"
      >
        <h3 id="saved-session-heading">Saved questionnaire found</h3>
        <p id="saved-session-count">
          ${e} of ${this.dimensions.length+this.pairs.length} responses are saved in this browser.
        </p>
        <p id="saved-session-actions">
          Resume saved questionnaire. Erase saved answers.
        </p>
        <div class="button-row compact">
          <button
            id="resume-saved-questionnaire"
            class="primary-button large-answer-button"
            type="button"
            aria-describedby="saved-session-count saved-session-actions"
            @click=${this.restoreSavedSession}
          >
            Resume saved questionnaire
          </button>
          <button class="secondary-button" type="button" @click=${this.repeatSavedSessionOffer}>
            Hear saved-progress message
          </button>
          <button class="secondary-button" type="button" @click=${this.eraseSavedSession}>Erase saved answers</button>
        </div>
      </aside>
    `}renderCompletedBackupOffer(){const e=this.recoveredCompletedRecord;return e?n`
      <aside class="saved-session completed-backup" aria-labelledby="completed-backup-heading">
        <h3 id="completed-backup-heading" tabindex="-1">A completed backup was found on this device</h3>
        <p>
          Submission <strong>${e.submissionId}</strong> was prepared for this participant code.
          This local copy does not prove that Qualtrics recorded the response.
        </p>
        <p>
          Do not repeat the questionnaire unless the study conductor asks you to. Keep or download
          this backup so the response can be checked safely.
        </p>
        <div class="button-row compact">
          <button
            class="primary-button large-answer-button"
            type="button"
            @click=${()=>this.downloadRecordJson(e)}
          >
            Download recovered JSON
          </button>
          <button
            class="secondary-button large-answer-button"
            type="button"
            @click=${()=>this.downloadRecordCsv(e)}
          >
            Download recovered CSV
          </button>
        </div>
      </aside>
    `:c}renderResumeSummary(){return n`
      <aside class="resume-summary" aria-labelledby="resume-heading">
        <h2 id="resume-heading" tabindex="-1">Welcome back — here is where you stopped</h2>
        <dl class="resume-details">
          <div><dt>Completed</dt><dd>${this.completedCount()} of ${this.dimensions.length+this.pairs.length} responses</dd></div>
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
    `}setSimpleLanguage(e){const t=e.currentTarget.checked;this.recordSupportChange("simpler-explanations",this.showSimpleLanguage,t),this.showSimpleLanguage=t,this.invalidatePendingSubmission(),this.persistProgress(),this.announceAutomatic(t?this.currentSimpleExplanationSpeech():"Simpler explanations are off. The official questionnaire wording remains available.")}recordSupportChange(e,t,s){!this.studyConfig||t===s||this.stage==="complete"||(this.supportChanges=[...this.supportChanges,{setting:e,from:t,to:s,stage:this.stage,changedAt:new Date().toISOString()}])}setAnswerMode(e){e==="smiley"&&!this.definition.supports.smileyLandmarks||(this.recordSupportChange("answer-mode",this.answerMode,e),this.answerMode=e,this.invalidatePendingSubmission(),this.persistProgress(),this.announceAutomatic(e==="smiley"?"Smiley landmark answer format selected. Each rating offers five labelled values, with the full precise scale available on request.":`Standard answer format selected. Each rating uses ${this.ratingValues.length} values from ${this.definition.scale.minimum} to ${this.definition.scale.maximum} in steps of ${this.definition.scale.step}.`))}setLargeText(e){this.recordSupportChange("text-size",this.largeText?"large":"standard",e?"large":"standard"),this.largeText=e,this.invalidatePendingSubmission(),this.persistProgress(),this.announceAutomatic(`${e?"Large":"Standard"} text selected.`)}setRecovery(e){const t=e.currentTarget.checked;this.recordSupportChange("interruption-recovery",this.recoveryEnabled,t),this.recoveryEnabled=t,this.invalidatePendingSubmission(),this.recoveryEnabled?(this.rememberParticipantCodeForTab(),this.persistProgress()):(this.forgetParticipantCodeForTab(),this.clearSavedProgress()),this.announceAutomatic(t?"Interruption recovery is on. Incomplete answers will be stored in this browser.":"Interruption recovery is off. The saved in-progress copy has been removed.")}landmarkLabel(e,t){const s=this.smileyLandmarks.find(i=>i.value===t)?.position;return s==="low"?e.lowAnchor:s==="closer-low"?`Closer to ${e.lowAnchor}`:s==="middle"?"Middle":s==="closer-high"?`Closer to ${e.highAnchor}`:s==="high"?e.highAnchor:String(t)}ratingVoicePrompt(e){if(this.answerMode!=="smiley")return`Say one shown value from ${this.definition.scale.minimum} to ${this.definition.scale.maximum} in steps of ${this.definition.scale.step}.`;const t=this.smileyLandmarks.map(({value:i})=>this.landmarkLabel(e,i)),s=this.smileyLandmarks.map(({value:i})=>i);return`For the most reliable voice input, say one shown value: ${s.slice(0,-1).join(", ")}, or ${s.at(-1)}. You may instead say one visible label: ${t.slice(0,-1).join(", ")}, or ${t.at(-1)}. On a phone, use the number if a short label such as Low is not recognised.`}ratingVoiceAnswerLabel(e,t){return this.answerMode==="smiley"&&this.smileyLandmarks.some(i=>i.value===t)?`${this.landmarkLabel(e,t)}, value ${t}, for ${e.name}`:`${t} for ${e.name}`}ratingRouteLabel(e){const t=this.ratingInputRoutes[e];return t==="smiley-landmark"?"smiley landmark":t==="voice"?"voice, confirmed":t==="gaze-standard-scale"?"gaze, standard scale, confirmed":t==="gaze-smiley-landmark"?"gaze, smiley landmark, confirmed":"full scale"}selectRating(e,t,s){s!=="voice"&&this.voiceState!=="idle"&&this.clearVoiceAnswer(),this.invalidatePendingSubmission();const i=this.gazeActivationInProgress?s==="smiley-landmark"?"gaze-smiley-landmark":"gaze-standard-scale":s;this.ratings={...this.ratings,[e]:t},this.ratingInputRoutes={...this.ratingInputRoutes,[e]:i},this.clearError();const a=this.dimensionById.get(e),r=this.answerMode==="smiley"&&this.smileyLandmarks.some(u=>u.value===t);this.statusMessage=r?`${a.name}, ${this.landmarkLabel(a,t)}, value ${t}, selected.`:`${a.name}, ${t}, selected.`,this.announceAutomatic(this.statusMessage),this.persistProgress()}selectPair(e,t,s){s!=="voice"&&this.voiceState!=="idle"&&this.clearVoiceAnswer(),this.invalidatePendingSubmission();const i=this.gazeActivationInProgress?"gaze":s;this.pairResponses={...this.pairResponses,[e]:t},this.pairInputRoutes={...this.pairInputRoutes,[e]:i},this.clearError(),this.statusMessage=`${this.dimensionById.get(t).name} selected.`,this.announceAutomatic(this.statusMessage),this.persistProgress()}goNext(e){if(this.stopReading(),this.clearVoiceAnswer(),e==="rating"){const t=this.dimensions[this.ratingIndex];if(this.ratings[t.id]===void 0){this.showError(`Choose a rating for ${t.name} before continuing.`);return}this.ratingIndex<this.dimensions.length-1?this.ratingIndex+=1:this.pairOrder.length?(this.stage="pairs",this.pairIndex=0):this.stage="review"}else{const t=this.pairOrder[this.pairIndex];if(!this.pairResponses[t.id]){this.showError("Choose which factor contributed more to workload before continuing.");return}this.pairIndex<this.pairOrder.length-1?this.pairIndex+=1:this.stage="review"}this.clearError(),this.persistProgress(),this.focusHeading()}effectiveStudyConfig(){return this.studyConfig?this.studyConfig:{schemaVersion:4,configId:"demo-config",createdAt:this.startedAt||new Date().toISOString(),prototypeVersion:T,instrumentId:this.definition.id,studyId:"DEMO",studyTitle:"Technical demonstration",taskLabel:"a task completed before the questionnaire",showScoreToParticipant:!0,support:{showSimpleLanguage:!1,answerMode:"standard",largeText:!1,audioGuidance:!1,recoveryEnabled:!1,participantAdjustmentPolicy:"presentation-only",voiceInputAvailable:!0,gazeInputAvailable:!0},collection:{mode:"local"}}}currentSupportMetadata(){return{simplerExplanationsShownAtSubmission:this.showSimpleLanguage,largeTextUsedAtSubmission:this.largeText,answerModeAtSubmission:this.answerMode,recoveryEnabledAtSubmission:this.recoveryEnabled,interruptionSummaryShown:this.interruptionSummaryShown,readAloudUsed:this.readAloudUsed,automaticAudioGuidanceEnabledAtSubmission:this.audioGuidance,gazeUsed:this.gazeUsed,gazeActionCount:this.gazeActionCount,gazeEngine:this.gazeUsed?`WebGazer ${C}`:null,ratingInputRoutes:this.ratingInputRoutes,pairInputRoutes:this.pairInputRoutes,supportChanges:[...this.supportChanges]}}downloadRecordJson(e){M(`${L(e)}.json`,JSON.stringify(e,null,2),"application/json")}downloadRecordCsv(e){M(`${L(e)}.csv`,`\uFEFF${Z([e])}`,"text/csv")}invalidatePendingSubmission(){this.submittedRecord&&this.completionSavedLocally&&!this.completionSavedByHost&&X(this.submittedRecord.submissionId),this.result=null,this.submittedRecord=null,this.completionSavedLocally=!1,this.completionSavedByHost=!1,this.hostSubmissionFailed=!1,this.hostSinkName="",this.hostReceipt=null}announceAutomatic(e){this.audioGuidance&&e.trim()&&this.speakText(e)}speakOpenedHelp(e,t){e.currentTarget.open&&this.announceAutomatic(t)}speakText(e){if(!("speechSynthesis"in window)||!("SpeechSynthesisUtterance"in window)){this.audioStatusMessage="Built-in audio is unavailable in this browser. External screen readers can still read the page.";return}const t=window.speechSynthesis,s=this.readingAloud||t.speaking||t.pending||t.paused,i=++this.speechRequestId,a=new SpeechSynthesisUtterance(e);a.lang="en-GB",a.rate=1,a.pitch=1,a.volume=1,a.onend=()=>{i===this.speechRequestId&&(this.readingAloud=!1,this.audioStatusMessage="Spoken guidance finished.")},a.onerror=u=>{if(i!==this.speechRequestId)return;this.readingAloud=!1;const p=u.error?` (${u.error})`:"";this.audioStatusMessage=`No audio was played because the browser reported a speech error${p}. Check the device volume and try the button again.`};const r=()=>{if(i===this.speechRequestId)try{t.speak(a),this.readingAloud=!0,this.readAloudUsed=!0,this.audioStatusMessage="Playing spoken guidance."}catch{this.readingAloud=!1,this.audioStatusMessage="Built-in audio could not start in this browser. Check the device volume and try the button again."}};s?(t.cancel(),window.setTimeout(r,0)):r()}stopReading(e=!1){this.speechRequestId+=1,"speechSynthesis"in window&&window.speechSynthesis.cancel(),this.readingAloud=!1,e&&(this.audioStatusMessage="Spoken guidance stopped.")}currentStepSpeech(){if(this.stage==="intro"){const t=this.studyConfig?`Think about ${this.studyConfig.taskLabel}.`:"",s=this.answerMode==="smiley"?"The rating format uses five labelled smiley landmarks. A precise scale is available on request.":`The rating format uses ${this.ratingValues.length} values from ${this.definition.scale.minimum} to ${this.definition.scale.maximum}.`,i=this.pairs.length?` Then make ${this.pairs.length} pairwise comparisons.`:"";return`Before you begin. ${this.definition.introPrompt} ${t} Answer ${this.dimensions.length} items. ${s}${i} Finally review and submit.`}if(this.stage==="ratings"){const t=this.dimensions[this.ratingIndex],s=this.showSimpleLanguage&&t.simpleExplanation?` Simpler explanation: ${t.simpleExplanation}`:"",i=this.answerMode==="smiley"?`Choose a smiley landmark: ${this.smileyLandmarks.map(({value:a})=>`${this.landmarkLabel(t,a)}, value ${a}`).join("; ")}. A more precise value is available on the full scale.`:`Rate from ${this.definition.scale.minimum}, ${t.lowAnchor}, to ${this.definition.scale.maximum}, ${t.highAnchor}, in steps of ${this.definition.scale.step}.`;return`Rating ${this.ratingIndex+1} of ${this.dimensions.length}. ${t.name}. Official item: ${t.prompt}.${s} ${i}`}if(this.stage==="pairs"){const t=this.pairOrder[this.pairIndex],s=this.dimensionById.get(t.left),i=this.dimensionById.get(t.right),a=this.showSimpleLanguage?` In simpler words, ${this.definition.pairwise.simplePrompt} ${s.name}: ${s.shortMeaning}. ${i.name}: ${i.shortMeaning}.`:"";return`Comparison ${this.pairIndex+1} of ${this.pairOrder.length}. ${this.definition.pairwise.prompt} ${this.definition.pairwise.instruction} Choose ${s.name} or ${i.name}.${a}`}return this.stage==="review"?`Review ${this.dimensions.length} item responses${this.pairs.length?` and ${this.pairs.length} comparisons`:""} before submitting.`:this.studyConfig&&this.completionSavedByHost?"Answers accepted. The study platform is finishing automatically.":this.result?`Responses calculated.${!this.studyConfig||this.studyConfig.showScoreToParticipant?` ${this.result.scoreName}: ${this.result.primaryScore.toFixed(2)} out of ${this.result.scoreMaximum}.`:""} JSON and CSV backup buttons are available on this page.`:"Responses calculated."}currentSimpleExplanationSpeech(){if(this.stage==="ratings"){const e=this.dimensions[this.ratingIndex];return e.simpleExplanation?`Simpler explanation for ${e.name}. ${e.simpleExplanation} Use the official scale when choosing your response.`:"This questionnaire definition does not provide reworded item text."}if(this.stage==="pairs"){const e=this.pairOrder[this.pairIndex],t=this.dimensionById.get(e.left),s=this.dimensionById.get(e.right);return`In simpler words, ${this.definition.pairwise.simplePrompt} ${t.name}: ${t.shortMeaning}. ${s.name}: ${s.shortMeaning}.`}return"Simpler explanations are on. Official questionnaire wording remains visible."}resumeSummarySpeech(){return`Welcome back. ${this.completedCount()} of ${this.dimensions.length+this.pairs.length} responses completed. Last saved response: ${this.lastSavedDescription()}. Current position: ${this.currentPositionDescription()}. Next action: ${this.nextActionDescription()}`}async showGazePositioningStep(e){this.webgazer&&(this.restoreWebGazerPreviewContainer(),this.webgazer.showPredictionPoints(!1),this.webgazer.showVideoPreview(!0),this.webgazer.showFaceOverlay(!0),this.webgazer.showFaceFeedbackBox(!0),this.gazeState="positioning",this.gazeMessage=e,this.announceAutomatic(this.gazeMessage),await this.updateComplete,this.mountWebGazerPreview(),this.querySelector("#gaze-positioning-heading")?.focus())}mountWebGazerPreview(){const e=this.querySelector(".gaze-camera-preview-slot"),t=document.querySelector("#webgazerVideoContainer");!e||!t||(t.setAttribute("aria-hidden","true"),e.append(t))}restoreWebGazerPreviewContainer(){const e=document.querySelector("#webgazerVideoContainer");e&&e.parentElement!==document.body&&document.body.append(e)}handleGazePoint(e){if(this.gazeState!=="ready"||!e){this.resetGazeHover();return}const t=this.elementsAtGazePoint(e);if(this.gazePendingElement){const u=t.map(g=>g.closest("[data-gaze-confirm], [data-gaze-cancel]")).find(g=>g!==null)??null,p=u?.hasAttribute("data-gaze-confirm")?"confirm":u?.hasAttribute("data-gaze-cancel")?"cancel":null,h=this.gazeConfirmationTracker.update(p,performance.now());this.gazeDwellProgress=h.progress,h.activated&&p==="confirm"&&this.confirmGazeProposal(),h.activated&&p==="cancel"&&this.cancelGazeProposal();return}const s=t.map(u=>u.closest("[data-gaze-target]")).find(u=>u!==null)??null,i=s&&!s.matches(":disabled")?s:null;i!==this.gazeCandidateElement&&(this.resetGazeHover(),this.gazeCandidateElement=i);const a=i?.dataset.gazeLabel??i?.textContent?.trim()??null,r=this.gazeCandidateTracker.update(a,performance.now());this.setGazeHover(i,r.progress),i&&r.activated&&(this.gazePendingElement=i,this.gazePendingLabel=a??"selected control",this.gazeDwellProgress=0,this.resetGazeHover(),this.statusMessage=`${this.gazePendingLabel} proposed by gaze. Confirm or cancel.`,this.announceAutomatic(this.statusMessage))}elementsAtGazePoint(e){if(typeof document.elementsFromPoint=="function")return document.elementsFromPoint(e.x,e.y).filter(s=>s instanceof HTMLElement);const t=document.elementFromPoint(e.x,e.y);return t instanceof HTMLElement?[t]:[]}setGazeHover(e,t){this.gazeCandidateElement=e,this.gazeDwellProgress=t,e&&(e.classList.add("gaze-hover"),e.style.setProperty("--gaze-progress",`${t*100}%`))}resetGazeHover(){this.gazeCandidateTracker.reset(),this.gazeCandidateElement&&(this.gazeCandidateElement.classList.remove("gaze-hover"),this.gazeCandidateElement.style.removeProperty("--gaze-progress")),this.gazeCandidateElement=null,this.gazePendingElement||(this.gazeDwellProgress=0)}releaseGazeResources(){const e=this.webgazer;if(e){this.restoreWebGazerPreviewContainer();try{e.clearGazeListener()}catch{}try{e.removeMouseEventListeners()}catch{}try{e.stopVideo()}catch{}try{e.end()}catch{}Promise.resolve(e.clearData()).catch(()=>{}),this.webgazer=null}}startVoiceInput(e,t,s){this.stopReading();const i=window.SpeechRecognition??window.webkitSpeechRecognition;if(!i)return;this.releaseRecognition(),this.pendingVoiceAnswer=null,this.voiceMessage="Listening for one answer.",this.voiceState="listening";const a=new i;this.recognition=a,a.lang="en-GB",a.continuous=!1,a.interimResults=!1,a.maxAlternatives=5,a.onresult=r=>{if(this.recognition!==a)return;const u=r.results[0],p=[];for(let h=0;u&&h<u.length;h+=1){const g=u[h]?.transcript?.trim();g&&p.push(g)}if(e==="rating"){const h=fe(p,t,this.ratingValues,this.smileyLandmarks);if(h){this.releaseRecognition(a);const g=this.ratingVoiceAnswerLabel(t,h.value);this.pendingVoiceAnswer={context:e,transcript:h.transcript,value:h.value,label:g},this.voiceState="pending",this.voiceMessage=`Proposed answer: ${g}. Confirm this answer or try again.`,this.announceAutomatic(this.voiceMessage),this.updateComplete.then(()=>this.querySelector("[data-voice-confirm]")?.focus());return}}else{const h=ye(p,[t,s]);if(h){this.releaseRecognition(a);const g=this.dimensionById.get(h.value).name;this.pendingVoiceAnswer={context:e,transcript:h.transcript,value:h.value,label:g},this.voiceState="pending",this.voiceMessage=`Proposed answer: ${g}. Confirm this answer or try again.`,this.announceAutomatic(this.voiceMessage),this.updateComplete.then(()=>this.querySelector("[data-voice-confirm]")?.focus());return}}this.releaseRecognition(a),this.voiceState="error",this.voiceMessage=`The answer was not recognised. ${e==="rating"?this.ratingVoicePrompt(t):`Say ${t.name} or ${s.name}.`}`,this.announceAutomatic(this.voiceMessage)},a.onerror=r=>{this.recognition===a&&(this.releaseRecognition(a),this.voiceState="error",this.voiceMessage=r.error==="not-allowed"?"Microphone permission was not granted. Use the visible answer buttons or system voice control.":"Voice recognition did not complete. Use the visible answer buttons or try again.",this.announceAutomatic(this.voiceMessage))},a.onend=()=>{this.recognition===a&&(this.recognition=null,this.voiceState==="listening"&&(this.voiceState="error",this.voiceMessage="No answer was recognised. Try again or use the visible answer buttons.",this.announceAutomatic(this.voiceMessage)))};try{a.start()}catch{this.releaseRecognition(a),this.voiceState="error",this.voiceMessage="Voice recognition could not start in this browser context.",this.announceAutomatic(this.voiceMessage)}}releaseRecognition(e=this.recognition){if(e){this.recognition===e&&(this.recognition=null),e.onresult=null,e.onerror=null,e.onend=null;try{e.stop()}catch{}}}currentProgressStorageKey(){const e=this.studyConfig?this.participantCode:"DEMO";return b(e)?ee(this.studyConfig?.configId??"demo-config",e):null}currentTabParticipantCodeKey(){return this.studyConfig?`accessible-questionnaire-v0.8-tab-participant:${this.studyConfig.configId}`:null}rememberParticipantCodeForTab(){const e=this.currentTabParticipantCodeKey();if(!(!e||!this.recoveryEnabled||!b(this.participantCode)))try{sessionStorage.setItem(e,this.participantCode)}catch{}}forgetParticipantCodeForTab(){const e=this.currentTabParticipantCodeKey();if(e)try{sessionStorage.removeItem(e)}catch{}}restoreParticipantCodeForTab(){const e=this.currentTabParticipantCodeKey();if(!(!e||!this.recoveryEnabled||b(this.participantCode)))try{const t=sessionStorage.getItem(e);if(!t||!b(t))return;this.participantCode=t,this.participantCodeRestoredForTab=!0,this.statusMessage="Participant code restored for this tab. Checking for interrupted answers."}catch{}}persistProgress(){if(!this.recoveryEnabled||!this.isInProgress())return;const e=this.currentProgressStorageKey();if(!e)return;const t={version:4,instrumentId:this.definition.id,savedAt:Date.now(),startedAt:this.startedAt||new Date().toISOString(),configId:this.studyConfig?.configId??"demo-config",participantCode:this.studyConfig?this.participantCode:"DEMO",stage:this.stage,ratingIndex:this.ratingIndex,pairIndex:this.pairIndex,pairOrder:this.pairOrder,pairResponses:this.pairResponses,ratings:this.ratings,ratingInputRoutes:this.ratingInputRoutes,pairInputRoutes:this.pairInputRoutes,supportChanges:this.supportChanges,support:{answerMode:this.answerMode,showSimpleLanguage:this.showSimpleLanguage,largeText:this.largeText,audioGuidance:this.audioGuidance}};try{localStorage.setItem(e,JSON.stringify(t))}catch{this.statusMessage="Progress could not be saved by this browser.",this.announceAutomatic(this.statusMessage)}}applySavedRecoveryPresentation(e){this.canAdjustPresentationSupport&&(this.largeText=e.support.largeText,this.audioGuidance=!!e.support.audioGuidance)}findSavedSession(){const e=this.currentProgressStorageKey();if(e)try{const t=localStorage.getItem(e);if(!t)return;const s=JSON.parse(t);this.validSavedSession(s)?(this.savedSession=s,this.applySavedRecoveryPresentation(s),this.announceSavedSessionOffer(s)):this.clearSavedProgress()}catch{this.clearSavedProgress()}}findCompletedBackup(){if(!this.studyConfig||!b(this.participantCode))return;const e=te().filter(t=>t.study.configId===this.studyConfig.configId&&t.participantCode===this.participantCode);this.recoveredCompletedRecord=e.at(-1)??null}validSavedSession(e){return e?.version===4&&e.instrumentId===this.definition.id&&e.configId===(this.studyConfig?.configId??"demo-config")&&e.participantCode===(this.studyConfig?this.participantCode:"DEMO")&&typeof e.startedAt=="string"&&["ratings","pairs","review"].includes(e.stage)&&Array.isArray(e.pairOrder)&&e.pairOrder.length===this.pairs.length&&Number.isInteger(e.ratingIndex)&&Number.isInteger(e.pairIndex)&&Array.isArray(e.supportChanges)}clearSavedProgress(){const e=this.currentProgressStorageKey();if(e)try{localStorage.removeItem(e)}catch{}}isInProgress(){return this.stage==="ratings"||this.stage==="pairs"||this.stage==="review"}completedCount(){return Object.keys(this.ratings).length+Object.keys(this.pairResponses).length}lastSavedDescription(){if(this.stage==="ratings"){const e=this.ratings[this.dimensions[this.ratingIndex].id]!==void 0?this.ratingIndex:this.ratingIndex-1;return e>=0?`${this.dimensions[e].name} rating`:"No response yet"}return this.stage==="pairs"?this.pairResponses[this.pairOrder[this.pairIndex].id]?`Comparison ${this.pairIndex+1}`:this.pairIndex>0?`Comparison ${this.pairIndex}`:`${this.dimensions.at(-1)?.name??"Final item"} rating`:this.pairs.length?`Comparison ${this.pairs.length}`:`${this.dimensions.at(-1)?.name??"Final item"} rating`}currentPositionDescription(){return this.stage==="ratings"?`Rating ${this.ratingIndex+1} of ${this.dimensions.length}: ${this.dimensions[this.ratingIndex].name}`:this.stage==="pairs"?`Comparison ${this.pairIndex+1} of ${this.pairOrder.length}`:this.stage==="review"?"Review responses":"Questionnaire introduction"}nextActionDescription(){if(this.stage==="ratings")return`Choose or check the ${this.dimensions[this.ratingIndex].name} rating, then select Next.`;if(this.stage==="pairs"){const e=this.pairOrder[this.pairIndex];return`Choose ${this.dimensionById.get(e.left).name} or ${this.dimensionById.get(e.right).name}, then select Next.`}return"Check the saved answers, then submit or return to a question."}showError(e){this.errorMessage=e,this.announceAutomatic(`There is a problem. ${e}`),this.updateComplete.then(()=>{const t=this.querySelector("#error-summary");t&&x(t,{block:"start",forceCoordinateScroll:!0,onReveal:()=>this.requestParentReveal(t)})})}requestParentReveal(e){const t=this.studyConfig?.collection;t?.mode==="qualtrics"&&de(e,t.parentOrigin)}clearError(){this.errorMessage=""}focusHeading(){this.updateComplete.then(()=>{window.scrollTo({top:0});const e=this.querySelector("#question-panel h2");e&&(e.tabIndex=-1,e.focus(),this.statusMessage=e.textContent?.trim()??"",this.audioGuidance&&this.speakText(this.currentStepSpeech()))})}};l([d()],o.prototype,"stage",2);l([d()],o.prototype,"ratingIndex",2);l([d()],o.prototype,"pairIndex",2);l([d()],o.prototype,"pairOrder",2);l([d()],o.prototype,"pairResponses",2);l([d()],o.prototype,"ratings",2);l([d()],o.prototype,"ratingInputRoutes",2);l([d()],o.prototype,"pairInputRoutes",2);l([d()],o.prototype,"supportChanges",2);l([d()],o.prototype,"answerMode",2);l([d()],o.prototype,"showSimpleLanguage",2);l([d()],o.prototype,"largeText",2);l([d()],o.prototype,"recoveryEnabled",2);l([d()],o.prototype,"resumeSummaryVisible",2);l([d()],o.prototype,"savedSession",2);l([d()],o.prototype,"recoveredCompletedRecord",2);l([d()],o.prototype,"readingAloud",2);l([d()],o.prototype,"readAloudUsed",2);l([d()],o.prototype,"audioGuidance",2);l([d()],o.prototype,"audioStatusMessage",2);l([d()],o.prototype,"interruptionSummaryShown",2);l([d()],o.prototype,"voiceState",2);l([d()],o.prototype,"voiceMessage",2);l([d()],o.prototype,"pendingVoiceAnswer",2);l([d()],o.prototype,"errorMessage",2);l([d()],o.prototype,"statusMessage",2);l([d()],o.prototype,"result",2);l([d()],o.prototype,"gazeState",2);l([d()],o.prototype,"gazeMessage",2);l([d()],o.prototype,"gazeCalibrationIndex",2);l([d()],o.prototype,"gazeCalibrationRepetition",2);l([d()],o.prototype,"gazePendingLabel",2);l([d()],o.prototype,"gazeDwellProgress",2);l([d()],o.prototype,"gazeUsed",2);l([d()],o.prototype,"gazeActionCount",2);l([d()],o.prototype,"studyConfig",2);l([d()],o.prototype,"configurationError",2);l([d()],o.prototype,"participantCode",2);l([d()],o.prototype,"participantCodeError",2);l([d()],o.prototype,"participantCodeRestoredForTab",2);l([d()],o.prototype,"startedAt",2);l([d()],o.prototype,"submittedRecord",2);l([d()],o.prototype,"completionSavedLocally",2);l([d()],o.prototype,"completionSavedByHost",2);l([d()],o.prototype,"hostSubmissionFailed",2);l([d()],o.prototype,"hostSinkName",2);l([d()],o.prototype,"hostReceipt",2);l([d()],o.prototype,"submittingResult",2);o=l([N("accessible-nasa-tlx")],o);let F=class extends o{};F=l([N("accessible-questionnaire")],F);
