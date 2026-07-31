import { dimensions as nasaDimensions, type DimensionId, type TlxPair } from './nasa-tlx';
import {
  buildQuestionnairePairs,
  type QuestionnaireDefinition,
  type QuestionnairePair,
} from './questionnaire-definition';

export type PairResponses = Record<string, DimensionId>;
export type Ratings = Record<DimensionId, number>;

export interface QuestionnaireScore {
  strategy: QuestionnaireDefinition['scoring']['strategy'];
  scoreName: string;
  primaryScore: number;
  scoreMinimum: number;
  scoreMaximum: number;
  ratings: Ratings;
  details:
    | {
        kind: 'weighted-pairwise';
        weights: Record<DimensionId, number>;
        adjustedRatings: Record<DimensionId, number>;
      }
    | {
        kind: 'sus-contributions';
        contributions: Record<DimensionId, number>;
      }
    | {
        kind: 'raw-mean';
        contributions: Record<DimensionId, number>;
      }
    | {
        kind: 'ueqs-subscales';
        contributions: Record<DimensionId, number>;
        pragmaticQuality: number;
        hedonicQuality: number;
      }
    | {
        kind: 'generic-aggregate';
        aggregation: 'mean' | 'sum';
        contributions: Record<DimensionId, number>;
        adjustedRatings: Record<DimensionId, number>;
        reversedItemIds: DimensionId[];
      };
}

export interface TlxResult extends QuestionnaireScore {
  strategy: 'nasa-tlx-weighted-v1';
  weights: Record<DimensionId, number>;
  adjustedRatings: Record<DimensionId, number>;
  weightedScore: number;
  details: {
    kind: 'weighted-pairwise';
    weights: Record<DimensionId, number>;
    adjustedRatings: Record<DimensionId, number>;
  };
}

function calculateWeightsForItems(
  itemIds: readonly string[],
  pairs: readonly QuestionnairePair[],
  responses: PairResponses,
): Record<DimensionId, number> {
  const weights = Object.fromEntries(itemIds.map((id) => [id, 0])) as Record<DimensionId, number>;
  for (const pair of pairs) {
    const selected = responses[pair.id];
    if (selected !== pair.left && selected !== pair.right) {
      throw new Error(`Missing or invalid response for pair ${pair.id}`);
    }
    weights[selected] += 1;
  }
  return weights;
}

export function calculateWeights(
  pairs: readonly TlxPair[],
  responses: PairResponses,
): Record<DimensionId, number> {
  return calculateWeightsForItems(
    nasaDimensions.map(({ id }) => id),
    pairs,
    responses,
  );
}

function validateRatings(definition: QuestionnaireDefinition, ratings: Ratings) {
  const { minimum, maximum, step } = definition.scale;
  for (const item of definition.items) {
    const rating = ratings[item.id];
    if (
      !Number.isInteger(rating) ||
      rating < minimum ||
      rating > maximum ||
      (rating - minimum) % step !== 0
    ) {
      throw new Error(`Invalid rating for ${item.id}`);
    }
  }
}

function scoreWeightedPairwise(
  definition: QuestionnaireDefinition,
  pairResponses: PairResponses,
  ratings: Ratings,
): TlxResult {
  validateRatings(definition, ratings);
  const pairs = buildQuestionnairePairs(definition);
  if (!pairs.length) throw new Error('The weighted pairwise scorer requires comparisons.');
  const weights = calculateWeightsForItems(
    definition.items.map(({ id }) => id),
    pairs,
    pairResponses,
  );
  const adjustedRatings = Object.fromEntries(
    definition.items.map(({ id }) => [id, weights[id] * ratings[id]]),
  ) as Record<DimensionId, number>;
  const weightedScore =
    Object.values(adjustedRatings).reduce((sum, value) => sum + value, 0) / pairs.length;
  return {
    strategy: 'nasa-tlx-weighted-v1',
    scoreName: definition.scoring.scoreName,
    primaryScore: weightedScore,
    scoreMinimum: definition.scoring.minimum,
    scoreMaximum: definition.scoring.maximum,
    ratings,
    weights,
    adjustedRatings,
    weightedScore,
    details: {
      kind: 'weighted-pairwise',
      weights,
      adjustedRatings,
    },
  };
}

