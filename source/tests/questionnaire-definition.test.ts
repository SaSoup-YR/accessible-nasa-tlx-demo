import { describe, expect, it } from 'vitest';
import {
  builtInQuestionnaires,
  buildQuestionnairePairs,
  buildRatingValues,
  validateQuestionnaireDefinition,
} from '../src/questionnaire-definition';
import { scoreQuestionnaire, type Ratings } from '../src/scoring';

describe('declarative questionnaire definitions', () => {
  it('validates two structurally different built-in instruments', () => {
    expect(builtInQuestionnaires.map(({ id }) => id)).toEqual([
      'nasa-tlx-weighted',
      'system-usability-scale',
    ]);
    const [tlx, sus] = builtInQuestionnaires;
    expect(buildRatingValues(tlx)).toHaveLength(21);
    expect(buildQuestionnairePairs(tlx)).toHaveLength(15);
    expect(buildRatingValues(sus)).toEqual([1, 2, 3, 4, 5]);
    expect(buildQuestionnairePairs(sus)).toEqual([]);
  });

  it('rejects executable or scorer-incompatible definitions', () => {
    const base = structuredClone(builtInQuestionnaires[1]) as any;
    base.scoreFunction = 'return 100';
    expect(() => validateQuestionnaireDefinition(base)).toThrow(/unsupported field/i);

    const incompatible = structuredClone(builtInQuestionnaires[1]) as any;
    incompatible.scoring.strategy = 'nasa-tlx-weighted-v1';
    expect(() => validateQuestionnaireDefinition(incompatible)).toThrow(/NASA-TLX scorer requires/i);
  });

  it('calculates the published alternating SUS rule through the scorer allowlist', () => {
    const sus = builtInQuestionnaires[1];
    const ratings = Object.fromEntries(
      sus.items.map((item, index) => [item.id, index % 2 === 0 ? 5 : 1]),
    ) as Ratings;
    const result = scoreQuestionnaire(sus, ratings);
    expect(result.strategy).toBe('sus-standard-v1');
    expect(result.primaryScore).toBe(100);
    expect(result.scoreName).toBe('SUS score');
    expect(result.details.kind).toBe('sus-contributions');
  });
});
