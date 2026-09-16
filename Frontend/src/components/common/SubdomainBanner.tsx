import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Globe, ShieldCheck, ArrowRight } from 'lucide-react';

export const SubdomainBanner: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
  const isAdmin = hostname.startsWith('admin.') || hostname === 'admin.localhost';

  const handleSwitchToAdmin = () => {
    if (window.location.hostname === 'localhost') {
      window.location.href = `${window.location.protocol}//admin.localhost:${window.location.port}/dashboard`;
    } else {
      window.location.href = '/admin/dashboard';
    }
  };

  const handleSwitchToMain = () => {
    if (window.location.hostname === 'admin.localhost') {
      window.location.href = `${window.location.protocol}//localhost:${window.location.port}/`;
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="subdomain-banner">
      <div className="subdomain-banner-content">
        <div className="subdomain-info">
          {isAdmin ? (
            <>
              <span className="subdomain-badge admin">
                <ShieldCheck size={14} /> ADMIN PORTAL (admin.raghavtexchems.com)
              </span>
              <span className="subdomain-text">
                Control Center {isAuthenticated ? `| Logged in as ${user?.email || 'Admin'}` : '| Login Required'}
              </span>
            </>
          ) : (
            <>
              <span className="subdomain-badge public">
                <Globe size={14} /> PUBLIC PORTAL (raghavtexchems.com)
              </span>
              <span className="subdomain-text">
                Official Company Website & Product Catalog
              </span>
            </>
          )}
        </div>

        <div className="subdomain-actions">
          {!isAdmin ? (
            <button
              type="button"
              className="subdomain-switch-btn"
              onClick={handleSwitchToAdmin}
              title="Switch to Admin Subdomain"
            >
              <ShieldCheck size={14} /> Switch to Admin Portal <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              className="subdomain-switch-btn"
              onClick={handleSwitchToMain}
              title="Back to Main Public Site"
            >
              <Globe size={14} /> View Live Public Site <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
