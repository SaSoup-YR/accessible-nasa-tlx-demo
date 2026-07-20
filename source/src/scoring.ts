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
  const weights = calculateWeights(pairs, pairResponses);
  const adjustedRatings = Object.fromEntries(
    dimensions.map(({ id }) => {
      const rating = ratings[id];
      if (!Number.isInteger(rating) || rating < 0 || rating > 100 || rating % 5 !== 0) {
        throw new Error(`Invalid rating for ${id}`);
      }
      return [id, weights[id] * rating];
    }),
  ) as Record<DimensionId, number>;

  const weightedScore =
    Object.values(adjustedRatings).reduce((sum, value) => sum + value, 0) / pairs.length;

  return { weights, ratings, adjustedRatings, weightedScore };
}

