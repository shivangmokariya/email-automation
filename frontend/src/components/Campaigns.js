import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { BarChart3, Mail, CheckCircle, TrendingUp, Users, Clock } from 'lucide-react';

const CampaignDetails = ({ campaign }) => {
  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-card rounded-2xl shadow-lg">
        <BarChart3 className="h-16 w-16 text-text-secondary mb-4" />
        <h3 className="text-xl font-semibold text-text-primary">Select a campaign</h3>
        <p className="text-text-secondary mt-1">Choose a campaign from the list to view its detailed performance and recipient status.</p>
      </div>
    );
  }

  const successRate = campaign.totalRecipients > 0 ? ((campaign.sentCount / campaign.totalRecipients) * 100).toFixed(0) : 0;

  return (
    <div className="bg-card rounded-2xl shadow-lg p-8 h-full">
      <h2 className="text-2xl font-bold text-text-primary mb-2">{campaign.name}</h2>
      <p className="text-text-secondary mb-1">Subject: {campaign.subject}</p>
      <p className="text-text-secondary mb-6">Created on: {new Date(campaign.createdAt).toLocaleDateString()}</p>
      
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-foreground p-4 rounded-lg">
          <p className="text-sm text-text-secondary">Total Recipients</p>
          <p className="text-2xl font-bold">{campaign.totalRecipients}</p>
        </div>
        <div className="bg-foreground p-4 rounded-lg">
          <p className="text-sm text-text-secondary">Success Rate</p>
          <p className="text-2xl font-bold">{successRate}%</p>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-text-primary mb-4">Recipients</h3>
      <div className="overflow-y-auto max-h-96 pr-2">
        <ul className="space-y-3">
          {campaign.recipients.map((recipient) => (
            <li key={recipient._id} className="flex items-center justify-between bg-foreground p-3 rounded-lg">
              <div>
                <p className="font-medium text-text-primary">{recipient.email}</p>
                <p className="text-sm text-text-secondary">{recipient.name || 'N/A'}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                recipient.status === 'sent' ? 'bg-green-500/10 text-green-400' :
                recipient.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                'bg-yellow-500/10 text-yellow-400'
              }`}>
                {recipient.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const Campaigns = () => {
  const [stats, setStats] = useState({ totalCampaigns: 0, totalEmails: 0, successfulSends: 0, failedSends: 0 });
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const statsPromise = api.get('/campaigns/stats');
        const campaignsPromise = api.get('/campaigns');
        
        const [statsRes, campaignsRes] = await Promise.all([statsPromise, campaignsPromise]);
        
        setStats(statsRes.data);
        setCampaigns(campaignsRes.data.data);
        
      } catch (error) {
        console.error("Failed to fetch campaign data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const successRate = stats.totalEmails > 0 ? ((stats.successfulSends / stats.totalEmails) * 100).toFixed(0) : 0;

  const StatCard = ({ title, value, icon: Icon }) => (
    <div className="bg-card p-6 rounded-2xl shadow-lg flex items-center space-x-4">
      <div className="bg-primary/10 p-3 rounded-lg">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Email Campaigns</h1>
        <p className="text-text-secondary mt-1">Track your email campaign performance and results.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Campaigns" value={stats.totalCampaigns} icon={BarChart3} />
        <StatCard title="Total Emails Sent" value={stats.successfulSends} icon={Mail} />
        <StatCard title="Success Rate" value={`${successRate}%`} icon={CheckCircle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold text-text-primary">Recent Campaigns</h2>
          <div className="bg-card rounded-2xl shadow-lg p-4 space-y-3 max-h-[600px] overflow-y-auto">
            {campaigns.map((campaign) => (
              <div
                key={campaign._id}
                onClick={() => setSelectedCampaign(campaign)}
                className={`p-4 rounded-lg cursor-pointer border-2 ${selectedCampaign?._id === campaign._id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-foreground'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-text-primary truncate pr-2">{campaign.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                    campaign.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                    campaign.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mb-3">{new Date(campaign.createdAt).toLocaleDateString()}</p>
                <div className="flex items-center justify-between text-sm text-text-secondary">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{campaign.totalRecipients} recipients</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>{campaign.sentCount} sent</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <CampaignDetails campaign={selectedCampaign} />
        </div>
      </div>
    </div>
  );
};

export default Campaigns; 