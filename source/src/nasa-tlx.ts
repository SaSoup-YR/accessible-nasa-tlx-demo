import {
  DEFAULT_QUESTIONNAIRE_ID,
  buildQuestionnairePairs,
  buildRatingValues,
  getQuestionnaireDefinition,
  type ItemId,
  type QuestionnaireItem,
  type QuestionnairePair,
  type RatingLandmark,
} from './questionnaire-definition';

/**
 * Compatibility exports for the NASA-TLX-specific tests and integrations.
 * The content itself now has one source of truth: the versioned JSON definition.
 */
export type DimensionId = ItemId;
export type TlxDimension = QuestionnaireItem;
export type TlxPair = QuestionnairePair;
export type SmileyLandmark = RatingLandmark;

export const nasaTlxDefinition = getQuestionnaireDefinition(DEFAULT_QUESTIONNAIRE_ID)!;
export const dimensions = nasaTlxDefinition.items;
export const dimensionById = new Map(dimensions.map((item) => [item.id, item]));
export const pairs = buildQuestionnairePairs(nasaTlxDefinition);
export const ratingValues = buildRatingValues(nasaTlxDefinition);
export const smileyLandmarks = nasaTlxDefinition.landmarks ?? [];
