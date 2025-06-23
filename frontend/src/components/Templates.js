import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, FileText, Edit, Trash2, Save, X, Clipboard, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const defaultTemplates = [
  {
    name: 'Default Template',
    position: 'React Developer',
    subject: 'Application for React Developer Position',
    content: 'Dear {{hrName}},\n\nI am writing to express my interest in the {{position}} position at {{company}}.\n\nSincerely,\n{{name}}',
  },
  {
    name: 'Node.js Template',
    position: 'Node.js Developer',
    subject: 'Application for Node.js Developer Position',
    content: 'Dear {{hrName}},\n\nI am writing to express my interest in the {{position}} position at {{company}}.\n\nSincerely,\n{{name}}',
  },
  {
    name: 'Next.js Template',
    position: 'Next.js Developer',
    subject: 'Application for Next.js Developer Position',
    content: 'Dear {{hrName}},\n\nI am writing to express my interest in the {{position}} position at {{company}}.\n\nSincerely,\n{{name}}',
  },
  {
    name: 'Full Stack Template',
    position: 'Full Stack Developer',
    subject: 'Application for Full Stack Developer Position',
    content: 'Dear {{hrName}},\n\nI am writing to express my interest in the {{position}} position at {{company}}.\n\nSincerely,\n{{name}}',
  },
  {
    name: 'Frontend Template',
    position: 'Frontend Developer',
    subject: 'Application for Frontend Developer Position',
    content: 'Dear {{hrName}},\n\nI am writing to express my interest in the {{position}} position at {{company}}.\n\nSincerely,\n{{name}}',
  },
  {
    name: 'Backend Template',
    position: 'Backend Developer',
    subject: 'Application for Backend Developer Position',
    content: 'Dear {{hrName}},\n\nI am writing to express my interest in the {{position}} position at {{company}}.\n\nSincerely,\n{{name}}',
  },
];