function scoreSus(
  definition: QuestionnaireDefinition,
  ratings: Ratings,
): QuestionnaireScore {
  validateRatings(definition, ratings);
  const contributions = Object.fromEntries(
    definition.items.map((item, index) => [
      item.id,
      index % 2 === 0 ? ratings[item.id] - 1 : 5 - ratings[item.id],
    ]),
  ) as Record<DimensionId, number>;
  const score = Object.values(contributions).reduce((sum, value) => sum + value, 0) * 2.5;
  return {
    strategy: 'sus-standard-v1',
    scoreName: definition.scoring.scoreName,
    primaryScore: score,
    scoreMinimum: definition.scoring.minimum,
    scoreMaximum: definition.scoring.maximum,
    ratings,
    details: {
      kind: 'sus-contributions',
      contributions,
    },
  };
}

function scoreRawTlx(
  definition: QuestionnaireDefinition,
  ratings: Ratings,
): QuestionnaireScore {
  validateRatings(definition, ratings);
  const divisor = definition.items.length;
  const contributions = Object.fromEntries(
    definition.items.map((item) => [item.id, ratings[item.id] / divisor]),
  ) as Record<DimensionId, number>;
  const score = Object.values(ratings).reduce((sum, value) => sum + value, 0) / divisor;
  return {
    strategy: 'nasa-tlx-raw-v1',
    scoreName: definition.scoring.scoreName,
    primaryScore: score,
    scoreMinimum: definition.scoring.minimum,
    scoreMaximum: definition.scoring.maximum,
    ratings,
    details: {
      kind: 'raw-mean',
      contributions,
    },
  };
}

function scoreUeqs(
  definition: QuestionnaireDefinition,
  ratings: Ratings,
): QuestionnaireScore {
  validateRatings(definition, ratings);
  const contributions = Object.fromEntries(
    definition.items.map((item) => [item.id, ratings[item.id] - 4]),
  ) as Record<DimensionId, number>;
  const mean = (ids: readonly string[]) =>
    ids.reduce((sum, id) => sum + contributions[id], 0) / ids.length;
  const pragmaticIds = definition.items.slice(0, 4).map(({ id }) => id);
  const hedonicIds = definition.items.slice(4).map(({ id }) => id);
  return {
    strategy: 'ueqs-standard-v1',
    scoreName: definition.scoring.scoreName,
    primaryScore: mean(definition.items.map(({ id }) => id)),
    scoreMinimum: definition.scoring.minimum,
    scoreMaximum: definition.scoring.maximum,
    ratings,
    details: {
      kind: 'ueqs-subscales',
      contributions,
      pragmaticQuality: mean(pragmaticIds),
      hedonicQuality: mean(hedonicIds),
    },
  };
}

function scoreGenericAggregate(
  definition: QuestionnaireDefinition,
  ratings: Ratings,
): QuestionnaireScore {
  validateRatings(definition, ratings);
  const aggregation = definition.scoring.strategy === 'mean-v1' ? 'mean' : 'sum';
  const reversedItemIds = definition.scoring.reverseItemIds ?? [];
  const reversed = new Set(reversedItemIds);
  const { minimum, maximum } = definition.scale;
  const adjustedRatings = Object.fromEntries(
    definition.items.map(({ id }) => [
      id,
      reversed.has(id) ? minimum + maximum - ratings[id] : ratings[id],
    ]),
  ) as Record<DimensionId, number>;
  const divisor = aggregation === 'mean' ? definition.items.length : 1;
  const contributions = Object.fromEntries(
    definition.items.map(({ id }) => [id, adjustedRatings[id] / divisor]),
  ) as Record<DimensionId, number>;
  const primaryScore = Object.values(contributions).reduce(
    (sum, contribution) => sum + contribution,
    0,
  );
  return {
    strategy: definition.scoring.strategy,
    scoreName: definition.scoring.scoreName,
    primaryScore,
    scoreMinimum: definition.scoring.minimum,
    scoreMaximum: definition.scoring.maximum,
    ratings,
    details: {
      kind: 'generic-aggregate',
      aggregation,
      contributions,
      adjustedRatings,
      reversedItemIds: [...reversedItemIds],
    },
  };
}

