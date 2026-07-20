// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { dimensions, pairs, type DimensionId } from '../src/nasa-tlx';
import {
  buildParticipantUrl,
  clearCompletedResults,
  createStudyConfig,
  createStudyResultRecord,
  decodeStudyConfig,
  encodeStudyConfig,
  loadCompletedResults,
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
  allowParticipantChanges: true,
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
    },
    { configId: 'config-fixed', createdAt: '2026-07-20T12:00:00.000Z' },
  );
}

function record() {
  const ratings = Object.fromEntries(dimensions.map(({ id }) => [id, 50])) as Record<DimensionId, number>;
  const weights = Object.fromEntries(dimensions.map(({ id }, index) => [id, index])) as Record<DimensionId, number>;
  const adjustedRatings = Object.fromEntries(dimensions.map(({ id }, index) => [id, index * 50])) as Record<DimensionId, number>;
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
  };
  return createStudyResultRecord({
    config: config(),
    participantCode: 'P-001',
    startedAt: '2026-07-20T12:01:00.000Z',
    completedAt: '2026-07-20T12:05:00.000Z',
    submissionId: 'submission-fixed',
    pairPresentationOrder: pairs.map(({ id }) => id),
    pairwiseChoices,
    result: { ratings, weights, adjustedRatings, weightedScore: 50 },
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
    })).toThrow(/Study ID/);
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
    expect(stored[0].result.weightedScore).toBe(50);
    clearCompletedResults();
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
    expect(row).toContain('P-001');
  });
});
