export type ItemId = string;
export type ScoringStrategy =
  | 'nasa-tlx-weighted-v1'
  | 'nasa-tlx-raw-v1'
  | 'sus-standard-v1'
  | 'ueqs-standard-v1'
  | 'mean-v1'
  | 'sum-v1';
export type ResponseScaleType = 'magnitude' | 'agreement' | 'semantic-differential';
export type LandmarkPosition = 'low' | 'closer-low' | 'middle' | 'closer-high' | 'high';

export interface QuestionnaireItem {
  id: ItemId;
  name: string;
  prompt: string;
  simpleExplanation?: string;
  shortMeaning: string;
  lowAnchor: string;
  highAnchor: string;
  responseLabels?: Record<string, string>;
  voiceLowAliases?: string[];
  voiceHighAliases?: string[];
}

export interface RatingLandmark {
  value: number;
  cue: string;
  position: LandmarkPosition;
}

export interface QuestionnairePair {
  id: string;
  left: ItemId;
  right: ItemId;
}

export interface QuestionnaireDefinition {
  schemaVersion: 1;
  /** BCP 47 language tag for imported item wording and speech recognition. */
  language: string;
  id: string;
  version: string;
  name: string;
  shortName: string;
  description: string;
  introPrompt: string;
  officialContentNotice: string;
  source: {
    label: string;
    url?: string;
  };
  scale: {
    type: ResponseScaleType;
    minimum: number;
    maximum: number;
    step: number;
  };
  items: QuestionnaireItem[];
  landmarks?: RatingLandmark[];
  pairwise?: {
    mode: 'all-pairs';
    prompt: string;
    instruction: string;
    simplePrompt: string;
  };
  scoring: {
    strategy: ScoringStrategy;
    scoreName: string;
    minimum: number;
    maximum: number;
    reverseItemIds?: ItemId[];
  };
  supports: {
    simplerExplanations: boolean;
    smileyLandmarks: boolean;
  };
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${path} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function onlyKeys(value: Record<string, unknown>, allowed: readonly string[], path: string) {
  const unexpected = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unexpected.length) throw new Error(`${path} contains unsupported field ${unexpected[0]}.`);
}

function text(
  value: unknown,
  path: string,
  maximum: number,
  pattern?: RegExp,
): string {
  if (typeof value !== 'string' || !value.trim() || value.length > maximum) {
    throw new Error(`${path} must be non-empty text of at most ${maximum} characters.`);
  }
  if (pattern && !pattern.test(value)) throw new Error(`${path} has an unsupported format.`);
  return value;
}

function integer(value: unknown, path: string): number {
  if (!Number.isInteger(value)) throw new Error(`${path} must be an integer.`);
  return value as number;
}

function languageTag(value: unknown): string {
  if (value === undefined) return 'en-GB';
  const language = text(
    value,
    'language',
    35,
    /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/,
  );
  try {
    return Intl.getCanonicalLocales(language)[0] ?? language;
  } catch {
    throw new Error('language must be a valid BCP 47 language tag.');
  }
}

function stringList(value: unknown, path: string): string[] | undefined {
  if (value === undefined) return undefined;
  if (
    !Array.isArray(value) ||
    value.length > 20 ||
    value.some(
      (entry) =>
        typeof entry !== 'string' ||
        !entry.trim() ||
        entry.length > 40,
    )
  ) {
    throw new Error(`${path} must be a list of non-empty strings.`);
  }
  const normalised = value.map((entry) => entry.trim().toLowerCase());
  if (new Set(normalised).size !== normalised.length) {
    throw new Error(`${path} must not contain duplicate aliases.`);
  }
  return normalised;
}

function responseLabels(
  value: unknown,
  path: string,
  minimum: number,
  maximum: number,
  step: number,
): Record<string, string> | undefined {
  if (value === undefined) return undefined;
  const labels = record(value, path);
  const expectedValues = Array.from(
    { length: ((maximum - minimum) / step) + 1 },
    (_, index) => minimum + (index * step),
  );
  const expectedKeys = expectedValues.map(String);
  if (
    Object.keys(labels).length !== expectedKeys.length ||
    expectedKeys.some((key) => !(key in labels))
  ) {
    throw new Error(`${path} must label every value in the declared response scale.`);
  }
  const unexpected = Object.keys(labels).filter((key) => !expectedKeys.includes(key));
  if (unexpected.length) {
    throw new Error(`${path} contains a value outside the declared response scale.`);
  }
  return Object.fromEntries(
    expectedKeys.map((key) => [key, text(labels[key], `${path}.${key}`, 120)]),
  );
}

