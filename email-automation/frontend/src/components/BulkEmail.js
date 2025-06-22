import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Send, Upload, Plus, Trash2, Eye, EyeOff, Briefcase, FileText, User } from 'lucide-react';
import CustomSelect from './CustomSelect';
import { getAllPositions } from '../utils/positions';

// Always use mockTemplates for template selection and dropdowns
const mockTemplates = [
  { _id: '1', name: 'React Frontend Application', position: 'React Developer', subject: 'Application for {{position}} at {{company}}', content: 'Dear {{hrName}},\n\nI am writing to express my keen interest in the {{position}} position at {{company}}, which I discovered on LinkedIn. With a strong background in building responsive and dynamic user interfaces with React, I am confident that I possess the skills and experience you are looking for.\n\nIn my previous role, I was responsible for developing and maintaining the main dashboard, which improved user engagement by 15%. I am very excited about the opportunity to contribute to {{company}}.\n\nThank you for your time and consideration. I look forward to hearing from you soon.\n\nSincerely,\n{{name}}' },
  { _id: '2', name: 'React Follow-up', position: 'React Developer', subject: 'Following up on my application for {{position}}', content: 'Dear {{hrName}},\n\nI hope this email finds you well. I am writing to follow up on my application for the {{position}} role at {{company}}, which I submitted last week. I am still very interested in this opportunity and believe my experience with React aligns perfectly with your requirements.\n\nI am eager to learn more about this position and discuss how my skills can benefit your team.\n\nBest regards,\n{{name}}' },
  { _id: '3', name: 'Node.js Backend Application', position: 'Node.js Developer', subject: 'Application for {{position}} at {{company}}', content: 'Dear {{hrName}},\n\nI am writing to apply for the {{position}} role at {{company}}. As a backend developer with experience in building scalable and efficient APIs with Node.js and Express, I was thrilled to see this opening. My experience includes designing RESTful APIs and working with both SQL and NoSQL databases.\n\nI am confident that I can make a significant contribution to {{company}}. My resume is attached for your review.\n\nBest,\n{{name}}' },
  { _id: '4', name: 'Next.js Application', position: 'Next.js Developer', subject: 'Application for Next.js Developer at {{company}}', content: 'Dear {{hrName}},\n\nI am reaching out to express my strong interest in the {{position}} position at {{company}}. I have extensive experience in building server-rendered React applications with Next.js, focusing on performance, SEO, and a seamless user experience. I am adept at leveraging features like ISR, SSG, and API routes.\n\nThank you for considering my application. I am eager to discuss how my skills in Next.js can help {{company}} achieve its goals.\n\nSincerely,\n{{name}}' },
  { _id: '5', name: 'Full Stack Application', position: 'Full Stack Developer', subject: 'Full Stack Developer Application at {{company}}', content: 'Dear {{hrName}},\n\nI am writing to submit my application for the {{position}} role at {{company}}. With a comprehensive skill set spanning both frontend and backend technologies, including the MERN stack, I am well-equipped to handle the challenges of this role. I enjoy building end-to-end features, from database design to UI implementation.\n\nI am excited by the prospect of joining {{company}}.\n\nBest regards,\n{{name}}' },
  { _id: '6', name: 'Frontend Application', position: 'Frontend Developer', subject: 'Frontend Developer Role at {{company}}', content: 'Dear {{hrName}},\n\nI am writing to apply for the {{position}} position. As a dedicated frontend developer with a passion for creating intuitive user experiences, I believe I have the skills necessary for this role. I am proficient in HTML, CSS, JavaScript, and modern frameworks like React.\n\nI am eager to bring my skills to {{company}} and contribute to your team. My resume is attached.\n\nSincerely,\n{{name}}' },
  { _id: '7', name: 'Backend Application', position: 'Backend Developer', subject: 'Backend Developer Position at {{company}}', content: 'Dear {{hrName}},\n\nI am submitting my application for the {{position}} position at {{company}}. I have a solid background in server-side development, with expertise in Node.js, database design, and API development. I am experienced in building secure and scalable backend systems.\n\nI would be a valuable addition to your team. My resume is attached.\n\nBest regards,\n{{name}}' },
];

