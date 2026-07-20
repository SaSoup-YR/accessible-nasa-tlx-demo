import { ratingValues, type DimensionId, type TlxDimension } from './nasa-tlx';

const spokenNumbers = new Map<string, number>([
  ['zero', 0],
  ['five', 5],
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
  ['one hundred', 100],
  ['hundred', 100],
]);

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

export function parseRatingTranscript(transcript: string, dimension: TlxDimension) {
  const text = normalise(transcript);
  const digits = text.match(/(?:^|\s)(100|[0-9]{1,2})(?:\s|$)/);
  if (digits) {
    const value = Number(digits[1]);
    if (ratingValues.includes(value)) return value;
  }

  for (const [spoken, value] of [...spokenNumbers].sort((a, b) => b[0].length - a[0].length)) {
    if (text === spoken || text.includes(` ${spoken} `) || text.startsWith(`${spoken} `) || text.endsWith(` ${spoken}`)) {
      return value;
    }
  }

  if (/\b(middle|midpoint|centre|center)\b/.test(text)) return 50;
  if (dimension.id === 'performance') {
    if (/\b(good|successful)\b/.test(text)) return 0;
    if (/\b(poor|bad|unsuccessful)\b/.test(text)) return 100;
  } else {
    if (/\blow\b/.test(text)) return 0;
    if (/\bhigh\b/.test(text)) return 100;
  }
  return null;
}

export function parsePairTranscript(
  transcript: string,
  availableDimensions: readonly DimensionId[],
) {
  const text = normalise(transcript);
  const matches = availableDimensions.filter((dimension) =>
    dimensionAliases[dimension].some((alias) => text === alias || text.includes(alias)),
  );
  return matches.length === 1 ? matches[0] : null;
}

