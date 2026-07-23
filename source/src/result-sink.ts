import type { StudyConfig, StudyResultRecord } from './study';

export const QUALTRICS_SUBMIT_MESSAGE = 'accessible-nasa-tlx:qualtrics-submit:v1';
export const QUALTRICS_RECEIPT_MESSAGE = 'accessible-nasa-tlx:qualtrics-receipt:v1';
export const QUALTRICS_RESIZE_MESSAGE = 'accessible-nasa-tlx:qualtrics-resize:v1';

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
    accessibleNasaTlxResultSink?: ApprovedResultSink;
  }
}

export function configuredResultSink(windowRef: Window = window) {
  const sink = windowRef.accessibleNasaTlxResultSink;
  if (!sink || typeof sink.name !== 'string' || !sink.name.trim() || typeof sink.submit !== 'function') return null;
  return sink;
}

export function installStudyResultSink(config: StudyConfig, windowRef: Window = window) {
  if (config.collection.mode !== 'qualtrics') return null;
  const sink = createQualtricsParentResultSink(config.collection.parentOrigin, windowRef);
  windowRef.accessibleNasaTlxResultSink = sink;
  installQualtricsAutoResize(config.collection.parentOrigin, windowRef);
  return sink;
}

export function installQualtricsAutoResize(parentOrigin: string, windowRef: Window = window) {
  const ResizeObserverConstructor = (
    windowRef as unknown as { ResizeObserver?: typeof ResizeObserver }
  ).ResizeObserver;
  if (windowRef.parent === windowRef || typeof ResizeObserverConstructor !== 'function') return null;
  const sendHeight = () => {
    const documentElement = windowRef.document.documentElement;
    const body = windowRef.document.body;
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
  const observer = new ResizeObserverConstructor(sendHeight);
  if (windowRef.document.documentElement) observer.observe(windowRef.document.documentElement);
  if (windowRef.document.body) observer.observe(windowRef.document.body);
  windowRef.requestAnimationFrame(sendHeight);
  return observer;
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
