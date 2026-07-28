import type { StudyConfig, StudyResultRecord } from './study';

export const QUALTRICS_SUBMIT_MESSAGE = 'accessible-questionnaire:qualtrics-submit:v2';
export const QUALTRICS_RECEIPT_MESSAGE = 'accessible-questionnaire:qualtrics-receipt:v2';
export const QUALTRICS_RESIZE_MESSAGE = 'accessible-questionnaire:qualtrics-resize:v2';
export const QUALTRICS_REVEAL_MESSAGE = 'accessible-questionnaire:qualtrics-reveal:v2';
export const QUALTRICS_PARENT_READY_MESSAGE = 'accessible-questionnaire:qualtrics-parent-ready:v2';
export const QUALTRICS_CHILD_READY_MESSAGE = 'accessible-questionnaire:qualtrics-child-ready:v2';

export interface ResultSinkReceipt {
  accepted: true;
  submissionId: string;
  receiptId?: string;
}

export interface ApprovedResultSink {
  name: string;
  submit(record: StudyResultRecord): Promise<ResultSinkReceipt>;
}

interface QualtricsReceiptMessage {
  type: typeof QUALTRICS_RECEIPT_MESSAGE;
  accepted: boolean;
  submissionId: string;
  receiptId?: string;
  error?: string;
}

declare global {
  interface Window {
    accessibleQuestionnaireResultSink?: ApprovedResultSink;
    /** @deprecated Version 0.7 host integration name retained during migration. */
    accessibleNasaTlxResultSink?: ApprovedResultSink;
  }
}

export function configuredResultSink(windowRef: Window = window) {
  const sink =
    windowRef.accessibleQuestionnaireResultSink ??
    windowRef.accessibleNasaTlxResultSink;
  if (!sink || typeof sink.name !== 'string' || !sink.name.trim() || typeof sink.submit !== 'function') return null;
  return sink;
}

export function installStudyResultSink(config: StudyConfig, windowRef: Window = window) {
  if (config.collection.mode !== 'qualtrics') return null;
  const sink = createQualtricsParentResultSink(config.collection.parentOrigin, windowRef);
  windowRef.accessibleQuestionnaireResultSink = sink;
  // Keep the old property for a bounded Version 0.7 migration period. Both
  // properties refer to the same origin-bound sink and do not duplicate data.
  windowRef.accessibleNasaTlxResultSink = sink;
  installQualtricsAutoResize(config.collection.parentOrigin, windowRef);
  return sink;
}

