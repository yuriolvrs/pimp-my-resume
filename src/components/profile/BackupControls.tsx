// What this file is: the UI for exporting/importing your data as JSON and
// for deleting all local data, with a two-step confirmation and
// error/success messaging.
// In plain terms: the buttons for backing up, restoring, or wiping your
// data.

import { useRef, useState } from 'react';
import {
  BackupValidationError,
  deleteAllData,
  exportAllData,
  importAllData,
  parseBackup,
} from '../../lib/backup';

export function BackupControls({ onDataChanged }: { onDataChanged: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleExport() {
    setError(null);
    const backup = await exportAllData();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anti-funemployment-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Exported.');
  }

  function handleImportClick() {
    setError(null);
    setMessage(null);
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError(null);
    try {
      const text = await file.text();
      const backup = parseBackup(text);
      await importAllData(backup);
      setMessage('Import complete. Your data has been restored.');
      onDataChanged();
    } catch (err) {
      setError(err instanceof BackupValidationError ? err.message : 'Import failed.');
    }
  }

  async function handleConfirmDelete() {
    await deleteAllData();
    setConfirmingDelete(false);
    setError(null);
    setMessage('All local data has been deleted.');
    onDataChanged();
  }

  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold">Data</h2>
      <p className="text-sm text-slate-500">
        Your data lives only in this browser. Export it to back it up or move to another device.
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && !error && <p className="text-sm text-green-600">{message}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Import JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleFileSelected}
        />

        {!confirmingDelete ? (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete All Data
          </button>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-700">Are you sure? This cannot be undone.</span>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="rounded-md bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700"
            >
              Yes, delete everything
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
