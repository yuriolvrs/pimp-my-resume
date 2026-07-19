// What this file is: an unlinked dev-only route (/dev/llm) for manually
// testing the proxy -> LLM round trip during Phase 2. Not part of the
// product UI (no nav link); replaced by real generation screens in later
// phases.
// In plain terms: a "ping the AI" test button used to prove the plumbing
// works, not something end users will ever see.

import { useState } from 'react';
import { generate } from '../lib/llm';

export default function DevLlmPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [output, setOutput] = useState('');

  async function handleTest() {
    setStatus('loading');
    setOutput('');
    try {
      const result = await generate('Reply with {"hello":"world"} as JSON, nothing else.');
      setOutput(result);
      setStatus('done');
    } catch (err) {
      setOutput(err instanceof Error ? err.message : 'Unknown error.');
      setStatus('error');
    }
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">LLM proxy test</h1>
      <p className="text-slate-600">
        Dev-only page. Requires the Worker running locally (<code>cd worker &amp;&amp; npm run dev</code>)
        with a Groq key in <code>worker/.dev.vars</code>.
      </p>
      <button
        type="button"
        onClick={handleTest}
        disabled={status === 'loading'}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
      >
        {status === 'loading' ? 'Testing…' : 'Test connection'}
      </button>
      {status === 'done' && (
        <pre className="rounded-md border border-slate-200 bg-white p-3 text-sm text-green-700">
          {output}
        </pre>
      )}
      {status === 'error' && (
        <pre className="rounded-md border border-red-200 bg-white p-3 text-sm text-red-600">
          {output}
        </pre>
      )}
    </section>
  );
}