export function scoreQuestionnaire(
  definition: QuestionnaireDefinition,
  ratings: Ratings,
  pairResponses: PairResponses = {},
): QuestionnaireScore {
  if (definition.scoring.strategy === 'nasa-tlx-weighted-v1') {
    return scoreWeightedPairwise(definition, pairResponses, ratings);
  }
  if (definition.scoring.strategy === 'nasa-tlx-raw-v1') {
    return scoreRawTlx(definition, ratings);
  }
  if (definition.scoring.strategy === 'sus-standard-v1') {
    return scoreSus(definition, ratings);
  }
  if (definition.scoring.strategy === 'ueqs-standard-v1') {
    return scoreUeqs(definition, ratings);
  }
  if (
    definition.scoring.strategy === 'mean-v1' ||
    definition.scoring.strategy === 'sum-v1'
  ) {
    return scoreGenericAggregate(definition, ratings);
  }
  const exhaustive: never = definition.scoring.strategy;
  throw new Error(`Unsupported scoring strategy: ${exhaustive}`);
}

/**
 * NASA-TLX compatibility API. New platform code calls scoreQuestionnaire with a
 * validated definition; this wrapper preserves the established public tests.
 */
export function calculateResult(
  pairs: readonly TlxPair[],
  pairResponses: PairResponses,
  ratings: Ratings,
): TlxResult {
  const definition: QuestionnaireDefinition = {
    schemaVersion: 1,
    language: 'en-GB',
    id: 'nasa-tlx-weighted',
    version: 'compatibility',
    name: 'NASA Task Load Index',
    shortName: 'NASA-TLX',
    description: 'Compatibility scoring definition.',
    introPrompt: 'Think about the completed task.',
    officialContentNotice: 'NASA-TLX scoring.',
    source: { label: 'NASA-TLX', url: 'https://www.nasa.gov/' },
    scale: { type: 'magnitude', minimum: 0, maximum: 100, step: 5 },
    items: [...nasaDimensions],
    pairwise: {
      mode: 'all-pairs',
      prompt: 'Which factor contributed more?',
      instruction: 'Choose one factor.',
      simplePrompt: 'Choose one factor.',
    },
    scoring: {
      strategy: 'nasa-tlx-weighted-v1',
      scoreName: 'Weighted workload score',
      minimum: 0,
      maximum: 100,
    },
    supports: { simplerExplanations: true, smileyLandmarks: true },
  };
  // Honour the supplied order while preserving the established API.
  const weights = calculateWeightsForItems(
    nasaDimensions.map(({ id }) => id),
    pairs,
    pairResponses,
  );
  validateRatings(definition, ratings);
  const adjustedRatings = Object.fromEntries(
    nasaDimensions.map(({ id }) => [id, weights[id] * ratings[id]]),
  ) as Record<DimensionId, number>;
  const weightedScore =
    Object.values(adjustedRatings).reduce((sum, value) => sum + value, 0) / pairs.length;
  return {
    strategy: 'nasa-tlx-weighted-v1',
    scoreName: 'Weighted workload score',
    primaryScore: weightedScore,
    scoreMinimum: 0,
    scoreMaximum: 100,
    ratings,
    weights,
    adjustedRatings,
    weightedScore,
    details: { kind: 'weighted-pairwise', weights, adjustedRatings },
  };
}
