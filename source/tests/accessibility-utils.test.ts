// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { focusAndReveal } from '../src/accessibility-utils';

afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('programmatic error focus', () => {
  it('reveals immediately, after responsive layout and after the mobile viewport retry', async () => {
    vi.useFakeTimers();
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    const target = document.createElement('div');
    target.tabIndex = -1;
    const scrollIntoView = vi.fn();
    Object.defineProperty(target, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    document.body.append(target);

    focusAndReveal(target);

    expect(document.activeElement).toBe(target);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    frames.shift()!(0);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    frames.shift()!(16);
    expect(scrollIntoView).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(160);
    expect(scrollIntoView).toHaveBeenCalledTimes(3);
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'center',
      inline: 'nearest',
    });
  });

  it('falls back to a visual-viewport coordinate when the target remains outside it', () => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', vi.fn());
    const target = document.createElement('div');
    target.tabIndex = -1;
    Object.defineProperty(target, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    });
    Object.defineProperty(target, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        x: 0,
        y: 1200,
        top: 1200,
        right: 300,
        bottom: 1300,
        left: 0,
        width: 300,
        height: 100,
        toJSON: () => ({}),
      }),
    });
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    document.body.append(target);

    focusAndReveal(target);

    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({
      top: expect.any(Number),
      behavior: 'auto',
    }));
    expect(scrollTo.mock.calls[0][0]).toEqual(expect.objectContaining({ top: expect.any(Number) }));
    expect((scrollTo.mock.calls[0][0] as ScrollToOptions).top).toBeGreaterThan(0);
  });

  it('forces a deterministic coordinate scroll for a newly rendered mobile error', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', vi.fn());
    const target = document.createElement('div');
    target.tabIndex = -1;
    Object.defineProperty(target, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(),
    });
    Object.defineProperty(target, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        x: 0,
        y: 900,
        top: 900,
        right: 320,
        bottom: 1000,
        left: 0,
        width: 320,
        height: 100,
        toJSON: () => ({}),
      }),
    });
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    document.body.append(target);

    focusAndReveal(target, {
      block: 'start',
      forceCoordinateScroll: true,
    });

    expect(document.activeElement).toBe(target);
    expect(scrollTo).toHaveBeenCalledWith({
      top: 900,
      left: 0,
      behavior: 'auto',
    });

    await vi.advanceTimersByTimeAsync(160);
    expect(scrollTo).toHaveBeenCalledTimes(2);
  });
});
