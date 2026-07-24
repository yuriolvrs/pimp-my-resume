// What this file is: the Resume route's page (/jobs/:id/resume). Builds a
// tailored resume from the posting's confirmed matches via
// selectResumeContent.ts -- a pure, synchronous selection/reordering of the
// profile's own content, no LLM call -- then hands the result to
// ResumeEditor for field-level editing, autosaving to Dexie via genStore.ts.
// Regenerating is an explicit, confirmed action (overwrites the single
// stored generation for this posting, same "Re-run" pattern as matching)
// since it discards manual edits. Export is a plain window.print() against
// the hidden ResumePrintView layout -- no PDF library needed.
// In plain terms: the screen where you build a tailored resume for a job,
// edit it, and export it to PDF.

import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Download, Sparkles } from 'lucide-react';
import type { Generation, JobPosting, Profile, ResumeContent } from '../types';
import { loadJobPosting } from '../lib/jobStore';
import { loadProfile } from '../lib/profileStore';
import { buildProfileAtoms } from '../lib/profileAtoms';
import { loadGeneration, newGeneration, saveGeneration } from '../lib/genStore';
import { isResumeContentVerbatim, selectResumeContent } from '../lib/generation/selectResumeContent';
import { ResumeEditor } from '../components/resume/ResumeEditor';
import { ResumePrintView } from '../components/resume/ResumePrintView';
import { Btn, Card } from '../components/ui/primitives';

export default function ResumePage() {
  const { id } = useParams<{ id: string }>();

  const [posting, setPosting] = useState<JobPosting | null | 'missing'>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [generation, setGeneration] = useState<Generation | null | 'none'>(null);
  const [confirmingRegenerate, setConfirmingRegenerate] = useState(false);

  const refresh = useCallback(() => {
    if (!id) return;
    loadJobPosting(id).then((p) => setPosting(p ?? 'missing'));
    loadProfile().then(setProfile);
    loadGeneration(id, 'resume').then((g) => setGeneration(g ?? 'none'));
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Sets the print header's document title to the candidate's name while
  // this page is open (browsers default the print header to document.title),
  // restoring the app's title on unmount.
  useEffect(() => {
    if (!profile?.contact.name) return;
    const previous = document.title;
    document.title = profile.contact.name;
    return () => {
      document.title = previous;
    };
  }, [profile?.contact.name]);

  async function handleGenerate() {
    if (!id || !posting || posting === 'missing' || !posting.analysis || !profile) return;
    const atoms = buildProfileAtoms(profile);
    const { content, sourceMap } = selectResumeContent(profile, posting.analysis, atoms);
    const next = newGeneration(id, 'resume', content, sourceMap);
    await saveGeneration(next);
    setGeneration(next);
    setConfirmingRegenerate(false);
  }

  function updateContent(content: Generation['content']) {
    setGeneration((prev) => {
      if (!prev || prev === 'none') return prev;
      const next = { ...prev, content };
      void saveGeneration(next);
      return next;
    });
  }

  if (posting === 'missing') {
    return (
      <section className="space-y-3">
        <p className="text-sm text-slate-500">Posting not found.</p>
        <Link to="/jobs" className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-900 font-medium w-fit">
          <ArrowLeft size={15} />
          Back to Jobs
        </Link>
      </section>
    );
  }

  if (!posting || !profile || generation === null) {
    return <p className="text-sm text-slate-400">Loading…</p>;
  }

  if (!posting.analysis || posting.analysis.matches.length === 0) {
    return (
      <section className="space-y-3">
        <p className="text-sm text-slate-500">
          This posting hasn't been matched yet.{' '}
          <Link to={`/jobs/${posting.id}`} className="underline hover:text-slate-900">
            Go run analysis and matching first.
          </Link>
        </p>
      </section>
    );
  }

  // A generation saved by the earlier LLM-rewriting design (see
  // selectResumeContent.ts's file header) can contain fabricated bullets
  // that don't exist anywhere in the profile -- never trust/display those as
  // if they were today's verbatim-only output.
  const stale = generation !== 'none' && !isResumeContentVerbatim(generation.content as ResumeContent, profile);

  return (
    <div className="pb-16">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link to={`/jobs/${posting.id}/match`} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-900 font-medium">
          <ArrowLeft size={15} />
          Back to matches
        </Link>
        {generation !== 'none' && !stale && (
          <div className="flex items-center gap-2">
            {!confirmingRegenerate ? (
              <>
                <Btn size="sm" variant="secondary" onClick={() => setConfirmingRegenerate(true)}>
                  <Sparkles size={13} />
                  Regenerate
                </Btn>
                <Btn size="sm" onClick={() => window.print()}>
                  <Download size={13} />
                  Export PDF
                </Btn>
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-600">This will overwrite your edits. Regenerate?</span>
                <Btn size="sm" onClick={handleGenerate}>
                  Yes, regenerate
                </Btn>
                <Btn size="sm" variant="secondary" onClick={() => setConfirmingRegenerate(false)}>
                  Cancel
                </Btn>
              </div>
            )}
          </div>
        )}
      </div>

      {generation === 'none' ? (
        <Card className="p-10 flex flex-col items-center text-center gap-5 print:hidden">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
            <Sparkles size={22} className="text-white" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-semibold text-slate-900">Build a tailored resume</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Selects and prioritizes your most relevant experience, projects, and skills for this
              job -- every bullet stays exactly as you wrote it. Edit anything before exporting.
            </p>
          </div>
          <Btn onClick={handleGenerate} className="min-w-[140px] justify-center">
            <Sparkles size={14} />
            Build resume
          </Btn>
        </Card>
      ) : stale ? (
        <Card className="p-10 flex flex-col items-center text-center gap-5 print:hidden">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg">
            <AlertTriangle size={22} className="text-white" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-semibold text-slate-900">This resume needs to be rebuilt</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              It was built by an older version of this app that could rewrite bullet text -- some
              of what it shows may not actually be in your profile. Rebuilding replaces it with
              today's selection-only version, where every bullet stays exactly as you wrote it.
            </p>
          </div>
          <Btn onClick={handleGenerate} className="min-w-[140px] justify-center">
            <Sparkles size={14} />
            Rebuild resume
          </Btn>
        </Card>
      ) : (
        <>
          <div className="print:hidden">
            <ResumeEditor
              value={generation.content as ResumeContent}
              sourceMap={generation.sourceMap}
              onChange={updateContent}
            />
          </div>
          <ResumePrintView content={generation.content as ResumeContent} />
        </>
      )}
    </div>
  );
}