const positions = ["React Developer", "Node.js Developer", "Next.js Developer", "Full Stack Developer", "Frontend Developer", "Backend Developer"];

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAndMergeTemplates = async () => {
      try {
        const { data } = await api.get('/templates');
        // Merge defaultTemplates and user templates, avoiding duplicates
        const userTemplates = data.data || [];
        // Use a Set to avoid duplicates by a unique key
        const seen = new Set();
        const allTemplates = [...defaultTemplates, ...userTemplates].filter(t => {
          const key = `${t.name}|${t.position}|${t.subject}|${t.content}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setTemplates(allTemplates);
      } catch (error) {
        toast.error('Failed to fetch templates.');
        setTemplates(defaultTemplates); // fallback to mock only
      } finally {
        setLoading(false);
      }
    };
    fetchAndMergeTemplates();
  }, []);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setIsEditing(false);
  };

  const handleNewTemplate = () => {
    setSelectedTemplate({
      name: '',
      position: '',
      subject: '',
      content: 'Dear {{hrName}},\n\nI am writing to express my interest in the {{position}} position at {{company}}.\n\nSincerely,\n{{name}}',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    const isNew = !selectedTemplate._id;
    const toastId = toast.loading(isNew ? 'Creating template...' : 'Saving template...');
    try {
      if (isNew) {
        await api.post('/templates', selectedTemplate);
      } else {
        await api.patch(`/templates/${selectedTemplate._id}`, selectedTemplate);
      }
      toast.success('Template saved!', { id: toastId });
      fetchAndMergeTemplates();
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save template.', { id: toastId });
    }
  };

  const handleDelete = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      const toastId = toast.loading('Deleting template...');
      try {
        await api.delete(`/templates/${templateId}`);
        toast.success('Template deleted!', { id: toastId });
        fetchAndMergeTemplates();
        setSelectedTemplate(null);
      } catch (error) {
        toast.error('Failed to delete template.', { id: toastId });
      }
    }
  };

  const groupedTemplates = templates.reduce((acc, t) => {
    (acc[t.position] = acc[t.position] || []).push(t);
    return acc;
  }, {});

  const copyToClipboard = () => {
    navigator.clipboard.writeText(selectedTemplate.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-2 sm:p-8 max-w-full sm:max-w-7xl mx-auto space-y-6 sm:space-y-8 text-text-primary bg-background">
      <Toaster position="bottom-right" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-6">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold">Email Templates</h1>
          <p className="text-text-secondary mt-1 text-sm sm:text-base">Create and manage your email templates</p>
        </div>
        <button onClick={handleNewTemplate} className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center">
          <Plus className="h-5 w-5" />
          <span>New Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        <div className="lg:col-span-1 bg-card p-2 sm:p-4 rounded-2xl shadow-lg">
          <h2 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4 px-1 sm:px-2">Your Templates</h2>
          <div className="space-y-3 sm:space-y-4 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-1 sm:pr-2">
            {Object.entries(groupedTemplates).map(([position, temps]) => (
              <div key={position}>
                <h3 className="font-semibold text-text-secondary px-2 mb-2">{position}</h3>
                <div className="space-y-2">
                  {temps.map(template => (
                    <div
                      key={template._id}
                      onClick={() => handleSelectTemplate(template)}
                      className={`p-3 rounded-lg cursor-pointer border-2 ${selectedTemplate?._id === template._id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-foreground'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-grow">
                          <p className="font-semibold">{template.name}</p>
                          <p className="text-sm text-text-secondary truncate">{template.subject}</p>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                          <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); setSelectedTemplate(template); }} className="p-1 hover:text-primary"><Edit className="h-4 w-4" /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(template._id); }} className="p-1 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 mt-4 lg:mt-0">
          <div className="bg-card p-4 sm:p-8 rounded-2xl shadow-lg h-full">
            {selectedTemplate ? (
              isEditing ? (
                // EDITING VIEW
                <div className="space-y-4">
                  <input type="text" placeholder="Template Name" value={selectedTemplate.name} onChange={e => setSelectedTemplate(p => ({...p, name: e.target.value}))} className="w-full p-2 bg-foreground border border-border rounded-md" />
                  <select value={selectedTemplate.position} onChange={e => setSelectedTemplate(p => ({...p, position: e.target.value}))} className="w-full p-2 bg-foreground border border-border rounded-md">
                    <option value="">-- Select Position --</option>
                    {positions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input type="text" placeholder="Email Subject" value={selectedTemplate.subject} onChange={e => setSelectedTemplate(p => ({...p, subject: e.target.value}))} className="w-full p-2 bg-foreground border border-border rounded-md" />
                  <textarea placeholder="Template Content" value={selectedTemplate.content} onChange={e => setSelectedTemplate(p => ({...p, content: e.target.value}))} rows="10" className="w-full p-2 bg-foreground border border-border rounded-md font-mono text-sm"></textarea>
                  <div className="flex justify-end space-x-4">
                    <button onClick={() => { setIsEditing(false); if (!selectedTemplate._id) setSelectedTemplate(null); }} className="bg-foreground px-4 py-2 rounded-lg hover:bg-border">Cancel</button>
                    <button onClick={handleSave} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90">Save Changes</button>
                  </div>
                </div>
              ) : (
                // VIEWING VIEW
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">{selectedTemplate.name}</h2>
                    <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-lg hover:bg-secondary/80">
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div>
                    <p className="font-semibold text-text-secondary">Position:</p>
                    <p>{selectedTemplate.position}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-text-secondary">Subject:</p>
                    <p>{selectedTemplate.subject}</p>
                  </div>
                  <div className="relative">
                    <p className="font-semibold text-text-secondary">Content:</p>
                    <div className="p-4 bg-foreground border border-border rounded-md whitespace-pre-wrap font-mono text-sm">{selectedTemplate.content}</div>
                    <button onClick={copyToClipboard} className="absolute top-8 right-2 p-1 bg-card hover:bg-border rounded-md">
                      {copied ? <ClipboardCheck className="h-5 w-5 text-green-500" /> : <Clipboard className="h-5 w-s" />}
                    </button>
                  </div>
                </div>
              )
            ) : (
              // PLACEHOLDER VIEW
              <div className="flex flex-col items-center justify-center h-full text-center">
                <FileText className="h-16 w-16 text-text-secondary mb-4" />
                <h3 className="text-xl font-semibold">Select a template to view or edit</h3>
                <p className="text-text-secondary mt-1">Or create a new template to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Templates;