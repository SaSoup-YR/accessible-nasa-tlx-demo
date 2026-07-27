import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(sourceRoot, '..');
const distRoot = resolve(sourceRoot, 'dist');
const releaseAssets = resolve(repositoryRoot, 'assets');

copyFileSync(resolve(distRoot, 'index.html'), resolve(repositoryRoot, 'index.html'));
copyFileSync(resolve(distRoot, 'study.html'), resolve(repositoryRoot, 'study.html'));
mkdirSync(releaseAssets, { recursive: true });

const entryHtml = [
  readFileSync(resolve(distRoot, 'index.html'), 'utf8'),
  readFileSync(resolve(distRoot, 'study.html'), 'utf8'),
].join('\n');
const referencedAssets = new Set(
  [...entryHtml.matchAll(/\.\/assets\/([^"']+\.(?:js|css))/g)].map((match) => match[1]),
);

for (const asset of referencedAssets) {
  copyFileSync(resolve(distRoot, 'assets', asset), resolve(releaseAssets, basename(asset)));
}

for (const asset of readdirSync(releaseAssets)) {
  if (!/^[A-Za-z0-9_-]+\.(?:js|css)$/.test(asset)) {
    throw new Error(`Refusing to manage unexpected release asset: ${asset}`);
  }
  if (!referencedAssets.has(asset)) rmSync(resolve(releaseAssets, asset));
}

console.log(
  `Synchronized ${referencedAssets.size} production assets and both release entry points.`,
);
