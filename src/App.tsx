// What this file is: the app shell — the top nav bar plus the router that
// maps URLs to page components.
// In plain terms: the outer frame of the app — the header/navigation, and
// wherever a page gets shown depending on which tab you're on.

import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage.tsx';
import JobsPage from './pages/JobsPage.tsx';
import JobDetailPage from './pages/JobDetailPage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import DevLlmPage from './pages/DevLlmPage.tsx';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
    isActive
      ? 'bg-slate-900 text-white'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ');

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
          <span className="text-base font-semibold">Job Application Assistant</span>
          <nav className="flex gap-1">
            <NavLink to="/profile" className={navLinkClass}>
              Profile
            </NavLink>
            <NavLink to="/jobs" className={navLinkClass}>
              Jobs
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About &amp; Privacy
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          {/* Unlinked dev-only route for Phase 2's proxy test harness. */}
          <Route path="/dev/llm" element={<DevLlmPage />} />
          <Route path="*" element={<Navigate to="/profile" replace />} />
        </Routes>
      </main>
    </div>
  );
}
