import React, { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Mail, Type, Send, File as FileIcon, User, Eye, X, Sparkles } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import CustomSelect from './CustomSelect';

const CustomEmail = () => {
  const { user } = useAuth();
  const [sendMode, setSendMode] = useState('single'); // 'single' or 'bulk'
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    content: '',
    credentialId: '',
    campaignName: '', // For bulk mode
  });
  const [credentials, setCredentials] = useState([]);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailList, setEmailList] = useState([]); // For bulk mode - array of emails
  const [currentEmail, setCurrentEmail] = useState(''); // For bulk mode - current email input
  const [aiLoading, setAiLoading] = useState(false);

  const credentialOptions = useMemo(() => credentials.map(c => ({ value: c._id, label: c.email })), [credentials]);

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const credentialsRes = await api.get('/credentials');
        setCredentials(credentialsRes.data.data);
        if (credentialsRes.data.data.length > 0) {
          setFormData(prev => ({ ...prev, credentialId: credentialsRes.data.data[0]._id }));
        }
      } catch (error) {
        toast.error('Failed to load credentials.');
      }
    };
    fetchCredentials();
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'resume') {
      setResume(e.target.files[0]);
    }
  };

  // Handle email input for bulk mode
  const handleEmailInput = (e) => {
    setCurrentEmail(e.target.value);
  };

  // Add email to list when Enter is pressed
  const handleEmailKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail();
    }
  };

  // Add email to the list
  const addEmail = () => {
    const email = currentEmail.trim();
    if (email && email.includes('@') && !emailList.includes(email)) {
      setEmailList(prev => [...prev, email]);
      setCurrentEmail('');
    } else if (emailList.includes(email)) {
      toast.error('This email is already in the list.');
    }
  };

  // Remove email from list
  const removeEmail = (emailToRemove) => {
    setEmailList(prev => prev.filter(email => email !== emailToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Sending email(s)...');

    const emailData = new FormData();
    emailData.append('subject', formData.subject);
    emailData.append('content', formData.content);
    emailData.append('credentialId', formData.credentialId);
    if (resume) {
      emailData.append('resume', resume);
    }

    try {
      if (sendMode === 'single') {
        emailData.append('to', formData.to);
        await api.post('/emails/send-single', emailData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else { // bulk mode
        if (emailList.length === 0) {
          toast.error('Please add at least one recipient email address.', { id: toastId });
          setLoading(false);
          return;
        }
        emailData.append('campaignName', formData.campaignName);
        emailData.append('recipients', emailList.join('\n'));
        await api.post('/emails/send-bulk', emailData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      toast.success(`Email${sendMode === 'bulk' ? 's' : ''} sent successfully!`, { id: toastId });
      // Reset form
      setFormData({
        to: '',
        subject: '',
        content: '',
        credentialId: credentials.length > 0 ? credentials[0]._id : '',
        campaignName: '',
      });
      setResume(null);
      setEmailList([]);
      setCurrentEmail('');
      
      // Reset file inputs
      const resumeInput = document.getElementById('resume-custom');
      if (resumeInput) resumeInput.value = '';

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send email(s).', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Handler for AI Personalization
  const handleAIPersonalize = async () => {
    setAiLoading(true);
    try {
      const res = await api.post('/emails/ai/personalize-email', { ...formData });
      setFormData(prev => ({ ...prev, content: res.data.content }));
      setAiLoading(false);
    } catch (e) {
      setAiLoading(false);
      toast.error('AI personalization failed.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col min-h-0">
      <Toaster position="bottom-right" />
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Custom Email</h1>
        <p className="text-text-secondary mt-1">Compose and send an email from scratch, one by one or in bulk.</p>
      </div>
      
      {/* Mode Toggle */}
      <div className="flex bg-foreground rounded-lg p-1 w-full max-w-xs mx-auto">
        <button
          onClick={() => setSendMode('single')}
          className={`w-1/2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${sendMode === 'single' ? 'bg-primary text-primary-foreground' : 'text-text-secondary hover:bg-card'}`}
        >
          Single Email
        </button>
        <button
          onClick={() => setSendMode('bulk')}
          className={`w-1/2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${sendMode === 'bulk' ? 'bg-primary text-primary-foreground' : 'text-text-secondary hover:bg-card'}`}
        >
          Bulk Email
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1 min-h-0">
        {/* Left Column: Form Fields */}
        <div className="bg-card p-8 rounded-2xl shadow-lg space-y-6 flex-1 min-h-0 flex flex-col">
          <h2 className="text-xl font-semibold text-text-primary border-b border-border pb-3">Email Details</h2>
          
          {sendMode === 'single' ? (
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
              <input id="to" name="to" type="email" placeholder="Recipient's Email Address" value={formData.to} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 bg-foreground border border-border rounded-lg" />
            </div>
          ) : (
            <>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                <input id="campaignName" name="campaignName" type="text" placeholder="Campaign Name" value={formData.campaignName} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 bg-foreground border border-border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Recipients</label>
                <div className="space-y-3">
                  {/* Email input */}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                    <input
                      type="email"
                      placeholder="Enter email address and press Enter"
                      value={currentEmail}
                      onChange={handleEmailInput}
                      onKeyPress={handleEmailKeyPress}
                      className="w-full pl-10 pr-3 py-2 bg-foreground border border-border rounded-lg"
                    />
                  </div>
                  
                  {/* Email tags */}
                  {emailList.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {emailList.map((email, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                        >
                          <span>{email}</span>
                          <button
                            type="button"
                            onClick={() => removeEmail(email)}
                            className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-text-secondary">
                    Press Enter or comma to add email • {emailList.length} recipient{emailList.length !== 1 ? 's' : ''} added
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="relative">
            <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
            <input id="subject" name="subject" type="text" placeholder="Email Subject" value={formData.subject} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 bg-foreground border border-border rounded-lg" />
          </div>

          <CustomSelect
            value={formData.credentialId}
            onChange={(value) => setFormData(prev => ({ ...prev, credentialId: value }))}
            options={credentialOptions}
            placeholder="-- Select Sending Email --"
            icon={User}
          />
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Resume (Optional)</label>
            <div className="relative border-2 border-dashed border-border rounded-lg p-6 text-center">
                <FileIcon className="mx-auto h-12 w-12 text-text-secondary" />
                <label htmlFor="resume-custom" className="mt-4 text-sm font-medium text-primary hover:underline cursor-pointer">
                    {resume ? 'Change file' : 'Upload a file'}
                </label>
                <input id="resume-custom" name="resume" type="file" onChange={handleFileChange} className="sr-only" />
                <p className="mt-1 text-xs text-text-secondary">{resume ? resume.name : 'PDF, DOC, DOCX up to 5MB'}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Content Editor */}
        <div className="bg-card p-8 rounded-2xl shadow-lg space-y-4 flex-1 min-h-0 flex flex-col">
          <h2 className="text-xl font-semibold text-text-primary border-b border-border pb-3 flex items-center">
            <Eye className="mr-2 h-5 w-5" />
            Email Content
          </h2>
          <div className="flex-1 min-h-0 flex flex-col">
            <textarea
              id="content"
              name="content"
              rows={15}
              placeholder="Write your email here..."
              value={formData.content}
              onChange={handleChange}
              required
              className="w-full flex-grow p-4 bg-foreground border border-border rounded-lg font-mono text-sm mb-2"
              style={{ minHeight: '120px', maxHeight: '300px' }}
            />
            <div className="flex items-start gap-2 mt-2">
              <textarea
                id="prompt"
                name="prompt"
                placeholder="e.g. Make it more persuasive, mention remote work, etc."
                value={formData.prompt || ''}
                onChange={handleChange}
                rows={2}
                className="flex-1 resize-y min-h-[40px] max-h-[120px] overflow-y-auto p-2 bg-foreground border border-border rounded-md text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-colors"
                style={{ lineHeight: '1.5' }}
              />
              <button
                type="button"
                onClick={handleAIPersonalize}
                disabled={aiLoading}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1 mt-0.5"
                title="Personalize with AI using this prompt"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-auto py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        <Send className="inline-block mr-2 h-5 w-5" />
        {loading ? 'Sending...' : `Send ${sendMode === 'single' ? 'Email' : 'Bulk Emails'}`}
      </button>
    </div>
  );
};

export default CustomEmail; 