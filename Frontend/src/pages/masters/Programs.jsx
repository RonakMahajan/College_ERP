import { useState, useEffect } from 'react';
import { useMaster } from '../../context/MasterContext';

const QUOTA_NAMES = ['KCET', 'COMEDK', 'Management', 'SNQ'];

const emptyForm = () => ({
  name: '', code: '', department: '', courseType: 'UG',
  entryType: 'Regular', admissionMode: 'Government', academicYear: '2026-27',
  intake: '', quotas: [{ name: 'KCET', seats: '' }]
});

export default function Programs() {
  const { programs, departments, loading, fetchPrograms, fetchDepartments, addProgram, editProgram, removeProgram } = useMaster();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [err, setErr] = useState('');

  useEffect(() => { fetchPrograms(); fetchDepartments(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm()); setShowModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, code: p.code, department: p.department?._id || '',
      courseType: p.courseType, entryType: p.entryType,
      admissionMode: p.admissionMode, academicYear: p.academicYear,
      intake: p.intake,
      quotas: p.quotas.map(q => ({ name: q.name, seats: q.seats }))
    });
    setShowModal(true);
  };

  const setField = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const addQuota = () => {
    const used = form.quotas.map(q => q.name);
    const next = QUOTA_NAMES.find(n => !used.includes(n));
    if (next) setForm(p => ({ ...p, quotas: [...p.quotas, { name: next, seats: '' }] }));
  };

  const updateQuota = (idx, key, val) => {
    setForm(p => {
      const quotas = [...p.quotas];
      quotas[idx] = { ...quotas[idx], [key]: val };
      return { ...p, quotas };
    });
  };

  const removeQuota = (idx) => setForm(p => ({ ...p, quotas: p.quotas.filter((_, i) => i !== idx) }));

  const totalQuotaSeats = form.quotas.reduce((s, q) => s + Number(q.seats || 0), 0);
  const intakeNum = Number(form.intake || 0);
  const quotaExceeds = totalQuotaSeats > intakeNum;

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr('');
    if (quotaExceeds) return setErr(`Total quota seats (${totalQuotaSeats}) exceed intake (${intakeNum})`);
    try {
      const payload = { ...form, intake: intakeNum, quotas: form.quotas.map(q => ({ ...q, seats: Number(q.seats) })) };
      if (editing) await editProgram(editing._id, payload);
      else await addProgram(payload);
      setShowModal(false);
    } catch (e) { setErr(e.response?.data?.message || 'Error'); }
  };

  return (
    <div className="page-body">
      <div className="page-header">
        <div><h2>Programs</h2><p>Configure programs, intake and quota seats</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Program</button>
      </div>

      {loading ? <div className="loading-wrap"><div className="spinner"></div></div> :
       programs.length === 0 ? <div className="empty-state"><div className="empty-icon">🎓</div><p>No programs configured</p></div> :
       programs.map(p => {
         const filled = p.quotas.reduce((s, q) => s + q.filled, 0);
         return (
           <div key={p._id} className="card" style={{ marginBottom: '12px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
               <div>
                 <div style={{ fontWeight: '700', fontSize: '1rem' }}>{p.name}</div>
                 <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                   {p.code} • {p.courseType} • {p.entryType} • {p.academicYear}
                 </div>
                 <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                   📍 {p.department?.name}
                 </div>
               </div>
               <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Intake: <strong style={{ color: 'var(--text-primary)' }}>{p.intake}</strong></span>
                 <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filled: <strong style={{ color: 'var(--success)' }}>{filled}</strong></span>
                 <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                 <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('Delete program?')) removeProgram(p._id); }}>✕</button>
               </div>
             </div>
             <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
               {p.quotas.map(q => {
                 const rem = q.seats - q.filled;
                 return (
                   <div key={q.name} className="quota-card" style={{ minWidth: '140px' }}>
                     <div className="quota-header">
                       <span className="quota-name">{q.name}</span>
                       <span className={`badge badge-${rem === 0 ? 'danger' : 'success'}`}>{rem === 0 ? 'FULL' : `${rem} left`}</span>
                     </div>
                     <div className="quota-count">{q.filled} / {q.seats} filled</div>
                     <div className="progress-bar-wrap">
                       <div className={`progress-bar-fill ${rem === 0 ? 'red' : 'indigo'}`} style={{ width: `${Math.min((q.filled / q.seats) * 100, 100)}%` }} />
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>
         );
       })
      }

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit' : 'Add'} Program</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {err && <div className="login-error">⚠️ {err}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Program Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setField('name', e.target.value)} required /></div>
                <div className="form-group"><label className="form-label">Code *</label>
                  <input className="form-input" placeholder="e.g. CSE" value={form.code} onChange={e => setField('code', e.target.value)} required /></div>
              </div>
              <div className="form-group"><label className="form-label">Department *</label>
                <select className="form-select" value={form.department} onChange={e => setField('department', e.target.value)} required>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name} ({d.campus?.name})</option>)}
                </select></div>
              <div className="form-row-3">
                <div className="form-group"><label className="form-label">Course Type</label>
                  <select className="form-select" value={form.courseType} onChange={e => setField('courseType', e.target.value)}>
                    <option>UG</option><option>PG</option>
                  </select></div>
                <div className="form-group"><label className="form-label">Entry Type</label>
                  <select className="form-select" value={form.entryType} onChange={e => setField('entryType', e.target.value)}>
                    <option>Regular</option><option>Lateral</option>
                  </select></div>
                <div className="form-group"><label className="form-label">Admission Mode</label>
                  <select className="form-select" value={form.admissionMode} onChange={e => setField('admissionMode', e.target.value)}>
                    <option>Government</option><option>Management</option>
                  </select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Academic Year</label>
                  <input className="form-input" value={form.academicYear} onChange={e => setField('academicYear', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Total Intake *</label>
                  <input className="form-input" type="number" value={form.intake} onChange={e => setField('intake', e.target.value)} required /></div>
              </div>

              {/* Quota Builder */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Quota Distribution *</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: quotaExceeds ? 'var(--danger)' : 'var(--text-muted)' }}>
                      Total quota seats: {totalQuotaSeats} / {intakeNum || '?'}
                    </span>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={addQuota}
                      disabled={form.quotas.length >= QUOTA_NAMES.length}>+ Add Quota</button>
                  </div>
                </div>
                <div className="quota-builder">
                  {form.quotas.map((q, idx) => (
                    <div key={idx} className="quota-row">
                      <select className="form-select" value={q.name} onChange={e => updateQuota(idx, 'name', e.target.value)}>
                        {QUOTA_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                      <input className="form-input" type="number" placeholder="Seats" value={q.seats} onChange={e => updateQuota(idx, 'seats', e.target.value)} />
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => removeQuota(idx)} disabled={form.quotas.length === 1}>✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={quotaExceeds}>{editing ? 'Update' : 'Create'} Program</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
