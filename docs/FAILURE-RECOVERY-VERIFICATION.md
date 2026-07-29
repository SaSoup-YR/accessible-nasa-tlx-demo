# Failure and recovery verification

Prototype: Accessible NASA-TLX Version 0.7 release candidate

> Historical baseline evidence. The failure model remains relevant, but Version
> 0.8 uses Version 4 records and generic `AQP_*` Qualtrics fields. Use
> `QUALTRICS-INTEGRATION.md` and `TESTING.md` for the active procedure.

## Purpose and claim boundary

These checks test whether foreseeable failures remain detectable and recoverable. They
do not prove that Qualtrics has stored a response, that the interface is accessible to
a disability group, or that participant data are safe to collect. A recorded
Qualtrics row must be verified in Data & Analysis. Participant recruitment remains
blocked until the frozen release, study protocol and ethics/data route are approved.

The submission states are deliberately separated:

1. **Prepared locally** — a complete record exists in browser storage or remains
   available in memory for JSON/CSV export.
2. **Acknowledged by the parent** — Qualtrics has staged Embedded Data in its current
   browser session.
3. **Recorded remotely** — Qualtrics has submitted the page and a response row can be
   inspected and exported.

Only the third state supports a claim of central collection. The 0.8-second handoff is
a short technical interval, not participant reading time. Reading and final
confirmation belong on the persistent Qualtrics final page, whether it uses the
default message or the optional generated wording.

## Adverse-path matrix

| Case | Action with synthetic data | Required observable outcome | Automated evidence | Manual evidence still required |
| --- | --- | --- | --- | --- |
| Close after acknowledgement | Close the result page immediately, reopen the same configured link on the same device and enter the same code | A completed backup is discoverable and downloadable; wording states that it does not prove remote recording | Component test verifies backup creation before host submission and post-close discovery | Check separately whether a Qualtrics row exists |
| Network interruption | Disconnect immediately before Calculate and submit | The page may stage the record locally, but it must not describe it as remotely recorded. A definite browser-offline state takes the fast recovery path after the 0.8-second handoff; an unreachable server while the browser reports online uses the six-second watchdog. Both routes state that remote recording is unconfirmed and retain backup, reconnection and restored-Next instructions | Definite-offline and failed-advance bridge tests | Real UCL Qualtrics/browser run and exported row check |
| Mid-questionnaire reload | Enable recovery, answer at least one item and reload the same tab | The pseudonymous code is restored for that tab; focus moves to the saved-session region; its accessible description and delayed live-region update use the exact count plus `Resume saved questionnaire` and `Erase saved answers`; prior-opt-in built-in speech attempts the same message; an explicit replay remains available | Full localStorage reload/recreation, focus, exact-message, live-region and speech-route tests | iOS automatic-speech policy, external screen-reader announcement and browser-specific storage behaviour |
| Storage blocked or full | Block site storage or simulate quota exhaustion before submission | No crash or false local-save claim; in-memory JSON/CSV remain available; any existing progress copy is not deliberately cleared | Storage unit and component tests | Browser privacy mode and quota test |
| Parent staging failure | Send an invalid or oversized synthetic record | Qualtrics navigation is restored and an error receipt is returned | Executed bridge test | Qualtrics editor and survey-theme interaction |
| Native advance does not unload | In a copied synthetic survey, block or intercept the automatic native advance | After the bounded watchdog, a visible status explains that the recorded-result page did not open; native Next and in-frame JSON/CSV remain available | Executed bridge watchdog test | Safe fault injection in a non-recruitment UCL survey |
| Missing iframe | Remove the generated iframe or paste the static template incorrectly | A visible setup error is shown and native navigation is not hidden | Executed bridge test | UCL editor and theme interaction |
| Return after failed save | After host failure, return and edit an answer | The stale completed backup is removed; a retry must be recalculated from the edited answer | Component and storage tests | End-to-end exported-row comparison |
| Negated speech | Say `not low` or `not good` | No proposal and no selected answer | Parser and component tests | Browser recognition accuracy with microphone |
| Ambiguous speech | Say `low or high`, two factor names, `twenty three` or `73` | No proposal and no selected answer | Parser and component tests | Browser recognition transcript and screen-reader feedback |
| Intermediate landmark speech | Say `close to low`, `closer to low`, `closer to high` and repeat with Performance's Good/Poor anchors | The proposals match the visible values 25 or 75; they are not converted to 0 or 100 | Parser and component tests | Browser recognition accuracy with microphone |
| Ranked speech alternatives | Supply a harmless invalid primary hypothesis followed by one consistent valid hypothesis; then repeat with conflicting endpoint hypotheses | The consistent lower-ranked answer becomes a proposal; conflicting or negated results are rejected | Parser and component tests | Whether each target browser actually returns useful alternatives |
| Valid speech | Say `seventy`, `seven zero` or a valid factor name | Exact proposed answer is announced; the named confirmation control receives focus; nothing is selected before confirmation | Parser and component tests | NVDA/VoiceOver run |
| Automatic built-in audio feedback | Enable automatic audio, use Smiley mode and trigger simpler help, a voice proposal, a missing answer, recovery and completion | Labels and values, proposal, error, saved position and next action are spoken. A successful automatic Qualtrics transition adds no built-in speech. Failed advancement triggers one concise corrective spoken message | Component speech-synthesis and parent-failure message tests | Real device volume, voice availability and interruption on Qualtrics navigation |

