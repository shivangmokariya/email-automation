import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Mail, Users, FileText, BarChart3, Send, TrendingUp, AlertTriangle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-card rounded-xl shadow-md p-6 flex items-center space-x-4">
    <div className={`p-3 rounded-lg bg-${color}-500/10`}>
      <Icon className={`h-6 w-6 text-${color}-500`} />
    </div>
    <div>
      <p className="text-sm font-medium text-text-secondary">{title}</p>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
    </div>
  </div>
);

const QuickActionCard = ({ title, description, icon: Icon, path, color }) => (
  <Link
    to={path}
    className={`bg-card rounded-xl shadow-md p-6 flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 border-transparent hover:border-${color}-500`}
  >
    <div>
      <div className={`p-3 rounded-lg bg-${color}-500/10 inline-block`}>
        <Icon className={`h-8 w-8 text-${color}-500`} />
      </div>
      <h3 className="font-semibold text-text-primary mt-4">{title}</h3>
      <p className="text-sm text-text-secondary mt-1">{description}</p>
    </div>
    <span className={`text-sm font-medium text-${color}-500 mt-4 self-start`}>
      Get Started &rarr;
    </span>
  </Link>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalEmails: 0, successfulSends: 0, failedSends: 0, activeCampaigns: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axios.get('/campaigns/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);
  
  const quickActions = [
    { title: 'Send Single Email', description: 'Send a personalized email to one recipient.', icon: Mail, path: '/single-email', color: 'blue' },
    { title: 'New Bulk Campaign', description: 'Reach multiple recipients with a campaign.', icon: Users, path: '/bulk-email', color: 'green' },
    { title: 'Manage Templates', description: 'Create and edit your email templates.', icon: FileText, path: '/templates', color: 'purple' },
    { title: 'View Campaigns', description: 'Track your campaign performance.', icon: BarChart3, path: '/campaigns', color: 'orange' },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Welcome back, {user?.name || 'User'}!</h1>
              <p className="text-text-secondary mt-1">Here's a summary of your email activity.</p>
            </div>
            <Link to="/single-email" className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg shadow-sm hover:bg-primary/90 transition-colors">
              New Email
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Emails Sent" value={stats.totalEmails} icon={Send} color="blue" />
            <StatCard title="Successful Sends" value={stats.successfulSends} icon={TrendingUp} color="green" />
            <StatCard title="Failed Sends" value={stats.failedSends} icon={AlertTriangle} color="red" />
            <StatCard title="Active Campaigns" value={stats.activeCampaigns} icon={BarChart3} color="orange" />
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action) => (
                <QuickActionCard key={action.path} {...action} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 