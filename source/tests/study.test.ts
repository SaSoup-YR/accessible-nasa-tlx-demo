// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { dimensions, pairs, type DimensionId } from '../src/nasa-tlx';
import {
  createCustomItemDraft,
  createCustomQuestionnaireDefinition,
  createCustomQuestionnaireDraft,
} from '../src/custom-questionnaire';
import { getQuestionnaireDefinition } from '../src/questionnaire-definition';
import { calculateResult, scoreQuestionnaire } from '../src/scoring';
import {
  buildParticipantUrl,
  clearCompletedResults,
  COMPLETED_RESULTS_KEY,
  createStudyConfig,
  createStudyResultRecord,
  decodeStudyConfig,
  encodeStudyConfig,
  loadCompletedResults,
  normaliseStudyConfig,
  removeCompletedResult,
  resultsToCsv,
  saveCompletedResult,
  type SupportMetadata,
} from '../src/study';

const support = {
  showSimpleLanguage: true,
  answerMode: 'standard' as const,
  largeText: true,
  audioGuidance: false,
  recoveryEnabled: true,
  participantAdjustmentPolicy: 'presentation-only' as const,
  voiceInputAvailable: true,
  gazeInputAvailable: false,
};

function config() {
  return createStudyConfig(
    {
      studyId: 'TLX-PILOT-01',
      studyTitle: 'Workload study – café task',
      taskLabel: 'the checkout task',
      showScoreToParticipant: false,
      support,
      collection: { mode: 'local' },
    },
    { configId: 'config-fixed', createdAt: '2026-07-20T12:00:00.000Z' },
  );
}

function record() {
  const ratings = Object.fromEntries(dimensions.map(({ id }) => [id, 50])) as Record<DimensionId, number>;
  const pairwiseChoices = Object.fromEntries(pairs.map((pair) => [pair.id, pair.left]));
  const metadata: SupportMetadata = {
    simplerExplanationsShownAtSubmission: true,
    largeTextUsedAtSubmission: true,
    answerModeAtSubmission: 'standard',
    recoveryEnabledAtSubmission: true,
    interruptionSummaryShown: false,
    readAloudUsed: false,
    automaticAudioGuidanceEnabledAtSubmission: false,
    gazeUsed: false,
    gazeActionCount: 0,
    gazeEngine: null,
    ratingInputRoutes: Object.fromEntries(dimensions.map(({ id }) => [id, 'standard-scale'])),
    pairInputRoutes: Object.fromEntries(pairs.map(({ id }) => [id, 'standard-choice'])),
    supportChanges: [
      {
        setting: 'text-size',
        from: 'standard',
        to: 'large',
        stage: 'intro',
        changedAt: '2026-07-20T12:00:30.000Z',
      },
    ],
  };
  return createStudyResultRecord({
    config: config(),
    participantCode: 'P-001',
    startedAt: '2026-07-20T12:01:00.000Z',
    completedAt: '2026-07-20T12:05:00.000Z',
    submissionId: 'submission-fixed',
    pairPresentationOrder: pairs.map(({ id }) => id),
    pairwiseChoices,
    result: calculateResult(pairs, pairwiseChoices, ratings),
    supportMetadata: metadata,
  });
}

beforeEach(() => {
  localStorage.clear();
});

