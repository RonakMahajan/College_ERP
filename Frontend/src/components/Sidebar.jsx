import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'admission_officer', 'management'] },
  { path: '/applicants', label: 'Applicants', icon: '👤', roles: ['admin', 'admission_officer', 'management'] },
  { path: '/programs', label: 'Seat Matrix', icon: '📋', roles: ['admin', 'admission_officer', 'management'] },
];

const masterItems = [
  { path: '/masters/institutions', label: 'Institutions', icon: '🏛️', roles: ['admin'] },
  { path: '/masters/campuses', label: 'Campuses', icon: '🏫', roles: ['admin'] },
  { path: '/masters/departments', label: 'Departments', icon: '🔬', roles: ['admin'] },
  { path: '/masters/programs', label: 'Programs', icon: '🎓', roles: ['admin'] },
  { path: '/users', label: 'Users', icon: '👥', roles: ['admin'] },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filterByRole = (items) => items.filter(i => i.roles.includes(user?.role));

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>🎓 College ERP</h2>
        <span>Admission Management</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>
        {filterByRole(navItems).map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="nav-section-label" style={{ marginTop: '12px' }}>Masters Setup</div>
            {filterByRole(masterItems).map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role?.replace('_', ' ')}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">↩</button>
        </div>
      </div>
    </aside>
  );
}