const BulkEmail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recipients, setRecipients] = useState([{ id: Date.now(), email: '', name: '', company: '' }]);
  const [credentials, setCredentials] = useState([]); // Credentials can still be fetched if needed

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm({
    defaultValues: {
      position: '',
      templateId: '',
      credentialId: '',
      subject: '',
      content: ''
    }
  });

  const watchedPosition = watch('position');

  // Hardcoded positions, same as SingleEmail.js
  const positions = ["React Developer", "Node.js Developer", "Next.js Developer", "Full Stack Developer", "Frontend Developer", "Backend Developer"];
  const positionOptions = useMemo(() => positions.map(p => ({ value: p, label: p })), [positions]);

  // Always filter from mockTemplates
  const filteredTemplates = useMemo(() => mockTemplates.filter(t => t.position === watchedPosition), [watchedPosition]);
  const templateOptions = useMemo(() => filteredTemplates.map(t => ({ value: t._id, label: t.name, subject: t.subject, content: t.content })), [filteredTemplates]);

  const credentialOptions = useMemo(() => credentials.map(c => ({ value: c._id, label: c.email })), [credentials]);

  // Credentials fetch (optional, can be kept if needed)
  React.useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const credentialsRes = await fetch('/credentials');
        const data = await credentialsRes.json();
        setCredentials(data.data);
        if (data.data.length > 0) {
          setValue('credentialId', data.data[0]._id);
        }
      } catch (error) {
        toast.error('Failed to load credentials.');
      }
    };
    fetchCredentials();
  }, [setValue]);

  const handlePositionChange = (selectedPosition) => {
    setValue('position', selectedPosition);
    setValue('templateId', '');
    setValue('subject', '');
    setValue('content', '');
  };

  const handleTemplateChange = (templateId) => {
    const selectedTemplate = mockTemplates.find(t => t._id === templateId);
    if (selectedTemplate) {
      setValue('templateId', templateId);
      setValue('subject', selectedTemplate.subject);
      setValue('content', selectedTemplate.content);
    } else {
      setValue('templateId', '');
      setValue('subject', '');
      setValue('content', '');
    }
  };

  const handleCredentialChange = (credentialId) => {
    setValue('credentialId', credentialId);
  };

  const addRecipient = () => {
    setRecipients([...recipients, { id: Date.now(), email: '', name: '', company: '' }]);
  };

  const updateRecipient = (id, field, value) => {
    setRecipients(recipients.map(r => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const removeRecipient = (id) => {
    setRecipients(recipients.filter(r => r.id !== id));
  };

  const onSubmit = async (data) => {
    // This logic needs to be updated for actual sending
    console.log({data, recipients});
    toast.success("Form submitted! Check console for data.");
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Bulk Email Campaign</h1>
        <p className="text-text-secondary mt-1">Send a personalized email campaign to multiple recipients.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Position, Template, Credentials */}
        <div className="bg-card p-8 rounded-2xl shadow-lg space-y-6">
            <h2 className="text-xl font-semibold text-text-primary border-b border-border pb-3">Campaign Setup</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomSelect
              value={watchedPosition}
              onChange={handlePositionChange}
              options={positionOptions}
              placeholder="-- Select a Position --"
              icon={Briefcase}
            />

            <CustomSelect
              value={watch('templateId')}
              onChange={handleTemplateChange}
              options={templateOptions}
              placeholder="-- Select a Template --"
              icon={FileText}
              disabled={!watchedPosition}
            />
            </div>
             <Controller
                  name="credentialId"
                  control={control}
                  rules={{ required: 'Sending email is required' }}
                  render={({ field }) => (
                    <CustomSelect
                      value={field.value}
                      onChange={handleCredentialChange}
                      options={credentialOptions}
                      placeholder="-- Select Sending Email --"
                      icon={User}
                    />
                  )}
              />
        </div>

        {/* Section 2: Content */}
        <div className="bg-card p-8 rounded-2xl shadow-lg space-y-4">
          <h2 className="text-xl font-semibold text-text-primary border-b border-border pb-3">Email Content</h2>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-text-secondary mb-1">Subject</label>
            <input id="subject" {...register('subject', { required: true })} className="w-full p-2 bg-foreground border border-border rounded-md" />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-text-secondary mb-1">Content</label>
            <textarea id="content" {...register('content', { required: true })} rows="8" className="w-full p-2 bg-foreground border border-border rounded-md font-mono text-sm"></textarea>
          </div>
        </div>

        {/* Section 3: Recipients */}
        <div className="bg-card p-8 rounded-2xl shadow-lg space-y-4">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h2 className="text-xl font-semibold text-text-primary">Recipients</h2>
            <button type="button" onClick={addRecipient} className="flex items-center space-x-2 bg-primary text-primary-foreground px-3 py-1 rounded-lg text-sm hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {recipients.map((recipient, index) => (
              <div key={recipient.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 p-3 bg-foreground rounded-lg items-center">
                <input type="email" placeholder="Recipient's Email" value={recipient.email} onChange={e => updateRecipient(recipient.id, 'email', e.target.value)} className="w-full p-2 bg-background border border-border rounded-md" required />
                <input type="text" placeholder="Recipient's Name" value={recipient.name} onChange={e => updateRecipient(recipient.id, 'name', e.target.value)} className="w-full p-2 bg-background border border-border rounded-md" />
                <input type="text" placeholder="Company Name" value={recipient.company} onChange={e => updateRecipient(recipient.id, 'company', e.target.value)} className="w-full p-2 bg-background border border-border rounded-md" required />
                <button type="button" onClick={() => removeRecipient(recipient.id)} className="p-2 text-text-secondary hover:text-red-500">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end">
           <button type="submit" disabled={isLoading} className="w-full md:w-auto flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
            <Send className="h-5 w-5" />
            <span>{isLoading ? 'Sending...' : `Send Campaign to ${recipients.length} recipients`}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default BulkEmail;