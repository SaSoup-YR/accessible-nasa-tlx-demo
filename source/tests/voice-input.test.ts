import { describe, expect, it } from 'vitest';
import { dimensions } from '../src/nasa-tlx';
import { parsePairTranscript, parseRatingTranscript } from '../src/voice-input';

describe('voice-answer parsing', () => {
  it('accepts only valid NASA-TLX rating increments', () => {
    expect(parseRatingTranscript('fifty five', dimensions[0])).toBe(55);
    expect(parseRatingTranscript('I choose 70', dimensions[0])).toBe(70);
    expect(parseRatingTranscript('seven zero', dimensions[0])).toBe(70);
    expect(parseRatingTranscript('one zero zero', dimensions[0])).toBe(100);
    expect(parseRatingTranscript('I choose 73', dimensions[0])).toBeNull();
    expect(parseRatingTranscript('twenty three', dimensions[0])).toBeNull();
  });

  it('rejects negated or ambiguous anchors instead of guessing', () => {
    expect(parseRatingTranscript('not low', dimensions[0])).toBeNull();
    expect(parseRatingTranscript('low or high', dimensions[0])).toBeNull();
    expect(parseRatingTranscript('fifty or sixty', dimensions[0])).toBeNull();
  });

  it('respects the reversed Performance anchors without accepting a negation', () => {
    const performance = dimensions.find((dimension) => dimension.id === 'performance')!;
    expect(parseRatingTranscript('good', performance)).toBe(0);
    expect(parseRatingTranscript('poor', performance)).toBe(100);
    expect(parseRatingTranscript('not good', performance)).toBeNull();
  });

  it('accepts one visible factor name and rejects ambiguous comparison speech', () => {
    expect(parsePairTranscript('Mental Demand', ['mental', 'physical'])).toBe('mental');
    expect(parsePairTranscript('mental or physical', ['mental', 'physical'])).toBeNull();
    expect(parsePairTranscript('not physical demand', ['mental', 'physical'])).toBeNull();
    expect(parsePairTranscript('frustration', ['mental', 'physical'])).toBeNull();
  });
});
