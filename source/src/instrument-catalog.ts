import nasaTlxCandidate from '../instruments/nasa-tlx.json';
import susScoringCandidate from '../instruments/sus-scoring-profile.json';
import { assertInstrumentDefinition } from './instrument-definition';

export const nasaTlxDefinition = assertInstrumentDefinition(nasaTlxCandidate);
export const susScoringProfile = assertInstrumentDefinition(susScoringCandidate);

export const builtInInstrumentDefinitions = new Map([
  [nasaTlxDefinition.id, nasaTlxDefinition],
  [susScoringProfile.id, susScoringProfile],
]);
