import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repositoryRoot = resolve(import.meta.dirname, '../..');
const sourceRoot = resolve(repositoryRoot, 'source');
const participantSource = resolve(sourceRoot, 'src/accessible-nasa-tlx.ts');
const triggerWorkflow = resolve(repositoryRoot, '.github/workflows/apply-integrated-recovery-audio.yml');
const thisScript = resolve(sourceRoot, 'scripts/apply-integrated-recovery-audio.mjs');

function run(command, args, cwd = repositoryRoot) {
  execFileSync(command, args, { cwd, stdio: 'inherit' });
}

function replaceExactlyOnce(text, oldText, newText, label) {
  const first = text.indexOf(oldText);
  if (first < 0 || text.indexOf(oldText, first + oldText.length) >= 0) {
    throw new Error(`Expected exactly one ${label} block.`);
  }
  return text.replace(oldText, newText);
}

let source = readFileSync(participantSource, 'utf8');

source = replaceExactlyOnce(
  source,
  `        void this.updateComplete.then(() => {
          const heading = this.querySelector<HTMLElement>(
            this.savedSession ? '#saved-session-heading' : '#completed-backup-heading',
          );
          heading?.focus();
          heading?.scrollIntoView?.({ block: 'start' });
        });`,
  `        void this.updateComplete.then(() => {
          const heading = this.querySelector<HTMLElement>(
            this.savedSession ? '#saved-session-heading' : '#completed-backup-heading',
          );
          heading?.focus();
          heading?.scrollIntoView?.({ block: 'start' });
          if (this.savedSession) {
            this.announceAutomatic(this.savedSessionOfferSpeech(this.savedSession));
          }
        });`,
  'connected recovery',
);

source = replaceExactlyOnce(
  source,
  `  private renderSavedSessionOffer() {`,
  `  private savedSessionOfferSpeech(session: SavedSession) {
    const count = Object.keys(session.ratings).length + Object.keys(session.pairResponses).length;
    return \`Saved questionnaire found. \${count} of \${dimensions.length + pairs.length} responses are saved in this browser. Select Resume saved questionnaire to continue, or Erase saved answers to remove the saved copy.\`;
  }

  private renderSavedSessionOffer() {`,
  'saved-session render marker',
);

source = replaceExactlyOnce(
  source,
  `      const session = JSON.parse(raw) as SavedSession;
      if (this.validSavedSession(session)) this.savedSession = session;
      else this.clearSavedProgress();`,
  `      const session = JSON.parse(raw) as SavedSession;
      if (this.validSavedSession(session)) {
        this.savedSession = session;
        this.applySavedRecoveryPresentation(session);
      } else {
        this.clearSavedProgress();
      }`,
  'saved-session loading',
);

source = replaceExactlyOnce(
  source,
  `  private findSavedSession() {`,
  `  private applySavedRecoveryPresentation(session: SavedSession) {
    if (!this.canAdjustPresentationSupport) return;
    this.largeText = session.support.largeText;
    this.audioGuidance = Boolean(session.support.audioGuidance);
  }

  private findSavedSession() {`,
  'findSavedSession marker',
);

writeFileSync(participantSource, source, 'utf8');

run('npm', ['ci'], sourceRoot);
run('npm', ['test'], sourceRoot);
run('npm', ['run', 'build:release'], sourceRoot);

const separateEnhancement = resolve(repositoryRoot, 'resume-recovery-enhancement.js');
if (existsSync(separateEnhancement)) rmSync(separateEnhancement);

const indexHtml = readFileSync(resolve(repositoryRoot, 'index.html'), 'utf8');
if (indexHtml.includes('resume-recovery-enhancement.js')) {
  throw new Error('The release still loads the separate recovery enhancement.');
}
const assetMatch = indexHtml.match(/\.\/assets\/([^"']*participant[^"']*\.js)/);
if (!assetMatch) throw new Error('The generated participant asset could not be resolved.');
const participantAsset = readFileSync(resolve(repositoryRoot, 'assets', assetMatch[1]), 'utf8');
if (!participantAsset.includes('Saved questionnaire found.')) {
  throw new Error('The generated participant asset does not include the recovery announcement.');
}
if (!participantAsset.includes('remove the saved copy')) {
  throw new Error('The generated participant asset does not include both recovery choices.');
}
if (!source.includes('this.announceAutomatic(this.savedSessionOfferSpeech(this.savedSession))')) {
  throw new Error('The source does not use the existing automatic speech pathway.');
}
if (!source.includes('this.applySavedRecoveryPresentation(session)')) {
  throw new Error('Saved audio and text preferences are not restored before the recovery offer.');
}

if (existsSync(triggerWorkflow)) rmSync(triggerWorkflow);
if (existsSync(thisScript)) rmSync(thisScript);

run('git', ['config', 'user.name', 'github-actions[bot]']);
run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run('git', ['add', '-A']);
run('git', ['diff', '--cached', '--check']);
run('git', ['commit', '-m', 'Integrate saved-session recovery announcement']);
run('git', ['push', 'origin', 'HEAD:main']);
