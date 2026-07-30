import{w as D,g as Q,x as O,M as T,a as r,t as x,i as k,D as M,m as y,y as L,z as F,u as j,o as U,B,h as J,C as P,P as v,A as c,l as o,k as _,j as G,E as H,F as W,f as V}from"./shared-Dht3iifw.js";const w=`__js_AQP_ACCEPTED
__js_AQP_BRIDGE_READY
__js_AQP_BRIDGE_BUILD
__js_AQP_SCHEMA
__js_AQP_SUBMISSION_ID
__js_AQP_STUDY_ID
__js_AQP_CONFIG_ID
__js_AQP_PARTICIPANT_CODE
__js_AQP_STARTED_AT
__js_AQP_COMPLETED_AT
__js_AQP_PROTOTYPE_VERSION
__js_AQP_COLLECTION_MODE
__js_AQP_INSTRUMENT_ID
__js_AQP_INSTRUMENT_NAME
__js_AQP_INSTRUMENT_VERSION
__js_AQP_SCORING_STRATEGY
__js_AQP_SCORE_NAME
__js_AQP_PRIMARY_SCORE
__js_AQP_SCORE_MINIMUM
__js_AQP_SCORE_MAXIMUM
__js_AQP_SCORE_DETAILS_JSON
__js_AQP_RATINGS_JSON
__js_AQP_PAIR_CHOICES_JSON
__js_AQP_PAIR_ORDER_JSON
__js_AQP_RATING_ROUTES_JSON
__js_AQP_PAIR_ROUTES_JSON
__js_AQP_CONFIGURED_SUPPORT_JSON
__js_AQP_SUPPORT_CHANGE_COUNT
__js_AQP_FINAL_SIMPLE_LANGUAGE
__js_AQP_FINAL_ANSWER_MODE
__js_AQP_FINAL_LARGE_TEXT
__js_AQP_FINAL_AUDIO
__js_AQP_FINAL_RECOVERY
__js_AQP_READ_ALOUD_USED
__js_AQP_INTERRUPTION_SUMMARY
__js_AQP_GAZE_USED
__js_AQP_GAZE_ACTION_COUNT
__js_AQP_RAW_CHUNK_COUNT
__js_AQP_RAW_01
__js_AQP_RAW_02
__js_AQP_RAW_03
__js_AQP_RAW_04
__js_AQP_RAW_05
__js_AQP_RAW_06
__js_AQP_RAW_07
__js_AQP_RAW_08
__js_AQP_RAW_09
__js_AQP_RAW_10
__js_AQP_RAW_11
__js_AQP_RAW_12
__js_AQP_RAW_13
__js_AQP_RAW_14
__js_AQP_RAW_15
__js_AQP_RAW_16
__js_AQP_RAW_17
__js_AQP_RAW_18
__js_AQP_RAW_19
__js_AQP_RAW_20
__js_AQP_RAW_21
__js_AQP_RAW_22
__js_AQP_RAW_23
__js_AQP_RAW_24
`,z=`Questionnaire complete

{{OPTIONAL_SCORE_BLOCK}}

Your questionnaire responses have been recorded successfully.

Any accessibility-support choices and input-route information have been saved separately from the questionnaire score.

No further action is required.
You may now close this page.
`,A=`/*
 * Accessible Questionnaire Platform Version 0.8 Qualtrics question bridge.
 *
 * Paste this complete file into the JavaScript editor of the Qualtrics
 * question that contains the iframe from question-html-template.html.
 * Keep the participant prototype on https://sasoup-yr.github.io.
 */
Qualtrics.SurveyEngine.addOnReady(function initialiseAccessibleQuestionnaireBridge() {
  var question = this;
  var childOrigin = 'https://sasoup-yr.github.io';
  var submitType = 'accessible-questionnaire:qualtrics-submit:v2';
  var receiptType = 'accessible-questionnaire:qualtrics-receipt:v2';
  var parentReadyType = 'accessible-questionnaire:qualtrics-parent-ready:v2';
  var childReadyType = 'accessible-questionnaire:qualtrics-child-ready:v2';
  var advanceFailedType = 'accessible-questionnaire:qualtrics-advance-failed:v2';
  var bridgeBuild = '0.8.7-q7';
  var iframe = document.getElementById('accessible-questionnaire-frame');
  var status = document.getElementById('accessible-questionnaire-collection-status');
  var liveQuestion = document.getElementById('accessible-questionnaire-live-question');
  var recordedSummary = document.getElementById('accessible-questionnaire-recorded-summary');
  var originalLiveParent = liveQuestion && liveQuestion.parentNode;
  var originalLiveNextSibling = liveQuestion && liveQuestion.nextSibling;
  var acceptedSubmissionId = null;
  var advancing = false;
  var childConnected = false;
  var completionTimerId = null;
  var advanceWatchdogTimerId = null;
  var connectionTimerId = null;
  var parentReadyTimerIds = [];
  var relaxedLayoutStyles = [];
  var rawChunkLength = 900;
  var maximumRawChunks = 24;
  // setJSEmbeddedData only writes into the in-browser survey session; the values reach
  // the Qualtrics response when this page is submitted by clickNextButton() below.
  // Everything between the receipt and that submission is a window in which closing the
  // tab loses the response, so this hand-off is kept as short as the receipt round-trip
  // allows rather than being used as a reading pause.
  var completionDelayMs = 800;

  function setStatus(message, quiet, severity) {
    if (!status) return;
    status.textContent = message;
    if (typeof status.setAttribute === 'function') {
      status.setAttribute('data-quiet', quiet ? 'true' : 'false');
      status.setAttribute('data-severity', severity === 'error' ? 'error' : 'information');
      status.setAttribute('aria-live', quiet ? 'off' : 'polite');
    }
  }

  function setImportantStyle(element, name, value) {
    if (!element || !element.style) return;
    if (typeof element.style.setProperty === 'function') {
      element.style.setProperty(name, value, 'important');
      return;
    }
    element.style[name] = value;
  }

  function prepareFrameLayout() {
    if (typeof iframe.setAttribute === 'function') iframe.setAttribute('scrolling', 'yes');
    if (typeof iframe.setAttribute === 'function') iframe.setAttribute('aria-hidden', 'true');
    if (document.body && liveQuestion && liveQuestion.parentNode !== document.body) {
      document.body.appendChild(liveQuestion);
    }
    setImportantStyle(liveQuestion, 'position', 'fixed');
    setImportantStyle(liveQuestion, 'inset', '0');
    setImportantStyle(liveQuestion, 'width', '100vw');
    setImportantStyle(liveQuestion, 'height', '100vh');
    if (
      window.CSS &&
      typeof window.CSS.supports === 'function' &&
      window.CSS.supports('height', '100dvh')
    ) {
      setImportantStyle(liveQuestion, 'height', '100dvh');
    }
    setImportantStyle(liveQuestion, 'margin', '0');
    setImportantStyle(liveQuestion, 'padding', '0');
    setImportantStyle(liveQuestion, 'overflow', 'hidden');
    setImportantStyle(liveQuestion, 'background', '#eef2f6');
    setImportantStyle(liveQuestion, 'z-index', '2147483000');
    setImportantStyle(iframe, 'display', 'block');
    setImportantStyle(iframe, 'position', 'absolute');
    setImportantStyle(iframe, 'inset', '0');
    setImportantStyle(iframe, 'width', '100%');
    setImportantStyle(iframe, 'max-width', 'none');
    setImportantStyle(iframe, 'height', '100%');
    setImportantStyle(iframe, 'overflow', 'auto');
    setImportantStyle(iframe, 'border', '0');
    setImportantStyle(iframe, 'visibility', 'hidden');
  }

  function revealConnectedFrame() {
    if (typeof iframe.removeAttribute === 'function') iframe.removeAttribute('aria-hidden');
    setImportantStyle(iframe, 'visibility', 'visible');
  }

  function relaxStyle(element, property, value) {
    if (!element || !element.style) return;
    var previousValue = typeof element.style.getPropertyValue === 'function'
      ? element.style.getPropertyValue(property)
      : element.style[property];
    var previousPriority = typeof element.style.getPropertyPriority === 'function'
      ? element.style.getPropertyPriority(property)
      : '';
    relaxedLayoutStyles.push({
      element: element,
      property: property,
      value: previousValue || '',
      priority: previousPriority || ''
    });
    if (typeof element.style.setProperty === 'function') {
      element.style.setProperty(property, value, 'important');
    } else {
      element.style[property] = value;
    }
  }

  function lockOuterQualtricsViewport() {
    if (document.documentElement) {
      relaxStyle(document.documentElement, 'overflow', 'hidden');
    }
    if (document.body) {
      relaxStyle(document.body, 'overflow', 'hidden');
    }
  }

  function restoreQualtricsQuestionLayout() {
    for (var index = relaxedLayoutStyles.length - 1; index >= 0; index -= 1) {
      var entry = relaxedLayoutStyles[index];
      if (!entry.element || !entry.element.style) continue;
      if (typeof entry.element.style.setProperty === 'function') {
        entry.element.style.setProperty(
          entry.property,
          entry.value,
          entry.priority
        );
      } else {
        entry.element.style[entry.property] = entry.value;
      }
    }
    relaxedLayoutStyles = [];
    if (liveQuestion && originalLiveParent && liveQuestion.parentNode !== originalLiveParent) {
      if (
        originalLiveNextSibling &&
        originalLiveNextSibling.parentNode === originalLiveParent &&
        typeof originalLiveParent.insertBefore === 'function'
      ) {
        originalLiveParent.insertBefore(liveQuestion, originalLiveNextSibling);
      } else if (typeof originalLiveParent.appendChild === 'function') {
        originalLiveParent.appendChild(liveQuestion);
      }
    }
  }

  function releaseFullscreenForNativeNavigation() {
    restoreQualtricsQuestionLayout();
    setImportantStyle(liveQuestion, 'position', 'relative');
    setImportantStyle(liveQuestion, 'inset', 'auto');
    setImportantStyle(liveQuestion, 'width', '100%');
    setImportantStyle(liveQuestion, 'height', 'auto');
    setImportantStyle(liveQuestion, 'margin', '0');
    setImportantStyle(liveQuestion, 'overflow', 'visible');
    setImportantStyle(liveQuestion, 'z-index', 'auto');
    setImportantStyle(iframe, 'position', 'relative');
    setImportantStyle(iframe, 'inset', 'auto');
    setImportantStyle(iframe, 'width', '100%');
    setImportantStyle(iframe, 'height', '70vh');
    setImportantStyle(iframe, 'min-height', '600px');
    setImportantStyle(iframe, 'overflow', 'auto');
    setImportantStyle(status, 'position', 'relative');
    setImportantStyle(status, 'top', 'auto');
    setImportantStyle(status, 'left', 'auto');
    setImportantStyle(status, 'width', '100%');
    setImportantStyle(status, 'transform', 'none');
    setImportantStyle(status, 'margin', '0 0 0.75rem');
  }

  function sendParentReady() {
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage({
      type: parentReadyType,
      protocolVersion: 2,
      bridgeBuild: bridgeBuild
    }, childOrigin);
  }

  function sendReceipt(target, accepted, submissionId, error) {
    target.postMessage({
      type: receiptType,
      accepted: accepted,
      submissionId: submissionId,
      receiptId: accepted ? 'qualtrics-accepted-' + submissionId : undefined,
      error: error || undefined,
      bridgeBuild: bridgeBuild
    }, childOrigin);
  }

  function sendAdvanceFailure(message) {
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage({
      type: advanceFailedType,
      submissionId: acceptedSubmissionId || '',
      error: message,
      bridgeBuild: bridgeBuild
    }, childOrigin);
  }

  function recoverFailedAdvance(reason) {
    advanceWatchdogTimerId = null;
    if (!advancing) return;
    advancing = false;
    var advanceFailureMessage = reason === 'offline'
      ? 'Internet connection unavailable. Qualtrics has not recorded this response. ' +
        'A complete backup is saved on this device. Reconnect, keep this page open, ' +
        'then select Next to try again. You may download a backup before closing.'
      : 'Qualtrics could not confirm this response. Reconnect to the internet, then select Next to try again. ' +
        'Keep this page open or download one backup before closing it.';
    releaseFullscreenForNativeNavigation();
    setImportantStyle(status, 'position', 'sticky');
    setImportantStyle(status, 'top', '0');
    setImportantStyle(status, 'z-index', '2147483001');
    setStatus(advanceFailureMessage, false, 'error');
    if (status && typeof status.scrollIntoView === 'function') {
      status.scrollIntoView({ block: 'start', inline: 'nearest' });
    }
    sendAdvanceFailure(advanceFailureMessage);
    question.showNextButton();
    if (reason === 'offline') {
      // The participant has already selected Calculate and submit. Make the
      // first native Qualtrics attempt for them so the platform-owned offline
      // dialog appears without a second, easily missed Next-button action.
      // The restored Next button remains available for a retry after reconnecting.
      question.clickNextButton();
    }
  }

  function setField(name, value) {
    Qualtrics.SurveyEngine.setJSEmbeddedData(
      name,
      value === null || value === undefined ? '' : String(value)
    );
  }

  function stageConnectionDiagnostic() {
    /*
     * These fields show that the exact bridge connected. They are deliberately
     * separate from AQP_ACCEPTED, which is written only after a complete record
     * has passed validation. They reach Data & Analysis only when Qualtrics
     * submits the page.
     */
    setField('AQP_BRIDGE_READY', 1);
    setField('AQP_BRIDGE_BUILD', bridgeBuild);
    setField('AQP_SCHEMA', 4);
    setField('AQP_COLLECTION_MODE', 'qualtrics');
  }

  function requireRecord(record) {
    if (!record || typeof record !== 'object') throw new Error('The questionnaire returned an empty record.');
    if (record.schemaVersion !== 4) throw new Error('The questionnaire record version is not supported.');
    if (!record.submissionId || typeof record.submissionId !== 'string') throw new Error('The submission ID is missing.');
    if (!record.study || !record.participantCode || !record.timing || !record.instrument || !record.result) {
      throw new Error('The questionnaire record is incomplete.');
    }
    if (
      !record.instrument.id ||
      !record.instrument.name ||
      !record.instrument.scoringStrategy
    ) {
      throw new Error('The questionnaire definition metadata is incomplete.');
    }
    if (
      !record.result.scoreName ||
      !Number.isFinite(record.result.primaryScore) ||
      !Number.isFinite(record.result.scoreMinimum) ||
      !Number.isFinite(record.result.scoreMaximum)
    ) {
      throw new Error('The questionnaire score is missing or invalid.');
    }
    if (!record.responses || !record.responses.ratings || !record.responses.pairwiseChoices) {
      throw new Error('The questionnaire answers are incomplete.');
    }
    if (!record.supportMetadata || !Array.isArray(record.supportMetadata.supportChanges)) {
      throw new Error('The questionnaire support metadata is incomplete.');
    }
  }

  function storeRecord(record) {
    var raw = JSON.stringify(record);
    var chunkCount = Math.ceil(raw.length / rawChunkLength);
    if (chunkCount > maximumRawChunks) {
      throw new Error('The questionnaire record is larger than the approved Qualtrics field allocation.');
    }

    setField('AQP_ACCEPTED', 1);
    setField('AQP_SCHEMA', record.schemaVersion);
    setField('AQP_SUBMISSION_ID', record.submissionId);
    setField('AQP_STUDY_ID', record.study.studyId);
    setField('AQP_CONFIG_ID', record.study.configId);
    setField('AQP_PARTICIPANT_CODE', record.participantCode);
    setField('AQP_STARTED_AT', record.timing.startedAt);
    setField('AQP_COMPLETED_AT', record.timing.completedAt);
    setField('AQP_PROTOTYPE_VERSION', record.prototype.version);
    setField('AQP_COLLECTION_MODE', record.collection.mode);
    setField('AQP_INSTRUMENT_ID', record.instrument.id);
    setField('AQP_INSTRUMENT_NAME', record.instrument.name);
    setField('AQP_INSTRUMENT_VERSION', record.instrument.version);
    setField('AQP_SCORING_STRATEGY', record.instrument.scoringStrategy);
    setField('AQP_SCORE_NAME', record.result.scoreName);
    setField('AQP_PRIMARY_SCORE', Number(record.result.primaryScore).toFixed(2));
    setField('AQP_SCORE_MINIMUM', record.result.scoreMinimum);
    setField('AQP_SCORE_MAXIMUM', record.result.scoreMaximum);
    setField('AQP_SCORE_DETAILS_JSON', JSON.stringify(record.result.details));
    setField('AQP_RATINGS_JSON', JSON.stringify(record.responses.ratings));
    setField('AQP_PAIR_CHOICES_JSON', JSON.stringify(record.responses.pairwiseChoices));
    setField('AQP_PAIR_ORDER_JSON', JSON.stringify(record.responses.pairPresentationOrder));
    setField('AQP_RATING_ROUTES_JSON', JSON.stringify(record.supportMetadata.ratingInputRoutes));
    setField('AQP_PAIR_ROUTES_JSON', JSON.stringify(record.supportMetadata.pairInputRoutes));
    setField('AQP_CONFIGURED_SUPPORT_JSON', JSON.stringify(record.configuration));
    setField('AQP_SUPPORT_CHANGE_COUNT', record.supportMetadata.supportChanges.length);
    setField('AQP_FINAL_SIMPLE_LANGUAGE', record.supportMetadata.simplerExplanationsShownAtSubmission);
    setField('AQP_FINAL_ANSWER_MODE', record.supportMetadata.answerModeAtSubmission);
    setField('AQP_FINAL_LARGE_TEXT', record.supportMetadata.largeTextUsedAtSubmission);
    setField('AQP_FINAL_AUDIO', record.supportMetadata.automaticAudioGuidanceEnabledAtSubmission);
    setField('AQP_FINAL_RECOVERY', record.supportMetadata.recoveryEnabledAtSubmission);
    setField('AQP_READ_ALOUD_USED', record.supportMetadata.readAloudUsed);
    setField('AQP_INTERRUPTION_SUMMARY', record.supportMetadata.interruptionSummaryShown);
    setField('AQP_GAZE_USED', record.supportMetadata.gazeUsed);
    setField('AQP_GAZE_ACTION_COUNT', record.supportMetadata.gazeActionCount);
    setField('AQP_RAW_CHUNK_COUNT', chunkCount);

    for (var index = 0; index < maximumRawChunks; index += 1) {
      var suffix = String(index + 1).padStart(2, '0');
      setField(
        'AQP_RAW_' + suffix,
        index < chunkCount ? raw.slice(index * rawChunkLength, (index + 1) * rawChunkLength) : ''
      );
    }
  }

  function receiveResult(event) {
    if (!iframe || event.source !== iframe.contentWindow || event.origin !== childOrigin) return;
    var message = event.data;
    if (message && message.type === childReadyType) {
      if (message.protocolVersion !== 2 || message.bridgeBuild !== bridgeBuild) {
        setStatus(
          'The generated questionnaire HTML, JavaScript and participant page do not use the same bridge version. ' +
          'Do not collect a response. Regenerate and replace the complete package.',
          false
        );
        releaseFullscreenForNativeNavigation();
        question.showNextButton();
        return;
      }
      try {
        stageConnectionDiagnostic();
      } catch (error) {
        var diagnosticDetail = error && error.message
          ? error.message
          : 'Qualtrics could not stage the connection diagnostic.';
        setStatus(
          diagnosticDetail +
          ' Do not collect a response. Check the Survey Flow fields and question JavaScript.',
          false
        );
        releaseFullscreenForNativeNavigation();
        question.showNextButton();
        return;
      }
      childConnected = true;
      if (connectionTimerId !== null) {
        window.clearTimeout(connectionTimerId);
        connectionTimerId = null;
      }
      parentReadyTimerIds.forEach(function clearParentReadyTimer(timerId) {
        window.clearTimeout(timerId);
      });
      parentReadyTimerIds = [];
      revealConnectedFrame();
      setStatus(
        'The questionnaire is connected. Bridge ' + bridgeBuild +
        ' staged its Qualtrics diagnostic fields. Completed answers will save into this response.',
        true
      );
      return;
    }
    if (!message || message.type !== submitType) return;
    var submissionId = message.record && message.record.submissionId;
    if (!childConnected) {
      sendReceipt(
        event.source,
        false,
        submissionId || '',
        'The verified Qualtrics bridge connection is not ready.'
      );
      return;
    }
    if (message.bridgeBuild !== bridgeBuild) {
      sendReceipt(
        event.source,
        false,
        submissionId || '',
        'The questionnaire and Qualtrics bridge versions do not match.'
      );
      return;
    }

    if (acceptedSubmissionId === submissionId) {
      sendReceipt(event.source, true, submissionId);
      return;
    }
    if (acceptedSubmissionId || advancing) {
      sendReceipt(event.source, false, submissionId || '', 'A different response is already being saved.');
      return;
    }

    if (document.body && liveQuestion.parentNode !== document.body) {
      prepareFrameLayout();
      lockOuterQualtricsViewport();
    }
    try {
      requireRecord(message.record);
      storeRecord(message.record);
      acceptedSubmissionId = message.record.submissionId;
      advancing = true;
      setStatus(
        'Submitting response. This page will continue automatically.',
        true
      );
      sendReceipt(event.source, true, acceptedSubmissionId);
      // A definite browser-offline state cannot produce a durable Qualtrics
      // response. Show the platform-owned recovery notice immediately instead
      // of waiting for Qualtrics' slower native network-error dialog.
      if (window.navigator && window.navigator.onLine === false) {
        recoverFailedAdvance('offline');
        return;
      }
      completionTimerId = window.setTimeout(function completeAcceptedResponse() {
        completionTimerId = null;
        question.clickNextButton();
        // If Qualtrics does not unload this question after the native advance, keep
        // the participant out of a dead end. The questionnaire iframe still holds
        // its in-memory JSON/CSV routes, and the native navigation is restored.
        advanceWatchdogTimerId = window.setTimeout(recoverFailedAdvance, 6000);
      }, completionDelayMs);
    } catch (error) {
      var detail = error && error.message ? error.message : 'Qualtrics could not stage the response.';
      setStatus(
        detail +
        ' Return to the questionnaire and try again. If it keeps failing, use the download' +
        ' button on the questionnaire and tell the study conductor.',
        false
      );
      releaseFullscreenForNativeNavigation();
      sendReceipt(event.source, false, submissionId || '', detail);
      // Staging can fail deterministically — an oversized record fails identically on every
      // retry — so the navigation control is restored. Without it the participant is left on
      // a page with no way to submit and no way to advance.
      question.showNextButton();
    }
  }

  if (
    recordedSummary &&
    typeof recordedSummary.getAttribute === 'function' &&
    recordedSummary.getAttribute('data-recorded') === '1'
  ) {
    return;
  }
  if (!iframe || !iframe.contentWindow || !liveQuestion) {
    setStatus(
      'The accessible questionnaire package is incomplete. The study conductor must replace the complete generated HTML and JavaScript.',
      false
    );
    // Keep the native navigation available on a misconfigured test page instead of
    // trapping the researcher or participant. This path must fail the synthetic
    // preflight and must never be used to collect a participant response.
    question.showNextButton();
    return;
  }
  if (
    typeof liveQuestion.getAttribute !== 'function' ||
    liveQuestion.getAttribute('data-aqp-package-build') !== bridgeBuild
  ) {
    setStatus(
      'The questionnaire HTML and JavaScript versions do not match. Expected package ' +
      bridgeBuild + '. Do not collect a response. Replace both generated blocks together.',
      false
    );
    releaseFullscreenForNativeNavigation();
    question.showNextButton();
    return;
  }

  prepareFrameLayout();
  lockOuterQualtricsViewport();
  question.hideNextButton();
  window.addEventListener('message', receiveResult);
  setStatus('Connecting questionnaire package ' + bridgeBuild + ' to this Qualtrics response.', false);
  if (typeof iframe.addEventListener === 'function') {
    iframe.addEventListener('load', sendParentReady);
  }
  [0, 100, 500, 1500, 4000].forEach(function scheduleParentReady(delay) {
    parentReadyTimerIds.push(window.setTimeout(sendParentReady, delay));
  });
  sendParentReady();
  connectionTimerId = window.setTimeout(function reportMissingConnection() {
    connectionTimerId = null;
    if (childConnected) return;
    setStatus(
      'The questionnaire connection did not start. Do not collect a real response. ' +
      'Regenerate and replace the complete HTML and JavaScript, then test again.',
      false
    );
    releaseFullscreenForNativeNavigation();
    question.showNextButton();
  }, 8000);
  Qualtrics.SurveyEngine.addOnUnload(function removeAccessibleQuestionnaireListener() {
    if (completionTimerId !== null) {
      window.clearTimeout(completionTimerId);
      completionTimerId = null;
    }
    if (advanceWatchdogTimerId !== null) {
      window.clearTimeout(advanceWatchdogTimerId);
      advanceWatchdogTimerId = null;
    }
    if (connectionTimerId !== null) {
      window.clearTimeout(connectionTimerId);
      connectionTimerId = null;
    }
    parentReadyTimerIds.forEach(function clearParentReadyTimer(timerId) {
      window.clearTimeout(timerId);
    });
    parentReadyTimerIds = [];
    if (typeof iframe.removeEventListener === 'function') {
      iframe.removeEventListener('load', sendParentReady);
    }
    restoreQualtricsQuestionLayout();
    window.removeEventListener('message', receiveResult);
  });
});
`,Y=`<!--
  REFERENCE TEMPLATE ONLY.
  Do not paste this file into Qualtrics unchanged. Use the complete generated
  question HTML from study.html so the iframe has the configured participant URL.
-->
<style>
  #accessible-questionnaire-recorded-summary {
    display: none;
    color: #172235;
    font-family: Arial, Helvetica, sans-serif;
    line-height: 1.5;
  }
  #accessible-questionnaire-recorded-summary[data-recorded="1"] { display: block !important; }
  #accessible-questionnaire-recorded-summary[data-recorded="1"] + #accessible-questionnaire-live-question { display: none; }
  #accessible-questionnaire-recorded-summary h2,
  #accessible-questionnaire-recorded-summary h3 { color: #173f63; }
  #accessible-questionnaire-recorded-summary table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 1.25rem;
  }
  #accessible-questionnaire-recorded-summary th,
  #accessible-questionnaire-recorded-summary td {
    border: 2px solid #6d7f91;
    padding: 0.5rem;
    text-align: left;
    vertical-align: top;
  }
  #accessible-questionnaire-recorded-summary th { background: #edf4f8; }
  #accessible-questionnaire-recorded-summary .aqp-long-value {
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }
  #accessible-questionnaire-live-question {
    position: fixed;
    inset: 0;
    z-index: 2147483000;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: #eef2f6;
  }
  #accessible-questionnaire-frame {
    display: block;
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    overflow: auto;
    background: #eef2f6;
  }
  #accessible-questionnaire-collection-status {
    position: fixed;
    z-index: 2147483001;
    top: 1rem;
    left: 50%;
    width: min(44rem, calc(100vw - 2rem));
    box-sizing: border-box;
    transform: translateX(-50%);
    margin: 0;
    padding: 0.75rem 1rem;
    border: 2px solid #315b7d;
    background: #edf4f8;
    color: #172235;
    font: 600 1rem/1.5 Arial, Helvetica, sans-serif;
  }
  #accessible-questionnaire-collection-status[data-quiet="true"] {
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }
  #accessible-questionnaire-collection-status[data-severity="error"] {
    border-color: #b10e1e;
    background: #fff4f4;
    color: #171717;
    box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.18);
  }
</style>
<section
  id="accessible-questionnaire-recorded-summary"
  data-recorded="\${e://Field/__js_AQP_ACCEPTED}"
  aria-labelledby="accessible-questionnaire-recorded-summary-heading"
  style="display:none"
>
  <h2 id="accessible-questionnaire-recorded-summary-heading">Accessible questionnaire recorded response</h2>
  <p>This read-only summary is generated from the values saved in this Qualtrics response.</p>
  <table>
    <caption>Submission details</caption>
    <tbody>
      <tr><th scope="row">Participant code</th><td>\${e://Field/__js_AQP_PARTICIPANT_CODE}</td></tr>
      <tr><th scope="row">Study ID</th><td>\${e://Field/__js_AQP_STUDY_ID}</td></tr>
      <tr><th scope="row">Questionnaire</th><td>\${e://Field/__js_AQP_INSTRUMENT_NAME}</td></tr>
      <tr><th scope="row">Questionnaire version</th><td>\${e://Field/__js_AQP_INSTRUMENT_VERSION}</td></tr>
      <tr><th scope="row">Submission ID</th><td class="aqp-long-value">\${e://Field/__js_AQP_SUBMISSION_ID}</td></tr>
      <tr><th scope="row">Started</th><td>\${e://Field/__js_AQP_STARTED_AT}</td></tr>
      <tr><th scope="row">Completed</th><td>\${e://Field/__js_AQP_COMPLETED_AT}</td></tr>
      <tr><th scope="row">Scoring rule</th><td>\${e://Field/__js_AQP_SCORING_STRATEGY}</td></tr>
      <tr>
        <th scope="row">\${e://Field/__js_AQP_SCORE_NAME}</th>
        <td>
          \${e://Field/__js_AQP_PRIMARY_SCORE}
          (defined range \${e://Field/__js_AQP_SCORE_MINIMUM}–\${e://Field/__js_AQP_SCORE_MAXIMUM})
        </td>
      </tr>
    </tbody>
  </table>
  <h3>Item responses</h3>
  <p class="aqp-long-value">\${e://Field/__js_AQP_RATINGS_JSON}</p>
  <h3>Pairwise responses, when required by the definition</h3>
  <p class="aqp-long-value">\${e://Field/__js_AQP_PAIR_CHOICES_JSON}</p>
  <h3>Accessibility-support record</h3>
  <table>
    <tbody>
      <tr><th scope="row">Simpler explanations at submission</th><td>\${e://Field/__js_AQP_FINAL_SIMPLE_LANGUAGE}</td></tr>
      <tr><th scope="row">Answer presentation at submission</th><td>\${e://Field/__js_AQP_FINAL_ANSWER_MODE}</td></tr>
      <tr><th scope="row">Large text at submission</th><td>\${e://Field/__js_AQP_FINAL_LARGE_TEXT}</td></tr>
      <tr><th scope="row">Automatic audio at submission</th><td>\${e://Field/__js_AQP_FINAL_AUDIO}</td></tr>
      <tr><th scope="row">Recovery at submission</th><td>\${e://Field/__js_AQP_FINAL_RECOVERY}</td></tr>
      <tr><th scope="row">Read aloud used</th><td>\${e://Field/__js_AQP_READ_ALOUD_USED}</td></tr>
      <tr><th scope="row">Gaze used</th><td>\${e://Field/__js_AQP_GAZE_USED}</td></tr>
      <tr><th scope="row">Support changes</th><td>\${e://Field/__js_AQP_SUPPORT_CHANGE_COUNT}</td></tr>
    </tbody>
  </table>
  <p><strong>Rating input routes:</strong> <span class="aqp-long-value">\${e://Field/__js_AQP_RATING_ROUTES_JSON}</span></p>
  <p><strong>Pair input routes:</strong> <span class="aqp-long-value">\${e://Field/__js_AQP_PAIR_ROUTES_JSON}</span></p>
  <p>The reconstructed raw JSON or CSV export is the lossless research record. This section is a readable response/PDF summary.</p>
</section>
<div
  id="accessible-questionnaire-live-question"
  data-aqp-package-build="0.8.7-q7"
>
  <p
    id="accessible-questionnaire-collection-status"
    role="status"
    aria-live="polite"
    data-quiet="false"
    data-severity="information"
  >
    Connecting this questionnaire to the current Qualtrics response.
  </p>
  <iframe
    id="accessible-questionnaire-frame"
    src="PASTE_THE_GENERATED_PARTICIPANT_PAGE_URL_HERE"
    title="Accessible questionnaire participant page"
    allow="camera; microphone"
    referrerpolicy="origin"
    scrolling="yes"
    aria-hidden="true"
    style="display:block;position:absolute;inset:0;width:100%;height:100%;border:0;overflow:auto;visibility:hidden;background:#eef2f6"
  ></iframe>
</div>
`,f=20;let E=0;function S(e={}){return E+=1,{key:`custom-item-${E}`,name:"",prompt:"",lowAnchor:"",highAnchor:"",simpleExplanation:"",reverseScored:!1,...e}}function C(){return{name:"",shortName:"",version:"1.0.0",description:"A researcher-supplied questionnaire.",introPrompt:"Answer each item about the task that you have just completed.",sourceLabel:"Researcher-supplied questionnaire",sourceUrl:"",scaleType:"agreement",minimum:1,maximum:5,step:1,scoreName:"Questionnaire score",aggregation:"mean",items:[S({name:"Item 1"}),S({name:"Item 2"})]}}function d(e,t){const n=e.trim().replace(/\s+/g," ");if(!n)throw new Error(`${t} is required.`);return n}function X(e){return e.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,50)}function K(e,t){const n=t.trim()||e.trim();return n.length<=240?n:`${n.slice(0,237).trimEnd()}...`}function Z(e){if(!Number.isInteger(e.minimum)||!Number.isInteger(e.maximum)||!Number.isInteger(e.step))throw new Error("Scale minimum, maximum and step must be whole numbers.");if(!Array.isArray(e.items)||e.items.length<1||e.items.length>f)throw new Error(`Add between 1 and ${f} questionnaire items.`);const t=d(e.name,"Questionnaire name"),n=d(e.shortName,"Short name"),i=X(n||t);if(!i)throw new Error("Questionnaire name must contain at least one Latin letter or number for its stable ID.");const l=e.items.map((u,p)=>{const I=d(u.prompt,`Item ${p+1} question`),b=u.simpleExplanation.trim().replace(/\s+/g," ");return{id:`item-${String(p+1).padStart(2,"0")}`,name:d(u.name,`Item ${p+1} label`),prompt:I,...b?{simpleExplanation:b}:{},shortMeaning:K(I,b),lowAnchor:d(u.lowAnchor,`Item ${p+1} low endpoint`),highAnchor:d(u.highAnchor,`Item ${p+1} high endpoint`)}}),m=e.items.flatMap((u,p)=>u.reverseScored?[`item-${String(p+1).padStart(2,"0")}`]:[]),g=l.every(u=>u.simpleExplanation),$=e.aggregation==="mean"?e.minimum:e.minimum*l.length,N=e.aggregation==="mean"?e.maximum:e.maximum*l.length,q={schemaVersion:1,id:`custom-${i}`,version:d(e.version,"Questionnaire version"),name:t,shortName:n,description:d(e.description,"Questionnaire description"),introPrompt:d(e.introPrompt,"Participant instruction"),officialContentNotice:"This questionnaire definition was supplied by the study conductor. Its wording, use and interpretation must match the approved study protocol.",source:{label:d(e.sourceLabel,"Source or authorship label"),...e.sourceUrl.trim()?{url:e.sourceUrl.trim()}:{}},scale:{type:e.scaleType,minimum:e.minimum,maximum:e.maximum,step:e.step},items:l,scoring:{strategy:e.aggregation==="mean"?"mean-v1":"sum-v1",scoreName:d(e.scoreName,"Score name"),minimum:$,maximum:N,...m.length?{reverseItemIds:m}:{}},supports:{simplerExplanations:g,smileyLandmarks:!1}};return R(q)}function R(e){const t=D(e);if(Q(t.id))throw new Error("A custom questionnaire cannot replace a built-in questionnaire ID.");if(!t.id.startsWith("custom-"))throw new Error("A custom questionnaire ID must start with custom-.");if(t.scoring.strategy!=="mean-v1"&&t.scoring.strategy!=="sum-v1")throw new Error("A custom questionnaire must use the reviewed mean or sum scorer.");if(t.pairwise)throw new Error("Custom questionnaires do not support pairwise comparisons.");if(t.landmarks||t.supports.smileyLandmarks)throw new Error("Custom questionnaires do not support smiley landmarks.");const n=O(t);if(n>T)throw new Error(`The questionnaire definition is ${n} bytes; the participant-link limit is ${T} bytes.`);return t}function ee(e){return`${e.id}-${e.version.replace(/[^A-Za-z0-9._-]+/g,"-")}.questionnaire.json`}var te=Object.defineProperty,ne=Object.getOwnPropertyDescriptor,a=(e,t,n,i)=>{for(var l=i>1?void 0:i?ne(t,n):t,m=e.length-1,g;m>=0;m--)(g=e[m])&&(l=(i?g(t,n,l):g(l))||l);return i&&l&&te(t,n,l),l};const ie=w.trim().split(/\r?\n/).filter(Boolean).length,h=A.match(/var bridgeBuild = '([^']+)'/)?.[1]??"unidentified";function se(e){const t=Array.isArray(e)?e:[e];return t.length>0&&t.some(n=>{if(!n||typeof n!="object")return!1;const i=n;return"study"in i&&"responses"in i&&"result"in i})}function ae(e){const t="PASTE_THE_GENERATED_PARTICIPANT_PAGE_URL_HERE";if(!e||e.includes(t))throw new Error("A generated participant URL is required for the Qualtrics question HTML.");const n=e.replace(/&/g,"&amp;").replace(/"/g,"&quot;");return Y.trim().replace(t,n)}function re(e){const t=e?["Questionnaire:","${e://Field/__js_AQP_INSTRUMENT_NAME}","","${e://Field/__js_AQP_SCORE_NAME}:","${e://Field/__js_AQP_PRIMARY_SCORE}"].join(`
`):"";return z.replace("{{OPTIONAL_SCORE_BLOCK}}",t).replace(/\n{3,}/g,`

