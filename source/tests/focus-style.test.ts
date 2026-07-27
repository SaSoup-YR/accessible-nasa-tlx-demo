import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function relativeLuminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) => channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4);
  return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
}

function contrastRatio(first: string, second: string) {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

describe('visible keyboard focus', () => {
  it('uses a dark outline with at least 3:1 contrast on every light answer surface', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');
    expect(css).toContain('--focus-outline: #0b0c0c');
    expect(css).toContain('--focus-halo: #ffdd00');
    expect(css.match(/outline: 3px solid var\(--focus-outline\)/g)).toHaveLength(4);
    expect(css.match(/box-shadow: 0 0 0 6px var\(--focus-halo\)/g)).toHaveLength(3);
    expect(css).toContain('box-shadow: 0 0 0 7px var(--focus-halo)');

    for (const surface of ['#ffffff', '#eef2f6', '#e8f3fb', '#fff9dc']) {
      expect(contrastRatio('#0b0c0c', surface)).toBeGreaterThanOrEqual(3);
    }
  });

  it('keeps selected controls distinguishable without relying on blue or colour alone', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf8');
    const component = readFileSync(resolve(process.cwd(), 'src/accessible-nasa-tlx.ts'), 'utf8');

    expect(css).toContain('--selected-border: #6b5200');
    expect(css).toContain('--selected-background: #fff3b0');
    expect(css).toContain('--gaze-indicator: #725b00');
    expect(css).toContain('border-color: var(--selected-border)');
    expect(css).toContain('background: var(--selected-background)');
    expect(css).toContain('.selected-marker');
    expect(component.match(/class="selected-marker/g)?.length).toBeGreaterThanOrEqual(4);

    expect(contrastRatio('#6b5200', '#fff3b0')).toBeGreaterThanOrEqual(3);
    expect(contrastRatio('#6b5200', '#ffffff')).toBeGreaterThanOrEqual(3);
    expect(contrastRatio('#0b0c0c', '#fff3b0')).toBeGreaterThanOrEqual(3);
    expect(contrastRatio('#725b00', '#ffffff')).toBeGreaterThanOrEqual(3);
    expect(contrastRatio('#725b00', '#f6f8fa')).toBeGreaterThanOrEqual(3);
  });
});