describe('study configuration', () => {
  it('round-trips a versioned UTF-8 configuration in the participant-link fragment', () => {
    const source = config();
    const encoded = encodeStudyConfig(source);
    expect(decodeStudyConfig(encoded)).toEqual(source);

    const url = new URL(buildParticipantUrl('https://example.test/index.html?discard=yes', source));
    expect(url.search).toBe('');
    expect(url.hash).toContain('study=');
    expect(decodeStudyConfig(new URLSearchParams(url.hash.slice(1)).get('study')!)).toEqual(source);
  });

  it('rejects identifiers that could mix study records or contain personal prose', () => {
    expect(() => createStudyConfig({
      studyId: 'invalid study id',
      studyTitle: 'Title',
      taskLabel: 'Task',
      showScoreToParticipant: false,
      support,
      collection: { mode: 'local' },
    })).toThrow(/Study ID/);
  });

  it('migrates a valid Version 0.7 configuration to the weighted NASA definition', () => {
    const current = config();
    const legacy = {
      ...current,
      schemaVersion: 3,
      prototypeVersion: '0.7.0',
    } as Record<string, unknown>;
    delete legacy.instrumentId;
    const migrated = normaliseStudyConfig(legacy);
    expect(migrated?.schemaVersion).toBe(4);
    expect(migrated?.prototypeVersion).toBe('0.8.0');
    expect(migrated?.instrumentId).toBe('nasa-tlx-weighted');
    expect(migrated?.configId).toBe(current.configId);
  });

  it('refuses instrument-incompatible support instead of silently changing SUS', () => {
    expect(() => createStudyConfig({
      instrumentId: 'system-usability-scale',
      studyId: 'SUS-01',
      studyTitle: 'SUS study',
      taskLabel: 'using the test system',
      showScoreToParticipant: false,
      support,
      collection: { mode: 'local' },
    })).toThrow(/not compatible/i);
  });

  it('round-trips a researcher-supplied definition inside the reproducible participant configuration', () => {
    const draft = createCustomQuestionnaireDraft();
    draft.name = 'Two-item task check';
    draft.shortName = 'TTC';
    draft.items = [
      createCustomItemDraft({
        name: 'Clear',
        prompt: 'The task was clear.',
        lowAnchor: 'Not clear',
        highAnchor: 'Very clear',
      }),
      createCustomItemDraft({
        name: 'Easy',
        prompt: 'The task was easy.',
        lowAnchor: 'Not easy',
        highAnchor: 'Very easy',
      }),
    ];
    const definition = createCustomQuestionnaireDefinition(draft);
    const customConfig = createStudyConfig({
      instrumentId: definition.id,
      questionnaireDefinition: definition,
      studyId: 'CUSTOM-01',
      studyTitle: 'Custom questionnaire study',
      taskLabel: 'using the prototype',
      showScoreToParticipant: false,
      support: {
        ...support,
        showSimpleLanguage: false,
        answerMode: 'standard',
      },
      collection: { mode: 'local' },
    });
    expect(decodeStudyConfig(encodeStudyConfig(customConfig))).toEqual(customConfig);
    expect(customConfig.questionnaireDefinition).toEqual(definition);
    expect(() => createStudyConfig({
      ...customConfig,
      questionnaireDefinition: {
        ...definition,
        id: 'custom-different',
      },
    })).toThrow(/supported questionnaire/i);
  });
});

