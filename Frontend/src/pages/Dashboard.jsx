import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../api/api';

const QUICK_LINKS = [
  { icon: '📋', label: 'Applicants', sub: 'Manage all applicants', path: '/applicants', color: '#2d6a4f' },
  { icon: '🎓', label: 'Programs', sub: 'Setup programs & quotas', path: '/masters/programs', color: '#6f42c1' },
  { icon: '📊', label: 'Seat Matrix', sub: 'View live seat status', path: '/programs', color: '#2980b9' },
  { icon: '🏛️', label: 'Institutions', sub: 'Manage institutions', path: '/masters/institutions', color: '#e67e22' },
  { icon: '🏫', label: 'Campuses', sub: 'Manage campuses', path: '/masters/campuses', color: '#c0392b' },
  { icon: '👥', label: 'Users', sub: 'Manage system users', path: '/users', color: '#17a589' },
];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner"></div></div>;
  if (!data) return <div className="empty-state"><div className="empty-icon">⚠️</div><p>Failed to load dashboard</p></div>;

  const { overview, seatMatrix, pendingFeeList, pendingDocList, applicantStats } = data;

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Welcome to the Admission Management System</p>
        </div>
      </div>

      {/* Quick Links — Card Grid (like reference image) */}
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        {QUICK_LINKS.map(link => (
          <div
            key={link.path}
            className="stat-card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(link.path)}
          >
            <span className="stat-icon">{link.icon}</span>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
              {link.label}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{link.sub}</div>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>{overview.totalIntake}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600' }}>Total Intake</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#2980b9' }}>{overview.totalApplicants}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600' }}>Total Applicants</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)' }}>{overview.confirmed}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600' }}>Confirmed</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--warning)' }}>{overview.totalRemaining}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: '600' }}>Seats Remaining</div>
        </div>
      </div>

      {/* Seat Matrix */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>
          📊 Program-wise Seat Matrix
        </h3>
        {seatMatrix.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📭</div><p>No programs configured</p></div>
        ) : (
          seatMatrix.map(prog => (
            <div key={prog.programId} style={{
              background: '#f8fffe', border: '1px solid #c3e6cb',
              borderRadius: '8px', padding: '14px', marginBottom: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--primary-dark)' }}>{prog.programName}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '8px' }}>({prog.courseType})</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{prog.totalFilled}/{prog.intake}</span>
                  <span className={`badge badge-${prog.fillPercent >= 90 ? 'danger' : prog.fillPercent >= 70 ? 'warning' : 'success'}`}>
                    {prog.fillPercent}%
                  </span>
                </div>
              </div>
              <div className="progress-bar-wrap">
                <div
                  className={`progress-bar-fill ${prog.fillPercent >= 90 ? 'red' : prog.fillPercent >= 70 ? 'amber' : 'green'}`}
                  style={{ width: `${prog.fillPercent}%` }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                {prog.quotas.map(q => (
                  <div key={q.name} style={{
                    background: '#fff', border: '1px solid var(--border)',
                    borderRadius: '6px', padding: '5px 12px', fontSize: '0.75rem'
                  }}>
                    <span style={{ fontWeight: '600', color: 'var(--primary-dark)' }}>{q.name}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>
                      {q.filled}/{q.seats}
                      {q.filled >= q.seats && <span style={{ color: 'var(--danger)', marginLeft: '4px', fontWeight: '700' }}>FULL</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pending Lists */}
      <div className="grid-2">
        <div className="card">
          <h3 style={{ fontSize: '0.88rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>
            💰 Fee Pending
            {applicantStats.pendingFees > 0 && (
              <span className="badge badge-warning" style={{ marginLeft: '8px' }}>{applicantStats.pendingFees}</span>
            )}
          </h3>
          {pendingFeeList.length === 0 ? (
            <p style={{ color: 'var(--success)', fontSize: '0.82rem', fontWeight: '500' }}>✅ All fees cleared</p>
          ) : (
            pendingFeeList.map(a => (
              <div key={a._id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 12px', background: '#fffdf5',
                borderRadius: '6px', marginBottom: '6px',
                border: '1px solid #fde8c0'
              }}>
                <div>
                  <div style={{ fontSize: '0.83rem', fontWeight: '600', color: 'var(--text-primary)' }}>{a.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{a.program?.name} • {a.quotaType}</div>
                </div>
                <span className="badge badge-warning">Pending</span>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.88rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>
            📄 Documents Pending
            {applicantStats.pendingDocs > 0 && (
              <span className="badge badge-danger" style={{ marginLeft: '8px' }}>{applicantStats.pendingDocs}</span>
            )}
          </h3>
          {pendingDocList.length === 0 ? (
            <p style={{ color: 'var(--success)', fontSize: '0.82rem', fontWeight: '500' }}>✅ All documents verified</p>
          ) : (
            pendingDocList.map(a => (
              <div key={a._id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '9px 12px', background: '#f8f9fa',
                borderRadius: '6px', marginBottom: '6px',
                border: '1px solid var(--border)'
              }}>
                <div>
                  <div style={{ fontSize: '0.83rem', fontWeight: '600', color: 'var(--text-primary)' }}>{a.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{a.program?.name}</div>
                </div>
                <span className={`badge badge-${a.documentStatus === 'Submitted' ? 'info' : 'muted'}`}>
                  {a.documentStatus}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
