import { createContext, useContext, useState, useCallback } from 'react';
import {
  getPrograms, getProgramById, createProgram,
  updateProgram, deleteProgram,
  getInstitutions, createInstitution, updateInstitution, deleteInstitution,
  getCampuses, createCampus, updateCampus, deleteCampus,
  getDepartments, createDepartment, updateDepartment, deleteDepartment
} from '../api/api';

const MasterContext = createContext();

export const MasterProvider = ({ children }) => {
  const [institutions, setInstitutions] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─── Institutions ──────────────────────────────────────────
  const fetchInstitutions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getInstitutions();
      setInstitutions(data);
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setLoading(false); }
  }, []);

  const addInstitution = async (payload) => {
    const { data } = await createInstitution(payload);
    setInstitutions(prev => [data, ...prev]);
    return data;
  };

  const editInstitution = async (id, payload) => {
    const { data } = await updateInstitution(id, payload);
    setInstitutions(prev => prev.map(i => i._id === id ? data : i));
    return data;
  };

  const removeInstitution = async (id) => {
    await deleteInstitution(id);
    setInstitutions(prev => prev.filter(i => i._id !== id));
  };

  // ─── Campuses ──────────────────────────────────────────────
  const fetchCampuses = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getCampuses();
      setCampuses(data);
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setLoading(false); }
  }, []);

  const addCampus = async (payload) => {
    const { data } = await createCampus(payload);
    setCampuses(prev => [data, ...prev]);
    return data;
  };

  const editCampus = async (id, payload) => {
    const { data } = await updateCampus(id, payload);
    setCampuses(prev => prev.map(c => c._id === id ? data : c));
    return data;
  };

  const removeCampus = async (id) => {
    await deleteCampus(id);
    setCampuses(prev => prev.filter(c => c._id !== id));
  };

  // ─── Departments ───────────────────────────────────────────
  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getDepartments();
      setDepartments(data);
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setLoading(false); }
  }, []);

  const addDepartment = async (payload) => {
    const { data } = await createDepartment(payload);
    setDepartments(prev => [data, ...prev]);
    return data;
  };

  const editDepartment = async (id, payload) => {
    const { data } = await updateDepartment(id, payload);
    setDepartments(prev => prev.map(d => d._id === id ? data : d));
    return data;
  };

  const removeDepartment = async (id) => {
    await deleteDepartment(id);
    setDepartments(prev => prev.filter(d => d._id !== id));
  };

  // ─── Programs ──────────────────────────────────────────────
  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getPrograms();
      setPrograms(data);
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setLoading(false); }
  }, []);

  const addProgram = async (payload) => {
    const { data } = await createProgram(payload);
    setPrograms(prev => [data, ...prev]);
    return data;
  };

  const editProgram = async (id, payload) => {
    const { data } = await updateProgram(id, payload);
    setPrograms(prev => prev.map(p => p._id === id ? data : p));
    return data;
  };

  const removeProgram = async (id) => {
    await deleteProgram(id);
    setPrograms(prev => prev.filter(p => p._id !== id));
  };

  return (
    <MasterContext.Provider value={{
      institutions, campuses, departments, programs,
      loading, error,
      fetchInstitutions, addInstitution, editInstitution, removeInstitution,
      fetchCampuses, addCampus, editCampus, removeCampus,
      fetchDepartments, addDepartment, editDepartment, removeDepartment,
      fetchPrograms, addProgram, editProgram, removeProgram
    }}>
      {children}
    </MasterContext.Provider>
  );
};

export const useMaster = () => useContext(MasterContext);
