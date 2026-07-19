// Privacy contract per PRD §10. Provider name is filled in once chosen (Phase 2).
export default function AboutPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">About &amp; Privacy</h1>
      <p className="text-slate-600">
        A privacy-first assistant that tailors your resume and cover letter to a
        specific job posting, grounded strictly in your real profile.
      </p>
      <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="font-medium">Data handling contract</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>
            Your content is stored only in your browser (IndexedDB). No
            server-side database exists.
          </li>
          <li>
            Your content transits a stateless proxy to the LLM provider solely to
            generate output; nothing is retained by the proxy.
          </li>
          <li>
            Export/import gives you full data portability, and a “delete all
            data” action wipes local storage.
          </li>
        </ul>
      </div>
    </section>
  );
}