export function installQualtricsAutoResize(parentOrigin: string, windowRef: Window = window) {
  const ResizeObserverConstructor = (
    windowRef as unknown as { ResizeObserver?: typeof ResizeObserver }
  ).ResizeObserver;
  const MutationObserverConstructor = (
    windowRef as unknown as { MutationObserver?: typeof MutationObserver }
  ).MutationObserver;
  if (windowRef.parent === windowRef) return null;
  let animationFrameId: number | null = null;
  let heightScheduled = false;
  const documentElement = windowRef.document.documentElement;
  const body = windowRef.document.body;
  const previousDocumentOverflow = documentElement?.style?.overflow ?? '';
  const previousBodyOverflow = body?.style?.overflow ?? '';

  // The parent owns scrolling once it expands the iframe to the child document
  // height. Explicitly suppressing child scrolling prevents mobile browsers from
  // retaining a second scrollable viewport even when scrolling="no" is present.
  if (documentElement?.style) documentElement.style.overflow = 'hidden';
  if (body?.style) body.style.overflow = 'hidden';

  const sendHeight = () => {
    const height = Math.ceil(Math.max(
      documentElement?.scrollHeight ?? 0,
      documentElement?.offsetHeight ?? 0,
      body?.scrollHeight ?? 0,
      body?.offsetHeight ?? 0,
    ));
    if (height > 0) {
      windowRef.parent.postMessage({ type: QUALTRICS_RESIZE_MESSAGE, height }, parentOrigin);
    }
  };
  const scheduleHeight = () => {
    if (heightScheduled) return;
    heightScheduled = true;
    animationFrameId = windowRef.requestAnimationFrame(() => {
      heightScheduled = false;
      animationFrameId = null;
      sendHeight();
    });
  };
  const announceReady = () => {
    windowRef.parent.postMessage({
      type: QUALTRICS_CHILD_READY_MESSAGE,
      protocolVersion: 2,
    }, parentOrigin);
    scheduleHeight();
  };
  const receiveParentReady = (event: MessageEvent<unknown>) => {
    if (event.source !== windowRef.parent || event.origin !== parentOrigin) return;
    const message = event.data as { type?: unknown } | null;
    if (message?.type === QUALTRICS_PARENT_READY_MESSAGE) announceReady();
  };

  windowRef.addEventListener('message', receiveParentReady);
  windowRef.addEventListener('load', announceReady);
  windowRef.addEventListener('resize', scheduleHeight);

  const resizeObserver = typeof ResizeObserverConstructor === 'function'
    ? new ResizeObserverConstructor(scheduleHeight)
    : null;
  if (resizeObserver && windowRef.document.documentElement) {
    resizeObserver.observe(windowRef.document.documentElement);
  }
  if (resizeObserver && windowRef.document.body) {
    resizeObserver.observe(windowRef.document.body);
  }

  // Descendant rendering can increase scrollHeight without changing the observed
  // body's content box. Mutation observation and bounded retries cover the Lit
  // render, font/layout settlement and a parent listener that starts after the
  // iframe's first animation frame.
  const mutationObserver = typeof MutationObserverConstructor === 'function'
    ? new MutationObserverConstructor(scheduleHeight)
    : null;
  if (mutationObserver && windowRef.document.documentElement) {
    mutationObserver.observe(windowRef.document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  }
  const retryTimerIds = [0, 100, 500, 1500, 4000].map((delay) =>
    windowRef.setTimeout(announceReady, delay));
  announceReady();

  return {
    disconnect() {
      if (animationFrameId !== null) windowRef.cancelAnimationFrame(animationFrameId);
      heightScheduled = false;
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      retryTimerIds.forEach((timerId) => windowRef.clearTimeout(timerId));
      windowRef.removeEventListener('message', receiveParentReady);
      windowRef.removeEventListener('load', announceReady);
      windowRef.removeEventListener('resize', scheduleHeight);
      if (documentElement?.style) documentElement.style.overflow = previousDocumentOverflow;
      if (body?.style) body.style.overflow = previousBodyOverflow;
    },
  };
}

/**
 * Requests that the trusted Qualtrics parent reveal an element inside the
 * participant iframe. Scrolling the child document alone cannot move the
 * parent's visual viewport when the iframe is expanded to the full document
 * height. The configured exact origin is deliberately retained.
 */
export function requestQualtricsParentReveal(
  element: HTMLElement,
  parentOrigin: string,
  windowRef: Window = window,
) {
  if (windowRef.parent === windowRef) return false;
  const rect = element.getBoundingClientRect();
  const offsetTop = rect.top + (windowRef.scrollY || windowRef.pageYOffset || 0);
  if (!Number.isFinite(offsetTop) || !Number.isFinite(rect.height)) return false;
  windowRef.parent.postMessage(
    {
      type: QUALTRICS_REVEAL_MESSAGE,
      offsetTop,
      targetHeight: Math.max(1, rect.height),
    },
    parentOrigin,
  );
  return true;
}

export function createQualtricsParentResultSink(
  parentOrigin: string,
  windowRef: Window = window,
  acknowledgementTimeoutMs = 12_000,
): ApprovedResultSink {
  return {
    name: 'UCL Qualtrics',
    submit(record) {
      if (windowRef.parent === windowRef) {
        return Promise.reject(new Error('This centrally collected questionnaire must be opened through its Qualtrics survey.'));
      }

      return new Promise<ResultSinkReceipt>((resolve, reject) => {
        let settled = false;
        const finish = (action: () => void) => {
          if (settled) return;
          settled = true;
          windowRef.clearTimeout(timeoutId);
          windowRef.removeEventListener('message', receiveReceipt);
          action();
        };
        const receiveReceipt = (event: MessageEvent<unknown>) => {
          if (event.source !== windowRef.parent || event.origin !== parentOrigin) return;
          const message = event.data as Partial<QualtricsReceiptMessage> | null;
          if (
            !message ||
            message.type !== QUALTRICS_RECEIPT_MESSAGE ||
            message.submissionId !== record.submissionId
          ) {
            return;
          }
          if (message.accepted !== true) {
            finish(() => reject(new Error(
              typeof message.error === 'string' && message.error
                ? message.error
                : 'Qualtrics did not accept the response.',
            )));
            return;
          }
          finish(() => resolve({
            accepted: true,
            submissionId: record.submissionId,
            receiptId: typeof message.receiptId === 'string' ? message.receiptId : undefined,
          }));
        };
        const timeoutId = windowRef.setTimeout(() => {
          finish(() => reject(new Error('Qualtrics did not acknowledge the response in time.')));
        }, acknowledgementTimeoutMs);
        windowRef.addEventListener('message', receiveReceipt);
        windowRef.parent.postMessage({
          type: QUALTRICS_SUBMIT_MESSAGE,
          record,
        }, parentOrigin);
      });
    },
  };
}

export async function submitToApprovedResultSink(
  record: StudyResultRecord,
  sink: ApprovedResultSink,
  timeoutMs = 15_000,
): Promise<ResultSinkReceipt> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('The study platform did not confirm receipt in time.')), timeoutMs);
  });
  let receipt: ResultSinkReceipt;
  try {
    receipt = await Promise.race([sink.submit(record), timeout]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
  if (
    !receipt ||
    receipt.accepted !== true ||
    receipt.submissionId !== record.submissionId ||
    (receipt.receiptId !== undefined && typeof receipt.receiptId !== 'string')
  ) {
    throw new Error('The study platform returned an invalid submission receipt.');
  }
  return receipt;
}
