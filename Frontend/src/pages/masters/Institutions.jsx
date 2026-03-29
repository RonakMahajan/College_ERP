import { useState, useEffect } from 'react';
import { useMaster } from '../../context/MasterContext';

export default function Institutions() {
  const { institutions, loading, fetchInstitutions, addInstitution, editInstitution, removeInstitution } = useMaster();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', address: '', phone: '' });
  const [err, setErr] = useState('');

  useEffect(() => { fetchInstitutions(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', code: '', address: '', phone: '' }); setShowModal(true); };
  const openEdit = (inst) => { setEditing(inst); setForm({ name: inst.name, code: inst.code, address: inst.address || '', phone: inst.phone || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr('');
    try {
      if (editing) await editInstitution(editing._id, form);
      else await addInstitution(form);
      setShowModal(false);
    } catch (e) { setErr(e.response?.data?.message || 'Error'); }
  };

  return (
    <div className="page-body">
      <div className="page-header">
        <div><h2>Institutions</h2><p>Manage all institutions</p></div>
        <button id="add-institution-btn" className="btn btn-primary" onClick={openAdd}>+ Add Institution</button>
      </div>
      <div className="table-wrapper">
        {loading ? <div className="loading-wrap"><div className="spinner"></div></div> :
         institutions.length === 0 ? <div className="empty-state"><div className="empty-icon">🏛️</div><p>No institutions yet</p></div> : (
          <table className="table">
            <thead><tr><th>Name</th><th>Code</th><th>Address</th><th>Phone</th><th>Actions</th></tr></thead>
            <tbody>
              {institutions.map(i => (
                <tr key={i._id}>
                  <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{i.name}</td>
                  <td><span className="badge badge-purple">{i.code}</span></td>
                  <td>{i.address || '—'}</td>
                  <td>{i.phone || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(i)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('Delete?')) removeInstitution(i._id); }}>✕</button>
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
              <h3>{editing ? 'Edit' : 'Add'} Institution</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {err && <div className="login-error">⚠️ {err}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label className="form-label">Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Code *</label>
                <input className="form-input" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Address</label>
                <input className="form-input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
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
