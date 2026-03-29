import { useState, useEffect } from 'react';
import { useMaster } from '../../context/MasterContext';

export default function Campuses() {
  const { campuses, institutions, loading, fetchCampuses, fetchInstitutions, addCampus, editCampus, removeCampus } = useMaster();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', institution: '', location: '' });
  const [err, setErr] = useState('');

  useEffect(() => { fetchCampuses(); fetchInstitutions(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', institution: '', location: '' }); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, institution: c.institution?._id || '', location: c.location || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr('');
    try {
      if (editing) await editCampus(editing._id, form);
      else await addCampus(form);
      setShowModal(false);
    } catch (e) { setErr(e.response?.data?.message || 'Error'); }
  };

  return (
    <div className="page-body">
      <div className="page-header">
        <div><h2>Campuses</h2><p>Manage institution campuses</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Campus</button>
      </div>
      <div className="table-wrapper">
        {loading ? <div className="loading-wrap"><div className="spinner"></div></div> :
         campuses.length === 0 ? <div className="empty-state"><div className="empty-icon">🏫</div><p>No campuses yet</p></div> : (
          <table className="table">
            <thead><tr><th>Name</th><th>Institution</th><th>Location</th><th>Actions</th></tr></thead>
            <tbody>
              {campuses.map(c => (
                <tr key={c._id}>
                  <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{c.name}</td>
                  <td>{c.institution?.name || '—'}</td>
                  <td>{c.location || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('Delete?')) removeCampus(c._id); }}>✕</button>
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
              <h3>{editing ? 'Edit' : 'Add'} Campus</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {err && <div className="login-error">⚠️ {err}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Campus Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Institution *</label>
                <select className="form-select" value={form.institution} onChange={e => setForm(p => ({ ...p, institution: e.target.value }))} required>
                  <option value="">Select Institution</option>
                  {institutions.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                </select></div>
              <div className="form-group"><label className="form-label">Location</label>
                <input className="form-input" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} /></div>
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
