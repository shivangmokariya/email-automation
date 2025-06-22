import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import SingleEmail from './components/SingleEmail';
import BulkEmail from './components/BulkEmail';
import Campaigns from './components/Campaigns';
import Templates from './components/Templates';
import Profile from './components/Profile';
import Credentials from './components/Credentials';
import ResetPassword from './components/ResetPassword';
import CustomEmail from './components/CustomEmail';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col h-screen bg-background text-text-primary">
            <Navbar />
            <main className="flex-grow overflow-auto">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                
                {/* Protected routes */}
                <Route path="/" element={<ProtectedRoute />}>
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="single-email" element={<SingleEmail />} />
                  <Route path="bulk-email" element={<BulkEmail />} />
                  <Route path="campaigns" element={<Campaigns />} />
                  <Route path="templates" element={<Templates />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="credentials" element={<Credentials />} />
                  <Route path="custom-email" element={<CustomEmail />} />
                </Route>
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 