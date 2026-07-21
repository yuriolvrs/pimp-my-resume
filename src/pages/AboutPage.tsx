// What this file is: the About/Privacy route. States the app's data
// handling contract verbatim per PRD §10. Provider name gets filled in once
// chosen (Phase 2).
// In plain terms: the page that explains how your data is handled and kept
// private.
import { Card, SectionTitle } from '../components/ui/primitives';

export default function AboutPage() {
  return (
    <div className="space-y-4 pb-16">
      <div className="mb-3">
        <h1 className="text-lg font-semibold text-slate-900">About &amp; Privacy</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          A privacy-first assistant that tailors your resume and cover letter to a specific job
          posting, grounded strictly in your real profile.
        </p>
      </div>
      <Card className="p-6">
        <SectionTitle>Data Handling Contract</SectionTitle>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-slate-600">
          <li>
            Your content is stored only in your browser (IndexedDB). No server-side database
            exists.
          </li>
          <li>
            Your content transits a stateless proxy to the LLM provider solely to generate output;
            nothing is retained by the proxy.
          </li>
          <li>
            Export/import gives you full data portability, and a "delete all data" action wipes
            local storage.
          </li>
        </ul>
      </Card>
    </div>
  );
}
