import{r as j,s as H,a as u,t as Q,i as K,g as J,D as w,v as y,b as Y,c as Z,d as X,f as R,e as ee,h as te,j as _,k as ie,P as T,A as c,l as r,m as M,n as L,o as se,p as ne,q as ae,u as re}from"./shared-C1FlJX-T.js";const oe="accessible-questionnaire:qualtrics-submit:v2",le="accessible-questionnaire:qualtrics-receipt:v2",de="accessible-questionnaire:qualtrics-parent-ready:v2",ce="accessible-questionnaire:qualtrics-child-ready:v2",ue="accessible-questionnaire:qualtrics-advance-failed:v2",b="0.8.7-q7";function he(e=window){const t=e.accessibleQuestionnaireResultSink??e.accessibleNasaTlxResultSink;return!t||typeof t.name!="string"||!t.name.trim()||typeof t.submit!="function"?null:t}function pe(e,t=window,i=()=>{},n=()=>{}){if(e.collection.mode!=="qualtrics")return null;const s=ge(e.collection.parentOrigin,t,i,n),a=me(e.collection.parentOrigin,t,12e3,()=>s.getState()==="connected");return t.accessibleQuestionnaireResultSink=a,t.accessibleNasaTlxResultSink=a,{sink:a,bridge:s}}function ge(e,t=window,i=()=>{},n=()=>{}){let s="connecting",a=null;const o=(h,g)=>{s==="connected"||s==="failed"&&h!=="connected"||(s=h,i({state:s,message:g}))},p=h=>{if(h.source!==t.parent||h.origin!==e)return;const g=h.data;if(g?.type===ue){g.bridgeBuild===b&&typeof g.error=="string"&&g.error.trim()&&n(g.error);return}if(g?.type===de){if(g.protocolVersion!==2||g.bridgeBuild!==b){o("failed",`This Qualtrics survey is using an old or incomplete bridge. Expected ${b}. Do not start this questionnaire.`);return}a!==null&&(t.clearTimeout(a),a=null),t.parent.postMessage({type:ce,protocolVersion:2,bridgeBuild:b},e),o("connected",`Secure Qualtrics bridge ${b} connected.`)}};return t.addEventListener("message",p),i({state:s,message:`Checking Qualtrics bridge ${b}.`}),a=t.setTimeout(()=>{a=null,s!=="connected"&&o("failed",`The required Qualtrics bridge ${b} did not connect. Do not start this questionnaire.`)},8500),{getState:()=>s,disconnect(){a!==null&&(t.clearTimeout(a),a=null),t.removeEventListener("message",p)}}}function me(e,t=window,i=12e3,n=()=>!0){return{name:"UCL Qualtrics",submit(s){return t.parent===t?Promise.reject(new Error("This centrally collected questionnaire must be opened through its Qualtrics survey.")):n()?new Promise((a,o)=>{let p=!1;const h=f=>{p||(p=!0,t.clearTimeout(v),t.removeEventListener("message",g),f())},g=f=>{if(f.source!==t.parent||f.origin!==e)return;const m=f.data;if(!(!m||m.type!==le||m.submissionId!==s.submissionId||m.bridgeBuild!==b)){if(m.accepted!==!0){h(()=>o(new Error(typeof m.error=="string"&&m.error?m.error:"Qualtrics did not accept the response.")));return}h(()=>a({accepted:!0,submissionId:s.submissionId,receiptId:typeof m.receiptId=="string"?m.receiptId:void 0}))}},v=t.setTimeout(()=>{h(()=>o(new Error("Qualtrics did not acknowledge the response in time.")))},i);t.addEventListener("message",g),t.parent.postMessage({type:oe,bridgeBuild:b,record:s},e)}):Promise.reject(new Error(`Qualtrics bridge ${b} is not connected. The response remains in the local backup.`))}}}async function fe(e,t,i=15e3){let n;const s=new Promise((o,p)=>{n=setTimeout(()=>p(new Error("The study platform did not confirm receipt in time.")),i)});let a;try{a=await Promise.race([t.submit(e),s])}finally{n!==void 0&&clearTimeout(n)}if(!a||a.accepted!==!0||a.submissionId!==e.submissionId||a.receiptId!==void 0&&typeof a.receiptId!="string")throw new Error("The study platform returned an invalid submission receipt.");return a}const P=new Map([["zero",0],["five",5],["one zero",10],["ten",10],["fifteen",15],["twenty",20],["twenty five",25],["thirty",30],["thirty five",35],["forty",40],["forty five",45],["fifty",50],["fifty five",55],["sixty",60],["sixty five",65],["seventy",70],["seventy five",75],["eighty",80],["eighty five",85],["ninety",90],["ninety five",95],["one zero zero",100],["one hundred",100],["hundred",100]]),I=new Map([["zero","0"],["oh","0"],["one","1"],["two","2"],["three","3"],["four","4"],["five","5"],["six","6"],["seven","7"],["eight","8"],["nine","9"]]),G=["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"],O=["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];function be(e){if(e<20)return G[e];if(e===100)return"one hundred";const t=Math.floor(e/10),i=e%10;return i===0?O[t]:`${O[t]} ${G[i]}`}for(let e=0;e<=100;e+=1){P.set(be(e),e);const t=String(e).split("").map(i=>[...I].find(([,n])=>n===i)?.[0]).filter(i=>!!i).join(" ");t&&P.set(t,e)}const q=new Set([...I.keys(),"ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety","hundred"]),E=/\b(?:not|no|cancel|neither|except|without|instead|rather|unsure|uncertain|maybe|perhaps|mistake|wrong)\b|\b(?:anything\s+but|other\s+than|don\s+t)\b/,ye={mental:["mental demand","mental"],physical:["physical demand","physical"],temporal:["temporal demand","temporal","time pressure"],performance:["performance"],effort:["effort"],frustration:["frustration"]};function z(e){return e.toLowerCase().replace(/[-–—]/g," ").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim()}function ve(e){return E.test(z(e))}function W(e,t){const i=e.map(s=>s.trim()).filter(Boolean);if(i.length===0)return null;const n=i.map((s,a)=>({transcript:s,value:t(s),index:a})).filter(s=>s.value!==null);return n.length===0||i.slice(0,n[0].index).some(ve)||new Set(n.map(({value:s})=>s)).size!==1?null:{transcript:n[0].transcript,value:n[0].value}}function B(e,t){return new Set([e,...t??[]].map(z).filter(Boolean))}function we(e,t,i){const n=e.replace(/^(?:(?:i\s+)?(?:choose|select|pick)|(?:my\s+)?answer(?:\s+is)?)\s+/,"").trim(),s=B(t.lowAnchor,t.voiceLowAliases).has(n),a=B(t.highAnchor,t.voiceHighAliases).has(n);if(!(!s&&!a))return s&&a?null:s?i[0]:i.at(-1)??null}function $e(e,t,i){if(!t.responseLabels)return;const n=e.replace(/^(?:(?:i\s+)?(?:choose|select|pick)|(?:my\s+)?answer(?:\s+is)?)\s+/,"").trim(),s=i.filter(a=>z(t.responseLabels?.[String(a)]??"")===n);if(s.length!==0)return s.length===1?s[0]:null}function Se(e,t){const i=e.split(" ").filter(Boolean),n=[];for(const s of i)if(/^(?:100|[0-9]{1,2})$/.test(s)){const a=Number(s);n.push(t.includes(a)?a:null)}for(let s=0;s<i.length;){if(!q.has(i[s])){s+=1;continue}const a=[];for(;s<i.length&&q.has(i[s]);)a.push(i[s]),s+=1;const o=a.length===1&&I.has(a[0])?Number(I.get(a[0])):P.get(a.join(" "));n.push(o!==void 0&&t.includes(o)?o:null)}return n}function V(e){return e?.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")}function S(e,t){return e.find(i=>i.position===t)?.value}function Ce(e,t,i){const n=/\b(middle|midpoint|centre|center)\b/.test(e),s=V(t.voiceLowAliases),a=V(t.voiceHighAliases);if(!s||!a||i.length!==5)return;const o=`(?:${s})`,p=`(?:${a})`,h=new RegExp(`\\bclose(?:r)?\\s+(?:to|too)\\s+${o}\\b`).test(e),g=new RegExp(`\\bclose(?:r)?\\s+(?:to|too)\\s+${p}\\b`).test(e),v=t.voiceLowAliases?.includes("low")===!0&&e==="hello",f=new RegExp(`\\b${o}\\b`).test(e)||v,m=new RegExp(`\\b${p}\\b`).test(e);if(h||g)return[n,h,g].filter(Boolean).length!==1||h&&m||g&&f?null:h?S(i,"closer-low")??null:S(i,"closer-high")??null;if([n,f,m].some(Boolean))return[n,f,m].filter(Boolean).length!==1?null:n?S(i,"middle")??null:f?S(i,"low")??null:S(i,"high")??null}function ze(e,t,i=j,n=H){const s=z(e);if(!s)return null;const a=$e(s,t,i);if(a!==void 0)return a;const o=we(s,t,i);if(o!==void 0)return o;if(E.test(s))return null;const p=Se(s,i),h=Ce(s,t,n);return p.length>0?p.length!==1||p[0]===null||h===null||h!==void 0&&h!==p[0]?null:p[0]:h??null}function Re(e,t){const i=z(e);if(!i||E.test(i))return null;const n=t.map(s=>{const a=typeof s=="string"?s:s.id;return(typeof s=="string"?ye[a]??[a.replace(/[-_]/g," ")]:[s.name.toLowerCase(),a.replace(/[-_]/g," ")]).some(p=>i===p||i.includes(p))?a:null}).filter(s=>!!s);return n.length===1?n[0]:null}function xe(e,t,i=j,n=H){return W(e,s=>ze(s,t,i,n))}function Ie(e,t){return W(e,i=>Re(i,t))}const k="3.5.3",ke=`https://cdn.jsdelivr.net/npm/webgazer@${k}/dist/webgazer.js`,Ae=`https://cdn.jsdelivr.net/npm/webgazer@${k}/dist/mediapipe/face_mesh`,Pe="sha384-N9TfYQEjUGiaDcITkzB/MtVHEfF2JtTWCwHG8NUhjOSvJ8zObGwfebHUFLBS+4Rb";let C=null;function D(e){return e.protocol==="https:"||e.hostname==="localhost"||e.hostname==="127.0.0.1"}function Ee(e=document){return window.webgazer?Promise.resolve(window.webgazer):C||(C=new Promise((t,i)=>{const n=e.querySelector("#webgazer-loader"),s=n??e.createElement("script"),a=()=>{window.webgazer?t(window.webgazer):i(new Error("WebGazer loaded without exposing its browser API."))};s.addEventListener("load",a,{once:!0}),s.addEventListener("error",()=>{s.remove(),i(new Error("WebGazer could not be downloaded. Check the connection and content-blocking settings."))},{once:!0}),n||(s.id="webgazer-loader",s.src=ke,s.integrity=Pe,s.crossOrigin="anonymous",s.referrerPolicy="no-referrer",e.head.append(s))}).catch(t=>{throw C=null,t}),C)}class N{constructor(t){this.durationMs=t,this.key=null,this.startedAt=0}update(t,i){if(!t)return this.reset(),{progress:0,activated:!1};if(t!==this.key)return this.key=t,this.startedAt=i,{progress:0,activated:!1};const n=Math.min(1,Math.max(0,(i-this.startedAt)/this.durationMs));return n>=1?(this.reset(),{progress:1,activated:!0}):{progress:n,activated:!1}}reset(){this.key=null,this.startedAt=0}}var Te=Object.defineProperty,Me=Object.getOwnPropertyDescriptor,d=(e,t,i,n)=>{for(var s=n>1?void 0:n?Me(t,i):t,a=e.length-1,o;a>=0;a--)(o=e[a])&&(s=(n?o(t,i,s):o(s))||s);return n&&s&&Te(t,i,s),s};function F(e){return e.trim().toLocaleLowerCase().split("-")[0]==="en"}const x=[{x:12,y:12},{x:50,y:12},{x:88,y:12},{x:12,y:50},{x:50,y:50},{x:88,y:50},{x:12,y:88},{x:50,y:88},{x:88,y:88}],$=3;function A(e){const t=_(e);for(let i=t.length-1;i>0;i-=1){const n=Math.floor(Math.random()*(i+1));[t[i],t[n]]=[t[n],t[i]]}return t}let l=class extends K{constructor(){super(...arguments),this.stage="intro",this.ratingIndex=0,this.pairIndex=0,this.pairOrder=A(J(w)),this.pairResponses={},this.ratings={},this.ratingInputRoutes={},this.pairInputRoutes={},this.supportChanges=[],this.answerMode="standard",this.showSimpleLanguage=!1,this.largeText=!1,this.recoveryEnabled=!1,this.resumeSummaryVisible=!1,this.savedSession=null,this.recoveredCompletedRecord=null,this.readingAloud=!1,this.readAloudUsed=!1,this.audioGuidance=!1,this.audioStatusMessage="",this.interruptionSummaryShown=!1,this.voiceState="idle",this.voiceMessage="",this.pendingVoiceAnswer=null,this.errorMessage="",this.statusMessage="",this.result=null,this.gazeState="off",this.gazeMessage="",this.gazeCalibrationIndex=0,this.gazeCalibrationRepetition=0,this.gazePendingLabel="",this.gazeDwellProgress=0,this.gazeUsed=!1,this.gazeActionCount=0,this.studyConfig=null,this.configurationError="",this.participantCode="",this.participantCodeError="",this.participantCodeRestoredForTab=!1,this.startedAt="",this.submittedRecord=null,this.completionSavedLocally=!1,this.completionSavedByHost=!1,this.remoteRecordingUnconfirmed=!1,this.hostSubmissionFailed=!1,this.submittingResult=!1,this.hostBridgeState="not-required",this.hostBridgeMessage="",this.hiddenAt=null,this.recognition=null,this.webgazer=null,this.gazeCandidateElement=null,this.gazePendingElement=null,this.gazeActivationInProgress=!1,this.speechRequestId=0,this.savedSessionAnnouncementKey="",this.configurationApplied=!1,this.installedResultSink=null,this.gazeCandidateTracker=new N(1e3),this.gazeConfirmationTracker=new N(1200),this.repeatSavedSessionOffer=()=>{this.savedSession&&(this.readAloudUsed=!0,this.speakText(this.savedSessionOfferSpeech(this.savedSession)))},this.setParticipantCode=e=>{this.participantCode=e.currentTarget.value.trim(),this.participantCodeRestoredForTab=!1,this.participantCodeError=this.participantCode&&!y(this.participantCode)?"Use 1–32 letters, numbers, hyphens or underscores, starting with a letter or number.":"",this.savedSession=null,this.recoveredCompletedRecord=null,y(this.participantCode)?(this.rememberParticipantCodeForTab(),this.findSavedSession(),this.findCompletedBackup()):this.forgetParticipantCodeForTab()},this.setAudioGuidance=e=>{const t=e.currentTarget.checked;this.recordSupportChange("automatic-audio",this.audioGuidance,t),this.audioGuidance=t,this.invalidatePendingSubmission(),this.audioGuidance?this.speakText("Built-in audio guidance is on. New questions, selected answers, voice proposals, simpler help, recovery summaries, errors and completion feedback will be spoken while this page remains open."):this.stopReading(),this.persistProgress()},this.startQuestionnaire=()=>{if(this.configurationError){this.showError(this.configurationError);return}if(this.studyConfig?.collection.mode==="qualtrics"&&this.hostBridgeState!=="connected"){this.showError(this.hostBridgeMessage||"The secure Qualtrics result connection is not ready. Do not start this questionnaire.");return}if(this.studyConfig&&(this.participantCode=this.participantCode.trim(),!y(this.participantCode))){this.participantCodeError="Enter the valid pseudonymous participant code supplied by the study conductor.",this.showError(this.participantCodeError);return}this.startedAt=new Date().toISOString(),this.stage="ratings",this.ratingIndex=0,this.clearError(),this.persistProgress(),this.focusHeading()},this.goBack=()=>{this.stopReading(),this.clearVoiceAnswer(),this.stage==="ratings"&&this.ratingIndex>0?this.ratingIndex-=1:this.stage==="pairs"&&(this.pairIndex>0?this.pairIndex-=1:(this.stage="ratings",this.ratingIndex=this.dimensions.length-1)),this.clearError(),this.persistProgress(),this.focusHeading()},this.returnToRatings=()=>{this.stage="ratings",this.ratingIndex=this.dimensions.length-1,this.persistProgress(),this.focusHeading()},this.returnToPairs=()=>{this.stage="pairs",this.pairIndex=this.pairOrder.length-1,this.persistProgress(),this.focusHeading()},this.submitResponses=async()=>{if(!this.submittingResult)try{(!this.result||!this.submittedRecord)&&(this.result=Y(this.definition,this.ratings,this.pairResponses),this.submittedRecord=Z({config:this.effectiveStudyConfig(),participantCode:this.studyConfig?this.participantCode:"DEMO",startedAt:this.startedAt||new Date().toISOString(),pairPresentationOrder:this.pairOrder.map(({id:t})=>t),pairwiseChoices:this.pairResponses,result:this.result,supportMetadata:this.currentSupportMetadata()}));const e=this.studyConfig?he():null;if(this.completionSavedLocally=this.studyConfig?X(this.submittedRecord):!1,this.completionSavedByHost=!1,this.remoteRecordingUnconfirmed=!1,this.hostSubmissionFailed=!1,e){this.submittingResult=!0,this.statusMessage=`Submitting responses to ${e.name}.`;try{await fe(this.submittedRecord,e),this.completionSavedByHost=!0}catch(t){this.hostSubmissionFailed=!0;const i=t instanceof Error?t.message:"The study platform did not accept the response.";this.showError(`${i} Your answers remain on this page. Retry submission, return to an answer, or use a backup button below.`);return}finally{this.submittingResult=!1}}this.dispatchEvent(new CustomEvent("questionnaire-complete",{detail:this.submittedRecord,bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("nasa-tlx-complete",{detail:this.submittedRecord,bubbles:!0,composed:!0})),this.stage="complete",(!this.studyConfig||this.completionSavedLocally)&&this.clearSavedProgress(),this.stopGazeInputInternal(!1),this.clearError(),this.completionSavedByHost||this.focusHeading()}catch(e){this.submittingResult=!1,this.showError(e instanceof Error?e.message:"Responses could not be calculated.")}},this.downloadResultJson=()=>{this.submittedRecord&&this.downloadRecordJson(this.submittedRecord)},this.downloadResultCsv=()=>{this.submittedRecord&&this.downloadRecordCsv(this.submittedRecord)},this.restart=()=>{this.stopReading(!1),this.stopGazeInputInternal(!1),this.releaseRecognition(),this.clearSavedProgress(),this.forgetParticipantCodeForTab(),this.stage="intro",this.ratingIndex=0,this.pairIndex=0,this.pairOrder=A(this.definition),this.pairResponses={},this.ratings={},this.ratingInputRoutes={},this.pairInputRoutes={},this.supportChanges=[],this.resumeSummaryVisible=!1,this.savedSession=null,this.recoveredCompletedRecord=null,this.result=null,this.submittedRecord=null,this.completionSavedLocally=!1,this.completionSavedByHost=!1,this.remoteRecordingUnconfirmed=!1,this.hostSubmissionFailed=!1,this.submittingResult=!1,this.startedAt="",this.participantCodeError="",this.participantCodeRestoredForTab=!1,this.studyConfig&&(this.participantCode=""),this.errorMessage="",this.voiceState="idle",this.pendingVoiceAnswer=null,this.audioGuidance=!1,this.audioStatusMessage="",this.gazeUsed=!1,this.gazeActionCount=0,this.applyConfiguredSupport(),this.statusMessage="A new questionnaire has started.",window.scrollTo({top:0,behavior:"smooth"})},this.toggleReadAloud=()=>{if(this.readingAloud){this.stopReading(!0);return}this.speakText(this.currentStepSpeech())},this.startGazeInput=async()=>{if(!D(window.location)){this.gazeState="error",this.gazeMessage="Gaze input requires an HTTPS-hosted page or localhost.",this.announceAutomatic(this.gazeMessage);return}this.gazeState="loading",this.gazeMessage="Loading the pinned WebGazer library. Webcam permission will be requested next.";try{const e=await Ee();if(!e.detectCompatibility())throw new Error("This browser does not expose a compatible webcam API.");this.webgazer=e,e.params.faceMeshSolutionPath=Ae,e.saveDataAcrossSessions(!1),await e.clearData(),e.showVideoPreview(!0),e.showFaceOverlay(!0),e.showFaceFeedbackBox(!0),e.showPredictionPoints(!1),e.setGazeListener(t=>this.handleGazePoint(t)),await e.begin(),e.removeMouseEventListeners(),await this.showGazePositioningStep("Camera started. Position your face, then continue to calibration.")}catch(e){this.gazeState="error",this.gazeMessage=e instanceof Error?`Gaze setup did not start: ${e.message}`:"Gaze setup did not start. Use another answer route.",this.announceAutomatic(this.gazeMessage),this.releaseGazeResources()}},this.restartGazeCalibration=async()=>{this.webgazer&&(this.cancelGazeProposal(),await this.webgazer.clearData(),await this.showGazePositioningStep("Recalibration started. Check your position before continuing."))},this.beginGazeCalibration=()=>{this.webgazer&&(this.restoreWebGazerPreviewContainer(),this.webgazer.showVideoPreview(!1),this.webgazer.showFaceOverlay(!1),this.webgazer.showFaceFeedbackBox(!1),this.webgazer.showPredictionPoints(!1),this.gazeCalibrationIndex=0,this.gazeCalibrationRepetition=0,this.gazeState="calibrating",this.gazeMessage="Camera preview hidden. Complete all 27 calibration samples.",this.announceAutomatic(this.gazeMessage),this.updateComplete.then(()=>this.querySelector(".calibration-point")?.focus()))},this.recordCalibrationPoint=e=>{if(!this.webgazer||this.gazeState!=="calibrating")return;const t=e.currentTarget.getBoundingClientRect();if(this.webgazer.recordScreenPosition(t.left+t.width/2,t.top+t.height/2,"click"),this.gazeCalibrationRepetition<$-1){this.gazeCalibrationRepetition+=1;return}if(this.gazeCalibrationIndex<x.length-1){this.gazeCalibrationIndex+=1,this.gazeCalibrationRepetition=0;return}this.gazeCalibrationRepetition=$,this.gazeState="ready",this.gazeUsed=!0,this.gazeMessage="Calibration complete. A red gaze dot is visible. Look at a large answer or navigation control for one second.",this.webgazer.showVideoPreview(!1),this.webgazer.showFaceOverlay(!1),this.webgazer.showFaceFeedbackBox(!1),this.webgazer.showPredictionPoints(!0),this.statusMessage="Gaze-assisted answering is ready.",this.announceAutomatic(this.statusMessage)},this.confirmGazeProposal=()=>{const e=this.gazePendingElement;if(!e)return;const t=this.gazePendingLabel;this.gazePendingElement=null,this.gazePendingLabel="",this.gazeDwellProgress=0,this.gazeConfirmationTracker.reset(),this.gazeActivationInProgress=!0;try{e.click(),this.gazeActionCount+=1,this.gazeUsed=!0,this.statusMessage=`${t} activated by confirmed gaze.`}finally{this.gazeActivationInProgress=!1}},this.cancelGazeProposal=()=>{this.gazePendingElement=null,this.gazePendingLabel="",this.gazeDwellProgress=0,this.gazeConfirmationTracker.reset(),this.statusMessage="Gaze proposal cancelled."},this.stopGazeInput=()=>{this.stopGazeInputInternal(!0)},this.confirmVoiceAnswer=()=>{const e=this.pendingVoiceAnswer;if(!e)return;let t="";if(e.context==="rating"){const i=this.dimensions[this.ratingIndex],n=e.value;this.selectRating(i.id,n,"voice"),t=this.answerMode==="smiley"&&this.smileyLandmarks.some(a=>a.value===n)?`smiley-${i.id}-${n}`:`rating-${i.id}-${n}`}else{const i=this.pairOrder[this.pairIndex],n=e.value;this.selectPair(i.id,n,"voice"),t=`${i.id}-${n}`}this.voiceState="idle",this.voiceMessage="",this.pendingVoiceAnswer=null,this.updateComplete.then(()=>this.querySelector(`#${t}`)?.focus())},this.clearVoiceAnswer=()=>{this.releaseRecognition(),this.voiceState="idle",this.voiceMessage="",this.pendingVoiceAnswer=null},this.handleVisibilityChange=()=>{if(document.hidden){this.hiddenAt=Date.now();return}this.hiddenAt&&this.recoveryEnabled&&this.isInProgress()&&(this.resumeSummaryVisible=!0,this.interruptionSummaryShown=!0,this.statusMessage="Welcome back. A summary of your saved position is available.",this.updateComplete.then(()=>{this.querySelector("#resume-heading")?.focus(),this.announceAutomatic(this.resumeSummarySpeech())})),this.hiddenAt=null},this.dismissResumeSummary=()=>{this.resumeSummaryVisible=!1,this.statusMessage=`Continuing at ${this.currentPositionDescription()}.`,this.focusHeading()},this.restoreSavedSession=()=>{const e=this.savedSession;e&&(this.stage=e.stage,this.ratingIndex=e.ratingIndex,this.pairIndex=e.pairIndex,this.pairOrder=e.pairOrder,this.pairResponses=e.pairResponses,this.ratings=e.ratings,this.ratingInputRoutes=e.ratingInputRoutes,this.pairInputRoutes=e.pairInputRoutes,this.supportChanges=e.supportChanges,this.startedAt=e.startedAt,this.canAdjustAllSupport?(this.answerMode=e.support.answerMode,this.showSimpleLanguage=e.support.showSimpleLanguage,this.largeText=e.support.largeText,this.audioGuidance=!!e.support.audioGuidance):(this.applyConfiguredSupport(),this.canAdjustPresentationSupport&&(this.largeText=e.support.largeText,this.audioGuidance=!!e.support.audioGuidance)),this.recoveryEnabled=!0,this.savedSession=null,this.savedSessionAnnouncementKey="",this.resumeSummaryVisible=!0,this.interruptionSummaryShown=!0,this.updateComplete.then(()=>{this.querySelector("#resume-heading")?.focus(),this.announceAutomatic(this.resumeSummarySpeech())}))},this.eraseSavedSession=()=>{this.clearSavedProgress(),this.savedSession=null,this.savedSessionAnnouncementKey="",this.statusMessage="Saved answers erased."}}connectedCallback(){super.connectedCallback(),this.loadStudyConfiguration(),document.addEventListener("visibilitychange",this.handleVisibilityChange),queueMicrotask(()=>{this.restoreParticipantCodeForTab(),this.findSavedSession(),this.findCompletedBackup(),this.participantCodeRestoredForTab&&!this.savedSession&&this.recoveredCompletedRecord&&this.updateComplete.then(()=>{const e=this.querySelector("#completed-backup-heading");e&&R(e,{block:"start",onReveal:()=>this.requestParentReveal(e)})})})}disconnectedCallback(){document.removeEventListener("visibilitychange",this.handleVisibilityChange),this.installedResultSink?.bridge.disconnect(),this.installedResultSink=null,this.stopReading(!1),this.releaseRecognition(),this.stopGazeInputInternal(!1),super.disconnectedCallback()}createRenderRoot(){return this}loadStudyConfiguration(){if(this.configurationApplied)return;this.configurationApplied=!0;const e=new URLSearchParams(window.location.hash.startsWith("#")?window.location.hash.slice(1):window.location.hash),t=ee(window.location.hash);if(e.has("study")&&!t){this.configurationError="This participant link contains an invalid or incompatible study configuration. Ask the study conductor for a new link.";return}if(t&&(this.studyConfig=t,this.pairOrder=A(this.definition),this.applyConfiguredSupport(),t.collection.mode==="qualtrics")){if(window.parent===window){this.configurationError="This centrally collected questionnaire must be opened from the approved Qualtrics survey link. Ask the study conductor for that link.";return}if(document.referrer)try{if(new URL(document.referrer).origin!==t.collection.parentOrigin){this.configurationError="This questionnaire was embedded by an unexpected website. Ask the study conductor for the approved Qualtrics survey link.";return}}catch{this.configurationError="The embedding website could not be verified. Ask the study conductor for the approved Qualtrics survey link.";return}this.hostBridgeState="connecting",this.installedResultSink=pe(t,window,({state:i,message:n})=>{this.hostBridgeState=i,this.hostBridgeMessage=n},i=>{this.remoteRecordingUnconfirmed=!0,this.statusMessage=i,this.announceAutomatic(this.currentStepSpeech()),this.updateComplete.then(()=>{const n=this.querySelector("#remote-recording-error");n&&R(n,{block:"start",onReveal:()=>this.requestParentReveal(n)})})})}}applyConfiguredSupport(){const e=this.studyConfig?.support;e&&(this.showSimpleLanguage=e.showSimpleLanguage,this.answerMode=e.answerMode,this.largeText=e.largeText,this.audioGuidance=e.audioGuidance,this.recoveryEnabled=e.recoveryEnabled)}get definition(){const e=this.studyConfig?.instrumentId??w;return te(e,this.studyConfig?.questionnaireDefinition)}get dimensions(){return this.definition.items}get pairs(){return _(this.definition)}get ratingValues(){return ie(this.definition)}get smileyLandmarks(){return this.definition.landmarks??[]}get isResearcherSuppliedDefinition(){return!!this.studyConfig?.questionnaireDefinition}get dimensionById(){return new Map(this.dimensions.map(e=>[e.id,e]))}get canAdjustAllSupport(){return!this.studyConfig||this.studyConfig.support.participantAdjustmentPolicy==="participant-choice"}get canAdjustPresentationSupport(){return!this.studyConfig||this.studyConfig.support.participantAdjustmentPolicy==="presentation-only"||this.studyConfig.support.participantAdjustmentPolicy==="participant-choice"}get voiceInputAvailable(){return!this.studyConfig||this.studyConfig.support.voiceInputAvailable}get gazeInputAvailable(){return!this.studyConfig||this.studyConfig.support.gazeInputAvailable}render(){return r`
      <a class="skip-link" href="#question-panel">Skip to the current question</a>
      <main class=${`app-shell${this.largeText?" large-text":""}`} id="main-content">
        <p class="sr-only" aria-live="polite" aria-atomic="true">${this.statusMessage}</p>
        <header class="app-header">
          <p class="eyebrow">Accessible questionnaire platform · Version ${T}</p>
          <h1 lang=${this.definition.language} dir="auto">${this.definition.name}</h1>
          <p class="subtitle" lang=${this.definition.language} dir="auto">${this.definition.description}</p>
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
                helps you complete the questionnaire; every change is recorded separately from your scored answers.
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
    `}renderStage(){switch(this.stage){case"intro":return this.renderIntro();case"ratings":return this.renderRating();case"pairs":return this.renderPair();case"review":return this.renderReview();case"complete":return this.renderComplete()}}renderIntro(){const e=this.definition.id===w?"Start the six ratings":`Start the ${this.dimensions.length} items`;return r`
      <section class="panel" id="question-panel" aria-labelledby="intro-heading">
        <h2 id="intro-heading">Before you begin</h2>
        ${this.configurationError?r`<div class="error-summary" role="alert"><h3>Study link problem</h3><p>${this.configurationError}</p></div>`:c}
        ${this.studyConfig?.collection.mode==="qualtrics"&&this.hostBridgeState!=="connected"?r`<div
              class=${this.hostBridgeState==="failed"?"error-summary":"study-context"}
              role=${this.hostBridgeState==="failed"?"alert":"status"}
            >
              <h3>${this.hostBridgeState==="failed"?"Qualtrics connection problem":"Checking secure result collection"}</h3>
              <p>${this.hostBridgeMessage}</p>
              <p>The questionnaire cannot start until the matching collection bridge is connected.</p>
            </div>`:c}
        ${this.renderStudyContext()}
        ${this.savedSession?this.renderSavedSessionOffer():c}
        ${this.recoveredCompletedRecord?this.renderCompletedBackupOffer():c}
        <p>${this.definition.introPrompt}</p>
        ${this.studyConfig?r`<p>Study task: <strong>${this.studyConfig.taskLabel}</strong></p>`:c}
        <ol class="process-overview">
          <li>
            First, answer ${this.dimensions.length} items using values from
            ${this.definition.scale.minimum} to ${this.definition.scale.maximum}.
          </li>
          ${this.pairs.length?r`<li>Then, make ${this.pairs.length} pairwise comparisons.</li>`:c}
          <li>Finally, review and submit your responses.</li>
        </ol>

        <div class="boundary-note">
          <h3>${this.isResearcherSuppliedDefinition?"Questionnaire definition and optional support":"Official questionnaire and optional support"}</h3>
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
          <summary>
            Review the ${this.dimensions.length}
            ${this.isResearcherSuppliedDefinition?"":"official "}
            ${this.pairs.length?"factor definitions":"items"}
          </summary>
          ${this.dimensions.map(t=>r`
              <div class="reference-item">
                <h3>${t.name}</h3>
                <p>${t.prompt}</p>
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
          data-gaze-label=${e}
          ?disabled=${!!this.configurationError||this.studyConfig?.collection.mode==="qualtrics"&&this.hostBridgeState!=="connected"}
          @click=${this.startQuestionnaire}
        >
          ${e}
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
          ${this.participantCodeError||(this.recoveryEnabled?"Letters, numbers, hyphens and underscores only; maximum 32 characters. If this page reloads in the same tab, this code is restored for that tab so interrupted answers can be found.":"Letters, numbers, hyphens and underscores only; maximum 32 characters.")}
        </p>
        ${this.participantCodeRestoredForTab?r`<p class="restored-code-note" role="status">
              Participant code restored for this tab. It will be forgotten when this tab is closed.
            </p>`:c}
      </aside>
    `:r`<aside class="study-context demo-context">
        <h3>Demonstration mode</h3>
        <p>This page is a technical demonstration. It does not upload answers or act as a remote research-data system.</p>
      </aside>`}renderConfiguredSupportSummary(){const e=this.studyConfig?.support;return e?r`
      <aside class="configured-support" aria-labelledby="configured-support-heading">
        <h3 id="configured-support-heading">Support prepared by the study conductor</h3>
        <p>You do not need to configure the questionnaire before starting.</p>
        <ul>
          ${this.definition.supports.simplerExplanations?r`<li>${e.showSimpleLanguage?"Simpler explanations shown":"Optional simpler help hidden"}</li>`:r`<li>Official item wording only; no reworded item support is enabled for this instrument</li>`}
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
    `:c}renderSupportSettings(e,t){const i=`support-${e}`;return r`
      <fieldset class="support-settings">
        <legend>${t==="all"?"Accessibility support options":"Display and recovery preferences"}</legend>

        ${t==="all"&&this.definition.supports.simplerExplanations?r`<label class="toggle-card" for=${`${i}-simple`}>
            <input
              id=${`${i}-simple`}
              type="checkbox"
              .checked=${this.showSimpleLanguage}
              @change=${n=>this.setSimpleLanguage(n)}
            />
            <span>
              <strong>Show simpler explanations</strong>
              <small>
                ${this.isResearcherSuppliedDefinition?"The questionnaire item remains visible once, without being duplicated inside the help.":"The official item remains visible once, without being duplicated inside the help."}
              </small>
            </span>
          </label>`:c}

        ${t==="all"&&this.definition.supports.smileyLandmarks?r`<fieldset class="answer-mode-control">
            <legend>Rating answer format</legend>
            <label for=${`${i}-standard-answer`}>
              <input
                id=${`${i}-standard-answer`}
                type="radio"
                name=${`${i}-answer-mode`}
                value="standard"
                .checked=${this.answerMode==="standard"}
                @change=${()=>this.setAnswerMode("standard")}
              />
              <span>
                <strong>Standard ${this.ratingValues.length}-value scale</strong>
                <small>Official ${this.definition.shortName} response values.</small>
              </span>
              ${this.answerMode==="standard"?r`<span class="selected-marker" aria-hidden="true">✓ Selected</span>`:c}
            </label>
            <label for=${`${i}-smiley-answer`}>
              <input
                id=${`${i}-smiley-answer`}
                type="radio"
                name=${`${i}-answer-mode`}
                value="smiley"
                .checked=${this.answerMode==="smiley"}
                @change=${()=>this.setAnswerMode("smiley")}
              />
              <span>
                <strong>Smiley landmarks</strong>
                <small>Experimental five-value view; the precise scale is available only on request.</small>
              </span>
              ${this.answerMode==="smiley"?r`<span class="selected-marker" aria-hidden="true">✓ Selected</span>`:c}
            </label>
          </fieldset>`:c}

        <fieldset class="text-size-control">
          <legend>Text size</legend>
          <label for=${`${i}-standard-text`}>
            <input
              id=${`${i}-standard-text`}
              type="radio"
              name=${`${i}-text-size`}
              value="standard"
              .checked=${!this.largeText}
              @change=${()=>this.setLargeText(!1)}
            />
            Standard
          </label>
          <label for=${`${i}-large-text`}>
            <input
              id=${`${i}-large-text`}
              type="radio"
              name=${`${i}-text-size`}
              value="large"
              .checked=${this.largeText}
              @change=${()=>this.setLargeText(!0)}
            />
            Large
          </label>
        </fieldset>

        <label class="toggle-card" for=${`${i}-recovery`}>
          <input
            id=${`${i}-recovery`}
            type="checkbox"
            .checked=${this.recoveryEnabled}
            @change=${n=>this.setRecovery(n)}
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
          ${this.readingAloud?"Stop speech":"Hear a summary of this step"}
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
                <strong>Automatically read new questions, selected answers and feedback aloud</strong>
                <small>
                  Default off. This includes voice proposals, simpler help, recovery summaries,
                  errors and completion feedback while this page remains open.
                </small>
              </span>
            </label>`:r`<small>Automatic spoken guidance is ${this.audioGuidance?"on":"off"} in the study configuration.</small>`}
        <small>
          ${e?"Uses the browser speech-synthesis voice; no audio is recorded.":"Built-in audio is unavailable in this browser. External screen readers can still use the semantic page."}
        </small>
      </div>
    `}renderCompletionReadAloudControl(){const e="speechSynthesis"in window&&"SpeechSynthesisUtterance"in window;return r`
      <div class="quick-support audio-guidance completion-audio" aria-label="Result audio guidance">
        <button
          class="secondary-button large-answer-button"
          type="button"
          ?disabled=${!e}
          @click=${this.toggleReadAloud}
        >
          ${this.readingAloud?"Stop speech":"Hear the result summary"}
        </button>
        ${this.audioStatusMessage?r`<p class="audio-status" role="status" aria-atomic="true">${this.audioStatusMessage}</p>`:c}
        <small>
          ${e?"Uses the browser speech-synthesis voice; no audio is recorded.":"Built-in audio is unavailable in this browser. External screen readers can still read the result."}
        </small>
      </div>
    `}renderGazeSetup(){if(!this.gazeInputAvailable)return c;const e=D(window.location),t=this.gazeState==="loading"||this.gazeState==="positioning"||this.gazeState==="calibrating"||this.gazeState==="ready";return r`
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
            <li>WebGazer ${k} is loaded only after you start this feature; its code and face model come from jsDelivr.</li>
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
    `}renderGazeCalibration(){const e=x[this.gazeCalibrationIndex],t=this.gazeCalibrationIndex*$+this.gazeCalibrationRepetition,i=x.length*$;return r`
      <div class="gaze-calibration" role="dialog" aria-modal="true" aria-labelledby="gaze-calibration-heading">
        <div class="gaze-calibration-instructions">
          <h2 id="gaze-calibration-heading">Gaze calibration</h2>
          <p>Keep your head steady. Look at the numbered target, then click it or press Enter/Space three times.</p>
          <p><strong>${t} of ${i}</strong> calibration samples completed.</p>
          <button class="secondary-button" type="button" @click=${this.stopGazeInput}>Cancel gaze setup</button>
        </div>
        <div class="gaze-calibration-field">
          <button
            class="calibration-point"
            type="button"
            style=${`left: clamp(3rem, ${e.x}%, calc(100% - 3rem)); top: clamp(3rem, ${e.y}%, calc(100% - 3rem))`}
            aria-label=${`Calibration point ${this.gazeCalibrationIndex+1} of ${x.length}, sample ${this.gazeCalibrationRepetition+1} of ${$}`}
            @click=${this.recordCalibrationPoint}
          >
            ${this.gazeCalibrationIndex+1}
            <span>${this.gazeCalibrationRepetition+1}/${$}</span>
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
    `}renderProgress(){const e=Object.keys(this.ratings).length+Object.keys(this.pairResponses).length,t=this.dimensions.length+this.pairOrder.length,i=this.stage==="ratings"?"Ratings":this.stage==="pairs"?"Comparisons":"Review";return r`
      <nav class="progress-card" aria-label="Questionnaire progress">
        <p><strong>${i}:</strong> ${e} of ${t} responses completed</p>
        <progress max=${t} value=${e}>${e} of ${t}</progress>
      </nav>
    `}renderRating(){const e=this.dimensions[this.ratingIndex],t=this.ratings[e.id];return r`
      <section class="panel" id="question-panel" aria-labelledby="rating-heading">
        <p class="step-label">Rating ${this.ratingIndex+1} of ${this.dimensions.length}</p>
        <h2 id="rating-heading" lang=${this.definition.language} dir="auto">${e.name}</h2>
        <p class="official-definition">
          <strong>${this.isResearcherSuppliedDefinition?"Questionnaire item":this.pairs.length?"Official definition":"Official item"}:</strong>
          <span lang=${this.definition.language} dir="auto">${e.prompt}</span>
        </p>

        ${this.definition.supports.simplerExplanations?this.showSimpleLanguage?r`<aside class="simple-language-panel" aria-label="Simpler explanation">
              <p class="support-label">Simpler explanation</p>
              <p>${e.simpleExplanation}</p>
              <p class="support-boundary">
                Use the declared response scale when choosing your response.
              </p>
            </aside>`:r`<details
              class="optional-explanation"
              @toggle=${i=>this.speakOpenedHelp(i,`Simpler explanation for ${e.name}. ${e.simpleExplanation}`)}
            >
              <summary>Show a simpler explanation</summary>
              <div class="explanation-block">
                <p>${e.simpleExplanation}</p>
                <p class="support-boundary">
                  This help does not replace the questionnaire item.
                </p>
              </div>
            </details>`:c}

        ${this.answerMode==="smiley"&&this.definition.supports.smileyLandmarks?r`
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
        <legend>
          Rate <span lang=${this.definition.language} dir="auto">${e.name}</span>:
          ${this.definition.scale.minimum} is
          <span lang=${this.definition.language} dir="auto">${e.lowAnchor}</span>;
          ${this.definition.scale.maximum} is
          <span lang=${this.definition.language} dir="auto">${e.highAnchor}</span>
        </legend>
        <div class="rating-anchors" aria-hidden="true">
          <span>${this.definition.scale.minimum} — <span lang=${this.definition.language} dir="auto">${e.lowAnchor}</span></span>
          <span>${this.definition.scale.maximum} — <span lang=${this.definition.language} dir="auto">${e.highAnchor}</span></span>
        </div>
        <div class="rating-grid">
          ${this.ratingValues.map(i=>{const n=`rating-${e.id}-${i}`,s=this.ratingOptionLabel(e,i);return r`
              <label
                class="rating-option"
                for=${n}
                data-gaze-target
                data-gaze-label=${s}
              >
                <input
                  id=${n}
                  type="radio"
                  name=${`rating-${e.id}`}
                  value=${i}
                  .checked=${t===i}
                  aria-label=${s}
                  @change=${()=>this.selectRating(e.id,i,"standard-scale")}
                />
                <span class="rating-option-content">
                  <strong>${i}</strong>
                  ${e.responseLabels?.[String(i)]&&e.responseLabels[String(i)]!==String(i)?r`<small lang=${this.definition.language} dir="auto">${e.responseLabels[String(i)]}</small>`:c}
                </span>
                ${t===i?r`<span class="selected-marker selected-check" aria-hidden="true">✓</span>`:c}
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
          ${this.smileyLandmarks.map(({value:i,cue:n})=>{const s=`smiley-${e.id}-${i}`;return r`
              <label
                class="smiley-option"
                for=${s}
                data-gaze-target
                data-gaze-label=${`${i} for ${e.name}`}
              >
                <input
                  id=${s}
                  type="radio"
                  name=${`smiley-${e.id}`}
                  value=${i}
                  .checked=${t===i}
                  aria-label=${`${i}, ${this.landmarkLabel(e,i)}, for ${e.name}`}
                  aria-describedby=${`smiley-help-${e.id}`}
                  @change=${()=>this.selectRating(e.id,i,"smiley-landmark")}
                />
                <span class="smiley-option-content">
                  <span class="smiley-face" aria-hidden="true">${n}</span>
                  <strong>${i}</strong>
                  <small>${this.landmarkLabel(e,i)}</small>
                  ${t===i?r`<span class="selected-marker" aria-hidden="true">✓ Selected</span>`:c}
                </span>
              </label>
            `})}
        </div>
      </fieldset>
    `}renderPair(){const e=this.pairOrder[this.pairIndex],t=this.dimensionById.get(e.left),i=this.dimensionById.get(e.right),n=this.pairResponses[e.id];return r`
      <section class="panel" id="question-panel" aria-labelledby="pair-heading">
        <p class="step-label">Comparison ${this.pairIndex+1} of ${this.pairOrder.length}</p>
        <h2 id="pair-heading">${this.definition.pairwise.prompt}</h2>
        <p class="pair-instruction">
          ${this.definition.pairwise.instruction}
        </p>

        ${this.renderPairHelp(t,i)}
        <fieldset class="choice-fieldset">
          <legend>Choose one factor</legend>
          ${this.renderPairChoice(e.id,t,n===t.id)}
          ${this.renderPairChoice(e.id,i,n===i.id)}
        </fieldset>

        ${this.renderVoiceInput("pair",t,i)}
        ${this.renderNavigation(!0,"pair")}
      </section>
    `}renderPairChoice(e,t,i){const n=`${e}-${t.id}`;return r`
      <label
        class="choice-card"
        for=${n}
        data-gaze-target
        data-gaze-label=${t.name}
      >
        <input
          id=${n}
          type="radio"
          name=${e}
          value=${t.id}
          .checked=${i}
          @change=${()=>this.selectPair(e,t.id,"standard-choice")}
        />
        <span>
          <strong>${t.name}</strong>
          ${this.showSimpleLanguage?r`<small>${t.shortMeaning}</small>`:c}
        </span>
        ${i?r`<span class="selected-marker" aria-hidden="true">✓ Selected</span>`:c}
      </label>
    `}renderPairHelp(e,t){return this.showSimpleLanguage?r`<p class="simple-pair-prompt">In simpler words: ${this.definition.pairwise.simplePrompt}</p>`:r`
      <details
        class="optional-explanation pair-help"
        @toggle=${i=>this.speakOpenedHelp(i,`Simpler explanations. ${e.name}: ${e.simpleExplanation} ${t.name}: ${t.simpleExplanation}`)}
      >
        <summary>Need help with these factor names?</summary>
        <div class="explanation-grid">
          ${[e,t].map(i=>r`
              <div class="explanation-block">
                <h3>${i.name}</h3>
                <p>${i.simpleExplanation}</p>
              </div>
            `)}
        </div>
      </details>
    `}renderVoiceInput(e,t,i){if(!this.voiceInputAvailable)return c;const n=!!(window.SpeechRecognition??window.webkitSpeechRecognition),s=this.pendingVoiceAnswer?.context===e,a=e==="rating"?this.ratingVoicePrompt(t):`Say “${t.name}” or “${i.name}”.`;return r`
      <details class="voice-input" .open=${this.voiceState!=="idle"}>
        <summary>Answer this question by voice</summary>
        <div class="voice-input-content">
          <p>${a}</p>
          <p class="support-boundary">
            Voice input uses English recognition. Say one shown number in English. For an English questionnaire,
            you may instead say one complete exact visible answer label. Non-English answer labels are not
            recognised. Voice is optional, this prototype does not store audio, and the visible answer buttons
            remain available.
          </p>
          <button
            class="secondary-button large-answer-button"
            type="button"
            data-voice-start
            ?disabled=${!n||this.voiceState==="listening"}
            @click=${()=>this.startVoiceInput(e,t,i)}
          >
            ${this.voiceState==="listening"?"Listening…":"Start voice input"}
          </button>
          ${n?c:r`<p role="status">
                Built-in voice recognition is unavailable in this browser. System voice control can still activate
                the visible buttons by name.
              </p>`}
          ${this.voiceMessage?r`<p role="status" aria-live="polite" aria-atomic="true">${this.voiceMessage}</p>`:c}
          ${s&&this.pendingVoiceAnswer?r`
                <div class="voice-confirmation">
                  <p>I heard: <strong lang=${this.definition.language} dir="auto">${this.pendingVoiceAnswer.transcript}</strong></p>
                  <p>Proposed answer: <strong lang=${this.definition.language} dir="auto">${this.pendingVoiceAnswer.label}</strong></p>
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
    `}renderNavigation(e,t){const i=t==="rating"&&this.ratingIndex===this.dimensions.length-1,n=t==="pair"&&this.pairIndex===this.pairOrder.length-1,s=i?this.pairOrder.length?"Continue to comparisons":"Review responses":n?"Review responses":"Next question";return r`
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
          data-gaze-label=${s}
          @click=${()=>this.goNext(t)}
        >
          ${s}
        </button>
      </div>
    `}renderReview(){return r`
      <section class="panel" id="question-panel" aria-labelledby="review-heading">
        <h2 id="review-heading">Review your responses</h2>
        <p>Check every response before calculating the ${this.definition.scoring.scoreName.toLowerCase()}.</p>

        ${this.hostSubmissionFailed&&this.submittedRecord?r`
              <section class="submission-recovery" aria-labelledby="submission-recovery-heading">
                <h3 id="submission-recovery-heading">The study platform has not confirmed this response</h3>
                <p>
                  Your answers remain available on this page. You can retry submission, return to an answer,
                  or save a backup now.
                </p>
                ${this.completionSavedLocally?r`<p>A complete backup is also stored in this browser on this device.</p>`:r`<p>
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
          ${this.dimensions.map(e=>r`
              <div>
                <dt>${e.name}</dt>
                <dd>
                  ${this.ratings[e.id]}
                  <small>(${this.ratingRouteLabel(e.id)})</small>
                </dd>
              </div>
            `)}
        </dl>

        ${this.pairOrder.length?r`<h3>Pairwise comparisons</h3>
              <ol class="review-list">
                ${this.pairOrder.map(e=>{const t=this.dimensionById.get(e.left),i=this.dimensionById.get(e.right),n=this.dimensionById.get(this.pairResponses[e.id]);return r`<li>${t.name} or ${i.name}: <strong>${n.name}</strong></li>`})}
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
          ${this.pairOrder.length?r`<button
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
    `}renderComplete(){if(!this.result||!this.submittedRecord)return c;const e=!this.studyConfig||this.studyConfig.showScoreToParticipant;return r`
      <section class="panel confirmation" id="question-panel" aria-labelledby="complete-heading">
        <h2 id="complete-heading">${this.studyConfig&&this.completionSavedByHost&&!this.remoteRecordingUnconfirmed?"Submitting response":this.studyConfig?"Result prepared":"Responses calculated"}</h2>
        ${e?r`<p class="score">
              ${this.result.scoreName}:
              <strong>${this.result.primaryScore.toFixed(2)}</strong>
              out of ${this.result.scoreMaximum}
            </p>`:r`<p>Your responses have been recorded. The study configuration does not display the calculated score on the participant page.</p>`}
        ${this.studyConfig?this.remoteRecordingUnconfirmed?r`<div
                class="error-summary"
                id="remote-recording-error"
                role="alert"
                tabindex="-1"
              >
                <h3>Qualtrics has not confirmed a recorded response</h3>
                <p>
                  The completed answers are still available in the backup on this device, but the
                  recorded result page did not open. Reconnect to the internet, keep or download
                  one backup, and use the restored Qualtrics Next button to try the submission again.
                </p>
                <p>Tell the study conductor if the recorded result page still does not appear.</p>
              </div>`:this.completionSavedByHost?r`<div class="save-status">
                <h3>Submitting response</h3>
                <p>This page will continue automatically. No action is needed.</p>
                ${this.completionSavedLocally?c:r`<p>
                      This browser could not keep a backup copy. If the recorded result page does not
                      appear, use the JSON or CSV backup button below before closing the page.
                    </p>`}
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
        <p>Support and input-route metadata remain separate from the questionnaire score.</p>
        ${!this.studyConfig||!this.completionSavedByHost||this.remoteRecordingUnconfirmed?this.renderCompletionReadAloudControl():c}
        ${this.studyConfig?c:r`<details>
              <summary>Show the complete result record</summary>
              <pre>${JSON.stringify(this.submittedRecord,null,2)}</pre>
            </details>`}
        ${this.studyConfig&&this.completionSavedByHost?r`<aside class="submission-fallback" aria-labelledby="submission-fallback-heading">
              <h3 id="submission-fallback-heading">If this page does not continue</h3>
              <p>
                Wait for the error instructions. If an error appears, keep this page open or use one backup
                button before closing it.
              </p>
              <div class="button-row compact">
                <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultJson}>
                  Download JSON backup
                </button>
                <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultCsv}>
                  Download CSV backup
                </button>
              </div>
            </aside>`:r`<div class="button-row compact">
              <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultJson}>
                Download JSON backup
              </button>
              <button class="secondary-button large-answer-button" type="button" @click=${this.downloadResultCsv}>
                Download CSV backup
              </button>
              ${this.studyConfig?c:r`<button class="secondary-button large-answer-button" type="button" @click=${this.restart}>Start again</button>`}
            </div>`}
        ${this.studyConfig?this.completionSavedByHost&&!this.remoteRecordingUnconfirmed?c:r`<p>
              <strong>Participant:</strong>
              ${this.remoteRecordingUnconfirmed?"reconnect to the internet and use the restored Qualtrics Next button. Keep or download a backup until the recorded result page appears.":"please return the device or completion notice to the study conductor."}
            </p>`:c}
      </section>
    `}announceSavedSessionOffer(e){const t=`${e.configId}:${e.participantCode}:${e.savedAt}`;if(this.savedSessionAnnouncementKey===t)return;this.savedSessionAnnouncementKey=t;const i=this.savedSessionOfferSpeech(e);this.statusMessage="",this.updateComplete.then(()=>{const n=this.savedSession;if(!n||n.savedAt!==e.savedAt||n.configId!==e.configId||n.participantCode!==e.participantCode)return;const s=this.querySelector("#saved-session-offer");s&&R(s,{block:"center",forceCoordinateScroll:!0,onReveal:()=>this.requestParentReveal(s)}),window.setTimeout(()=>{const a=this.savedSession;!this.isConnected||!a||a.savedAt!==e.savedAt||a.configId!==e.configId||a.participantCode!==e.participantCode||(this.statusMessage=i,this.audioGuidance&&this.speakText(i))},650)})}savedSessionOfferSpeech(e){return`Saved questionnaire found. ${Object.keys(e.ratings).length+Object.keys(e.pairResponses).length} of ${this.dimensions.length+this.pairs.length} responses are saved in this browser. Resume saved questionnaire. Erase saved answers.`}renderSavedSessionOffer(){if(!this.savedSession)return c;const e=Object.keys(this.savedSession.ratings).length+Object.keys(this.savedSession.pairResponses).length;return r`
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
    `}renderCompletedBackupOffer(){const e=this.recoveredCompletedRecord;return e?r`
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
    `:c}renderResumeSummary(){return r`
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
    `}setSimpleLanguage(e){const t=e.currentTarget.checked;this.recordSupportChange("simpler-explanations",this.showSimpleLanguage,t),this.showSimpleLanguage=t,this.invalidatePendingSubmission(),this.persistProgress(),this.announceAutomatic(t?this.currentSimpleExplanationSpeech():this.isResearcherSuppliedDefinition?"Simpler explanations are off. The questionnaire item wording remains available.":"Simpler explanations are off. The official questionnaire wording remains available.")}recordSupportChange(e,t,i){!this.studyConfig||t===i||this.stage==="complete"||(this.supportChanges=[...this.supportChanges,{setting:e,from:t,to:i,stage:this.stage,changedAt:new Date().toISOString()}])}setAnswerMode(e){e==="smiley"&&!this.definition.supports.smileyLandmarks||(this.recordSupportChange("answer-mode",this.answerMode,e),this.answerMode=e,this.invalidatePendingSubmission(),this.persistProgress(),this.announceAutomatic(e==="smiley"?"Smiley landmark answer format selected. Each rating offers five labelled values, with the full precise scale available on request.":`Standard answer format selected. Each rating uses ${this.ratingValues.length} values from ${this.definition.scale.minimum} to ${this.definition.scale.maximum} in steps of ${this.definition.scale.step}.`))}setLargeText(e){this.recordSupportChange("text-size",this.largeText?"large":"standard",e?"large":"standard"),this.largeText=e,this.invalidatePendingSubmission(),this.persistProgress(),this.announceAutomatic(`${e?"Large":"Standard"} text selected.`)}setRecovery(e){const t=e.currentTarget.checked;this.recordSupportChange("interruption-recovery",this.recoveryEnabled,t),this.recoveryEnabled=t,this.invalidatePendingSubmission(),this.recoveryEnabled?(this.rememberParticipantCodeForTab(),this.persistProgress()):(this.forgetParticipantCodeForTab(),this.clearSavedProgress()),this.announceAutomatic(t?"Interruption recovery is on. Incomplete answers will be stored in this browser.":"Interruption recovery is off. The saved in-progress copy has been removed.")}landmarkLabel(e,t){const i=this.smileyLandmarks.find(n=>n.value===t)?.position;return i==="low"?e.lowAnchor:i==="closer-low"?`Closer to ${e.lowAnchor}`:i==="middle"?"Middle":i==="closer-high"?`Closer to ${e.highAnchor}`:i==="high"?e.highAnchor:String(t)}ratingValueLabel(e,t){const i=e.responseLabels?.[String(t)];return i||(t===this.definition.scale.minimum?e.lowAnchor:t===this.definition.scale.maximum?e.highAnchor:null)}ratingOptionLabel(e,t){const i=this.ratingValueLabel(e,t);return i?`${t}, ${i}, for ${e.name}`:`${t} for ${e.name}`}ratingVoicePrompt(e){if(this.answerMode!=="smiley"){const n=`Say one shown value from ${this.definition.scale.minimum} to ${this.definition.scale.maximum} in steps of ${this.definition.scale.step}. Other numbers are not rounded or guessed.`;return this.ratingValues.flatMap(a=>{const o=e.responseLabels?.[String(a)];return o?[`${a}, ${o}`]:[]}).length>0&&F(this.definition.language)?`${n} You may instead say one exact visible answer label.`:this.definition.scale.type==="magnitude"?n:`${n} You may instead say the exact visible endpoint label: ${e.lowAnchor} or ${e.highAnchor}.`}const t=this.smileyLandmarks.map(({value:n})=>this.landmarkLabel(e,n)),i=this.smileyLandmarks.map(({value:n})=>n);return`For the most reliable voice input, say one shown value: ${i.slice(0,-1).join(", ")}, or ${i.at(-1)}. You may instead say one visible label: ${t.slice(0,-1).join(", ")}, or ${t.at(-1)}. On a phone, use the number if a short label such as Low is not recognised.`}ratingVoiceAnswerLabel(e,t){const i=this.answerMode==="smiley"&&this.smileyLandmarks.some(s=>s.value===t),n=this.ratingValueLabel(e,t);return i?`${this.landmarkLabel(e,t)}, value ${t}, for ${e.name}`:n?`${n}, value ${t}, for ${e.name}`:`${t} for ${e.name}`}ratingRouteLabel(e){const t=this.ratingInputRoutes[e];return t==="smiley-landmark"?"smiley landmark":t==="voice"?"voice, confirmed":t==="gaze-standard-scale"?"gaze, standard scale, confirmed":t==="gaze-smiley-landmark"?"gaze, smiley landmark, confirmed":"full scale"}selectRating(e,t,i){i!=="voice"&&this.voiceState!=="idle"&&this.clearVoiceAnswer(),this.invalidatePendingSubmission();const n=this.gazeActivationInProgress?i==="smiley-landmark"?"gaze-smiley-landmark":"gaze-standard-scale":i;this.ratings={...this.ratings,[e]:t},this.ratingInputRoutes={...this.ratingInputRoutes,[e]:n},this.clearError();const s=this.dimensionById.get(e),a=this.answerMode==="smiley"&&this.smileyLandmarks.some(p=>p.value===t),o=this.ratingValueLabel(s,t);this.statusMessage=a?`${s.name}, ${this.landmarkLabel(s,t)}, value ${t}, selected.`:o?`${s.name}, ${o}, value ${t}, selected.`:`${s.name}, ${t}, selected.`,this.announceAutomatic(this.statusMessage),this.persistProgress()}selectPair(e,t,i){i!=="voice"&&this.voiceState!=="idle"&&this.clearVoiceAnswer(),this.invalidatePendingSubmission();const n=this.gazeActivationInProgress?"gaze":i;this.pairResponses={...this.pairResponses,[e]:t},this.pairInputRoutes={...this.pairInputRoutes,[e]:n},this.clearError(),this.statusMessage=`${this.dimensionById.get(t).name} selected.`,this.announceAutomatic(this.statusMessage),this.persistProgress()}goNext(e){if(this.stopReading(),this.clearVoiceAnswer(),e==="rating"){const t=this.dimensions[this.ratingIndex];if(this.ratings[t.id]===void 0){this.showError(`Choose a rating for ${t.name} before continuing.`);return}this.ratingIndex<this.dimensions.length-1?this.ratingIndex+=1:this.pairOrder.length?(this.stage="pairs",this.pairIndex=0):this.stage="review"}else{const t=this.pairOrder[this.pairIndex];if(!this.pairResponses[t.id]){this.showError("Choose which factor contributed more to workload before continuing.");return}this.pairIndex<this.pairOrder.length-1?this.pairIndex+=1:this.stage="review"}this.clearError(),this.persistProgress(),this.focusHeading()}effectiveStudyConfig(){return this.studyConfig?this.studyConfig:{schemaVersion:4,configId:"demo-config",createdAt:this.startedAt||new Date().toISOString(),prototypeVersion:T,instrumentId:this.definition.id,studyId:"DEMO",studyTitle:"Technical demonstration",taskLabel:"a task completed before the questionnaire",showScoreToParticipant:!0,support:{showSimpleLanguage:!1,answerMode:"standard",largeText:!1,audioGuidance:!1,recoveryEnabled:!1,participantAdjustmentPolicy:"presentation-only",voiceInputAvailable:!0,gazeInputAvailable:!0},collection:{mode:"local"}}}currentSupportMetadata(){return{simplerExplanationsShownAtSubmission:this.showSimpleLanguage,largeTextUsedAtSubmission:this.largeText,answerModeAtSubmission:this.answerMode,recoveryEnabledAtSubmission:this.recoveryEnabled,interruptionSummaryShown:this.interruptionSummaryShown,readAloudUsed:this.readAloudUsed,automaticAudioGuidanceEnabledAtSubmission:this.audioGuidance,gazeUsed:this.gazeUsed,gazeActionCount:this.gazeActionCount,gazeEngine:this.gazeUsed?`WebGazer ${k}`:null,ratingInputRoutes:this.ratingInputRoutes,pairInputRoutes:this.pairInputRoutes,supportChanges:[...this.supportChanges]}}downloadRecordJson(e){M(`${L(e)}.json`,JSON.stringify(e,null,2),"application/json")}downloadRecordCsv(e){M(`${L(e)}.csv`,`\uFEFF${se([e])}`,"text/csv")}invalidatePendingSubmission(){this.submittedRecord&&this.completionSavedLocally&&!this.completionSavedByHost&&ne(this.submittedRecord.submissionId),this.result=null,this.submittedRecord=null,this.completionSavedLocally=!1,this.completionSavedByHost=!1,this.remoteRecordingUnconfirmed=!1,this.hostSubmissionFailed=!1}announceAutomatic(e){this.audioGuidance&&e.trim()&&this.speakText(e)}speakOpenedHelp(e,t){e.currentTarget.open&&this.announceAutomatic(t)}speakText(e){if(!("speechSynthesis"in window)||!("SpeechSynthesisUtterance"in window)){this.audioStatusMessage="Built-in audio is unavailable in this browser. External screen readers can still read the page.";return}const t=window.speechSynthesis,i=this.readingAloud||t.speaking||t.pending||t.paused,n=++this.speechRequestId,s=new SpeechSynthesisUtterance(e);s.lang="en-GB",s.rate=1,s.pitch=1,s.volume=1,s.onend=()=>{n===this.speechRequestId&&(this.readingAloud=!1,this.audioStatusMessage="Spoken guidance finished.")},s.onerror=o=>{if(n!==this.speechRequestId)return;this.readingAloud=!1;const p=o.error?` (${o.error})`:"";this.audioStatusMessage=`No audio was played because the browser reported a speech error${p}. Check the device volume and try the button again.`};const a=()=>{if(n===this.speechRequestId)try{t.speak(s),this.readingAloud=!0,this.readAloudUsed=!0,this.audioStatusMessage="Playing spoken guidance."}catch{this.readingAloud=!1,this.audioStatusMessage="Built-in audio could not start in this browser. Check the device volume and try the button again."}};i?(t.cancel(),window.setTimeout(a,0)):a()}stopReading(e=!1){this.speechRequestId+=1,"speechSynthesis"in window&&window.speechSynthesis.cancel(),this.readingAloud=!1,e&&(this.audioStatusMessage="Spoken guidance stopped.")}currentStepSpeech(){if(this.stage==="intro"){const t=this.studyConfig?`Think about ${this.studyConfig.taskLabel}.`:"",i=this.answerMode==="smiley"?"The rating format uses five labelled smiley landmarks. A precise scale is available on request.":`The rating format uses ${this.ratingValues.length} values from ${this.definition.scale.minimum} to ${this.definition.scale.maximum}.`,n=this.pairs.length?` Then make ${this.pairs.length} pairwise comparisons.`:"";return`Before you begin. ${this.definition.introPrompt} ${t} Answer ${this.dimensions.length} items. ${i}${n} Finally review and submit.`}if(this.stage==="ratings"){const t=this.dimensions[this.ratingIndex],i=this.showSimpleLanguage&&t.simpleExplanation?` Simpler explanation: ${t.simpleExplanation}`:"",n=this.answerMode==="smiley"?`Choose a smiley landmark: ${this.smileyLandmarks.map(({value:s})=>`${this.landmarkLabel(t,s)}, value ${s}`).join("; ")}. A more precise value is available on the full scale.`:`Rate from ${this.definition.scale.minimum}, ${t.lowAnchor}, to ${this.definition.scale.maximum}, ${t.highAnchor}, in steps of ${this.definition.scale.step}.`;return`Rating ${this.ratingIndex+1} of ${this.dimensions.length}. ${t.name}. Official item: ${t.prompt}.${i} ${n}`}if(this.stage==="pairs"){const t=this.pairOrder[this.pairIndex],i=this.dimensionById.get(t.left),n=this.dimensionById.get(t.right),s=this.showSimpleLanguage?` In simpler words, ${this.definition.pairwise.simplePrompt} ${i.name}: ${i.shortMeaning}. ${n.name}: ${n.shortMeaning}.`:"";return`Comparison ${this.pairIndex+1} of ${this.pairOrder.length}. ${this.definition.pairwise.prompt} ${this.definition.pairwise.instruction} Choose ${i.name} or ${n.name}.${s}`}return this.stage==="review"?`Review ${this.dimensions.length} item responses${this.pairs.length?` and ${this.pairs.length} comparisons`:""} before submitting.`:this.studyConfig&&this.remoteRecordingUnconfirmed?this.statusMessage.trim()||"Qualtrics could not confirm this response. Reconnect to the internet, then select Next to try again. Keep this page open or download one backup before closing it.":this.studyConfig&&this.completionSavedByHost?"Submitting response. No action is needed.":this.result?`Responses calculated.${!this.studyConfig||this.studyConfig.showScoreToParticipant?` ${this.result.scoreName}: ${this.result.primaryScore.toFixed(2)} out of ${this.result.scoreMaximum}.`:""} JSON and CSV backup buttons are available on this page.`:"Responses calculated."}currentSimpleExplanationSpeech(){if(this.stage==="ratings"){const e=this.dimensions[this.ratingIndex];return e.simpleExplanation?`Simpler explanation for ${e.name}. ${e.simpleExplanation} Use the ${this.isResearcherSuppliedDefinition?"declared":"official"} scale when choosing your response.`:"This questionnaire definition does not provide reworded item text."}if(this.stage==="pairs"){const e=this.pairOrder[this.pairIndex],t=this.dimensionById.get(e.left),i=this.dimensionById.get(e.right);return`In simpler words, ${this.definition.pairwise.simplePrompt} ${t.name}: ${t.shortMeaning}. ${i.name}: ${i.shortMeaning}.`}return"Simpler explanations are on. Official questionnaire wording remains visible."}resumeSummarySpeech(){return`Welcome back. ${this.completedCount()} of ${this.dimensions.length+this.pairs.length} responses completed. Last saved response: ${this.lastSavedDescription()}. Current position: ${this.currentPositionDescription()}. Next action: ${this.nextActionDescription()}`}async showGazePositioningStep(e){this.webgazer&&(this.restoreWebGazerPreviewContainer(),this.webgazer.showPredictionPoints(!1),this.webgazer.showVideoPreview(!0),this.webgazer.showFaceOverlay(!0),this.webgazer.showFaceFeedbackBox(!0),this.gazeState="positioning",this.gazeMessage=e,this.announceAutomatic(this.gazeMessage),await this.updateComplete,this.mountWebGazerPreview(),this.querySelector("#gaze-positioning-heading")?.focus())}mountWebGazerPreview(){const e=this.querySelector(".gaze-camera-preview-slot"),t=document.querySelector("#webgazerVideoContainer");!e||!t||(t.setAttribute("aria-hidden","true"),e.append(t))}restoreWebGazerPreviewContainer(){const e=document.querySelector("#webgazerVideoContainer");e&&e.parentElement!==document.body&&document.body.append(e)}handleGazePoint(e){if(this.gazeState!=="ready"||!e){this.resetGazeHover();return}const t=this.elementsAtGazePoint(e);if(this.gazePendingElement){const o=t.map(g=>g.closest("[data-gaze-confirm], [data-gaze-cancel]")).find(g=>g!==null)??null,p=o?.hasAttribute("data-gaze-confirm")?"confirm":o?.hasAttribute("data-gaze-cancel")?"cancel":null,h=this.gazeConfirmationTracker.update(p,performance.now());this.gazeDwellProgress=h.progress,h.activated&&p==="confirm"&&this.confirmGazeProposal(),h.activated&&p==="cancel"&&this.cancelGazeProposal();return}const i=t.map(o=>o.closest("[data-gaze-target]")).find(o=>o!==null)??null,n=i&&!i.matches(":disabled")?i:null;n!==this.gazeCandidateElement&&(this.resetGazeHover(),this.gazeCandidateElement=n);const s=n?.dataset.gazeLabel??n?.textContent?.trim()??null,a=this.gazeCandidateTracker.update(s,performance.now());this.setGazeHover(n,a.progress),n&&a.activated&&(this.gazePendingElement=n,this.gazePendingLabel=s??"selected control",this.gazeDwellProgress=0,this.resetGazeHover(),this.statusMessage=`${this.gazePendingLabel} proposed by gaze. Confirm or cancel.`,this.announceAutomatic(this.statusMessage))}elementsAtGazePoint(e){if(typeof document.elementsFromPoint=="function")return document.elementsFromPoint(e.x,e.y).filter(i=>i instanceof HTMLElement);const t=document.elementFromPoint(e.x,e.y);return t instanceof HTMLElement?[t]:[]}setGazeHover(e,t){this.gazeCandidateElement=e,this.gazeDwellProgress=t,e&&(e.classList.add("gaze-hover"),e.style.setProperty("--gaze-progress",`${t*100}%`))}resetGazeHover(){this.gazeCandidateTracker.reset(),this.gazeCandidateElement&&(this.gazeCandidateElement.classList.remove("gaze-hover"),this.gazeCandidateElement.style.removeProperty("--gaze-progress")),this.gazeCandidateElement=null,this.gazePendingElement||(this.gazeDwellProgress=0)}stopGazeInputInternal(e){const t=this.gazeState!=="off"||this.webgazer!==null;this.cancelGazeProposal(),this.resetGazeHover(),this.restoreWebGazerPreviewContainer(),this.releaseGazeResources(),this.gazeState="off",this.gazeMessage="Gaze input and camera stopped.",e&&t&&this.announceAutomatic(this.gazeMessage)}releaseGazeResources(){const e=this.webgazer;if(e){this.restoreWebGazerPreviewContainer();try{e.clearGazeListener()}catch{}try{e.removeMouseEventListeners()}catch{}try{e.stopVideo()}catch{}try{e.end()}catch{}Promise.resolve(e.clearData()).catch(()=>{}),this.webgazer=null}}startVoiceInput(e,t,i){this.stopReading();const n=window.SpeechRecognition??window.webkitSpeechRecognition;if(!n)return;this.releaseRecognition(),this.pendingVoiceAnswer=null,this.voiceMessage="Listening for one answer.",this.voiceState="listening";const s=new n;this.recognition=s,s.lang="en-GB",s.continuous=!1,s.interimResults=!1,s.maxAlternatives=5,s.onresult=a=>{if(this.recognition!==s)return;const o=a.results[0],p=[];for(let h=0;o&&h<o.length;h+=1){const g=o[h]?.transcript?.trim();g&&p.push(g)}if(e==="rating"){const h=xe(p,t,this.ratingValues,this.smileyLandmarks),g=F(this.definition.language)||h&&new RegExp("\\p{Number}|\\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\\b","iu").test(h.transcript)?h:null;if(g){this.releaseRecognition(s);const v=this.ratingVoiceAnswerLabel(t,g.value);this.pendingVoiceAnswer={context:e,transcript:g.transcript,value:g.value,label:v},this.voiceState="pending",this.voiceMessage=`Proposed answer: ${v}. Confirm this answer or try again.`,this.announceAutomatic(this.voiceMessage),this.updateComplete.then(()=>this.querySelector("[data-voice-confirm]")?.focus());return}}else{const h=Ie(p,[t,i]);if(h){this.releaseRecognition(s);const g=this.dimensionById.get(h.value).name;this.pendingVoiceAnswer={context:e,transcript:h.transcript,value:h.value,label:g},this.voiceState="pending",this.voiceMessage=`Proposed answer: ${g}. Confirm this answer or try again.`,this.announceAutomatic(this.voiceMessage),this.updateComplete.then(()=>this.querySelector("[data-voice-confirm]")?.focus());return}}this.releaseRecognition(s),this.showVoiceNotice(e==="rating"?"No answer was selected. Say one shown number in English, or use a visible answer button.":`No answer was selected. Say ${t.name} or ${i.name}, or use a visible answer button.`)},s.onerror=a=>{this.recognition===s&&(this.releaseRecognition(s),this.showVoiceNotice(this.voiceRecognitionErrorMessage(a.error)))},s.onend=()=>{this.recognition===s&&(this.recognition=null,this.voiceState==="listening"&&this.showVoiceNotice("No answer was selected. Try again, or use a visible answer button."))};try{s.start()}catch{this.releaseRecognition(s),this.showVoiceNotice("Voice input is unavailable in this browser context. Use a visible answer button.")}}voiceRecognitionErrorMessage(e){switch(e){case"not-allowed":case"service-not-allowed":return"Microphone or speech-service permission was not granted. Allow microphone access, or use the visible answer buttons.";case"language-not-supported":case"language-unavailable":return"English voice input is unavailable in this browser. Use a visible answer button.";case"no-speech":return"No speech was detected. Try again after the microphone starts listening, or use the visible answer buttons.";case"audio-capture":return"No working microphone was available. Check the selected microphone, or use the visible answer buttons.";case"network":return"The browser speech service could not connect. Check the network, try again, or use the visible answer buttons.";case"aborted":return"Voice input stopped before a result was returned. Try again, or use the visible answer buttons.";default:return`Voice input is unavailable${e?` (${e})`:""}. Try again, or use a visible answer button.`}}showVoiceNotice(e){this.voiceState="error",this.voiceMessage=e,this.announceAutomatic(e)}releaseRecognition(e=this.recognition){if(e){this.recognition===e&&(this.recognition=null),e.onresult=null,e.onerror=null,e.onend=null;try{e.stop()}catch{}}}currentProgressStorageKey(){const e=this.studyConfig?this.participantCode:"DEMO";return y(e)?ae(this.studyConfig?.configId??"demo-config",e):null}currentTabParticipantCodeKey(){return this.studyConfig?`accessible-questionnaire-v0.8-tab-participant:${this.studyConfig.configId}`:null}rememberParticipantCodeForTab(){const e=this.currentTabParticipantCodeKey();if(!(!e||!this.recoveryEnabled||!y(this.participantCode)))try{sessionStorage.setItem(e,this.participantCode)}catch{}}forgetParticipantCodeForTab(){const e=this.currentTabParticipantCodeKey();if(e)try{sessionStorage.removeItem(e)}catch{}}restoreParticipantCodeForTab(){const e=this.currentTabParticipantCodeKey();if(!(!e||!this.recoveryEnabled||y(this.participantCode)))try{const t=sessionStorage.getItem(e);if(!t||!y(t))return;this.participantCode=t,this.participantCodeRestoredForTab=!0,this.statusMessage="Participant code restored for this tab. Checking for interrupted answers."}catch{}}persistProgress(){if(!this.recoveryEnabled||!this.isInProgress())return;const e=this.currentProgressStorageKey();if(!e)return;const t={version:4,instrumentId:this.definition.id,savedAt:Date.now(),startedAt:this.startedAt||new Date().toISOString(),configId:this.studyConfig?.configId??"demo-config",participantCode:this.studyConfig?this.participantCode:"DEMO",stage:this.stage,ratingIndex:this.ratingIndex,pairIndex:this.pairIndex,pairOrder:this.pairOrder,pairResponses:this.pairResponses,ratings:this.ratings,ratingInputRoutes:this.ratingInputRoutes,pairInputRoutes:this.pairInputRoutes,supportChanges:this.supportChanges,support:{answerMode:this.answerMode,showSimpleLanguage:this.showSimpleLanguage,largeText:this.largeText,audioGuidance:this.audioGuidance}};try{localStorage.setItem(e,JSON.stringify(t))}catch{this.statusMessage="Progress could not be saved by this browser.",this.announceAutomatic(this.statusMessage)}}applySavedRecoveryPresentation(e){this.canAdjustPresentationSupport&&(this.largeText=e.support.largeText,this.audioGuidance=!!e.support.audioGuidance)}findSavedSession(){const e=this.currentProgressStorageKey();if(!e)return;let t=null;try{let i=localStorage.getItem(e);if(!i&&this.definition.id===w){const s=this.studyConfig?this.participantCode:"DEMO";y(s)&&(t=`accessible-nasa-tlx-v0.7-progress:${this.studyConfig?.configId??"demo-config"}:${s}`,i=localStorage.getItem(t))}if(!i)return;const n=this.normaliseSavedSession(JSON.parse(i));this.validSavedSession(n)?(t&&(localStorage.setItem(e,JSON.stringify(n)),localStorage.removeItem(t)),this.savedSession=n,this.applySavedRecoveryPresentation(n),this.announceSavedSessionOffer(n)):t||this.clearSavedProgress()}catch{t||this.clearSavedProgress()}}normaliseSavedSession(e){if(!e||typeof e!="object")return null;const t=e;return t.version===4?t:t.version!==3||this.definition.id!==w?null:{...t,version:4,instrumentId:w}}findCompletedBackup(){if(!this.studyConfig||!y(this.participantCode))return;const e=re().filter(t=>t.study.configId===this.studyConfig.configId&&t.participantCode===this.participantCode);this.recoveredCompletedRecord=e.at(-1)??null}validSavedSession(e){if(e?.version!==4||e.instrumentId!==this.definition.id||e.configId!==(this.studyConfig?.configId??"demo-config")||e.participantCode!==(this.studyConfig?this.participantCode:"DEMO")||!Number.isFinite(e.savedAt)||typeof e.startedAt!="string"||!["ratings","pairs","review"].includes(e.stage)||!Number.isInteger(e.ratingIndex)||e.ratingIndex<0||e.ratingIndex>=this.dimensions.length||!Number.isInteger(e.pairIndex)||e.pairIndex<0||e.pairIndex>=Math.max(1,this.pairs.length)||e.stage==="pairs"&&this.pairs.length===0||!Array.isArray(e.pairOrder)||!Array.isArray(e.supportChanges)||!e.ratings||typeof e.ratings!="object"||!e.pairResponses||typeof e.pairResponses!="object"||!e.ratingInputRoutes||typeof e.ratingInputRoutes!="object"||!e.pairInputRoutes||typeof e.pairInputRoutes!="object"||!e.support||typeof e.support!="object"||!["standard","smiley"].includes(e.support.answerMode)||typeof e.support.showSimpleLanguage!="boolean"||typeof e.support.largeText!="boolean"||e.support.audioGuidance!==void 0&&typeof e.support.audioGuidance!="boolean")return!1;const t=new Set(this.dimensions.map(({id:a})=>a)),i=new Set(this.ratingValues);if(Object.entries(e.ratings).some(([a,o])=>!t.has(a)||typeof o!="number"||!i.has(o))||Object.entries(e.ratingInputRoutes).some(([a,o])=>!t.has(a)||typeof o!="string"||!["standard-scale","smiley-landmark","voice","gaze-standard-scale","gaze-smiley-landmark"].includes(o)))return!1;const n=new Map(this.pairs.map(a=>[a.id,a])),s=new Set;for(const a of e.pairOrder){const o=n.get(a?.id);if(!o||o.left!==a.left||o.right!==a.right||s.has(a.id))return!1;s.add(a.id)}return!(s.size!==n.size||Object.entries(e.pairResponses).some(([a,o])=>{const p=n.get(a);return!p||o!==p.left&&o!==p.right})||Object.entries(e.pairInputRoutes).some(([a,o])=>!n.has(a)||typeof o!="string"||!["standard-choice","voice","gaze"].includes(o)))}clearSavedProgress(){const e=this.currentProgressStorageKey();if(e)try{localStorage.removeItem(e)}catch{}}isInProgress(){return this.stage==="ratings"||this.stage==="pairs"||this.stage==="review"}completedCount(){return Object.keys(this.ratings).length+Object.keys(this.pairResponses).length}lastSavedDescription(){if(this.stage==="ratings"){const e=this.ratings[this.dimensions[this.ratingIndex].id]!==void 0?this.ratingIndex:this.ratingIndex-1;return e>=0?`${this.dimensions[e].name} rating`:"No response yet"}return this.stage==="pairs"?this.pairResponses[this.pairOrder[this.pairIndex].id]?`Comparison ${this.pairIndex+1}`:this.pairIndex>0?`Comparison ${this.pairIndex}`:`${this.dimensions.at(-1)?.name??"Final item"} rating`:this.pairs.length?`Comparison ${this.pairs.length}`:`${this.dimensions.at(-1)?.name??"Final item"} rating`}currentPositionDescription(){return this.stage==="ratings"?`Rating ${this.ratingIndex+1} of ${this.dimensions.length}: ${this.dimensions[this.ratingIndex].name}`:this.stage==="pairs"?`Comparison ${this.pairIndex+1} of ${this.pairOrder.length}`:this.stage==="review"?"Review responses":"Questionnaire introduction"}nextActionDescription(){if(this.stage==="ratings")return`Choose or check the ${this.dimensions[this.ratingIndex].name} rating, then select Next.`;if(this.stage==="pairs"){const e=this.pairOrder[this.pairIndex];return`Choose ${this.dimensionById.get(e.left).name} or ${this.dimensionById.get(e.right).name}, then select Next.`}return"Check the saved answers, then submit or return to a question."}showError(e){this.errorMessage=e,this.updateComplete.then(()=>{const t=this.querySelector("#error-summary");t&&(R(t,{block:"start",forceCoordinateScroll:!0,onReveal:()=>this.requestParentReveal(t)}),this.announceAutomatic(`There is a problem. ${e}`))})}requestParentReveal(e){}clearError(){this.errorMessage=""}focusHeading(e=!0){this.updateComplete.then(()=>{window.scrollTo({top:0});const t=this.querySelector("#question-panel h2");t&&(t.tabIndex=-1,t.focus(),this.statusMessage=t.textContent?.trim()??"",e&&this.audioGuidance&&this.speakText(this.currentStepSpeech()))})}};d([u()],l.prototype,"stage",2);d([u()],l.prototype,"ratingIndex",2);d([u()],l.prototype,"pairIndex",2);d([u()],l.prototype,"pairOrder",2);d([u()],l.prototype,"pairResponses",2);d([u()],l.prototype,"ratings",2);d([u()],l.prototype,"ratingInputRoutes",2);d([u()],l.prototype,"pairInputRoutes",2);d([u()],l.prototype,"supportChanges",2);d([u()],l.prototype,"answerMode",2);d([u()],l.prototype,"showSimpleLanguage",2);d([u()],l.prototype,"largeText",2);d([u()],l.prototype,"recoveryEnabled",2);d([u()],l.prototype,"resumeSummaryVisible",2);d([u()],l.prototype,"savedSession",2);d([u()],l.prototype,"recoveredCompletedRecord",2);d([u()],l.prototype,"readingAloud",2);d([u()],l.prototype,"readAloudUsed",2);d([u()],l.prototype,"audioGuidance",2);d([u()],l.prototype,"audioStatusMessage",2);d([u()],l.prototype,"interruptionSummaryShown",2);d([u()],l.prototype,"voiceState",2);d([u()],l.prototype,"voiceMessage",2);d([u()],l.prototype,"pendingVoiceAnswer",2);d([u()],l.prototype,"errorMessage",2);d([u()],l.prototype,"statusMessage",2);d([u()],l.prototype,"result",2);d([u()],l.prototype,"gazeState",2);d([u()],l.prototype,"gazeMessage",2);d([u()],l.prototype,"gazeCalibrationIndex",2);d([u()],l.prototype,"gazeCalibrationRepetition",2);d([u()],l.prototype,"gazePendingLabel",2);d([u()],l.prototype,"gazeDwellProgress",2);d([u()],l.prototype,"gazeUsed",2);d([u()],l.prototype,"gazeActionCount",2);d([u()],l.prototype,"studyConfig",2);d([u()],l.prototype,"configurationError",2);d([u()],l.prototype,"participantCode",2);d([u()],l.prototype,"participantCodeError",2);d([u()],l.prototype,"participantCodeRestoredForTab",2);d([u()],l.prototype,"startedAt",2);d([u()],l.prototype,"submittedRecord",2);d([u()],l.prototype,"completionSavedLocally",2);d([u()],l.prototype,"completionSavedByHost",2);d([u()],l.prototype,"remoteRecordingUnconfirmed",2);d([u()],l.prototype,"hostSubmissionFailed",2);d([u()],l.prototype,"submittingResult",2);d([u()],l.prototype,"hostBridgeState",2);d([u()],l.prototype,"hostBridgeMessage",2);l=d([Q("accessible-nasa-tlx")],l);let U=class extends l{};U=d([Q("accessible-questionnaire")],U);
