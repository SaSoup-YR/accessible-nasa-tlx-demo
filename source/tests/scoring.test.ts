import { describe, expect, it } from 'vitest';
import { dimensions, pairs, type DimensionId } from '../src/nasa-tlx';
import { calculateResult, calculateWeights, type PairResponses, type Ratings } from '../src/scoring';

function chooseLeftForEveryPair(): PairResponses {
  return Object.fromEntries(pairs.map((pair) => [pair.id, pair.left])) as PairResponses;
}

describe('NASA-TLX scoring', () => {
  it('produces six weights totalling fifteen and no weight above five', () => {
    const weights = calculateWeights(pairs, chooseLeftForEveryPair());
    expect(Object.values(weights).reduce((sum, value) => sum + value, 0)).toBe(15);
    expect(Math.max(...Object.values(weights))).toBeLessThanOrEqual(5);
  });

  it('calculates a deterministic weighted score', () => {
    const ratings = Object.fromEntries(
      dimensions.map(({ id }, index) => [id, index * 20]),
    ) as Ratings;
    const result = calculateResult(pairs, chooseLeftForEveryPair(), ratings);

    const expected = dimensions.reduce(
      (sum, { id }) => sum + result.weights[id] * ratings[id],
      0,
    ) / 15;
    expect(result.weightedScore).toBe(expected);
  });

  it('rejects a missing pair response', () => {
    const responses = chooseLeftForEveryPair();
    delete responses[pairs[0].id];
    expect(() => calculateWeights(pairs, responses)).toThrow(/Missing or invalid response/);
  });

  it('rejects a rating outside the official increments', () => {
    const ratings = Object.fromEntries(dimensions.map(({ id }) => [id, 50])) as Ratings;
    ratings.mental = 52;
    expect(() => calculateResult(pairs, chooseLeftForEveryPair(), ratings)).toThrow(/Invalid rating/);
  });

  it('keeps dimension identifiers explicit', () => {
    const ids: DimensionId[] = dimensions.map(({ id }) => id);
    expect(ids).toEqual(['mental', 'physical', 'temporal', 'performance', 'effort', 'frustration']);
  });
});

