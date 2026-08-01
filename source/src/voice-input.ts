import {
  ratingValues as nasaRatingValues,
  smileyLandmarks as nasaSmileyLandmarks,
  type DimensionId,
  type TlxDimension,
} from './nasa-tlx';
import type { RatingLandmark } from './questionnaire-definition';

const spokenNumbers = new Map<string, number>([
  ['zero', 0],
  ['five', 5],
  ['one zero', 10],
  ['ten', 10],
  ['fifteen', 15],
  ['twenty', 20],
  ['twenty five', 25],
  ['thirty', 30],
  ['thirty five', 35],
  ['forty', 40],
  ['forty five', 45],
  ['fifty', 50],
  ['fifty five', 55],
  ['sixty', 60],
  ['sixty five', 65],
  ['seventy', 70],
  ['seventy five', 75],
  ['eighty', 80],
  ['eighty five', 85],
  ['ninety', 90],
  ['ninety five', 95],
  ['one zero zero', 100],
  ['one hundred', 100],
  ['hundred', 100],
]);

const digitWords = new Map<string, string>([
  ['zero', '0'],
  ['oh', '0'],
  ['one', '1'],
  ['two', '2'],
  ['three', '3'],
  ['four', '4'],
  ['five', '5'],
  ['six', '6'],
  ['seven', '7'],
  ['eight', '8'],
  ['nine', '9'],
]);

const smallNumberWords = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
] as const;
const tensWords = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'] as const;

function integerWords(value: number) {
  if (value < 20) return smallNumberWords[value];
  if (value === 100) return 'one hundred';
  const tens = Math.floor(value / 10);
  const units = value % 10;
  return units === 0 ? tensWords[tens] : `${tensWords[tens]} ${smallNumberWords[units]}`;
}

for (let value = 0; value <= 100; value += 1) {
  spokenNumbers.set(integerWords(value), value);
  const digits = String(value)
    .split('')
    .map((digit) => [...digitWords].find(([, mapped]) => mapped === digit)?.[0])
    .filter((word): word is string => Boolean(word))
    .join(' ');
  if (digits) spokenNumbers.set(digits, value);
}

const numberWords = new Set([
  ...digitWords.keys(),
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
  'hundred',
]);

// Speech services sometimes transcribe the negation "not" as a homophone
// ("note", "knot", "naught" or "nought"). Treat those unresolved forms, and
// explicit exclusion/correction language, as unsafe rather than extracting a
// nearby number. An exact visible response label is still checked first by
// parseRatingTranscript, so an official option is not disabled merely because
// its wording contains one of these tokens.
const unsafeMeaning =
  /\b(?:not|note|knot|naught|nought|no|nope|nah|never|cannot|cancel|neither|except|without|minus|negative|skip|avoid|exclude|reject|instead|rather|unsure|uncertain|maybe|perhaps|mistake|wrong)\b|\b(?:(?:anything|everything)\s+but|other\s+than|don\s+t|can\s+t|won\s+t|wouldn\s+t|shouldn\s+t|isn\s+t|wasn\s+t)\b/;

const dimensionAliases: Record<string, readonly string[]> = {
  mental: ['mental demand', 'mental'],
  physical: ['physical demand', 'physical'],
  temporal: ['temporal demand', 'temporal', 'time pressure'],
  performance: ['performance'],
  effort: ['effort'],
  frustration: ['frustration'],
};

