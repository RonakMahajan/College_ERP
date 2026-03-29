import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApplicant } from '../context/ApplicantContext';
import { useMaster } from '../context/MasterContext';
import { useAuth } from '../context/AuthContext';

export default function ApplicantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canWrite } = useAuth();
  const { selectedApplicant, detailLoading, fetchApplicantById, updateDocs, updateFee, allocate, confirm } = useApplicant();
  const { programs, fetchPrograms } = useMaster();

  const [allocating, setAllocating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchApplicantById(id);
    fetchPrograms();
  }, [id]);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleDocUpdate = async (status) => {
    try {
      await updateDocs(id, status);
      showMsg('success', `Document status updated to "${status}"`);
    } catch (err) { showMsg('error', err.response?.data?.message || 'Update failed'); }
  };

  const handleFeeUpdate = async (status) => {
    try {
      await updateFee(id, status);
      showMsg('success', `Fee status updated to "${status}"`);
    } catch (err) { showMsg('error', err.response?.data?.message || 'Update failed'); }
  };

  const handleAllocate = async () => {
    if (!selectedProgram) return showMsg('error', 'Please select a program first');
    setAllocating(true);
    try {
      const result = await allocate(id, selectedProgram);
      showMsg('success', `✅ Seat allocated! Remaining seats: ${result.remainingSeats}`);
    } catch (err) { showMsg('error', err.response?.data?.message || 'Allocation failed'); }
    finally { setAllocating(false); }
  };

  const handleConfirm = async () => {
    if (!confirm('Confirm this admission? This will generate a permanent admission number.')) return;
    setConfirming(true);
    try {
      const result = await confirm(id);
      showMsg('success', `🎉 Admission confirmed! Number: ${result.admissionNumber}`);
    } catch (err) { showMsg('error', err.response?.data?.message || 'Confirmation failed'); }
    finally { setConfirming(false); }
  };

  if (detailLoading) return <div className="loading-wrap"><div className="spinner"></div></div>;
  if (!selectedApplicant) return <div className="empty-state"><div className="empty-icon">⚠️</div><p>Applicant not found</p></div>;

  const a = selectedApplicant;
  const docColor = { Pending: 'warning', Submitted: 'info', Verified: 'success' };
  const feeColor = { Pending: 'danger', Paid: 'success' };
  const statusColor = { Applied: 'muted', Allocated: 'info', Confirmed: 'success', Rejected: 'danger' };

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/applicants')} style={{ marginBottom: '8px' }}>
            ← Back
          </button>
          <h2>{a.name}</h2>
          <p style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className={`badge badge-${statusColor[a.admissionStatus]}`}>{a.admissionStatus}</span>
            <span className={`badge badge-${docColor[a.documentStatus]}`}>Docs: {a.documentStatus}</span>
            <span className={`badge badge-${feeColor[a.feeStatus]}`}>Fee: {a.feeStatus}</span>
          </p>
        </div>
      </div>

      {/* Alert Message */}
      {message.text && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          background: message.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: message.type === 'success' ? '#34d399' : '#f87171',
          fontSize: '0.875rem'
        }}>
          {message.text}
        </div>
      )}

      {/* Admission Number Banner */}
      {a.admissionNumber && (
        <div className="admission-number-display" style={{ marginBottom: '20px' }}>
          <div className="num-label">🎓 Official Admission Number</div>
          <div className="num-value">{a.admissionNumber}</div>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: '20px' }}>
        {/* Personal Info */}
        <div className="card">
          <div className="detail-section">
            <h4>Personal Details</h4>
            <div className="detail-grid">
              <div className="detail-item"><div className="detail-label">Full Name</div><div className="detail-value">{a.name}</div></div>
              <div className="detail-item"><div className="detail-label">Date of Birth</div><div className="detail-value">{new Date(a.dob).toLocaleDateString('en-IN')}</div></div>
              <div className="detail-item"><div className="detail-label">Gender</div><div className="detail-value">{a.gender}</div></div>
              <div className="detail-item"><div className="detail-label">Category</div><div className="detail-value">{a.category}</div></div>
              <div className="detail-item"><div className="detail-label">Mobile</div><div className="detail-value">{a.mobile}</div></div>
              <div className="detail-item"><div className="detail-label">Email</div><div className="detail-value">{a.email}</div></div>
              <div className="detail-item"><div className="detail-label">State</div><div className="detail-value">{a.state}</div></div>
              <div className="detail-item"><div className="detail-label">Nationality</div><div className="detail-value">{a.nationality}</div></div>
              <div className="detail-item"><div className="detail-label">Address</div><div className="detail-value">{a.address}</div></div>
            </div>
          </div>
        </div>

        {/* Admission Info */}
        <div className="card">
          <div className="detail-section">
            <h4>Admission Details</h4>
            <div className="detail-grid">
              <div className="detail-item"><div className="detail-label">Qualifying Exam</div><div className="detail-value">{a.qualifyingExam}</div></div>
              <div className="detail-item"><div className="detail-label">Marks / Score</div><div className="detail-value">{a.marks}</div></div>
              <div className="detail-item"><div className="detail-label">Entry Type</div><div className="detail-value">{a.entryType}</div></div>
              <div className="detail-item"><div className="detail-label">Quota Type</div><div className="detail-value">{a.quotaType}</div></div>
              <div className="detail-item"><div className="detail-label">Admission Mode</div><div className="detail-value">{a.admissionMode}</div></div>
              {a.allotmentNumber && (
                <div className="detail-item"><div className="detail-label">Allotment No.</div><div className="detail-value">{a.allotmentNumber}</div></div>
              )}
              {a.program && (
                <div className="detail-item" style={{ gridColumn: '1/-1' }}>
                  <div className="detail-label">Program</div>
                  <div className="detail-value">{a.program?.name} ({a.program?.courseType})</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Panel — only for admin/officer */}
      {canWrite && (
        <div className="card">
          <h4 style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px' }}>
            Actions
          </h4>

          {/* 1. Document Status */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>📄 Document Status</p>
            <div className="action-bar">
              {['Pending', 'Submitted', 'Verified'].map(s => (
                <button
                  key={s}
                  id={`doc-${s.toLowerCase()}`}
                  className={`btn btn-sm ${a.documentStatus === s ? 'btn-success' : 'btn-ghost'}`}
                  onClick={() => handleDocUpdate(s)}
                >
                  {a.documentStatus === s ? '✓ ' : ''}{s}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Fee Status */}
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>💰 Fee Status</p>
            <div className="action-bar">
              {['Pending', 'Paid'].map(s => (
                <button
                  key={s}
                  id={`fee-${s.toLowerCase()}`}
                  className={`btn btn-sm ${a.feeStatus === s ? (s === 'Paid' ? 'btn-success' : 'btn-danger') : 'btn-ghost'}`}
                  onClick={() => handleFeeUpdate(s)}
                >
                  {a.feeStatus === s ? '✓ ' : ''}{s}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Seat Allocation */}
          {a.admissionStatus === 'Applied' && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>🪑 Allocate Seat</p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select
                  id="select-program"
                  className="form-select"
                  style={{ flex: 1 }}
                  value={selectedProgram}
                  onChange={e => setSelectedProgram(e.target.value)}
                >
                  <option value="">— Select Program —</option>
                  {programs
                    .filter(p => {
                      const quota = p.quotas?.find(q => q.name === a.quotaType);
                      return quota && quota.filled < quota.seats;
                    })
                    .map(p => {
                      const quota = p.quotas?.find(q => q.name === a.quotaType);
                      return (
                        <option key={p._id} value={p._id}>
                          {p.name} ({a.quotaType}: {quota?.filled}/{quota?.seats} seats)
                        </option>
                      );
                    })
                  }
                </select>
                <button
                  id="allocate-btn"
                  className="btn btn-info"
                  onClick={handleAllocate}
                  disabled={allocating || !selectedProgram}
                >
                  {allocating ? 'Allocating...' : '🪑 Allocate Seat'}
                </button>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Only programs with available seats for quota "{a.quotaType}" are shown
              </p>
            </div>
          )}

          {/* 4. Confirm Admission */}
          {a.admissionStatus === 'Allocated' && !a.admissionNumber && (
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>🎓 Confirm Admission</p>
              {a.feeStatus !== 'Paid' ? (
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: '#fbbf24'
                }}>
                  ⚠️ Mark fee as <strong>Paid</strong> before confirming admission
                </div>
              ) : (
                <button
                  id="confirm-admission-btn"
                  className="btn btn-success"
                  onClick={handleConfirm}
                  disabled={confirming}
                >
                  {confirming ? 'Confirming...' : '✅ Confirm Admission & Generate Number'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
