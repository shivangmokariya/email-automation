import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggleButton from './ThemeToggleButton';
import { Menu, X, Bot } from 'lucide-react';
import Logo from '../assets/logo.svg';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!user) {
    return null; // Don't show navbar for unauthenticated users
  }

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: <Bot className="h-4 w-4 mr-1" /> },
    { path: '/chat-ai', label: 'AI Chat', icon: <Bot className="h-4 w-4 mr-1" /> },
    { path: '/single-email', label: 'Single Email' },
    { path: '/bulk-email', label: 'Bulk Email' },
    { path: '/custom-email', label: 'Custom Email' },
    { path: '/campaigns', label: 'Campaigns' },
    { path: '/templates', label: 'Templates' },
    { path: '/credentials', label: 'Credentials' },
  ];

  return (
    <nav className="bg-foreground shadow-sm border-b border-border relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center flex-1">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center gap-2">
              <img src={Logo} alt="App Logo" className="h-8 w-8" />
              <span className="text-xl font-bold text-primary">Email Automation</span>
            </Link>
            {/* Desktop Nav Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'border-primary text-text-primary'
                      : 'border-transparent text-text-secondary hover:border-gray-300 dark:hover:border-gray-700 hover:text-text-primary'
                  }`}
                >
                  {link.icon && link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          {/* Desktop Profile/Theme */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <ThemeToggleButton />
            <div className="relative">
              <div>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="max-w-xs bg-foreground flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                >
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-sm font-medium text-secondary-foreground">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                </button>
              </div>
              {isProfileOpen && (
                <div 
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card ring-1 ring-black ring-opacity-5 focus:outline-none"
                  onMouseLeave={() => setIsProfileOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-text-primary">{user.name}</p>
                    <p className="text-xs text-text-secondary truncate">{user.email}</p>
                  </div>
                  <ul className="py-1">
                    <li>
                      <Link
                        to="/profile"
                        className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Profile Settings
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-primary hover:text-primary-foreground"
                      >
                        Sign out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          {/* Mobile Hamburger */}
          <div className="flex sm:hidden items-center">
            <ThemeToggleButton />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="ml-2 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-foreground border-t border-border px-4 pb-4 pt-2 space-y-2">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-text-secondary hover:bg-border hover:text-text-primary'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.icon && link.icon}
              {link.label}
            </Link>
          ))}
          <div className="border-t border-border pt-2 mt-2">
            <button
              onClick={() => { setIsProfileOpen(!isProfileOpen); setMobileMenuOpen(false); }}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-text-primary hover:bg-border"
            >
              <span>Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-border"
            >
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;