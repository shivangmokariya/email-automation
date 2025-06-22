import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Send } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const toastId = toast.loading('Sending reset link...');

    try {
      const response = await axios.post('/auth/forgot-password', { email });
      toast.success(response.data.message, { id: toastId });
      setMessage('If an account with that email exists, a password reset link has been sent.');
      
      // Reset form after successful request
      setEmail('');
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Toaster position="bottom-right" />
      <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl p-8 lg:p-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-2">Forgot Password?</h2>
          <p className="text-text-secondary mb-8">No worries, we'll send you reset instructions.</p>
        </div>

        {message ? (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-md mb-6 text-center">
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-foreground border border-border rounded-md focus:ring-2 focus:ring-ring focus:outline-none placeholder:text-text-secondary"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              <Send className="inline-block mr-2 h-4 w-4" />
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-text-secondary">
          <Link to="/login" className="font-medium text-primary hover:underline">
            &larr; Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword; 