/**
 * Runtime validation complements the published JSON Schema with semantic checks
 * that JSON Schema alone cannot express clearly, including scorer compatibility.
 * Definitions are data only: scoring strategy names are resolved through an
 * allowlist and no executable JavaScript is accepted from a definition.
 */
export function validateQuestionnaireDefinition(candidate: unknown): QuestionnaireDefinition {
  const root = record(candidate, 'Questionnaire definition');
  onlyKeys(
    root,
    [
      '$schema',
      'schemaVersion',
      'language',
      'id',
      'version',
      'name',
      'shortName',
      'description',
      'introPrompt',
      'officialContentNotice',
      'source',
      'scale',
      'items',
      'landmarks',
      'pairwise',
      'scoring',
      'supports',
    ],
    'Questionnaire definition',
  );
  if (root.schemaVersion !== 1) throw new Error('Questionnaire definition schemaVersion must be 1.');

  const id = text(root.id, 'id', 64, /^[a-z][a-z0-9-]*$/);
  const source = record(root.source, 'source');
  onlyKeys(source, ['label', 'url'], 'source');
  let sourceUrl: string | undefined;
  if (source.url !== undefined) {
    sourceUrl = text(source.url, 'source.url', 500);
    try {
      const parsed = new URL(sourceUrl);
      if (parsed.protocol !== 'https:') throw new Error();
    } catch {
      throw new Error('source.url must be an absolute HTTPS URL.');
    }
  }

  const scale = record(root.scale, 'scale');
  onlyKeys(scale, ['type', 'minimum', 'maximum', 'step'], 'scale');
  if (
    scale.type !== 'magnitude' &&
    scale.type !== 'agreement' &&
    scale.type !== 'semantic-differential'
  ) {
    throw new Error('scale.type is not supported.');
  }
  const minimum = integer(scale.minimum, 'scale.minimum');
  const maximum = integer(scale.maximum, 'scale.maximum');
  const step = integer(scale.step, 'scale.step');
  if (minimum >= maximum || step < 1 || (maximum - minimum) % step !== 0) {
    throw new Error('scale must have an increasing integer range divisible by a positive step.');
  }
  const responseCount = ((maximum - minimum) / step) + 1;
  if (responseCount > 101) throw new Error('scale must contain no more than 101 response values.');

  if (!Array.isArray(root.items) || root.items.length < 1 || root.items.length > 100) {
    throw new Error('items must contain between 1 and 100 questionnaire items.');
  }
  const items = root.items.map((candidateItem, index): QuestionnaireItem => {
    const item = record(candidateItem, `items[${index}]`);
    onlyKeys(
      item,
      [
        'id',
        'name',
        'prompt',
        'simpleExplanation',
        'shortMeaning',
        'lowAnchor',
        'highAnchor',
        'responseLabels',
        'voiceLowAliases',
        'voiceHighAliases',
      ],
      `items[${index}]`,
    );
    const declaredResponseLabels = responseLabels(
      item.responseLabels,
      `items[${index}].responseLabels`,
      minimum,
      maximum,
      step,
    );
    return {
      id: text(item.id, `items[${index}].id`, 64, /^[a-z][a-z0-9_-]*$/),
      name: text(item.name, `items[${index}].name`, 120),
      prompt: text(item.prompt, `items[${index}].prompt`, 1000),
      ...(item.simpleExplanation === undefined
        ? {}
        : { simpleExplanation: text(item.simpleExplanation, `items[${index}].simpleExplanation`, 1000) }),
      shortMeaning: text(item.shortMeaning, `items[${index}].shortMeaning`, 240),
      lowAnchor: text(item.lowAnchor, `items[${index}].lowAnchor`, 80),
      highAnchor: text(item.highAnchor, `items[${index}].highAnchor`, 80),
      ...(declaredResponseLabels ? { responseLabels: declaredResponseLabels } : {}),
      ...(stringList(item.voiceLowAliases, `items[${index}].voiceLowAliases`)
        ? { voiceLowAliases: stringList(item.voiceLowAliases, `items[${index}].voiceLowAliases`) }
        : {}),
      ...(stringList(item.voiceHighAliases, `items[${index}].voiceHighAliases`)
        ? { voiceHighAliases: stringList(item.voiceHighAliases, `items[${index}].voiceHighAliases`) }
        : {}),
    };
  });
  if (new Set(items.map((item) => item.id)).size !== items.length) {
    throw new Error('Questionnaire item IDs must be unique.');
  }

  let landmarks: RatingLandmark[] | undefined;
  if (root.landmarks !== undefined) {
    if (!Array.isArray(root.landmarks) || root.landmarks.length !== 5) {
      throw new Error('The supported smiley presentation requires exactly five labelled landmarks.');
    }
    const positions: LandmarkPosition[] = ['low', 'closer-low', 'middle', 'closer-high', 'high'];
    landmarks = root.landmarks.map((candidateLandmark, index) => {
      const landmark = record(candidateLandmark, `landmarks[${index}]`);
      onlyKeys(landmark, ['value', 'cue', 'position'], `landmarks[${index}]`);
      const value = integer(landmark.value, `landmarks[${index}].value`);
      const position = landmark.position as LandmarkPosition;
      if (
        value < minimum ||
        value > maximum ||
        (value - minimum) % step !== 0 ||
        !positions.includes(position)
      ) {
        throw new Error(`landmarks[${index}] is not compatible with the response scale.`);
      }
      return {
        value,
        cue: text(landmark.cue, `landmarks[${index}].cue`, 8),
        position,
      };
    });
    if (
      new Set(landmarks.map((landmark) => landmark.value)).size !== 5 ||
      new Set(landmarks.map((landmark) => landmark.position)).size !== 5
    ) {
      throw new Error('Smiley landmark values and semantic positions must be unique.');
    }
  }

  let pairwise: QuestionnaireDefinition['pairwise'];
  if (root.pairwise !== undefined) {
    const rawPairwise = record(root.pairwise, 'pairwise');
    onlyKeys(rawPairwise, ['mode', 'prompt', 'instruction', 'simplePrompt'], 'pairwise');
    if (rawPairwise.mode !== 'all-pairs') throw new Error('Only the all-pairs comparison mode is supported.');
    if (items.length < 2 || items.length > 12) {
      throw new Error('All-pairs comparison requires between 2 and 12 items.');
    }
    pairwise = {
      mode: 'all-pairs',
      prompt: text(rawPairwise.prompt, 'pairwise.prompt', 400),
      instruction: text(rawPairwise.instruction, 'pairwise.instruction', 500),
      simplePrompt: text(rawPairwise.simplePrompt, 'pairwise.simplePrompt', 300),
    };
  }

  const scoring = record(root.scoring, 'scoring');
  onlyKeys(
    scoring,
    ['strategy', 'scoreName', 'minimum', 'maximum', 'reverseItemIds'],
    'scoring',
  );
  if (
    scoring.strategy !== 'nasa-tlx-weighted-v1' &&
    scoring.strategy !== 'nasa-tlx-raw-v1' &&
    scoring.strategy !== 'sus-standard-v1' &&
    scoring.strategy !== 'ueqs-standard-v1' &&
    scoring.strategy !== 'mean-v1' &&
    scoring.strategy !== 'sum-v1'
  ) {
    throw new Error('scoring.strategy is not in the executable scorer allowlist.');
  }
  const scoringMinimum = integer(scoring.minimum, 'scoring.minimum');
  const scoringMaximum = integer(scoring.maximum, 'scoring.maximum');
  if (scoringMinimum >= scoringMaximum) throw new Error('scoring score range must increase.');
  let reverseItemIds: string[] | undefined;
  if (scoring.reverseItemIds !== undefined) {
    if (
      !Array.isArray(scoring.reverseItemIds) ||
      scoring.reverseItemIds.some((itemId) => typeof itemId !== 'string')
    ) {
      throw new Error('scoring.reverseItemIds must be a list of item IDs.');
    }
    reverseItemIds = scoring.reverseItemIds.map((itemId) =>
      text(itemId, 'scoring.reverseItemIds', 64, /^[a-z][a-z0-9_-]*$/));
    if (new Set(reverseItemIds).size !== reverseItemIds.length) {
      throw new Error('scoring.reverseItemIds must not contain duplicates.');
    }
    const itemIds = new Set(items.map((item) => item.id));
    if (reverseItemIds.some((itemId) => !itemIds.has(itemId))) {
      throw new Error('scoring.reverseItemIds contains an unknown item ID.');
    }
  }
  if (scoring.strategy === 'nasa-tlx-weighted-v1') {
    if (
      scale.type !== 'magnitude' ||
      !pairwise ||
      items.length !== 6 ||
      minimum !== 0 ||
      maximum !== 100 ||
      step !== 5
    ) {
      throw new Error('The NASA-TLX scorer requires six 0–100 items, step 5, and all-pairs comparisons.');
    }
  }
  if (scoring.strategy === 'nasa-tlx-raw-v1') {
    const expectedIds = ['mental', 'physical', 'temporal', 'performance', 'effort', 'frustration'];
    if (
      scale.type !== 'magnitude' ||
      pairwise ||
      minimum !== 0 ||
      maximum !== 100 ||
      step !== 5 ||
      items.map((item) => item.id).join('|') !== expectedIds.join('|')
    ) {
      throw new Error('The Raw TLX scorer requires the six ordered TLX items on a 0–100 scale without comparisons.');
    }
  }
  if (scoring.strategy === 'sus-standard-v1') {
    const expectedIds = Array.from({ length: 10 }, (_, index) => `sus${String(index + 1).padStart(2, '0')}`);
    if (
      scale.type !== 'agreement' ||
      pairwise ||
      minimum !== 1 ||
      maximum !== 5 ||
      step !== 1 ||
      items.map((item) => item.id).join('|') !== expectedIds.join('|')
    ) {
      throw new Error('The SUS scorer requires the ordered sus01–sus10 items on a 1–5 scale without comparisons.');
    }
  }
  if (scoring.strategy === 'ueqs-standard-v1') {
    const expectedIds = Array.from(
      { length: 8 },
      (_, index) => `ueqs${String(index + 1).padStart(2, '0')}`,
    );
    if (
      scale.type !== 'semantic-differential' ||
      pairwise ||
      minimum !== 1 ||
      maximum !== 7 ||
      step !== 1 ||
      items.map((item) => item.id).join('|') !== expectedIds.join('|')
    ) {
      throw new Error('The UEQ-S scorer requires the ordered ueqs01–ueqs08 items on a 1–7 semantic-differential scale without comparisons.');
    }
  }
  if (
    scoring.strategy !== 'mean-v1' &&
    scoring.strategy !== 'sum-v1' &&
    reverseItemIds?.length
  ) {
    throw new Error('Reverse-scored item IDs are only supported by the generic mean and sum scorers.');
  }
  if (scoring.strategy === 'mean-v1' || scoring.strategy === 'sum-v1') {
    if (pairwise) {
      throw new Error('The generic mean and sum scorers do not support pairwise comparisons.');
    }
    if (items.length > 20) {
      throw new Error('A researcher-supplied questionnaire may contain no more than 20 items.');
    }
    if (minimum < 0 || maximum > 100) {
      throw new Error('A researcher-supplied response scale must remain between 0 and 100.');
    }
    const expectedMinimum =
      scoring.strategy === 'mean-v1' ? minimum : minimum * items.length;
    const expectedMaximum =
      scoring.strategy === 'mean-v1' ? maximum : maximum * items.length;
    if (scoringMinimum !== expectedMinimum || scoringMaximum !== expectedMaximum) {
      throw new Error(
        `The ${scoring.strategy === 'mean-v1' ? 'mean' : 'sum'} scorer range must be ${expectedMinimum}–${expectedMaximum}.`,
      );
    }
  }

  const supports = record(root.supports, 'supports');
  onlyKeys(supports, ['simplerExplanations', 'smileyLandmarks'], 'supports');
  if (
    typeof supports.simplerExplanations !== 'boolean' ||
    typeof supports.smileyLandmarks !== 'boolean'
  ) {
    throw new Error('supports must contain two boolean capability flags.');
  }
  if (supports.simplerExplanations && items.some((item) => !item.simpleExplanation)) {
    throw new Error('simplerExplanations requires help text for every item.');
  }
  if (supports.smileyLandmarks && !landmarks) {
    throw new Error('smileyLandmarks requires five validated landmarks.');
  }

  return {
    schemaVersion: 1,
    language: languageTag(root.language),
    id,
    version: text(root.version, 'version', 40),
    name: text(root.name, 'name', 120),
    shortName: text(root.shortName, 'shortName', 40),
    description: text(root.description, 'description', 400),
    introPrompt: text(root.introPrompt, 'introPrompt', 400),
    officialContentNotice: text(root.officialContentNotice, 'officialContentNotice', 400),
    source: {
      label: text(source.label, 'source.label', 240),
      ...(sourceUrl ? { url: sourceUrl } : {}),
    },
    scale: { type: scale.type, minimum, maximum, step },
    items,
    ...(landmarks ? { landmarks } : {}),
    ...(pairwise ? { pairwise } : {}),
    scoring: {
      strategy: scoring.strategy,
      scoreName: text(scoring.scoreName, 'scoring.scoreName', 120),
      minimum: scoringMinimum,
      maximum: scoringMaximum,
      ...(reverseItemIds?.length ? { reverseItemIds } : {}),
    },
    supports: {
      simplerExplanations: supports.simplerExplanations,
      smileyLandmarks: supports.smileyLandmarks,
    },
  };
}

