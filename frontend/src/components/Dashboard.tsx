import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '../api';
import type { Employee, LeaveApplication, User } from '../types';

export default function Dashboard({ user, onNavigate }: { user: User; onNavigate: (page: 'employees' | 'leaves') => void }) {
  const [employeeCount, setEmployeeCount] = useState<number | null>(null);
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [profile, setProfile] = useState<Employee | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const leaveResponse = await api.get<LeaveApplication[]>('/leaves');
        if (!active) return;
        setLeaves(leaveResponse.data);
        if (user.role === 'ADMIN') {
          const employeesResponse = await api.get<Employee[]>('/employees');
          if (active) setEmployeeCount(employeesResponse.data.length);
        } else {
          const profileResponse = await api.get<Employee>('/employees/me');
          if (active) setProfile(profileResponse.data);
        }
      } catch (err) {
        if (active) setError(getErrorMessage(err));
      }
    }
    void load();
    return () => { active = false; };
  }, [user]);

  const pending = leaves.filter((leave) => leave.status === 'PENDING').length;
  const approved = leaves.filter((leave) => leave.status === 'APPROVED').length;
  const firstName = user.fullName.trim().split(' ')[0];

  return (
    <section className="page-stack">
      <div className="welcome-banner">
        <div><span className="eyebrow">YOUR WORKSPACE</span><h1>Good to see you, {firstName} <span>✦</span></h1><p>Here’s what’s happening with your people today.</p></div>
        <div className="welcome-art" aria-hidden="true"><div className="welcome-circle circle-a" /><div className="welcome-circle circle-b" /><div className="welcome-orbit-card"><span>✦</span><div><b>People first.</b><small>Work made simpler.</small></div></div></div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="stat-grid">
        {user.role === 'ADMIN' ? <div className="stat-card"><div className="stat-top"><span className="stat-icon stat-icon-blue">♙</span><span className="stat-label">TEAM SIZE</span></div><div className="stat-value">{employeeCount ?? '—'}</div><p>Active employee accounts</p><button className="stat-link" onClick={() => onNavigate('employees')}>View directory <span>→</span></button></div> : <div className="stat-card"><div className="stat-top"><span className="stat-icon stat-icon-blue">♙</span><span className="stat-label">MY DEPARTMENT</span></div><div className="stat-value stat-value-text">{profile?.department ?? '—'}</div><p>{profile?.designation ?? 'Your current role'}</p><button className="stat-link" onClick={() => onNavigate('leaves')}>Manage time off <span>→</span></button></div>}
        <div className="stat-card"><div className="stat-top"><span className="stat-icon stat-icon-amber">◷</span><span className="stat-label">PENDING LEAVES</span></div><div className="stat-value">{pending}</div><p>{user.role === 'ADMIN' ? 'Requests need review' : 'Requests awaiting review'}</p><button className="stat-link" onClick={() => onNavigate('leaves')}>{user.role === 'ADMIN' ? 'Review requests' : 'View my requests'} <span>→</span></button></div>
        <div className="stat-card"><div className="stat-top"><span className="stat-icon stat-icon-green">✓</span><span className="stat-label">APPROVED LEAVES</span></div><div className="stat-value">{approved}</div><p>{user.role === 'ADMIN' ? 'Approved across the team' : 'Your approved requests'}</p><button className="stat-link" onClick={() => onNavigate('leaves')}>See leave history <span>→</span></button></div>
      </div>

      <div className="dashboard-columns">
        <section className="panel-card activity-card"><div className="panel-heading"><div><h2>Recent leave activity</h2><p>The latest updates from your workspace.</p></div><button className="text-button" onClick={() => onNavigate('leaves')}>View all <span>→</span></button></div>
          {leaves.length === 0 ? <div className="compact-empty"><span>◷</span><div><b>No activity yet</b><small>Leave requests will appear here.</small></div></div> : <div className="activity-list">{leaves.slice(0, 5).map((leave) => <div className="activity-item" key={leave.id}><span className={`activity-symbol activity-${leave.status.toLowerCase()}`}>{leave.status === 'APPROVED' ? '✓' : leave.status === 'REJECTED' ? '×' : '◷'}</span><div className="activity-copy"><b>{user.role === 'ADMIN' ? leave.employeeName : 'Your leave request'} <span>{leave.status.toLowerCase()}</span></b><small>{leave.reason}</small></div><time>{new Date(leave.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</time></div>)}</div>}
        </section>
        <section className="panel-card quick-actions-card"><div className="panel-heading"><div><h2>Quick actions</h2><p>Jump straight into your work.</p></div></div>
          {user.role === 'ADMIN' && <button className="quick-action" onClick={() => onNavigate('employees')}><span className="quick-icon quick-icon-blue">＋</span><span><b>Manage employees</b><small>Add, edit or remove employee records</small></span><span className="quick-arrow">→</span></button>}
          <button className="quick-action" onClick={() => onNavigate('leaves')}><span className="quick-icon quick-icon-amber">◷</span><span><b>{user.role === 'ADMIN' ? 'Review leave requests' : 'Request time off'}</b><small>{user.role === 'ADMIN' ? 'Approve or reject pending requests' : 'Submit and track your leave request'}</small></span><span className="quick-arrow">→</span></button>
          {user.role === 'EMPLOYEE' && <div className="privacy-note"><span>♧</span><p>Your account only displays your own personal leave history and profile details.</p></div>}
        </section>
      </div>
    </section>
  );
}
