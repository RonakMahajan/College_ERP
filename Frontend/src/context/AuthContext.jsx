import { createContext, useContext, useState } from 'react';
import { login as loginAPI } from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('erp_user')) || null;
    } catch {
      return null;
    }
  });

  const login = async (email, password) => {
    const { data } = await loginAPI({ email, password });
    setUser(data);
    localStorage.setItem('erp_user', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('erp_user');
  };

  const isAdmin = user?.role === 'admin';
  const isOfficer = user?.role === 'admission_officer';
  const isManagement = user?.role === 'management';
  const canWrite = isAdmin || isOfficer;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isOfficer, isManagement, canWrite }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
