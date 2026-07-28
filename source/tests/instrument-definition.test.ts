import { describe, expect, it } from 'vitest';
import {
  builtInInstrumentDefinitions,
  nasaTlxDefinition,
  susScoringProfile,
} from '../src/instrument-catalog';
import {
  createAllPairs,
  parseInstrumentDefinitionJson,
  scoreInstrument,
  validateInstrumentDefinition,
  type InstrumentDefinition,
} from '../src/instrument-definition';
import { dimensions, pairs } from '../src/nasa-tlx';
import { calculateResult, type PairResponses, type Ratings } from '../src/scoring';

function nasaResponses() {
  const ratings = Object.fromEntries(
    dimensions.map(({ id }, index) => [id, index * 20]),
  ) as Ratings;
  const pairwiseResponses = Object.fromEntries(
    pairs.map((pair) => [pair.id, pair.left]),
  ) as PairResponses;
  return { ratings, pairwiseResponses };
}

describe('external instrument definitions', () => {
  it('loads two independently validated built-in profiles', () => {
    expect([...builtInInstrumentDefinitions.keys()]).toEqual([
      'nasa-tlx-weighted',
      'sus-scoring-profile',
    ]);
    expect(validateInstrumentDefinition(nasaTlxDefinition)).toEqual([]);
    expect(validateInstrumentDefinition(susScoringProfile)).toEqual([]);
    expect(parseInstrumentDefinitionJson(JSON.stringify(nasaTlxDefinition)).id).toBe(
      'nasa-tlx-weighted',
    );
    expect(() => parseInstrumentDefinitionJson('{')).toThrow(/not valid JSON/);
  });

  it('drives the legacy NASA-TLX content and pair generation from JSON', () => {
    expect(dimensions.map(({ id }) => id)).toEqual(
      nasaTlxDefinition.workflow.sections[0].itemIds,
    );
    expect(dimensions.map(({ name }) => name)).toEqual(
      nasaTlxDefinition.items.map(({ title }) => title),
    );
    expect(pairs).toEqual(
      createAllPairs(
        nasaTlxDefinition.workflow.pairwise!.sourceItemIds,
        nasaTlxDefinition.workflow.pairwise!.pairIdSeparator,
      ),
    );
  });

  it('preserves the established NASA-TLX result through the generic scoring engine', () => {
    const { ratings, pairwiseResponses } = nasaResponses();
    const legacy = calculateResult(pairs, pairwiseResponses, ratings);
    const generic = scoreInstrument(nasaTlxDefinition, {
      itemResponses: ratings,
      pairwiseResponses,
    });

    expect(generic.primaryScore).toBe(legacy.weightedScore);
    expect(generic.details?.weights).toEqual(legacy.weights);
    expect(generic.details?.adjustedRatings).toEqual(legacy.adjustedRatings);
  });

  it('scores a non-TLX ten-item five-point profile without NASA-specific code', () => {
    const midpoint = Object.fromEntries(
      susScoringProfile.items.map(({ id }) => [id, 3]),
    );
    const midpointScore = scoreInstrument(susScoringProfile, {
      itemResponses: midpoint,
    });
    expect(midpointScore.primaryLabel).toBe('SUS score');
    expect(midpointScore.primaryScore).toBe(50);

    const favourable = Object.fromEntries(
      susScoringProfile.items.map(({ id }, index) => [id, index % 2 === 0 ? 5 : 1]),
    );
    expect(
      scoreInstrument(susScoringProfile, { itemResponses: favourable }).primaryScore,
    ).toBe(100);
  });

  it('rejects unknown references, invalid ranges and executable scoring strategies', () => {
    const unknownReference = structuredClone(susScoringProfile) as InstrumentDefinition;
    unknownReference.workflow.sections[0].itemIds.push('missing-item');
    expect(validateInstrumentDefinition(unknownReference)).toContain(
      'workflow.sections[0].itemIds references an unknown item: missing-item.',
    );

    const invalidRange = structuredClone(susScoringProfile) as InstrumentDefinition;
    invalidRange.items[0].input.step = 3;
    expect(validateInstrumentDefinition(invalidRange)).toContain(
      'items[0].input.step must divide the scale range exactly.',
    );

    const executable = structuredClone(susScoringProfile) as unknown as Record<string, unknown>;
    executable.scoring = { strategy: 'javascript', source: 'return responses;' };
    expect(validateInstrumentDefinition(executable)).toContain(
      'Unsupported scoring strategy: javascript.',
    );
  });

  it('rejects incomplete or out-of-range responses before scoring', () => {
    const responses = Object.fromEntries(
      susScoringProfile.items.map(({ id }) => [id, 3]),
    );
    delete responses['sus-10'];
    expect(() =>
      scoreInstrument(susScoringProfile, { itemResponses: responses }),
    ).toThrow(/Missing or invalid response for sus-10/);

    responses['sus-10'] = 6;
    expect(() =>
      scoreInstrument(susScoringProfile, { itemResponses: responses }),
    ).toThrow(/Missing or invalid response for sus-10/);
  });
});
