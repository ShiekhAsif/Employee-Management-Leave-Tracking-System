import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { api, getErrorMessage } from '../api';
import type { Employee, Role } from '../types';

type EmployeeForm = {
  fullName: string;
  email: string;
  password: string;
  department: string;
  designation: string;
  salary: string;
  joiningDate: string;
  role: Role;
};

const emptyForm = (): EmployeeForm => ({
  fullName: '', email: '', password: '', department: 'Engineering', designation: '',
  salary: '45000', joiningDate: new Date().toISOString().slice(0, 10), role: 'EMPLOYEE',
});

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeForm>(emptyForm);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function loadEmployees() {
    setLoading(true);
    try {
      const response = await api.get<Employee[]>('/employees');
      setEmployees(response.data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadEmployees(); }, []);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return employees;
    return employees.filter((employee) =>
      [employee.fullName, employee.email, employee.department, employee.designation, employee.role]
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [employees, search]);

  function startCreate() {
    setEditing(null);
    setForm(emptyForm());
    setShowForm(true);
    setNotice('');
    setError('');
  }

  function startEdit(employee: Employee) {
    setEditing(employee);
    setForm({
      fullName: employee.fullName, email: employee.email, password: '',
      department: employee.department, designation: employee.designation,
      salary: String(employee.salary), joiningDate: employee.joiningDate, role: employee.role,
    });
    setShowForm(true);
    setNotice('');
    setError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    const payload = {
      fullName: form.fullName.trim(), email: form.email.trim(), department: form.department.trim(),
      designation: form.designation.trim(), salary: Number(form.salary), joiningDate: form.joiningDate,
      role: form.role,
    };
    try {
      if (editing) {
        await api.put(`/employees/${editing.id}`, payload);
        setNotice('Employee details updated successfully.');
      } else {
        await api.post('/employees', { ...payload, password: form.password });
        setNotice('Employee account created successfully.');
      }
      setShowForm(false);
      await loadEmployees();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function deleteEmployee(employee: Employee) {
    if (!window.confirm(`Delete ${employee.fullName}? Their leave history will also be removed.`)) return;
    setError('');
    setNotice('');
    try {
      await api.delete(`/employees/${employee.id}`);
      setNotice(`${employee.fullName} was deleted.`);
      await loadEmployees();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <section className="page-stack">
      <div className="page-heading page-heading-row">
        <div><span className="eyebrow">PEOPLE DIRECTORY</span><h1>Employees</h1><p>Manage employee records, departments, and account access.</p></div>
        <button className="button button-primary" onClick={startCreate}><span>＋</span> Add employee</button>
      </div>
      {notice && <div className="alert alert-success">{notice}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="toolbar">
        <div className="search-field"><span aria-hidden="true">⌕</span><input aria-label="Search employees" placeholder="Search name, team, email…" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <div className="result-count"><b>{filteredEmployees.length}</b> employees</div>
      </div>

      <div className="table-card">
        {loading ? <div className="empty-state"><span className="loader" />Loading employees…</div> : filteredEmployees.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">♙</div><b>No employees found</b><p>Try another search or add a new employee.</p></div>
        ) : (
          <div className="table-scroll"><table className="data-table">
            <thead><tr><th>Employee</th><th>Department</th><th>Designation</th><th>Salary</th><th>Access</th><th className="right-align">Actions</th></tr></thead>
            <tbody>{filteredEmployees.map((employee) => (
              <tr key={employee.id}>
                <td><div className="person-cell"><span className={`avatar avatar-${employee.id % 5}`}>{employee.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><div><b>{employee.fullName}</b><small>{employee.email}</small></div></div></td>
                <td>{employee.department}</td><td>{employee.designation}</td>
                <td className="salary-cell">₹{Number(employee.salary).toLocaleString('en-IN')}</td>
                <td><span className={`role-pill ${employee.role === 'ADMIN' ? 'role-admin' : ''}`}>{employee.role}</span></td>
                <td><div className="table-actions"><button className="icon-button" title="Edit employee" aria-label={`Edit ${employee.fullName}`} onClick={() => startEdit(employee)}>✎</button><button className="icon-button danger-icon" title="Delete employee" aria-label={`Delete ${employee.fullName}`} onClick={() => void deleteEmployee(employee)}>⌫</button></div></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>

      {showForm && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false); }}>
        <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="employee-form-title">
          <div className="modal-header"><div><span className="eyebrow">EMPLOYEE PROFILE</span><h2 id="employee-form-title">{editing ? 'Edit employee' : 'Add employee'}</h2></div><button className="icon-button" onClick={() => setShowForm(false)} aria-label="Close form">×</button></div>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-grid">
              <div className="field-span-two"><label htmlFor="fullName">Full name</label><input id="fullName" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required maxLength={100} /></div>
              <div className="field-span-two"><label htmlFor="employeeEmail">Work email</label><input id="employeeEmail" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required maxLength={150} /></div>
              {!editing && <div className="field-span-two"><label htmlFor="employeePassword">Temporary password</label><input id="employeePassword" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={8} maxLength={72} autoComplete="new-password" /><small className="field-hint">Use at least 8 characters. Share it securely with the employee.</small></div>}
              <div><label htmlFor="department">Department</label><select id="department" value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} required><option>Engineering</option><option>Human Resources</option><option>Finance</option><option>Marketing</option><option>Sales</option><option>Operations</option><option>Administration</option><option>Support</option></select></div>
              <div><label htmlFor="designation">Designation</label><input id="designation" value={form.designation} onChange={(event) => setForm({ ...form, designation: event.target.value })} required maxLength={100} /></div>
              <div><label htmlFor="salary">Monthly salary (₹)</label><input id="salary" type="number" min="0" step="0.01" value={form.salary} onChange={(event) => setForm({ ...form, salary: event.target.value })} required /></div>
              <div><label htmlFor="joiningDate">Joining date</label><input id="joiningDate" type="date" value={form.joiningDate} onChange={(event) => setForm({ ...form, joiningDate: event.target.value })} required /></div>
              <div className="field-span-two"><label htmlFor="role">System role</label><select id="role" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as Role })}><option value="EMPLOYEE">Employee — standard access</option><option value="ADMIN">Admin — manage all records</option></select></div>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setShowForm(false)}>Cancel</button><button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create employee'}</button></div>
          </form>
        </section>
      </div>}
    </section>
  );
}
