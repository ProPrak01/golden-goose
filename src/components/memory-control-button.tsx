'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type MemoryControlAction = 'soft_expire' | 'delete';

export function MemoryControlButton({
  action,
  memoryId,
}: {
  action: MemoryControlAction;
  memoryId: string;
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const label = action === 'soft_expire' ? 'No longer relevant' : 'Delete memory';

  async function applyControl() {
    if (
      action === 'delete' &&
      !globalThis.confirm(
        'Delete this memory permanently? Its source transcript will remain in the audit trail.',
      )
    ) {
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch(`/api/memories/${memoryId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error('Memory control request failed.');
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <button
      type="button"
      className={`memory-control${action === 'delete' ? ' memory-control-danger' : ''}`}
      onClick={applyControl}
      disabled={isSaving}
    >
      {isSaving ? 'Saving…' : label}
    </button>
  );
}