export function buildRatingValues(definition: QuestionnaireDefinition) {
  const { minimum, maximum, step } = definition.scale;
  return Array.from({ length: ((maximum - minimum) / step) + 1 }, (_, index) => minimum + (index * step));
}

export function buildQuestionnairePairs(definition: QuestionnaireDefinition): QuestionnairePair[] {
  if (!definition.pairwise) return [];
  return definition.items.flatMap((left, leftIndex) =>
    definition.items.slice(leftIndex + 1).map((right) => ({
      id: `${left.id}-${right.id}`,
      left: left.id,
      right: right.id,
    })),
  );
}

const definitionModules = import.meta.glob(
  '../instruments/*.questionnaire.json',
  { eager: true, import: 'default' },
) as Record<string, unknown>;

/**
 * Every registered questionnaire is discovered from a versioned data file.
 * Adding a definition does not add instrument wording to the runner. A new
 * scoring rule still requires reviewed code in the scorer allowlist.
 */
export const builtInQuestionnaires = Object.entries(definitionModules)
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([, candidate]) => validateQuestionnaireDefinition(candidate));

const questionnaireById = new Map(
  builtInQuestionnaires.map((definition) => [definition.id, definition]),
);

export const DEFAULT_QUESTIONNAIRE_ID = 'nasa-tlx-weighted';
export const MAX_EMBEDDED_DEFINITION_BYTES = 9000;

