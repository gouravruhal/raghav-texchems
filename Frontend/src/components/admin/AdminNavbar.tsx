import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  LogOut,
  Globe,
  User,
} from 'lucide-react';

export const AdminNavbar: React.FC = () => {
  const {
    user,
    adminProfile,
    signOut,
  } = useAuth();
  const { companySettings } = useData();

  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const isSubdomain =
    typeof window !== 'undefined' &&
    (window.location.hostname.startsWith('admin.') ||
      window.location.hostname === 'admin.localhost');

  const handleViewWebsite = (e: React.MouseEvent) => {
    if (isSubdomain) {
      e.preventDefault();
      const mainHost = window.location.host.replace(/^admin\./, '');
      window.location.href = `${window.location.protocol}//${mainHost}/`;
    }
  };

  return (
    <header className="admin-navbar-light">
      <div className="admin-navbar-brand">
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '0.75rem' }}>
          <img
            src={companySettings.logoUrl || '/logo.png'}
            alt={companySettings.companyName || 'Raghav Texchems Chemical Pvt. Ltd.'}
            style={{ maxHeight: '34px', width: 'auto', objectFit: 'contain' }}
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.endsWith('/logo.png')) {
                target.src = '/logo.png';
              }
            }}
          />
        </div>

        <div>
          <div className="admin-brand-title">
            Raghav Texchems <span>Admin</span>
          </div>
          <div className="admin-brand-subtitle">
            Management Portal
          </div>
        </div>
      </div>

      <div className="admin-navbar-actions">
        <Link
          to="/"
          onClick={handleViewWebsite}
          className="admin-secondary-btn"
          title="View public website"
        >
          <Globe size={15} color="#7F7F7F" />
          <span>Live Site</span>
        </Link>

        <div className="admin-user-badge">
          <div className="user-avatar-circle">
            <User size={15} color="#4A90E2" />
          </div>

          <div className="user-info">
            <span className="user-name">
              {user?.email || 'Administrator'}
            </span>
            <span className="user-role">
              {adminProfile?.role || 'Admin'}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="admin-logout-btn"
          onClick={handleLogout}
          title="Sign out"
        >
          <LogOut size={15} />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  );
};