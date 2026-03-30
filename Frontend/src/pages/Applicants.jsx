import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicant } from "../context/ApplicantContext";
import { useAuth } from "../context/AuthContext";


const INITIAL_FORM = {
  name: "",
  dob: "",
  gender: "",
  category: "",
  mobile: "",
  email: "",
  address: "",
  state: "",
  nationality: "Indian",
  qualifyingExam: "",
  marks: "",
  allotmentNumber: "",
  entryType: "",
  quotaType: "",
  admissionMode: "",
};

const statusColorMap = {
  Applied: "muted",
  Allocated: "info",
  Confirmed: "success",
  Rejected: "danger",
};
const docColorMap = {
  Pending: "warning",
  Submitted: "info",
  Verified: "success",
};
const feeColorMap = { Pending: "danger", Paid: "success" };

export default function Applicants() {
  const navigate = useNavigate();
  const { isManagement } = useAuth();
  const {
    applicants,
    loading,
    fetchApplicants,
    addApplicant,
    removeApplicant,
  } = useApplicant();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [quotaFilter, setQuotaFilter] = useState("");
  

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchApplicants({ search, status: statusFilter, quota: quotaFilter });
  };

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await addApplicant({ ...form, marks: Number(form.marks) });
      setShowModal(false);
      setForm(INITIAL_FORM);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create applicant");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete applicant "${name}"?`)) return;
    try {
      await removeApplicant(id);
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h2>Applicants</h2>
          <p>Manage all admission applicants</p>
        </div>
        {!isManagement && (
          <button
            id="new-applicant-btn"
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            + New Applicant
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <form onSubmit={handleSearch} className="search-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              id="applicant-search"
              placeholder="Search by name, email, mobile, admission no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            id="filter-status"
            className="form-select"
            style={{ width: "auto" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Applied">Applied</option>
            <option value="Allocated">Allocated</option>
            <option value="Confirmed">Confirmed</option>
          </select>
          <select
            id="filter-quota"
            className="form-select"
            style={{ width: "auto" }}
            value={quotaFilter}
            onChange={(e) => setQuotaFilter(e.target.value)}
          >
            <option value="">All Quota</option>
            <option value="KCET">KCET</option>
            <option value="COMEDK">COMEDK</option>
            <option value="Management">Management</option>
          </select>
          <button type="submit" className="btn btn-ghost">
            Filter
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setQuotaFilter("");
              fetchApplicants();
            }}
          >
            Reset
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="loading-wrap">
            <div className="spinner"></div>
          </div>
        ) : applicants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <p>No applicants found. Create one to get started.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Quota</th>
                <th>Program</th>
                <th>Documents</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Admission No</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((a) => (
                <tr key={a._id}>
                  <td>
                    <div
                      style={{
                        fontWeight: "600",
                        color: "var(--text-primary)",
                      }}
                    >
                      {a.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {a.mobile}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-purple">{a.category}</span>
                  </td>
                  <td>
                    <span className="badge badge-info">{a.quotaType}</span>
                  </td>
                  <td style={{ fontSize: "0.8rem" }}>
                    {a.program?.name || (
                      <span style={{ color: "var(--text-muted)" }}>
                        Not assigned
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge badge-${docColorMap[a.documentStatus]}`}
                    >
                      {a.documentStatus}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${feeColorMap[a.feeStatus]}`}>
                      {a.feeStatus}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge badge-${statusColorMap[a.admissionStatus]}`}
                    >
                      {a.admissionStatus}
                    </span>
                  </td>
                  <td>
                    {a.admissionNumber ? (
                      <code
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--primary-light)",
                        }}
                      >
                        {a.admissionNumber}
                      </code>
                    ) : (
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.8rem",
                        }}
                      >
                        —
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        id={`view-${a._id}`}
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate(`/applicants/${a._id}`)}
                      >
                        View
                      </button>
                      {!isManagement &&(
                          <button
                          id={`delete-${a._id}`}
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(a._id, a.name)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Applicant Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
             <div className="modal-header">
              <h3>➕ New Applicant</h3>    
              <button 
              //if user in manaagement then hide this 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>
            {formError && (
              <div className="login-error" style={{ marginBottom: "16px" }}>
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    id="app-name"
                    name="name"
                    className="form-input"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input
                    id="app-dob"
                    name="dob"
                    type="date"
                    className="form-input"
                    value={form.dob}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select
                    id="app-gender"
                    name="gender"
                    className="form-select"
                    value={form.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    id="app-category"
                    name="category"
                    className="form-select"
                    value={form.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    <option>GM</option>
                    <option>SC</option>
                    <option>ST</option>
                    <option>OBC</option>
                    <option>EWS</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nationality</label>
                  <input
                    id="app-nationality"
                    name="nationality"
                    className="form-input"
                    value={form.nationality}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Mobile *</label>
                  <input
                    id="app-mobile"
                    name="mobile"
                    className="form-input"
                    value={form.mobile}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    id="app-email"
                    name="email"
                    type="email"
                    className="form-input"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address *</label>
                <input
                  id="app-address"
                  name="address"
                  className="form-input"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input
                    id="app-state"
                    name="state"
                    className="form-input"
                    value={form.state}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Qualifying Exam *</label>
                  <input
                    id="app-qual"
                    name="qualifyingExam"
                    className="form-input"
                    placeholder="e.g. PUC / 12th"
                    value={form.qualifyingExam}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Marks / Percentile *</label>
                  <input
                    id="app-marks"
                    name="marks"
                    type="number"
                    className="form-input"
                    value={form.marks}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Allotment No (Govt)</label>
                  <input
                    id="app-allotment"
                    name="allotmentNumber"
                    className="form-input"
                    placeholder="KCET/COMEDK allotment"
                    value={form.allotmentNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Entry Type *</label>
                  <select
                    id="app-entry"
                    name="entryType"
                    className="form-select"
                    value={form.entryType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    <option>Regular</option>
                    <option>Lateral</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Quota Type *</label>
                  <select
                    id="app-quota"
                    name="quotaType"
                    className="form-select"
                    value={form.quotaType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    <option>KCET</option>
                    <option>COMEDK</option>
                    <option>Management</option>
                    <option>SNQ</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Admission Mode *</label>
                  <select
                    id="app-mode"
                    name="admissionMode"
                    className="form-select"
                    value={form.admissionMode}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    <option>Government</option>
                    <option>Management</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  id="submit-applicant"
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "✓ Create Applicant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
