import {
  MAX_EMBEDDED_DEFINITION_BYTES,
  getQuestionnaireDefinition,
  questionnaireDefinitionSize,
  validateQuestionnaireDefinition,
  type QuestionnaireDefinition,
  type ResponseScaleType,
} from './questionnaire-definition';

export const MAX_CUSTOM_QUESTIONNAIRE_ITEMS = 20;

export type CustomAggregation = 'mean' | 'sum';

export interface CustomQuestionnaireItemDraft {
  key: string;
  name: string;
  prompt: string;
  lowAnchor: string;
  highAnchor: string;
  simpleExplanation: string;
  reverseScored: boolean;
}

export interface CustomQuestionnaireDraft {
  name: string;
  shortName: string;
  version: string;
  description: string;
  introPrompt: string;
  sourceLabel: string;
  sourceUrl: string;
  scaleType: ResponseScaleType;
  minimum: number;
  maximum: number;
  step: number;
  scoreName: string;
  aggregation: CustomAggregation;
  items: CustomQuestionnaireItemDraft[];
}

let draftItemCounter = 0;

export function createCustomItemDraft(
  values: Partial<Omit<CustomQuestionnaireItemDraft, 'key'>> = {},
): CustomQuestionnaireItemDraft {
  draftItemCounter += 1;
  return {
    key: `custom-item-${draftItemCounter}`,
    name: '',
    prompt: '',
    lowAnchor: '',
    highAnchor: '',
    simpleExplanation: '',
    reverseScored: false,
    ...values,
  };
}

export function createCustomQuestionnaireDraft(): CustomQuestionnaireDraft {
  return {
    name: '',
    shortName: '',
    version: '1.0.0',
    description: 'A researcher-supplied questionnaire.',
    introPrompt: 'Answer each item about the task that you have just completed.',
    sourceLabel: 'Researcher-supplied questionnaire',
    sourceUrl: '',
    scaleType: 'agreement',
    minimum: 1,
    maximum: 5,
    step: 1,
    scoreName: 'Questionnaire score',
    aggregation: 'mean',
    items: [
      createCustomItemDraft({ name: 'Item 1' }),
      createCustomItemDraft({ name: 'Item 2' }),
    ],
  };
}

function clean(value: string, field: string) {
  const cleaned = value.trim().replace(/\s+/g, ' ');
  if (!cleaned) throw new Error(`${field} is required.`);
  return cleaned;
}

function slug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

function shortMeaning(prompt: string, simpleExplanation: string) {
  const value = simpleExplanation.trim() || prompt.trim();
  return value.length <= 240 ? value : `${value.slice(0, 237).trimEnd()}...`;
}

export function createCustomQuestionnaireDefinition(
  draft: CustomQuestionnaireDraft,
): QuestionnaireDefinition {
  if (
    !Number.isInteger(draft.minimum) ||
    !Number.isInteger(draft.maximum) ||
    !Number.isInteger(draft.step)
  ) {
    throw new Error('Scale minimum, maximum and step must be whole numbers.');
  }
  if (
    !Array.isArray(draft.items) ||
    draft.items.length < 1 ||
    draft.items.length > MAX_CUSTOM_QUESTIONNAIRE_ITEMS
  ) {
    throw new Error(
      `Add between 1 and ${MAX_CUSTOM_QUESTIONNAIRE_ITEMS} questionnaire items.`,
    );
  }

  const name = clean(draft.name, 'Questionnaire name');
  const shortName = clean(draft.shortName, 'Short name');
  const idPart = slug(shortName || name);
  if (!idPart) {
    throw new Error('Questionnaire name must contain at least one Latin letter or number for its stable ID.');
  }
  const items = draft.items.map((item, index) => {
    const prompt = clean(item.prompt, `Item ${index + 1} question`);
    const simpleExplanation = item.simpleExplanation.trim().replace(/\s+/g, ' ');
    return {
      id: `item-${String(index + 1).padStart(2, '0')}`,
      name: clean(item.name, `Item ${index + 1} label`),
      prompt,
      ...(simpleExplanation ? { simpleExplanation } : {}),
      shortMeaning: shortMeaning(prompt, simpleExplanation),
      lowAnchor: clean(item.lowAnchor, `Item ${index + 1} low endpoint`),
      highAnchor: clean(item.highAnchor, `Item ${index + 1} high endpoint`),
    };
  });
  const reverseItemIds = draft.items.flatMap((item, index) =>
    item.reverseScored ? [`item-${String(index + 1).padStart(2, '0')}`] : []);
  const supportsSimplerExplanations = items.every((item) => item.simpleExplanation);
  const scoringMinimum =
    draft.aggregation === 'mean' ? draft.minimum : draft.minimum * items.length;
  const scoringMaximum =
    draft.aggregation === 'mean' ? draft.maximum : draft.maximum * items.length;

  const candidate: QuestionnaireDefinition = {
    schemaVersion: 1,
    id: `custom-${idPart}`,
    version: clean(draft.version, 'Questionnaire version'),
    name,
    shortName,
    description: clean(draft.description, 'Questionnaire description'),
    introPrompt: clean(draft.introPrompt, 'Participant instruction'),
    officialContentNotice:
      'This questionnaire definition was supplied by the study conductor. Its wording, use and interpretation must match the approved study protocol.',
    source: {
      label: clean(draft.sourceLabel, 'Source or authorship label'),
      ...(draft.sourceUrl.trim() ? { url: draft.sourceUrl.trim() } : {}),
    },
    scale: {
      type: draft.scaleType,
      minimum: draft.minimum,
      maximum: draft.maximum,
      step: draft.step,
    },
    items,
    scoring: {
      strategy: draft.aggregation === 'mean' ? 'mean-v1' : 'sum-v1',
      scoreName: clean(draft.scoreName, 'Score name'),
      minimum: scoringMinimum,
      maximum: scoringMaximum,
      ...(reverseItemIds.length ? { reverseItemIds } : {}),
    },
    supports: {
      simplerExplanations: supportsSimplerExplanations,
      smileyLandmarks: false,
    },
  };
  return validateCustomQuestionnaireDefinition(candidate);
}

export function validateCustomQuestionnaireDefinition(
  candidate: unknown,
): QuestionnaireDefinition {
  const definition = validateQuestionnaireDefinition(candidate);
  if (getQuestionnaireDefinition(definition.id)) {
    throw new Error('A custom questionnaire cannot replace a built-in questionnaire ID.');
  }
  if (!definition.id.startsWith('custom-')) {
    throw new Error('A custom questionnaire ID must start with custom-.');
  }
  if (
    definition.scoring.strategy !== 'mean-v1' &&
    definition.scoring.strategy !== 'sum-v1'
  ) {
    throw new Error('A custom questionnaire must use the reviewed mean or sum scorer.');
  }
  if (definition.pairwise) {
    throw new Error('Custom questionnaires do not support pairwise comparisons.');
  }
  if (definition.landmarks || definition.supports.smileyLandmarks) {
    throw new Error('Custom questionnaires do not support smiley landmarks.');
  }
  const size = questionnaireDefinitionSize(definition);
  if (size > MAX_EMBEDDED_DEFINITION_BYTES) {
    throw new Error(
      `The questionnaire definition is ${size} bytes; the participant-link limit is ${MAX_EMBEDDED_DEFINITION_BYTES} bytes.`,
    );
  }
  return definition;
}

export function customDefinitionFileName(definition: QuestionnaireDefinition) {
  return `${definition.id}-${definition.version.replace(/[^A-Za-z0-9._-]+/g, '-')}.questionnaire.json`;
}
