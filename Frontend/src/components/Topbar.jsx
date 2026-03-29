import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/applicants': 'Applicants',
  '/programs': 'Seat Matrix',
  '/masters/institutions': 'Institutions',
  '/masters/campuses': 'Campuses',
  '/masters/departments': 'Departments',
  '/masters/programs': 'Programs',
  '/users': 'User Management',
};

export default function Topbar() {
  const { user, isManagement } = useAuth();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'College ERP';

  // Override display names by role
  const displayName =
    user?.role === 'admin' ? 'Admin' :
    user?.role === 'management' ? 'Management' :
    user?.name;

  return (
    <div className="topbar">
      <h1>{title}</h1>
      <div className="topbar-right">
        {displayName && (
          <span style={{ fontSize: '0.875rem', color: '#fff' }}>
            {displayName}
          </span>
        )}
      </div>
    </div>
  );
}
