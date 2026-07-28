import { nasaTlxDefinition } from './instrument-catalog';
import { createAllPairs } from './instrument-definition';

export type DimensionId =
  | 'mental'
  | 'physical'
  | 'temporal'
  | 'performance'
  | 'effort'
  | 'frustration';

export interface TlxDimension {
  id: DimensionId;
  name: string;
  lowAnchor: string;
  highAnchor: string;
  officialDefinition: string;
  simpleExplanation: string;
  shortMeaning: string;
}

const dimensionIds = [
  'mental',
  'physical',
  'temporal',
  'performance',
  'effort',
  'frustration',
] as const satisfies readonly DimensionId[];

const configuredDimensionIds =
  nasaTlxDefinition.scoring.strategy === 'weighted-pairwise'
    ? nasaTlxDefinition.scoring.itemIds
    : [];
if (
  configuredDimensionIds.length !== dimensionIds.length ||
  dimensionIds.some((id, index) => configuredDimensionIds[index] !== id)
) {
  throw new Error('The NASA-TLX definition does not contain the expected six dimensions in order.');
}

const itemById = new Map(nasaTlxDefinition.items.map((item) => [item.id, item]));

export const dimensions: readonly TlxDimension[] = dimensionIds.map((id) => {
  const item = itemById.get(id);
  if (!item) throw new Error(`The NASA-TLX definition is missing ${id}.`);
  return {
    id,
    name: item.title,
    lowAnchor: item.input.lowLabel,
    highAnchor: item.input.highLabel,
    officialDefinition: item.prompt,
    simpleExplanation: item.simplePrompt ?? item.prompt,
    shortMeaning: item.shortLabel ?? item.title,
  };
});

export const dimensionById = new Map<DimensionId, TlxDimension>(
  dimensions.map((dimension) => [dimension.id, dimension]),
);

export interface TlxPair {
  id: string;
  left: DimensionId;
  right: DimensionId;
}

export const pairs: readonly TlxPair[] = createAllPairs(
  dimensionIds,
  nasaTlxDefinition.workflow.pairwise?.pairIdSeparator,
).map(({ id, left, right }) => ({
  id,
  left: left as DimensionId,
  right: right as DimensionId,
}));

const ratingScale = nasaTlxDefinition.items[0].input;
if (
  nasaTlxDefinition.items.some(
    (item) =>
      item.input.min !== ratingScale.min ||
      item.input.max !== ratingScale.max ||
      item.input.step !== ratingScale.step,
  )
) {
  throw new Error('The legacy NASA-TLX renderer requires one shared numeric scale.');
}

export const ratingValues = Array.from(
  { length: ((ratingScale.max - ratingScale.min) / ratingScale.step) + 1 },
  (_, index) => ratingScale.min + (index * ratingScale.step),
);

export interface SmileyLandmark {
  value: 0 | 25 | 50 | 75 | 100;
  cue: string;
}

const expectedLandmarkValues = new Set([0, 25, 50, 75, 100]);
const configuredLandmarks = ratingScale.landmarks ?? [];
if (
  configuredLandmarks.length !== expectedLandmarkValues.size ||
  configuredLandmarks.some(({ value }) => !expectedLandmarkValues.has(value))
) {
  throw new Error('The NASA-TLX smiley presentation requires five configured landmark values.');
}
export const smileyLandmarks: readonly SmileyLandmark[] = configuredLandmarks.map(
  ({ value, cue }) => {
    if (!expectedLandmarkValues.has(value) || !cue) {
      throw new Error('The NASA-TLX smiley presentation requires five configured landmark cues.');
    }
    return { value: value as SmileyLandmark['value'], cue };
  },
);
