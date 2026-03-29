import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('erp_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('erp_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── AUTH ────────────────────────────────────────────────
export const login = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const getUsers = () => API.get('/auth/users');

// ─── MASTERS ─────────────────────────────────────────────
export const getInstitutions = () => API.get('/masters/institutions');
export const createInstitution = (data) => API.post('/masters/institutions', data);
export const updateInstitution = (id, data) => API.put(`/masters/institutions/${id}`, data);
export const deleteInstitution = (id) => API.delete(`/masters/institutions/${id}`);

export const getCampuses = () => API.get('/masters/campuses');
export const createCampus = (data) => API.post('/masters/campuses', data);
export const updateCampus = (id, data) => API.put(`/masters/campuses/${id}`, data);
export const deleteCampus = (id) => API.delete(`/masters/campuses/${id}`);

export const getDepartments = () => API.get('/masters/departments');
export const createDepartment = (data) => API.post('/masters/departments', data);
export const updateDepartment = (id, data) => API.put(`/masters/departments/${id}`, data);
export const deleteDepartment = (id) => API.delete(`/masters/departments/${id}`);

export const getPrograms = () => API.get('/masters/programs');
export const getProgramById = (id) => API.get(`/masters/programs/${id}`);
export const createProgram = (data) => API.post('/masters/programs', data);
export const updateProgram = (id, data) => API.put(`/masters/programs/${id}`, data);
export const deleteProgram = (id) => API.delete(`/masters/programs/${id}`);

// ─── APPLICANTS ──────────────────────────────────────────
export const getApplicants = (params) => API.get('/applicants', { params });
export const getApplicantById = (id) => API.get(`/applicants/${id}`);
export const createApplicant = (data) => API.post('/applicants', data);
export const updateApplicant = (id, data) => API.put(`/applicants/${id}`, data);
export const updateDocumentStatus = (id, status) => API.put(`/applicants/${id}/documents`, { documentStatus: status });
export const updateFeeStatus = (id, status) => API.put(`/applicants/${id}/fee`, { feeStatus: status });
export const allocateSeat = (id, programId) => API.post(`/applicants/${id}/allocate`, { programId });
export const confirmAdmission = (id) => API.post(`/applicants/${id}/confirm`);
export const deleteApplicant = (id) => API.delete(`/applicants/${id}`);

// ─── DASHBOARD ───────────────────────────────────────────
export const getDashboard = () => API.get('/dashboard');