## Reproducible manual fault injection

Use only synthetic codes in an unpublished duplicate survey. Restore the production
bridge after each test and rerun the synthetic preflight before publishing.

### A. Local completed-backup test

1. Generate a configuration with local collection and interruption recovery enabled.
2. Open the generated link, enter `TEST-BACKUP-01`, complete and submit.
3. Confirm that JSON and CSV controls remain available and that the page reports a
   local completed record.
4. Reload the same tab. Confirm that the code is filled automatically, the completed
   backup offer receives focus and the recovered JSON can be downloaded.
5. Compare its `submissionId`, 21 answers and score with the first export.

This proves only same-browser backup behaviour. It does not prove remote collection.

### B. Blocked or full browser-storage test

In a browser developer console attached to the participant iframe, temporarily run:

```javascript
window.__originalStorageSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function blockedSetItem() {
  throw new DOMException('Synthetic quota failure', 'QuotaExceededError');
};
```

Complete a synthetic questionnaire. The page must not claim that a local copy was
saved, must retain in-memory JSON/CSV controls and must not crash. Restore the browser
before any other test:

```javascript
Storage.prototype.setItem = window.__originalStorageSetItem;
delete window.__originalStorageSetItem;
```

Reloading while storage is deliberately blocked may lose local recovery. That is the
failure being tested, not a route for participant use.

### C. Qualtrics staging-failure and restored-navigation test

1. Duplicate the unpublished Qualtrics survey.
2. In only that duplicate's question JavaScript, temporarily set
   `maximumRawChunks` to `0`.
3. Complete `TEST-STAGE-FAIL-01`.
4. The parent bridge must reject the record, return an error receipt, keep the
   questionnaire on Review, display retry and backup routes, and call
   `showNextButton()` so the native Qualtrics route is not a dead end.
5. Restore `maximumRawChunks` to the repository value before the next test.

### D. Native-advance watchdog test

1. In an unpublished duplicate survey only, temporarily replace
   `question.clickNextButton()` with a no-op comment.
2. Complete `TEST-ADVANCE-FAIL-01`.
3. After the watchdog interval, confirm that the parent status states that Qualtrics
   could not confirm the response and that native Next is visible.
4. Confirm that the participant iframe displays and, when automatic audio was
   enabled, speaks the concise reconnect, backup and retry instruction.
5. Confirm that the in-frame JSON and CSV backup routes remain available.
6. Restore the exact repository bridge and pass the synthetic preflight again.

These deliberate failures are unsuitable for a live recruitment survey. Record the
bridge hash, browser, expected result, observed result and screenshot for each run.

## Why these behaviours were selected

- A host acknowledgement is weaker than durable remote storage. The interface must
  not erase its only recoverable copy at that point.
- Error recovery must preserve more than answers. It must expose a route to retry,
  edit or export without requiring the participant to search the page.
- Speech recognition is probabilistic. Rejecting an uncertain answer has a lower
  research-integrity cost than converting negation or an illegal value into a valid
  NASA-TLX score.
- Multiple recognition hypotheses improve recovery only when they agree. They do not
  justify fuzzy endpoint matching or a claim of browser-independent accuracy.
- A focus indicator must be visible on adjacent surfaces. The implementation uses a
  dark 3-pixel outline with contrast above 3:1 on tested light surfaces and retains a
  yellow outer halo for salience.
- Local storage is a recovery aid, not the research database. Its failure is reported
  honestly and does not remove the in-memory export route.
- When recovery is enabled, the valid pseudonymous code is also held in
  `sessionStorage` for the current tab's page session. This removes unnecessary code
  re-entry after a reload while avoiding a long-term cross-tab identifier. The
  participant still chooses whether to resume or erase the saved answers.

## Evidence record for the dissertation

For every manual run, record:

- frozen Git commit and deployed GitHub Pages commit;
- UCL Qualtrics survey version and synthetic participant code;
- browser, operating system, device and assistive technology;
- test precondition, action, expected result and observed result;
- Pass, Partial, Fail or Not supported;
- screenshot or exported synthetic record where appropriate;
- whether the issue concerns software correctness, workflow usability, assistive
  technology interoperability or participant accessibility.

Do not convert a passing technical check into a claim that the questionnaire is more
accessible. That requires an approved evaluation design and relevant participants.
