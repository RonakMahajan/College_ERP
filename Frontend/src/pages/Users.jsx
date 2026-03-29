import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers, registerUser } from '../api/api';

const ROLES = ['admin', 'admission_officer', 'management'];

export default function Users() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admission_officer' });
  const [err, setErr] = useState('');

  useEffect(() => {
    getUsers().then(r => setUsers(r.data)).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr('');
    try {
      const { data } = await registerUser(form);
      setUsers(prev => [data, ...prev]);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'admission_officer' });
    } catch (e) { setErr(e.response?.data?.message || 'Error'); }
  };

  const roleColor = { admin: 'danger', admission_officer: 'info', management: 'success' };

  return (
    <div className="page-body">
      <div className="page-header">
        <div><h2>User Management</h2><p>Manage system users and roles</p></div>
        {isAdmin && <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add User</button>}
      </div>

      <div className="table-wrapper">
        {loading ? <div className="loading-wrap"><div className="spinner"></div></div> : (
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                        {u.name[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td><span className={`badge badge-${roleColor[u.role]}`}>{u.role.replace('_', ' ')}</span></td>
                  <td style={{ fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New User</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {err && <div className="login-error">⚠️ {err}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Email *</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Password *</label>
                <input className="form-input" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Role *</label>
                <select className="form-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                </select></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
