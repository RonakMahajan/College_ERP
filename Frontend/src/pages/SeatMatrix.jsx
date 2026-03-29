import { useState, useEffect } from 'react';
import { useMaster } from '../context/MasterContext';
import { useAuth } from '../context/AuthContext';

export default function SeatMatrix() {
  const { programs, loading, fetchPrograms } = useMaster();
  const { canWrite } = useAuth();

  useEffect(() => { fetchPrograms(); }, []);

  const total = (arr, key) => arr.reduce((s, q) => s + q[key], 0);

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h2>Seat Matrix</h2>
          <p>Live quota-wise seat availability across all programs</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner"></div></div>
      ) : programs.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📋</div><p>No programs configured</p></div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Program</th>
                <th>Type</th>
                <th>Intake</th>
                <th>Quota</th>
                <th>Total Seats</th>
                <th>Filled</th>
                <th>Remaining</th>
                <th>Fill %</th>
              </tr>
            </thead>
            <tbody>
              {programs.map(p => (
                p.quotas.map((q, i) => {
                  const remaining = q.seats - q.filled;
                  const pct = Math.round((q.filled / q.seats) * 100) || 0;
                  const color = pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'success';
                  return (
                    <tr key={`${p._id}-${q.name}`}>
                      {i === 0 && (
                        <>
                          <td rowSpan={p.quotas.length} style={{ fontWeight: '600', color: 'var(--text-primary)', verticalAlign: 'middle' }}>
                            {p.name}
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {p.department?.name}
                            </div>
                          </td>
                          <td rowSpan={p.quotas.length} style={{ verticalAlign: 'middle' }}>
                            <span className="badge badge-purple">{p.courseType}</span>
                          </td>
                          <td rowSpan={p.quotas.length} style={{ verticalAlign: 'middle', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {p.intake}
                          </td>
                        </>
                      )}
                      <td><span className="badge badge-info">{q.name}</span></td>
                      <td>{q.seats}</td>
                      <td style={{ fontWeight: '600' }}>{q.filled}</td>
                      <td>
                        <span className={`badge badge-${remaining === 0 ? 'danger' : 'success'}`}>
                          {remaining}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <div className="progress-bar-wrap" style={{ marginTop: 0 }}>
                              <div
                                className={`progress-bar-fill ${pct >= 100 ? 'red' : pct >= 80 ? 'amber' : 'green'}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                          </div>
                          <span className={`badge badge-${color}`} style={{ minWidth: '40px', justifyContent: 'center' }}>
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
