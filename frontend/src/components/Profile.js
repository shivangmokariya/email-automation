import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Camera, Save, XCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const Profile = () => {
    const { user, updateUserContext } = useAuth();
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({ name: user.name, email: user.email });
            if (user.avatar) {
                setAvatarPreview(`http://localhost:5000${user.avatar}`);
            } else {
                setAvatarPreview(`https://ui-avatars.com/api/?name=${user.name}&background=4f46e5&color=fff&size=128`);
            }
        }
    }, [user]);

    const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Updating profile...');
        
        const updateData = new FormData();
        updateData.append('name', formData.name);
        updateData.append('email', formData.email);
        if (avatar) {
            updateData.append('avatar', avatar);
        }

        try {
            const res = await api.put('/user/profile', updateData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateUserContext(res.data.user);
            toast.success('Profile updated successfully!', { id: toastId });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile.', { id: toastId });
        } finally {
            setLoading(false);
        }
    };
    
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword.length < 8) {
            toast.error('New password must be at least 8 characters long.');
            return;
        }
        setLoading(true);
        const toastId = toast.loading('Changing password...');

        try {
            await api.put('/user/change-password', passwordData);
            toast.success('Password changed successfully!', { id: toastId });
            setShowPasswordForm(false);
            setPasswordData({ currentPassword: '', newPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password.', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background min-h-screen">
            <Toaster position="bottom-right" />
            <div className="max-w-full sm:max-w-4xl mx-auto px-2 sm:px-6 lg:px-8 py-6 sm:py-8">
                <h1 className="text-xl sm:text-3xl font-bold text-text-primary">Profile Settings</h1>
                <p className="text-text-secondary mt-1 mb-6 sm:mb-8 text-sm sm:text-base">Manage your account details and password.</p>

                <div className="bg-card p-2 sm:p-8 rounded-2xl shadow-lg">
                    <form onSubmit={handleUpdateProfile} className="space-y-6 sm:space-y-8">
                        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <div className="relative">
                                <img
                                    src={avatarPreview}
                                    alt="Avatar"
                                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover border-4 border-primary/20"
                                />
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer hover:bg-primary/90 transition-transform duration-200 hover:scale-110"
                                >
                                    <Camera size={16} />
                                    <input id="avatar-upload" type="file" className="sr-only" onChange={handleAvatarChange} accept="image/*" />
                                </label>
                            </div>
                            <div className="text-center sm:text-left">
                                <h2 className="text-lg sm:text-2xl font-bold text-text-primary">{user?.name}</h2>
                                <p className="text-text-secondary text-sm sm:text-base">{user?.email}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-base sm:text-lg font-semibold text-text-primary border-b border-border pb-2">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2 sm:pt-4">
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                                    <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Full Name" className="w-full pl-10 pr-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                                    <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="Email Address" className="w-full pl-10 pr-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end">
                            <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center">
                                <Save className="inline-block mr-2 h-4 w-4" />
                                {loading && !passwordData.currentPassword ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>

                    <div className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-border">
                        <h3 className="text-base sm:text-lg font-semibold text-text-primary">Change Password</h3>
                        {!showPasswordForm ? (
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-2 sm:gap-0">
                                <p className="text-text-secondary text-xs sm:text-sm">Update your password for enhanced security.</p>
                                <button onClick={() => setShowPasswordForm(true)} className="px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-border transition-colors w-full sm:w-auto mt-2 sm:mt-0">
                                    Change Password
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                                        <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} placeholder="Current Password" required className="w-full pl-10 pr-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"/>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                                        <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} placeholder="New Password" required className="w-full pl-10 pr-3 py-2 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"/>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                                    <button type="button" onClick={() => setShowPasswordForm(false)} className="px-4 py-2 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-border transition-colors flex items-center w-full sm:w-auto">
                                        <XCircle className="inline-block mr-2 h-4 w-4" />
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center w-full sm:w-auto">
                                        {loading && passwordData.currentPassword ? 'Saving...' : 'Save New Password'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile; 