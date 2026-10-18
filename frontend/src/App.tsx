import { useState } from 'react';
import { useAuth } from './AuthContext';
import Dashboard from './components/Dashboard';
import EmployeesPage from './components/EmployeesPage';
import LeavePage from './components/LeavePage';
import LoginPage from './components/LoginPage';

type Page = 'overview' | 'employees' | 'leaves';

export default function App() {
  const { user, signOut } = useAuth();
  const [page, setPage] = useState<Page>('overview');

  if (!user) return <LoginPage />;

  const initial = user.fullName.trim().split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  const pageLabel = page === 'overview' ? 'Overview' : page === 'employees' ? 'Employees' : 'Leave requests';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">P</span><span>PeopleDesk</span></div>
        <div className="workspace-switch"><span className="workspace-icon">N</span><span><b>Northstar Co.</b><small>People workspace</small></span><span className="switch-chevron">⌄</span></div>
        <div className="nav-section-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={`nav-link ${page === 'overview' ? 'active' : ''}`} onClick={() => setPage('overview')}><span className="nav-icon">▦</span>Overview</button>
          {user.role === 'ADMIN' && <button className={`nav-link ${page === 'employees' ? 'active' : ''}`} onClick={() => setPage('employees')}><span className="nav-icon">♙</span>Employees<span className="nav-admin-tag">HR</span></button>}
          <button className={`nav-link ${page === 'leaves' ? 'active' : ''}`} onClick={() => setPage('leaves')}><span className="nav-icon">◷</span>Leave requests</button>
        </nav>
        <div className="sidebar-bottom"><div className="sidebar-help"><span>✳</span><b>Need a hand?</b><p>Keep your people operations running smoothly.</p></div><div className="sidebar-user"><span className="avatar avatar-self">{initial}</span><div><b>{user.fullName}</b><small>{user.role === 'ADMIN' ? 'Workspace admin' : 'Employee'}</small></div><button className="logout-button" onClick={signOut} aria-label="Sign out" title="Sign out">↪</button></div></div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div className="breadcrumbs"><span>Workspace</span><span className="crumb-divider">/</span><b>{pageLabel}</b></div><div className="topbar-right"><span className="status-dot" /><span className="workspace-status">System operational</span><span className="topbar-divider" /><span className="topbar-date">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}</span><span className="topbar-avatar">{initial}</span></div></header>
        <div className="content-area">
          {page === 'overview' && <Dashboard user={user} onNavigate={(nextPage) => setPage(nextPage)} />}
          {page === 'employees' && user.role === 'ADMIN' && <EmployeesPage />}
          {page === 'leaves' && <LeavePage user={user} />}
        </div>
        <footer className="app-footer"><span>© {new Date().getFullYear()} PeopleDesk</span><span>Thoughtful people operations <b>•</b> Built for teams</span></footer>
      </main>
    </div>
  );
}
