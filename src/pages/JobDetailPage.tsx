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
import { ArrowLeft, Sparkles } from 'lucide-react';
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
import { Btn, Card } from '../components/ui/primitives';

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
        <p className="text-sm text-slate-500">Posting not found.</p>
        <Link
          to="/jobs"
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-900 transition-colors font-medium w-fit"
        >
          <ArrowLeft size={15} />
          Back to Jobs
        </Link>
      </section>
    );
  }

  if (!posting || !profile) {
    return <p className="text-sm text-slate-400">Loading…</p>;
  }

  return (
    <div className="pb-16">
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/jobs"
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-900 transition-colors font-medium"
        >
          <ArrowLeft size={15} />
          Back to Jobs
        </Link>
        {!confirmingDelete ? (
          <Btn size="sm" variant="danger" onClick={() => setConfirmingDelete(true)}>
            Delete posting
          </Btn>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600">Delete this posting?</span>
            <Btn
              size="sm"
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-500 focus:ring-red-600/30"
            >
              Yes, delete
            </Btn>
            <Btn size="sm" variant="secondary" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </Btn>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">{postingLabel(posting)}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5 items-start">
        <Card className="p-5 lg:sticky lg:top-20">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Posting Text
          </p>
          <textarea
            className="w-full text-sm text-slate-600 leading-relaxed bg-transparent resize-none outline-none border border-transparent rounded-xl focus:border-blue-300 focus:bg-blue-50/20 px-2 py-2 transition-all max-h-[70vh] overflow-y-auto"
            rows={16}
            value={posting.rawText}
            onChange={(e) => updateLive({ rawText: e.target.value })}
            onBlur={() => commit({ rawText: posting.rawText })}
          />
          {posting.rawText.length > MAX_POSTING_CHARS && (
            <p className="text-xs text-slate-400 mt-2">
              Only the first {MAX_POSTING_CHARS.toLocaleString()} characters are sent for analysis.
            </p>
          )}
        </Card>

        <div className="space-y-4">
          {!hasProfileContent(profile) && (
            <p className="text-sm text-slate-500">
              Add your experience or skills on the{' '}
              <Link to="/profile" className="underline hover:text-slate-900">
                Profile page
              </Link>{' '}
              first — matches and gaps need something to compare against.
            </p>
          )}

          {!posting.analysis ? (
            <Card className="p-10 flex flex-col items-center text-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
                <Sparkles size={22} className="text-white" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-slate-900">Analyze this posting</h3>
                <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                  Extract requirements, find keyword matches, identify gaps — then edit anything
                  before generating documents.
                </p>
              </div>
              <Btn
                onClick={handleAnalyze}
                disabled={
                  status === 'loading' || posting.rawText.trim() === '' || !hasProfileContent(profile)
                }
                className="min-w-[140px] justify-center"
              >
                {status === 'loading' ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Run Analysis
                  </>
                )}
              </Btn>
              {error && <p className="text-xs text-red-600">{error}</p>}
            </Card>
          ) : (
            <>
              <div className="flex justify-end">
                <Btn
                  size="sm"
                  variant="secondary"
                  onClick={handleAnalyze}
                  disabled={status === 'loading' || !hasProfileContent(profile)}
                >
                  <Sparkles size={13} />
                  {status === 'loading' ? 'Analyzing…' : 'Re-analyze'}
                </Btn>
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <AnalysisEditor value={posting.analysis} onChange={(analysis) => update({ analysis })} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
