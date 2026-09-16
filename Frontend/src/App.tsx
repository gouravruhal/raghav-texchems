import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import { AdminAuthGuard } from './pages/admin/AdminAuthGuard';

import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

import { AdminNavbar } from './components/admin/AdminNavbar';
import { AdminSidebar } from './components/admin/AdminSidebar';

import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminAddProductPage } from './pages/admin/AdminAddProductPage';
import { AdminInquiriesPage } from './pages/admin/AdminInquiriesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminMfaSetupPage } from './pages/admin/AdminMfaSetupPage';

const isAdminSubdomain = (): boolean => {
  const hostname = window.location.hostname.toLowerCase();

  return (
    hostname.startsWith('admin.') ||
    hostname === 'admin.localhost'
  );
};

/* ================================================================
   ADMIN PORTAL
   ================================================================ */

const AdminPortal: React.FC = () => {
  const isSubdomain = isAdminSubdomain();

  return (
    <AdminAuthGuard>
      <div className="admin-app-layout">

        <AdminNavbar />

        <div className="admin-body-layout">

          <AdminSidebar />

          <main className="admin-main-content">

            <Routes>

              {isSubdomain ? (
                <>
                  <Route
                    path="/"
                    element={
                      <Navigate
                        to="/dashboard"
                        replace
                      />
                    }
                  />

                  <Route
                    path="/dashboard"
                    element={<AdminDashboardPage />}
                  />

                  <Route
                    path="/products"
                    element={<AdminProductsPage />}
                  />

                  <Route
                    path="/products/new"
                    element={<AdminAddProductPage />}
                  />

                  <Route
                    path="/products/:id/edit"
                    element={<AdminAddProductPage />}
                  />

                  <Route
                    path="/inquiries"
                    element={<AdminInquiriesPage />}
                  />

                  <Route
                    path="/settings"
                    element={<AdminSettingsPage />}
                  />

                  <Route
                    path="*"
                    element={
                      <Navigate
                        to="/dashboard"
                        replace
                      />
                    }
                  />
                </>
              ) : (
                <>
                  <Route
                    path="/admin"
                    element={
                      <Navigate
                        to="/admin/dashboard"
                        replace
                      />
                    }
                  />

                  <Route
                    path="/admin/dashboard"
                    element={<AdminDashboardPage />}
                  />

                  <Route
                    path="/admin/products"
                    element={<AdminProductsPage />}
                  />

                  <Route
                    path="/admin/products/new"
                    element={<AdminAddProductPage />}
                  />

                  <Route
                    path="/admin/products/:id/edit"
                    element={<AdminAddProductPage />}
                  />

                  <Route
                    path="/admin/inquiries"
                    element={<AdminInquiriesPage />}
                  />

                  <Route
                    path="/admin/settings"
                    element={<AdminSettingsPage />}
                  />

                  <Route
                    path="*"
                    element={
                      <Navigate
                        to="/admin/dashboard"
                        replace
                      />
                    }
                  />
                </>
              )}

            </Routes>

          </main>

        </div>

      </div>
    </AdminAuthGuard>
  );
};

/* ================================================================
   PUBLIC WEBSITE
   ================================================================ */

const PublicPortal: React.FC = () => {
  return (
    <div className="app-container">

      <Navbar />

      <main>

        <Routes>

          <Route
            path="/"
            element={<HomePage />}
          />

          <Route
            path="/products"
            element={<ProductsPage />}
          />

          <Route
            path="/about"
            element={<AboutPage />}
          />

          <Route
            path="/contact"
            element={<ContactPage />}
          />

          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>

      </main>

      <Footer />

    </div>
  );
};

/* ================================================================
   MAIN CONTENT
   ================================================================ */

const MainContent: React.FC = () => {
  const location = useLocation();

  /*
   * MFA setup must remain accessible after
   * password authentication but before MFA enrollment.
   */
  if (location.pathname === '/admin/setup-mfa') {
    return <AdminMfaSetupPage />;
  }

  /*
   * MFA verification page.
   *
   * AdminMfaPage itself will be shown by AdminAuthGuard
   * when the user is authenticated but has not reached AAL2.
   */
  const adminSubdomain = isAdminSubdomain();

  const adminPath =
    location.pathname === '/admin' ||
    location.pathname.startsWith('/admin/');

  if (adminSubdomain || adminPath) {
    return <AdminPortal />;
  }

  return <PublicPortal />;
};

/* ================================================================
   APP
   ================================================================ */

export default function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <DataProvider>

          <MainContent />

        </DataProvider>

      </AuthProvider>

    </BrowserRouter>
  );
}