import { ratingValues, type DimensionId, type TlxDimension } from './nasa-tlx';

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

for (const value of ratingValues) {
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

const unsafeMeaning =
  /\b(?:not|no|cancel|neither|except|without|instead|rather|unsure|uncertain|mistake|wrong)\b/;

const dimensionAliases: Record<DimensionId, readonly string[]> = {
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

function numericCandidates(text: string) {
  const tokens = text.split(' ').filter(Boolean);
  const candidates: Array<number | null> = [];

  for (const token of tokens) {
    if (/^(?:100|[0-9]{1,2})$/.test(token)) {
      const value = Number(token);
      candidates.push(ratingValues.includes(value) ? value : null);
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
    candidates.push(spokenNumbers.get(sequence.join(' ')) ?? null);
  }

  return candidates;
}

export function parseRatingTranscript(transcript: string, dimension: TlxDimension) {
  const text = normalise(transcript);
  if (!text || unsafeMeaning.test(text)) return null;

  const candidates = numericCandidates(text);
  if (candidates.length > 0) {
    return candidates.length === 1 && candidates[0] !== null ? candidates[0] : null;
  }

  const middle = /\b(middle|midpoint|centre|center)\b/.test(text);
  if (dimension.id === 'performance') {
    const good = /\b(good|successful)\b/.test(text);
    const poor = /\b(poor|bad|unsuccessful)\b/.test(text);
    if ([middle, good, poor].filter(Boolean).length !== 1) return null;
    if (middle) return 50;
    return good ? 0 : 100;
  } else {
    const low = /\blow\b/.test(text);
    const high = /\bhigh\b/.test(text);
    if ([middle, low, high].filter(Boolean).length !== 1) return null;
    if (middle) return 50;
    return low ? 0 : 100;
  }
}

export function parsePairTranscript(
  transcript: string,
  availableDimensions: readonly DimensionId[],
) {
  const text = normalise(transcript);
  if (!text || unsafeMeaning.test(text)) return null;
  const matches = availableDimensions.filter((dimension) =>
    dimensionAliases[dimension].some((alias) => text === alias || text.includes(alias)),
  );
  return matches.length === 1 ? matches[0] : null;
}
