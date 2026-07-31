import {
  MAX_CUSTOM_QUESTIONNAIRE_ITEMS,
  createCustomItemDraft,
  type CustomQuestionnaireDraft,
} from './custom-questionnaire';

export type QuestionnaireImportSource =
  | 'qualtrics-qsf'
  | 'limesurvey-lss'
  | 'limesurvey-lsg'
  | 'limesurvey-lsq';
export type QuestionnaireImportSourceSelection = QuestionnaireImportSource | 'auto';

export interface LimeSurveyGroupOption {
  id: string;
  name: string;
  questionCount: number;
  questionTypes: string[];
}

export interface LimeSurveyRatingSetOption {
  id: string;
  name: string;
  sourceQuestionCount: number;
  itemCount: number;
  responseValues: number[];
  questionTypes: string[];
}

export interface QuestionnaireImportFinding {
  code: string;
  title: string;
  detail: string;
}

export interface QuestionnaireImportReview {
  source: QuestionnaireImportSource;
  sourceName: string;
  fileName: string;
  title: string;
  draft: CustomQuestionnaireDraft | null;
  imported: QuestionnaireImportFinding[];
  confirmations: QuestionnaireImportFinding[];
  unsupported: QuestionnaireImportFinding[];
  canConvert: boolean;
  requiresGroupSelection?: boolean;
  groupOptions?: LimeSurveyGroupOption[];
  selectedGroupId?: string;
  requiresRatingSetSelection?: boolean;
  ratingSetOptions?: LimeSurveyRatingSetOption[];
  selectedRatingSetId?: string;
}

interface ImportedScaleItem {
  sourceId: string;
  name: string;
  prompt: string;
  values: number[];
  labels: string[];
}

interface ImportAccumulator {
  imported: QuestionnaireImportFinding[];
  confirmations: QuestionnaireImportFinding[];
  unsupported: QuestionnaireImportFinding[];
  confirmationCodes: Set<string>;
}

