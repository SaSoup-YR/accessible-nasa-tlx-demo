# Non-text contrast and use-of-colour audit

Prototype: Accessible NASA-TLX Version 0.7 release candidate

Audit date: 27 July 2026

## Criteria and claim boundary

WCAG 2.2 Success Criterion 1.4.11 requires visual information needed to identify
user-interface components and their states to have at least 3:1 contrast against
adjacent colours. Success Criterion 1.4.1 is a separate requirement: colour must not
be the only visual means of conveying information. It does not set a general 3:1
threshold, although a 3:1 luminance difference can be relevant to some colour-based
cues.

Sources:

- [W3C Understanding SC 1.4.11: Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
- [W3C Understanding SC 1.4.1: Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
- [W3C Understanding SC 2.4.13: Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)

This audit supports a code-level conformance claim for the authored questionnaire
states listed below. It does not certify browser-native radio rendering, user-agent
high-contrast modes, an external Qualtrics theme or every operating-system
combination. Those remain manual verification items.

## Authored indicators

| Information | Authored indicator | Adjacent surface | Calculated contrast |
| --- | --- | --- | ---: |
| Unselected control boundary | `#6f8092` | white `#ffffff` | 4.06:1 |
| Unselected control boundary | `#6f8092` | panel `#f6f8fa` | 3.81:1 |
| Persistent selected boundary | `#6b5200` | selected background `#fff3b0` | 6.60:1 |
| Persistent selected boundary | `#6b5200` | white `#ffffff` | 7.42:1 |
| Keyboard/gaze inner focus outline | `#0b0c0c` | white `#ffffff` | 19.59:1 |
| Keyboard/gaze inner focus outline | `#0b0c0c` | selected background `#fff3b0` | 17.44:1 |
| Gaze dwell progress | `#725b00` | white `#ffffff` | 6.54:1 |
| Gaze dwell progress | `#725b00` | panel `#f6f8fa` | 6.14:1 |
| Primary/secondary button boundary | `#003b68` | white `#ffffff` | 11.50:1 |
| Error boundary | `#b10e1e` | error surface `#fff7f7` | 6.74:1 |

Ratios use the WCAG relative-luminance formula. Automated regression tests repeat
the selected, focus and gaze calculations from the source colour tokens.

## State design

- A selected answer remains gold after keyboard focus moves away. It is not a
  temporary focus effect.
- Hidden-radio rating cells display a check mark; smiley, answer-format and pairwise
  selections display a visible `Selected` badge. Native checkboxes and radios retain
  their checked shape. Selection therefore does not depend on colour alone.
- Keyboard focus and gaze dwell use a dark inner outline that independently exceeds
  3:1. The yellow outer halo remains a secondary salience cue and is not the
  conformance-bearing edge.
- Validation and submission failures include explicit text, headings and focus
  movement; red is not the only error signal.
- Forced-colours mode retains a system `Highlight` outline and a `CanvasText`
  selected marker boundary.

## Manual verification required before recruitment

1. Re-test selected and focus states in iOS Safari, iPadOS Safari, Chrome and Edge
   after the GitHub Pages deployment is updated.
2. Test standard and large text at 200% zoom and at 320 CSS pixels.
3. Test Windows High Contrast/forced-colours mode.
4. Inspect the participant iframe inside the actual UCL Qualtrics theme; the external
   theme is outside this repository's CSS.
5. Record screenshots and Pass, Partial or Fail against the frozen commit rather
   than claiming complete WCAG conformance from automated tests alone.
