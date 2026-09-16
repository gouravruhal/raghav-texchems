import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Settings2,
  Globe,
  PlusCircle,
  FlaskConical,
  MessageSquare,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const AdminSidebar: React.FC = () => {
  const { products, inquiries } = useData();

  const isSubdomain =
    typeof window !== 'undefined' &&
    (window.location.hostname.startsWith('admin.') ||
      window.location.hostname === 'admin.localhost');

  const basePath = isSubdomain ? '' : '/admin';

  const newInquiriesCount = inquiries.filter((i) => i.status === 'New').length;

  const handleLiveSiteClick = (e: React.MouseEvent) => {
    if (isSubdomain) {
      e.preventDefault();
      const mainHost = window.location.host.replace(/^admin\./, '');
      window.location.href = `${window.location.protocol}//${mainHost}/`;
    }
  };

  return (
    <aside className="admin-sidebar-light">
      <div className="admin-sidebar-top">
        <div className="sidebar-section-label">NAVIGATION</div>

        <nav className="admin-sidebar-nav">
          <NavLink
            to={`${basePath}/dashboard`}
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? 'active' : ''}`
            }
            end
          >
            <LayoutDashboard size={17} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to={`${basePath}/products`}
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Package size={17} />
            <span>Product Catalog</span>
            <span className="admin-badge-count">{products.length}</span>
          </NavLink>

          <NavLink
            to={`${basePath}/products/new`}
            className={({ isActive }) =>
              `admin-nav-item admin-nav-subitem ${isActive ? 'active' : ''}`
            }
          >
            <PlusCircle size={15} />
            <span>Add Product</span>
          </NavLink>

          <NavLink
            to={`${basePath}/inquiries`}
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <MessageSquare size={17} />
            <span>Customer RFQs</span>
            {newInquiriesCount > 0 ? (
              <span className="admin-badge-count highlight">
                {newInquiriesCount}
              </span>
            ) : (
              <span className="admin-badge-count">{inquiries.length}</span>
            )}
          </NavLink>

          <NavLink
            to={`${basePath}/settings`}
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Settings2 size={17} />
            <span>Website Content</span>
          </NavLink>
        </nav>
      </div>

      <div className="admin-sidebar-bottom">
        <Link
          to="/"
          onClick={handleLiveSiteClick}
          className="admin-live-site-link"
        >
          <Globe size={16} color="#7F7F7F" />
          <span>View Public Site</span>
        </Link>

        <div className="admin-sidebar-footer">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.2rem',
            }}
          >
            <FlaskConical size={15} color="#4A90E2" />
            <strong style={{ fontSize: '0.8rem', color: '#1e293b' }}>
              Raghav Texchems
            </strong>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#7F7F7F' }}>
            Chemicals Catalog Manager
          </div>
        </div>
      </div>
    </aside>
  );
};