const MAX_IMPORT_BYTES = 2_000_000;
const executableMarkup =
  /<\s*(?:script|iframe|object|embed|style)\b|(?:href|src)\s*=\s*["']?\s*javascript:|\son[a-z]+\s*=/i;
const unsupportedStructuredMarkup =
  /<\s*(?:img|picture|video|audio|canvas|svg|math|form|input|button|select|textarea|table)\b/i;
const dynamicText =
  /\$\{(?:e|q|lm|gr)?:?\/?\/|q:\/\/|\{(?:if|TOKEN|INSERTANS|[A-Za-z][A-Za-z0-9_.]*\.(?:NAOK|shown))\b/i;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function text(value: unknown) {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : '';
}

function collapsed(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function addConfirmation(
  state: ImportAccumulator,
  finding: QuestionnaireImportFinding,
) {
  if (state.confirmationCodes.has(finding.code)) return;
  state.confirmationCodes.add(finding.code);
  state.confirmations.push(finding);
}

function safeVisibleText(
  rawValue: unknown,
  label: string,
  sourceId: string,
  state: ImportAccumulator,
): string | null {
  const raw = text(rawValue);
  if (!raw.trim()) {
    state.unsupported.push({
      code: 'missing-visible-text',
      title: `${label} is empty`,
      detail: `${sourceId} does not contain participant-visible text.`,
    });
    return null;
  }
  if (executableMarkup.test(raw) || dynamicText.test(raw)) {
    state.unsupported.push({
      code: 'unsafe-dynamic-content',
      title: `${label} contains executable or dynamic content`,
      detail:
        `${sourceId} contains script, an event handler, a JavaScript URL or survey-expression text. ` +
        'The importer does not execute or approximate it.',
    });
    return null;
  }
  if (unsupportedStructuredMarkup.test(raw)) {
    state.unsupported.push({
      code: 'unsupported-structured-content',
      title: `${label} contains media, a table or an interactive control`,
      detail:
        `${sourceId} cannot be represented as one safe plain-text rating item without changing participant-visible content.`,
    });
    return null;
  }

  const parser = new DOMParser();
  const parsed = parser.parseFromString(`<body>${raw}</body>`, 'text/html');
  const visible = collapsed(parsed.body.textContent ?? '');
  if (!visible) {
    state.unsupported.push({
      code: 'missing-visible-text',
      title: `${label} has no readable text`,
      detail: `${sourceId} contains no participant-visible text after safe text extraction.`,
    });
    return null;
  }
  if (/<[^>]+>/.test(raw) || visible !== collapsed(raw)) {
    addConfirmation(state, {
      code: 'plain-text-normalisation',
      title: 'Formatting was converted to plain text',
      detail:
        'Imported wording is rendered as safe plain text. Review it against the source export before use.',
    });
  }
  return visible;
}

function parseInteger(value: unknown): number | null {
  const candidate = typeof value === 'number' ? value : Number(text(value).trim());
  return Number.isInteger(candidate) ? candidate : null;
}

function validIncreasingScale(values: readonly number[]) {
  if (
    values.length < 2 ||
    values.some((value) => value < 0 || value > 100) ||
    new Set(values).size !== values.length
  ) {
    return false;
  }
  const step = values[1] - values[0];
  return step > 0 && values.every(
    (value, index) => index === 0 || value - values[index - 1] === step,
  );
}

function orderedKeys(
  order: unknown,
  options: Record<string, unknown>,
): string[] | null {
  if (!Array.isArray(order) || order.length !== Object.keys(options).length) return null;
  const keys = order.map(String);
  return new Set(keys).size === keys.length && keys.every((key) => key in options)
    ? keys
    : null;
}

function optionDisplay(
  option: unknown,
  label: string,
  sourceId: string,
  state: ImportAccumulator,
) {
  const record = asRecord(option);
  return safeVisibleText(record?.Display, label, sourceId, state);
}

function scaleTypeFromLabels(items: readonly ImportedScaleItem[]) {
  const labels = items.flatMap((item) => item.labels).map((label) => label.toLowerCase());
  return labels.some((label) => label.includes('agree') || label.includes('disagree'))
    ? 'agreement' as const
    : 'semantic-differential' as const;
}

function defaultShortName(title: string) {
  const initials = title
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z0-9]/g, '')[0] ?? '')
    .join('')
    .slice(0, 12);
  if (initials) return initials.toUpperCase();
  const ascii = title.replace(/[^A-Za-z0-9]+/g, '').slice(0, 12);
  return ascii || 'IMPORTED';
}

function buildDraft(
  title: string,
  sourceLabel: string,
  introPrompt: string,
  items: ImportedScaleItem[],
  state: ImportAccumulator,
): CustomQuestionnaireDraft | null {
  if (!items.length) {
    state.unsupported.push({
      code: 'no-supported-items',
      title: 'No supported questionnaire items were found',
      detail:
        'This release needs at least one required, ordered single-choice rating item.',
    });
    return null;
  }
  if (items.length > MAX_CUSTOM_QUESTIONNAIRE_ITEMS) {
    state.unsupported.push({
      code: 'too-many-items',
      title: 'The questionnaire has too many items for a participant link',
      detail:
        `${items.length} supported items were found; this release accepts at most ` +
        `${MAX_CUSTOM_QUESTIONNAIRE_ITEMS}.`,
    });
    return null;
  }
  const referenceValues = items[0].values;
  if (!validIncreasingScale(referenceValues)) {
    state.unsupported.push({
      code: 'unsupported-response-values',
      title: 'Response values are not one increasing whole-number scale',
      detail:
        'Values must be unique whole numbers from 0 to 100 with one constant positive step.',
    });
    return null;
  }
  const scaleKey = referenceValues.join('|');
  if (items.some((item) => item.values.join('|') !== scaleKey)) {
    state.unsupported.push({
      code: 'mixed-response-scales',
      title: 'Items use different response values',
      detail:
        'The current participant interface requires every imported item to share the same ordered numeric scale.',
    });
    return null;
  }

  addConfirmation(state, {
    code: 'review-scoring',
    title: 'Scoring and reverse scoring require confirmation',
    detail:
      'Answer recodes do not establish a questionnaire score. Choose reviewed mean or sum, then mark any reverse-scored items.',
  });
  addConfirmation(state, {
    code: 'review-scale-type',
    title: 'The scale description requires confirmation',
    detail:
      'Confirm whether the imported scale should be described as agreement or semantic differential.',
  });

  return {
    name: title.slice(0, 120),
    shortName: defaultShortName(title),
    version: '1.0.0',
    description: `Questionnaire imported from ${sourceLabel}.`,
    introPrompt: introPrompt.slice(0, 400),
    sourceLabel,
    sourceUrl: '',
    scaleType: scaleTypeFromLabels(items),
    minimum: referenceValues[0],
    maximum: referenceValues.at(-1)!,
    step: referenceValues[1] - referenceValues[0],
    scoreName: 'Questionnaire score',
    aggregation: 'mean',
    items: items.map((item) => createCustomItemDraft({
      name: item.name.slice(0, 120),
      prompt: item.prompt.slice(0, 1000),
      lowAnchor: item.labels[0].slice(0, 80),
      highAnchor: item.labels.at(-1)!.slice(0, 80),
      responseLabels: Object.fromEntries(
        item.values.map((value, index) => [String(value), item.labels[index].slice(0, 120)]),
      ),
    })),
  };
}

function findingForItem(item: ImportedScaleItem): QuestionnaireImportFinding {
  return {
    code: `item-${item.sourceId}`,
    title: `${item.name}: imported`,
    detail:
      `${item.sourceId}; “${item.prompt}”; ordered choices: ` +
      item.values
        .map((value, index) => `${value} = ${item.labels[index]}`)
        .join('; '),
  };
}

function makeReview(
  source: QuestionnaireImportSource,
  sourceName: string,
  fileName: string,
  title: string,
  draft: CustomQuestionnaireDraft | null,
  state: ImportAccumulator,
  extras: Pick<
    QuestionnaireImportReview,
    | 'requiresGroupSelection'
    | 'groupOptions'
    | 'selectedGroupId'
    | 'requiresRatingSetSelection'
    | 'ratingSetOptions'
    | 'selectedRatingSetId'
  > = {},
): QuestionnaireImportReview {
  return {
    source,
    sourceName,
    fileName,
    title,
    draft,
    imported: state.imported,
    confirmations: state.confirmations,
    unsupported: state.unsupported,
    canConvert: Boolean(draft) && state.unsupported.length === 0,
    ...extras,
  };
}

function state(): ImportAccumulator {
  return {
    imported: [],
    confirmations: [],
    unsupported: [],
    confirmationCodes: new Set(),
  };
}

function requirePlainObject(value: unknown, message: string) {
  const result = asRecord(value);
  if (!result) throw new Error(message);
  return result;
}

function qsfQuestionOrder(
  elements: Record<string, unknown>[],
  state: ImportAccumulator,
): { order: string[]; trashQuestionIds: Set<string> } {
  const blockElement = elements.find((element) => element.Element === 'BL');
  const blocks = Array.isArray(blockElement?.Payload)
    ? blockElement.Payload.map(asRecord).filter((block): block is Record<string, unknown> => Boolean(block))
    : [];
  const activeBlocks = blocks.filter((block) => block.Type !== 'Trash');
  const trashQuestionIds = new Set(
    blocks
      .filter((block) => block.Type === 'Trash')
      .flatMap((block) => Array.isArray(block.BlockElements) ? block.BlockElements : [])
      .map(asRecord)
      .filter((item): item is Record<string, unknown> => Boolean(item))
      .map((item) => text(item.QuestionID))
      .filter(Boolean),
  );
  if (trashQuestionIds.size) {
    addConfirmation(state, {
      code: 'qualtrics-trash-ignored',
      title: 'Questions in the Qualtrics Trash block were ignored',
      detail:
        `${trashQuestionIds.size} deleted question${trashQuestionIds.size === 1 ? '' : 's'} ` +
        'will not appear in the converted questionnaire.',
    });
  }
  const flowElement = elements.find((element) => element.Element === 'FL');
  const flowPayload = asRecord(flowElement?.Payload);
  const flow = Array.isArray(flowPayload?.Flow)
    ? flowPayload.Flow.map(asRecord).filter((entry): entry is Record<string, unknown> => Boolean(entry))
    : [];

  if (activeBlocks.length !== 1 || flow.length !== 1 || flow[0].Type !== 'Block') {
    state.unsupported.push({
      code: 'qualtrics-complex-flow',
      title: 'Qualtrics flow is outside the supported single-block subset',
      detail:
        'Use one ordinary question block only. Branches, randomisers, embedded-data flow and multiple blocks are not removed or flattened.',
    });
    return { order: [], trashQuestionIds };
  }
  const blockId = text(flow[0].ID);
  const block = activeBlocks.find((candidate) => text(candidate.ID) === blockId);
  if (!block) {
    state.unsupported.push({
      code: 'qualtrics-missing-block',
      title: 'The active Qualtrics block could not be resolved',
      detail: `Survey Flow references ${blockId || 'an unknown block'}.`,
    });
    return { order: [], trashQuestionIds };
  }
  const blockItems = Array.isArray(block.BlockElements) ? block.BlockElements : [];
  const order: string[] = [];
  for (const candidate of blockItems) {
    const item = asRecord(candidate);
    if (!item || item.Type !== 'Question' || !text(item.QuestionID)) {
      state.unsupported.push({
        code: 'qualtrics-non-question-block-item',
        title: 'The Qualtrics block contains unsupported content',
        detail: 'Only ordered question entries are supported in the imported block.',
      });
      continue;
    }
    if (item.SkipLogic || item.DisplayLogic) {
      state.unsupported.push({
        code: 'qualtrics-question-logic',
        title: `${text(item.QuestionID)} uses question logic`,
        detail: 'Skip and display logic are not imported.',
      });
    }
    order.push(text(item.QuestionID));
  }
  return { order, trashQuestionIds };
}

function qsfQuestionHasUnsupportedBehaviour(payload: Record<string, unknown>) {
  return [
    'QuestionJS',
    'JavaScript',
    'DisplayLogic',
    'SkipLogic',
    'ChoiceDisplayLogic',
    'CarryForward',
    'Randomization',
    'ChoiceRandomization',
  ].some((key) => payload[key] !== undefined && payload[key] !== null);
}

function qsfScale(
  payload: Record<string, unknown>,
  optionsKey: 'Choices' | 'Answers',
  orderKey: 'ChoiceOrder' | 'AnswerOrder',
  sourceId: string,
  state: ImportAccumulator,
) {
  const options = asRecord(payload[optionsKey]);
  if (!options) {
    state.unsupported.push({
      code: 'qualtrics-missing-scale',
      title: `${sourceId} has no answer scale`,
      detail: `${optionsKey} must contain every visible answer option.`,
    });
    return null;
  }
  const keys = orderedKeys(payload[orderKey], options);
  if (!keys) {
    state.unsupported.push({
      code: 'qualtrics-unknown-answer-order',
      title: `${sourceId} has no reliable answer order`,
      detail: `${orderKey} must list every ${optionsKey.toLowerCase()} entry exactly once.`,
    });
    return null;
  }

  const recodes = asRecord(payload.RecodeValues);
  let values: number[];
  if (recodes) {
    const explicitValues = keys.map((key) => parseInteger(recodes[key]));
    if (explicitValues.some((value) => value === null)) {
      state.unsupported.push({
        code: 'qualtrics-nonnumeric-recodes',
        title: `${sourceId} has missing or non-integer recode values`,
        detail: 'Every visible option needs an explicit whole-number recode.',
      });
      return null;
    }
    values = explicitValues as number[];
  } else {
    const hasDefaultSequentialChoiceIds = keys.every(
      (key, index) => key === String(index + 1),
    );
    if (!hasDefaultSequentialChoiceIds) {
      state.unsupported.push({
        code: 'qualtrics-missing-scale',
        title: `${sourceId} has no explicit recode table or default sequential choice IDs`,
        detail:
          'Without RecodeValues, ChoiceOrder must explicitly list the default IDs 1 through N. ' +
          'The importer will not infer values from other object keys.',
      });
      return null;
    }
    values = keys.map((_, index) => index + 1);
    addConfirmation(state, {
      code: 'qualtrics-default-recodes',
      title: 'Qualtrics default sequential recodes were used',
      detail:
        'The QSF omits RecodeValues and explicitly orders default choice IDs 1 through N. ' +
        'Confirm these values against the source survey before conversion.',
    });
  }
  const labels = keys.map((key, index) =>
    optionDisplay(options[key], `Answer ${index + 1}`, `${sourceId}/${key}`, state));
  if (labels.some((label) => label === null)) return null;
  return {
    values,
    labels: labels as string[],
  };
}

function parseQualtricsQsf(
  contents: string,
  fileName: string,
): QuestionnaireImportReview {
  let candidate: unknown;
  try {
    candidate = JSON.parse(contents);
  } catch {
    throw new Error('The Qualtrics QSF file is not valid JSON.');
  }
  const root = requirePlainObject(
    candidate,
    'The Qualtrics QSF root must be a JSON object.',
  );
  const entry = requirePlainObject(
    root.SurveyEntry,
    'The file does not contain a Qualtrics SurveyEntry.',
  );
  if (!Array.isArray(root.SurveyElements)) {
    throw new Error('The file does not contain Qualtrics SurveyElements.');
  }
  const importState = state();
  const title = collapsed(text(entry.SurveyName)) || 'Imported Qualtrics questionnaire';
  const elements = root.SurveyElements
    .map(asRecord)
    .filter((element): element is Record<string, unknown> => Boolean(element));
  const { order, trashQuestionIds } = qsfQuestionOrder(elements, importState);
  const ignoredElementTypes = new Set(
    elements
      .map((element) => text(element.Element))
      .filter((elementType) => elementType && !['BL', 'FL', 'SQ'].includes(elementType)),
  );
  if (ignoredElementTypes.size) {
    addConfirmation(importState, {
      code: 'qualtrics-platform-settings-not-imported',
      title: 'Qualtrics platform and presentation settings are not imported',
      detail:
        `The following non-question element types remain in Qualtrics only: ` +
        `${[...ignoredElementTypes].sort().join(', ')}. Review the converted participant presentation.`,
    });
  }
  const questions = new Map(
    elements
      .filter((element) => element.Element === 'SQ')
      .map((element) => [text(element.PrimaryAttribute), asRecord(element.Payload)]),
  );
  if (order.length) {
    const activeQuestionIds = new Set(order);
    for (const questionId of questions.keys()) {
      if (!questionId || activeQuestionIds.has(questionId) || trashQuestionIds.has(questionId)) {
        continue;
      }
      importState.unsupported.push({
        code: 'qualtrics-unreferenced-question',
        title: `${questionId} is outside the imported active block`,
        detail:
          'The importer will not silently omit an active question that is not represented by the supported single-block flow.',
      });
    }
  }
  const items: ImportedScaleItem[] = [];

  for (const questionId of order) {
    const payload = questions.get(questionId);
    if (!payload) {
      importState.unsupported.push({
        code: 'qualtrics-missing-question',
        title: `${questionId} is missing`,
        detail: 'The active block references a question that is not present in SurveyElements.',
      });
      continue;
    }
    if (qsfQuestionHasUnsupportedBehaviour(payload)) {
      importState.unsupported.push({
        code: 'qualtrics-unsupported-behaviour',
        title: `${questionId} contains logic, randomisation or code`,
        detail: 'The importer does not execute or remove question behaviour.',
      });
      continue;
    }
    const validation = asRecord(payload.Validation);
    const settings = asRecord(validation?.Settings);
    if (settings?.ForceResponse !== 'ON') {
      importState.unsupported.push({
        code: 'qualtrics-optional-question',
        title: `${questionId} is not a forced-response question`,
        detail: 'The participant platform currently requires every imported item.',
      });
      continue;
    }
    const questionText = safeVisibleText(
      payload.QuestionText,
      'Question text',
      questionId,
      importState,
    );
    if (!questionText) continue;
    const questionType = text(payload.QuestionType);
    const selector = text(payload.Selector);
    const subSelector = text(payload.SubSelector);
    const exportTag = collapsed(text(payload.DataExportTag)) || questionId;

    if (questionType === 'MC' && selector === 'SAVR') {
      const scale = qsfScale(
        payload,
        'Choices',
        'ChoiceOrder',
        questionId,
        importState,
      );
      if (!scale) continue;
      const item: ImportedScaleItem = {
        sourceId: questionId,
        name: exportTag,
        prompt: questionText,
        ...scale,
      };
      items.push(item);
      importState.imported.push(findingForItem(item));
      continue;
    }

    if (
      questionType === 'Matrix' &&
      selector === 'Likert' &&
      subSelector === 'SingleAnswer'
    ) {
      const scale = qsfScale(
        payload,
        'Answers',
        'AnswerOrder',
        questionId,
        importState,
      );
      const choices = asRecord(payload.Choices);
      const choiceKeys = choices ? orderedKeys(payload.ChoiceOrder, choices) : null;
      if (!scale || !choices || !choiceKeys) {
        if (!choiceKeys) {
          importState.unsupported.push({
            code: 'qualtrics-unknown-row-order',
            title: `${questionId} has no reliable matrix row order`,
            detail: 'ChoiceOrder must list every matrix row exactly once.',
          });
        }
        continue;
      }
      addConfirmation(importState, {
        code: 'qualtrics-matrix-expanded',
        title: 'Single-answer matrix rows were expanded into items',
        detail:
          'Review each generated item against the original matrix before conversion.',
      });
      choiceKeys.forEach((choiceKey, index) => {
        const rowLabel = optionDisplay(
          choices[choiceKey],
          `Matrix row ${index + 1}`,
          `${questionId}/${choiceKey}`,
          importState,
        );
        if (!rowLabel) return;
        const item: ImportedScaleItem = {
          sourceId: `${questionId}/${choiceKey}`,
          name: rowLabel,
          prompt: `${questionText} — ${rowLabel}`,
          ...scale,
        };
        items.push(item);
        importState.imported.push(findingForItem(item));
      });
      continue;
    }

    importState.unsupported.push({
      code: 'qualtrics-unsupported-question',
      title: `${questionId} uses an unsupported Qualtrics question type`,
      detail:
        `${questionType || 'Unknown'} / ${selector || 'Unknown'} / ` +
        `${subSelector || 'none'} is not converted. Supported: MC/SAVR and Matrix/Likert/SingleAnswer.`,
    });
  }

  const description = text(entry.SurveyDescription).trim()
    ? safeVisibleText(
        entry.SurveyDescription,
        'Survey description',
        'SurveyEntry',
        importState,
      )
    : null;
  const introPrompt = description ??
    'Answer each imported item about the task that you have just completed.';
  const draft = buildDraft(
    title,
    'Imported from Qualtrics QSF',
    introPrompt,
    items,
    importState,
  );
  return makeReview(
    'qualtrics-qsf',
    'Qualtrics QSF',
    fileName,
    title,
    draft,
    importState,
  );
}

function xmlRows(document: Document, sectionName: string) {
  const section = [...document.documentElement.children]
    .find((element) => element.localName === sectionName);
  if (!section) return [];
  const rows = [...section.children].find((element) => element.localName === 'rows');
  if (!rows) return [];
  return [...rows.children]
    .filter((element) => element.localName === 'row')
    .map((row) => Object.fromEntries(
      [...row.children].map((cell) => [cell.localName, cell.textContent ?? '']),
    ));
}

function lssLocalisedValue(
  rows: Record<string, string>[],
  idField: string,
  id: string,
  valueField: string,
  language: string,
) {
  return rows.find(
    (row) => row[idField] === id && (!row.language || row.language === language),
  )?.[valueField] ?? '';
}

const safeLimeSurveyQuestionAttributeValues: Record<string, readonly string[]> = {
  answer_width: ['0'],
  answer_order: ['normal'],
  array_filter_style: ['0'],
  clear_default: ['N'],
  dropdown_prefix: ['0'],
  hidden: ['0'],
  hide_tip: ['0'],
  max_answers: ['1'],
  min_answers: ['1'],
  other_comment_mandatory: ['0'],
  other_numbers_only: ['0'],
  other_position: ['default'],
  page_break: ['0'],
  public_statistics: ['0'],
  random_order: ['0'],
  save_as_default: ['N'],
  scale_export: ['0'],
  slider_rating: ['0'],
  statistics_graphtype: ['0'],
  statistics_showgraph: ['1'],
  time_limit_action: ['1'],
  time_limit_disable_next: ['0'],
  time_limit_disable_prev: ['0'],
  use_dropdown: ['0'],
};

function reviewLimeSurveyQuestionAttributes(
  rows: Record<string, string>[],
  state: ImportAccumulator,
) {
  if (!rows.length) return;
  const active = rows.filter((row) => {
    const attribute = row.attribute?.trim() ?? '';
    const value = row.value?.trim() ?? '';
    if (!value) return false;
    return !safeLimeSurveyQuestionAttributeValues[attribute]?.includes(value);
  });
  if (active.length) {
    const summary = active
      .slice(0, 6)
      .map((row) => `${row.qid || 'unknown question'}: ${row.attribute || 'unknown'}=${row.value || ''}`)
      .join('; ');
    state.unsupported.push({
      code: 'limesurvey-question-attributes',
      title: 'The LimeSurvey export contains active or unknown question attributes',
      detail:
        `${summary}${active.length > 6 ? `; and ${active.length - 6} more` : ''}. ` +
        'These settings may change validation, randomisation, timing or presentation and are not discarded.',
    });
    return;
  }
  addConfirmation(state, {
    code: 'limesurvey-default-question-attributes',
    title: 'Default LimeSurvey question settings were not imported',
    detail:
      'Only empty or known default attributes were present; no active validation, randomisation or timing rule was found. ' +
      'Review the converted participant presentation.',
  });
}

function visibleMarkupText(raw: string) {
  if (!raw.trim()) return '';
  const parser = new DOMParser();
  const parsed = parser.parseFromString(`<body>${raw}</body>`, 'text/html');
  return collapsed(parsed.body.textContent ?? '');
}

function reliableLimeSurveyAnswerOrder(answers: Record<string, string>[]) {
  const orders = answers.map((answer) => parseInteger(answer.sortorder));
  if (orders.some((order) => order === null)) return false;
  const values = orders as number[];
  if (new Set(values).size !== values.length) return false;
  const start = values[0];
  return (start === 0 || start === 1) &&
    values.every((value, index) => value === start + index);
}

function hasDefaultLimeSurveyAnswerCodes(answers: Record<string, string>[]) {
  return answers.every(
    (answer, index) => answer.code === `A${String(index + 1).padStart(3, '0')}`,
  );
}

function inferLimeSurveyResponseValues(
  question: Record<string, string>,
  answers: Record<string, string>[],
): number[] | null {
  if (question.type === '5') return [1, 2, 3, 4, 5];
  if (question.type !== 'F' && question.type !== 'L' && question.type !== '!') {
    return null;
  }
  const questionAnswers = answers
    .filter((answer) =>
      answer.qid === question.qid && (!answer.scale_id || answer.scale_id === '0'))
    .sort((left, right) =>
      (Number(left.sortorder) || 0) - (Number(right.sortorder) || 0));
  if (!reliableLimeSurveyAnswerOrder(questionAnswers)) return null;
  const codes = questionAnswers.map((answer) => parseInteger(answer.code));
  if (codes.every((value) => value !== null) && validIncreasingScale(codes as number[])) {
    return codes as number[];
  }
  const assessments = questionAnswers.map((answer) => parseInteger(answer.assessment_value));
  if (
    assessments.every((value) => value !== null) &&
    validIncreasingScale(assessments as number[])
  ) {
    return assessments as number[];
  }
  if (hasDefaultLimeSurveyAnswerCodes(questionAnswers)) {
    return questionAnswers.map((_, index) => index + 1);
  }
  return null;
}

function limeSurveyRatingSetOptions(
  parentQuestions: Record<string, string>[],
  subquestions: Record<string, string>[],
  answers: Record<string, string>[],
): LimeSurveyRatingSetOption[] {
  const grouped = new Map<string, {
    questions: Record<string, string>[];
    values: number[];
    itemCount: number;
  }>();
  for (const question of parentQuestions) {
    if (
      question.mandatory !== 'Y' ||
      (question.other && question.other !== 'N') ||
      (question.relevance && question.relevance !== '1')
    ) continue;
    const values = inferLimeSurveyResponseValues(question, answers);
    if (!values) continue;
    const rowCount = question.type === 'F'
      ? subquestions.filter((row) => row.parent_qid === question.qid).length
      : 1;
    if (rowCount < 1) continue;
    const signature = values.join('|');
    const existing = grouped.get(signature) ?? { questions: [], values, itemCount: 0 };
    existing.questions.push(question);
    existing.itemCount += rowCount;
    grouped.set(signature, existing);
  }
  return [...grouped.entries()].map(([signature, group]) => ({
    id: `values-${signature.replace(/\|/g, '-')}`,
    name: group.questions.map((question) => question.title || question.qid).join(' + '),
    sourceQuestionCount: group.questions.length,
    itemCount: group.itemCount,
    responseValues: group.values,
    questionTypes: [...new Set(group.questions.map((question) => question.type || 'unknown'))],
  }));
}

function parseLimeSurveyAnswerScale(
  question: Record<string, string>,
  answers: Record<string, string>[],
  answerL10ns: Record<string, string>[],
  language: string,
  state: ImportAccumulator,
) {
  const questionId = question.qid || question.title || 'unknown-question';
  const questionAnswers = answers
    .filter((answer) =>
      answer.qid === question.qid && (!answer.scale_id || answer.scale_id === '0'))
    .sort((left, right) =>
      (Number(left.sortorder) || 0) - (Number(right.sortorder) || 0));
  if (!reliableLimeSurveyAnswerOrder(questionAnswers)) {
    state.unsupported.push({
      code: 'limesurvey-answer-order',
      title: `${question.title || questionId} has no reliable answer order`,
      detail: 'Every answer needs one unique consecutive sort order starting at 0 or 1.',
    });
    return null;
  }
  const codes = questionAnswers.map((answer) => parseInteger(answer.code));
  const assessments = questionAnswers.map((answer) => parseInteger(answer.assessment_value));
  let values: number[];
  if (codes.every((value) => value !== null) && validIncreasingScale(codes as number[])) {
    values = codes as number[];
  } else if (
    assessments.every((value) => value !== null) &&
    validIncreasingScale(assessments as number[])
  ) {
    values = assessments as number[];
    addConfirmation(state, {
      code: 'limesurvey-assessment-values',
      title: 'LimeSurvey assessment values were used as response values',
      detail: 'Verify every imported value against the LimeSurvey answer table.',
    });
  } else if (hasDefaultLimeSurveyAnswerCodes(questionAnswers)) {
    values = questionAnswers.map((_, index) => index + 1);
    addConfirmation(state, {
      code: 'limesurvey-positional-values',
      title: 'LimeSurvey default answer codes were converted to ordered positions',
      detail:
        'The source uses A001 through A00N rather than numeric scores. The converted scale uses positions 1 through N. ' +
        'Confirm the intended values and scoring before conversion.',
    });
  } else {
    state.unsupported.push({
      code: 'limesurvey-unsupported-values',
      title: `${question.title || questionId} has no safe increasing numeric recode`,
      detail:
        'Answer codes or assessment values must form one increasing whole-number scale with a constant step.',
    });
    return null;
  }

  const labels = questionAnswers.map((answer, index) => {
    const rawAnswer =
      lssLocalisedValue(answerL10ns, 'aid', answer.aid, 'answer', language) ||
      answer.answer;
    if (!collapsed(rawAnswer ?? '')) {
      addConfirmation(state, {
        code: 'limesurvey-blank-scale-labels',
        title: 'Blank scale positions will be shown as their numeric values',
        detail:
          'LimeSurvey leaves one or more intermediate labels blank. The converted questionnaire shows the reviewed numeric response value at those positions.',
      });
      return String(values[index]);
    }
    return safeVisibleText(
      rawAnswer,
      `Answer ${index + 1}`,
      `${question.title || questionId}/${answer.code}`,
      state,
    );
  });
  if (labels.some((label) => !label)) return null;
  return { values, labels: labels as string[] };
}

function parseLimeSurveyXml(
  contents: string,
  fileName: string,
  selectedGroupId?: string,
  selectedRatingSetId?: string,
): QuestionnaireImportReview {
  if (/<!DOCTYPE|<!ENTITY|<\?xml-stylesheet/i.test(contents)) {
    throw new Error('The LimeSurvey file contains a DTD, entity or stylesheet declaration and was not parsed.');
  }
  const parser = new DOMParser();
  const document = parser.parseFromString(contents, 'application/xml');
  if (document.querySelector('parsererror')) {
    throw new Error('The LimeSurvey file is not valid XML.');
  }
  const documentType = document.querySelector('LimeSurveyDocType')?.textContent?.trim();
  if (documentType !== 'Survey' && documentType !== 'Group' && documentType !== 'Question') {
    throw new Error('The XML file is not a LimeSurvey survey, question-group or question export.');
  }
  const source: QuestionnaireImportSource = documentType === 'Group'
    ? 'limesurvey-lsg'
    : documentType === 'Question'
      ? 'limesurvey-lsq'
      : 'limesurvey-lss';
  const sourceName = documentType === 'Group'
    ? 'LimeSurvey LSG'
    : documentType === 'Question'
      ? 'LimeSurvey LSQ'
      : 'LimeSurvey LSS';
  const importState = state();
  const languages = [...document.querySelectorAll('languages > language')]
    .map((language) => language.textContent?.trim() ?? '')
    .filter(Boolean);
  const surveys = xmlRows(document, 'surveys');
  const declaredBaseLanguage = collapsed(surveys[0]?.language ?? '');
  const language = declaredBaseLanguage || languages[0] || '';
  if (!language || (languages.length && !languages.includes(language))) {
    importState.unsupported.push({
      code: 'limesurvey-base-language',
      title: 'The LimeSurvey base language could not be resolved',
      detail: 'The survey language must match one language declared in the LSS export.',
    });
  } else if (languages.length > 1) {
    addConfirmation(importState, {
      code: 'limesurvey-base-language-only',
      title: `Only the LimeSurvey base language (${language}) will be imported`,
      detail:
        `Additional languages (${languages.filter((candidate) => candidate !== language).join(', ')}) ` +
        'remain in LimeSurvey and are not included in the converted definition. Confirm the intended participant language.',
    });
  }
  const surveyLanguages = xmlRows(document, 'surveys_languagesettings');
  const surveyLanguage = surveyLanguages.find(
    (row) => !row.surveyls_language || row.surveyls_language === language,
  ) ?? surveyLanguages[0];
  const title = collapsed(surveyLanguage?.surveyls_title ?? '') ||
    'Imported LimeSurvey questionnaire';
  const rawQuestions = xmlRows(document, 'questions')
    .filter((row) => !row.language || !language || row.language === language);
  const firstParentQuestion = rawQuestions.find(
    (question) => !question.parent_qid || question.parent_qid === '0',
  );
  const questionGroupId = firstParentQuestion?.gid || '__lsq__';
  const groups: Record<string, string>[] = documentType === 'Question'
    ? [{ gid: questionGroupId, group_order: '0', grelevance: '1', randomization_group: '' }]
    : xmlRows(document, 'groups');
  const groupL10ns: Record<string, string>[] = documentType === 'Question'
    ? [{
        gid: questionGroupId,
        group_name: firstParentQuestion?.title || 'Imported LimeSurvey question',
        description: '',
        language,
      }]
    : xmlRows(document, 'group_l10ns');
  const questions: Record<string, string>[] = rawQuestions.map((question) => ({
    ...question,
    gid: question.gid || questionGroupId,
  }));
  if (!groups.length) {
    throw new Error('The LimeSurvey export contains no questionnaire group.');
  }

  const groupOptions = groups
    .slice()
    .sort((left, right) =>
      (Number(left.group_order) || 0) - (Number(right.group_order) || 0))
    .map((group) => {
      const localised = groupL10ns.find(
        (row) => row.gid === group.gid && (!row.language || row.language === language),
      );
      const groupQuestions = questions.filter(
        (question) => question.gid === group.gid &&
          (!question.parent_qid || question.parent_qid === '0'),
      );
      return {
        id: group.gid,
        name: collapsed(localised?.group_name ?? group.group_name ?? '') ||
          `Group ${group.gid}`,
        questionCount: groupQuestions.length,
        questionTypes: [...new Set(groupQuestions.map((question) =>
          question.type || 'unknown'))],
      };
    });

  if (documentType === 'Survey' && groups.length > 1 && !selectedGroupId) {
    return makeReview(
      source,
      sourceName,
      fileName,
      title,
      null,
      importState,
      {
        requiresGroupSelection: true,
        groupOptions,
      },
    );
  }

  const selectedGroup = selectedGroupId
    ? groups.find((group) => group.gid === selectedGroupId)
    : groups[0];
  if (!selectedGroup) {
    throw new Error('Choose a questionnaire group contained in this LimeSurvey export.');
  }
  const selectedGroupLocalisation = groupL10ns.find(
    (row) => row.gid === selectedGroup.gid &&
      (!row.language || row.language === language),
  );
  const groupTitle = collapsed(
    selectedGroupLocalisation?.group_name ?? selectedGroup.group_name ?? '',
  ) || `Group ${selectedGroup.gid}`;
  const selectedQuestions = questions.filter(
    (question) => question.gid === selectedGroup.gid,
  );
  const allSubquestions: Record<string, string>[] = xmlRows(document, 'subquestions')
    .filter((row) => !row.language || !language || row.language === language)
    .map((question) => ({ ...question, gid: question.gid || questionGroupId }));
  const groupSubquestions = allSubquestions.filter(
    (question) => question.gid === selectedGroup.gid ||
      selectedQuestions.some((parent) => parent.qid === question.parent_qid),
  );
  const allParentQuestions = selectedQuestions
    .filter((question) => !question.parent_qid || question.parent_qid === '0')
    .sort((left, right) =>
      (Number(left.question_order) || 0) - (Number(right.question_order) || 0));
  const answers = xmlRows(document, 'answers')
    .filter((row) => !row.language || !language || row.language === language);
  const ratingSetOptions = limeSurveyRatingSetOptions(
    allParentQuestions,
    groupSubquestions,
    answers,
  );

  if (documentType === 'Survey' && groups.length > 1) {
    addConfirmation(importState, {
      code: 'limesurvey-selected-group-only',
      title: `Only “${groupTitle}” will be converted`,
      detail:
        `${groups.length - 1} other survey group${groups.length === 2 ? '' : 's'} will remain outside the converted questionnaire. ` +
        'The researcher selected this group explicitly; no other group is silently flattened or removed.',
    });
  }
  if (documentType === 'Question') {
    addConfirmation(importState, {
      code: 'limesurvey-question-context-not-retained',
      title: 'The LimeSurvey question will run as a standalone questionnaire',
      detail:
        'An LSQ contains one question and its local answer settings, but not its original survey or group context. ' +
        'Confirm that standalone use is intended.',
    });
  }
  if (selectedGroup.grelevance && selectedGroup.grelevance !== '1') {
    addConfirmation(importState, {
      code: 'limesurvey-group-relevance-not-retained',
      title: 'The source group display condition will not be retained',
      detail:
        `The LimeSurvey group condition is “${collapsed(selectedGroup.grelevance)}”. ` +
        'The converted questionnaire runs this selected group as a standalone instrument. Confirm that this is intended.',
    });
  }
  if (collapsed(selectedGroup.randomization_group ?? '')) {
    addConfirmation(importState, {
      code: 'limesurvey-group-randomisation-not-retained',
      title: 'The source group randomisation setting will not be retained',
      detail:
        'The converted questionnaire uses the reviewed exported question order. Confirm that a fixed order is suitable.',
    });
  }

  if (ratingSetOptions.length > 1 && !selectedRatingSetId) {
    return makeReview(
      source,
      sourceName,
      fileName,
      groupTitle,
      null,
      importState,
      {
        groupOptions,
        selectedGroupId: selectedGroup.gid,
        requiresRatingSetSelection: true,
        ratingSetOptions,
      },
    );
  }
  const selectedRatingSet = selectedRatingSetId
    ? ratingSetOptions.find((option) => option.id === selectedRatingSetId)
    : ratingSetOptions[0];
  if (selectedRatingSetId && !selectedRatingSet) {
    throw new Error('Choose a rating set contained in the selected LimeSurvey group.');
  }
  const selectedRatingSignature = selectedRatingSet?.responseValues.join('|');
  const parentQuestions = selectedRatingSignature
    ? allParentQuestions.filter((question) =>
        inferLimeSurveyResponseValues(question, answers)?.join('|') === selectedRatingSignature &&
        question.mandatory === 'Y' &&
        (!question.other || question.other === 'N') &&
        (!question.relevance || question.relevance === '1'))
    : allParentQuestions;
  const selectedParentIds = new Set(parentQuestions.map((question) => question.qid));
  const selectedSubquestions = groupSubquestions.filter((question) =>
    selectedParentIds.has(question.parent_qid));
  const selectedQuestionIds = new Set(parentQuestions.map((question) => question.qid));
  for (const subquestion of selectedSubquestions) selectedQuestionIds.add(subquestion.qid);

  const omittedQuestions = allParentQuestions.filter((question) =>
    !selectedParentIds.has(question.qid));
  if (selectedRatingSet && omittedQuestions.length) {
    addConfirmation(importState, {
      code: 'limesurvey-selected-rating-set-only',
      title: `Only the ${selectedRatingSet.responseValues[0]}–${selectedRatingSet.responseValues.at(-1)} rating set will be converted`,
      detail:
        `${omittedQuestions.length} other source question${omittedQuestions.length === 1 ? '' : 's'} ` +
        `(${omittedQuestions.map((question) => `${question.title || question.qid} [type ${question.type || 'unknown'}]`).join(', ')}) ` +
        'will remain in LimeSurvey. They are listed here rather than silently removed or mixed into an invalid score.',
    });
  }

  const conditions = xmlRows(document, 'conditions').filter((condition) =>
    selectedQuestionIds.has(condition.qid) ||
    selectedQuestionIds.has(condition.cqid));
  if (conditions.length) {
    importState.unsupported.push({
      code: 'limesurvey-conditions',
      title: 'The selected LimeSurvey group contains question conditions',
      detail: 'Branching and conditional relevance are not imported.',
    });
  }
  for (const [sectionName, title] of [
    ['assessments', 'assessment rules'],
    ['defaultvalues', 'default answers'],
    ['quotas', 'quota rules'],
    ['quota_members', 'quota membership rules'],
    ['quota_languages', 'localised quota messages'],
  ] as const) {
    if (!xmlRows(document, sectionName).length) continue;
    importState.unsupported.push({
      code: `limesurvey-${sectionName.replace(/_/g, '-')}`,
      title: `The LimeSurvey export contains ${title}`,
      detail: `${title[0].toUpperCase()}${title.slice(1)} are not executed or silently discarded.`,
    });
  }
  reviewLimeSurveyQuestionAttributes(
    xmlRows(document, 'question_attributes').filter((row) =>
      selectedQuestionIds.has(row.qid)),
    importState,
  );

  const questionL10ns = xmlRows(document, 'question_l10ns');
  const answerL10ns = xmlRows(document, 'answer_l10ns');
  const items: ImportedScaleItem[] = [];

  addConfirmation(importState, {
    code: 'limesurvey-platform-settings-not-imported',
    title: 'LimeSurvey platform and presentation settings are not imported',
    detail:
      'Theme, navigation, notification and publication settings remain in LimeSurvey. Review the converted participant presentation.',
  });

  for (const question of parentQuestions) {
    const questionId = question.qid || question.title || 'unknown-question';
    if (question.mandatory !== 'Y') {
      importState.unsupported.push({
        code: 'limesurvey-optional-question',
        title: `${question.title || questionId} is not mandatory`,
        detail: 'The participant platform currently requires every imported item.',
      });
      continue;
    }
    if (question.other && question.other !== 'N') {
      importState.unsupported.push({
        code: 'limesurvey-other-answer',
        title: `${question.title || questionId} allows an “Other” answer`,
        detail: 'Free-text “Other” responses are not imported.',
      });
      continue;
    }
    if (question.relevance && question.relevance !== '1') {
      importState.unsupported.push({
        code: 'limesurvey-question-relevance',
        title: `${question.title || questionId} uses relevance logic`,
        detail: 'Conditional questions are not imported.',
      });
      continue;
    }
    const rawQuestionText =
      lssLocalisedValue(questionL10ns, 'qid', question.qid, 'question', language) ||
      question.question;
    const questionHelp =
      lssLocalisedValue(questionL10ns, 'qid', question.qid, 'help', language) ||
      question.help;
    const questionScript =
      lssLocalisedValue(questionL10ns, 'qid', question.qid, 'script', language) ||
      question.script;
    if (collapsed(questionScript || '')) {
      importState.unsupported.push({
        code: 'limesurvey-question-script',
        title: `${question.title || questionId} contains a question script`,
        detail: 'Imported scripts are never executed or silently removed.',
      });
      continue;
    }
    if (
      executableMarkup.test(questionHelp || '') ||
      dynamicText.test(questionHelp || '') ||
      unsupportedStructuredMarkup.test(questionHelp || '')
    ) {
      importState.unsupported.push({
        code: 'limesurvey-question-help-structure',
        title: `${question.title || questionId} contains dynamic or structured help content`,
        detail: 'Executable code, expressions, media and interactive help are not imported.',
      });
      continue;
    }
    if (visibleMarkupText(questionHelp || '')) {
      importState.unsupported.push({
        code: 'limesurvey-question-help',
        title: `${question.title || questionId} contains participant help text`,
        detail: 'Question help text is not silently merged into or removed from the item wording.',
      });
      continue;
    }
    const parentPrompt = collapsed(rawQuestionText ?? '')
      ? safeVisibleText(
          rawQuestionText,
          'Question text',
          question.title || questionId,
          importState,
        )
      : null;

    if (question.type === '5') {
      if (!parentPrompt) {
        importState.unsupported.push({
          code: 'missing-visible-text',
          title: 'Question text is empty',
          detail: `${question.title || questionId} does not contain participant-visible text.`,
        });
        continue;
      }
      const item: ImportedScaleItem = {
        sourceId: question.title || questionId,
        name: question.title || `Item ${items.length + 1}`,
        prompt: parentPrompt,
        values: [1, 2, 3, 4, 5],
        labels: ['1', '2', '3', '4', '5'],
      };
      items.push(item);
      importState.imported.push(findingForItem(item));
    } else if (question.type === 'L' || question.type === '!') {
      if (!parentPrompt) {
        importState.unsupported.push({
          code: 'missing-visible-text',
          title: 'Question text is empty',
          detail: `${question.title || questionId} does not contain participant-visible text.`,
        });
        continue;
      }
      const scale = parseLimeSurveyAnswerScale(
        question,
        answers,
        answerL10ns,
        language,
        importState,
      );
      if (!scale) continue;
      const item: ImportedScaleItem = {
        sourceId: question.title || questionId,
        name: question.title || `Item ${items.length + 1}`,
        prompt: parentPrompt,
        ...scale,
      };
      items.push(item);
      importState.imported.push(findingForItem(item));
    } else if (question.type === 'F') {
      const rows = selectedSubquestions
        .filter((row) => row.parent_qid === question.qid)
        .sort((left, right) =>
          (Number(left.question_order) || 0) - (Number(right.question_order) || 0));
      if (!rows.length) {
        importState.unsupported.push({
          code: 'limesurvey-array-without-rows',
          title: `${question.title || questionId} has no array row`,
          detail:
            'A LimeSurvey Array question must contain at least one explicit row before it can be converted.',
        });
        continue;
      }
      if (rows.some((row) =>
        (row.relevance && row.relevance !== '1') ||
        (row.other && row.other !== 'N') ||
        (row.scale_id && row.scale_id !== '0'))) {
        importState.unsupported.push({
          code: 'limesurvey-array-row-behaviour',
          title: `${question.title || questionId} contains an unsupported array row`,
          detail: 'Conditional, “Other” or secondary-scale array rows are not flattened.',
        });
        continue;
      }
      const scale = parseLimeSurveyAnswerScale(
        question,
        answers,
        answerL10ns,
        language,
        importState,
      );
      if (!scale) continue;
      if (rows.length === 1) {
        addConfirmation(importState, {
          code: 'limesurvey-single-row-array-expanded',
          title: 'Single-row LimeSurvey Array questions were converted to rating items',
          detail:
            'Each source question contains one array row. Review the displayed item wording and response scale against LimeSurvey.',
        });
      } else {
        addConfirmation(importState, {
          code: 'limesurvey-array-expanded',
          title: 'LimeSurvey Array rows were converted to separate rating items',
          detail:
            'The source array heading is combined with each visible row label when both contain text. Review the converted wording and order.',
        });
      }
      for (const row of rows) {
        const rowId = row.qid || row.title || `${questionId}-row`;
        const rowText =
          lssLocalisedValue(questionL10ns, 'qid', row.qid, 'question', language) ||
          row.question;
        const rowHelp =
          lssLocalisedValue(questionL10ns, 'qid', row.qid, 'help', language) ||
          row.help;
        const rowScript =
          lssLocalisedValue(questionL10ns, 'qid', row.qid, 'script', language) ||
          row.script;
        if (collapsed(rowScript || '') || executableMarkup.test(rowHelp || '') ||
          dynamicText.test(rowHelp || '') || unsupportedStructuredMarkup.test(rowHelp || '') ||
          visibleMarkupText(rowHelp || '')) {
          importState.unsupported.push({
            code: 'limesurvey-array-row-content',
            title: `${row.title || rowId} contains unsupported row content`,
            detail: 'Array-row scripts, dynamic content and help text are not imported.',
          });
          continue;
        }
        const rowPrompt = collapsed(rowText ?? '')
          ? safeVisibleText(rowText, 'Array row text', row.title || rowId, importState)
          : null;
        const prompt = parentPrompt && rowPrompt
          ? `${parentPrompt}: ${rowPrompt}`
          : parentPrompt || rowPrompt;
        if (!prompt) {
          importState.unsupported.push({
            code: 'missing-visible-text',
            title: 'Array item text is empty',
            detail: `${row.title || rowId} and its parent question contain no participant-visible text.`,
          });
          continue;
        }
        const item: ImportedScaleItem = {
          sourceId: `${question.title || questionId}/${row.title || rowId}`,
          name: rows.length === 1 && !rowPrompt
            ? question.title || `Item ${items.length + 1}`
            : row.title || question.title || `Item ${items.length + 1}`,
          prompt,
          values: [...scale.values],
          labels: [...scale.labels],
        };
        items.push(item);
        importState.imported.push(findingForItem(item));
      }
    } else {
      importState.unsupported.push({
        code: 'limesurvey-unsupported-question',
        title: `${question.title || questionId} uses unsupported LimeSurvey type ${question.type || 'unknown'}`,
        detail: 'Supported in this release: List (Radio), 5 Point Choice and reviewed Array rating rows.',
      });
    }
  }

  const description = documentType === 'Question'
    ? ''
    : selectedGroupLocalisation?.description ||
      selectedGroup.description || surveyLanguage?.surveyls_description ||
      surveyLanguage?.surveyls_welcometext || '';
  const intro = collapsed(description)
    ? safeVisibleText(
        description,
        'Survey introduction',
        'surveys_languagesettings',
        importState,
      )
    : null;
  const draft = buildDraft(
    groupTitle,
    `Imported from ${sourceName}`,
    intro ?? 'Answer each imported item about the task that you have just completed.',
    items,
    importState,
  );
  return makeReview(
    source,
    sourceName,
    fileName,
    groupTitle,
    draft,
    importState,
    {
      groupOptions,
      selectedGroupId: selectedGroup.gid,
      ratingSetOptions,
      selectedRatingSetId: selectedRatingSet?.id,
    },
  );
}

function detectSource(
  contents: string,
  fileName: string,
): QuestionnaireImportSource {
  const extension = fileName.toLowerCase().split('.').at(-1);
  const trimmed = contents.trimStart();
  if (trimmed.startsWith('{') && /"SurveyElements"/.test(contents)) {
    return 'qualtrics-qsf';
  }
  if (trimmed.startsWith('<') && /<LimeSurveyDocType>Survey</.test(contents)) {
    return 'limesurvey-lss';
  }
  if (trimmed.startsWith('<') && /<LimeSurveyDocType>Group</.test(contents)) {
    return 'limesurvey-lsg';
  }
  if (trimmed.startsWith('<') && /<LimeSurveyDocType>Question</.test(contents)) {
    return 'limesurvey-lsq';
  }
  if (extension === 'qsf') return 'qualtrics-qsf';
  if (extension === 'lss') return 'limesurvey-lss';
  if (extension === 'lsg') return 'limesurvey-lsg';
  if (extension === 'lsq') return 'limesurvey-lsq';
  if (extension === 'lsa') {
    throw new Error(
      'LimeSurvey LSA archives are not imported because they may contain responses, tokens and participant data. Export survey structure as LSS instead.',
    );
  }
  if (extension === 'lsl') {
    throw new Error(
      'A LimeSurvey LSL file contains only a reusable label set, not a questionnaire. Export the containing question as LSQ, group as LSG or survey as LSS.',
    );
  }
  if (extension === 'csv' || extension === 'tsv' || extension === 'xls' ||
      extension === 'xlsx') {
    throw new Error(
      'CSV, TSV and spreadsheet files are ambiguous table formats used for response data or platform-specific bulk authoring. Import the file into its source platform, review it there, then export Qualtrics QSF or LimeSurvey LSS, LSG or LSQ.',
    );
  }
  if (extension === 'sav' || extension === 'spss' || extension === 'vv') {
    throw new Error(
      'This is a response-data format, not a reusable questionnaire definition. Export Qualtrics QSF or LimeSurvey LSS, LSG or LSQ from the source questionnaire.',
    );
  }
  if (extension === 'txt' || extension === 'doc' || extension === 'docx' ||
      extension === 'rtf' || extension === 'odt') {
    throw new Error(
      'Text and word-processing files may be manually prepared authoring files or readable exports; they are not an unambiguous native structure export. Import the file into Qualtrics or LimeSurvey first, review it there, then export QSF, LSS, LSG or LSQ.',
    );
  }
  if (extension === 'pdf' || extension === 'html' || extension === 'htm' ||
      extension === 'xml' || extension === 'zip') {
    throw new Error(
      'This print, generic XML or archive format is not an unambiguous native questionnaire structure export. Export Qualtrics QSF or LimeSurvey LSS, LSG or LSQ.',
    );
  }
  if (extension === 'json') {
    throw new Error(
      'This JSON file is not a Qualtrics QSF. If it is an AQP questionnaire definition, use the separate “Reuse an AQP questionnaire definition” route; otherwise export Qualtrics QSF.',
    );
  }
  throw new Error('Choose a Qualtrics .qsf file or a LimeSurvey .lss, .lsg or .lsq file.');
}

export function reviewQuestionnaireExport(
  contents: string,
  fileName: string,
  selectedSource: QuestionnaireImportSourceSelection = 'auto',
  selectedGroupId?: string,
  selectedRatingSetId?: string,
): QuestionnaireImportReview {
  const byteLength = new TextEncoder().encode(contents).length;
  if (!contents.trim()) throw new Error('The selected questionnaire export is empty.');
  if (byteLength > MAX_IMPORT_BYTES) {
    throw new Error('The selected questionnaire export is larger than the 2 MB review limit.');
  }
  const detectedSource = detectSource(contents, fileName);
  if (selectedSource !== 'auto' && selectedSource !== detectedSource) {
    const detectedName = detectedSource === 'qualtrics-qsf'
      ? 'Qualtrics QSF'
      : detectedSource === 'limesurvey-lss'
        ? 'LimeSurvey LSS'
        : detectedSource === 'limesurvey-lsg'
          ? 'LimeSurvey LSG'
          : 'LimeSurvey LSQ';
    throw new Error(
      `The selected file looks like ${detectedName}, not the chosen format.`,
    );
  }
  return detectedSource === 'qualtrics-qsf'
    ? parseQualtricsQsf(contents, fileName)
    : parseLimeSurveyXml(contents, fileName, selectedGroupId, selectedRatingSetId);
}
