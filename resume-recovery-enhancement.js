const RECOVERY_STYLE_ID = 'saved-session-recovery-enhancement-styles';
const RECOVERY_LIVE_ID = 'saved-session-recovery-live';

function installRecoveryStyles() {
  if (document.getElementById(RECOVERY_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = RECOVERY_STYLE_ID;
  style.textContent = `
    .saved-session.saved-session-enhanced {
      border: 4px solid #005ea5;
      border-left-width: 12px;
      background: #e8f3fb;
      box-shadow: 0 8px 26px rgb(20 38 56 / 16%);
    }

    .saved-session-enhanced h3 {
      display: flex;
      gap: 0.65rem;
      align-items: center;
      color: #003b68;
    }

    .saved-session-enhanced h3::before {
      content: '↩';
      display: inline-grid;
      width: 2rem;
      height: 2rem;
      flex: 0 0 2rem;
      place-items: center;
      border-radius: 50%;
      background: #005ea5;
      color: #fff;
      font-size: 1.25rem;
      line-height: 1;
    }

    .saved-session-audio-button {
      min-height: 3rem;
    }

    .recovery-visually-hidden {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    }
  `;
  document.head.append(style);
}

function ensureRecoveryLiveRegion() {
  let region = document.getElementById(RECOVERY_LIVE_ID);
  if (region) return region;

  region = document.createElement('p');
  region.id = RECOVERY_LIVE_ID;
  region.className = 'recovery-visually-hidden';
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', 'assertive');
  region.setAttribute('aria-atomic', 'true');
  document.body.append(region);
  return region;
}

function savedResponseCount(card) {
  const text = Array.from(card.querySelectorAll('p'))
    .map((paragraph) => paragraph.textContent?.trim() ?? '')
    .find((value) => /\d+\s+of\s+\d+\s+responses/i.test(value));

  const match = text?.match(/(\d+)\s+of\s+(\d+)\s+responses/i);
  return match ? { completed: Number(match[1]), total: Number(match[2]), text } : null;
}

function storedAudioGuidanceWasEnabled(expectedCompleted) {
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const session = JSON.parse(raw);
      if (session?.version !== 3 || session?.support?.audioGuidance !== true) continue;

      const completed = Object.keys(session.ratings ?? {}).length + Object.keys(session.pairResponses ?? {}).length;
      if (expectedCompleted === null || completed === expectedCompleted) return true;
    }
  } catch {
    return false;
  }
  return false;
}

function speakRecoveryNotice(message) {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return false;

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'en-GB';
  utterance.rate = 0.9;
  const voices = window.speechSynthesis.getVoices?.() ?? [];
  const preferredVoice = voices.find((voice) => voice.lang.toLowerCase() === 'en-gb')
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith('en'));
  if (preferredVoice) utterance.voice = preferredVoice;

  if (window.speechSynthesis.speaking || window.speechSynthesis.pending || window.speechSynthesis.paused) {
    window.speechSynthesis.cancel();
  }
  window.speechSynthesis.speak(utterance);
  return true;
}

function enhanceSavedSession(card) {
  if (card.dataset.recoveryEnhanced === 'true') return;
  card.dataset.recoveryEnhanced = 'true';
  card.classList.add('saved-session-enhanced');
  card.setAttribute('role', 'region');
  card.setAttribute('aria-labelledby', 'saved-session-heading');

  const heading = card.querySelector('#saved-session-heading');
  if (heading) heading.setAttribute('tabindex', '-1');

  const count = savedResponseCount(card);
  const countMessage = count?.text ?? 'Saved responses are available in this browser.';
  const message = `Saved questionnaire found. ${countMessage} Choose Resume saved questionnaire to continue, or Erase saved answers to start again.`;

  const buttonRow = card.querySelector('.button-row');
  if (buttonRow && !buttonRow.querySelector('.saved-session-audio-button')) {
    const audioButton = document.createElement('button');
    audioButton.type = 'button';
    audioButton.className = 'secondary-button saved-session-audio-button';
    audioButton.textContent = 'Hear saved-progress message';
    audioButton.addEventListener('click', () => {
      const played = speakRecoveryNotice(message);
      if (!played) {
        ensureRecoveryLiveRegion().textContent = 'Built-in audio is unavailable in this browser. The saved questionnaire notice remains visible on screen.';
      }
    });
    buttonRow.append(audioButton);
  }

  const liveRegion = ensureRecoveryLiveRegion();
  liveRegion.textContent = '';
  window.setTimeout(() => {
    liveRegion.textContent = message;
    heading?.focus({ preventScroll: false });

    if (storedAudioGuidanceWasEnabled(count?.completed ?? null)) {
      speakRecoveryNotice(message);
    }
  }, 100);
}

function scanForSavedSession() {
  document.querySelectorAll('.saved-session').forEach((card) => enhanceSavedSession(card));
}

installRecoveryStyles();
ensureRecoveryLiveRegion();
scanForSavedSession();

const observer = new MutationObserver(scanForSavedSession);
observer.observe(document.documentElement, { childList: true, subtree: true });
