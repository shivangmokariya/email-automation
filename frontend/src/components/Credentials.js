import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Mail, Trash2, X } from 'lucide-react';

// Modal component for adding/editing credentials
const CredentialModal = ({ isOpen, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({ name: '', email: '', appPassword: '', provider: 'gmail' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-xs sm:max-w-md m-2 sm:m-4">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Add New Credential</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-foreground">
            <X className="h-6 w-6 text-text-secondary" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Display Name</label>
            <input type="text" name="name" onChange={handleChange} placeholder="e.g., Work Gmail" required className="w-full p-2 bg-foreground border border-border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
            <input type="email" name="email" onChange={handleChange} placeholder="your.email@gmail.com" required className="w-full p-2 bg-foreground border border-border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">App Password</label>
            <input type="password" name="appPassword" onChange={handleChange} placeholder="16-digit app password" required className="w-full p-2 bg-foreground border border-border rounded-md" />
            <p className="text-xs text-text-secondary mt-1">For Gmail, enable 2FA and generate an app password.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Provider</label>
            <select name="provider" value={formData.provider} onChange={handleChange} required className="w-full p-2 bg-foreground border border-border rounded-md">
              <option value="gmail">gmail</option>
              <option value="outlook">outlook</option>
              <option value="yahoo">yahoo</option>
              <option value="other">other</option>
            </select>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="bg-foreground px-4 py-2 rounded-lg hover:bg-border">Cancel</button>
            <button type="submit" disabled={loading} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Credential'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Credentials = () => {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/credentials');
      setCredentials(data.data);
    } catch (error) {
      toast.error('Failed to fetch credentials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleSave = async (formData) => {
    const toastId = toast.loading('Saving credential...');
    try {
      await api.post('/credentials', formData);
      toast.success('Credential saved!', { id: toastId });
      fetchCredentials();
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save.', { id: toastId });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      const toastId = toast.loading('Deleting credential...');
      try {
        await api.delete(`/credentials/${id}`);
        toast.success('Credential deleted.', { id: toastId });
        fetchCredentials();
      } catch (error) {
        toast.error('Failed to delete.', { id: toastId });
      }
    }
  };

  return (
    <div className="p-2 sm:p-4 max-w-full sm:max-w-4xl mx-auto text-text-primary bg-background">
      <Toaster position="bottom-right" />
      <CredentialModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} loading={loading} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Email Credentials</h1>
          <p className="text-text-secondary mt-1 text-sm sm:text-base">Manage your email accounts for sending automated emails.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center">
          <Plus className="h-5 w-5" />
          <span>Add Credential</span>
        </button>
      </div>

      <div className="bg-card p-2 sm:p-4 rounded-2xl shadow-lg">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 px-1 sm:px-2">Your Credentials</h2>
        <div className="space-y-3">
          {loading ? (
            <p>Loading...</p>
          ) : credentials.length === 0 ? (
            <div className="text-center py-8 sm:py-10 text-text-secondary">
              <Mail className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4" />
              <p>No credentials added yet.</p>
            </div>
          ) : (
            credentials.map((cred) => (
              <div key={cred._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-foreground rounded-lg gap-2 sm:gap-0">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="p-2 sm:p-3 bg-primary/10 rounded-full">
                    <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary text-sm sm:text-base md:text-lg">{cred.name}</p>
                    <p className="text-xs sm:text-sm text-text-secondary">{cred.email}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(cred._id)} className="p-2 text-text-secondary hover:text-red-500 rounded-full hover:bg-red-500/10">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Credentials;