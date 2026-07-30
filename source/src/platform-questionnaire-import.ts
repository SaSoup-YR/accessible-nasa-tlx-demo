import {
  MAX_CUSTOM_QUESTIONNAIRE_ITEMS,
  createCustomItemDraft,
  type CustomQuestionnaireDraft,
} from './custom-questionnaire';

export type QuestionnaireImportSource = 'qualtrics-qsf' | 'limesurvey-lss';
export type QuestionnaireImportSourceSelection = QuestionnaireImportSource | 'auto';

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
  const recodes = asRecord(payload.RecodeValues);
  if (!options || !recodes) {
    state.unsupported.push({
      code: 'qualtrics-missing-scale',
      title: `${sourceId} has no explicit ordered recode table`,
      detail: 'The importer will not guess answer values from object keys.',
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
  const values = keys.map((key) => parseInteger(recodes[key]));
  if (values.some((value) => value === null)) {
    state.unsupported.push({
      code: 'qualtrics-nonnumeric-recodes',
      title: `${sourceId} has missing or non-integer recode values`,
      detail: 'Every visible option needs an explicit whole-number recode.',
    });
    return null;
  }
  const labels = keys.map((key, index) =>
    optionDisplay(options[key], `Answer ${index + 1}`, `${sourceId}/${key}`, state));
  if (labels.some((label) => label === null)) return null;
  return {
    values: values as number[],
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

function parseLimeSurveyLss(
  contents: string,
  fileName: string,
): QuestionnaireImportReview {
  if (/<!DOCTYPE|<!ENTITY|<\?xml-stylesheet/i.test(contents)) {
    throw new Error('The LimeSurvey file contains a DTD, entity or stylesheet declaration and was not parsed.');
  }
  const parser = new DOMParser();
  const document = parser.parseFromString(contents, 'application/xml');
  if (document.querySelector('parsererror')) {
    throw new Error('The LimeSurvey LSS file is not valid XML.');
  }
  if (document.querySelector('LimeSurveyDocType')?.textContent?.trim() !== 'Survey') {
    throw new Error('The XML file is not a LimeSurvey survey-structure export.');
  }
  const importState = state();
  const languages = [...document.querySelectorAll('languages > language')]
    .map((language) => language.textContent?.trim() ?? '')
    .filter(Boolean);
  if (languages.length !== 1) {
    importState.unsupported.push({
      code: 'limesurvey-multiple-languages',
      title: 'The LimeSurvey export does not contain exactly one language',
      detail: 'Multilingual wording is not flattened or discarded in this release.',
    });
  }
  const language = languages[0] ?? '';
  const surveyLanguages = xmlRows(document, 'surveys_languagesettings');
  const surveyLanguage = surveyLanguages.find(
    (row) => !row.surveyls_language || row.surveyls_language === language,
  ) ?? surveyLanguages[0];
  const title = collapsed(surveyLanguage?.surveyls_title ?? '') ||
    'Imported LimeSurvey questionnaire';
  const groups = xmlRows(document, 'groups');
  const groupL10ns = xmlRows(document, 'group_l10ns');
  if (groups.length !== 1) {
    importState.unsupported.push({
      code: 'limesurvey-multiple-groups',
      title: 'The LimeSurvey export is outside the supported single-group subset',
      detail: 'Multiple group headings and group-level navigation are not flattened.',
    });
  }
  for (const group of groups) {
    if (group.grelevance && group.grelevance !== '1') {
      importState.unsupported.push({
        code: 'limesurvey-group-relevance',
        title: `Group ${group.gid || ''} uses relevance logic`,
        detail: 'Group conditions are not imported.',
      });
    }
    const localised = groupL10ns.find(
      (row) => row.gid === group.gid && (!row.language || row.language === language),
    );
    const description = localised?.description ?? group.description ?? '';
    if (collapsed(description)) {
      importState.unsupported.push({
        code: 'limesurvey-group-description',
        title: `Group ${group.gid || ''} has participant-visible description text`,
        detail: 'Group descriptions are not silently removed by this release.',
      });
    }
  }
  if (xmlRows(document, 'conditions').length) {
    importState.unsupported.push({
      code: 'limesurvey-conditions',
      title: 'The LimeSurvey export contains conditions',
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
  if (xmlRows(document, 'question_attributes').length) {
    importState.unsupported.push({
      code: 'limesurvey-question-attributes',
      title: 'The LimeSurvey export contains question attributes',
      detail:
        'Question attributes may change validation, randomisation or presentation and are not silently discarded.',
    });
  }

  const questions = xmlRows(document, 'questions');
  const questionL10ns = xmlRows(document, 'question_l10ns');
  const answers = xmlRows(document, 'answers');
  const answerL10ns = xmlRows(document, 'answer_l10ns');
  const groupOrder = new Map(groups.map((group) => [group.gid, Number(group.group_order) || 0]));
  const parentQuestions = questions
    .filter((question) => !question.parent_qid || question.parent_qid === '0')
    .sort((left, right) =>
      (groupOrder.get(left.gid) ?? 0) - (groupOrder.get(right.gid) ?? 0) ||
      (Number(left.question_order) || 0) - (Number(right.question_order) || 0));
  const items: ImportedScaleItem[] = [];

  if (questions.some((question) => question.parent_qid && question.parent_qid !== '0')) {
    importState.unsupported.push({
      code: 'limesurvey-subquestions',
      title: 'The LimeSurvey export contains subquestions or matrix rows',
      detail:
        'This release imports only standalone List (Radio) and 5 Point Choice questions.',
    });
  }
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
    if (collapsed(questionHelp || '')) {
      importState.unsupported.push({
        code: 'limesurvey-question-help',
        title: `${question.title || questionId} contains participant help text`,
        detail: 'Question help text is not silently merged into or removed from the item wording.',
      });
      continue;
    }
    const prompt = safeVisibleText(
      rawQuestionText,
      'Question text',
      question.title || questionId,
      importState,
    );
    if (!prompt) continue;

    let values: number[] = [];
    let labels: string[] = [];
    if (question.type === '5') {
      values = [1, 2, 3, 4, 5];
      labels = ['1', '2', '3', '4', '5'];
    } else if (question.type === 'L') {
      const questionAnswers = answers
        .filter((answer) => answer.qid === question.qid && (!answer.scale_id || answer.scale_id === '0'))
        .sort((left, right) => (Number(left.sortorder) || 0) - (Number(right.sortorder) || 0));
      const codes = questionAnswers.map((answer) => parseInteger(answer.code));
      const assessments = questionAnswers.map((answer) => parseInteger(answer.assessment_value));
      if (codes.every((value) => value !== null) && validIncreasingScale(codes as number[])) {
        values = codes as number[];
      } else if (
        assessments.every((value) => value !== null) &&
        validIncreasingScale(assessments as number[])
      ) {
        values = assessments as number[];
        addConfirmation(importState, {
          code: 'limesurvey-assessment-values',
          title: 'LimeSurvey assessment values were used as response values',
          detail: 'Verify every imported value against the LimeSurvey answer table.',
        });
      } else {
        importState.unsupported.push({
          code: 'limesurvey-unsupported-values',
          title: `${question.title || questionId} has no safe increasing numeric recode`,
          detail:
            'Answer codes or assessment values must form one increasing whole-number scale with a constant step.',
        });
        continue;
      }
      labels = questionAnswers.map((answer, index) => {
        const rawAnswer =
          lssLocalisedValue(answerL10ns, 'aid', answer.aid, 'answer', language) ||
          answer.answer;
        return safeVisibleText(
          rawAnswer,
          `Answer ${index + 1}`,
          `${question.title || questionId}/${answer.code}`,
          importState,
        );
      }).filter((label): label is string => Boolean(label));
      if (labels.length !== questionAnswers.length || labels.length !== values.length) continue;
    } else {
      importState.unsupported.push({
        code: 'limesurvey-unsupported-question',
        title: `${question.title || questionId} uses unsupported LimeSurvey type ${question.type || 'unknown'}`,
        detail: 'Supported in this release: List (Radio) and 5 Point Choice.',
      });
      continue;
    }
    const item: ImportedScaleItem = {
      sourceId: question.title || questionId,
      name: question.title || `Item ${items.length + 1}`,
      prompt,
      values,
      labels,
    };
    items.push(item);
    importState.imported.push(findingForItem(item));
  }

  const description = surveyLanguage?.surveyls_description ||
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
    title,
    'Imported from LimeSurvey LSS',
    intro ?? 'Answer each imported item about the task that you have just completed.',
    items,
    importState,
  );
  return makeReview(
    'limesurvey-lss',
    'LimeSurvey LSS',
    fileName,
    title,
    draft,
    importState,
  );
}

function detectSource(
  contents: string,
  fileName: string,
): QuestionnaireImportSource {
  const extension = fileName.toLowerCase().split('.').at(-1);
  const trimmed = contents.trimStart();
  if (extension === 'qsf' || (trimmed.startsWith('{') && /"SurveyElements"/.test(contents))) {
    return 'qualtrics-qsf';
  }
  if (extension === 'lss' || (trimmed.startsWith('<') && /<LimeSurveyDocType>Survey</.test(contents))) {
    return 'limesurvey-lss';
  }
  throw new Error('Choose a Qualtrics .qsf file or a LimeSurvey .lss file.');
}

export function reviewQuestionnaireExport(
  contents: string,
  fileName: string,
  selectedSource: QuestionnaireImportSourceSelection = 'auto',
): QuestionnaireImportReview {
  const byteLength = new TextEncoder().encode(contents).length;
  if (!contents.trim()) throw new Error('The selected questionnaire export is empty.');
  if (byteLength > MAX_IMPORT_BYTES) {
    throw new Error('The selected questionnaire export is larger than the 2 MB review limit.');
  }
  const detectedSource = detectSource(contents, fileName);
  if (selectedSource !== 'auto' && selectedSource !== detectedSource) {
    throw new Error(
      `The selected file looks like ${detectedSource === 'qualtrics-qsf'
        ? 'Qualtrics QSF'
        : 'LimeSurvey LSS'}, not the chosen format.`,
    );
  }
  return detectedSource === 'qualtrics-qsf'
    ? parseQualtricsQsf(contents, fileName)
    : parseLimeSurveyLss(contents, fileName);
}