`).trim()}let s=class extends k{constructor(){super(...arguments),this.instrumentId=M,this.customDefinition=null,this.customDraft=C(),this.customBuilderOpen=!1,this.studyId="",this.studyTitle="",this.taskLabel="",this.showScoreToParticipant=!1,this.showSimpleLanguage=!1,this.answerMode="standard",this.largeText=!1,this.audioGuidance=!1,this.recoveryEnabled=!0,this.participantAdjustmentPolicy="participant-choice",this.voiceInputAvailable=!0,this.gazeInputAvailable=!1,this.collectionMode="local",this.qualtricsSurveyUrl="",this.generatedConfig=null,this.participantUrl="",this.message="",this.errorMessage="",this.completedResults=[],this.selectInstrument=e=>{const t=e.currentTarget.value,n=this.availableDefinitions.find(i=>i.id===t)??null;n&&(this.instrumentId=t,n.supports.simplerExplanations||(this.showSimpleLanguage=!1),n.supports.smileyLandmarks||(this.answerMode="standard"),this.generatedConfig=null,this.participantUrl="",this.message=`${n.name} selected. Generate a new configuration before testing.`)},this.addCustomItem=()=>{this.customDraft.items.length>=f||(this.customDraft={...this.customDraft,items:[...this.customDraft.items,S({name:`Item ${this.customDraft.items.length+1}`})]})},this.useCustomDraft=()=>{this.errorMessage="";try{this.activateCustomDefinition(Z(this.customDraft))}catch(e){this.showError(e instanceof Error?e.message:"The custom questionnaire could not be validated.")}},this.importCustomDefinition=async e=>{const t=e.currentTarget,n=t.files?.[0];if(n){this.errorMessage="";try{const i=R(JSON.parse(await n.text()));this.activateCustomDefinition(i),this.message=`${i.name} ${i.version} imported, validated and selected.`}catch(i){this.showError(i instanceof Error?i.message:"The questionnaire definition file could not be read.")}finally{t.value=""}}},this.downloadCustomDefinition=()=>{this.customDefinition&&y(ee(this.customDefinition),JSON.stringify(this.customDefinition,null,2),"application/json")},this.resetCustomDraft=()=>{this.customDraft=C(),this.message="Custom questionnaire builder fields reset. The selected questionnaire is unchanged until you validate a new definition."},this.generateParticipantLink=()=>{this.errorMessage="";try{const e=L({instrumentId:this.instrumentId,...this.customDefinition?.id===this.instrumentId?{questionnaireDefinition:this.customDefinition}:{},studyId:this.studyId,studyTitle:this.studyTitle,taskLabel:this.taskLabel,showScoreToParticipant:this.showScoreToParticipant,support:this.currentSupportConfig(),collection:this.currentCollectionConfig()});this.useConfiguration(e),this.message="Participant link and configuration generated."}catch(e){this.showError(e instanceof Error?e.message:"The study configuration could not be generated.")}},this.copyParticipantLink=async()=>{this.participantUrl&&await this.copySetupAsset(this.participantUrl,"participant link")},this.copySetupAsset=async(e,t)=>{try{if(!navigator.clipboard?.writeText)throw new Error("Clipboard API unavailable.");await navigator.clipboard.writeText(e),this.message=`${t.charAt(0).toUpperCase()}${t.slice(1)} copied.`}catch{this.message=`Automatic copy was unavailable. Select and copy the ${t} from its text box.`}},this.downloadConfiguration=()=>{this.generatedConfig&&y(`${this.generatedConfig.studyId}-${this.generatedConfig.configId}.json`,JSON.stringify(this.generatedConfig,null,2),"application/json")},this.importConfiguration=async e=>{const t=e.currentTarget,n=t.files?.[0];if(n){this.errorMessage="";try{const i=JSON.parse(await n.text()),l=F(i);if(!l)throw se(i)?new Error("This is a completed result file, not a study configuration. Import the JSON downloaded from Configuration ready."):new Error("This is not a valid Version 0.8 study configuration or supported Version 0.7 configuration.");this.useConfiguration(l),this.message="Configuration imported and participant link regenerated."}catch(i){this.showError(i instanceof Error?i.message:"The configuration file could not be read.")}finally{t.value=""}}},this.refreshResults=()=>{this.completedResults=j()},this.exportResultsJson=()=>{this.completedResults.length&&y(`accessible-questionnaire-results-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(this.completedResults,null,2),"application/json")},this.exportResultsCsv=()=>{this.completedResults.length&&y(`accessible-questionnaire-results-${new Date().toISOString().slice(0,10)}.csv`,`\uFEFF${U(this.completedResults)}`,"text/csv")},this.eraseResults=()=>{window.confirm("Erase every completed questionnaire record stored by this site in this browser? Confirm only after checking the exported files.")&&(B(),this.refreshResults(),this.message="Local completed records erased.")}}connectedCallback(){super.connectedCallback(),this.refreshResults(),window.addEventListener("storage",this.refreshResults)}disconnectedCallback(){window.removeEventListener("storage",this.refreshResults),super.disconnectedCallback()}createRenderRoot(){return this}get definition(){return J(this.instrumentId,this.customDefinition??void 0)}get availableDefinitions(){return this.customDefinition?[...P,this.customDefinition]:P}render(){return o`
      <a class="skip-link" href="#conductor-main">Skip to study setup</a>
      <main class="app-shell conductor-shell" id="conductor-main">
        <header class="app-header">
          <p class="eyebrow">
            Study conductor · Version ${v} · Qualtrics package ${h}
          </p>
          <h1>Prepare an accessible questionnaire study</h1>
          <p class="subtitle">Create one configuration, give participants a prepared link, and export completed records.</p>
        </header>

        <aside class="boundary-note important-boundary" aria-labelledby="current-generator-heading">
          <h2 id="current-generator-heading">Current Qualtrics generator: ${h}</h2>
          <p>
            Every generated JavaScript block must contain
            <code>var bridgeBuild = '${h}';</code>. If it shows another value, that browser tab is
            running a stale conductor build. Close that tab and reopen the versioned
            <a href="study.html?package=${h}">Prepare a study page</a> before copying anything.
          </p>
        </aside>

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
            </div>`:c}
        <p class="sr-only" aria-live="polite">${this.message}</p>

        <section class="panel conductor-panel" aria-labelledby="study-details-heading">
          <h2 id="study-details-heading">1. Questionnaire and study details</h2>
          <p class="support-boundary">
            These fields identify the questionnaire configuration, not the participant. Give each participant a separate
            pseudonymous code such as P-001; they enter that code on the participant page.
          </p>
          <div class="form-grid">
            <label class="full-width">
              <strong>Questionnaire definition</strong>
              <span>
                Choose a versioned definition. Item wording, scale, workflow and scoring are loaded from that
                definition; accessibility supports are configured separately.
              </span>
              <select @change=${this.selectInstrument}>
                ${this.availableDefinitions.map(e=>o`<option
                    value=${e.id}
                    .selected=${e.id===this.instrumentId}
                  >
                    ${e.name} · ${e.version}${Q(e.id)?"":" · researcher supplied"}
                  </option>`)}
              </select>
            </label>
            <aside class="definition-summary full-width">
              <strong>${this.definition.shortName}</strong>
              <span>
                ${this.definition.items.length} items,
                ${_(this.definition).length}
                ${this.definition.scale.type.replace("-"," ")} response values,
                ${G(this.definition).length} comparisons,
                ${this.definition.scoring.scoreName}.
              </span>
              ${this.definition.source.url?o`<a href=${this.definition.source.url} target="_blank" rel="noopener">
                    Instrument source: ${this.definition.source.label}
                  </a>`:o`<span>Instrument source: ${this.definition.source.label}</span>`}
            </aside>
            <div class="full-width button-row compact">
              <button
                class="secondary-button"
                type="button"
                aria-expanded=${String(this.customBuilderOpen)}
                aria-controls="custom-questionnaire-builder"
                @click=${()=>{this.customBuilderOpen=!this.customBuilderOpen}}
              >
                ${this.customBuilderOpen?"Close custom questionnaire builder":"Add your own questionnaire"}
              </button>
              ${this.customDefinition?o`
                    <button
                      class="secondary-button"
                      type="button"
                      @click=${this.downloadCustomDefinition}
                    >
                      Download current questionnaire definition
                    </button>
                  `:c}
            </div>
            ${this.customBuilderOpen?this.renderCustomQuestionnaireBuilder():c}
            <label>
              <strong>Study ID</strong>
              <span>Internal label shared by records from one study or condition. Example: ACCESS-TECH-01. Do not use a participant name.</span>
              <input placeholder="ACCESS-TECH-01" autocomplete="off" spellcheck="false" .value=${this.studyId} maxlength="64" @input=${e=>{this.studyId=e.currentTarget.value}} />
            </label>
            <label>
              <strong>Study title</strong>
              <span>Participant-facing name of the study. Example: Route-planning interface study.</span>
              <input placeholder="Route-planning interface study" autocomplete="off" .value=${this.studyTitle} maxlength="120" @input=${e=>{this.studyTitle=e.currentTarget.value}} />
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
            These are starting settings. The selected definition keeps its declared items, values,
            workflow and allowlisted scoring rule unchanged.
          </p>
          <div class="config-grid">
            ${this.definition.supports.simplerExplanations?this.booleanOption("Show simpler explanations from the start",this.showSimpleLanguage,e=>{this.showSimpleLanguage=e}):o`<aside class="boundary-note">
                  <strong>Simpler item text is unavailable for ${this.definition.shortName}</strong>
                  <p>
                    This definition preserves the validated item statements without adding unvalidated rewording.
                  </p>
                </aside>`}
            ${this.booleanOption("Use large text from the start",this.largeText,e=>{this.largeText=e})}
            ${this.booleanOption("Use automatic spoken guidance from the start",this.audioGuidance,e=>{this.audioGuidance=e})}
            ${this.booleanOption("Save incomplete progress on this device",this.recoveryEnabled,e=>{this.recoveryEnabled=e})}
            ${this.booleanOption("Allow confirmed built-in voice answers",this.voiceInputAvailable,e=>{this.voiceInputAvailable=e})}
            ${this.booleanOption("Allow experimental webcam gaze input",this.gazeInputAvailable,e=>{this.gazeInputAvailable=e},"Default off because current gaze accuracy is recorded as Partial.")}
            ${this.booleanOption(`Show the ${this.definition.scoring.scoreName.toLowerCase()} to the participant`,this.showScoreToParticipant,e=>{this.showScoreToParticipant=e},"Default off for a study; the conductor receives the score in the export.")}
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
                  participant may change applicable optional support, and every change is exported separately from the scored answers.
                </small>
              </span>
            </label>
          </fieldset>

          ${this.definition.supports.smileyLandmarks?o`<fieldset class="answer-mode-control conductor-answer-mode">
                <legend>Starting rating presentation</legend>
                <label>
                  <input type="radio" name="conductor-answer-mode" value="standard" .checked=${this.answerMode==="standard"} @change=${()=>{this.answerMode="standard"}} />
                  <span>
                    <strong>Standard ${_(this.definition).length}-value scale</strong>
                    <small>Recommended default.</small>
                  </span>
                </label>
                <label>
                  <input type="radio" name="conductor-answer-mode" value="smiley" .checked=${this.answerMode==="smiley"} @change=${()=>{this.answerMode="smiley"}} />
                  <span><strong>Experimental smiley landmarks</strong><small>Use only when this presentation is part of the approved protocol.</small></span>
                </label>
              </fieldset>`:o`<p class="support-boundary">
                ${this.definition.shortName} uses its standard ${_(this.definition).length}-value
                response scale. Smiley landmarks are disabled because facial valence is not equivalent to agreement.
              </p>`}
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
              </p>`:c}
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
                  <div><dt>Questionnaire</dt><dd>${this.definition.name} · ${this.definition.version}</dd></div>
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
                  ${this.generatedConfig.collection.mode==="local"?o`<a class="secondary-button link-button" href=${this.participantUrl} target="_blank" rel="noopener">Open participant page</a>`:c}
                  <button class="secondary-button" type="button" @click=${this.downloadConfiguration}>Download configuration JSON</button>
                </div>
                ${this.generatedConfig.collection.mode==="qualtrics"?this.renderQualtricsSetup():c}
                <p class="support-boundary">
                  Save the JSON with the study protocol. Importing it later regenerates the same configuration ID and participant link.
                  The link contains settings only; it contains no participant name, email or answer.
                </p>
              </div>`:c}
        </section>

        <section class="panel conductor-panel" aria-labelledby="results-heading">
          <h2 id="results-heading">5. Results saved on this device</h2>
          <p><strong>${this.completedResults.length}</strong> completed record${this.completedResults.length===1?"":"s"} found in this browser.</p>
          ${this.completedResults.length?o`
                <div class="table-scroll">
                  <table>
                    <thead><tr><th>Study ID</th><th>Instrument</th><th>Participant code</th><th>Completed</th><th>Primary score</th></tr></thead>
                    <tbody>
                      ${this.completedResults.map(e=>o`<tr>
                        <td>${e.study.studyId}</td>
                        <td>${e.instrument.name}</td>
                        <td>${e.participantCode}</td>
                        <td>${e.timing.completedAt}</td>
                        <td>${e.result.scoreName}: ${e.result.primaryScore.toFixed(2)}</td>
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
            Version ${v} includes a Qualtrics parent bridge. The participant page sends a complete record only to the
            exact HTTPS origin stored by the conductor; Qualtrics writes the fields into the current response and returns a
            matching receipt before advancing. A failed save leaves the answers on Review for retry. Platform selection,
            consent, retention and access must still match the approved ethics and data-management documents.
          </p>
        </section>
      </main>
    `}renderCustomQuestionnaireBuilder(){return o`
      <section
        class="custom-questionnaire-builder full-width"
        id="custom-questionnaire-builder"
        aria-labelledby="custom-questionnaire-heading"
      >
        <h3 id="custom-questionnaire-heading">Add a researcher-supplied questionnaire</h3>
        <p>
          No code is required. This builder supports 1–${f}
          required single-choice items that share one whole-number response scale.
          It can calculate a reviewed mean or sum, including selected reverse-scored items.
        </p>
        <aside class="boundary-note important-boundary">
          <p>
            <strong>Check permission and measurement validity before use.</strong>
            The platform validates structure and calculation, but it cannot decide whether a
            questionnaire is licensed, validated for the study population, or suitable for the
            research question. Free text, branching, multiple answers, custom formulas and
            executable code are deliberately not accepted.
          </p>
        </aside>

        <div class="form-grid custom-definition-fields">
          <label>
            <strong>Questionnaire name</strong>
            <span>Full participant-facing name.</span>
            <input
              data-custom-field="name"
              maxlength="120"
              .value=${this.customDraft.name}
              @input=${e=>this.updateCustomDraft("name",e.currentTarget.value)}
            />
          </label>
          <label>
            <strong>Short name</strong>
            <span>Short label used in results, for example WAI.</span>
            <input
              data-custom-field="short-name"
              maxlength="40"
              .value=${this.customDraft.shortName}
              @input=${e=>this.updateCustomDraft("shortName",e.currentTarget.value)}
            />
          </label>
          <label>
            <strong>Questionnaire version</strong>
            <span>Version of the wording and scoring definition.</span>
            <input
              data-custom-field="version"
              maxlength="40"
              .value=${this.customDraft.version}
              @input=${e=>this.updateCustomDraft("version",e.currentTarget.value)}
            />
          </label>
          <label>
            <strong>Source or authorship label</strong>
            <span>Primary source, author, or “Researcher-supplied questionnaire”.</span>
            <input
              data-custom-field="source-label"
              maxlength="240"
              .value=${this.customDraft.sourceLabel}
              @input=${e=>this.updateCustomDraft("sourceLabel",e.currentTarget.value)}
            />
          </label>
          <label class="full-width">
            <strong>Source URL (optional)</strong>
            <span>Use an HTTPS link to the primary instrument source when one is available.</span>
            <input
              data-custom-field="source-url"
              type="url"
              inputmode="url"
              maxlength="500"
              placeholder="https://example.org/questionnaire"
              .value=${this.customDraft.sourceUrl}
              @input=${e=>this.updateCustomDraft("sourceUrl",e.currentTarget.value)}
            />
          </label>
          <label class="full-width">
            <strong>Description</strong>
            <span>Short explanation shown under the questionnaire title.</span>
            <textarea
              data-custom-field="description"
              rows="3"
              maxlength="400"
              .value=${this.customDraft.description}
              @input=${e=>this.updateCustomDraft("description",e.currentTarget.value)}
            ></textarea>
          </label>
          <label class="full-width">
            <strong>Participant instruction</strong>
            <span>What participants should think about before answering.</span>
            <textarea
              data-custom-field="intro-prompt"
              rows="3"
              maxlength="400"
              .value=${this.customDraft.introPrompt}
              @input=${e=>this.updateCustomDraft("introPrompt",e.currentTarget.value)}
            ></textarea>
          </label>
          <label>
            <strong>Scale type</strong>
            <span>Controls how the shared response scale is described.</span>
            <select
              data-custom-field="scale-type"
              .value=${this.customDraft.scaleType}
              @change=${e=>this.updateCustomDraft("scaleType",e.currentTarget.value)}
            >
              <option value="agreement">Agreement</option>
              <option value="magnitude">Magnitude</option>
              <option value="semantic-differential">Semantic differential</option>
            </select>
          </label>
          <label>
            <strong>Score calculation</strong>
            <span>Mean keeps the scale range; sum adds adjusted item values.</span>
            <select
              data-custom-field="aggregation"
              .value=${this.customDraft.aggregation}
              @change=${e=>this.updateCustomDraft("aggregation",e.currentTarget.value)}
            >
              <option value="mean">Mean of item values</option>
              <option value="sum">Sum of item values</option>
            </select>
          </label>
          <label>
            <strong>Minimum response value</strong>
            <span>Whole number from 0 to 99.</span>
            <input
              data-custom-field="minimum"
              type="number"
              min="0"
              max="99"
              step="1"
              .value=${String(this.customDraft.minimum)}
              @input=${e=>this.updateCustomDraft("minimum",e.currentTarget.valueAsNumber)}
            />
          </label>
          <label>
            <strong>Maximum response value</strong>
            <span>Whole number up to 100.</span>
            <input
              data-custom-field="maximum"
              type="number"
              min="1"
              max="100"
              step="1"
              .value=${String(this.customDraft.maximum)}
              @input=${e=>this.updateCustomDraft("maximum",e.currentTarget.valueAsNumber)}
            />
          </label>
          <label>
            <strong>Response step</strong>
            <span>The range must divide exactly by this positive whole number.</span>
            <input
              data-custom-field="step"
              type="number"
              min="1"
              max="100"
              step="1"
              .value=${String(this.customDraft.step)}
              @input=${e=>this.updateCustomDraft("step",e.currentTarget.valueAsNumber)}
            />
          </label>
          <label>
            <strong>Score name</strong>
            <span>Label used on review, result and export pages.</span>
            <input
              data-custom-field="score-name"
              maxlength="120"
              .value=${this.customDraft.scoreName}
              @input=${e=>this.updateCustomDraft("scoreName",e.currentTarget.value)}
            />
          </label>
        </div>

        <fieldset class="custom-items">
          <legend>Questionnaire items</legend>
          <p>
            Each item uses the shared numeric range but may have different visible endpoint labels.
            A reverse-scored response is transformed as minimum + maximum − response before the
            mean or sum is calculated.
          </p>
          ${this.customDraft.items.map((e,t)=>this.renderCustomQuestionnaireItem(e,t))}
          <button
            class="secondary-button"
            type="button"
            ?disabled=${this.customDraft.items.length>=f}
            @click=${this.addCustomItem}
          >
            Add another item
          </button>
        </fieldset>

        <div class="button-row compact">
          <button
            class="primary-button"
            type="button"
            @click=${this.useCustomDraft}
          >
            Validate and use this questionnaire
          </button>
          <label class="secondary-button file-button">
            Import questionnaire definition JSON
            <input
              class="sr-only"
              data-custom-definition-import
              type="file"
              accept=".json,application/json"
              @change=${this.importCustomDefinition}
            />
          </label>
          <button
            class="secondary-button"
            type="button"
            @click=${this.resetCustomDraft}
          >
            Reset builder fields
          </button>
        </div>
        <p class="support-boundary">
          After validation, the full definition is embedded in the configuration and participant
          link. Download its JSON for the study protocol. Importing that definition or a saved
          configuration reproduces the same items, scale and scoring rule without changing source code.
        </p>
      </section>
    `}renderCustomQuestionnaireItem(e,t){return o`
      <section class="custom-item-editor" aria-labelledby=${`custom-item-${t+1}-heading`}>
        <div class="custom-item-heading">
          <h4 id=${`custom-item-${t+1}-heading`}>Item ${t+1}</h4>
          <button
            class="secondary-button"
            type="button"
            ?disabled=${this.customDraft.items.length===1}
            aria-label=${`Remove item ${t+1}`}
            @click=${()=>this.removeCustomItem(t)}
          >
            Remove item
          </button>
        </div>
        <div class="form-grid">
          <label>
            <strong>Item label</strong>
            <span>Short name shown on review and export.</span>
            <input
              data-custom-item=${t}
              data-custom-item-field="name"
              maxlength="120"
              .value=${e.name}
              @input=${n=>this.updateCustomItem(t,"name",n.currentTarget.value)}
            />
          </label>
          <label class="custom-reverse-option">
            <input
              data-custom-item=${t}
              data-custom-item-field="reverse-scored"
              type="checkbox"
              .checked=${e.reverseScored}
              @change=${n=>this.updateCustomItem(t,"reverseScored",n.currentTarget.checked)}
            />
            <span>
              <strong>Reverse this item for scoring</strong>
              <small>The displayed and stored answer is unchanged; only score calculation is reversed.</small>
            </span>
          </label>
          <label class="full-width">
            <strong>Question or statement</strong>
            <textarea
              data-custom-item=${t}
              data-custom-item-field="prompt"
              rows="3"
              maxlength="1000"
              .value=${e.prompt}
              @input=${n=>this.updateCustomItem(t,"prompt",n.currentTarget.value)}
            ></textarea>
          </label>
          <label>
            <strong>Low endpoint label</strong>
            <input
              data-custom-item=${t}
              data-custom-item-field="low-anchor"
              maxlength="80"
              .value=${e.lowAnchor}
              @input=${n=>this.updateCustomItem(t,"lowAnchor",n.currentTarget.value)}
            />
          </label>
          <label>
            <strong>High endpoint label</strong>
            <input
              data-custom-item=${t}
              data-custom-item-field="high-anchor"
              maxlength="80"
              .value=${e.highAnchor}
              @input=${n=>this.updateCustomItem(t,"highAnchor",n.currentTarget.value)}
            />
          </label>
          <label class="full-width">
            <strong>Simpler explanation (optional)</strong>
            <span>
              This support is offered only when every item has an explanation. Do not paraphrase a
              validated instrument without evidence and approval.
            </span>
            <textarea
              data-custom-item=${t}
              data-custom-item-field="simple-explanation"
              rows="2"
              maxlength="1000"
              .value=${e.simpleExplanation}
              @input=${n=>this.updateCustomItem(t,"simpleExplanation",n.currentTarget.value)}
            ></textarea>
          </label>
        </div>
      </section>
    `}updateCustomDraft(e,t){this.customDraft={...this.customDraft,[e]:t}}updateCustomItem(e,t,n){this.customDraft={...this.customDraft,items:this.customDraft.items.map((i,l)=>l===e?{...i,[t]:n}:i)}}removeCustomItem(e){this.customDraft.items.length!==1&&(this.customDraft={...this.customDraft,items:this.customDraft.items.filter((t,n)=>n!==e)})}activateCustomDefinition(e){this.customDefinition=e,this.instrumentId=e.id,e.supports.simplerExplanations||(this.showSimpleLanguage=!1),this.answerMode="standard",this.generatedConfig=null,this.participantUrl="",this.message=`${e.name} ${e.version} validated and selected. Complete the study details, then generate a new configuration.`}booleanOption(e,t,n,i=""){return o`<label class="toggle-card conductor-toggle">
      <input type="checkbox" .checked=${t} @change=${l=>n(l.currentTarget.checked)} />
      <span><strong>${e}</strong>${i?o`<small>${i}</small>`:c}</span>
    </label>`}currentSupportConfig(){return{showSimpleLanguage:this.definition.supports.simplerExplanations&&this.showSimpleLanguage,answerMode:this.definition.supports.smileyLandmarks?this.answerMode:"standard",largeText:this.largeText,audioGuidance:this.audioGuidance,recoveryEnabled:this.recoveryEnabled,participantAdjustmentPolicy:this.participantAdjustmentPolicy,voiceInputAvailable:this.voiceInputAvailable,gazeInputAvailable:this.gazeInputAvailable}}currentCollectionConfig(){if(this.collectionMode==="local")return{mode:"local"};const e=H(this.qualtricsSurveyUrl);if(!e)throw new Error("Enter a valid HTTPS Qualtrics survey or preview URL for central collection.");if(e===window.location.origin)throw new Error("The Qualtrics origin must be different from this GitHub Pages website.");return{mode:"qualtrics",parentOrigin:e}}useConfiguration(e){e.questionnaireDefinition&&(this.customDefinition=e.questionnaireDefinition),this.generatedConfig=e,this.instrumentId=e.instrumentId,this.studyId=e.studyId,this.studyTitle=e.studyTitle,this.taskLabel=e.taskLabel,this.showScoreToParticipant=e.showScoreToParticipant,this.showSimpleLanguage=e.support.showSimpleLanguage,this.answerMode=e.support.answerMode,this.largeText=e.support.largeText,this.audioGuidance=e.support.audioGuidance,this.recoveryEnabled=e.support.recoveryEnabled,this.participantAdjustmentPolicy=e.support.participantAdjustmentPolicy,this.voiceInputAvailable=e.support.voiceInputAvailable,this.gazeInputAvailable=e.support.gazeInputAvailable,this.collectionMode=e.collection.mode,this.qualtricsSurveyUrl=e.collection.mode==="qualtrics"?e.collection.parentOrigin:"",this.participantUrl=W(new URL("index.html",window.location.href).toString(),e)}qualtricsIframeHtml(){return!this.generatedConfig||this.generatedConfig.collection.mode!=="qualtrics"?"":ae(this.participantUrl)}renderQualtricsSetup(){const e=this.qualtricsIframeHtml(),t=re(this.generatedConfig?.showScoreToParticipant===!0);return o`
      <div class="qualtrics-setup" role="region" aria-labelledby="qualtrics-setup-heading">
        <h3 id="qualtrics-setup-heading">Qualtrics installation package for this configuration</h3>
        <p>
          <strong>Selected questionnaire:</strong> ${this.definition.name}
          (${this.definition.version}).
          The generated HTML contains this configuration and questionnaire ID. The JavaScript and Embedded Data
          manifest are intentionally shared by every registered questionnaire.
        </p>
        <p>
          <strong>Installation fingerprint:</strong>
          platform ${v}; Qualtrics bridge ${h}.
          Replace both the complete HTML and complete JavaScript together whenever this fingerprint changes.
        </p>
        <aside class="boundary-note important-boundary">
          <p>
            <strong>Do not upload these repository files to Qualtrics and do not paste the static HTML template unchanged.</strong>
            The first three blocks below are the required installation inputs. Only the first block contains this
            study's generated participant URL. The fourth block is optional plain text for Qualtrics' final page;
            it is not code and does not affect whether a response is saved.
          </p>
        </aside>
        <aside class="boundary-note">
          <p>
            <strong>Version 0.7 records have not been deleted.</strong>
            They remain in the existing <code>__js_ANTLX_*</code> columns. Version 0.8 writes new records to the
            questionnaire-independent <code>__js_AQP_*</code> columns and does not rewrite old rows. Keep the old
            fields until those rows have been exported and verified. Use a copied synthetic survey for the first
            Version 0.8 installation test.
          </p>
        </aside>
        <aside class="boundary-note important-boundary">
          <p>
            <strong>A rendered iframe is not a data-collection pass.</strong>
            In Preview, the status above the questionnaire must name bridge
            ${h} and say that diagnostic fields were staged. Then complete one
            <em>new</em> synthetic response and confirm that its newly dated row contains
            <code>__js_AQP_ACCEPTED = 1</code>, <code>__js_AQP_SCHEMA = 4</code> and the selected
            instrument ID. Rows collected before these fields were installed remain blank and are
            not a valid test of this package.
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
              Before the questionnaire block, add one Embedded Data element. Add every non-empty line below as a separate
              field name, including the <code>__js_</code> prefix, and leave each value unset. This list does not go
              into the question body.
            </p>
            <label for="qualtrics-embedded-fields">
              <strong>${ie} Embedded Data field names</strong>
            </label>
            <textarea
              id="qualtrics-embedded-fields"
              data-qualtrics-asset="embedded-data"
              readonly
              rows="10"
              .value=${w.trim()}
            ></textarea>
            <button
              class="secondary-button"
              type="button"
              @click=${()=>this.copySetupAsset(w.trim(),"Embedded Data field list")}
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
              .value=${A.trim()}
            ></textarea>
            <button
              class="secondary-button"
              type="button"
              @click=${()=>this.copySetupAsset(A.trim(),"question JavaScript")}
            >
              Copy complete question JavaScript
            </button>
          </li>
          <li>
            <h4>Optional: End of Survey plain-text message</h4>
            <p>
              This step is not required for data collection. Qualtrics' default End of Survey page is acceptable.
              To provide a clearer final confirmation, create or select a custom message and paste this as ordinary
              text. Do not add HTML, JavaScript or a redirect. If you selected Show score to participant, use this
              message if you want the score to remain visible after the automatic transition.
            </p>
            <label for="qualtrics-end-message"><strong>Optional End of Survey message</strong></label>
            <textarea
              id="qualtrics-end-message"
              data-qualtrics-asset="end-message"
              readonly
              rows="8"
              .value=${t}
            ></textarea>
            <button
              class="secondary-button"
              type="button"
              @click=${()=>this.copySetupAsset(t,"End of Survey message")}
            >
              Copy End of Survey message
            </button>
          </li>
        </ol>
        <p class="support-boundary">
          The Qualtrics editing canvas may show piped-text tokens such as
          <code>\${e://Field/__js_AQP_PARTICIPANT_CODE}</code>. That canvas is not the participant test. In Preview,
          before a response is recorded, the summary must be hidden and the configured participant iframe must be
          visible. If it is not, clear the question body and repeat step 1 in HTML or source view.
        </p>
        <p class="support-boundary">
          In Preview, the participant application must fill the browser viewport and expose one visible
          vertical scrollbar at the browser edge. A narrow inner panel, clipped content or two visible
          scrollbars means that the HTML and JavaScript are not both from this installation fingerprint;
          do not collect data from that survey.
        </p>
        <p class="support-boundary">
          After replacing the three required inputs, and after any optional message change, select
          <strong>Review and Publish</strong>. Preview one new synthetic response after publishing. Draft changes
          do not update an already active distribution link, and older recorded rows are not backfilled with new
          <code>__js_AQP_*</code> values.
        </p>
        <p>
          <a href="docs/QUALTRICS-INTEGRATION.md">Open the full Qualtrics setup and adverse-test guide</a>
        </p>
      </div>
    `}showError(e){this.errorMessage=e,this.updateComplete.then(()=>{const t=this.querySelector("#conductor-error");t&&V(t)})}};a([r()],s.prototype,"instrumentId",2);a([r()],s.prototype,"customDefinition",2);a([r()],s.prototype,"customDraft",2);a([r()],s.prototype,"customBuilderOpen",2);a([r()],s.prototype,"studyId",2);a([r()],s.prototype,"studyTitle",2);a([r()],s.prototype,"taskLabel",2);a([r()],s.prototype,"showScoreToParticipant",2);a([r()],s.prototype,"showSimpleLanguage",2);a([r()],s.prototype,"answerMode",2);a([r()],s.prototype,"largeText",2);a([r()],s.prototype,"audioGuidance",2);a([r()],s.prototype,"recoveryEnabled",2);a([r()],s.prototype,"participantAdjustmentPolicy",2);a([r()],s.prototype,"voiceInputAvailable",2);a([r()],s.prototype,"gazeInputAvailable",2);a([r()],s.prototype,"collectionMode",2);a([r()],s.prototype,"qualtricsSurveyUrl",2);a([r()],s.prototype,"generatedConfig",2);a([r()],s.prototype,"participantUrl",2);a([r()],s.prototype,"message",2);a([r()],s.prototype,"errorMessage",2);a([r()],s.prototype,"completedResults",2);s=a([x("study-conductor-app")],s);
