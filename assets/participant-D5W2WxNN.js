import{r as W,s as K,a as c,t as J,i as X,g as ee,D as I,v,b as te,c as ie,d as se,f as C,e as ne,h as ae,j as Y,k as re,P as L,A as l,l as r,m as M,n as G,o as oe,p as le,q as de,u as ce}from"./shared-o8MeAYs2.js";const ue="accessible-questionnaire:qualtrics-submit:v2",he="accessible-questionnaire:qualtrics-receipt:v2",pe="accessible-questionnaire:qualtrics-parent-ready:v2",ge="accessible-questionnaire:qualtrics-child-ready:v2",me="accessible-questionnaire:qualtrics-advance-failed:v2",y="0.8.7-q7";function fe(e=window){const t=e.accessibleQuestionnaireResultSink??e.accessibleNasaTlxResultSink;return!t||typeof t.name!="string"||!t.name.trim()||typeof t.submit!="function"?null:t}function be(e,t=window,i=()=>{},s=()=>{}){if(e.collection.mode!=="qualtrics")return null;const n=ye(e.collection.parentOrigin,t,i,s),a=ve(e.collection.parentOrigin,t,12e3,()=>n.getState()==="connected");return t.accessibleQuestionnaireResultSink=a,t.accessibleNasaTlxResultSink=a,{sink:a,bridge:n}}function ye(e,t=window,i=()=>{},s=()=>{}){let n="connecting",a=null;const u=(p,g)=>{n==="connected"||n==="failed"&&p!=="connected"||(n=p,i({state:n,message:g}))},h=p=>{if(p.source!==t.parent||p.origin!==e)return;const g=p.data;if(g?.type===me){g.bridgeBuild===y&&typeof g.error=="string"&&g.error.trim()&&s(g.error);return}if(g?.type===pe){if(g.protocolVersion!==2||g.bridgeBuild!==y){u("failed",`This Qualtrics survey is using an old or incomplete bridge. Expected ${y}. Do not start this questionnaire.`);return}a!==null&&(t.clearTimeout(a),a=null),t.parent.postMessage({type:ge,protocolVersion:2,bridgeBuild:y},e),u("connected",`Secure Qualtrics bridge ${y} connected.`)}};return t.addEventListener("message",h),i({state:n,message:`Checking Qualtrics bridge ${y}.`}),a=t.setTimeout(()=>{a=null,n!=="connected"&&u("failed",`The required Qualtrics bridge ${y} did not connect. Do not start this questionnaire.`)},8500),{getState:()=>n,disconnect(){a!==null&&(t.clearTimeout(a),a=null),t.removeEventListener("message",h)}}}function ve(e,t=window,i=12e3,s=()=>!0){return{name:"UCL Qualtrics",submit(n){return t.parent===t?Promise.reject(new Error("This centrally collected questionnaire must be opened through its Qualtrics survey.")):s()?new Promise((a,u)=>{let h=!1;const p=m=>{h||(h=!0,t.clearTimeout(f),t.removeEventListener("message",g),m())},g=m=>{if(m.source!==t.parent||m.origin!==e)return;const b=m.data;if(!(!b||b.type!==he||b.submissionId!==n.submissionId||b.bridgeBuild!==y)){if(b.accepted!==!0){p(()=>u(new Error(typeof b.error=="string"&&b.error?b.error:"Qualtrics did not accept the response.")));return}p(()=>a({accepted:!0,submissionId:n.submissionId,receiptId:typeof b.receiptId=="string"?b.receiptId:void 0}))}},f=t.setTimeout(()=>{p(()=>u(new Error("Qualtrics did not acknowledge the response in time.")))},i);t.addEventListener("message",g),t.parent.postMessage({type:ue,bridgeBuild:y,record:n},e)}):Promise.reject(new Error(`Qualtrics bridge ${y} is not connected. The response remains in the local backup.`))}}}async function we(e,t,i=15e3){let s;const n=new Promise((u,h)=>{s=setTimeout(()=>h(new Error("The study platform did not confirm receipt in time.")),i)});let a;try{a=await Promise.race([t.submit(e),n])}finally{s!==void 0&&clearTimeout(s)}if(!a||a.accepted!==!0||a.submissionId!==e.submissionId||a.receiptId!==void 0&&typeof a.receiptId!="string")throw new Error("The study platform returned an invalid submission receipt.");return a}const E=new Map([["zero",0],["five",5],["one zero",10],["ten",10],["fifteen",15],["twenty",20],["twenty five",25],["thirty",30],["thirty five",35],["forty",40],["forty five",45],["fifty",50],["fifty five",55],["sixty",60],["sixty five",65],["seventy",70],["seventy five",75],["eighty",80],["eighty five",85],["ninety",90],["ninety five",95],["one zero zero",100],["one hundred",100],["hundred",100]]),x=new Map([["zero","0"],["oh","0"],["one","1"],["two","2"],["three","3"],["four","4"],["five","5"],["six","6"],["seven","7"],["eight","8"],["nine","9"]]),q=["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"],O=["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];function $e(e){if(e<20)return q[e];if(e===100)return"one hundred";const t=Math.floor(e/10),i=e%10;return i===0?O[t]:`${O[t]} ${q[i]}`}for(let e=0;e<=100;e+=1){E.set($e(e),e);const t=String(e).split("").map(i=>[...x].find(([,s])=>s===i)?.[0]).filter(i=>!!i).join(" ");t&&E.set(t,e)}const B=new Set([...x.keys(),"ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety","hundred"]),T=/\b(?:not|no|cancel|neither|except|without|instead|rather|unsure|uncertain|maybe|perhaps|mistake|wrong|nicht|nein|abbrechen|ohne|stattdessen|unsicher|vielleicht|fehler|falsch)\b|\b(?:anything\s+but|other\s+than|don\s+t)\b/,Se={mental:["mental demand","mental"],physical:["physical demand","physical"],temporal:["temporal demand","temporal","time pressure"],performance:["performance"],effort:["effort"],frustration:["frustration"]};function S(e){return e.normalize("NFKD").toLocaleLowerCase().replace(new RegExp("\\p{Mark}+","gu"),"").replace(/ß/g,"ss").replace(/[\p{Dash_Punctuation}]/gu," ").replace(/[^\p{Letter}\p{Number}\s]/gu," ").replace(/\s+/g," ").trim()}function V(e){const t=S(e);return t?new Set([t,t.replace(/\s+/g,"")]):new Set}function Ce(e,t){const i=V(t);return[...V(e)].some(s=>i.has(s))}const D=["null","eins","zwei","drei","vier","fünf","sechs","sieben","acht","neun","zehn","elf","zwölf","dreizehn","vierzehn","fünfzehn","sechzehn","siebzehn","achtzehn","neunzehn"],N=["","","zwanzig","dreißig","vierzig","fünfzig","sechzig","siebzig","achtzig","neunzig"];function ze(e){if(e<20)return D[e];if(e===100)return"einhundert";const t=Math.floor(e/10),i=e%10;return i===0?N[t]:`${i===1?"ein":D[i]}und${N[t]}`}const $=new Map;for(let e=0;e<=100;e+=1)$.set(S(ze(e)),e);$.set("ein",1);$.set("hundert",100);$.set("ein hundert",100);function Re(e){return T.test(S(e))}function Z(e,t){const i=e.map(n=>n.trim()).filter(Boolean);if(i.length===0)return null;const s=i.map((n,a)=>({transcript:n,value:t(n),index:a})).filter(n=>n.value!==null);return s.length===0||i.slice(0,s[0].index).some(Re)||new Set(s.map(({value:n})=>n)).size!==1?null:{transcript:s[0].transcript,value:s[0].value}}function F(e,t){return new Set([e,...t??[]].map(S).filter(Boolean))}function ke(e,t,i){const s=e.replace(/^(?:(?:i\s+)?(?:choose|select|pick)|(?:my\s+)?answer(?:\s+is)?)\s+/,"").trim(),n=F(t.lowAnchor,t.voiceLowAliases).has(s),a=F(t.highAnchor,t.voiceHighAliases).has(s);if(!(!n&&!a))return n&&a?null:n?i[0]:i.at(-1)??null}function xe(e,t,i){if(!t.responseLabels)return;const s=e.replace(/^(?:(?:i\s+)?(?:choose|select|pick)|(?:my\s+)?answer(?:\s+is)?)\s+/,"").trim(),n=i.filter(a=>Ce(t.responseLabels?.[String(a)]??"",s));if(n.length!==0)return n.length===1?n[0]:null}function Ae(e,t){const i=e.split(" ").filter(Boolean),s=[];for(const n of i)if(/^(?:100|[0-9]{1,2})$/.test(n)){const a=Number(n);s.push(t.includes(a)?a:null)}else if($.has(n)){const a=$.get(n);s.push(t.includes(a)?a:null)}for(let n=0;n<i.length;){if(!B.has(i[n])){n+=1;continue}const a=[];for(;n<i.length&&B.has(i[n]);)a.push(i[n]),n+=1;const u=a.length===1&&x.has(a[0])?Number(x.get(a[0])):E.get(a.join(" "));s.push(u!==void 0&&t.includes(u)?u:null)}return s}function U(e){return e?.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")}function z(e,t){return e.find(i=>i.position===t)?.value}function Ie(e,t,i){const s=/\b(middle|midpoint|centre|center)\b/.test(e),n=U(t.voiceLowAliases),a=U(t.voiceHighAliases);if(!n||!a||i.length!==5)return;const u=`(?:${n})`,h=`(?:${a})`,p=new RegExp(`\\bclose(?:r)?\\s+(?:to|too)\\s+${u}\\b`).test(e),g=new RegExp(`\\bclose(?:r)?\\s+(?:to|too)\\s+${h}\\b`).test(e),f=t.voiceLowAliases?.includes("low")===!0&&e==="hello",m=new RegExp(`\\b${u}\\b`).test(e)||f,b=new RegExp(`\\b${h}\\b`).test(e);if(p||g)return[s,p,g].filter(Boolean).length!==1||p&&b||g&&m?null:p?z(i,"closer-low")??null:z(i,"closer-high")??null;if([s,m,b].some(Boolean))return[s,m,b].filter(Boolean).length!==1?null:s?z(i,"middle")??null:m?z(i,"low")??null:z(i,"high")??null}function Pe(e,t,i=W,s=K){const n=S(e);if(!n)return null;const a=xe(n,t,i);if(a!==void 0)return a;const u=ke(n,t,i);if(u!==void 0)return u;if(T.test(n))return null;const h=Ae(n,i),p=Ie(n,t,s);return h.length>0?h.length!==1||h[0]===null||p===null||p!==void 0&&p!==h[0]?null:h[0]:p??null}function Ee(e,t){const i=S(e);if(!i||T.test(i))return null;const s=t.map(n=>{const a=typeof n=="string"?n:n.id;return(typeof n=="string"?Se[a]??[a.replace(/[-_]/g," ")]:[n.name.toLowerCase(),a.replace(/[-_]/g," ")]).some(h=>i===h||i.includes(h))?a:null}).filter(n=>!!n);return s.length===1?s[0]:null}function Te(e,t,i=W,s=K){return Z(e,n=>Pe(n,t,i,s))}function Le(e,t){return Z(e,i=>Ee(i,t))}const A="3.5.3",Me=`https://cdn.jsdelivr.net/npm/webgazer@${A}/dist/webgazer.js`,Ge=`https://cdn.jsdelivr.net/npm/webgazer@${A}/dist/mediapipe/face_mesh`,qe="sha384-N9TfYQEjUGiaDcITkzB/MtVHEfF2JtTWCwHG8NUhjOSvJ8zObGwfebHUFLBS+4Rb";let R=null;function H(e){return e.protocol==="https:"||e.hostname==="localhost"||e.hostname==="127.0.0.1"}function Oe(e=document){return window.webgazer?Promise.resolve(window.webgazer):R||(R=new Promise((t,i)=>{const s=e.querySelector("#webgazer-loader"),n=s??e.createElement("script"),a=()=>{window.webgazer?t(window.webgazer):i(new Error("WebGazer loaded without exposing its browser API."))};n.addEventListener("load",a,{once:!0}),n.addEventListener("error",()=>{n.remove(),i(new Error("WebGazer could not be downloaded. Check the connection and content-blocking settings."))},{once:!0}),s||(n.id="webgazer-loader",n.src=Me,n.integrity=qe,n.crossOrigin="anonymous",n.referrerPolicy="no-referrer",e.head.append(n))}).catch(t=>{throw R=null,t}),R)}class j{constructor(t){this.durationMs=t,this.key=null,this.startedAt=0}update(t,i){if(!t)return this.reset(),{progress:0,activated:!1};if(t!==this.key)return this.key=t,this.startedAt=i,{progress:0,activated:!1};const s=Math.min(1,Math.max(0,(i-this.startedAt)/this.durationMs));return s>=1?(this.reset(),{progress:1,activated:!0}):{progress:s,activated:!1}}reset(){this.key=null,this.startedAt=0}}var Be=Object.defineProperty,Ve=Object.getOwnPropertyDescriptor,d=(e,t,i,s)=>{for(var n=s>1?void 0:s?Ve(t,i):t,a=e.length-1,u;a>=0;a--)(u=e[a])&&(n=(s?u(t,i,n):u(n))||n);return s&&n&&Be(t,i,n),n};const De={ar:"ar-SA",de:"de-DE",en:"en-GB",es:"es-ES",fr:"fr-FR",hi:"hi-IN",it:"it-IT",ja:"ja-JP",ko:"ko-KR",nl:"nl-NL",pl:"pl-PL",pt:"pt-PT",ru:"ru-RU",sv:"sv-SE",tr:"tr-TR",zh:"zh-CN"};function Q(e){const t=e.trim();if(!t)return"en-GB";const i=t.toLocaleLowerCase().split("-")[0];return t.includes("-")?t:De[i]??t}function Ne(e){return e.trim().toLocaleLowerCase().split("-")[0]==="en"}const k=[{x:12,y:12},{x:50,y:12},{x:88,y:12},{x:12,y:50},{x:50,y:50},{x:88,y:50},{x:12,y:88},{x:50,y:88},{x:88,y:88}],w=3;function P(e){const t=Y(e);for(let i=t.length-1;i>0;i-=1){const s=Math.floor(Math.random()*(i+1));[t[i],t[s]]=[t[s],t[i]]}return t}let o=class extends X{constructor(){super(...arguments),this.stage="intro",this.ratingIndex=0,this.pairIndex=0,this.pairOrder=P(ee(I)),this.pairResponses={},this.ratings={},this.ratingInputRoutes={},this.pairInputRoutes={},this.supportChanges=[],this.answerMode="standard",this.showSimpleLanguage=!1,this.largeText=!1,this.recoveryEnabled=!1,this.resumeSummaryVisible=!1,this.savedSession=null,this.recoveredCompletedRecord=null,this.readingAloud=!1,this.readAloudUsed=!1,this.audioGuidance=!1,this.audioStatusMessage="",this.interruptionSummaryShown=!1,this.voiceState="idle",this.voiceMessage="",this.pendingVoiceAnswer=null,this.errorMessage="",this.statusMessage="",this.result=null,this.gazeState="off",this.gazeMessage="",this.gazeCalibrationIndex=0,this.gazeCalibrationRepetition=0,this.gazePendingLabel="",this.gazeDwellProgress=0,this.gazeUsed=!1,this.gazeActionCount=0,this.studyConfig=null,this.configurationError="",this.participantCode="",this.participantCodeError="",this.participantCodeRestoredForTab=!1,this.startedAt="",this.submittedRecord=null,this.completionSavedLocally=!1,this.completionSavedByHost=!1,this.remoteRecordingUnconfirmed=!1,this.hostSubmissionFailed=!1,this.submittingResult=!1,this.hostBridgeState="not-required",this.hostBridgeMessage="",this.hiddenAt=null,this.recognition=null,this.webgazer=null,this.gazeCandidateElement=null,this.gazePendingElement=null,this.gazeActivationInProgress=!1,this.speechRequestId=0,this.savedSessionAnnouncementKey="",this.configurationApplied=!1,this.installedResultSink=null,this.gazeCandidateTracker=new j(1e3),this.gazeConfirmationTracker=new j(1200),this.repeatSavedSessionOffer=()=>{this.savedSession&&(this.readAloudUsed=!0,this.speakText(this.savedSessionOfferSpeech(this.savedSession)))},this.setParticipantCode=e=>{this.participantCode=e.currentTarget.value.trim(),this.participantCodeRestoredForTab=!1,this.participantCodeError=this.participantCode&&!v(this.participantCode)?"Use 1–32 letters, numbers, hyphens or underscores, starting with a letter or number.":"",this.savedSession=null,this.recoveredCompletedRecord=null,v(this.participantCode)?(this.rememberParticipantCodeForTab(),this.findSavedSession(),this.findCompletedBackup()):this.forgetParticipantCodeForTab()},this.setAudioGuidance=e=>{const t=e.currentTarget.checked;this.recordSupportChange("automatic-audio",this.audioGuidance,t),this.audioGuidance=t,this.invalidatePendingSubmission(),this.audioGuidance?this.speakText("Built-in audio guidance is on. New questions, selected answers, voice proposals, simpler help, recovery summaries, errors and completion feedback will be spoken while this page remains open."):this.stopReading(),this.persistProgress()},this.startQuestionnaire=()=>{if(this.configurationError){this.showError(this.configurationError);return}if(this.studyConfig?.collection.mode==="qualtrics"&&this.hostBridgeState!=="connected"){this.showError(this.hostBridgeMessage||"The secure Qualtrics result connection is not ready. Do not start this questionnaire.");return}if(this.studyConfig&&(this.participantCode=this.participantCode.trim(),!v(this.participantCode))){this.participantCodeError="Enter the valid pseudonymous participant code supplied by the study conductor.",this.showError(this.participantCodeError);return}this.startedAt=new Date().toISOString(),this.stage="ratings",this.ratingIndex=0,this.clearError(),this.persistProgress(),this.focusHeading()},this.goBack=()=>{this.stopReading(),this.clearVoiceAnswer(),this.stage==="ratings"&&this.ratingIndex>0?this.ratingIndex-=1:this.stage==="pairs"&&(this.pairIndex>0?this.pairIndex-=1:(this.stage="ratings",this.ratingIndex=this.dimensions.length-1)),this.clearError(),this.persistProgress(),this.focusHeading()},this.returnToRatings=()=>{this.stage="ratings",this.ratingIndex=this.dimensions.length-1,this.persistProgress(),this.focusHeading()},this.returnToPairs=()=>{this.stage="pairs",this.pairIndex=this.pairOrder.length-1,this.persistProgress(),this.focusHeading()},this.submitResponses=async()=>{if(!this.submittingResult)try{(!this.result||!this.submittedRecord)&&(this.result=te(this.definition,this.ratings,this.pairResponses),this.submittedRecord=ie({config:this.effectiveStudyConfig(),participantCode:this.studyConfig?this.participantCode:"DEMO",startedAt:this.startedAt||new Date().toISOString(),pairPresentationOrder:this.pairOrder.map(({id:t})=>t),pairwiseChoices:this.pairResponses,result:this.result,supportMetadata:this.currentSupportMetadata()}));const e=this.studyConfig?fe():null;if(this.completionSavedLocally=this.studyConfig?se(this.submittedRecord):!1,this.completionSavedByHost=!1,this.remoteRecordingUnconfirmed=!1,this.hostSubmissionFailed=!1,e){this.submittingResult=!0,this.statusMessage=`Submitting responses to ${e.name}.`;try{await we(this.submittedRecord,e),this.completionSavedByHost=!0}catch(t){this.hostSubmissionFailed=!0;const i=t instanceof Error?t.message:"The study platform did not accept the response.";this.showError(`${i} Your answers remain on this page. Retry submission, return to an answer, or use a backup button below.`);return}finally{this.submittingResult=!1}}this.dispatchEvent(new CustomEvent("questionnaire-complete",{detail:this.submittedRecord,bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("nasa-tlx-complete",{detail:this.submittedRecord,bubbles:!0,composed:!0})),this.stage="complete",(!this.studyConfig||this.completionSavedLocally)&&this.clearSavedProgress(),this.stopGazeInputInternal(!1),this.clearError(),this.completionSavedByHost||this.focusHeading()}catch(e){this.submittingResult=!1,this.showError(e instanceof Error?e.message:"Responses could not be calculated.")}},this.downloadResultJson=()=>{this.submittedRecord&&this.downloadRecordJson(this.submittedRecord)},this.downloadResultCsv=()=>{this.submittedRecord&&this.downloadRecordCsv(this.submittedRecord)},this.restart=()=>{this.stopReading(!1),this.stopGazeInputInternal(!1),this.releaseRecognition(),this.clearSavedProgress(),this.forgetParticipantCodeForTab(),this.stage="intro",this.ratingIndex=0,this.pairIndex=0,this.pairOrder=P(this.definition),this.pairResponses={},this.ratings={},this.ratingInputRoutes={},this.pairInputRoutes={},this.supportChanges=[],this.resumeSummaryVisible=!1,this.savedSession=null,this.recoveredCompletedRecord=null,this.result=null,this.submittedRecord=null,this.completionSavedLocally=!1,this.completionSavedByHost=!1,this.remoteRecordingUnconfirmed=!1,this.hostSubmissionFailed=!1,this.submittingResult=!1,this.startedAt="",this.participantCodeError="",this.participantCodeRestoredForTab=!1,this.studyConfig&&(this.participantCode=""),this.errorMessage="",this.voiceState="idle",this.pendingVoiceAnswer=null,this.audioGuidance=!1,this.audioStatusMessage="",this.gazeUsed=!1,this.gazeActionCount=0,this.applyConfiguredSupport(),this.statusMessage="A new questionnaire has started.",window.scrollTo({top:0,behavior:"smooth"})},this.toggleReadAloud=()=>{if(this.readingAloud){this.stopReading(!0);return}this.speakText(this.currentStepSpeech())},this.startGazeInput=async()=>{if(!H(window.location)){this.gazeState="error",this.gazeMessage="Gaze input requires an HTTPS-hosted page or localhost.",this.announceAutomatic(this.gazeMessage);return}this.gazeState="loading",this.gazeMessage="Loading the pinned WebGazer library. Webcam permission will be requested next.";try{const e=await Oe();if(!e.detectCompatibility())throw new Error("This browser does not expose a compatible webcam API.");this.webgazer=e,e.params.faceMeshSolutionPath=Ge,e.saveDataAcrossSessions(!1),await e.clearData(),e.showVideoPreview(!0),e.showFaceOverlay(!0),e.showFaceFeedbackBox(!0),e.showPredictionPoints(!1),e.setGazeListener(t=>this.handleGazePoint(t)),await e.begin(),e.removeMouseEventListeners(),await this.showGazePositioningStep("Camera started. Position your face, then continue to calibration.")}catch(e){this.gazeState="error",this.gazeMessage=e instanceof Error?`Gaze setup did not start: ${e.message}`:"Gaze setup did not start. Use another answer route.",this.announceAutomatic(this.gazeMessage),this.releaseGazeResources()}},this.restartGazeCalibration=async()=>{this.webgazer&&(this.cancelGazeProposal(),await this.webgazer.clearData(),await this.showGazePositioningStep("Recalibration started. Check your position before continuing."))},this.beginGazeCalibration=()=>{this.webgazer&&(this.restoreWebGazerPreviewContainer(),this.webgazer.showVideoPreview(!1),this.webgazer.showFaceOverlay(!1),this.webgazer.showFaceFeedbackBox(!1),this.webgazer.showPredictionPoints(!1),this.gazeCalibrationIndex=0,this.gazeCalibrationRepetition=0,this.gazeState="calibrating",this.gazeMessage="Camera preview hidden. Complete all 27 calibration samples.",this.announceAutomatic(this.gazeMessage),this.updateComplete.then(()=>this.querySelector(".calibration-point")?.focus()))},this.recordCalibrationPoint=e=>{if(!this.webgazer||this.gazeState!=="calibrating")return;const t=e.currentTarget.getBoundingClientRect();if(this.webgazer.recordScreenPosition(t.left+t.width/2,t.top+t.height/2,"click"),this.gazeCalibrationRepetition<w-1){this.gazeCalibrationRepetition+=1;return}if(this.gazeCalibrationIndex<k.length-1){this.gazeCalibrationIndex+=1,this.gazeCalibrationRepetition=0;return}this.gazeCalibrationRepetition=w,this.gazeState="ready",this.gazeUsed=!0,this.gazeMessage="Calibration complete. A red gaze dot is visible. Look at a large answer or navigation control for one second.",this.webgazer.showVideoPreview(!1),this.webgazer.showFaceOverlay(!1),this.webgazer.showFaceFeedbackBox(!1),this.webgazer.showPredictionPoints(!0),this.statusMessage="Gaze-assisted answering is ready.",this.announceAutomatic(this.statusMessage)},this.confirmGazeProposal=()=>{const e=this.gazePendingElement;if(!e)return;const t=this.gazePendingLabel;this.gazePendingElement=null,this.gazePendingLabel="",this.gazeDwellProgress=0,this.gazeConfirmationTracker.reset(),this.gazeActivationInProgress=!0;try{e.click(),this.gazeActionCount+=1,this.gazeUsed=!0,this.statusMessage=`${t} activated by confirmed gaze.`}finally{this.gazeActivationInProgress=!1}},this.cancelGazeProposal=()=>{this.gazePendingElement=null,this.gazePendingLabel="",this.gazeDwellProgress=0,this.gazeConfirmationTracker.reset(),this.statusMessage="Gaze proposal cancelled."},this.stopGazeInput=()=>{this.stopGazeInputInternal(!0)},this.confirmVoiceAnswer=()=>{const e=this.pendingVoiceAnswer;if(!e)return;let t="";if(e.context==="rating"){const i=this.dimensions[this.ratingIndex],s=e.value;this.selectRating(i.id,s,"voice"),t=this.answerMode==="smiley"&&this.smileyLandmarks.some(a=>a.value===s)?`smiley-${i.id}-${s}`:`rating-${i.id}-${s}`}else{const i=this.pairOrder[this.pairIndex],s=e.value;this.selectPair(i.id,s,"voice"),t=`${i.id}-${s}`}this.voiceState="idle",this.voiceMessage="",this.pendingVoiceAnswer=null,this.updateComplete.then(()=>this.querySelector(`#${t}`)?.focus())},this.clearVoiceAnswer=()=>{this.releaseRecognition(),this.voiceState="idle",this.voiceMessage="",this.pendingVoiceAnswer=null},this.handleVisibilityChange=()=>{if(document.hidden){this.hiddenAt=Date.now();return}this.hiddenAt&&this.recoveryEnabled&&this.isInProgress()&&(this.resumeSummaryVisible=!0,this.interruptionSummaryShown=!0,this.statusMessage="Welcome back. A summary of your saved position is available.",this.updateComplete.then(()=>{this.querySelector("#resume-heading")?.focus(),this.announceAutomatic(this.resumeSummarySpeech())})),this.hiddenAt=null},this.dismissResumeSummary=()=>{this.resumeSummaryVisible=!1,this.statusMessage=`Continuing at ${this.currentPositionDescription()}.`,this.focusHeading()},this.restoreSavedSession=()=>{const e=this.savedSession;e&&(this.stage=e.stage,this.ratingIndex=e.ratingIndex,this.pairIndex=e.pairIndex,this.pairOrder=e.pairOrder,this.pairResponses=e.pairResponses,this.ratings=e.ratings,this.ratingInputRoutes=e.ratingInputRoutes,this.pairInputRoutes=e.pairInputRoutes,this.supportChanges=e.supportChanges,this.startedAt=e.startedAt,this.canAdjustAllSupport?(this.answerMode=e.support.answerMode,this.showSimpleLanguage=e.support.showSimpleLanguage,this.largeText=e.support.largeText,this.audioGuidance=!!e.support.audioGuidance):(this.applyConfiguredSupport(),this.canAdjustPresentationSupport&&(this.largeText=e.support.largeText,this.audioGuidance=!!e.support.audioGuidance)),this.recoveryEnabled=!0,this.savedSession=null,this.savedSessionAnnouncementKey="",this.resumeSummaryVisible=!0,this.interruptionSummaryShown=!0,this.updateComplete.then(()=>{this.querySelector("#resume-heading")?.focus(),this.announceAutomatic(this.resumeSummarySpeech())}))},this.eraseSavedSession=()=>{this.clearSavedProgress(),this.savedSession=null,this.savedSessionAnnouncementKey="",this.statusMessage="Saved answers erased."}}connectedCallback(){super.connectedCallback(),this.loadStudyConfiguration(),document.addEventListener("visibilitychange",this.handleVisibilityChange),queueMicrotask(()=>{this.restoreParticipantCodeForTab(),this.findSavedSession(),this.findCompletedBackup(),this.participantCodeRestoredForTab&&!this.savedSession&&this.recoveredCompletedRecord&&this.updateComplete.then(()=>{const e=this.querySelector("#completed-backup-heading");e&&C(e,{block:"start",onReveal:()=>this.requestParentReveal(e)})})})}disconnectedCallback(){document.removeEventListener("visibilitychange",this.handleVisibilityChange),this.installedResultSink?.bridge.disconnect(),this.installedResultSink=null,this.stopReading(!1),this.releaseRecognition(),this.stopGazeInputInternal(!1),super.disconnectedCallback()}createRenderRoot(){return this}loadStudyConfiguration(){if(this.configurationApplied)return;this.configurationApplied=!0;const e=new URLSearchParams(window.location.hash.startsWith("#")?window.location.hash.slice(1):window.location.hash),t=ne(window.location.hash);if(e.has("study")&&!t){this.configurationError="This participant link contains an invalid or incompatible study configuration. Ask the study conductor for a new link.";return}if(t&&(this.studyConfig=t,this.pairOrder=P(this.definition),this.applyConfiguredSupport(),t.collection.mode==="qualtrics")){if(window.parent===window){this.configurationError="This centrally collected questionnaire must be opened from the approved Qualtrics survey link. Ask the study conductor for that link.";return}if(document.referrer)try{if(new URL(document.referrer).origin!==t.collection.parentOrigin){this.configurationError="This questionnaire was embedded by an unexpected website. Ask the study conductor for the approved Qualtrics survey link.";return}}catch{this.configurationError="The embedding website could not be verified. Ask the study conductor for the approved Qualtrics survey link.";return}this.hostBridgeState="connecting",this.installedResultSink=be(t,window,({state:i,message:s})=>{this.hostBridgeState=i,this.hostBridgeMessage=s},i=>{this.remoteRecordingUnconfirmed=!0,this.statusMessage=i,this.announceAutomatic(this.currentStepSpeech()),this.updateComplete.then(()=>{const s=this.querySelector("#remote-recording-error");s&&C(s,{block:"start",onReveal:()=>this.requestParentReveal(s)})})})}}applyConfiguredSupport(){const e=this.studyConfig?.support;e&&(this.showSimpleLanguage=e.showSimpleLanguage,this.answerMode=e.answerMode,this.largeText=e.largeText,this.audioGuidance=e.audioGuidance,this.recoveryEnabled=e.recoveryEnabled)}get definition(){const e=this.studyConfig?.instrumentId??I;return ae(e,this.studyConfig?.questionnaireDefinition)}get dimensions(){return this.definition.items}get pairs(){return Y(this.definition)}get ratingValues(){return re(this.definition)}get smileyLandmarks(){return this.definition.landmarks??[]}get isResearcherSuppliedDefinition(){return!!this.studyConfig?.questionnaireDefinition}get dimensionById(){return new Map(this.dimensions.map(e=>[e.id,e]))}get canAdjustAllSupport(){return!this.studyConfig||this.studyConfig.support.participantAdjustmentPolicy==="participant-choice"}get canAdjustPresentationSupport(){return!this.studyConfig||this.studyConfig.support.participantAdjustmentPolicy==="presentation-only"||this.studyConfig.support.participantAdjustmentPolicy==="participant-choice"}get voiceInputAvailable(){return!this.studyConfig||this.studyConfig.support.voiceInputAvailable}get gazeInputAvailable(){return!this.studyConfig||this.studyConfig.support.gazeInputAvailable}render(){return r`
      <a class="skip-link" href="#question-panel">Skip to the current question</a>
      <main class=${`app-shell${this.largeText?" large-text":""}`} id="main-content">
        <p class="sr-only" aria-live="polite" aria-atomic="true">${this.statusMessage}</p>
        <header class="app-header">
          <p class="eyebrow">Accessible questionnaire platform · Version ${L}</p>
          <h1 lang=${this.definition.language} dir="auto">${this.definition.name}</h1>
          <p class="subtitle" lang=${this.definition.language} dir="auto">${this.definition.description}</p>
        </header>

        ${this.resumeSummaryVisible?this.renderResumeSummary():l}
        ${this.stage!=="intro"&&this.stage!=="complete"?this.renderProgress():l}
        ${this.stage!=="intro"&&this.stage!=="complete"?this.renderInQuestionSupport():l}
        ${this.gazePendingElement?this.renderGazeConfirmation():l}
        ${this.errorMessage?r`<div class="error-summary" role="alert" tabindex="-1" id="error-summary">
              <h2>There is a problem</h2>
              <p>${this.errorMessage}</p>
            </div>`:l}

        ${this.renderStage()}
      </main>
      ${this.gazeState==="positioning"?this.renderGazePositioning():l}
      ${this.gazeState==="calibrating"?this.renderGazeCalibration():l}
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
    `}renderStage(){switch(this.stage){case"intro":return this.renderIntro();case"ratings":return this.renderRating();case"pairs":return this.renderPair();case"review":return this.renderReview();case"complete":return this.renderComplete()}}renderIntro(){const e=this.definition.id===I?"Start the six ratings":`Start the ${this.dimensions.length} items`;return r`
      <section class="panel" id="question-panel" aria-labelledby="intro-heading">
        <h2 id="intro-heading">Before you begin</h2>
        ${this.configurationError?r`<div class="error-summary" role="alert"><h3>Study link problem</h3><p>${this.configurationError}</p></div>`:l}
        ${this.studyConfig?.collection.mode==="qualtrics"&&this.hostBridgeState!=="connected"?r`<div
              class=${this.hostBridgeState==="failed"?"error-summary":"study-context"}
              role=${this.hostBridgeState==="failed"?"alert":"status"}
            >
              <h3>${this.hostBridgeState==="failed"?"Qualtrics connection problem":"Checking secure result collection"}</h3>
              <p>${this.hostBridgeMessage}</p>
              <p>The questionnaire cannot start until the matching collection bridge is connected.</p>
            </div>`:l}
        ${this.renderStudyContext()}
        ${this.savedSession?this.renderSavedSessionOffer():l}
        ${this.recoveredCompletedRecord?this.renderCompletedBackupOffer():l}
        <p>${this.definition.introPrompt}</p>
        ${this.studyConfig?r`<p>Study task: <strong>${this.studyConfig.taskLabel}</strong></p>`:l}
        <ol class="process-overview">
          <li>
            First, answer ${this.dimensions.length} items using values from
            ${this.definition.scale.minimum} to ${this.definition.scale.maximum}.
          </li>
          ${this.pairs.length?r`<li>Then, make ${this.pairs.length} pairwise comparisons.</li>`:l}
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

        ${this.studyConfig?this.renderConfiguredSupportSummary():l}
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
              </details>`:l:r`<details class="support-toolbar participant-support-setup">
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
            </p>`:l}
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
    `:l}renderSupportSettings(e,t){const i=`support-${e}`;return r`
      <fieldset class="support-settings">
        <legend>${t==="all"?"Accessibility support options":"Display and recovery preferences"}</legend>

        ${t==="all"&&this.definition.supports.simplerExplanations?r`<label class="toggle-card" for=${`${i}-simple`}>
            <input
              id=${`${i}-simple`}
              type="checkbox"
              .checked=${this.showSimpleLanguage}
              @change=${s=>this.setSimpleLanguage(s)}
            />
            <span>
              <strong>Show simpler explanations</strong>
              <small>
                ${this.isResearcherSuppliedDefinition?"The questionnaire item remains visible once, without being duplicated inside the help.":"The official item remains visible once, without being duplicated inside the help."}
              </small>
            </span>
          </label>`:l}

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
              ${this.answerMode==="standard"?r`<span class="selected-marker" aria-hidden="true">✓ Selected</span>`:l}
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
              ${this.answerMode==="smiley"?r`<span class="selected-marker" aria-hidden="true">✓ Selected</span>`:l}
            </label>
          </fieldset>`:l}

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
            @change=${s=>this.setRecovery(s)}
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
        ${this.audioStatusMessage?r`<p class="audio-status" role="status" aria-atomic="true">${this.audioStatusMessage}</p>`:l}
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
        ${this.audioStatusMessage?r`<p class="audio-status" role="status" aria-atomic="true">${this.audioStatusMessage}</p>`:l}
        <small>
          ${e?"Uses the browser speech-synthesis voice; no audio is recorded.":"Built-in audio is unavailable in this browser. External screen readers can still read the result."}
        </small>
      </div>
    `}renderGazeSetup(){if(!this.gazeInputAvailable)return l;const e=H(window.location),t=this.gazeState==="loading"||this.gazeState==="positioning"||this.gazeState==="calibrating"||this.gazeState==="ready";return r`
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
            <li>WebGazer ${A} is loaded only after you start this feature; its code and face model come from jsDelivr.</li>
            <li>The camera preview is shown only while you position your face. It is hidden before calibration and answering.</li>
            <li>Webcam gaze estimation can be inaccurate and needs recalibration. Standard, keyboard and voice controls remain available.</li>
          </ul>
          ${e?l:r`<p class="gaze-warning" role="status">
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
                </button>`:l}
          </div>
          ${this.gazeMessage?r`<p class="gaze-status" role="status">${this.gazeMessage}</p>`:l}
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
    `}renderGazeCalibration(){const e=k[this.gazeCalibrationIndex],t=this.gazeCalibrationIndex*w+this.gazeCalibrationRepetition,i=k.length*w;return r`
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
            aria-label=${`Calibration point ${this.gazeCalibrationIndex+1} of ${k.length}, sample ${this.gazeCalibrationRepetition+1} of ${w}`}
            @click=${this.recordCalibrationPoint}
          >
            ${this.gazeCalibrationIndex+1}
            <span>${this.gazeCalibrationRepetition+1}/${w}</span>
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
            </details>`:l}

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
          ${this.ratingValues.map(i=>{const s=`rating-${e.id}-${i}`,n=this.ratingOptionLabel(e,i);return r`
              <label
                class="rating-option"
                for=${s}
                data-gaze-target
                data-gaze-label=${n}
              >
                <input
                  id=${s}
                  type="radio"
                  name=${`rating-${e.id}`}
                  value=${i}
                  .checked=${t===i}
                  aria-label=${n}
                  @change=${()=>this.selectRating(e.id,i,"standard-scale")}
                />
                <span class="rating-option-content">
                  <strong>${i}</strong>
                  ${e.responseLabels?.[String(i)]&&e.responseLabels[String(i)]!==String(i)?r`<small lang=${this.definition.language} dir="auto">${e.responseLabels[String(i)]}</small>`:l}
                </span>
                ${t===i?r`<span class="selected-marker selected-check" aria-hidden="true">✓</span>`:l}
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
          ${this.smileyLandmarks.map(({value:i,cue:s})=>{const n=`smiley-${e.id}-${i}`;return r`
              <label
                class="smiley-option"
                for=${n}
                data-gaze-target
                data-gaze-label=${`${i} for ${e.name}`}
              >
                <input
                  id=${n}
                  type="radio"
                  name=${`smiley-${e.id}`}
                  value=${i}
                  .checked=${t===i}
                  aria-label=${`${i}, ${this.landmarkLabel(e,i)}, for ${e.name}`}
                  aria-describedby=${`smiley-help-${e.id}`}
                  @change=${()=>this.selectRating(e.id,i,"smiley-landmark")}
                />
                <span class="smiley-option-content">
                  <span class="smiley-face" aria-hidden="true">${s}</span>
                  <strong>${i}</strong>
                  <small>${this.landmarkLabel(e,i)}</small>
                  ${t===i?r`<span class="selected-marker" aria-hidden="true">✓ Selected</span>`:l}
                </span>
              </label>
            `})}
        </div>
      </fieldset>
    `}renderPair(){const e=this.pairOrder[this.pairIndex],t=this.dimensionById.get(e.left),i=this.dimensionById.get(e.right),s=this.pairResponses[e.id];return r`
      <section class="panel" id="question-panel" aria-labelledby="pair-heading">
        <p class="step-label">Comparison ${this.pairIndex+1} of ${this.pairOrder.length}</p>
        <h2 id="pair-heading">${this.definition.pairwise.prompt}</h2>
        <p class="pair-instruction">
          ${this.definition.pairwise.instruction}
        </p>

        ${this.renderPairHelp(t,i)}
        <fieldset class="choice-fieldset">
          <legend>Choose one factor</legend>
          ${this.renderPairChoice(e.id,t,s===t.id)}
          ${this.renderPairChoice(e.id,i,s===i.id)}
        </fieldset>

        ${this.renderVoiceInput("pair",t,i)}
        ${this.renderNavigation(!0,"pair")}
      </section>
    `}renderPairChoice(e,t,i){const s=`${e}-${t.id}`;return r`
      <label
        class="choice-card"
        for=${s}
        data-gaze-target
        data-gaze-label=${t.name}
      >
        <input
          id=${s}
          type="radio"
          name=${e}
          value=${t.id}
          .checked=${i}
          @change=${()=>this.selectPair(e,t.id,"standard-choice")}
        />
        <span>
          <strong>${t.name}</strong>
          ${this.showSimpleLanguage?r`<small>${t.shortMeaning}</small>`:l}
        </span>
        ${i?r`<span class="selected-marker" aria-hidden="true">✓ Selected</span>`:l}
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
    `}renderVoiceInput(e,t,i){if(!this.voiceInputAvailable)return l;const s=!!(window.SpeechRecognition??window.webkitSpeechRecognition),n=this.pendingVoiceAnswer?.context===e,a=e==="rating"?this.ratingVoicePrompt(t):`Say “${t.name}” or “${i.name}”.`,u=Q(this.definition.language),h=e==="rating"&&!Ne(u);return r`
      <details class="voice-input" .open=${this.voiceState!=="idle"}>
        <summary>Answer this question by voice</summary>
        <div class="voice-input-content">
          <p>${a}</p>
          <p class="support-boundary">
            Voice is optional. The main button requests the questionnaire language
            (<code>${u}</code>). Say one complete visible answer label or a shown
            number in that language; partial or similar phrases are not guessed. Browser and operating-system
            language support varies. This prototype does not store audio, and the visible answer buttons remain
            available.
          </p>
          <div class="button-row compact">
            <button
              class="secondary-button large-answer-button"
              type="button"
              data-voice-questionnaire-language
              ?disabled=${!s||this.voiceState==="listening"}
              @click=${()=>this.startVoiceInput(e,t,i,"questionnaire")}
            >
              ${this.voiceState==="listening"?"Listening…":`Start voice input (${u})`}
            </button>
            ${h?r`<button
                  class="secondary-button large-answer-button"
                  type="button"
                  data-voice-english-number
                  ?disabled=${!s||this.voiceState==="listening"}
                  @click=${()=>this.startVoiceInput(e,t,i,"english-number")}
                >
                  Speak a shown number in English
                </button>`:l}
          </div>
          ${h?r`<p class="support-boundary">
                If this browser cannot recognise <code>${u}</code>, the English-number
                button preserves a predictable voice route. It accepts only a number shown on this question.
              </p>`:l}
          ${s?l:r`<p role="status">
                Built-in voice recognition is unavailable in this browser. System voice control can still activate
                the visible buttons by name.
              </p>`}
          ${this.voiceMessage?this.voiceState==="error"?r`<div
                  class="voice-feedback-error"
                  role="alert"
                  aria-live="assertive"
                  aria-atomic="true"
                  tabindex="-1"
                  data-voice-error
                >
                  <strong>Voice answer not accepted.</strong>
                  <span>${this.voiceMessage}</span>
                </div>`:r`<p role="status" aria-live="polite" aria-atomic="true">${this.voiceMessage}</p>`:l}
          ${n&&this.pendingVoiceAnswer?r`
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
              `:l}
        </div>
      </details>
    `}renderNavigation(e,t){const i=t==="rating"&&this.ratingIndex===this.dimensions.length-1,s=t==="pair"&&this.pairIndex===this.pairOrder.length-1,n=i?this.pairOrder.length?"Continue to comparisons":"Review responses":s?"Review responses":"Next question";return r`
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
          data-gaze-label=${n}
          @click=${()=>this.goNext(t)}
        >
          ${n}
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
            `:l}

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
                ${this.pairOrder.map(e=>{const t=this.dimensionById.get(e.left),i=this.dimensionById.get(e.right),s=this.dimensionById.get(this.pairResponses[e.id]);return r`<li>${t.name} or ${i.name}: <strong>${s.name}</strong></li>`})}
              </ol>`:l}

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
              </button>`:l}
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
    `}renderComplete(){if(!this.result||!this.submittedRecord)return l;const e=!this.studyConfig||this.studyConfig.showScoreToParticipant;return r`
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
                ${this.completionSavedLocally?l:r`<p>
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
        ${!this.studyConfig||!this.completionSavedByHost||this.remoteRecordingUnconfirmed?this.renderCompletionReadAloudControl():l}
        ${this.studyConfig?l:r`<details>
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
              ${this.studyConfig?l:r`<button class="secondary-button large-answer-button" type="button" @click=${this.restart}>Start again</button>`}
            </div>`}
        ${this.studyConfig?this.completionSavedByHost&&!this.remoteRecordingUnconfirmed?l:r`<p>
              <strong>Participant:</strong>
              ${this.remoteRecordingUnconfirmed?"reconnect to the internet and use the restored Qualtrics Next button. Keep or download a backup until the recorded result page appears.":"please return the device or completion notice to the study conductor."}
            </p>`:l}
      </section>
    `}announceSavedSessionOffer(e){const t=`${e.configId}:${e.participantCode}:${e.savedAt}`;if(this.savedSessionAnnouncementKey===t)return;this.savedSessionAnnouncementKey=t;const i=this.savedSessionOfferSpeech(e);this.statusMessage="",this.updateComplete.then(()=>{const s=this.savedSession;if(!s||s.savedAt!==e.savedAt||s.configId!==e.configId||s.participantCode!==e.participantCode)return;const n=this.querySelector("#saved-session-offer");n&&C(n,{block:"center",forceCoordinateScroll:!0,onReveal:()=>this.requestParentReveal(n)}),window.setTimeout(()=>{const a=this.savedSession;!this.isConnected||!a||a.savedAt!==e.savedAt||a.configId!==e.configId||a.participantCode!==e.participantCode||(this.statusMessage=i,this.audioGuidance&&this.speakText(i))},650)})}savedSessionOfferSpeech(e){return`Saved questionnaire found. ${Object.keys(e.ratings).length+Object.keys(e.pairResponses).length} of ${this.dimensions.length+this.pairs.length} responses are saved in this browser. Resume saved questionnaire. Erase saved answers.`}renderSavedSessionOffer(){if(!this.savedSession)return l;const e=Object.keys(this.savedSession.ratings).length+Object.keys(this.savedSession.pairResponses).length;return r`
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
    `:l}renderResumeSummary(){return r`
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
    `}setSimpleLanguage(e){const t=e.currentTarget.checked;this.recordSupportChange("simpler-explanations",this.showSimpleLanguage,t),this.showSimpleLanguage=t,this.invalidatePendingSubmission(),this.persistProgress(),this.announceAutomatic(t?this.currentSimpleExplanationSpeech():this.isResearcherSuppliedDefinition?"Simpler explanations are off. The questionnaire item wording remains available.":"Simpler explanations are off. The official questionnaire wording remains available.")}recordSupportChange(e,t,i){!this.studyConfig||t===i||this.stage==="complete"||(this.supportChanges=[...this.supportChanges,{setting:e,from:t,to:i,stage:this.stage,changedAt:new Date().toISOString()}])}setAnswerMode(e){e==="smiley"&&!this.definition.supports.smileyLandmarks||(this.recordSupportChange("answer-mode",this.answerMode,e),this.answerMode=e,this.invalidatePendingSubmission(),this.persistProgress(),this.announceAutomatic(e==="smiley"?"Smiley landmark answer format selected. Each rating offers five labelled values, with the full precise scale available on request.":`Standard answer format selected. Each rating uses ${this.ratingValues.length} values from ${this.definition.scale.minimum} to ${this.definition.scale.maximum} in steps of ${this.definition.scale.step}.`))}setLargeText(e){this.recordSupportChange("text-size",this.largeText?"large":"standard",e?"large":"standard"),this.largeText=e,this.invalidatePendingSubmission(),this.persistProgress(),this.announceAutomatic(`${e?"Large":"Standard"} text selected.`)}setRecovery(e){const t=e.currentTarget.checked;this.recordSupportChange("interruption-recovery",this.recoveryEnabled,t),this.recoveryEnabled=t,this.invalidatePendingSubmission(),this.recoveryEnabled?(this.rememberParticipantCodeForTab(),this.persistProgress()):(this.forgetParticipantCodeForTab(),this.clearSavedProgress()),this.announceAutomatic(t?"Interruption recovery is on. Incomplete answers will be stored in this browser.":"Interruption recovery is off. The saved in-progress copy has been removed.")}landmarkLabel(e,t){const i=this.smileyLandmarks.find(s=>s.value===t)?.position;return i==="low"?e.lowAnchor:i==="closer-low"?`Closer to ${e.lowAnchor}`:i==="middle"?"Middle":i==="closer-high"?`Closer to ${e.highAnchor}`:i==="high"?e.highAnchor:String(t)}ratingValueLabel(e,t){const i=e.responseLabels?.[String(t)];return i||(t===this.definition.scale.minimum?e.lowAnchor:t===this.definition.scale.maximum?e.highAnchor:null)}ratingOptionLabel(e,t){const i=this.ratingValueLabel(e,t);return i?`${t}, ${i}, for ${e.name}`:`${t} for ${e.name}`}ratingVoicePrompt(e){if(this.answerMode!=="smiley"){const s=`Say one shown value from ${this.definition.scale.minimum} to ${this.definition.scale.maximum} in steps of ${this.definition.scale.step}. Other numbers are not rounded or guessed.`;return this.ratingValues.flatMap(a=>{const u=e.responseLabels?.[String(a)];return u?[`${a}, ${u}`]:[]}).length>0?`${s} You may instead say one exact visible answer label.`:this.definition.scale.type==="magnitude"?s:`${s} You may instead say the exact visible endpoint label: ${e.lowAnchor} or ${e.highAnchor}.`}const t=this.smileyLandmarks.map(({value:s})=>this.landmarkLabel(e,s)),i=this.smileyLandmarks.map(({value:s})=>s);return`For the most reliable voice input, say one shown value: ${i.slice(0,-1).join(", ")}, or ${i.at(-1)}. You may instead say one visible label: ${t.slice(0,-1).join(", ")}, or ${t.at(-1)}. On a phone, use the number if a short label such as Low is not recognised.`}ratingVoiceAnswerLabel(e,t){const i=this.answerMode==="smiley"&&this.smileyLandmarks.some(n=>n.value===t),s=this.ratingValueLabel(e,t);return i?`${this.landmarkLabel(e,t)}, value ${t}, for ${e.name}`:s?`${s}, value ${t}, for ${e.name}`:`${t} for ${e.name}`}ratingRouteLabel(e){const t=this.ratingInputRoutes[e];return t==="smiley-landmark"?"smiley landmark":t==="voice"?"voice, confirmed":t==="gaze-standard-scale"?"gaze, standard scale, confirmed":t==="gaze-smiley-landmark"?"gaze, smiley landmark, confirmed":"full scale"}selectRating(e,t,i){i!=="voice"&&this.voiceState!=="idle"&&this.clearVoiceAnswer(),this.invalidatePendingSubmission();const s=this.gazeActivationInProgress?i==="smiley-landmark"?"gaze-smiley-landmark":"gaze-standard-scale":i;this.ratings={...this.ratings,[e]:t},this.ratingInputRoutes={...this.ratingInputRoutes,[e]:s},this.clearError();const n=this.dimensionById.get(e),a=this.answerMode==="smiley"&&this.smileyLandmarks.some(h=>h.value===t),u=this.ratingValueLabel(n,t);this.statusMessage=a?`${n.name}, ${this.landmarkLabel(n,t)}, value ${t}, selected.`:u?`${n.name}, ${u}, value ${t}, selected.`:`${n.name}, ${t}, selected.`,this.announceAutomatic(this.statusMessage),this.persistProgress()}selectPair(e,t,i){i!=="voice"&&this.voiceState!=="idle"&&this.clearVoiceAnswer(),this.invalidatePendingSubmission();const s=this.gazeActivationInProgress?"gaze":i;this.pairResponses={...this.pairResponses,[e]:t},this.pairInputRoutes={...this.pairInputRoutes,[e]:s},this.clearError(),this.statusMessage=`${this.dimensionById.get(t).name} selected.`,this.announceAutomatic(this.statusMessage),this.persistProgress()}goNext(e){if(this.stopReading(),this.clearVoiceAnswer(),e==="rating"){const t=this.dimensions[this.ratingIndex];if(this.ratings[t.id]===void 0){this.showError(`Choose a rating for ${t.name} before continuing.`);return}this.ratingIndex<this.dimensions.length-1?this.ratingIndex+=1:this.pairOrder.length?(this.stage="pairs",this.pairIndex=0):this.stage="review"}else{const t=this.pairOrder[this.pairIndex];if(!this.pairResponses[t.id]){this.showError("Choose which factor contributed more to workload before continuing.");return}this.pairIndex<this.pairOrder.length-1?this.pairIndex+=1:this.stage="review"}this.clearError(),this.persistProgress(),this.focusHeading()}effectiveStudyConfig(){return this.studyConfig?this.studyConfig:{schemaVersion:4,configId:"demo-config",createdAt:this.startedAt||new Date().toISOString(),prototypeVersion:L,instrumentId:this.definition.id,studyId:"DEMO",studyTitle:"Technical demonstration",taskLabel:"a task completed before the questionnaire",showScoreToParticipant:!0,support:{showSimpleLanguage:!1,answerMode:"standard",largeText:!1,audioGuidance:!1,recoveryEnabled:!1,participantAdjustmentPolicy:"presentation-only",voiceInputAvailable:!0,gazeInputAvailable:!0},collection:{mode:"local"}}}currentSupportMetadata(){return{simplerExplanationsShownAtSubmission:this.showSimpleLanguage,largeTextUsedAtSubmission:this.largeText,answerModeAtSubmission:this.answerMode,recoveryEnabledAtSubmission:this.recoveryEnabled,interruptionSummaryShown:this.interruptionSummaryShown,readAloudUsed:this.readAloudUsed,automaticAudioGuidanceEnabledAtSubmission:this.audioGuidance,gazeUsed:this.gazeUsed,gazeActionCount:this.gazeActionCount,gazeEngine:this.gazeUsed?`WebGazer ${A}`:null,ratingInputRoutes:this.ratingInputRoutes,pairInputRoutes:this.pairInputRoutes,supportChanges:[...this.supportChanges]}}downloadRecordJson(e){M(`${G(e)}.json`,JSON.stringify(e,null,2),"application/json")}downloadRecordCsv(e){M(`${G(e)}.csv`,`\uFEFF${oe([e])}`,"text/csv")}invalidatePendingSubmission(){this.submittedRecord&&this.completionSavedLocally&&!this.completionSavedByHost&&le(this.submittedRecord.submissionId),this.result=null,this.submittedRecord=null,this.completionSavedLocally=!1,this.completionSavedByHost=!1,this.remoteRecordingUnconfirmed=!1,this.hostSubmissionFailed=!1}announceAutomatic(e){this.audioGuidance&&e.trim()&&this.speakText(e)}speakOpenedHelp(e,t){e.currentTarget.open&&this.announceAutomatic(t)}speakText(e){if(!("speechSynthesis"in window)||!("SpeechSynthesisUtterance"in window)){this.audioStatusMessage="Built-in audio is unavailable in this browser. External screen readers can still read the page.";return}const t=window.speechSynthesis,i=this.readingAloud||t.speaking||t.pending||t.paused,s=++this.speechRequestId,n=new SpeechSynthesisUtterance(e);n.lang="en-GB",n.rate=1,n.pitch=1,n.volume=1,n.onend=()=>{s===this.speechRequestId&&(this.readingAloud=!1,this.audioStatusMessage="Spoken guidance finished.")},n.onerror=u=>{if(s!==this.speechRequestId)return;this.readingAloud=!1;const h=u.error?` (${u.error})`:"";this.audioStatusMessage=`No audio was played because the browser reported a speech error${h}. Check the device volume and try the button again.`};const a=()=>{if(s===this.speechRequestId)try{t.speak(n),this.readingAloud=!0,this.readAloudUsed=!0,this.audioStatusMessage="Playing spoken guidance."}catch{this.readingAloud=!1,this.audioStatusMessage="Built-in audio could not start in this browser. Check the device volume and try the button again."}};i?(t.cancel(),window.setTimeout(a,0)):a()}stopReading(e=!1){this.speechRequestId+=1,"speechSynthesis"in window&&window.speechSynthesis.cancel(),this.readingAloud=!1,e&&(this.audioStatusMessage="Spoken guidance stopped.")}currentStepSpeech(){if(this.stage==="intro"){const t=this.studyConfig?`Think about ${this.studyConfig.taskLabel}.`:"",i=this.answerMode==="smiley"?"The rating format uses five labelled smiley landmarks. A precise scale is available on request.":`The rating format uses ${this.ratingValues.length} values from ${this.definition.scale.minimum} to ${this.definition.scale.maximum}.`,s=this.pairs.length?` Then make ${this.pairs.length} pairwise comparisons.`:"";return`Before you begin. ${this.definition.introPrompt} ${t} Answer ${this.dimensions.length} items. ${i}${s} Finally review and submit.`}if(this.stage==="ratings"){const t=this.dimensions[this.ratingIndex],i=this.showSimpleLanguage&&t.simpleExplanation?` Simpler explanation: ${t.simpleExplanation}`:"",s=this.answerMode==="smiley"?`Choose a smiley landmark: ${this.smileyLandmarks.map(({value:n})=>`${this.landmarkLabel(t,n)}, value ${n}`).join("; ")}. A more precise value is available on the full scale.`:`Rate from ${this.definition.scale.minimum}, ${t.lowAnchor}, to ${this.definition.scale.maximum}, ${t.highAnchor}, in steps of ${this.definition.scale.step}.`;return`Rating ${this.ratingIndex+1} of ${this.dimensions.length}. ${t.name}. Official item: ${t.prompt}.${i} ${s}`}if(this.stage==="pairs"){const t=this.pairOrder[this.pairIndex],i=this.dimensionById.get(t.left),s=this.dimensionById.get(t.right),n=this.showSimpleLanguage?` In simpler words, ${this.definition.pairwise.simplePrompt} ${i.name}: ${i.shortMeaning}. ${s.name}: ${s.shortMeaning}.`:"";return`Comparison ${this.pairIndex+1} of ${this.pairOrder.length}. ${this.definition.pairwise.prompt} ${this.definition.pairwise.instruction} Choose ${i.name} or ${s.name}.${n}`}return this.stage==="review"?`Review ${this.dimensions.length} item responses${this.pairs.length?` and ${this.pairs.length} comparisons`:""} before submitting.`:this.studyConfig&&this.remoteRecordingUnconfirmed?this.statusMessage.trim()||"Qualtrics could not confirm this response. Reconnect to the internet, then select Next to try again. Keep this page open or download one backup before closing it.":this.studyConfig&&this.completionSavedByHost?"Submitting response. No action is needed.":this.result?`Responses calculated.${!this.studyConfig||this.studyConfig.showScoreToParticipant?` ${this.result.scoreName}: ${this.result.primaryScore.toFixed(2)} out of ${this.result.scoreMaximum}.`:""} JSON and CSV backup buttons are available on this page.`:"Responses calculated."}currentSimpleExplanationSpeech(){if(this.stage==="ratings"){const e=this.dimensions[this.ratingIndex];return e.simpleExplanation?`Simpler explanation for ${e.name}. ${e.simpleExplanation} Use the ${this.isResearcherSuppliedDefinition?"declared":"official"} scale when choosing your response.`:"This questionnaire definition does not provide reworded item text."}if(this.stage==="pairs"){const e=this.pairOrder[this.pairIndex],t=this.dimensionById.get(e.left),i=this.dimensionById.get(e.right);return`In simpler words, ${this.definition.pairwise.simplePrompt} ${t.name}: ${t.shortMeaning}. ${i.name}: ${i.shortMeaning}.`}return"Simpler explanations are on. Official questionnaire wording remains visible."}resumeSummarySpeech(){return`Welcome back. ${this.completedCount()} of ${this.dimensions.length+this.pairs.length} responses completed. Last saved response: ${this.lastSavedDescription()}. Current position: ${this.currentPositionDescription()}. Next action: ${this.nextActionDescription()}`}async showGazePositioningStep(e){this.webgazer&&(this.restoreWebGazerPreviewContainer(),this.webgazer.showPredictionPoints(!1),this.webgazer.showVideoPreview(!0),this.webgazer.showFaceOverlay(!0),this.webgazer.showFaceFeedbackBox(!0),this.gazeState="positioning",this.gazeMessage=e,this.announceAutomatic(this.gazeMessage),await this.updateComplete,this.mountWebGazerPreview(),this.querySelector("#gaze-positioning-heading")?.focus())}mountWebGazerPreview(){const e=this.querySelector(".gaze-camera-preview-slot"),t=document.querySelector("#webgazerVideoContainer");!e||!t||(t.setAttribute("aria-hidden","true"),e.append(t))}restoreWebGazerPreviewContainer(){const e=document.querySelector("#webgazerVideoContainer");e&&e.parentElement!==document.body&&document.body.append(e)}handleGazePoint(e){if(this.gazeState!=="ready"||!e){this.resetGazeHover();return}const t=this.elementsAtGazePoint(e);if(this.gazePendingElement){const u=t.map(g=>g.closest("[data-gaze-confirm], [data-gaze-cancel]")).find(g=>g!==null)??null,h=u?.hasAttribute("data-gaze-confirm")?"confirm":u?.hasAttribute("data-gaze-cancel")?"cancel":null,p=this.gazeConfirmationTracker.update(h,performance.now());this.gazeDwellProgress=p.progress,p.activated&&h==="confirm"&&this.confirmGazeProposal(),p.activated&&h==="cancel"&&this.cancelGazeProposal();return}const i=t.map(u=>u.closest("[data-gaze-target]")).find(u=>u!==null)??null,s=i&&!i.matches(":disabled")?i:null;s!==this.gazeCandidateElement&&(this.resetGazeHover(),this.gazeCandidateElement=s);const n=s?.dataset.gazeLabel??s?.textContent?.trim()??null,a=this.gazeCandidateTracker.update(n,performance.now());this.setGazeHover(s,a.progress),s&&a.activated&&(this.gazePendingElement=s,this.gazePendingLabel=n??"selected control",this.gazeDwellProgress=0,this.resetGazeHover(),this.statusMessage=`${this.gazePendingLabel} proposed by gaze. Confirm or cancel.`,this.announceAutomatic(this.statusMessage))}elementsAtGazePoint(e){if(typeof document.elementsFromPoint=="function")return document.elementsFromPoint(e.x,e.y).filter(i=>i instanceof HTMLElement);const t=document.elementFromPoint(e.x,e.y);return t instanceof HTMLElement?[t]:[]}setGazeHover(e,t){this.gazeCandidateElement=e,this.gazeDwellProgress=t,e&&(e.classList.add("gaze-hover"),e.style.setProperty("--gaze-progress",`${t*100}%`))}resetGazeHover(){this.gazeCandidateTracker.reset(),this.gazeCandidateElement&&(this.gazeCandidateElement.classList.remove("gaze-hover"),this.gazeCandidateElement.style.removeProperty("--gaze-progress")),this.gazeCandidateElement=null,this.gazePendingElement||(this.gazeDwellProgress=0)}stopGazeInputInternal(e){const t=this.gazeState!=="off"||this.webgazer!==null;this.cancelGazeProposal(),this.resetGazeHover(),this.restoreWebGazerPreviewContainer(),this.releaseGazeResources(),this.gazeState="off",this.gazeMessage="Gaze input and camera stopped.",e&&t&&this.announceAutomatic(this.gazeMessage)}releaseGazeResources(){const e=this.webgazer;if(e){this.restoreWebGazerPreviewContainer();try{e.clearGazeListener()}catch{}try{e.removeMouseEventListeners()}catch{}try{e.stopVideo()}catch{}try{e.end()}catch{}Promise.resolve(e.clearData()).catch(()=>{}),this.webgazer=null}}startVoiceInput(e,t,i,s="questionnaire"){this.stopReading();const n=window.SpeechRecognition??window.webkitSpeechRecognition;if(!n)return;this.releaseRecognition(),this.pendingVoiceAnswer=null,this.voiceMessage="Listening for one answer.",this.voiceState="listening";const a=new n;this.recognition=a;const u=s==="english-number"?"en-GB":Q(this.definition.language);a.lang=u,a.continuous=!1,a.interimResults=!1,a.maxAlternatives=5,a.onresult=h=>{if(this.recognition!==a)return;const p=h.results[0],g=[];for(let f=0;p&&f<p.length;f+=1){const m=p[f]?.transcript?.trim();m&&g.push(m)}if(e==="rating"){const f=Te(g,t,this.ratingValues,this.smileyLandmarks),m=s==="questionnaire"||f&&new RegExp("\\p{Number}|\\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\\b","iu").test(f.transcript)?f:null;if(m){this.releaseRecognition(a);const b=this.ratingVoiceAnswerLabel(t,m.value);this.pendingVoiceAnswer={context:e,transcript:m.transcript,value:m.value,label:b},this.voiceState="pending",this.voiceMessage=`Proposed answer: ${b}. Confirm this answer or try again.`,this.announceAutomatic(this.voiceMessage),this.updateComplete.then(()=>this.querySelector("[data-voice-confirm]")?.focus());return}}else{const f=Le(g,[t,i]);if(f){this.releaseRecognition(a);const m=this.dimensionById.get(f.value).name;this.pendingVoiceAnswer={context:e,transcript:f.transcript,value:f.value,label:m},this.voiceState="pending",this.voiceMessage=`Proposed answer: ${m}. Confirm this answer or try again.`,this.announceAutomatic(this.voiceMessage),this.updateComplete.then(()=>this.querySelector("[data-voice-confirm]")?.focus());return}}this.releaseRecognition(a),this.showVoiceError(s==="english-number"?`The answer was not recognised as one shown number in English. ${this.ratingVoicePrompt(t)}`:`The answer was not recognised in ${u}. ${e==="rating"?this.ratingVoicePrompt(t):`Say ${t.name} or ${i.name}.`}`)},a.onerror=h=>{this.recognition===a&&(this.releaseRecognition(a),this.showVoiceError(this.voiceRecognitionErrorMessage(h.error,u)))},a.onend=()=>{this.recognition===a&&(this.recognition=null,this.voiceState==="listening"&&this.showVoiceError("No answer was recognised. Try again or use the visible answer buttons."))};try{a.start()}catch{this.releaseRecognition(a),this.showVoiceError("Voice recognition could not start in this browser context. Use the visible answer buttons.")}}voiceRecognitionErrorMessage(e,t){switch(e){case"not-allowed":case"service-not-allowed":return"Microphone or speech-service permission was not granted. Allow microphone access, or use the visible answer buttons.";case"language-not-supported":case"language-unavailable":return`This browser does not support speech recognition for ${t}. Try the English-number button if shown, or use the visible answer buttons.`;case"no-speech":return"No speech was detected. Try again after the microphone starts listening, or use the visible answer buttons.";case"audio-capture":return"No working microphone was available. Check the selected microphone, or use the visible answer buttons.";case"network":return"The browser speech service could not connect. Check the network, try again, or use the visible answer buttons.";case"aborted":return"Voice input stopped before a result was returned. Try again, or use the visible answer buttons.";default:return`The browser speech service did not return an answer${e?` (${e})`:""}. Try again, try the English-number button if shown, or use the visible answer buttons.`}}showVoiceError(e){this.voiceState="error",this.voiceMessage=e,this.updateComplete.then(()=>{const t=this.querySelector("[data-voice-error]");t&&(C(t,{block:"center",forceCoordinateScroll:!0,onReveal:()=>this.requestParentReveal(t)}),this.announceAutomatic(`Voice answer not accepted. ${e}`))})}releaseRecognition(e=this.recognition){if(e){this.recognition===e&&(this.recognition=null),e.onresult=null,e.onerror=null,e.onend=null;try{e.stop()}catch{}}}currentProgressStorageKey(){const e=this.studyConfig?this.participantCode:"DEMO";return v(e)?de(this.studyConfig?.configId??"demo-config",e):null}currentTabParticipantCodeKey(){return this.studyConfig?`accessible-questionnaire-v0.8-tab-participant:${this.studyConfig.configId}`:null}rememberParticipantCodeForTab(){const e=this.currentTabParticipantCodeKey();if(!(!e||!this.recoveryEnabled||!v(this.participantCode)))try{sessionStorage.setItem(e,this.participantCode)}catch{}}forgetParticipantCodeForTab(){const e=this.currentTabParticipantCodeKey();if(e)try{sessionStorage.removeItem(e)}catch{}}restoreParticipantCodeForTab(){const e=this.currentTabParticipantCodeKey();if(!(!e||!this.recoveryEnabled||v(this.participantCode)))try{const t=sessionStorage.getItem(e);if(!t||!v(t))return;this.participantCode=t,this.participantCodeRestoredForTab=!0,this.statusMessage="Participant code restored for this tab. Checking for interrupted answers."}catch{}}persistProgress(){if(!this.recoveryEnabled||!this.isInProgress())return;const e=this.currentProgressStorageKey();if(!e)return;const t={version:4,instrumentId:this.definition.id,savedAt:Date.now(),startedAt:this.startedAt||new Date().toISOString(),configId:this.studyConfig?.configId??"demo-config",participantCode:this.studyConfig?this.participantCode:"DEMO",stage:this.stage,ratingIndex:this.ratingIndex,pairIndex:this.pairIndex,pairOrder:this.pairOrder,pairResponses:this.pairResponses,ratings:this.ratings,ratingInputRoutes:this.ratingInputRoutes,pairInputRoutes:this.pairInputRoutes,supportChanges:this.supportChanges,support:{answerMode:this.answerMode,showSimpleLanguage:this.showSimpleLanguage,largeText:this.largeText,audioGuidance:this.audioGuidance}};try{localStorage.setItem(e,JSON.stringify(t))}catch{this.statusMessage="Progress could not be saved by this browser.",this.announceAutomatic(this.statusMessage)}}applySavedRecoveryPresentation(e){this.canAdjustPresentationSupport&&(this.largeText=e.support.largeText,this.audioGuidance=!!e.support.audioGuidance)}findSavedSession(){const e=this.currentProgressStorageKey();if(e)try{const t=localStorage.getItem(e);if(!t)return;const i=JSON.parse(t);this.validSavedSession(i)?(this.savedSession=i,this.applySavedRecoveryPresentation(i),this.announceSavedSessionOffer(i)):this.clearSavedProgress()}catch{this.clearSavedProgress()}}findCompletedBackup(){if(!this.studyConfig||!v(this.participantCode))return;const e=ce().filter(t=>t.study.configId===this.studyConfig.configId&&t.participantCode===this.participantCode);this.recoveredCompletedRecord=e.at(-1)??null}validSavedSession(e){return e?.version===4&&e.instrumentId===this.definition.id&&e.configId===(this.studyConfig?.configId??"demo-config")&&e.participantCode===(this.studyConfig?this.participantCode:"DEMO")&&typeof e.startedAt=="string"&&["ratings","pairs","review"].includes(e.stage)&&Array.isArray(e.pairOrder)&&e.pairOrder.length===this.pairs.length&&Number.isInteger(e.ratingIndex)&&Number.isInteger(e.pairIndex)&&Array.isArray(e.supportChanges)}clearSavedProgress(){const e=this.currentProgressStorageKey();if(e)try{localStorage.removeItem(e)}catch{}}isInProgress(){return this.stage==="ratings"||this.stage==="pairs"||this.stage==="review"}completedCount(){return Object.keys(this.ratings).length+Object.keys(this.pairResponses).length}lastSavedDescription(){if(this.stage==="ratings"){const e=this.ratings[this.dimensions[this.ratingIndex].id]!==void 0?this.ratingIndex:this.ratingIndex-1;return e>=0?`${this.dimensions[e].name} rating`:"No response yet"}return this.stage==="pairs"?this.pairResponses[this.pairOrder[this.pairIndex].id]?`Comparison ${this.pairIndex+1}`:this.pairIndex>0?`Comparison ${this.pairIndex}`:`${this.dimensions.at(-1)?.name??"Final item"} rating`:this.pairs.length?`Comparison ${this.pairs.length}`:`${this.dimensions.at(-1)?.name??"Final item"} rating`}currentPositionDescription(){return this.stage==="ratings"?`Rating ${this.ratingIndex+1} of ${this.dimensions.length}: ${this.dimensions[this.ratingIndex].name}`:this.stage==="pairs"?`Comparison ${this.pairIndex+1} of ${this.pairOrder.length}`:this.stage==="review"?"Review responses":"Questionnaire introduction"}nextActionDescription(){if(this.stage==="ratings")return`Choose or check the ${this.dimensions[this.ratingIndex].name} rating, then select Next.`;if(this.stage==="pairs"){const e=this.pairOrder[this.pairIndex];return`Choose ${this.dimensionById.get(e.left).name} or ${this.dimensionById.get(e.right).name}, then select Next.`}return"Check the saved answers, then submit or return to a question."}showError(e){this.errorMessage=e,this.updateComplete.then(()=>{const t=this.querySelector("#error-summary");t&&(C(t,{block:"start",forceCoordinateScroll:!0,onReveal:()=>this.requestParentReveal(t)}),this.announceAutomatic(`There is a problem. ${e}`))})}requestParentReveal(e){}clearError(){this.errorMessage=""}focusHeading(e=!0){this.updateComplete.then(()=>{window.scrollTo({top:0});const t=this.querySelector("#question-panel h2");t&&(t.tabIndex=-1,t.focus(),this.statusMessage=t.textContent?.trim()??"",e&&this.audioGuidance&&this.speakText(this.currentStepSpeech()))})}};d([c()],o.prototype,"stage",2);d([c()],o.prototype,"ratingIndex",2);d([c()],o.prototype,"pairIndex",2);d([c()],o.prototype,"pairOrder",2);d([c()],o.prototype,"pairResponses",2);d([c()],o.prototype,"ratings",2);d([c()],o.prototype,"ratingInputRoutes",2);d([c()],o.prototype,"pairInputRoutes",2);d([c()],o.prototype,"supportChanges",2);d([c()],o.prototype,"answerMode",2);d([c()],o.prototype,"showSimpleLanguage",2);d([c()],o.prototype,"largeText",2);d([c()],o.prototype,"recoveryEnabled",2);d([c()],o.prototype,"resumeSummaryVisible",2);d([c()],o.prototype,"savedSession",2);d([c()],o.prototype,"recoveredCompletedRecord",2);d([c()],o.prototype,"readingAloud",2);d([c()],o.prototype,"readAloudUsed",2);d([c()],o.prototype,"audioGuidance",2);d([c()],o.prototype,"audioStatusMessage",2);d([c()],o.prototype,"interruptionSummaryShown",2);d([c()],o.prototype,"voiceState",2);d([c()],o.prototype,"voiceMessage",2);d([c()],o.prototype,"pendingVoiceAnswer",2);d([c()],o.prototype,"errorMessage",2);d([c()],o.prototype,"statusMessage",2);d([c()],o.prototype,"result",2);d([c()],o.prototype,"gazeState",2);d([c()],o.prototype,"gazeMessage",2);d([c()],o.prototype,"gazeCalibrationIndex",2);d([c()],o.prototype,"gazeCalibrationRepetition",2);d([c()],o.prototype,"gazePendingLabel",2);d([c()],o.prototype,"gazeDwellProgress",2);d([c()],o.prototype,"gazeUsed",2);d([c()],o.prototype,"gazeActionCount",2);d([c()],o.prototype,"studyConfig",2);d([c()],o.prototype,"configurationError",2);d([c()],o.prototype,"participantCode",2);d([c()],o.prototype,"participantCodeError",2);d([c()],o.prototype,"participantCodeRestoredForTab",2);d([c()],o.prototype,"startedAt",2);d([c()],o.prototype,"submittedRecord",2);d([c()],o.prototype,"completionSavedLocally",2);d([c()],o.prototype,"completionSavedByHost",2);d([c()],o.prototype,"remoteRecordingUnconfirmed",2);d([c()],o.prototype,"hostSubmissionFailed",2);d([c()],o.prototype,"submittingResult",2);d([c()],o.prototype,"hostBridgeState",2);d([c()],o.prototype,"hostBridgeMessage",2);o=d([J("accessible-nasa-tlx")],o);let _=class extends o{};_=d([J("accessible-questionnaire")],_);
