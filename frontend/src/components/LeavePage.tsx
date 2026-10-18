import { useEffect, useState, type FormEvent } from 'react';
import { api, getErrorMessage } from '../api';
import type { LeaveApplication, LeaveStatus, User } from '../types';

export default function LeavePage({ user }: { user: User }) {
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const isAdmin = user.role === 'ADMIN';

  async function loadLeaves() {
    setLoading(true);
    try {
      const response = await api.get<LeaveApplication[]>('/leaves');
      setLeaves(response.data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadLeaves(); }, []);

  async function submitLeave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      await api.post('/leaves', { startDate, endDate, reason: reason.trim() });
      setNotice('Leave request submitted. It is now pending review.');
      setStartDate(''); setEndDate(''); setReason(''); setShowForm(false);
      await loadLeaves();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(leave: LeaveApplication, status: Exclude<LeaveStatus, 'PENDING'>) {
    const action = status === 'APPROVED' ? 'approve' : 'reject';
    if (!window.confirm(`${action[0].toUpperCase()}${action.slice(1)} this leave request?`)) return;
    setError(''); setNotice('');
    try {
      await api.patch(`/leaves/${leave.id}/status`, { status });
      setNotice(`Leave request ${status.toLowerCase()}.`);
      await loadLeaves();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function cancelLeave(leave: LeaveApplication) {
    if (!window.confirm('Cancel this leave request?')) return;
    setError(''); setNotice('');
    try {
      await api.delete(`/leaves/${leave.id}`);
      setNotice('Leave request cancelled.');
      await loadLeaves();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const pendingCount = leaves.filter((leave) => leave.status === 'PENDING').length;
  const approvedCount = leaves.filter((leave) => leave.status === 'APPROVED').length;

  return (
    <section className="page-stack">
      <div className="page-heading page-heading-row">
        <div><span className="eyebrow">TIME OFF & ABSENCE</span><h1>Leave requests</h1><p>{isAdmin ? 'Review and manage leave requests from across your team.' : 'Request time away and keep track of your leave status.'}</p></div>
        {!isAdmin && <button className="button button-primary" onClick={() => { setShowForm((visible) => !visible); setError(''); }}><span>＋</span> Request leave</button>}
      </div>
      {notice && <div className="alert alert-success">{notice}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="mini-stat-grid">
        <div className="mini-stat"><span className="mini-stat-icon tone-amber">◷</span><div><small>Pending</small><strong>{pendingCount}</strong></div></div>
        <div className="mini-stat"><span className="mini-stat-icon tone-green">✓</span><div><small>Approved</small><strong>{approvedCount}</strong></div></div>
        <div className="mini-stat"><span className="mini-stat-icon tone-blue">▦</span><div><small>Total requests</small><strong>{leaves.length}</strong></div></div>
      </div>

      {showForm && <section className="panel-card leave-form-card">
        <div className="panel-heading"><div><h2>New leave request</h2><p>Choose your dates and share a short reason.</p></div><button className="icon-button" aria-label="Close request form" onClick={() => setShowForm(false)}>×</button></div>
        <form onSubmit={submitLeave} className="leave-form">
          <div><label htmlFor="startDate">Start date</label><input id="startDate" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required /></div>
          <div><label htmlFor="endDate">End date</label><input id="endDate" type="date" value={endDate} min={startDate || undefined} onChange={(event) => setEndDate(event.target.value)} required /></div>
          <div className="leave-reason"><label htmlFor="reason">Reason for leave</label><input id="reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="e.g. Personal appointment" maxLength={500} required /></div>
          <div className="leave-form-action"><button className="button button-primary" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit request'}</button></div>
        </form>
      </section>}

      <div className="table-card">
        <div className="table-card-heading"><div><h2>{isAdmin ? 'Team leave activity' : 'Your leave history'}</h2><p>{isAdmin ? 'Status changes are visible to employees.' : 'Your latest requests and their current status.'}</p></div><span className="soft-count">{leaves.length} requests</span></div>
        {loading ? <div className="empty-state"><span className="loader" />Loading leave requests…</div> : leaves.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">▦</div><b>No leave requests yet</b><p>New requests will appear here when submitted.</p></div>
        ) : <div className="table-scroll"><table className="data-table leave-table">
          <thead><tr>{isAdmin && <th>Employee</th>}<th>Leave dates</th><th>Reason</th><th>Submitted</th><th>Status</th><th className="right-align">Actions</th></tr></thead>
          <tbody>{leaves.map((leave) => <tr key={leave.id}>
            {isAdmin && <td><div className="person-cell"><span className="avatar avatar-2">{leave.employeeName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><div><b>{leave.employeeName}</b><small>{leave.employeeEmail}</small></div></div></td>}
            <td><div className="date-range"><b>{new Date(`${leave.startDate}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</b><span>to {new Date(`${leave.endDate}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div></td>
            <td className="reason-cell">{leave.reason}</td>
            <td>{new Date(leave.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
            <td><span className={`status-pill status-${leave.status.toLowerCase()}`}><i />{leave.status}</span></td>
            <td><div className="table-actions leave-actions">
              {isAdmin && leave.status === 'PENDING' && <><button className="small-action approve-action" onClick={() => void updateStatus(leave, 'APPROVED')}>Approve</button><button className="small-action reject-action" onClick={() => void updateStatus(leave, 'REJECTED')}>Reject</button></>}
              {((!isAdmin && leave.status === 'PENDING') || isAdmin) && <button className="icon-button danger-icon" title="Cancel/delete leave request" aria-label="Cancel leave" onClick={() => void cancelLeave(leave)}>⌫</button>}
            </div></td>
          </tr>)}</tbody>
        </table></div>}
      </div>
    </section>
  );
}
