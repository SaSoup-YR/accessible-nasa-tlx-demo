import { nasaTlxDefinition } from './instrument-catalog';
import { createAllPairs, scoreInstrument } from './instrument-definition';
import { dimensions, type DimensionId, type TlxPair } from './nasa-tlx';

export type PairResponses = Record<string, DimensionId>;
export type Ratings = Record<DimensionId, number>;

export interface TlxResult {
  weights: Record<DimensionId, number>;
  ratings: Ratings;
  adjustedRatings: Record<DimensionId, number>;
  weightedScore: number;
}

export function calculateWeights(
  pairs: readonly TlxPair[],
  responses: PairResponses,
): Record<DimensionId, number> {
  const weights = Object.fromEntries(dimensions.map(({ id }) => [id, 0])) as Record<DimensionId, number>;

  for (const pair of pairs) {
    const selected = responses[pair.id];
    if (selected !== pair.left && selected !== pair.right) {
      throw new Error(`Missing or invalid response for pair ${pair.id}`);
    }
    weights[selected] += 1;
  }

  return weights;
}

export function calculateResult(
  pairs: readonly TlxPair[],
  pairResponses: PairResponses,
  ratings: Ratings,
): TlxResult {
  const scoring = nasaTlxDefinition.scoring;
  if (scoring.strategy !== 'weighted-pairwise' || !nasaTlxDefinition.workflow.pairwise) {
    throw new Error('The NASA-TLX definition does not use weighted pairwise scoring.');
  }
  const expectedPairIds = new Set(
    createAllPairs(
      scoring.itemIds,
      nasaTlxDefinition.workflow.pairwise.pairIdSeparator,
    ).map(({ id }) => id),
  );
  if (
    pairs.length !== expectedPairIds.size ||
    pairs.some(({ id }) => !expectedPairIds.has(id))
  ) {
    throw new Error('The supplied pairs do not match the NASA-TLX definition.');
  }
  calculateWeights(pairs, pairResponses);
  for (const { id } of dimensions) {
    const rating = ratings[id];
    if (!Number.isInteger(rating) || rating < 0 || rating > 100 || rating % 5 !== 0) {
      throw new Error(`Invalid rating for ${id}`);
    }
  }
  const score = scoreInstrument(nasaTlxDefinition, {
    itemResponses: ratings,
    pairwiseResponses: pairResponses,
  });
  if (score.primaryScore === null || !score.details) {
    throw new Error('The NASA-TLX scoring profile did not return a weighted score.');
  }
  const weights = Object.fromEntries(
    dimensions.map(({ id }) => [id, score.details!.weights[id]]),
  ) as Record<DimensionId, number>;
  const adjustedRatings = Object.fromEntries(
    dimensions.map(({ id }) => [id, score.details!.adjustedRatings[id]]),
  ) as Record<DimensionId, number>;

  return {
    weights,
    ratings,
    adjustedRatings,
    weightedScore: score.primaryScore,
  };
}
