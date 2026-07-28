export interface InstrumentScale {
  type: 'numeric-scale';
  min: number;
  max: number;
  step: number;
  lowLabel: string;
  highLabel: string;
  landmarks?: Array<{
    value: number;
    label: string;
    cue?: string;
  }>;
}

export interface InstrumentItemDefinition {
  id: string;
  title: string;
  prompt: string;
  simplePrompt?: string;
  shortLabel?: string;
  voiceAliases?: string[];
  input: InstrumentScale;
}

export interface InstrumentSectionDefinition {
  id: string;
  title: string;
  instructions: string;
  itemIds: string[];
}

export interface PairwisePhaseDefinition {
  id: string;
  title: string;
  prompt: string;
  simplePrompt?: string;
  sourceItemIds: string[];
  pairIdSeparator?: string;
}

export interface LinearTransform {
  multiplier: number;
  offset: number;
}

export interface LinearComponentDefinition {
  id: string;
  label: string;
  itemIds: string[];
  transforms?: Record<string, LinearTransform>;
  aggregate: 'sum' | 'mean';
  finalMultiplier?: number;
  finalOffset?: number;
  range?: {
    min: number;
    max: number;
  };
}

export type InstrumentScoringDefinition =
  | {
      strategy: 'unscored';
    }
  | {
      strategy: 'linear-composite';
      primaryComponentId: string;
      components: LinearComponentDefinition[];
    }
  | {
      strategy: 'weighted-pairwise';
      itemIds: string[];
      primaryLabel: string;
      range: {
        min: number;
        max: number;
      };
    };

export interface InstrumentDefinition {
  schemaVersion: 1;
  id: string;
  name: string;
  shortName: string;
  version: string;
  description: string;
  provenance: {
    citation: string;
    sourceUrl: string;
    contentNote?: string;
  };
  items: InstrumentItemDefinition[];
  workflow: {
    sections: InstrumentSectionDefinition[];
    pairwise?: PairwisePhaseDefinition;
  };
  scoring: InstrumentScoringDefinition;
}

export interface InstrumentResponses {
  itemResponses: Record<string, number>;
  pairwiseResponses?: Record<string, string>;
}

export interface WeightedPairwiseScoreDetails {
  weights: Record<string, number>;
  adjustedRatings: Record<string, number>;
}

export interface InstrumentScore {
  instrumentId: string;
  strategy: InstrumentScoringDefinition['strategy'];
  primaryScore: number | null;
  primaryLabel: string | null;
  components: Record<string, number>;
  itemScores: Record<string, number>;
  details?: WeightedPairwiseScoreDetails;
}

const ID_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && Boolean(value.trim());
}

function finiteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function validateId(value: unknown, path: string, issues: string[]) {
  if (!nonEmptyString(value) || !ID_PATTERN.test(value)) {
    issues.push(`${path} must use lowercase letters, numbers, dots, underscores or hyphens.`);
  }
}

