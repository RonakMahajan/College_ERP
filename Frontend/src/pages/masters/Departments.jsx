import { useState, useEffect } from 'react';
import { useMaster } from '../../context/MasterContext';

export default function Departments() {
  const { departments, campuses, loading, fetchDepartments, fetchCampuses, addDepartment, editDepartment, removeDepartment } = useMaster();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', campus: '', code: '' });
  const [err, setErr] = useState('');

  useEffect(() => { fetchDepartments(); fetchCampuses(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', campus: '', code: '' }); setShowModal(true); };
  const openEdit = (d) => { setEditing(d); setForm({ name: d.name, campus: d.campus?._id || '', code: d.code }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr('');
    try {
      if (editing) await editDepartment(editing._id, form);
      else await addDepartment(form);
      setShowModal(false);
    } catch (e) { setErr(e.response?.data?.message || 'Error'); }
  };

  return (
    <div className="page-body">
      <div className="page-header">
        <div><h2>Departments</h2><p>Manage campus departments</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Department</button>
      </div>
      <div className="table-wrapper">
        {loading ? <div className="loading-wrap"><div className="spinner"></div></div> :
         departments.length === 0 ? <div className="empty-state"><div className="empty-icon">🔬</div><p>No departments yet</p></div> : (
          <table className="table">
            <thead><tr><th>Name</th><th>Code</th><th>Campus</th><th>Actions</th></tr></thead>
            <tbody>
              {departments.map(d => (
                <tr key={d._id}>
                  <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{d.name}</td>
                  <td><span className="badge badge-info">{d.code}</span></td>
                  <td>{d.campus?.name || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(d)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('Delete?')) removeDepartment(d._id); }}>✕</button>
                    </div>
                  </td>
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
              <h3>{editing ? 'Edit' : 'Add'} Department</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {err && <div className="login-error">⚠️ {err}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Department Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Code *</label>
                <input className="form-input" placeholder="e.g. CSE, ECE" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Campus *</label>
                <select className="form-select" value={form.campus} onChange={e => setForm(p => ({ ...p, campus: e.target.value }))} required>
                  <option value="">Select Campus</option>
                  {campuses.map(c => <option key={c._id} value={c._id}>{c.name} — {c.institution?.name}</option>)}
                </select></div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
