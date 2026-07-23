import type { StudyResultRecord } from './study';

export interface ResultSinkReceipt {
  accepted: true;
  submissionId: string;
  receiptId?: string;
}

export interface ApprovedResultSink {
  name: string;
  submit(record: StudyResultRecord): Promise<ResultSinkReceipt>;
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
