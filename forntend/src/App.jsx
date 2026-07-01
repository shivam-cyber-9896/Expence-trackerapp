import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Claims from './pages/Claims';
import Budgets from './pages/Budgets';
import Departments from './pages/Departments';
import Employees from './pages/Employees';
import Categories from './pages/Categories';
import ClaimReview from './pages/ClaimReview';
import MonthlySummary from './pages/MonthlySummary';
import Settings from './pages/Settings';
import Unauthorized from './pages/Unauthorized';

// Layout wrapper for authenticated pages
const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="content-wrapper" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar collapsed={collapsed} />
        <main className="main-content" style={{ flex: 1, overflowY: 'auto', padding: '30px', backgroundColor: 'var(--bg-app)' }}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

// Import useState from react in layout wrapper
import { useState } from 'react';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes (Requires Authentication) */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/claims" element={<Claims />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Manager and Admin Only Routes */}
            <Route 
              path="/budgets" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <Budgets />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/reviews" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <ClaimReview />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/monthly-summary" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <MonthlySummary />
                </ProtectedRoute>
              } 
            />

            {/* Admin Only Routes */}
            <Route 
              path="/departments" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <Departments />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/employees" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <Employees />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/categories" 
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <Categories />
                </ProtectedRoute>
              } 
            />

            {/* Fallbacks */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Global Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
