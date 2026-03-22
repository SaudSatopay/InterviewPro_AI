import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload, FileText, AlertCircle, Check, FileDown,
  Zap, Brain, Settings2, ChevronRight, Loader2, Sparkles,
  Building2, Briefcase, FileEdit, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInterview } from '../context/InterviewContext';
import { generateQuestions } from '../services/aiService';

interface InterviewOptions {
  questionCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  technicalQuestionRatio: number;
}

const POPULAR_COMPANIES = [
  'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Netflix',
  'Tesla', 'Uber', 'Airbnb', 'Spotify', 'Stripe', 'Salesforce',
  'Other (Custom)',
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { setJobDescription, setResume, setCompany, setPosition, setQuestions } = useInterview();
  const [jobDescFile, setJobDescFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const jobDescInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Resume input mode toggle (Feature 2)
  const [resumeInputMode, setResumeInputMode] = useState<'upload' | 'text'>('upload');
  const [resumeTextInput, setResumeTextInput] = useState('');

  // Company & Position (Feature 3)
  const [selectedCompany, setSelectedCompany] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [positionRole, setPositionRole] = useState('');

  const [interviewOptions, setInterviewOptions] = useState<InterviewOptions>({
    questionCount: 10,
    difficulty: 'mixed',
    technicalQuestionRatio: 40,
  });

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setJobDescFile(file);
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setResumeFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!jobDescFile) {
      setError("Please upload a job description to continue");
      return;
    }

    try {
      setLoading(true);
      const jobDescText = await readFileAsText(jobDescFile);
      setJobDescription(jobDescText);

      // Resolve resume from file or text input
      let resolvedResume: string | null = null;
      if (resumeInputMode === 'upload' && resumeFile) {
        resolvedResume = await readFileAsText(resumeFile);
      } else if (resumeInputMode === 'text' && resumeTextInput.trim()) {
        resolvedResume = resumeTextInput.trim();
      }
      if (resolvedResume) {
        setResume(resolvedResume);
      }

      // Resolve company
      const resolvedCompany = selectedCompany === 'Other (Custom)' ? customCompany.trim() : selectedCompany;
      if (resolvedCompany) setCompany(resolvedCompany);
      if (positionRole.trim()) setPosition(positionRole.trim());

      const questions = await generateQuestions(
        jobDescText,
        resolvedResume,
        interviewOptions,
        resolvedCompany || undefined,
        positionRole.trim() || undefined
      );
      setQuestions(questions);
      navigate('/interview');
    } catch (err) {
      console.error(err);
      setError("Failed to process the files. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const readFileAsText = async (file: File): Promise<string> => {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
      return text;
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  const downloadSampleJobDesc = (role: string) => {
    const jobDescriptions: Record<string, string> = {
      webdev: `Senior Full Stack Developer\n\nAbout the Role:\nWe are seeking an experienced Full Stack Developer to join our dynamic engineering team. The ideal candidate will have a strong background in modern web technologies and a passion for creating scalable, user-friendly applications.\n\nRequirements:\n- 5+ years of experience in full stack web development\n- Expert knowledge of React, Node.js, and TypeScript\n- Strong understanding of RESTful APIs and GraphQL\n- Experience with cloud platforms (AWS/Azure/GCP)\n- Proficiency in database design and optimization (SQL and NoSQL)\n- Knowledge of CI/CD practices and tools\n- Experience with microservices architecture\n\nResponsibilities:\n- Design and implement new features for our web applications\n- Write clean, maintainable, and efficient code\n- Collaborate with cross-functional teams\n- Mentor junior developers\n- Participate in code reviews and technical discussions\n- Optimize application performance\n- Implement security best practices`,
      ai: `Senior AI Engineer\n\nAbout the Role:\nWe're looking for a Senior AI Engineer to help develop and deploy cutting-edge machine learning solutions. The ideal candidate will have strong expertise in deep learning and natural language processing.\n\nRequirements:\n- Masters/PhD in Computer Science, AI, or related field\n- 5+ years of experience in machine learning/deep learning\n- Expert knowledge of PyTorch or TensorFlow\n- Strong programming skills in Python\n- Experience with large language models and transformers\n- Proficiency in ML deployment and MLOps\n\nResponsibilities:\n- Design and implement ML models for various use cases\n- Optimize model performance and efficiency\n- Lead ML infrastructure development\n- Collaborate with research teams\n- Mentor junior ML engineers\n- Stay current with latest AI developments`,
      cloud: `Senior Cloud Solutions Architect\n\nAbout the Role:\nWe are seeking a Senior Cloud Solutions Architect to design and implement enterprise-scale cloud solutions.\n\nRequirements:\n- 8+ years of experience in cloud architecture\n- Expert knowledge of AWS, Azure, or GCP\n- Strong understanding of cloud security\n- Experience with Infrastructure as Code (Terraform/CloudFormation)\n- Knowledge of containerization and orchestration\n- Understanding of networking and distributed systems\n\nResponsibilities:\n- Design scalable cloud architectures\n- Develop cloud migration strategies\n- Implement security best practices\n- Optimize cloud costs and performance\n- Lead technical discussions with stakeholders\n- Mentor junior architects`,
    };

    const blob = new Blob([jobDescriptions[role]], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${role}-job-description.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-10"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {/* Hero section */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.05 }}
          className="inline-flex items-center gap-2 badge badge-cyan mb-4"
        >
          <Sparkles size={12} />
          AI-Powered Interview Preparation
        </motion.div>
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.25 }}
        >
          Ace Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">Interview</span>
        </motion.h1>
        <motion.p
          className="text-slate-400 text-lg max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.2 }}
        >
          Upload a job description and resume. Our AI generates tailored questions, evaluates your answers, and builds a personalized study plan.
        </motion.p>
      </motion.div>

      <div className="max-w-3xl mx-auto">
        {/* Sample job descriptions */}
        <motion.div
          className="glass-card p-5 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <FileDown size={18} className="text-neon-purple" />
            <h2 className="text-sm font-semibold text-white">Try with Sample Job Descriptions</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'webdev', label: 'Web Developer' },
              { key: 'ai', label: 'AI Engineer' },
              { key: 'cloud', label: 'Cloud Architect' },
            ].map(({ key, label }, i) => (
              <motion.button
                key={key}
                onClick={() => downloadSampleJobDesc(key)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.12 + i * 0.04 }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(176,38,255,0.2)' }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium
                  bg-neon-purple/10 text-neon-purple border border-neon-purple/20
                  hover:bg-neon-purple/20 hover:border-neon-purple/40 transition-colors"
              >
                <FileDown size={14} />
                {label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Prepare for Interview CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.2 }}
          className="mb-6"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/prepare"
              className="flex items-center justify-center gap-3 w-full px-6 py-4 rounded-xl text-base font-semibold text-white
                bg-gradient-to-r from-red-600 to-red-500
                hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-shadow duration-200"
            >
              <BookOpen size={20} />
              Prepare for Interview
              <ChevronRight size={18} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Main form card */}
        <motion.div
          className="glass-card p-6 sm:p-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.25, ease: 'easeOut' }}
        >
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="flex items-start gap-2.5 mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Description Upload */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Job Description *
              </label>
              <motion.div
                className={`upload-zone ${jobDescFile ? 'active' : ''}`}
                onClick={() => jobDescInputRef.current?.click()}
                whileHover={{ borderColor: 'rgba(0,240,255,0.4)', boxShadow: '0 0 20px rgba(0,240,255,0.08)' }}
                whileTap={{ scale: 0.99 }}
              >
                <input
                  ref={jobDescInputRef}
                  type="file"
                  accept=".txt,.pdf,.docx"
                  onChange={handleJobDescriptionChange}
                  className="hidden"
                />
                <AnimatePresence mode="wait">
                  {jobDescFile ? (
                    <motion.div
                      key="uploaded"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex flex-col items-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      >
                        <Check size={28} className="text-green-400 mb-2" />
                      </motion.div>
                      <p className="text-green-300 font-medium text-sm">{jobDescFile.name}</p>
                      <p className="text-green-400/50 text-xs mt-1">Click to change</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center"
                    >
                      <FileText size={28} className="text-neon-cyan/50 mb-2" />
                      <p className="text-slate-300 font-medium text-sm">Upload job description</p>
                      <p className="text-slate-500 text-xs mt-1">.txt, .pdf, .docx</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>

            {/* Resume Section with Upload/Text Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Resume / CV <span className="text-slate-600">(Optional)</span>
                </label>
                <div className="flex rounded-lg overflow-hidden border border-white/10">
                  <motion.button
                    type="button"
                    onClick={() => setResumeInputMode('upload')}
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all
                      ${resumeInputMode === 'upload'
                        ? 'bg-neon-cyan/15 text-neon-cyan'
                        : 'bg-dark-700 text-slate-500 hover:text-slate-300'
                      }`}
                  >
                    <Upload size={12} />
                    Upload
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setResumeInputMode('text')}
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all
                      ${resumeInputMode === 'text'
                        ? 'bg-neon-cyan/15 text-neon-cyan'
                        : 'bg-dark-700 text-slate-500 hover:text-slate-300'
                      }`}
                  >
                    <FileEdit size={12} />
                    Paste Text
                  </motion.button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {resumeInputMode === 'upload' ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.25 }}
                  >
                    <motion.div
                      className={`upload-zone ${resumeFile ? 'active' : ''}`}
                      onClick={() => resumeInputRef.current?.click()}
                      whileHover={{ borderColor: 'rgba(0,240,255,0.4)', boxShadow: '0 0 20px rgba(0,240,255,0.08)' }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <input
                        ref={resumeInputRef}
                        type="file"
                        accept=".txt,.pdf,.docx"
                        onChange={handleResumeChange}
                        className="hidden"
                      />
                      <AnimatePresence mode="wait">
                        {resumeFile ? (
                          <motion.div
                            key="uploaded"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex flex-col items-center"
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                            >
                              <Check size={28} className="text-green-400 mb-2" />
                            </motion.div>
                            <p className="text-green-300 font-medium text-sm">{resumeFile.name}</p>
                            <p className="text-green-400/50 text-xs mt-1">Click to change</p>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center"
                          >
                            <Upload size={28} className="text-neon-cyan/50 mb-2" />
                            <p className="text-slate-300 font-medium text-sm">Upload your resume</p>
                            <p className="text-slate-500 text-xs mt-1">.txt, .pdf, .docx</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="text"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.25 }}
                  >
                    <textarea
                      value={resumeTextInput}
                      onChange={(e) => setResumeTextInput(e.target.value)}
                      placeholder="Paste your resume / CV text here..."
                      rows={6}
                      className="w-full p-4 rounded-xl bg-dark-800 border border-white/5 text-slate-200
                        text-sm leading-relaxed resize-y outline-none
                        focus:border-neon-cyan/40 focus:shadow-[0_0_15px_rgba(0,240,255,0.1)]
                        transition-all placeholder:text-slate-600"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Company & Position Section */}
            <motion.div
              className="border-t border-white/5 pt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
            >
              <div className="flex items-center gap-2 mb-5">
                <Building2 size={18} className="text-neon-purple" />
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Target Company & Position</h2>
                <span className="text-[10px] text-slate-600 ml-1">(Optional)</span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Company</label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full"
                  >
                    <option value="">-- Select a company --</option>
                    {POPULAR_COMPANIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <AnimatePresence>
                    {selectedCompany === 'Other (Custom)' && (
                      <motion.input
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        type="text"
                        value={customCompany}
                        onChange={(e) => setCustomCompany(e.target.value)}
                        placeholder="Enter company name"
                        className="w-full mt-2 px-3.5 py-2.5 rounded-lg bg-dark-800 border border-white/5 text-slate-200
                          text-sm outline-none focus:border-neon-purple/40 focus:shadow-[0_0_15px_rgba(176,38,255,0.1)]
                          transition-all placeholder:text-slate-600"
                      />
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={12} />
                      Position / Role
                    </span>
                  </label>
                  <input
                    type="text"
                    value={positionRole}
                    onChange={(e) => setPositionRole(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-dark-800 border border-white/5 text-slate-200
                      text-sm outline-none focus:border-neon-purple/40 focus:shadow-[0_0_15px_rgba(176,38,255,0.1)]
                      transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>
            </motion.div>

            {/* Interview Options */}
            <motion.div
              className="border-t border-white/5 pt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26 }}
            >
              <div className="flex items-center gap-2 mb-5">
                <Settings2 size={18} className="text-neon-cyan" />
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Interview Options</h2>
              </div>

              {/* Question Count */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-slate-400 mb-2">Number of Questions</label>
                <select
                  value={interviewOptions.questionCount}
                  onChange={(e) => setInterviewOptions(prev => ({
                    ...prev,
                    questionCount: parseInt(e.target.value)
                  }))}
                  className="w-full"
                >
                  <option value={5}>5 questions (~15 min)</option>
                  <option value={10}>10 questions (~30 min)</option>
                  <option value={15}>15 questions (~45 min)</option>
                  <option value={20}>20 questions (~60 min)</option>
                </select>
              </div>

              {/* Difficulty Level */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-slate-400 mb-2">Difficulty Level</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['beginner', 'intermediate', 'advanced', 'mixed'] as const).map((level, i) => (
                    <motion.button
                      key={level}
                      type="button"
                      onClick={() => setInterviewOptions(prev => ({ ...prev, difficulty: level }))}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.28 + i * 0.03 }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium capitalize transition-colors
                        ${interviewOptions.difficulty === level
                          ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg shadow-neon-purple/20'
                          : 'bg-dark-600 text-slate-400 hover:bg-dark-500 hover:text-slate-200 border border-white/5'
                        }`}
                    >
                      {level}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Technical Ratio */}
              <div className="mb-2">
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Technical vs. Behavioral
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={interviewOptions.technicalQuestionRatio}
                    onChange={(e) => setInterviewOptions(prev => ({
                      ...prev,
                      technicalQuestionRatio: parseInt(e.target.value)
                    }))}
                    className="flex-1"
                  />
                  <motion.span
                    key={interviewOptions.technicalQuestionRatio}
                    initial={{ scale: 1.2, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="badge badge-purple text-xs whitespace-nowrap"
                  >
                    {interviewOptions.technicalQuestionRatio}% Technical
                  </motion.span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 mt-1.5">
                  <span>More Behavioral</span>
                  <span>More Technical</span>
                </div>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading || !jobDescFile}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={!loading && jobDescFile ? { scale: 1.02, boxShadow: '0 0 25px rgba(0,240,255,0.2)' } : {}}
              whileTap={!loading && jobDescFile ? { scale: 0.98 } : {}}
              className="btn-neon w-full flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Zap size={18} />
                  Start Interview
                  <ChevronRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* How it works */}
          <motion.div
            className="mt-8 pt-6 border-t border-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.32 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="text-neon-cyan/60" />
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">How it works</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { step: '01', text: 'Upload job description & resume' },
                { step: '02', text: 'AI generates tailored questions' },
                { step: '03', text: 'Answer by voice or code, get scored' },
              ].map(({ step, text }, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.34 + i * 0.04 }}
                  whileHover={{ y: -3, boxShadow: '0 0 15px rgba(0,240,255,0.06)' }}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-dark-700/50"
                >
                  <span className="text-neon-cyan font-mono font-bold text-xs mt-0.5">{step}</span>
                  <p className="text-slate-400 text-sm leading-snug">{text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;
