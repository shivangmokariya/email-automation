import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { Lock, Save, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await api.get(`/auth/validate-reset-token/${token}`);
        if (response.data.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
        }
      } catch (error) {
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    if (token) {
      validateToken();
    } else {
      setValidating(false);
      setTokenValid(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      return toast.error("Passwords do not match.");
    }
    if (password.length < 8) {
      return toast.error("Password must be at least 8 characters long.");
    }

    setLoading(true);
    const toastId = toast.loading('Resetting your password...');

    try {
      await api.patch(`/auth/reset-password/${token}`, { password });
      toast.success('Password has been reset successfully!', { id: toastId });
      
      // Reset form after successful reset
      setPassword('');
      setPasswordConfirm('');
      
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password. The token may be invalid or expired.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl p-8 lg:p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Validating Reset Link</h2>
          <p className="text-text-secondary">Please wait while we verify your reset link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl p-8 lg:p-12 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Invalid or Expired Link</h2>
          <p className="text-text-secondary mb-6">This password reset link is invalid or has expired. Please request a new one.</p>
          <Link 
            to="/forgot-password" 
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Toaster position="bottom-right" />
      <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl p-8 lg:p-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-2">Reset Your Password</h2>
          <p className="text-text-secondary mb-8">Enter a new password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-foreground border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none placeholder:text-text-secondary"
              placeholder="New Password"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-foreground border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none placeholder:text-text-secondary"
              placeholder="Confirm New Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            <Save className="inline-block mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save New Password'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Remembered your password?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword; 