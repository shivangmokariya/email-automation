import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Mail, Briefcase, Building, User, Send, File as FileIcon, Eye, FileText as TemplateIcon, ChevronDown } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import CustomSelect from './CustomSelect';
import { getAllPositions } from '../utils/positions';

const InputField = ({ id, name, type, placeholder, value, onChange, icon: Icon, required = true }) => (
  <div className="relative">
    {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />}
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full pl-10 pr-3 py-2 bg-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-colors shadow-sm"
    />
  </div>
);

const SelectField = ({ id, name, value, onChange, children, icon: Icon, required = true }) => (
  <div className="relative">
    {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />}
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full pl-10 pr-10 py-2 bg-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-colors appearance-none shadow-sm"
    >
      {children}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary pointer-events-none" />
  </div>
);

const SingleEmail = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    position: '',
    company: '',
    hrName: '',
    to: '',
    subject: '',
    content: '',
    credentialId: '',
    templateId: ''
  });
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);

  const userPositions = useMemo(() => [formData.position].filter(Boolean), [formData.position]);
  const positionOptions = useMemo(() => getAllPositions(userPositions).map(p => ({ value: p, label: p })), [userPositions]);
  const templateOptions = useMemo(() => filteredTemplates.map(t => ({ value: t._id, label: t.name })), [filteredTemplates]);
  const credentialOptions = useMemo(() => credentials.map(c => ({ value: c._id, label: c.email })), [credentials]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // MOCK DATA until APIs are ready
        setTemplates([
          { _id: '1', name: 'React Frontend Application', position: 'React Developer', subject: 'Application for {{position}} at {{company}}', content: 'Dear {{hrName}},\n\nI am writing to express my keen interest in the {{position}} position at {{company}}, which I discovered on LinkedIn. With a strong background in building responsive and dynamic user interfaces with React, I am confident that I possess the skills and experience you are looking for.\n\nIn my previous role, I was responsible for developing and maintaining the main dashboard, which improved user engagement by 15%. I am very excited about the opportunity to contribute to {{company}}.\n\nThank you for your time and consideration. I look forward to hearing from you soon.\n\nSincerely,\n{{name}}' },
          { _id: '2', name: 'React Follow-up', position: 'React Developer', subject: 'Following up on my application for {{position}}', content: 'Dear {{hrName}},\n\nI hope this email finds you well. I am writing to follow up on my application for the {{position}} role at {{company}}, which I submitted last week. I am still very interested in this opportunity and believe my experience with React aligns perfectly with your requirements.\n\nI am eager to learn more about this position and discuss how my skills can benefit your team.\n\nBest regards,\n{{name}}' },
          { _id: '3', name: 'Node.js Backend Application', position: 'Node.js Developer', subject: 'Application for {{position}} at {{company}}', content: 'Dear {{hrName}},\n\nI am writing to apply for the {{position}} role at {{company}}. As a backend developer with experience in building scalable and efficient APIs with Node.js and Express, I was thrilled to see this opening. My experience includes designing RESTful APIs and working with both SQL and NoSQL databases.\n\nI am confident that I can make a significant contribution to {{company}}. My resume is attached for your review.\n\nBest,\n{{name}}' },
          { _id: '4', name: 'Next.js Application', position: 'Next.js Developer', subject: 'Application for Next.js Developer at {{company}}', content: 'Dear {{hrName}},\n\nI am reaching out to express my strong interest in the {{position}} position at {{company}}. I have extensive experience in building server-rendered React applications with Next.js, focusing on performance, SEO, and a seamless user experience. I am adept at leveraging features like ISR, SSG, and API routes.\n\nThank you for considering my application. I am eager to discuss how my skills in Next.js can help {{company}} achieve its goals.\n\nSincerely,\n{{name}}' },
          { _id: '5', name: 'Full Stack Application', position: 'Full Stack Developer', subject: 'Full Stack Developer Application at {{company}}', content: 'Dear {{hrName}},\n\nI am writing to submit my application for the {{position}} role at {{company}}. With a comprehensive skill set spanning both frontend and backend technologies, including the MERN stack, I am well-equipped to handle the challenges of this role. I enjoy building end-to-end features, from database design to UI implementation.\n\nI am excited by the prospect of joining {{company}}.\n\nBest regards,\n{{name}}' },
          { _id: '6', name: 'Frontend Application', position: 'Frontend Developer', subject: 'Frontend Developer Role at {{company}}', content: 'Dear {{hrName}},\n\nI am writing to apply for the {{position}} position. As a dedicated frontend developer with a passion for creating intuitive user experiences, I believe I have the skills necessary for this role. I am proficient in HTML, CSS, JavaScript, and modern frameworks like React.\n\nI am eager to bring my skills to {{company}} and contribute to your team. My resume is attached.\n\nSincerely,\n{{name}}' },
          { _id: '7', name: 'Backend Application', position: 'Backend Developer', subject: 'Backend Developer Position at {{company}}', content: 'Dear {{hrName}},\n\nI am submitting my application for the {{position}} position at {{company}}. I have a solid background in server-side development, with expertise in Node.js, database design, and API development. I am experienced in building secure and scalable backend systems.\n\nI would be a valuable addition to your team. My resume is attached.\n\nBest regards,\n{{name}}' },
        ]);
        const credentialsRes = await axios.get('/credentials');
        setCredentials(credentialsRes.data.data);
        if (credentialsRes.data.data.length > 0) {
          setFormData(prev => ({ ...prev, credentialId: credentialsRes.data.data[0]._id }));
        }
      } catch (error) {
        toast.error('Failed to load credentials.');
      }
    };
    fetchData();
  }, [user]);

  const handlePositionChange = (selectedPosition) => {
    setFormData(prev => ({ 
      ...prev, 
      position: selectedPosition,
      templateId: '',
      subject: '',
      content: '',
    }));
    
    const relevantTemplates = templates.filter(t => t.position === selectedPosition);
    setFilteredTemplates(relevantTemplates);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateChange = (selectedTemplateId) => {
    const selectedTemplate = templates.find(t => t._id === selectedTemplateId);
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        templateId: selectedTemplateId,
        subject: selectedTemplate.subject,
        content: selectedTemplate.content
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        templateId: '',
        subject: '',
        content: ''
      }));
    }
  };
  
  const personalizedText = (text) => {
    if (!text) return '';
    return text
      .replace(/{{company}}/g, formData.company || '[Company]')
      .replace(/{{position}}/g, formData.position || '[Position]')
      .replace(/{{hrName}}/g, formData.hrName || 'Hiring Manager')
      .replace(/{{name}}/g, user?.name || 'Applicant');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Sending email...');

    const emailData = new FormData();
    emailData.append('to', formData.to);
    emailData.append('subject', personalizedText(formData.subject));
    emailData.append('content', personalizedText(formData.content));
    emailData.append('credentialId', formData.credentialId);
    emailData.append('hrName', formData.hrName);
    emailData.append('company', formData.company);
    emailData.append('position', formData.position);
    if (resume) {
      emailData.append('resume', resume);
    }

    try {
      await axios.post('/emails/send-single', emailData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Email sent successfully!', { id: toastId });
      
      // Reset form fields
      setFormData({
        position: '',
        company: '',
        hrName: '',
        to: '',
        subject: '',
        content: '',
        credentialId: credentials.length > 0 ? credentials[0]._id : '',
        templateId: ''
      });
      setResume(null);
      setFilteredTemplates([]);
      const fileInput = document.getElementById('resume');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send email.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <Toaster position="bottom-right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-text-primary">Send Single Email</h1>
        <p className="text-text-secondary mt-1 mb-8">Craft and send a personalized email to one recipient.</p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Form Fields */}
          <div className="bg-card p-8 rounded-2xl shadow-lg space-y-6">
            <h2 className="text-xl font-semibold text-text-primary border-b border-border pb-3">Email Details</h2>
            
            <CustomSelect
              value={formData.position}
              onChange={handlePositionChange}
              options={positionOptions}
              placeholder="-- Select a Position --"
              icon={Briefcase}
            />

            <CustomSelect
              value={formData.templateId}
              onChange={handleTemplateChange}
              options={templateOptions}
              placeholder="-- Select a Template --"
              icon={TemplateIcon}
              disabled={!formData.position}
            />
            
            <InputField id="company" name="company" type="text" placeholder="Company Name" value={formData.company} onChange={handleChange} icon={Building} />
            <InputField id="hrName" name="hrName" type="text" placeholder="HR Name / Hiring Manager" value={formData.hrName} onChange={handleChange} icon={User} />
            <InputField id="to" name="to" type="email" placeholder="Recipient's Email Address" value={formData.to} onChange={handleChange} icon={Mail} />

            <h2 className="text-xl font-semibold text-text-primary border-b border-border pb-3 pt-4">Your Credentials</h2>
            <CustomSelect
              value={formData.credentialId}
              onChange={(value) => setFormData(prev => ({ ...prev, credentialId: value }))}
              options={credentialOptions}
              placeholder="-- Select a Credential --"
              icon={User}
            />

            <h2 className="text-xl font-semibold text-text-primary border-b border-border pb-3 pt-4">Resume</h2>
            <div className="relative border-2 border-dashed border-border rounded-lg p-6 text-center">
              <FileIcon className="mx-auto h-12 w-12 text-text-secondary" />
              <label htmlFor="resume" className="mt-4 text-sm font-medium text-primary hover:underline cursor-pointer">
                {resume ? 'Change file' : 'Upload a file'}
              </label>
              <input id="resume" name="resume" type="file" onChange={(e) => setResume(e.target.files[0])} className="sr-only" />
              <p className="mt-1 text-xs text-text-secondary">{resume ? resume.name : 'PDF, DOC, DOCX up to 5MB'}</p>
            </div>
          </div>

          {/* Right Column: Preview & Submit */}
          <div className="bg-card p-8 rounded-2xl shadow-lg space-y-4 flex flex-col h-full">
            <h2 className="text-xl font-semibold text-text-primary border-b border-border pb-3 flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              Email Preview
            </h2>
            <div className="space-y-4 flex-grow flex flex-col">
              <div>
                <label className="block text-sm font-medium text-text-secondary">To:</label>
                <p className="mt-1 text-sm text-text-primary break-all">{formData.to || '...'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary">Subject:</label>
                <p className="mt-1 text-sm text-text-primary">{personalizedText(formData.subject) || '...'}</p>
              </div>
              <div className="flex-grow flex flex-col min-h-[200px]">
                <label className="block text-sm font-medium text-text-secondary">Content:</label>
                <div 
                  className="mt-1 p-4 h-full flex-grow border border-border rounded-lg text-sm text-text-primary overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: personalizedText(formData.content).replace(/\n/g, '<br />') || '...' }}
                />
              </div>
            </div>
             <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                <Send className="inline-block mr-2 h-5 w-5" />
                {loading ? 'Sending...' : 'Send Email'}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SingleEmail;