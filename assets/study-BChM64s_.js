import{w as Ke,g as Fe,x as et,M as Ee,a as g,t as tt,i as nt,D as it,m as ce,y as rt,z as st,u as ot,o as at,B as lt,h as ut,C as Pe,P as fe,A as Q,l as m,k as ge,j as ct,E as dt,F as pt,f as Re}from"./shared-BRA3mK6s.js";const ve=`__js_AQP_ACCEPTED
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
`,mt=`Questionnaire complete

{{OPTIONAL_SCORE_BLOCK}}

Your questionnaire responses have been recorded successfully.

Any accessibility-support choices and input-route information have been saved separately from the questionnaire score.

No further action is required.
You may now close this page.
`,be=`/*
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
`,ht=`<!--
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
`,B=20;let xe=0;function pe(e={}){return xe+=1,{key:`custom-item-${xe}`,name:"",prompt:"",lowAnchor:"",highAnchor:"",simpleExplanation:"",reverseScored:!1,...e}}function Ne(){return{name:"",shortName:"",version:"1.0.0",description:"A researcher-supplied questionnaire.",introPrompt:"Answer each item about the task that you have just completed.",sourceLabel:"Researcher-supplied questionnaire",sourceUrl:"",scaleType:"agreement",minimum:1,maximum:5,step:1,scoreName:"Questionnaire score",aggregation:"mean",items:[pe({name:"Item 1"}),pe({name:"Item 2"})]}}function x(e,t){const n=e.trim().replace(/\s+/g," ");if(!n)throw new Error(`${t} is required.`);return n}function ft(e){return e.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,50)}function gt(e,t){const n=t.trim()||e.trim();return n.length<=240?n:`${n.slice(0,237).trimEnd()}...`}function Le(e){if(!Number.isInteger(e.minimum)||!Number.isInteger(e.maximum)||!Number.isInteger(e.step))throw new Error("Scale minimum, maximum and step must be whole numbers.");if(!Array.isArray(e.items)||e.items.length<1||e.items.length>B)throw new Error(`Add between 1 and ${B} questionnaire items.`);const t=x(e.name,"Questionnaire name"),n=x(e.shortName,"Short name"),i=ft(n||t);if(!i)throw new Error("Questionnaire name must contain at least one Latin letter or number for its stable ID.");const r=e.items.map((p,c)=>{const S=x(p.prompt,`Item ${c+1} question`),u=p.simpleExplanation.trim().replace(/\s+/g," ");return{id:`item-${String(c+1).padStart(2,"0")}`,name:x(p.name,`Item ${c+1} label`),prompt:S,...u?{simpleExplanation:u}:{},shortMeaning:gt(S,u),lowAnchor:x(p.lowAnchor,`Item ${c+1} low endpoint`),highAnchor:x(p.highAnchor,`Item ${c+1} high endpoint`),...p.responseLabels?{responseLabels:p.responseLabels}:{}}}),s=e.items.flatMap((p,c)=>p.reverseScored?[`item-${String(c+1).padStart(2,"0")}`]:[]),l=r.every(p=>p.simpleExplanation),d=e.aggregation==="mean"?e.minimum:e.minimum*r.length,v=e.aggregation==="mean"?e.maximum:e.maximum*r.length,a={schemaVersion:1,id:`custom-${i}`,version:x(e.version,"Questionnaire version"),name:t,shortName:n,description:x(e.description,"Questionnaire description"),introPrompt:x(e.introPrompt,"Participant instruction"),officialContentNotice:"This questionnaire definition was supplied by the study conductor. Its wording, use and interpretation must match the approved study protocol.",source:{label:x(e.sourceLabel,"Source or authorship label"),...e.sourceUrl.trim()?{url:e.sourceUrl.trim()}:{}},scale:{type:e.scaleType,minimum:e.minimum,maximum:e.maximum,step:e.step},items:r,scoring:{strategy:e.aggregation==="mean"?"mean-v1":"sum-v1",scoreName:x(e.scoreName,"Score name"),minimum:d,maximum:v,...s.length?{reverseItemIds:s}:{}},supports:{simplerExplanations:l,smileyLandmarks:!1}};return je(a)}function je(e){const t=Ke(e);if(Fe(t.id))throw new Error("A custom questionnaire cannot replace a built-in questionnaire ID.");if(!t.id.startsWith("custom-"))throw new Error("A custom questionnaire ID must start with custom-.");if(t.scoring.strategy!=="mean-v1"&&t.scoring.strategy!=="sum-v1")throw new Error("A custom questionnaire must use the reviewed mean or sum scorer.");if(t.pairwise)throw new Error("Custom questionnaires do not support pairwise comparisons.");if(t.landmarks||t.supports.smileyLandmarks)throw new Error("Custom questionnaires do not support smiley landmarks.");const n=et(t);if(n>Ee)throw new Error(`The questionnaire definition is ${n} bytes; the participant-link limit is ${Ee} bytes.`);return t}function yt(e){return`${e.id}-${e.version.replace(/[^A-Za-z0-9._-]+/g,"-")}.questionnaire.json`}const vt=2e6,_e=/<\s*(?:script|iframe|object|embed|style)\b|(?:href|src)\s*=\s*["']?\s*javascript:|\son[a-z]+\s*=/i,we=/<\s*(?:img|picture|video|audio|canvas|svg|math|form|input|button|select|textarea|table)\b/i,Se=/\$\{(?:e|q|lm|gr)?:?\/?\/|q:\/\/|\{(?:if|TOKEN|INSERTANS|[A-Za-z][A-Za-z0-9_.]*\.(?:NAOK|shown))\b/i;function C(e){return e&&typeof e=="object"&&!Array.isArray(e)?e:null}function T(e){return typeof e=="string"||typeof e=="number"?String(e):""}function q(e){return e.replace(/\s+/g," ").trim()}function I(e,t){e.confirmationCodes.has(t.code)||(e.confirmationCodes.add(t.code),e.confirmations.push(t))}function J(e,t,n,i){const r=T(e);if(!r.trim())return i.unsupported.push({code:"missing-visible-text",title:`${t} is empty`,detail:`${n} does not contain participant-visible text.`}),null;if(_e.test(r)||Se.test(r))return i.unsupported.push({code:"unsafe-dynamic-content",title:`${t} contains executable or dynamic content`,detail:`${n} contains script, an event handler, a JavaScript URL or survey-expression text. The importer does not execute or approximate it.`}),null;if(we.test(r))return i.unsupported.push({code:"unsupported-structured-content",title:`${t} contains media, a table or an interactive control`,detail:`${n} cannot be represented as one safe plain-text rating item without changing participant-visible content.`}),null;const l=new DOMParser().parseFromString(`<body>${r}</body>`,"text/html"),d=q(l.body.textContent??"");return d?((/<[^>]+>/.test(r)||d!==q(r))&&I(i,{code:"plain-text-normalisation",title:"Formatting was converted to plain text",detail:"Imported wording is rendered as safe plain text. Review it against the source export before use."}),d):(i.unsupported.push({code:"missing-visible-text",title:`${t} has no readable text`,detail:`${n} contains no participant-visible text after safe text extraction.`}),null)}function Z(e){const t=typeof e=="number"?e:Number(T(e).trim());return Number.isInteger(t)?t:null}function ie(e){if(e.length<2||e.some(n=>n<0||n>100)||new Set(e).size!==e.length)return!1;const t=e[1]-e[0];return t>0&&e.every((n,i)=>i===0||n-e[i-1]===t)}function Ue(e,t){if(!Array.isArray(e)||e.length!==Object.keys(t).length)return null;const n=e.map(String);return new Set(n).size===n.length&&n.every(i=>i in t)?n:null}function Ge(e,t,n,i){const r=C(e);return J(r?.Display,t,n,i)}function bt(e){return e.flatMap(n=>n.labels).map(n=>n.toLowerCase()).some(n=>n.includes("agree")||n.includes("disagree"))?"agreement":"semantic-differential"}function _t(e){const t=e.split(/\s+/).map(i=>i.replace(/[^A-Za-z0-9]/g,"")[0]??"").join("").slice(0,12);return t?t.toUpperCase():e.replace(/[^A-Za-z0-9]+/g,"").slice(0,12)||"IMPORTED"}function Be(e,t,n,i,r){if(!i.length)return r.unsupported.push({code:"no-supported-items",title:"No supported questionnaire items were found",detail:"This release needs at least one required, ordered single-choice rating item."}),null;if(i.length>B)return r.unsupported.push({code:"too-many-items",title:"The questionnaire has too many items for a participant link",detail:`${i.length} supported items were found; this release accepts at most ${B}.`}),null;const s=i[0].values;if(!ie(s))return r.unsupported.push({code:"unsupported-response-values",title:"Response values are not one increasing whole-number scale",detail:"Values must be unique whole numbers from 0 to 100 with one constant positive step."}),null;const l=s.join("|");return i.some(d=>d.values.join("|")!==l)?(r.unsupported.push({code:"mixed-response-scales",title:"Items use different response values",detail:"The current participant interface requires every imported item to share the same ordered numeric scale."}),null):(I(r,{code:"review-scoring",title:"Scoring and reverse scoring require confirmation",detail:"Answer recodes do not establish a questionnaire score. Choose reviewed mean or sum, then mark any reverse-scored items."}),I(r,{code:"review-scale-type",title:"The scale description requires confirmation",detail:"Confirm whether the imported scale should be described as agreement or semantic differential."}),{name:e.slice(0,120),shortName:_t(e),version:"1.0.0",description:`Questionnaire imported from ${t}.`,introPrompt:n.slice(0,400),sourceLabel:t,sourceUrl:"",scaleType:bt(i),minimum:s[0],maximum:s.at(-1),step:s[1]-s[0],scoreName:"Questionnaire score",aggregation:"mean",items:i.map(d=>pe({name:d.name.slice(0,120),prompt:d.prompt.slice(0,1e3),lowAnchor:d.labels[0].slice(0,80),highAnchor:d.labels.at(-1).slice(0,80),responseLabels:Object.fromEntries(d.values.map((v,a)=>[String(v),d.labels[a].slice(0,120)]))}))})}function ne(e){return{code:`item-${e.sourceId}`,title:`${e.name}: imported`,detail:`${e.sourceId}; “${e.prompt}”; ordered choices: `+e.values.map((t,n)=>`${t} = ${e.labels[n]}`).join("; ")}}function de(e,t,n,i,r,s,l={}){return{source:e,sourceName:t,fileName:n,title:i,draft:r,imported:s.imported,confirmations:s.confirmations,unsupported:s.unsupported,canConvert:!!r&&s.unsupported.length===0,...l}}function Je(){return{imported:[],confirmations:[],unsupported:[],confirmationCodes:new Set}}function De(e,t){const n=C(e);if(!n)throw new Error(t);return n}function wt(e,t){const n=e.find(u=>u.Element==="BL"),i=Array.isArray(n?.Payload)?n.Payload.map(C).filter(u=>!!u):[],r=i.filter(u=>u.Type!=="Trash"),s=new Set(i.filter(u=>u.Type==="Trash").flatMap(u=>Array.isArray(u.BlockElements)?u.BlockElements:[]).map(C).filter(u=>!!u).map(u=>T(u.QuestionID)).filter(Boolean));s.size&&I(t,{code:"qualtrics-trash-ignored",title:"Questions in the Qualtrics Trash block were ignored",detail:`${s.size} deleted question${s.size===1?"":"s"} will not appear in the converted questionnaire.`});const l=e.find(u=>u.Element==="FL"),d=C(l?.Payload),v=Array.isArray(d?.Flow)?d.Flow.map(C).filter(u=>!!u):[];if(r.length!==1||v.length!==1||v[0].Type!=="Block")return t.unsupported.push({code:"qualtrics-complex-flow",title:"Qualtrics flow is outside the supported single-block subset",detail:"Use one ordinary question block only. Branches, randomisers, embedded-data flow and multiple blocks are not removed or flattened."}),{order:[],trashQuestionIds:s};const a=T(v[0].ID),p=r.find(u=>T(u.ID)===a);if(!p)return t.unsupported.push({code:"qualtrics-missing-block",title:"The active Qualtrics block could not be resolved",detail:`Survey Flow references ${a||"an unknown block"}.`}),{order:[],trashQuestionIds:s};const c=Array.isArray(p.BlockElements)?p.BlockElements:[],S=[];for(const u of c){const E=C(u);if(!E||E.Type!=="Question"||!T(E.QuestionID)){t.unsupported.push({code:"qualtrics-non-question-block-item",title:"The Qualtrics block contains unsupported content",detail:"Only ordered question entries are supported in the imported block."});continue}(E.SkipLogic||E.DisplayLogic)&&t.unsupported.push({code:"qualtrics-question-logic",title:`${T(E.QuestionID)} uses question logic`,detail:"Skip and display logic are not imported."}),S.push(T(E.QuestionID))}return{order:S,trashQuestionIds:s}}function St(e){return["QuestionJS","JavaScript","DisplayLogic","SkipLogic","ChoiceDisplayLogic","CarryForward","Randomization","ChoiceRandomization"].some(t=>e[t]!==void 0&&e[t]!==null)}function ke(e,t,n,i,r){const s=C(e[t]);if(!s)return r.unsupported.push({code:"qualtrics-missing-scale",title:`${i} has no answer scale`,detail:`${t} must contain every visible answer option.`}),null;const l=Ue(e[n],s);if(!l)return r.unsupported.push({code:"qualtrics-unknown-answer-order",title:`${i} has no reliable answer order`,detail:`${n} must list every ${t.toLowerCase()} entry exactly once.`}),null;const d=C(e.RecodeValues);let v;if(d){const p=l.map(c=>Z(d[c]));if(p.some(c=>c===null))return r.unsupported.push({code:"qualtrics-nonnumeric-recodes",title:`${i} has missing or non-integer recode values`,detail:"Every visible option needs an explicit whole-number recode."}),null;v=p}else{if(!l.every((c,S)=>c===String(S+1)))return r.unsupported.push({code:"qualtrics-missing-scale",title:`${i} has no explicit recode table or default sequential choice IDs`,detail:"Without RecodeValues, ChoiceOrder must explicitly list the default IDs 1 through N. The importer will not infer values from other object keys."}),null;v=l.map((c,S)=>S+1),I(r,{code:"qualtrics-default-recodes",title:"Qualtrics default sequential recodes were used",detail:"The QSF omits RecodeValues and explicitly orders default choice IDs 1 through N. Confirm these values against the source survey before conversion."})}const a=l.map((p,c)=>Ge(s[p],`Answer ${c+1}`,`${i}/${p}`,r));return a.some(p=>p===null)?null:{values:v,labels:a}}function It(e,t){let n;try{n=JSON.parse(e)}catch{throw new Error("The Qualtrics QSF file is not valid JSON.")}const i=De(n,"The Qualtrics QSF root must be a JSON object."),r=De(i.SurveyEntry,"The file does not contain a Qualtrics SurveyEntry.");if(!Array.isArray(i.SurveyElements))throw new Error("The file does not contain Qualtrics SurveyElements.");const s=Je(),l=q(T(r.SurveyName))||"Imported Qualtrics questionnaire",d=i.SurveyElements.map(C).filter(y=>!!y),{order:v,trashQuestionIds:a}=wt(d,s),p=new Set(d.map(y=>T(y.Element)).filter(y=>y&&!["BL","FL","SQ"].includes(y)));p.size&&I(s,{code:"qualtrics-platform-settings-not-imported",title:"Qualtrics platform and presentation settings are not imported",detail:`The following non-question element types remain in Qualtrics only: ${[...p].sort().join(", ")}. Review the converted participant presentation.`});const c=new Map(d.filter(y=>y.Element==="SQ").map(y=>[T(y.PrimaryAttribute),C(y.Payload)]));if(v.length){const y=new Set(v);for(const _ of c.keys())!_||y.has(_)||a.has(_)||s.unsupported.push({code:"qualtrics-unreferenced-question",title:`${_} is outside the imported active block`,detail:"The importer will not silently omit an active question that is not represented by the supported single-block flow."})}const S=[];for(const y of v){const _=c.get(y);if(!_){s.unsupported.push({code:"qualtrics-missing-question",title:`${y} is missing`,detail:"The active block references a question that is not present in SurveyElements."});continue}if(St(_)){s.unsupported.push({code:"qualtrics-unsupported-behaviour",title:`${y} contains logic, randomisation or code`,detail:"The importer does not execute or remove question behaviour."});continue}const re=C(_.Validation);if(C(re?.Settings)?.ForceResponse!=="ON"){s.unsupported.push({code:"qualtrics-optional-question",title:`${y} is not a forced-response question`,detail:"The participant platform currently requires every imported item."});continue}const M=J(_.QuestionText,"Question text",y,s);if(!M)continue;const A=T(_.QuestionType),V=T(_.Selector),F=T(_.SubSelector),se=q(T(_.DataExportTag))||y;if(A==="MC"&&V==="SAVR"){const H=ke(_,"Choices","ChoiceOrder",y,s);if(!H)continue;const N={sourceId:y,name:se,prompt:M,...H};S.push(N),s.imported.push(ne(N));continue}if(A==="Matrix"&&V==="Likert"&&F==="SingleAnswer"){const H=ke(_,"Answers","AnswerOrder",y,s),N=C(_.Choices),D=N?Ue(_.ChoiceOrder,N):null;if(!H||!N||!D){D||s.unsupported.push({code:"qualtrics-unknown-row-order",title:`${y} has no reliable matrix row order`,detail:"ChoiceOrder must list every matrix row exactly once."});continue}I(s,{code:"qualtrics-matrix-expanded",title:"Single-answer matrix rows were expanded into items",detail:"Review each generated item against the original matrix before conversion."}),D.forEach((k,j)=>{const L=Ge(N[k],`Matrix row ${j+1}`,`${y}/${k}`,s);if(!L)return;const ee={sourceId:`${y}/${k}`,name:L,prompt:`${M} — ${L}`,...H};S.push(ee),s.imported.push(ne(ee))});continue}s.unsupported.push({code:"qualtrics-unsupported-question",title:`${y} uses an unsupported Qualtrics question type`,detail:`${A||"Unknown"} / ${V||"Unknown"} / ${F||"none"} is not converted. Supported: MC/SAVR and Matrix/Likert/SingleAnswer.`})}const E=(T(r.SurveyDescription).trim()?J(r.SurveyDescription,"Survey description","SurveyEntry",s):null)??"Answer each imported item about the task that you have just completed.",K=Be(l,"Imported from Qualtrics QSF",E,S,s);return de("qualtrics-qsf","Qualtrics QSF",t,l,K,s)}function P(e,t){const n=[...e.documentElement.children].find(r=>r.localName===t);if(!n)return[];const i=[...n.children].find(r=>r.localName==="rows");return i?[...i.children].filter(r=>r.localName==="row").map(r=>Object.fromEntries([...r.children].map(s=>[s.localName,s.textContent??""]))):[]}function G(e,t,n,i,r){return e.find(s=>s[t]===n&&(!s.language||s.language===r))?.[i]??""}const At={answer_width:["0"],answer_order:["normal"],array_filter_style:["0"],clear_default:["N"],dropdown_prefix:["0"],hidden:["0"],hide_tip:["0"],max_answers:["1"],min_answers:["1"],other_comment_mandatory:["0"],other_numbers_only:["0"],other_position:["default"],page_break:["0"],public_statistics:["0"],random_order:["0"],save_as_default:["N"],scale_export:["0"],slider_rating:["0"],statistics_graphtype:["0"],statistics_showgraph:["1"],time_limit_action:["1"],time_limit_disable_next:["0"],time_limit_disable_prev:["0"],use_dropdown:["0"]};function qt(e,t){if(!e.length)return;const n=e.filter(i=>{const r=i.attribute?.trim()??"",s=i.value?.trim()??"";return s?!At[r]?.includes(s):!1});if(n.length){const i=n.slice(0,6).map(r=>`${r.qid||"unknown question"}: ${r.attribute||"unknown"}=${r.value||""}`).join("; ");t.unsupported.push({code:"limesurvey-question-attributes",title:"The LimeSurvey export contains active or unknown question attributes",detail:`${i}${n.length>6?`; and ${n.length-6} more`:""}. These settings may change validation, randomisation, timing or presentation and are not discarded.`});return}I(t,{code:"limesurvey-default-question-attributes",title:"Default LimeSurvey question settings were not imported",detail:"Only empty or known default attributes were present; no active validation, randomisation or timing rule was found. Review the converted participant presentation."})}function Oe(e){if(!e.trim())return"";const n=new DOMParser().parseFromString(`<body>${e}</body>`,"text/html");return q(n.body.textContent??"")}function Ve(e){const t=e.map(r=>Z(r.sortorder));if(t.some(r=>r===null))return!1;const n=t;if(new Set(n).size!==n.length)return!1;const i=n[0];return(i===0||i===1)&&n.every((r,s)=>r===i+s)}function He(e){return e.every((t,n)=>t.code===`A${String(n+1).padStart(3,"0")}`)}function We(e,t){if(e.type==="5")return[1,2,3,4,5];if(e.type!=="F"&&e.type!=="L"&&e.type!=="!")return null;const n=t.filter(s=>s.qid===e.qid&&(!s.scale_id||s.scale_id==="0")).sort((s,l)=>(Number(s.sortorder)||0)-(Number(l.sortorder)||0));if(!Ve(n))return null;const i=n.map(s=>Z(s.code));if(i.every(s=>s!==null)&&ie(i))return i;const r=n.map(s=>Z(s.assessment_value));return r.every(s=>s!==null)&&ie(r)?r:He(n)?n.map((s,l)=>l+1):null}function Tt(e,t,n){const i=new Map;for(const r of e){if(r.mandatory!=="Y"||r.other&&r.other!=="N"||r.relevance&&r.relevance!=="1")continue;const s=We(r,n);if(!s)continue;const l=r.type==="F"?t.filter(a=>a.parent_qid===r.qid).length:1;if(l<1)continue;const d=s.join("|"),v=i.get(d)??{questions:[],values:s,itemCount:0};v.questions.push(r),v.itemCount+=l,i.set(d,v)}return[...i.entries()].map(([r,s])=>({id:`values-${r.replace(/\|/g,"-")}`,name:s.questions.map(l=>l.title||l.qid).join(" + "),sourceQuestionCount:s.questions.length,itemCount:s.itemCount,responseValues:s.values,questionTypes:[...new Set(s.questions.map(l=>l.type||"unknown"))]}))}function Me(e,t,n,i,r){const s=e.qid||e.title||"unknown-question",l=t.filter(c=>c.qid===e.qid&&(!c.scale_id||c.scale_id==="0")).sort((c,S)=>(Number(c.sortorder)||0)-(Number(S.sortorder)||0));if(!Ve(l))return r.unsupported.push({code:"limesurvey-answer-order",title:`${e.title||s} has no reliable answer order`,detail:"Every answer needs one unique consecutive sort order starting at 0 or 1."}),null;const d=l.map(c=>Z(c.code)),v=l.map(c=>Z(c.assessment_value));let a;if(d.every(c=>c!==null)&&ie(d))a=d;else if(v.every(c=>c!==null)&&ie(v))a=v,I(r,{code:"limesurvey-assessment-values",title:"LimeSurvey assessment values were used as response values",detail:"Verify every imported value against the LimeSurvey answer table."});else if(He(l))a=l.map((c,S)=>S+1),I(r,{code:"limesurvey-positional-values",title:"LimeSurvey default answer codes were converted to ordered positions",detail:"The source uses A001 through A00N rather than numeric scores. The converted scale uses positions 1 through N. Confirm the intended values and scoring before conversion."});else return r.unsupported.push({code:"limesurvey-unsupported-values",title:`${e.title||s} has no safe increasing numeric recode`,detail:"Answer codes or assessment values must form one increasing whole-number scale with a constant step."}),null;const p=l.map((c,S)=>{const u=G(n,"aid",c.aid,"answer",i)||c.answer;return q(u??"")?J(u,`Answer ${S+1}`,`${e.title||s}/${c.code}`,r):(I(r,{code:"limesurvey-blank-scale-labels",title:"Blank scale positions will be shown as their numeric values",detail:"LimeSurvey leaves one or more intermediate labels blank. The converted questionnaire shows the reviewed numeric response value at those positions."}),String(a[S]))});return p.some(c=>!c)?null:{values:a,labels:p}}function $t(e,t,n,i){if(/<!DOCTYPE|<!ENTITY|<\?xml-stylesheet/i.test(e))throw new Error("The LimeSurvey file contains a DTD, entity or stylesheet declaration and was not parsed.");const s=new DOMParser().parseFromString(e,"application/xml");if(s.querySelector("parsererror"))throw new Error("The LimeSurvey file is not valid XML.");const l=s.querySelector("LimeSurveyDocType")?.textContent?.trim();if(l!=="Survey"&&l!=="Group")throw new Error("The XML file is not a LimeSurvey survey or question-group export.");const d=l==="Group"?"limesurvey-lsg":"limesurvey-lss",v=l==="Group"?"LimeSurvey LSG":"LimeSurvey LSS",a=Je(),p=[...s.querySelectorAll("languages > language")].map(o=>o.textContent?.trim()??"").filter(Boolean),c=P(s,"surveys"),u=q(c[0]?.language??"")||p[0]||"";!u||p.length&&!p.includes(u)?a.unsupported.push({code:"limesurvey-base-language",title:"The LimeSurvey base language could not be resolved",detail:"The survey language must match one language declared in the LSS export."}):p.length>1&&I(a,{code:"limesurvey-base-language-only",title:`Only the LimeSurvey base language (${u}) will be imported`,detail:`Additional languages (${p.filter(o=>o!==u).join(", ")}) remain in LimeSurvey and are not included in the converted definition. Confirm the intended participant language.`});const E=P(s,"surveys_languagesettings"),K=E.find(o=>!o.surveyls_language||o.surveyls_language===u)??E[0],y=q(K?.surveyls_title??"")||"Imported LimeSurvey questionnaire",_=P(s,"groups"),re=P(s,"group_l10ns"),me=P(s,"questions");if(!_.length)throw new Error("The LimeSurvey export contains no questionnaire group.");const M=_.slice().sort((o,b)=>(Number(o.group_order)||0)-(Number(b.group_order)||0)).map(o=>{const b=re.find($=>$.gid===o.gid&&(!$.language||$.language===u)),te=me.filter($=>$.gid===o.gid&&(!$.parent_qid||$.parent_qid==="0"));return{id:o.gid,name:q(b?.group_name??o.group_name??"")||`Group ${o.gid}`,questionCount:te.length,questionTypes:[...new Set(te.map($=>$.type||"unknown"))]}});if(l==="Survey"&&_.length>1&&!n)return de(d,v,t,y,null,a,{requiresGroupSelection:!0,groupOptions:M});const A=n?_.find(o=>o.gid===n):_[0];if(!A)throw new Error("Choose a questionnaire group contained in this LimeSurvey export.");const V=re.find(o=>o.gid===A.gid&&(!o.language||o.language===u)),F=q(V?.group_name??A.group_name??"")||`Group ${A.gid}`,se=me.filter(o=>o.gid===A.gid),N=P(s,"subquestions").filter(o=>o.gid===A.gid||se.some(b=>b.qid===o.parent_qid)),D=se.filter(o=>!o.parent_qid||o.parent_qid==="0").sort((o,b)=>(Number(o.question_order)||0)-(Number(b.question_order)||0)),k=P(s,"answers"),j=Tt(D,N,k);if(l==="Survey"&&_.length>1&&I(a,{code:"limesurvey-selected-group-only",title:`Only “${F}” will be converted`,detail:`${_.length-1} other survey group${_.length===2?"":"s"} will remain outside the converted questionnaire. The researcher selected this group explicitly; no other group is silently flattened or removed.`}),A.grelevance&&A.grelevance!=="1"&&I(a,{code:"limesurvey-group-relevance-not-retained",title:"The source group display condition will not be retained",detail:`The LimeSurvey group condition is “${q(A.grelevance)}”. The converted questionnaire runs this selected group as a standalone instrument. Confirm that this is intended.`}),q(A.randomization_group??"")&&I(a,{code:"limesurvey-group-randomisation-not-retained",title:"The source group randomisation setting will not be retained",detail:"The converted questionnaire uses the reviewed exported question order. Confirm that a fixed order is suitable."}),j.length>1&&!i)return de(d,v,t,F,null,a,{groupOptions:M,selectedGroupId:A.gid,requiresRatingSetSelection:!0,ratingSetOptions:j});const L=i?j.find(o=>o.id===i):j[0];if(i&&!L)throw new Error("Choose a rating set contained in the selected LimeSurvey group.");const ee=L?.responseValues.join("|"),he=ee?D.filter(o=>We(o,k)?.join("|")===ee&&o.mandatory==="Y"&&(!o.other||o.other==="N")&&(!o.relevance||o.relevance==="1")):D,Ie=new Set(he.map(o=>o.qid)),Ae=N.filter(o=>Ie.has(o.parent_qid)),oe=new Set(he.map(o=>o.qid));for(const o of Ae)oe.add(o.qid);const ae=D.filter(o=>!Ie.has(o.qid));L&&ae.length&&I(a,{code:"limesurvey-selected-rating-set-only",title:`Only the ${L.responseValues[0]}–${L.responseValues.at(-1)} rating set will be converted`,detail:`${ae.length} other source question${ae.length===1?"":"s"} (${ae.map(o=>`${o.title||o.qid} [type ${o.type||"unknown"}]`).join(", ")}) will remain in LimeSurvey. They are listed here rather than silently removed or mixed into an invalid score.`}),P(s,"conditions").filter(o=>oe.has(o.qid)||oe.has(o.cqid)).length&&a.unsupported.push({code:"limesurvey-conditions",title:"The selected LimeSurvey group contains question conditions",detail:"Branching and conditional relevance are not imported."});for(const[o,b]of[["assessments","assessment rules"],["defaultvalues","default answers"],["quotas","quota rules"],["quota_members","quota membership rules"],["quota_languages","localised quota messages"]])P(s,o).length&&a.unsupported.push({code:`limesurvey-${o.replace(/_/g,"-")}`,title:`The LimeSurvey export contains ${b}`,detail:`${b[0].toUpperCase()}${b.slice(1)} are not executed or silently discarded.`});qt(P(s,"question_attributes").filter(o=>oe.has(o.qid)),a);const W=P(s,"question_l10ns"),qe=P(s,"answer_l10ns"),O=[];I(a,{code:"limesurvey-platform-settings-not-imported",title:"LimeSurvey platform and presentation settings are not imported",detail:"Theme, navigation, notification and publication settings remain in LimeSurvey. Review the converted participant presentation."});for(const o of he){const b=o.qid||o.title||"unknown-question";if(o.mandatory!=="Y"){a.unsupported.push({code:"limesurvey-optional-question",title:`${o.title||b} is not mandatory`,detail:"The participant platform currently requires every imported item."});continue}if(o.other&&o.other!=="N"){a.unsupported.push({code:"limesurvey-other-answer",title:`${o.title||b} allows an “Other” answer`,detail:"Free-text “Other” responses are not imported."});continue}if(o.relevance&&o.relevance!=="1"){a.unsupported.push({code:"limesurvey-question-relevance",title:`${o.title||b} uses relevance logic`,detail:"Conditional questions are not imported."});continue}const te=G(W,"qid",o.qid,"question",u)||o.question,$=G(W,"qid",o.qid,"help",u)||o.help,Xe=G(W,"qid",o.qid,"script",u)||o.script;if(q(Xe||"")){a.unsupported.push({code:"limesurvey-question-script",title:`${o.title||b} contains a question script`,detail:"Imported scripts are never executed or silently removed."});continue}if(_e.test($||"")||Se.test($||"")||we.test($||"")){a.unsupported.push({code:"limesurvey-question-help-structure",title:`${o.title||b} contains dynamic or structured help content`,detail:"Executable code, expressions, media and interactive help are not imported."});continue}if(Oe($||"")){a.unsupported.push({code:"limesurvey-question-help",title:`${o.title||b} contains participant help text`,detail:"Question help text is not silently merged into or removed from the item wording."});continue}const U=q(te??"")?J(te,"Question text",o.title||b,a):null;if(o.type==="5"){if(!U){a.unsupported.push({code:"missing-visible-text",title:"Question text is empty",detail:`${o.title||b} does not contain participant-visible text.`});continue}const R={sourceId:o.title||b,name:o.title||`Item ${O.length+1}`,prompt:U,values:[1,2,3,4,5],labels:["1","2","3","4","5"]};O.push(R),a.imported.push(ne(R))}else if(o.type==="L"||o.type==="!"){if(!U){a.unsupported.push({code:"missing-visible-text",title:"Question text is empty",detail:`${o.title||b} does not contain participant-visible text.`});continue}const R=Me(o,k,qe,u,a);if(!R)continue;const z={sourceId:o.title||b,name:o.title||`Item ${O.length+1}`,prompt:U,...R};O.push(z),a.imported.push(ne(z))}else if(o.type==="F"){const R=Ae.filter(w=>w.parent_qid===o.qid).sort((w,Y)=>(Number(w.question_order)||0)-(Number(Y.question_order)||0));if(!R.length){a.unsupported.push({code:"limesurvey-array-without-rows",title:`${o.title||b} has no array row`,detail:"A LimeSurvey Array question must contain at least one explicit row before it can be converted."});continue}if(R.some(w=>w.relevance&&w.relevance!=="1"||w.other&&w.other!=="N"||w.scale_id&&w.scale_id!=="0")){a.unsupported.push({code:"limesurvey-array-row-behaviour",title:`${o.title||b} contains an unsupported array row`,detail:"Conditional, “Other” or secondary-scale array rows are not flattened."});continue}const z=Me(o,k,qe,u,a);if(!z)continue;R.length===1?I(a,{code:"limesurvey-single-row-array-expanded",title:"Single-row LimeSurvey Array questions were converted to rating items",detail:"Each source question contains one array row. Review the displayed item wording and response scale against LimeSurvey."}):I(a,{code:"limesurvey-array-expanded",title:"LimeSurvey Array rows were converted to separate rating items",detail:"The source array heading is combined with each visible row label when both contain text. Review the converted wording and order."});for(const w of R){const Y=w.qid||w.title||`${b}-row`,$e=G(W,"qid",w.qid,"question",u)||w.question,le=G(W,"qid",w.qid,"help",u)||w.help,Ze=G(W,"qid",w.qid,"script",u)||w.script;if(q(Ze||"")||_e.test(le||"")||Se.test(le||"")||we.test(le||"")||Oe(le||"")){a.unsupported.push({code:"limesurvey-array-row-content",title:`${w.title||Y} contains unsupported row content`,detail:"Array-row scripts, dynamic content and help text are not imported."});continue}const ue=q($e??"")?J($e,"Array row text",w.title||Y,a):null,Ce=U&&ue?`${U}: ${ue}`:U||ue;if(!Ce){a.unsupported.push({code:"missing-visible-text",title:"Array item text is empty",detail:`${w.title||Y} and its parent question contain no participant-visible text.`});continue}const Qe={sourceId:`${o.title||b}/${w.title||Y}`,name:R.length===1&&!ue?o.title||`Item ${O.length+1}`:w.title||o.title||`Item ${O.length+1}`,prompt:Ce,values:[...z.values],labels:[...z.labels]};O.push(Qe),a.imported.push(ne(Qe))}}else a.unsupported.push({code:"limesurvey-unsupported-question",title:`${o.title||b} uses unsupported LimeSurvey type ${o.type||"unknown"}`,detail:"Supported in this release: List (Radio), 5 Point Choice and reviewed Array rating rows."})}const Te=V?.description||A.description||K?.surveyls_description||K?.surveyls_welcometext||"",ze=q(Te)?J(Te,"Survey introduction","surveys_languagesettings",a):null,Ye=Be(F,`Imported from ${v}`,ze??"Answer each imported item about the task that you have just completed.",O,a);return de(d,v,t,F,Ye,a,{groupOptions:M,selectedGroupId:A.gid,ratingSetOptions:j,selectedRatingSetId:L?.id})}function Ct(e,t){const n=t.toLowerCase().split(".").at(-1),i=e.trimStart();if(n==="qsf"||i.startsWith("{")&&/"SurveyElements"/.test(e))return"qualtrics-qsf";if(n==="lss"||i.startsWith("<")&&/<LimeSurveyDocType>Survey</.test(e))return"limesurvey-lss";if(n==="lsg"||i.startsWith("<")&&/<LimeSurveyDocType>Group</.test(e))return"limesurvey-lsg";throw new Error("Choose a Qualtrics .qsf file or a LimeSurvey .lss or .lsg file.")}function ye(e,t,n="auto",i,r){const s=new TextEncoder().encode(e).length;if(!e.trim())throw new Error("The selected questionnaire export is empty.");if(s>vt)throw new Error("The selected questionnaire export is larger than the 2 MB review limit.");const l=Ct(e,t);if(n!=="auto"&&n!==l){const d=l==="qualtrics-qsf"?"Qualtrics QSF":l==="limesurvey-lss"?"LimeSurvey LSS":"LimeSurvey LSG";throw new Error(`The selected file looks like ${d}, not the chosen format.`)}return l==="qualtrics-qsf"?It(e,t):$t(e,t,i,r)}var Qt=Object.defineProperty,Et=Object.getOwnPropertyDescriptor,f=(e,t,n,i)=>{for(var r=i>1?void 0:i?Et(t,n):t,s=e.length-1,l;s>=0;s--)(l=e[s])&&(r=(i?l(t,n,r):l(r))||r);return i&&r&&Qt(t,n,r),r};const Pt=ve.trim().split(/\r?\n/).filter(Boolean).length,X=be.match(/var bridgeBuild = '([^']+)'/)?.[1]??"unidentified";function Rt(e){const t=Array.isArray(e)?e:[e];return t.length>0&&t.some(n=>{if(!n||typeof n!="object")return!1;const i=n;return"study"in i&&"responses"in i&&"result"in i})}function xt(e){const t="PASTE_THE_GENERATED_PARTICIPANT_PAGE_URL_HERE";if(!e||e.includes(t))throw new Error("A generated participant URL is required for the Qualtrics question HTML.");const n=e.replace(/&/g,"&amp;").replace(/"/g,"&quot;");return ht.trim().replace(t,n)}function Nt(e){const t=e?["Questionnaire:","${e://Field/__js_AQP_INSTRUMENT_NAME}","","${e://Field/__js_AQP_SCORE_NAME}:","${e://Field/__js_AQP_PRIMARY_SCORE}"].join(`
`):"";return mt.replace("{{OPTIONAL_SCORE_BLOCK}}",t).replace(/\n{3,}/g,`

`).trim()}let h=class extends nt{constructor(){super(...arguments),this.instrumentId=it,this.customDefinition=null,this.customDraft=Ne(),this.customBuilderOpen=!1,this.platformImportSource="auto",this.platformImportReview=null,this.platformImportConfirmed=!1,this.platformImportSelectedGroupId="",this.platformImportSelectedRatingSetId="",this.platformImportContents="",this.platformImportFileName="",this.studyId="",this.studyTitle="",this.taskLabel="",this.showScoreToParticipant=!1,this.showSimpleLanguage=!1,this.answerMode="standard",this.largeText=!1,this.audioGuidance=!1,this.recoveryEnabled=!0,this.participantAdjustmentPolicy="participant-choice",this.voiceInputAvailable=!0,this.gazeInputAvailable=!1,this.collectionMode="local",this.qualtricsSurveyUrl="",this.generatedConfig=null,this.participantUrl="",this.message="",this.definitionConfirmation="",this.configurationConfirmation="",this.errorMessage="",this.completedResults=[],this.selectInstrument=e=>{const t=e.currentTarget.value,n=this.availableDefinitions.find(i=>i.id===t)??null;n&&(this.instrumentId=t,n.supports.simplerExplanations||(this.showSimpleLanguage=!1),n.supports.smileyLandmarks||(this.answerMode="standard"),this.generatedConfig=null,this.participantUrl="",this.definitionConfirmation=`${n.name} ${n.version} selected. Complete the study details, then generate a new configuration.`,this.configurationConfirmation="",this.message=`${n.name} selected. Generate a new configuration before testing.`)},this.importPlatformQuestionnaire=async e=>{const t=e.currentTarget,n=t.files?.[0];if(n){this.errorMessage="",this.definitionConfirmation="",this.platformImportReview=null,this.platformImportConfirmed=!1;try{const i=await n.text();this.platformImportContents=i,this.platformImportFileName=n.name,this.platformImportSelectedGroupId="",this.platformImportSelectedRatingSetId="";const r=ye(i,n.name,this.platformImportSource);this.platformImportReview=r,this.platformImportSelectedGroupId=r.selectedGroupId??"",r.draft&&(this.customDraft=structuredClone(r.draft)),this.message=r.requiresGroupSelection?"Choose one LimeSurvey questionnaire group to review.":r.requiresRatingSetSelection?"Choose one compatible LimeSurvey rating set to review.":r.canConvert?"Import review ready. Check every section and confirm scoring before conversion.":"Import review found unsupported content. No partial questionnaire was created.",this.revealConductorResult("#platform-import-review")}catch(i){this.showError(i instanceof Error?i.message:"The questionnaire export could not be reviewed.")}finally{t.value=""}}},this.reviewSelectedLimeSurveyGroup=()=>{if(!(!this.platformImportContents||!this.platformImportFileName||!this.platformImportSelectedGroupId)){this.errorMessage="",this.definitionConfirmation="",this.platformImportConfirmed=!1;try{const e=ye(this.platformImportContents,this.platformImportFileName,this.platformImportSource,this.platformImportSelectedGroupId);this.platformImportReview=e,this.platformImportSelectedRatingSetId="",e.draft&&(this.customDraft=structuredClone(e.draft)),this.message=e.requiresRatingSetSelection?"Choose one compatible rating set in the selected LimeSurvey group.":e.canConvert?"Selected group review ready. Check every section and confirm scoring before conversion.":"The selected group contains unsupported content. No partial questionnaire was created.",this.revealConductorResult("#platform-import-review")}catch(e){this.showError(e instanceof Error?e.message:"The selected LimeSurvey group could not be reviewed.")}}},this.reviewSelectedLimeSurveyRatingSet=()=>{if(!(!this.platformImportContents||!this.platformImportFileName||!this.platformImportSelectedGroupId||!this.platformImportSelectedRatingSetId)){this.errorMessage="",this.definitionConfirmation="",this.platformImportConfirmed=!1;try{const e=ye(this.platformImportContents,this.platformImportFileName,this.platformImportSource,this.platformImportSelectedGroupId,this.platformImportSelectedRatingSetId);this.platformImportReview=e,e.draft&&(this.customDraft=structuredClone(e.draft)),this.message=e.canConvert?"Selected rating-set review ready. Check every section and confirm scoring before conversion.":"The selected rating set contains unsupported content. No partial questionnaire was created.",this.revealConductorResult("#platform-import-review")}catch(e){this.showError(e instanceof Error?e.message:"The selected LimeSurvey rating set could not be reviewed.")}}},this.usePlatformImport=()=>{const e=this.platformImportReview;if(!(!e?.canConvert||!e.draft||!this.platformImportConfirmed)){this.errorMessage="",this.definitionConfirmation="";try{const t=Le(this.customDraft);this.activateCustomDefinition(t,"imported")}catch(t){this.showError(t instanceof Error?t.message:"The reviewed questionnaire could not be converted.")}}},this.addCustomItem=()=>{this.customDraft.items.length>=B||(this.customDraft={...this.customDraft,items:[...this.customDraft.items,pe({name:`Item ${this.customDraft.items.length+1}`})]})},this.useCustomDraft=()=>{this.errorMessage="",this.definitionConfirmation="";try{this.activateCustomDefinition(Le(this.customDraft),"validated")}catch(e){this.showError(e instanceof Error?e.message:"The custom questionnaire could not be validated.")}},this.importCustomDefinition=async e=>{const t=e.currentTarget,n=t.files?.[0];if(n){this.errorMessage="",this.definitionConfirmation="";try{const i=je(JSON.parse(await n.text()));this.activateCustomDefinition(i,"imported")}catch(i){this.showError(i instanceof Error?i.message:"The questionnaire definition file could not be read.")}finally{t.value=""}}},this.downloadCustomDefinition=()=>{this.customDefinition&&ce(yt(this.customDefinition),JSON.stringify(this.customDefinition,null,2),"application/json")},this.resetCustomDraft=()=>{this.customDraft=Ne(),this.platformImportReview=null,this.platformImportConfirmed=!1,this.platformImportSelectedGroupId="",this.platformImportSelectedRatingSetId="",this.platformImportContents="",this.platformImportFileName="",this.message="Custom questionnaire builder fields reset. The selected questionnaire is unchanged until you validate a new definition."},this.generateParticipantLink=()=>{this.errorMessage="",this.configurationConfirmation="";try{const e=rt({instrumentId:this.instrumentId,...this.customDefinition?.id===this.instrumentId?{questionnaireDefinition:this.customDefinition}:{},studyId:this.studyId,studyTitle:this.studyTitle,taskLabel:this.taskLabel,showScoreToParticipant:this.showScoreToParticipant,support:this.currentSupportConfig(),collection:this.currentCollectionConfig()});this.useConfiguration(e),this.configurationConfirmation="Participant link and configuration generated. The ready-to-use files and link are shown below.",this.message="",this.revealConductorResult("#configuration-ready-panel")}catch(e){this.showError(e instanceof Error?e.message:"The study configuration could not be generated.")}},this.copyParticipantLink=async()=>{this.participantUrl&&await this.copySetupAsset(this.participantUrl,"participant link")},this.copySetupAsset=async(e,t)=>{try{if(!navigator.clipboard?.writeText)throw new Error("Clipboard API unavailable.");await navigator.clipboard.writeText(e),this.message=`${t.charAt(0).toUpperCase()}${t.slice(1)} copied.`}catch{this.message=`Automatic copy was unavailable. Select and copy the ${t} from its text box.`}},this.downloadConfiguration=()=>{this.generatedConfig&&ce(`${this.generatedConfig.studyId}-${this.generatedConfig.configId}.json`,JSON.stringify(this.generatedConfig,null,2),"application/json")},this.importConfiguration=async e=>{const t=e.currentTarget,n=t.files?.[0];if(n){this.errorMessage="",this.configurationConfirmation="";try{const i=JSON.parse(await n.text()),r=st(i);if(!r)throw Rt(i)?new Error("This is a completed result file, not a study configuration. Import the JSON downloaded from Configuration ready."):new Error("This is not a valid Version 0.8 study configuration or supported Version 0.7 configuration.");this.useConfiguration(r),this.configurationConfirmation="Configuration imported and participant link reproduced. The configuration ID and files are shown below.",this.message="",this.revealConductorResult("#configuration-ready-panel")}catch(i){this.showError(i instanceof Error?i.message:"The configuration file could not be read.")}finally{t.value=""}}},this.refreshResults=()=>{this.completedResults=ot()},this.exportResultsJson=()=>{this.completedResults.length&&ce(`accessible-questionnaire-results-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(this.completedResults,null,2),"application/json")},this.exportResultsCsv=()=>{this.completedResults.length&&ce(`accessible-questionnaire-results-${new Date().toISOString().slice(0,10)}.csv`,`\uFEFF${at(this.completedResults)}`,"text/csv")},this.eraseResults=()=>{window.confirm("Erase every completed questionnaire record stored by this site in this browser? Confirm only after checking the exported files.")&&(lt(),this.refreshResults(),this.message="Local completed records erased.")}}connectedCallback(){super.connectedCallback(),this.refreshResults(),window.addEventListener("storage",this.refreshResults)}disconnectedCallback(){window.removeEventListener("storage",this.refreshResults),super.disconnectedCallback()}createRenderRoot(){return this}get definition(){return ut(this.instrumentId,this.customDefinition??void 0)}get availableDefinitions(){return this.customDefinition?[...Pe,this.customDefinition]:Pe}render(){return m`
      <a class="skip-link" href="#conductor-main">Skip to study setup</a>
      <main class="app-shell conductor-shell" id="conductor-main">
        <header class="app-header">
          <p class="eyebrow">
            Study conductor · Version ${fe} · Qualtrics package ${X}
          </p>
          <h1>Prepare an accessible questionnaire study</h1>
          <p class="subtitle">Create one configuration, give participants a prepared link, and export completed records.</p>
        </header>

        <aside class="boundary-note important-boundary" aria-labelledby="current-generator-heading">
          <h2 id="current-generator-heading">Current Qualtrics generator: ${X}</h2>
          <p>
            Every generated JavaScript block must contain
            <code>var bridgeBuild = '${X}';</code>. If it shows another value, that browser tab is
            running a stale conductor build. Close that tab and reopen the versioned
            <a href="study.html?package=${X}">Prepare a study page</a> before copying anything.
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

        ${this.errorMessage?m`<div class="error-summary" role="alert" tabindex="-1" id="conductor-error">
              <h2>There is a problem</h2><p>${this.errorMessage}</p>
            </div>`:Q}
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
                ${this.availableDefinitions.map(e=>m`<option
                    value=${e.id}
                    .selected=${e.id===this.instrumentId}
                  >
                    ${e.name} · ${e.version}${Fe(e.id)?"":" · researcher supplied"}
                  </option>`)}
              </select>
            </label>
            <aside
              class=${`definition-summary full-width${this.definitionConfirmation?" success-confirmation":""}`}
              id="selected-questionnaire-summary"
              tabindex="-1"
              aria-describedby=${this.definitionConfirmation?"definition-confirmation-message":Q}
            >
              ${this.definitionConfirmation?m`<p
                    class="success-message"
                    id="definition-confirmation-message"
                  >
                    <span class="success-icon" aria-hidden="true">✓</span>
                    <span><strong>Questionnaire ready.</strong> ${this.definitionConfirmation}</span>
                  </p>`:Q}
              <strong>${this.definition.shortName}</strong>
              <span>
                ${this.definition.items.length} items,
                ${ge(this.definition).length}
                ${this.definition.scale.type.replace("-"," ")} response values,
                ${ct(this.definition).length} comparisons,
                ${this.definition.scoring.scoreName}.
              </span>
              ${this.definition.source.url?m`<a href=${this.definition.source.url} target="_blank" rel="noopener">
                    Instrument source: ${this.definition.source.label}
                  </a>`:m`<span>Instrument source: ${this.definition.source.label}</span>`}
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
              ${this.customDefinition?m`
                    <button
                      class="secondary-button"
                      type="button"
                      @click=${this.downloadCustomDefinition}
                    >
                      Download current questionnaire definition
                    </button>
                  `:Q}
            </div>
            ${this.customBuilderOpen?this.renderCustomQuestionnaireBuilder():Q}
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
            ${this.definition.supports.simplerExplanations?this.booleanOption("Show simpler explanations from the start",this.showSimpleLanguage,e=>{this.showSimpleLanguage=e}):m`<aside class="boundary-note">
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

          ${this.definition.supports.smileyLandmarks?m`<fieldset class="answer-mode-control conductor-answer-mode">
                <legend>Starting rating presentation</legend>
                <label>
                  <input type="radio" name="conductor-answer-mode" value="standard" .checked=${this.answerMode==="standard"} @change=${()=>{this.answerMode="standard"}} />
                  <span>
                    <strong>Standard ${ge(this.definition).length}-value scale</strong>
                    <small>Recommended default.</small>
                  </span>
                </label>
                <label>
                  <input type="radio" name="conductor-answer-mode" value="smiley" .checked=${this.answerMode==="smiley"} @change=${()=>{this.answerMode="smiley"}} />
                  <span><strong>Experimental smiley landmarks</strong><small>Use only when this presentation is part of the approved protocol.</small></span>
                </label>
              </fieldset>`:m`<p class="support-boundary">
                ${this.definition.shortName} uses its standard ${ge(this.definition).length}-value
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
          ${this.collectionMode==="qualtrics"?m`<label class="full-width">
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
              </p>`:Q}
        </section>

        <section class="panel conductor-panel" aria-labelledby="link-heading">
          <h2 id="link-heading">4. Generate the participant configuration</h2>
          <div class="button-row compact">
            <button class="primary-button large-answer-button" type="button" @click=${this.generateParticipantLink}>Generate link</button>
            <label class="file-button secondary-button">
              Import configuration JSON
              <input
                class="sr-only"
                data-configuration-import
                type="file"
                accept="application/json,.json"
                @change=${this.importConfiguration}
              />
            </label>
          </div>
          <p class="support-boundary">
            Import only the JSON downloaded from <strong>Configuration ready</strong>. Completed-result JSON is a different
            record type and is not imported here.
          </p>

          ${this.generatedConfig?m`<div
                class=${`generated-link${this.configurationConfirmation?" success-confirmation":""}`}
                id="configuration-ready-panel"
                role="region"
                aria-labelledby="generated-link-heading"
                aria-describedby=${this.configurationConfirmation?"configuration-confirmation-message":Q}
                tabindex="-1"
              >
                ${this.configurationConfirmation?m`<p
                      class="success-message"
                      id="configuration-confirmation-message"
                    >
                      <span class="success-icon" aria-hidden="true">✓</span>
                      <span><strong>Success.</strong> ${this.configurationConfirmation}</span>
                    </p>`:Q}
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
                  ${this.generatedConfig.collection.mode==="local"?m`<a class="secondary-button link-button" href=${this.participantUrl} target="_blank" rel="noopener">Open participant page</a>`:Q}
                  <button class="secondary-button" type="button" @click=${this.downloadConfiguration}>Download configuration JSON</button>
                </div>
                ${this.generatedConfig.collection.mode==="qualtrics"?this.renderQualtricsSetup():Q}
                <p class="support-boundary">
                  Save the JSON with the study protocol. Importing it later regenerates the same configuration ID and participant link.
                  The link contains settings only; it contains no participant name, email or answer.
                </p>
              </div>`:Q}
        </section>

        <section class="panel conductor-panel" aria-labelledby="results-heading">
          <h2 id="results-heading">5. Results saved on this device</h2>
          <p><strong>${this.completedResults.length}</strong> completed record${this.completedResults.length===1?"":"s"} found in this browser.</p>
          ${this.completedResults.length?m`
                <div class="table-scroll">
                  <table>
                    <thead><tr><th>Study ID</th><th>Instrument</th><th>Participant code</th><th>Completed</th><th>Primary score</th></tr></thead>
                    <tbody>
                      ${this.completedResults.map(e=>m`<tr>
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
              `:m`<p>After a configured questionnaire is completed in this same browser, its pseudonymous record will appear here.</p>`}
        </section>

        <section class="panel conductor-panel" aria-labelledby="remote-heading">
          <h2 id="remote-heading">Remote-study boundary</h2>
          <p>
            <strong>Central collection is not configured on this GitHub Pages deployment.</strong> A participant using another
            device will otherwise keep the result in that device's browser. Do not make the participant download and email data
            as the normal study procedure.
          </p>
          <p>
            Version ${fe} includes a Qualtrics parent bridge. The participant page sends a complete record only to the
            exact HTTPS origin stored by the conductor; Qualtrics writes the fields into the current response and returns a
            matching receipt before advancing. A failed save leaves the answers on Review for retry. Platform selection,
            consent, retention and access must still match the project's existing approved protocol and data-management documents.
          </p>
        </section>
      </main>
    `}renderCustomQuestionnaireBuilder(){return m`
      <section
        class="custom-questionnaire-builder full-width"
        id="custom-questionnaire-builder"
        aria-labelledby="custom-questionnaire-heading"
      >
        <h3 id="custom-questionnaire-heading">Add a researcher-supplied questionnaire</h3>
        <p>
          Choose one of three routes. Import a source-platform export, reuse a definition
          previously downloaded from this platform, or build a small questionnaire manually.
          These routes accept different file types and are not interchangeable.
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

        ${this.renderPlatformQuestionnaireImport()}

        <section
          class="questionnaire-add-route"
          aria-labelledby="aqp-definition-import-heading"
        >
          <h4 id="aqp-definition-import-heading">
            2. Reuse an AQP questionnaire definition
          </h4>
          <p>
            Choose a <code>.json</code> definition previously downloaded from this
            Accessible Questionnaire Platform. This skips source-platform conversion,
            but the definition is validated again before it is selected.
          </p>
          <label class="file-import-control">
            <strong>AQP definition JSON</strong>
            <span>
              Use an AQP definition file here—not a Qualtrics <code>.qsf</code> or
              LimeSurvey <code>.lss</code> export.
            </span>
            <input
              data-custom-definition-import
              type="file"
              accept=".json,application/json"
              @change=${this.importCustomDefinition}
            />
          </label>
        </section>

        <section
          class="questionnaire-add-route"
          aria-labelledby="manual-questionnaire-builder-heading"
        >
          <h4 id="manual-questionnaire-builder-heading">
            3. Build a questionnaire manually
          </h4>
          <p>
            No code is required. The manual builder supports
            1–${B} required single-choice items that
            share one whole-number response scale. It can calculate a reviewed mean
            or sum, including selected reverse-scored items.
          </p>

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
            ?disabled=${this.customDraft.items.length>=B}
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
          <button
            class="secondary-button"
            type="button"
            @click=${this.resetCustomDraft}
          >
            Reset builder fields
          </button>
        </div>
        <p class="support-boundary">
          Editing these fields does not change the selected questionnaire until you select
          <strong>Validate and use this questionnaire</strong>.
        </p>
        <p class="support-boundary">
          After validation, the full definition is embedded in the configuration and participant
          link. Download its JSON for the study protocol. Route 2 can later reproduce the same
          items, scale and scoring rule without changing source code.
        </p>
        </section>
      </section>
    `}renderPlatformQuestionnaireImport(){const e=this.platformImportReview;return m`
      <section
        class="platform-questionnaire-import"
        aria-labelledby="platform-questionnaire-import-heading"
      >
        <h4 id="platform-questionnaire-import-heading">
          1. Import a Qualtrics or LimeSurvey export
        </h4>
        <p>
          Choose a Qualtrics <code>.qsf</code> survey export or a LimeSurvey
          <code>.lss</code> survey export or <code>.lsg</code> question-group export.
          A multi-group LSS asks you to choose one group. If that group contains
          different numeric scales, it then asks you to choose one compatible rating
          set. Questions outside that set are listed explicitly and remain in the source
          survey. The file is reviewed in this browser and is not uploaded. Nothing is
          converted until you review and confirm the result.
        </p>
        <p class="support-boundary">
          Use <strong>QSF</strong> for a Qualtrics survey, <strong>LSS</strong> for a
          complete LimeSurvey survey, or <strong>LSG</strong> for one LimeSurvey
          question group. LimeSurvey LSQ question files, LSA archives, printable
          files and response-data exports are not questionnaire inputs here.
        </p>
        <div class="form-grid">
          <label>
            <strong>Source format</strong>
            <span>Automatic detection is recommended.</span>
            <select
              data-platform-import-source
              .value=${this.platformImportSource}
              @change=${t=>{this.platformImportSource=t.currentTarget.value,this.platformImportReview=null,this.platformImportConfirmed=!1,this.platformImportSelectedGroupId="",this.platformImportSelectedRatingSetId="",this.platformImportContents="",this.platformImportFileName=""}}
            >
              <option value="auto">Detect from file</option>
              <option value="qualtrics-qsf">Qualtrics QSF</option>
              <option value="limesurvey-lss">LimeSurvey LSS</option>
              <option value="limesurvey-lsg">LimeSurvey LSG</option>
            </select>
          </label>
          <label class="file-import-control">
            <strong>Questionnaire export</strong>
            <span>Maximum file size: 2 MB.</span>
            <input
              data-platform-questionnaire-import
              type="file"
              accept=".qsf,.lss,.lsg,application/json,application/xml,text/xml"
              @change=${this.importPlatformQuestionnaire}
            />
          </label>
        </div>
        ${e?this.renderPlatformQuestionnaireReview(e):Q}
      </section>
    `}renderPlatformQuestionnaireReview(e){const t=(n,i,r,s)=>m`
      <section class=${`platform-import-finding ${i}`}>
        <h5>${n} (${r.length})</h5>
        ${r.length?m`<ul>
              ${r.map(l=>m`
                <li>
                  <strong>${l.title}</strong>
                  <span>${l.detail}</span>
                </li>
              `)}
            </ul>`:m`<p>${s}</p>`}
      </section>
    `;return e.requiresGroupSelection&&e.groupOptions?.length?m`
        <section
          class="platform-import-review import-selection"
          id="platform-import-review"
          tabindex="-1"
          aria-labelledby="platform-import-review-heading"
        >
          <div class="platform-import-review-heading">
            <span class="selection-icon" aria-hidden="true">→</span>
            <div>
              <h5 id="platform-import-review-heading">Choose one LimeSurvey questionnaire group</h5>
              <p><strong>${e.title}</strong> · ${e.sourceName} · ${e.fileName}</p>
            </div>
          </div>
          <p>
            This survey contains several groups. Choose the group that should become
            one standalone questionnaire. Other groups are not silently merged or removed.
          </p>
          <fieldset class="platform-import-group-selection">
            <legend>Questionnaire group</legend>
            <label>
              <strong>Group to review</strong>
              <select
                data-platform-import-group
                .value=${this.platformImportSelectedGroupId}
                @change=${n=>{this.platformImportSelectedGroupId=n.currentTarget.value}}
              >
                <option value="">Choose a group</option>
                ${e.groupOptions.map(n=>m`
                  <option value=${n.id}>
                    ${n.name} · ${n.questionCount} source question${n.questionCount===1?"":"s"} ·
                    types ${n.questionTypes.join(", ")}
                  </option>
                `)}
              </select>
            </label>
            <button
              class="primary-button"
              type="button"
              ?disabled=${!this.platformImportSelectedGroupId}
              @click=${this.reviewSelectedLimeSurveyGroup}
            >
              Review selected group
            </button>
          </fieldset>
        </section>
      `:e.requiresRatingSetSelection&&e.ratingSetOptions?.length?m`
        <section
          class="platform-import-review import-selection"
          id="platform-import-review"
          tabindex="-1"
          aria-labelledby="platform-import-review-heading"
        >
          <div class="platform-import-review-heading">
            <span class="selection-icon" aria-hidden="true">→</span>
            <div>
              <h5 id="platform-import-review-heading">Choose one compatible rating set</h5>
              <p><strong>${e.title}</strong> · ${e.sourceName} · ${e.fileName}</p>
            </div>
          </div>
          <p>
            This group contains different response scales or non-rating questions. One AQP
            questionnaire needs one reviewed numeric scale, so choose the rating set that should
            become the standalone questionnaire. Everything else remains in the source file and
            will be listed for confirmation.
          </p>
          <fieldset class="platform-import-group-selection">
            <legend>Rating set</legend>
            <label>
              <strong>Set to review</strong>
              <select
                data-platform-import-rating-set
                .value=${this.platformImportSelectedRatingSetId}
                @change=${n=>{this.platformImportSelectedRatingSetId=n.currentTarget.value}}
              >
                <option value="">Choose a rating set</option>
                ${e.ratingSetOptions.map(n=>m`
                  <option value=${n.id}>
                    ${n.name} · ${n.itemCount} item${n.itemCount===1?"":"s"} ·
                    values ${n.responseValues.join(", ")}
                  </option>
                `)}
              </select>
            </label>
            <button
              class="primary-button"
              type="button"
              ?disabled=${!this.platformImportSelectedRatingSetId}
              @click=${this.reviewSelectedLimeSurveyRatingSet}
            >
              Review selected rating set
            </button>
          </fieldset>
        </section>
      `:m`
      <section
        class=${`platform-import-review${e.canConvert?"":" import-blocked"}`}
        id="platform-import-review"
        tabindex="-1"
        aria-labelledby="platform-import-review-heading"
      >
        <div class="platform-import-review-heading">
          <span class=${e.canConvert?"success-icon":"warning-icon"} aria-hidden="true">
            ${e.canConvert?"✓":"!"}
          </span>
          <div>
            <h5 id="platform-import-review-heading">
              ${e.canConvert?"Import review ready":"Conversion blocked"}
            </h5>
            <p>
              <strong>${e.title}</strong> · ${e.sourceName} ·
              ${e.fileName}
            </p>
          </div>
        </div>

        <div class="platform-import-findings">
          ${t("Imported safely","import-safe",e.imported,"No questionnaire items were imported safely.")}
          ${t("Requires researcher confirmation","import-confirm",e.confirmations,"No additional confirmation is required.")}
          ${t("Unsupported content","import-unsupported",e.unsupported,"No unsupported content was found.")}
        </div>

        ${e.canConvert&&e.draft?m`
              <fieldset class="platform-import-confirmation">
                <legend>Confirm scoring before conversion</legend>
                <div class="form-grid">
                  <label>
                    <strong>Scale description</strong>
                    <select
                      data-platform-import-scale-type
                      .value=${this.customDraft.scaleType}
                      @change=${n=>this.updateCustomDraft("scaleType",n.currentTarget.value)}
                    >
                      <option value="agreement">Agreement</option>
                      <option value="magnitude">Magnitude</option>
                      <option value="semantic-differential">Semantic differential</option>
                    </select>
                  </label>
                  <label>
                    <strong>Score calculation</strong>
                    <select
                      data-platform-import-aggregation
                      .value=${this.customDraft.aggregation}
                      @change=${n=>this.updateCustomDraft("aggregation",n.currentTarget.value)}
                    >
                      <option value="mean">Mean of reviewed item values</option>
                      <option value="sum">Sum of reviewed item values</option>
                    </select>
                  </label>
                </div>
                <fieldset class="platform-import-reverse-items">
                  <legend>Reverse-scored items</legend>
                  <p>Select an item only if the questionnaire's reviewed scoring instructions require it.</p>
                  ${this.customDraft.items.map((n,i)=>m`
                    <label>
                      <input
                        data-platform-import-reverse=${i}
                        type="checkbox"
                        .checked=${n.reverseScored}
                        @change=${r=>this.updateCustomItem(i,"reverseScored",r.currentTarget.checked)}
                      />
                      <span>${i+1}. ${n.name}: ${n.prompt}</span>
                    </label>
                  `)}
                </fieldset>
                <label class="platform-import-final-confirmation">
                  <input
                    data-platform-import-confirm
                    type="checkbox"
                    .checked=${this.platformImportConfirmed}
                    @change=${n=>{this.platformImportConfirmed=n.currentTarget.checked}}
                  />
                  <span>
                    I checked the imported wording, question order, response labels,
                    numeric values, score calculation and reverse-scored items against
                    the source questionnaire. I also understand every listed source
                    setting or display condition that is not retained.
                  </span>
                </label>
                <button
                  class="primary-button"
                  type="button"
                  ?disabled=${!this.platformImportConfirmed}
                  @click=${this.usePlatformImport}
                >
                  Convert and use this questionnaire
                </button>
              </fieldset>
            `:m`
              <p class="support-boundary">
                Correct the unsupported content in the source survey and export it
                again. The platform has not created a partial questionnaire.
              </p>
            `}
      </section>
    `}renderCustomQuestionnaireItem(e,t){return m`
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
    `}updateCustomDraft(e,t){this.customDraft={...this.customDraft,[e]:t},this.platformImportReview&&(this.platformImportConfirmed=!1)}updateCustomItem(e,t,n){this.customDraft={...this.customDraft,items:this.customDraft.items.map((i,r)=>r===e?{...i,[t]:n}:i)},this.platformImportReview&&(this.platformImportConfirmed=!1)}removeCustomItem(e){this.customDraft.items.length!==1&&(this.customDraft={...this.customDraft,items:this.customDraft.items.filter((t,n)=>n!==e)})}activateCustomDefinition(e,t){this.customDefinition=e,this.instrumentId=e.id,e.supports.simplerExplanations||(this.showSimpleLanguage=!1),this.answerMode="standard",this.generatedConfig=null,this.participantUrl="";const n=t==="imported"?"imported, validated and selected":"validated and selected";this.definitionConfirmation=`${e.name} ${e.version} ${n}. Complete the study details, then generate a new configuration.`,this.configurationConfirmation="",this.message="",this.revealConductorResult("#selected-questionnaire-summary")}booleanOption(e,t,n,i=""){return m`<label class="toggle-card conductor-toggle">
      <input type="checkbox" .checked=${t} @change=${r=>n(r.currentTarget.checked)} />
      <span><strong>${e}</strong>${i?m`<small>${i}</small>`:Q}</span>
    </label>`}currentSupportConfig(){return{showSimpleLanguage:this.definition.supports.simplerExplanations&&this.showSimpleLanguage,answerMode:this.definition.supports.smileyLandmarks?this.answerMode:"standard",largeText:this.largeText,audioGuidance:this.audioGuidance,recoveryEnabled:this.recoveryEnabled,participantAdjustmentPolicy:this.participantAdjustmentPolicy,voiceInputAvailable:this.voiceInputAvailable,gazeInputAvailable:this.gazeInputAvailable}}currentCollectionConfig(){if(this.collectionMode==="local")return{mode:"local"};const e=dt(this.qualtricsSurveyUrl);if(!e)throw new Error("Enter a valid HTTPS Qualtrics survey or preview URL for central collection.");if(e===window.location.origin)throw new Error("The Qualtrics origin must be different from this GitHub Pages website.");return{mode:"qualtrics",parentOrigin:e}}useConfiguration(e){e.questionnaireDefinition&&(this.customDefinition=e.questionnaireDefinition),this.generatedConfig=e,this.instrumentId=e.instrumentId,this.studyId=e.studyId,this.studyTitle=e.studyTitle,this.taskLabel=e.taskLabel,this.showScoreToParticipant=e.showScoreToParticipant,this.showSimpleLanguage=e.support.showSimpleLanguage,this.answerMode=e.support.answerMode,this.largeText=e.support.largeText,this.audioGuidance=e.support.audioGuidance,this.recoveryEnabled=e.support.recoveryEnabled,this.participantAdjustmentPolicy=e.support.participantAdjustmentPolicy,this.voiceInputAvailable=e.support.voiceInputAvailable,this.gazeInputAvailable=e.support.gazeInputAvailable,this.collectionMode=e.collection.mode,this.qualtricsSurveyUrl=e.collection.mode==="qualtrics"?e.collection.parentOrigin:"",this.participantUrl=pt(new URL("index.html",window.location.href).toString(),e)}qualtricsIframeHtml(){return!this.generatedConfig||this.generatedConfig.collection.mode!=="qualtrics"?"":xt(this.participantUrl)}renderQualtricsSetup(){const e=this.qualtricsIframeHtml(),t=Nt(this.generatedConfig?.showScoreToParticipant===!0);return m`
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
          platform ${fe}; Qualtrics bridge ${X}.
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
            <strong>Check Qualtrics response anonymisation before recruitment.</strong>
            An anonymous distribution link still records IP address and approximate location by
            default. If the approved study does not require those fields, enable
            <strong>Anonymize responses</strong> in Qualtrics Survey Options before the synthetic
            test, publish the change, and confirm that a newly exported row has blank IP and
            location fields. This setting is not retroactive.
          </p>
          <p>
            <a
              href="https://www.qualtrics.com/support/survey-platform/survey-module/survey-options/survey-protection/#AnonymizeResponses"
              target="_blank"
              rel="noopener"
            >Open the official Qualtrics anonymisation guidance</a>.
          </p>
        </aside>
        <aside class="boundary-note important-boundary">
          <p>
            <strong>A rendered iframe is not a data-collection pass.</strong>
            In Preview, the status above the questionnaire must name bridge
            ${X} and say that diagnostic fields were staged. Then complete one
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
              <strong>${Pt} Embedded Data field names</strong>
            </label>
            <textarea
              id="qualtrics-embedded-fields"
              data-qualtrics-asset="embedded-data"
              readonly
              rows="10"
              .value=${ve.trim()}
            ></textarea>
            <button
              class="secondary-button"
              type="button"
              @click=${()=>this.copySetupAsset(ve.trim(),"Embedded Data field list")}
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
              .value=${be.trim()}
            ></textarea>
            <button
              class="secondary-button"
              type="button"
              @click=${()=>this.copySetupAsset(be.trim(),"question JavaScript")}
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
    `}showError(e){this.errorMessage=e,this.updateComplete.then(()=>{const t=this.querySelector("#conductor-error");t&&Re(t)})}revealConductorResult(e){this.updateComplete.then(()=>{const t=this.querySelector(e);t&&Re(t,{block:"start"})})}};f([g()],h.prototype,"instrumentId",2);f([g()],h.prototype,"customDefinition",2);f([g()],h.prototype,"customDraft",2);f([g()],h.prototype,"customBuilderOpen",2);f([g()],h.prototype,"platformImportSource",2);f([g()],h.prototype,"platformImportReview",2);f([g()],h.prototype,"platformImportConfirmed",2);f([g()],h.prototype,"platformImportSelectedGroupId",2);f([g()],h.prototype,"platformImportSelectedRatingSetId",2);f([g()],h.prototype,"studyId",2);f([g()],h.prototype,"studyTitle",2);f([g()],h.prototype,"taskLabel",2);f([g()],h.prototype,"showScoreToParticipant",2);f([g()],h.prototype,"showSimpleLanguage",2);f([g()],h.prototype,"answerMode",2);f([g()],h.prototype,"largeText",2);f([g()],h.prototype,"audioGuidance",2);f([g()],h.prototype,"recoveryEnabled",2);f([g()],h.prototype,"participantAdjustmentPolicy",2);f([g()],h.prototype,"voiceInputAvailable",2);f([g()],h.prototype,"gazeInputAvailable",2);f([g()],h.prototype,"collectionMode",2);f([g()],h.prototype,"qualtricsSurveyUrl",2);f([g()],h.prototype,"generatedConfig",2);f([g()],h.prototype,"participantUrl",2);f([g()],h.prototype,"message",2);f([g()],h.prototype,"definitionConfirmation",2);f([g()],h.prototype,"configurationConfirmation",2);f([g()],h.prototype,"errorMessage",2);f([g()],h.prototype,"completedResults",2);h=f([tt("study-conductor-app")],h);
