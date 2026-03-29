import { createContext, useContext, useState, useCallback } from "react";
import {
  getApplicants,
  getApplicantById,
  createApplicant,
  updateApplicant,
  updateDocumentStatus,
  updateFeeStatus,
  allocateSeat,
  confirmAdmission,
  deleteApplicant,
} from "../api/api";

const ApplicantContext = createContext();

export const ApplicantProvider = ({ children }) => {
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch list with optional filters
  const fetchApplicants = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getApplicants(filters);
      setApplicants(data);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single applicant by ID
  const fetchApplicantById = useCallback(async (id) => {
    setDetailLoading(true);
    try {
      const { data } = await getApplicantById(id);
      setSelectedApplicant(data);
      return data;
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Create new applicant and prepend to list
  const addApplicant = async (payload) => {
    const { data } = await createApplicant(payload);
    setApplicants((prev) => [data, ...prev]);
    return data;
  };

  // Update applicant in list + selected
  const editApplicant = async (id, payload) => {
    const { data } = await updateApplicant(id, payload);
    setApplicants((prev) => prev.map((a) => (a._id === id ? data : a)));
    if (selectedApplicant?._id === id) setSelectedApplicant(data);
    return data;
  };

  // Update document status
  const updateDocs = async (id, status) => {
    const { data } = await updateDocumentStatus(id, status);
    setApplicants((prev) =>
      prev.map((a) => (a._id === id ? { ...a, documentStatus: status } : a)),
    );
    if (selectedApplicant?._id === id) setSelectedApplicant(data);
    return data;
  };

  // Update fee status
  const updateFee = async (id, status) => {
    const { data } = await updateFeeStatus(id, status);
    setApplicants((prev) =>
      prev.map((a) => (a._id === id ? { ...a, feeStatus: status } : a)),
    );
    if (selectedApplicant?._id === id) setSelectedApplicant(data);
    return data;
  };

  // Allocate seat — reload applicant detail to get fresh data
  const allocate = async (id, programId) => {
    const { data } = await allocateSeat(id, programId);
    setApplicants((prev) =>
      prev.map((a) =>
        a._id === id
          ? {
              ...a,
              admissionStatus: "Allocated",
              program: data.applicant.program,
            }
          : a,
      ),
    );
    if (selectedApplicant?._id === id) setSelectedApplicant(data.applicant);
    return data;
  };

  // Confirm admission — generates admission number
  const confirm = async (id) => {
    const { data } = await confirmAdmission(id);
    setApplicants((prev) =>
      prev.map((a) =>
        a._id === id
          ? {
              ...a,
              admissionStatus: "Confirmed",
              admissionNumber: data.admissionNumber,
            }
          : a,
      ),
    );
    if (selectedApplicant?._id === id) setSelectedApplicant(data.applicant);
    return data;
  };

  // Remove applicant
  const removeApplicant = async (id) => {
    await deleteApplicant(id);
    setApplicants((prev) => prev.filter((a) => a._id !== id));
    if (selectedApplicant?._id === id) setSelectedApplicant(null);
  };

  return (
    <ApplicantContext.Provider
      value={{
        applicants,
        selectedApplicant,
        loading,
        detailLoading,
        error,
        fetchApplicants,
        fetchApplicantById,
        addApplicant,
        editApplicant,
        updateDocs,
        updateFee,
        allocate,
        confirm,
        removeApplicant,
        setSelectedApplicant,
      }}
    >
      {children}
    </ApplicantContext.Provider>
  );
};

export const useApplicant = () => useContext(ApplicantContext);
