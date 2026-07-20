import { describe, expect, it } from 'vitest';
import { DwellTracker, isSecureGazeContext } from '../src/webgazer-adapter';

describe('WebGazer adapter boundaries', () => {
  it('requires HTTPS or a local development host', () => {
    expect(isSecureGazeContext({ protocol: 'https:', hostname: 'example.org' } as Location)).toBe(true);
    expect(isSecureGazeContext({ protocol: 'http:', hostname: 'localhost' } as Location)).toBe(true);
    expect(isSecureGazeContext({ protocol: 'file:', hostname: '' } as Location)).toBe(false);
    expect(isSecureGazeContext({ protocol: 'http:', hostname: 'example.org' } as Location)).toBe(false);
  });

  it('activates only after an uninterrupted dwell on the same target', () => {
    const tracker = new DwellTracker(1000);
    expect(tracker.update('answer-1', 0)).toEqual({ progress: 0, activated: false });
    expect(tracker.update('answer-1', 500)).toEqual({ progress: 0.5, activated: false });
    expect(tracker.update('answer-2', 600)).toEqual({ progress: 0, activated: false });
    expect(tracker.update('answer-2', 1600)).toEqual({ progress: 1, activated: true });
  });

  it('resets dwell progress when gaze leaves a target', () => {
    const tracker = new DwellTracker(800);
    tracker.update('next', 100);
    expect(tracker.update(null, 400)).toEqual({ progress: 0, activated: false });
    expect(tracker.update('next', 700)).toEqual({ progress: 0, activated: false });
  });
});

