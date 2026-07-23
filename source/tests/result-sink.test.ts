// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { configuredResultSink, submitToApprovedResultSink } from '../src/result-sink';
import type { StudyResultRecord } from '../src/study';

const record = {
  submissionId: 'submission-fixed',
} as StudyResultRecord;

afterEach(() => {
  delete window.accessibleNasaTlxResultSink;
});

describe('approved host result sink', () => {
  it('is absent unless the host page explicitly installs a named submit function', () => {
    expect(configuredResultSink()).toBeNull();
    window.accessibleNasaTlxResultSink = { name: '', async submit() {
      return { accepted: true, submissionId: 'submission-fixed' };
    } };
    expect(configuredResultSink()).toBeNull();
  });

  it('accepts only a receipt for the same idempotent submission ID', async () => {
    const sink = {
      name: 'Approved platform',
      async submit() {
        return { accepted: true as const, submissionId: 'submission-fixed', receiptId: 'receipt-001' };
      },
    };
    await expect(submitToApprovedResultSink(record, sink)).resolves.toEqual({
      accepted: true,
      submissionId: 'submission-fixed',
      receiptId: 'receipt-001',
    });
  });

  it('rejects a mismatched receipt instead of falsely reporting completion', async () => {
    const sink = {
      name: 'Approved platform',
      async submit() {
        return { accepted: true as const, submissionId: 'different-submission' };
      },
    };
    await expect(submitToApprovedResultSink(record, sink)).rejects.toThrow(/invalid submission receipt/i);
  });

  it('times out a host that never confirms receipt', async () => {
    const sink = {
      name: 'Unresponsive platform',
      async submit() {
        return new Promise<never>(() => undefined);
      },
    };
    await expect(submitToApprovedResultSink(record, sink, 5)).rejects.toThrow(/did not confirm receipt in time/i);
  });
});
