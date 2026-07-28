export interface FocusAndRevealOptions {
  block?: ScrollLogicalPosition;
  retryDelayMs?: number;
  onReveal?: () => void;
}

/**
 * Moves programmatic focus and reveals a newly rendered target immediately and
 * again after layout has settled. The bounded retries address mobile Safari
 * cases where focus, the visual viewport and a Lit update settle at different
 * times. A coordinate fallback is used when scrollIntoView leaves the target
 * outside the visual viewport.
 */
export function focusAndReveal(
  element: HTMLElement,
  options: FocusAndRevealOptions = {},
) {
  const view = element.ownerDocument.defaultView;
  const block = options.block ?? 'center';

  try {
    element.focus({ preventScroll: true });
  } catch {
    element.focus();
  }

  const reveal = () => {
    if (!element.isConnected) return;

    try {
      element.scrollIntoView?.({
        behavior: 'auto',
        block,
        inline: 'nearest',
      });
    } catch {
      // Older WebKit versions accept only the legacy boolean signature.
      element.scrollIntoView?.(block !== 'end');
    }

    if (view && typeof view.scrollTo === 'function') {
      const rect = element.getBoundingClientRect();
      const visualViewport = view.visualViewport;
      const viewportTop = visualViewport?.offsetTop ?? 0;
      const viewportHeight = visualViewport?.height ?? view.innerHeight;
      const viewportBottom = viewportTop + viewportHeight;
      const outsideViewport =
        viewportHeight > 0 &&
        (rect.top < viewportTop || rect.bottom > viewportBottom);

      if (outsideViewport) {
        const documentTop = (view.scrollY || view.pageYOffset || 0) + rect.top;
        let top = documentTop - viewportTop;
        if (block === 'center' && rect.height < viewportHeight) {
          top -= (viewportHeight - rect.height) / 2;
        } else if (block === 'end') {
          top -= viewportHeight - rect.height;
        }
        view.scrollTo({
          top: Math.max(0, Math.round(top)),
          left: view.scrollX || view.pageXOffset || 0,
          behavior: 'auto',
        });
      }
    }

    options.onReveal?.();
  };

  // The immediate call handles ordinary browsers. The two-frame and delayed
  // calls recover from iOS/iPadOS focus and visual-viewport timing windows.
  reveal();
  if (typeof view?.requestAnimationFrame === 'function') {
    view.requestAnimationFrame(() => view.requestAnimationFrame(reveal));
  } else {
    queueMicrotask(reveal);
  }
  (view ?? globalThis).setTimeout(reveal, options.retryDelayMs ?? 160);
}