export function getQuestionnaireDefinition(id: string) {
  return questionnaireById.get(id) ?? null;
}

export function questionnaireDefinitionSize(definition: QuestionnaireDefinition) {
  return new TextEncoder().encode(JSON.stringify(definition)).byteLength;
}

/**
 * Resolve either an immutable built-in definition or a validated definition
 * embedded in a study configuration. An embedded definition may not replace a
 * built-in ID, and its bounded size keeps participant links and Qualtrics raw
 * records within the documented transport allocation.
 */
export function resolveQuestionnaireDefinition(
  id: string,
  embeddedDefinition?: unknown,
): QuestionnaireDefinition | null {
  const builtIn = getQuestionnaireDefinition(id);
  if (embeddedDefinition === undefined) return builtIn;
  if (builtIn) return null;
  try {
    const definition = validateQuestionnaireDefinition(embeddedDefinition);
    if (
      definition.id !== id ||
      !definition.id.startsWith('custom-') ||
      (
        definition.scoring.strategy !== 'mean-v1' &&
        definition.scoring.strategy !== 'sum-v1'
      ) ||
      Boolean(definition.pairwise) ||
      Boolean(definition.landmarks) ||
      definition.supports.smileyLandmarks ||
      questionnaireDefinitionSize(definition) > MAX_EMBEDDED_DEFINITION_BYTES
    ) {
      return null;
    }
    return definition;
  } catch {
    return null;
  }
}
