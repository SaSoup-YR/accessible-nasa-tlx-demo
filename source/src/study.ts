import { dimensions, pairs, type DimensionId } from './nasa-tlx';
import type { PairResponses, TlxResult } from './scoring';

export const PROTOTYPE_VERSION = '0.5.0';
export const COMPLETED_RESULTS_KEY = 'accessible-nasa-tlx-v0.5-completed-results';

export type AnswerMode = 'standard' | 'smiley';

export interface StudySupportConfig {
  showSimpleLanguage: boolean;
  answerMode: AnswerMode;
  largeText: boolean;
  audioGuidance: boolean;
  recoveryEnabled: boolean;
  allowParticipantChanges: boolean;
  voiceInputAvailable: boolean;
  gazeInputAvailable: boolean;
}

export interface StudyConfig {
  schemaVersion: 1;
  configId: string;
  createdAt: string;
  prototypeVersion: typeof PROTOTYPE_VERSION;
  studyId: string;
  studyTitle: string;
  taskLabel: string;
  showScoreToParticipant: boolean;
  support: StudySupportConfig;
}

export interface SupportMetadata {
  simplerExplanationsShownAtSubmission: boolean;
  largeTextUsedAtSubmission: boolean;
  answerModeAtSubmission: AnswerMode;
  recoveryEnabledAtSubmission: boolean;
  interruptionSummaryShown: boolean;
  readAloudUsed: boolean;
  automaticAudioGuidanceEnabledAtSubmission: boolean;
  gazeUsed: boolean;
  gazeActionCount: number;
  gazeEngine: string | null;
  ratingInputRoutes: Partial<Record<DimensionId, string>>;
  pairInputRoutes: Record<string, string>;
}

export interface StudyResultRecord {
  schemaVersion: 1;
  submissionId: string;
  study: {
    studyId: string;
    configId: string;
    studyTitle: string;
    taskLabel: string;
  };
  participantCode: string;
  timing: {
    startedAt: string;
    completedAt: string;
  };
  prototype: {
    name: 'Accessible NASA-TLX';
    version: typeof PROTOTYPE_VERSION;
  };
  instrument: {
    name: 'NASA Task Load Index';
    version: 'full weighted';
  };
  configuration: StudySupportConfig;
  responses: {
    ratings: Record<DimensionId, number>;
    pairwiseChoices: PairResponses;
    pairPresentationOrder: string[];
  };
  result: TlxResult;
  supportMetadata: SupportMetadata;
}

export interface StudyConfigDraft {
  studyId: string;
  studyTitle: string;
  taskLabel: string;
  showScoreToParticipant: boolean;
  support: StudySupportConfig;
}