function duplicateValues(values: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

function validScaleValue(value: number, scale: InstrumentScale) {
  if (value < scale.min || value > scale.max) return false;
  const steps = (value - scale.min) / scale.step;
  return Math.abs(steps - Math.round(steps)) < 1e-9;
}

export function createAllPairs(itemIds: readonly string[], separator = '--') {
  return itemIds.flatMap((left, leftIndex) =>
    itemIds.slice(leftIndex + 1).map((right) => ({
      id: `${left}${separator}${right}`,
      left,
      right,
    })),
  );
}

export function validateInstrumentDefinition(value: unknown): string[] {
  const issues: string[] = [];
  if (!isRecord(value)) return ['Definition must be a JSON object.'];
  if (value.schemaVersion !== 1) issues.push('schemaVersion must be 1.');
  validateId(value.id, 'id', issues);
  for (const field of ['name', 'shortName', 'version', 'description'] as const) {
    if (!nonEmptyString(value[field])) issues.push(`${field} is required.`);
  }

  if (!isRecord(value.provenance)) {
    issues.push('provenance is required.');
  } else {
    if (!nonEmptyString(value.provenance.citation)) issues.push('provenance.citation is required.');
    if (!nonEmptyString(value.provenance.sourceUrl)) issues.push('provenance.sourceUrl is required.');
    else {
      try {
        const source = new URL(value.provenance.sourceUrl);
        if (source.protocol !== 'https:') issues.push('provenance.sourceUrl must use HTTPS.');
      } catch {
        issues.push('provenance.sourceUrl must be an absolute URL.');
      }
    }
  }

  if (!Array.isArray(value.items) || value.items.length === 0) {
    issues.push('items must contain at least one item.');
    return issues;
  }

  const itemIds: string[] = [];
  value.items.forEach((candidate, index) => {
    const path = `items[${index}]`;
    if (!isRecord(candidate)) {
      issues.push(`${path} must be an object.`);
      return;
    }
    validateId(candidate.id, `${path}.id`, issues);
    if (typeof candidate.id === 'string') itemIds.push(candidate.id);
    for (const field of ['title', 'prompt'] as const) {
      if (!nonEmptyString(candidate[field])) issues.push(`${path}.${field} is required.`);
    }
    if (!isRecord(candidate.input) || candidate.input.type !== 'numeric-scale') {
      issues.push(`${path}.input must be a numeric-scale definition.`);
      return;
    }
    const { min, max, step, lowLabel, highLabel, landmarks } = candidate.input;
    if (!finiteNumber(min) || !finiteNumber(max) || !finiteNumber(step) || step <= 0 || min >= max) {
      issues.push(`${path}.input must have finite min < max values and a positive step.`);
    } else {
      const steps = (max - min) / step;
      if (Math.abs(steps - Math.round(steps)) >= 1e-9) {
        issues.push(`${path}.input.step must divide the scale range exactly.`);
      }
    }
    if (!nonEmptyString(lowLabel) || !nonEmptyString(highLabel)) {
      issues.push(`${path}.input requires lowLabel and highLabel.`);
    }
    if (landmarks !== undefined) {
      if (!Array.isArray(landmarks)) issues.push(`${path}.input.landmarks must be an array.`);
      else {
        const values: number[] = [];
        landmarks.forEach((landmark, landmarkIndex) => {
          if (!isRecord(landmark) || !finiteNumber(landmark.value) || !nonEmptyString(landmark.label)) {
            issues.push(`${path}.input.landmarks[${landmarkIndex}] is invalid.`);
            return;
          }
          values.push(landmark.value);
          if (
            finiteNumber(min) &&
            finiteNumber(max) &&
            finiteNumber(step) &&
            !validScaleValue(landmark.value, {
              type: 'numeric-scale',
              min,
              max,
              step,
              lowLabel: String(lowLabel),
              highLabel: String(highLabel),
            })
          ) {
            issues.push(`${path}.input.landmarks[${landmarkIndex}].value is outside the scale.`);
          }
        });
        if (new Set(values).size !== values.length) issues.push(`${path}.input.landmarks values must be unique.`);
      }
    }
  });

  for (const duplicate of duplicateValues(itemIds)) issues.push(`Duplicate item id: ${duplicate}.`);
  const itemIdSet = new Set(itemIds);

  if (!isRecord(value.workflow) || !Array.isArray(value.workflow.sections) || value.workflow.sections.length === 0) {
    issues.push('workflow.sections must contain at least one section.');
  } else {
    const sectionIds: string[] = [];
    value.workflow.sections.forEach((candidate, index) => {
      const path = `workflow.sections[${index}]`;
      if (!isRecord(candidate)) {
        issues.push(`${path} must be an object.`);
        return;
      }
      validateId(candidate.id, `${path}.id`, issues);
      if (typeof candidate.id === 'string') sectionIds.push(candidate.id);
      if (!nonEmptyString(candidate.title) || !nonEmptyString(candidate.instructions)) {
        issues.push(`${path} requires title and instructions.`);
      }
      if (!Array.isArray(candidate.itemIds) || candidate.itemIds.length === 0) {
        issues.push(`${path}.itemIds must not be empty.`);
      } else {
        for (const itemId of candidate.itemIds) {
          if (typeof itemId !== 'string' || !itemIdSet.has(itemId)) {
            issues.push(`${path}.itemIds references an unknown item: ${String(itemId)}.`);
          }
        }
      }
    });
    for (const duplicate of duplicateValues(sectionIds)) issues.push(`Duplicate section id: ${duplicate}.`);

    if (value.workflow.pairwise !== undefined) {
      const pairwise = value.workflow.pairwise;
      if (!isRecord(pairwise)) issues.push('workflow.pairwise must be an object.');
      else {
        validateId(pairwise.id, 'workflow.pairwise.id', issues);
        if (!nonEmptyString(pairwise.title) || !nonEmptyString(pairwise.prompt)) {
          issues.push('workflow.pairwise requires title and prompt.');
        }
        if (!Array.isArray(pairwise.sourceItemIds) || pairwise.sourceItemIds.length < 2) {
          issues.push('workflow.pairwise.sourceItemIds must contain at least two items.');
        } else {
          for (const itemId of pairwise.sourceItemIds) {
            if (typeof itemId !== 'string' || !itemIdSet.has(itemId)) {
              issues.push(`workflow.pairwise references an unknown item: ${String(itemId)}.`);
            }
          }
          if (new Set(pairwise.sourceItemIds).size !== pairwise.sourceItemIds.length) {
            issues.push('workflow.pairwise.sourceItemIds must be unique.');
          }
        }
        if (pairwise.pairIdSeparator !== undefined && !nonEmptyString(pairwise.pairIdSeparator)) {
          issues.push('workflow.pairwise.pairIdSeparator must not be empty.');
        }
      }
    }
  }

  if (!isRecord(value.scoring) || !nonEmptyString(value.scoring.strategy)) {
    issues.push('scoring.strategy is required.');
    return issues;
  }
  if (value.scoring.strategy === 'weighted-pairwise') {
    const pairwiseSourceItemIds =
      isRecord(value.workflow) &&
      isRecord(value.workflow.pairwise) &&
      Array.isArray(value.workflow.pairwise.sourceItemIds)
        ? value.workflow.pairwise.sourceItemIds
        : null;
    if (!isRecord(value.workflow) || !isRecord(value.workflow.pairwise)) {
      issues.push('weighted-pairwise scoring requires workflow.pairwise.');
    }
    if (!Array.isArray(value.scoring.itemIds) || value.scoring.itemIds.length < 2) {
      issues.push('weighted-pairwise scoring requires at least two itemIds.');
    } else {
      for (const itemId of value.scoring.itemIds) {
        if (typeof itemId !== 'string' || !itemIdSet.has(itemId)) {
          issues.push(`scoring.itemIds references an unknown item: ${String(itemId)}.`);
        }
      }
      if (
        pairwiseSourceItemIds &&
        (
          value.scoring.itemIds.length !== pairwiseSourceItemIds.length ||
          value.scoring.itemIds.some(
            (itemId, index) => itemId !== pairwiseSourceItemIds[index],
          )
        )
      ) {
        issues.push('scoring.itemIds must match workflow.pairwise.sourceItemIds in order.');
      }
    }
    if (!nonEmptyString(value.scoring.primaryLabel)) issues.push('scoring.primaryLabel is required.');
    if (
      !isRecord(value.scoring.range) ||
      !finiteNumber(value.scoring.range.min) ||
      !finiteNumber(value.scoring.range.max) ||
      value.scoring.range.min >= value.scoring.range.max
    ) {
      issues.push('scoring.range must contain finite min < max values.');
    }
  } else if (value.scoring.strategy === 'linear-composite') {
    if (!nonEmptyString(value.scoring.primaryComponentId)) {
      issues.push('scoring.primaryComponentId is required.');
    }
    if (!Array.isArray(value.scoring.components) || value.scoring.components.length === 0) {
      issues.push('linear-composite scoring requires components.');
    } else {
      const componentIds: string[] = [];
      value.scoring.components.forEach((candidate, index) => {
        const path = `scoring.components[${index}]`;
        if (!isRecord(candidate)) {
          issues.push(`${path} must be an object.`);
          return;
        }
        validateId(candidate.id, `${path}.id`, issues);
        if (typeof candidate.id === 'string') componentIds.push(candidate.id);
        if (!nonEmptyString(candidate.label)) issues.push(`${path}.label is required.`);
        if (candidate.aggregate !== 'sum' && candidate.aggregate !== 'mean') {
          issues.push(`${path}.aggregate must be sum or mean.`);
        }
        if (
          candidate.finalMultiplier !== undefined &&
          !finiteNumber(candidate.finalMultiplier)
        ) {
          issues.push(`${path}.finalMultiplier must be finite.`);
        }
        if (candidate.finalOffset !== undefined && !finiteNumber(candidate.finalOffset)) {
          issues.push(`${path}.finalOffset must be finite.`);
        }
        if (
          candidate.range !== undefined &&
          (
            !isRecord(candidate.range) ||
            !finiteNumber(candidate.range.min) ||
            !finiteNumber(candidate.range.max) ||
            candidate.range.min >= candidate.range.max
          )
        ) {
          issues.push(`${path}.range must contain finite min < max values.`);
        }
        if (!Array.isArray(candidate.itemIds) || candidate.itemIds.length === 0) {
          issues.push(`${path}.itemIds must not be empty.`);
        } else {
          for (const itemId of candidate.itemIds) {
            if (typeof itemId !== 'string' || !itemIdSet.has(itemId)) {
              issues.push(`${path}.itemIds references an unknown item: ${String(itemId)}.`);
            }
          }
        }
        if (candidate.transforms !== undefined) {
          if (!isRecord(candidate.transforms)) issues.push(`${path}.transforms must be an object.`);
          else {
            for (const [itemId, transform] of Object.entries(candidate.transforms)) {
              if (!itemIdSet.has(itemId)) issues.push(`${path}.transforms references unknown item ${itemId}.`);
              if (
                !isRecord(transform) ||
                !finiteNumber(transform.multiplier) ||
                !finiteNumber(transform.offset)
              ) {
                issues.push(`${path}.transforms.${itemId} must contain finite multiplier and offset values.`);
              }
            }
          }
        }
      });
      if (
        nonEmptyString(value.scoring.primaryComponentId) &&
        !componentIds.includes(value.scoring.primaryComponentId)
      ) {
        issues.push('scoring.primaryComponentId must reference a component.');
      }
      for (const duplicate of duplicateValues(componentIds)) issues.push(`Duplicate component id: ${duplicate}.`);
    }
  } else if (value.scoring.strategy !== 'unscored') {
    issues.push(`Unsupported scoring strategy: ${value.scoring.strategy}.`);
  }

  return issues;
}

export function assertInstrumentDefinition(value: unknown): InstrumentDefinition {
  const issues = validateInstrumentDefinition(value);
  if (issues.length > 0) {
    throw new Error(`Invalid instrument definition:\n- ${issues.join('\n- ')}`);
  }
  return value as InstrumentDefinition;
}

export function parseInstrumentDefinitionJson(json: string): InstrumentDefinition {
  let candidate: unknown;
  try {
    candidate = JSON.parse(json);
  } catch {
    throw new Error('Instrument definition is not valid JSON.');
  }
  return assertInstrumentDefinition(candidate);
}

function itemById(definition: InstrumentDefinition) {
  return new Map(definition.items.map((item) => [item.id, item]));
}

function readNumericResponses(
  definition: InstrumentDefinition,
  itemIds: readonly string[],
  responses: InstrumentResponses,
) {
  const definitions = itemById(definition);
  return itemIds.map((itemId) => {
    const item = definitions.get(itemId);
    if (!item) throw new Error(`Unknown item ${itemId}.`);
    const value = responses.itemResponses[itemId];
    if (!finiteNumber(value) || !validScaleValue(value, item.input)) {
      throw new Error(`Missing or invalid response for ${itemId}.`);
    }
    return [itemId, value] as const;
  });
}

export function scoreInstrument(
  candidate: InstrumentDefinition,
  responses: InstrumentResponses,
): InstrumentScore {
  const definition = assertInstrumentDefinition(candidate);
  if (definition.scoring.strategy === 'unscored') {
    readNumericResponses(
      definition,
      definition.workflow.sections.flatMap((section) => section.itemIds),
      responses,
    );
    return {
      instrumentId: definition.id,
      strategy: 'unscored',
      primaryScore: null,
      primaryLabel: null,
      components: {},
      itemScores: { ...responses.itemResponses },
    };
  }

  if (definition.scoring.strategy === 'linear-composite') {
    const scoring = definition.scoring;
    const itemScores: Record<string, number> = {};
    const components: Record<string, number> = {};
    for (const component of scoring.components) {
      const values = readNumericResponses(definition, component.itemIds, responses).map(([itemId, value]) => {
        const transform = component.transforms?.[itemId] ?? { multiplier: 1, offset: 0 };
        const transformed = (value * transform.multiplier) + transform.offset;
        itemScores[itemId] = transformed;
        return transformed;
      });
      const aggregate =
        component.aggregate === 'sum'
          ? values.reduce((total, value) => total + value, 0)
          : values.reduce((total, value) => total + value, 0) / values.length;
      const score =
        (aggregate * (component.finalMultiplier ?? 1)) +
        (component.finalOffset ?? 0);
      if (component.range && (score < component.range.min - 1e-9 || score > component.range.max + 1e-9)) {
        throw new Error(`Calculated component ${component.id} is outside its declared range.`);
      }
      components[component.id] = score;
    }
    const primary = scoring.components.find(
      (component) => component.id === scoring.primaryComponentId,
    )!;
    return {
      instrumentId: definition.id,
      strategy: 'linear-composite',
      primaryScore: components[primary.id],
      primaryLabel: primary.label,
      components,
      itemScores,
    };
  }

  const itemIds = definition.scoring.itemIds;
  const ratings = Object.fromEntries(readNumericResponses(definition, itemIds, responses));
  const pairwise = definition.workflow.pairwise!;
  const pairs = createAllPairs(itemIds, pairwise.pairIdSeparator);
  const weights = Object.fromEntries(itemIds.map((itemId) => [itemId, 0])) as Record<string, number>;
  for (const pair of pairs) {
    const selected = responses.pairwiseResponses?.[pair.id];
    if (selected !== pair.left && selected !== pair.right) {
      throw new Error(`Missing or invalid response for pair ${pair.id}.`);
    }
    weights[selected] += 1;
  }
  const adjustedRatings = Object.fromEntries(
    itemIds.map((itemId) => [itemId, ratings[itemId] * weights[itemId]]),
  );
  const primaryScore =
    Object.values(adjustedRatings).reduce((total, value) => total + value, 0) /
    pairs.length;
  if (
    primaryScore < definition.scoring.range.min - 1e-9 ||
    primaryScore > definition.scoring.range.max + 1e-9
  ) {
    throw new Error('Calculated weighted score is outside its declared range.');
  }
  return {
    instrumentId: definition.id,
    strategy: 'weighted-pairwise',
    primaryScore,
    primaryLabel: definition.scoring.primaryLabel,
    components: { weightedScore: primaryScore },
    itemScores: ratings,
    details: { weights, adjustedRatings },
  };
}