function normalise(transcript: string) {
  return transcript
    .toLowerCase()
    .replace(/[-–—]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface RankedSpeechAnswer<T> {
  transcript: string;
  value: T;
}

export function hasUnsafeSpeechMeaning(transcript: string) {
  return unsafeMeaning.test(normalise(transcript));
}

function chooseConsistentAlternative<T>(
  transcripts: readonly string[],
  parser: (transcript: string) => T | null,
): RankedSpeechAnswer<T> | null {
  const ranked = transcripts.map((transcript) => transcript.trim()).filter(Boolean);
  if (ranked.length === 0) return null;

  const attempts = ranked.map((transcript, index) => ({
    transcript,
    value: parser(transcript),
    index,
  }));

  // Reject the complete browser result when any ranked alternative contains
  // unresolved negation or exclusion meaning. This is deliberately independent
  // of rank: Web Speech can return "4" first and "Note 4" second after the user
  // actually said "not four". A parsed exact official label such as the UEQ-S
  // endpoint "Not interesting" is not unresolved and remains eligible.
  if (attempts.some(({ transcript, value }) =>
    value === null && hasUnsafeSpeechMeaning(transcript))) return null;

  const parsed = attempts.filter(
      (candidate): candidate is RankedSpeechAnswer<T> & { index: number } =>
        candidate.value !== null,
    );
  if (parsed.length === 0) return null;

  // A lower-ranked hypothesis may rescue a harmless primary transcription such
  // as "hello" for "low". Conflicting valid hypotheses are never guessed
  // because an endpoint error could change a rating from 0 to 100.
  if (new Set(parsed.map(({ value }) => value)).size !== 1) return null;
  return { transcript: parsed[0].transcript, value: parsed[0].value };
}

function endpointAliases(anchor: string, aliases: readonly string[] | undefined) {
  return new Set(
    [anchor, ...(aliases ?? [])]
      .map(normalise)
      .filter(Boolean),
  );
}

function exactEndpointCandidate(
  text: string,
  dimension: TlxDimension,
  allowedValues: readonly number[],
): number | null | undefined {
  const answer = text
    .replace(
      /^(?:(?:i\s+)?(?:choose|select|pick)|(?:my\s+)?answer(?:\s+is)?)\s+/,
      '',
    )
    .trim();
  const low = endpointAliases(dimension.lowAnchor, dimension.voiceLowAliases).has(answer);
  const high = endpointAliases(dimension.highAnchor, dimension.voiceHighAliases).has(answer);

  if (!low && !high) return undefined;
  if (low && high) return null;
  return low ? allowedValues[0] : allowedValues.at(-1) ?? null;
}

function exactDeclaredLabelCandidate(
  text: string,
  dimension: TlxDimension,
  allowedValues: readonly number[],
): number | null | undefined {
  if (!dimension.responseLabels) return undefined;
  const answer = text
    .replace(
      /^(?:(?:i\s+)?(?:choose|select|pick)|(?:my\s+)?answer(?:\s+is)?)\s+/,
      '',
    )
    .trim();
  const matches = allowedValues.filter(
    (value) => normalise(dimension.responseLabels?.[String(value)] ?? '') === answer,
  );
  if (matches.length === 0) return undefined;
  return matches.length === 1 ? matches[0] : null;
}

function exactNumericAnswerCandidate(text: string, allowedValues: readonly number[]) {
  const answer = text
    .replace(
      /^(?:(?:i\s+)?(?:choose|select|pick)|(?:my\s+)?answer(?:\s+is)?)\s+/,
      '',
    )
    .trim();
  const tokens = answer.split(' ').filter(Boolean);
  if (tokens.length === 0) return undefined;
  const containsOnlyNumberTokens = tokens.every((token) =>
    /^(?:100|[0-9]{1,2})$/.test(token) || numberWords.has(token));
  if (!containsOnlyNumberTokens) return undefined;
  const candidates = numericCandidates(answer, allowedValues);
  if (candidates.length !== 1 || candidates[0] === null) return null;
  return candidates[0];
}

function numericCandidates(text: string, allowedValues: readonly number[]) {
  const tokens = text.split(' ').filter(Boolean);
  const candidates: Array<number | null> = [];

  for (const token of tokens) {
    if (/^(?:100|[0-9]{1,2})$/.test(token)) {
      const value = Number(token);
      candidates.push(allowedValues.includes(value) ? value : null);
    }
  }

  for (let index = 0; index < tokens.length;) {
    if (!numberWords.has(tokens[index])) {
      index += 1;
      continue;
    }
    const sequence: string[] = [];
    while (index < tokens.length && numberWords.has(tokens[index])) {
      sequence.push(tokens[index]);
      index += 1;
    }
    const value =
      sequence.length === 1 && digitWords.has(sequence[0])
        ? Number(digitWords.get(sequence[0]))
        : spokenNumbers.get(sequence.join(' '));
    candidates.push(value !== undefined && allowedValues.includes(value) ? value : null);
  }

  return candidates;
}

function escapedAlternatives(aliases: readonly string[] | undefined) {
  return aliases
    ?.map((alias) => alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
}

function landmarkValue(
  landmarks: readonly RatingLandmark[],
  position: RatingLandmark['position'],
) {
  return landmarks.find((landmark) => landmark.position === position)?.value;
}

function anchorCandidate(
  text: string,
  dimension: TlxDimension,
  landmarks: readonly RatingLandmark[],
): number | null | undefined {
  const middle = /\b(middle|midpoint|centre|center)\b/.test(text);
  // The short endpoints are often returned as true homophones by a browser
  // recogniser. Accept only a small, explicit alias set and still require the
  // participant to confirm the labelled value before it becomes an answer.
  const lowAliases = escapedAlternatives(dimension.voiceLowAliases);
  const highAliases = escapedAlternatives(dimension.voiceHighAliases);
  if (!lowAliases || !highAliases || landmarks.length !== 5) return undefined;
  const lowWords = `(?:${lowAliases})`;
  const highWords = `(?:${highAliases})`;
  const closerLow = new RegExp(`\\bclose(?:r)?\\s+(?:to|too)\\s+${lowWords}\\b`).test(text);
  const closerHigh = new RegExp(`\\bclose(?:r)?\\s+(?:to|too)\\s+${highWords}\\b`).test(text);
  // Some mobile Web Speech implementations return the exact harmless
  // homophone "hello" when the participant says the one-word endpoint "low".
  // Keep this rescue deliberately narrow: no fuzzy matching and no occurrence
  // inside a longer utterance. The proposed value still requires confirmation.
  const mobileLowHomophone =
    dimension.voiceLowAliases?.includes('low') === true &&
    text === 'hello';
  const low = new RegExp(`\\b${lowWords}\\b`).test(text) || mobileLowHomophone;
  const high = new RegExp(`\\b${highWords}\\b`).test(text);

  if (closerLow || closerHigh) {
    if ([middle, closerLow, closerHigh].filter(Boolean).length !== 1) return null;
    if ((closerLow && high) || (closerHigh && low)) return null;
    return closerLow
      ? landmarkValue(landmarks, 'closer-low') ?? null
      : landmarkValue(landmarks, 'closer-high') ?? null;
  }

  if (![middle, low, high].some(Boolean)) return undefined;
  if ([middle, low, high].filter(Boolean).length !== 1) return null;
  if (middle) return landmarkValue(landmarks, 'middle') ?? null;
  return low
    ? landmarkValue(landmarks, 'low') ?? null
    : landmarkValue(landmarks, 'high') ?? null;
}

export function parseRatingTranscript(
  transcript: string,
  dimension: TlxDimension,
  allowedValues: readonly number[] = nasaRatingValues,
  landmarks: readonly RatingLandmark[] = nasaSmileyLandmarks,
) {
  const text = normalise(transcript);
  if (!text) return null;

  // Agreement and semantic-differential questionnaires expose official endpoint
  // labels without inventing meanings for the intermediate response positions.
  // Accept an exact visible endpoint (or a deliberately configured alias), then
  // still require confirmation in the participant interface. This check must
  // precede the general negation guard because "Not interesting" is an official
  // UEQ-S endpoint rather than a negated instruction.
  const declaredLabel = exactDeclaredLabelCandidate(text, dimension, allowedValues);
  if (declaredLabel !== undefined) return declaredLabel;
  const endpoint = exactEndpointCandidate(text, dimension, allowedValues);
  if (endpoint !== undefined) return endpoint;
  if (unsafeMeaning.test(text)) return null;

  const anchor = anchorCandidate(text, dimension, landmarks);
  const exactNumeric = exactNumericAnswerCandidate(text, allowedValues);
  if (exactNumeric !== undefined) {
    if (exactNumeric === null || anchor === null) return null;
    if (anchor !== undefined && anchor !== exactNumeric) return null;
    return exactNumeric;
  }

  if (anchor === null) return null;
  if (anchor !== undefined) {
    // Keep the existing explicit landmark-plus-value route (for example,
    // "closer to high 75") while rejecting any inconsistent extra value.
    const candidates = numericCandidates(text, allowedValues);
    if (candidates.length === 0) return anchor;
    if (candidates.length !== 1 || candidates[0] === null || candidates[0] !== anchor) return null;
    return anchor;
  }

  // Never extract a number from arbitrary surrounding prose. Numeric answers
  // must be the complete utterance (optionally after choose/select/pick/answer
  // wording) or part of one of the explicit NASA-TLX landmark patterns above.
  return null;
}

export function parsePairTranscript(
  transcript: string,
  availableDimensions: readonly (DimensionId | TlxDimension)[],
) {
  const text = normalise(transcript);
  if (!text || unsafeMeaning.test(text)) return null;
  const matches = availableDimensions
    .map((dimension) => {
      const id = typeof dimension === 'string' ? dimension : dimension.id;
      const aliases =
        typeof dimension === 'string'
          ? dimensionAliases[id] ?? [id.replace(/[-_]/g, ' ')]
          : [dimension.name.toLowerCase(), id.replace(/[-_]/g, ' ')];
      return aliases.some((alias) => text === alias || text.includes(alias)) ? id : null;
    })
    .filter((id): id is string => Boolean(id));
  return matches.length === 1 ? matches[0] : null;
}

export function parseRatingAlternatives(
  transcripts: readonly string[],
  dimension: TlxDimension,
  allowedValues: readonly number[] = nasaRatingValues,
  landmarks: readonly RatingLandmark[] = nasaSmileyLandmarks,
) {
  return chooseConsistentAlternative(transcripts, (transcript) =>
    parseRatingTranscript(transcript, dimension, allowedValues, landmarks));
}

export function parsePairAlternatives(
  transcripts: readonly string[],
  availableDimensions: readonly (DimensionId | TlxDimension)[],
) {
  return chooseConsistentAlternative(transcripts, (transcript) =>
    parsePairTranscript(transcript, availableDimensions));
}