export interface StudyResultInput {
  config: StudyConfig;
  participantCode: string;
  startedAt: string;
  completedAt?: string;
  pairPresentationOrder: string[];
  pairwiseChoices: PairResponses;
  result: TlxResult;
  supportMetadata: SupportMetadata;
  submissionId?: string;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function randomId(prefix: string) {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `${prefix}-${uuid}`;
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function cleanText(value: string, field: string, maximumLength: number) {
  const cleaned = value.trim().replace(/\s+/g, ' ');
  if (!cleaned) throw new Error(`${field} is required.`);
  if (cleaned.length > maximumLength) throw new Error(`${field} must be ${maximumLength} characters or fewer.`);
  return cleaned;
}

export function validStudyId(value: string) {
  return /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(value);
}

export function validParticipantCode(value: string) {
  return /^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$/.test(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function validSupportConfig(value: unknown): value is StudySupportConfig {
  if (!value || typeof value !== 'object') return false;
  const support = value as Record<string, unknown>;
  return (
    isBoolean(support.showSimpleLanguage) &&
    (support.answerMode === 'standard' || support.answerMode === 'smiley') &&
    isBoolean(support.largeText) &&
    isBoolean(support.audioGuidance) &&
    isBoolean(support.recoveryEnabled) &&
    isBoolean(support.allowParticipantChanges) &&
    isBoolean(support.voiceInputAvailable) &&
    isBoolean(support.gazeInputAvailable)
  );
}

export function createStudyConfig(draft: StudyConfigDraft, overrides: Partial<Pick<StudyConfig, 'configId' | 'createdAt'>> = {}): StudyConfig {
  const studyId = draft.studyId.trim();
  if (!validStudyId(studyId)) {
    throw new Error('Study ID must use 1–64 letters, numbers, hyphens or underscores, and start with a letter or number.');
  }
  if (!validSupportConfig(draft.support)) throw new Error('The support configuration is incomplete.');
  return {
    schemaVersion: 1,
    configId: overrides.configId ?? randomId('config'),
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    prototypeVersion: PROTOTYPE_VERSION,
    studyId,
    studyTitle: cleanText(draft.studyTitle, 'Study title', 120),
    taskLabel: cleanText(draft.taskLabel, 'Task label', 160),
    showScoreToParticipant: draft.showScoreToParticipant,
    support: { ...draft.support },
  };
}

export function isStudyConfig(value: unknown): value is StudyConfig {
  if (!value || typeof value !== 'object') return false;
  const config = value as Record<string, unknown>;
  return (
    config.schemaVersion === 1 &&
    config.prototypeVersion === PROTOTYPE_VERSION &&
    typeof config.configId === 'string' &&
    config.configId.length > 0 &&
    typeof config.createdAt === 'string' &&
    typeof config.studyId === 'string' &&
    validStudyId(config.studyId) &&
    typeof config.studyTitle === 'string' &&
    config.studyTitle.length > 0 &&
    config.studyTitle.length <= 120 &&
    typeof config.taskLabel === 'string' &&
    config.taskLabel.length > 0 &&
    config.taskLabel.length <= 160 &&
    isBoolean(config.showScoreToParticipant) &&
    validSupportConfig(config.support)
  );
}

function encodeUtf8(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeUtf8(value: string) {
  const normalised = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalised.padEnd(Math.ceil(normalised.length / 4) * 4, '=');
  const binary = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
}

export function encodeStudyConfig(config: StudyConfig) {
  if (!isStudyConfig(config)) throw new Error('Cannot encode an invalid study configuration.');
  return encodeUtf8(JSON.stringify(config));
}

export function decodeStudyConfig(encoded: string): StudyConfig | null {
  try {
    const decoded = JSON.parse(decodeUtf8(encoded)) as unknown;
    return isStudyConfig(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

export function readStudyConfigFromHash(hash: string): StudyConfig | null {
  const parameters = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
  const encoded = parameters.get('study');
  return encoded ? decodeStudyConfig(encoded) : null;
}

export function buildParticipantUrl(baseUrl: string, config: StudyConfig) {
  const url = new URL(baseUrl);
  url.search = '';
  const parameters = new URLSearchParams();
  parameters.set('study', encodeStudyConfig(config));
  url.hash = parameters.toString();
  return url.toString();
}

export function progressStorageKey(configId: string, participantCode: string) {
  if (!validParticipantCode(participantCode)) throw new Error('Invalid participant code.');
  return `accessible-nasa-tlx-v0.5-progress:${configId}:${participantCode}`;
}

export function createStudyResultRecord(input: StudyResultInput): StudyResultRecord {
  if (!validParticipantCode(input.participantCode)) throw new Error('A valid pseudonymous participant code is required.');
  return {
    schemaVersion: 1,
    submissionId: input.submissionId ?? randomId('submission'),
    study: {
      studyId: input.config.studyId,
      configId: input.config.configId,
      studyTitle: input.config.studyTitle,
      taskLabel: input.config.taskLabel,
    },
    participantCode: input.participantCode,
    timing: {
      startedAt: input.startedAt,
      completedAt: input.completedAt ?? new Date().toISOString(),
    },
    prototype: { name: 'Accessible NASA-TLX', version: PROTOTYPE_VERSION },
    instrument: { name: 'NASA Task Load Index', version: 'full weighted' },
    configuration: { ...input.config.support },
    responses: {
      ratings: { ...input.result.ratings },
      pairwiseChoices: { ...input.pairwiseChoices },
      pairPresentationOrder: [...input.pairPresentationOrder],
    },
    result: input.result,
    supportMetadata: input.supportMetadata,
  };
}

export function loadCompletedResults(storage: StorageLike = localStorage): StudyResultRecord[] {
  try {
    const raw = storage.getItem(COMPLETED_RESULTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((record): record is StudyResultRecord => {
      if (!record || typeof record !== 'object') return false;
      const candidate = record as Partial<StudyResultRecord>;
      return candidate.schemaVersion === 1 && typeof candidate.submissionId === 'string' && typeof candidate.participantCode === 'string';
    });
  } catch {
    return [];
  }
}

export function saveCompletedResult(record: StudyResultRecord, storage: StorageLike = localStorage) {
  try {
    const records = loadCompletedResults(storage).filter((existing) => existing.submissionId !== record.submissionId);
    records.push(record);
    storage.setItem(COMPLETED_RESULTS_KEY, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}

export function clearCompletedResults(storage: StorageLike = localStorage) {
  storage.removeItem(COMPLETED_RESULTS_KEY);
}

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function resultRow(record: StudyResultRecord): Record<string, unknown> {
  const row: Record<string, unknown> = {
    schema_version: record.schemaVersion,
    submission_id: record.submissionId,
    study_id: record.study.studyId,
    config_id: record.study.configId,
    participant_code: record.participantCode,
    study_title: record.study.studyTitle,
    task_label: record.study.taskLabel,
    started_at: record.timing.startedAt,
    completed_at: record.timing.completedAt,
    prototype_version: record.prototype.version,
    weighted_score: record.result.weightedScore,
  };
  dimensions.forEach(({ id }) => {
    row[`rating_${id}`] = record.result.ratings[id];
    row[`weight_${id}`] = record.result.weights[id];
    row[`weighted_rating_${id}`] = record.result.adjustedRatings[id];
    row[`rating_route_${id}`] = record.supportMetadata.ratingInputRoutes[id] ?? '';
  });
  pairs.forEach(({ id }) => {
    row[`pair_${id}`] = record.responses.pairwiseChoices[id] ?? '';
    row[`pair_route_${id}`] = record.supportMetadata.pairInputRoutes[id] ?? '';
  });
  Object.entries(record.configuration).forEach(([key, value]) => { row[`configured_${key}`] = value; });
  row.final_simple_language = record.supportMetadata.simplerExplanationsShownAtSubmission;
  row.final_answer_mode = record.supportMetadata.answerModeAtSubmission;
  row.final_large_text = record.supportMetadata.largeTextUsedAtSubmission;
  row.final_audio_guidance = record.supportMetadata.automaticAudioGuidanceEnabledAtSubmission;
  row.final_recovery = record.supportMetadata.recoveryEnabledAtSubmission;
  row.interruption_summary_shown = record.supportMetadata.interruptionSummaryShown;
  row.read_aloud_used = record.supportMetadata.readAloudUsed;
  row.gaze_used = record.supportMetadata.gazeUsed;
  row.gaze_action_count = record.supportMetadata.gazeActionCount;
  row.gaze_engine = record.supportMetadata.gazeEngine;
  row.pair_presentation_order = record.responses.pairPresentationOrder.join('|');
  return row;
}

export function resultsToCsv(records: StudyResultRecord[]) {
  if (records.length === 0) return '';
  const rows = records.map(resultRow);
  const headers = Object.keys(rows[0]);
  return [
    headers.map(csvCell).join(','),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(',')),
  ].join('\r\n');
}

function safeFilePart(value: string) {
  return value.replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64) || 'nasa-tlx';
}

export function resultFileBase(record: StudyResultRecord) {
  return `${safeFilePart(record.study.studyId)}-${safeFilePart(record.participantCode)}-${safeFilePart(record.submissionId)}`;
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
