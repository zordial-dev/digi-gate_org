import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';

import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import Dashboard from '@/pages/Dashboard';
import Visitors from '@/pages/Visitors';
import Visits from '@/pages/Visits';
import Hosts from '@/pages/Hosts';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Organisation Routes */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/*"
                element={
                  <div className="flex min-h-screen bg-gray-50">
                    <Sidebar />
                    <div className="flex-1">
                      <Header />
                      <main className="p-6">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/visitors" element={<Visitors />} />
                          <Route path="/visits" element={<Visits />} />
                          <Route path="/hosts" element={<Hosts />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                }
              />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;