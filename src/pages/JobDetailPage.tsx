// What this file is: the Jobs route's detail page (/jobs/:id). Shows one
// saved posting's text (editable), runs the LLM analysis on demand via
// analyzePosting's prompt + the shared llm.ts proxy client, and renders the
// result through AnalysisEditor. Edits autosave to Dexie the same way the
// Profile page does: list-shaped edits persist immediately, the large
// free-text posting body persists on blur.
// In plain terms: the screen for one saved job posting -- edit the pasted
// text, run the AI analysis, and fix up its answer if needed.

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { JobPosting, Profile } from '../types';
import {
  deleteJobPosting,
  loadJobPosting,
  postingLabel,
  saveJobPosting,
} from '../lib/jobStore';
import { hasProfileContent, loadProfile } from '../lib/profileStore';
import { buildAnalyzePostingPrompt, isJobAnalysis, MAX_POSTING_CHARS } from '../prompts/analyzePosting';
import { generateStructured } from '../lib/llm';
import { JsonParseError } from '../lib/json';
import { AnalysisEditor } from '../components/jobs/AnalysisEditor';

const inputClass =
  'w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [posting, setPosting] = useState<JobPosting | null | 'missing'>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const refresh = useCallback(() => {
    if (!id) return;
    loadJobPosting(id).then((p) => setPosting(p ?? 'missing'));
    loadProfile().then(setProfile);
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Merges a change into state and persists immediately (matches/keywords/etc).
  function update(patch: Partial<JobPosting>) {
    setPosting((prev) => {
      if (!prev || prev === 'missing') return prev;
      const next = { ...prev, ...patch };
      void saveJobPosting(next);
      return next;
    });
  }

  // For the posting text: update on-screen state on every keystroke, but
  // only persist to Dexie on blur, to avoid a write per character typed.
  function updateLive(patch: Partial<JobPosting>) {
    setPosting((prev) => (prev && prev !== 'missing' ? { ...prev, ...patch } : prev));
  }

  function commit(patch: Partial<JobPosting>) {
    setPosting((prev) => {
      if (!prev || prev === 'missing') return prev;
      const next = { ...prev, ...patch };
      void saveJobPosting(next);
      return next;
    });
  }

  async function handleAnalyze() {
    if (!posting || posting === 'missing' || !profile) return;
    setError(null);
    setStatus('loading');
    try {
      const prompt = buildAnalyzePostingPrompt(posting.rawText, profile);
      const analysis = await generateStructured(prompt, isJobAnalysis, {
        temperature: 0.2,
        maxTokens: 1500,
      });
      update({ analysis });
      setStatus('idle');
    } catch (err) {
      if (err instanceof JsonParseError) {
        setError(
          'The model returned an unusable response. Try again — the model this app uses is small and occasionally produces malformed output.',
        );
      } else if (err instanceof Error) {
        setError(`Analysis failed: ${err.message}`);
      } else {
        setError('Unknown error.');
      }
      setStatus('error');
    }
  }

  async function handleConfirmDelete() {
    if (!id) return;
    await deleteJobPosting(id);
    navigate('/jobs');
  }

  if (posting === 'missing') {
    return (
      <section className="space-y-3">
        <p className="text-slate-600">Posting not found.</p>
        <Link to="/jobs" className="text-sm text-slate-600 hover:text-slate-900">
          ← All postings
        </Link>
      </section>
    );
  }

  if (!posting || !profile) {
    return <p className="text-slate-500">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <Link to="/jobs" className="text-sm text-slate-600 hover:text-slate-900">
        ← All postings
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">{postingLabel(posting)}</h1>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Posting text</h2>
        <textarea
          className={inputClass}
          rows={10}
          value={posting.rawText}
          onChange={(e) => updateLive({ rawText: e.target.value })}
          onBlur={() => commit({ rawText: posting.rawText })}
        />
        {posting.rawText.length > MAX_POSTING_CHARS && (
          <p className="text-sm text-slate-500">
            Only the first {MAX_POSTING_CHARS.toLocaleString()} characters are sent for analysis.
          </p>
        )}
      </section>

      {!hasProfileContent(profile) && (
        <p className="text-sm text-slate-600">
          Add your experience or skills on the{' '}
          <Link to="/profile" className="underline hover:text-slate-900">
            Profile page
          </Link>{' '}
          first — matches and gaps need something to compare against.
        </p>
      )}

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={status === 'loading' || posting.rawText.trim() === '' || !hasProfileContent(profile)}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
      >
        {status === 'loading' ? 'Analyzing…' : posting.analysis ? 'Re-analyze' : 'Analyze'}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {posting.analysis ? (
        <AnalysisEditor value={posting.analysis} onChange={(analysis) => update({ analysis })} />
      ) : (
        <p className="text-sm text-slate-400">No analysis yet.</p>
      )}

      <section className="space-y-2 border-t border-slate-200 pt-4">
        {!confirmingDelete ? (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete posting
          </button>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-700">Are you sure? This cannot be undone.</span>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="rounded-md bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700"
            >
              Yes, delete
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
      </section>
    </div>
  );
}
