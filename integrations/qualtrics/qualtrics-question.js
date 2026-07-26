/*
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
  var completionDelayMs = 8000;

  question.hideNextButton();

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
        'Your data have been accepted. No further action is required. ' +
        'Qualtrics is completing your response now.'
      );
      sendReceipt(event.source, true, acceptedSubmissionId);
      completionTimerId = window.setTimeout(function completeAcceptedResponse() {
        completionTimerId = null;
        question.clickNextButton();
      }, completionDelayMs);
    } catch (error) {
      var detail = error && error.message ? error.message : 'Qualtrics could not stage the response.';
      setStatus(detail + ' Return to the questionnaire and try again.');
      sendReceipt(event.source, false, submissionId || '', detail);
    }
  }

  if (!iframe || !iframe.contentWindow) {
    setStatus('The Accessible NASA-TLX iframe is missing. The study conductor must correct this Qualtrics question.');
    return;
  }

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