describe('completed result records', () => {
  it('stores a complete pseudonymous record and prevents duplicate submission IDs', () => {
    const result = record();
    expect(saveCompletedResult(result)).toBe(true);
    expect(saveCompletedResult(result)).toBe(true);
    const stored = loadCompletedResults();
    expect(stored).toHaveLength(1);
    expect(stored[0].participantCode).toBe('P-001');
    expect(Object.keys(stored[0].responses.pairwiseChoices)).toHaveLength(15);
    expect(stored[0].result.primaryScore).toBe(50);
    clearCompletedResults();
    expect(loadCompletedResults()).toEqual([]);
  });

  it('removes only the identified stale backup when an answer is edited before retry', () => {
    const first = record();
    const second = { ...record(), submissionId: 'submission-second' };
    expect(saveCompletedResult(first)).toBe(true);
    expect(saveCompletedResult(second)).toBe(true);
    expect(removeCompletedResult(first.submissionId)).toBe(true);
    expect(loadCompletedResults().map(({ submissionId }) => submissionId)).toEqual([
      'submission-second',
    ]);
  });

  it('reports a blocked or full browser store without throwing', () => {
    const unavailableStorage = {
      getItem: () => null,
      setItem: () => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      },
      removeItem: () => undefined,
    };
    expect(saveCompletedResult(record(), unavailableStorage)).toBe(false);
  });

  it('rejects a structurally plausible record when its calculated result was altered', () => {
    const altered = record();
    altered.result = { ...altered.result, primaryScore: 99 };
    localStorage.setItem(COMPLETED_RESULTS_KEY, JSON.stringify([altered]));
    expect(loadCompletedResults()).toEqual([]);
  });

  it('rejects undeclared answer keys rather than hiding them in a plausible record', () => {
    const altered = record();
    altered.responses.ratings.unregistered_item = 50;
    altered.result.ratings.unregistered_item = 50;
    localStorage.setItem(COMPLETED_RESULTS_KEY, JSON.stringify([altered]));
    expect(loadCompletedResults()).toEqual([]);
  });

  it('rejects an impossible support-change value instead of accepting corrupted provenance', () => {
    const altered = record();
    altered.supportMetadata.supportChanges[0].to = 'smiley';
    localStorage.setItem(COMPLETED_RESULTS_KEY, JSON.stringify([altered]));
    expect(loadCompletedResults()).toEqual([]);
  });

  it('exports stable CSV columns for scores, ratings, weights, pair choices and routes', () => {
    const csv = resultsToCsv([record()]);
    const [header, row] = csv.split('\r\n');
    expect(header).toContain('participant_code');
    expect(header).toContain('rating_mental');
    expect(header).toContain('weight_performance');
    expect(header).toContain('pair_mental-physical');
    expect(header).toContain('rating_route_frustration');
    expect(header).toContain('configured_gazeInputAvailable');
    expect(header).toContain('support_change_count');
    expect(row).toContain('P-001');
  });

  it('exports a union of NASA and SUS fields without dropping either instrument', () => {
    const definition = getQuestionnaireDefinition('system-usability-scale')!;
    const susRatings = Object.fromEntries(
      definition.items.map((item, index) => [item.id, index % 2 === 0 ? 5 : 1]),
    );
    const susConfig = createStudyConfig({
      instrumentId: definition.id,
      studyId: 'SUS-CSV-01',
      studyTitle: 'SUS CSV study',
      taskLabel: 'using the test system',
      showScoreToParticipant: false,
      support: {
        ...support,
        showSimpleLanguage: false,
        largeText: false,
      },
      collection: { mode: 'local' },
    });
    const susRecord = createStudyResultRecord({
      config: susConfig,
      participantCode: 'P-SUS-01',
      startedAt: '2026-07-27T12:00:00.000Z',
      completedAt: '2026-07-27T12:03:00.000Z',
      pairPresentationOrder: [],
      pairwiseChoices: {},
      result: scoreQuestionnaire(definition, susRatings),
      supportMetadata: {
        ...record().supportMetadata,
        simplerExplanationsShownAtSubmission: false,
        largeTextUsedAtSubmission: false,
        ratingInputRoutes: Object.fromEntries(
          definition.items.map(({ id }) => [id, 'standard-scale']),
        ),
        pairInputRoutes: {},
        supportChanges: [],
      },
    });
    const csv = resultsToCsv([record(), susRecord]);
    const [header, nasaRow, susRow] = csv.split('\r\n');
    expect(header).toContain('rating_mental');
    expect(header).toContain('weight_mental');
    expect(header).toContain('rating_sus01');
    expect(header).toContain('score_contribution_sus01');
    expect(nasaRow).toContain('nasa-tlx-weighted');
    expect(susRow).toContain('system-usability-scale');
  });

  it('validates and exports a custom questionnaire record with its immutable definition snapshot', () => {
    const draft = createCustomQuestionnaireDraft();
    draft.name = 'Task confidence check';
    draft.shortName = 'TCC';
    draft.items = [
      createCustomItemDraft({
        name: 'Confidence',
        prompt: 'I was confident.',
        lowAnchor: 'Not confident',
        highAnchor: 'Very confident',
      }),
    ];
    const definition = createCustomQuestionnaireDefinition(draft);
    const customConfig = createStudyConfig({
      instrumentId: definition.id,
      questionnaireDefinition: definition,
      studyId: 'CUSTOM-RESULT-01',
      studyTitle: 'Custom result study',
      taskLabel: 'using the test system',
      showScoreToParticipant: false,
      support: {
        ...support,
        showSimpleLanguage: false,
        answerMode: 'standard',
      },
      collection: { mode: 'local' },
    });
    const customRecord = createStudyResultRecord({
      config: customConfig,
      participantCode: 'P-CUSTOM-01',
      startedAt: '2026-07-29T12:00:00.000Z',
      completedAt: '2026-07-29T12:01:00.000Z',
      pairPresentationOrder: [],
      pairwiseChoices: {},
      result: scoreQuestionnaire(definition, { 'item-01': 4 }),
      supportMetadata: {
        ...record().supportMetadata,
        simplerExplanationsShownAtSubmission: false,
        answerModeAtSubmission: 'standard',
        ratingInputRoutes: { 'item-01': 'standard-scale' },
        pairInputRoutes: {},
        supportChanges: [],
      },
    });
    expect(customRecord.instrument.definition).toEqual(definition);
    expect(saveCompletedResult(customRecord)).toBe(true);
    expect(loadCompletedResults()).toContainEqual(customRecord);
    const csv = resultsToCsv([customRecord]);
    expect(csv).toContain('questionnaire_definition_json');
    expect(csv).toContain('custom-tcc');
    expect(csv).toContain('rating_item-01');
  });
});
