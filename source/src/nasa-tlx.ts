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

export const dimensions: readonly TlxDimension[] = [
  {
    id: 'mental',
    name: 'Mental Demand',
    lowAnchor: 'Low',
    highAnchor: 'High',
    officialDefinition:
      'How much mental and perceptual activity was required (for example, thinking, deciding, calculating, remembering, looking or searching)? Was the task easy or demanding, simple or complex, exacting or forgiving?',
    simpleExplanation:
      'Think about how much concentration, remembering, deciding, calculating or noticing the task required.',
    shortMeaning: 'Thinking, deciding, remembering or concentrating.',
  },
  {
    id: 'physical',
    name: 'Physical Demand',
    lowAnchor: 'Low',
    highAnchor: 'High',
    officialDefinition:
      'How much physical activity was required (for example, pushing, pulling, turning, controlling or activating)? Was the task easy or demanding, slow or brisk, slack or strenuous, restful or laborious?',
    simpleExplanation:
      'Think about how much physical movement, control or force the task required.',
    shortMeaning: 'Movement, control or physical force.',
  },
  {
    id: 'temporal',
    name: 'Temporal Demand',
    lowAnchor: 'Low',
    highAnchor: 'High',
    officialDefinition:
      'How much time pressure did you feel due to the rate or pace at which the task or task elements occurred? Was the pace slow and leisurely or rapid and frantic?',
    simpleExplanation:
      'Think about pressure caused by the pace or speed of the task. This is about feeling rushed, not simply how long the task lasted.',
    shortMeaning: 'Time pressure caused by the pace of the task.',
  },
  {
    id: 'performance',
    name: 'Performance',
    lowAnchor: 'Good',
    highAnchor: 'Poor',
    officialDefinition:
      'How successful do you think you were in accomplishing the goals of the task set by the experimenter or yourself? How satisfied were you with your performance in accomplishing these goals?',
    simpleExplanation:
      'Think about how successfully you completed the task and how satisfied you were with the result. On this scale, Good is on the left and Poor is on the right.',
    shortMeaning: 'How successful and satisfied you were with your result.',
  },
  {
    id: 'effort',
    name: 'Effort',
    lowAnchor: 'Low',
    highAnchor: 'High',
    officialDefinition:
      'How hard did you have to work mentally and physically to accomplish your level of performance?',
    simpleExplanation:
      'Think about how hard you had to work, mentally and physically, to achieve your result. This is the work you put in, rather than the demands of the task itself.',
    shortMeaning: 'How hard you had to work to achieve your result.',
  },
  {
    id: 'frustration',
    name: 'Frustration',
    lowAnchor: 'Low',
    highAnchor: 'High',
    officialDefinition:
      'How insecure, discouraged, irritated, stressed and annoyed versus secure, gratified, content, relaxed and complacent did you feel during the task?',
    simpleExplanation:
      'Think about how stressed, irritated or discouraged you felt, compared with feeling secure, content and relaxed.',
    shortMeaning: 'Feeling stressed, irritated or discouraged.',
  },
] as const;

export const dimensionById = new Map<DimensionId, TlxDimension>(
  dimensions.map((dimension) => [dimension.id, dimension]),
);

export interface TlxPair {
  id: string;
  left: DimensionId;
  right: DimensionId;
}

export const pairs: readonly TlxPair[] = dimensions.flatMap((left, leftIndex) =>
  dimensions.slice(leftIndex + 1).map((right) => ({
    id: `${left.id}-${right.id}`,
    left: left.id,
    right: right.id,
  })),
);

export const ratingValues = Array.from({ length: 21 }, (_, index) => index * 5);

export interface SmileyLandmark {
  value: 0 | 25 | 50 | 75 | 100;
  cue: string;
}

export const smileyLandmarks: readonly SmileyLandmark[] = [
  { value: 0, cue: '😀' },
  { value: 25, cue: '🙂' },
  { value: 50, cue: '😐' },
  { value: 75, cue: '🙁' },
  { value: 100, cue: '☹️' },
] as const;

