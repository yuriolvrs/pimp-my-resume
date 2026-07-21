// What this file is: the Jobs route's list page. Lets the user paste a new
// job posting (saved as a new record, then navigated to its detail page),
// and lists previously saved postings newest-first, linking to each one's
// detail page for analysis.
// In plain terms: the "Jobs" screen -- paste a new posting here, or open one
// you already saved.

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { JobPosting } from '../types';
import { listJobPostings, newJobPosting, postingLabel, saveJobPosting } from '../lib/jobStore';

const inputClass =
  'w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none';

export default function JobsPage() {
  const navigate = useNavigate();
  const [postings, setPostings] = useState<JobPosting[] | null>(null);
  const [rawText, setRawText] = useState('');

  const refresh = useCallback(() => {
    listJobPostings().then(setPostings);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleSave() {
    const posting = newJobPosting(rawText);
    await saveJobPosting(posting);
    navigate(`/jobs/${posting.id}`);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Jobs</h1>
        <p className="mt-1 text-slate-600">
          Paste a job posting to analyze it against your profile, then generate tailored
          documents (later phases).
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">New posting</h2>
        <textarea
          className={inputClass}
          rows={8}
          value={rawText}
          placeholder="Paste the full job posting text here..."
          onChange={(e) => setRawText(e.target.value)}
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={rawText.trim() === ''}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
        >
          Save posting
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Saved postings</h2>
        {postings === null ? (
          <p className="text-slate-500">Loading…</p>
        ) : postings.length === 0 ? (
          <p className="text-sm text-slate-400">No postings yet.</p>
        ) : (
          <div className="space-y-3">
            {postings.map((posting) => (
              <Link
                key={posting.id}
                to={`/jobs/${posting.id}`}
                className="block rounded-md border border-slate-200 bg-white p-3 hover:bg-slate-50"
              >
                <p className="font-medium">{postingLabel(posting)}</p>
                <p className="text-sm text-slate-500">
                  {new Date(posting.createdAt).toLocaleDateString()} ·{' '}
                  {posting.analysis ? 'Analyzed' : 'Not analyzed'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
