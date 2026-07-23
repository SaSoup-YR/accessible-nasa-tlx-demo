import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';

const standalonePath = new URL('../demo/accessible-nasa-tlx-v0.7.html', import.meta.url);

describe('self-contained Version 0.7 participant demonstration', () => {
  it('contains one document and a syntactically valid inline application bundle', () => {
    const html = readFileSync(standalonePath, 'utf8');
    const script = html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];

    expect(html.match(/<!doctype html>/gi)).toHaveLength(1);
    expect(html.match(/<accessible-nasa-tlx><\/accessible-nasa-tlx>/g)).toHaveLength(1);
    expect(html).not.toContain('./assets/');
    expect(script).toBeTruthy();
    expect(script).not.toContain('<!doctype html>');
    expect(() => new Function(script!)).not.toThrow();
  });

  it('boots the compiled component and renders the participant introduction', async () => {
    const html = readFileSync(standalonePath, 'utf8').replace('<script type="module">', '<script>');
    const dom = new JSDOM(html, {
      runScripts: 'dangerously',
      url: 'file:///accessible-nasa-tlx-v0.7.html',
    });

    await new Promise((resolve) => dom.window.setTimeout(resolve, 20));

    expect(dom.window.customElements.get('accessible-nasa-tlx')).toBeTruthy();
    expect(dom.window.document.querySelector('h1')?.textContent).toBe('NASA Task Load Index');
    expect(
      [...dom.window.document.querySelectorAll('button')].some((button) =>
        button.textContent?.includes('Start the six ratings'),
      ),
    ).toBe(true);

    dom.window.document.querySelector('accessible-nasa-tlx')?.remove();
    await new Promise((resolve) => dom.window.setTimeout(resolve, 0));
    dom.window.close();
  });
});
