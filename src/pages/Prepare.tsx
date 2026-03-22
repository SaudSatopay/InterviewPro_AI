import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Sparkles, Loader2, ChevronRight, ChevronDown,
  Download, RotateCcw, Clock, Target, Lightbulb, Calendar,
  ArrowLeft, Flame, AlertTriangle, Leaf, Shield, Crosshair, Zap
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');

interface Topic {
  name: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  resources: string[];
  estimatedHours: number;
}

interface WeeklyPlan {
  week: number;
  focus: string;
  tasks: string[];
}

interface Roadmap {
  overview: string;
  topics: Topic[];
  weeklyPlan: WeeklyPlan[];
  tips: string[];
}

const TIMEFRAMES = [
  { value: '1 week', label: '1 Week' },
  { value: '2 weeks', label: '2 Weeks' },
  { value: '1 month', label: '1 Month' },
  { value: '2 months', label: '2 Months' },
  { value: '3+ months', label: '3+ Months' },
];

const LEVELS = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid-level', label: 'Mid-level' },
  { value: 'senior', label: 'Senior' },
];

const priorityConfig = {
  high: { color: 'text-red-300', bg: 'bg-red-500/15 border-red-500/30', barColor: 'bg-red-500', icon: Flame, label: 'High Priority' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', barColor: 'bg-amber-500', icon: AlertTriangle, label: 'Medium Priority' },
  low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', barColor: 'bg-emerald-500', icon: Leaf, label: 'Low Priority' },
};

// Framer Motion variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 }
  },
  exit: { opacity: 0, y: 20, transition: { duration: 0.2 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const pulseGlow: Variants = {
  idle: {
    boxShadow: '0 0 0px rgba(239,68,68,0)',
    transition: { duration: 1.5, repeat: Infinity, repeatType: 'reverse' }
  },
  glow: {
    boxShadow: '0 0 30px rgba(239,68,68,0.15)',
    transition: { duration: 1.5, repeat: Infinity, repeatType: 'reverse' }
  }
};

// Loading skeleton with Framer Motion
const LoadingSkeleton: React.FC = () => {
  const steps = [
    'Analyzing your target role...',
    'Mapping skill requirements...',
    'Building study topics...',
    'Creating weekly schedule...',
    'Generating pro tips...',
  ];
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="container mx-auto px-4 py-16 max-w-3xl"
    >
      <motion.div
        className="text-center mb-12"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <div className="relative inline-block mb-6">
          <motion.div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-900/20 border border-red-500/10 flex items-center justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 size={32} className="text-red-400" />
          </motion.div>
          <motion.div
            className="absolute inset-0 rounded-2xl bg-red-500/10"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Building Your Roadmap</h2>
        <p className="text-slate-500 text-sm">This may take a moment</p>
      </motion.div>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: i <= currentStep ? 1 : 0.3,
              x: 0,
            }}
            transition={{ delay: i * 0.04, duration: 0.2 }}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border transition-all duration-500 ${
              i < currentStep
                ? 'bg-red-500/5 border-red-500/20'
                : i === currentStep
                ? 'bg-dark-700 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.08)]'
                : 'bg-dark-800/50 border-white/5'
            }`}
          >
            {i < currentStep ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0"
              >
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </motion.div>
            ) : i === currentStep ? (
              <motion.div
                className="w-5 h-5 rounded-full border-2 border-red-500/50 border-t-red-400 flex-shrink-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <div className="w-5 h-5 rounded-full border border-white/10 flex-shrink-0" />
            )}
            <span className={`text-sm font-medium ${i <= currentStep ? 'text-slate-200' : 'text-slate-600'}`}>{step}</span>
          </motion.div>
        ))}
      </div>

      {/* Pulsing bar */}
      <div className="mt-8 h-1 rounded-full bg-dark-700 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
};

const Prepare: React.FC = () => {
  const [role, setRole] = useState('');
  const [skills, setSkills] = useState('');
  const [level, setLevel] = useState('junior');
  const [timeframe, setTimeframe] = useState('2 weeks');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [formStep, setFormStep] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!role.trim() || !skills.trim()) {
      setError('Please fill in the role and skills fields.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/generate-preparation`, {
        role: role.trim(),
        skills: skills.trim(),
        level,
        timeframe,
        additionalNotes: additionalNotes.trim() || undefined,
      }, { timeout: 120000 });

      setRoadmap(response.data.roadmap);
    } catch (err) {
      console.error(err);
      setError('Failed to generate roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleWeek = (week: number) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  };

  const downloadMarkdown = () => {
    if (!roadmap) return;

    let md = `# Interview Preparation Roadmap\n`;
    md += `**Role:** ${role}\n`;
    md += `**Skills:** ${skills}\n`;
    md += `**Level:** ${level}\n`;
    md += `**Timeframe:** ${timeframe}\n\n`;
    md += `## Overview\n${roadmap.overview}\n\n`;

    md += `## Topics to Study\n\n`;
    roadmap.topics.forEach(t => {
      md += `### ${t.name} [${t.priority.toUpperCase()} priority] (~${t.estimatedHours}h)\n`;
      md += `${t.description}\n\n`;
      md += `**Resources:**\n`;
      t.resources.forEach(r => { md += `- ${r}\n`; });
      md += `\n`;
    });

    md += `## Weekly Plan\n\n`;
    roadmap.weeklyPlan.forEach(w => {
      md += `### Week ${w.week}: ${w.focus}\n`;
      w.tasks.forEach(t => { md += `- [ ] ${t}\n`; });
      md += `\n`;
    });

    md += `## Tips\n\n`;
    roadmap.tips.forEach(t => { md += `- ${t}\n`; });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prep-roadmap-${role.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const resetForm = () => {
    setRoadmap(null);
    setError(null);
    setFormStep(0);
  };

  const totalHours = roadmap?.topics.reduce((sum, t) => sum + t.estimatedHours, 0) || 0;

  // Loading state
  if (loading) {
    return (
      <AnimatePresence mode="wait">
        <LoadingSkeleton key="loading" />
      </AnimatePresence>
    );
  }

  // Roadmap view
  if (roadmap) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="roadmap"
          className="container mx-auto px-4 py-10 max-w-4xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="overflow-hidden"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 mb-3">
                    <Crosshair size={12} />
                    Preparation Roadmap
                  </div>
                </motion.div>
                <motion.h1
                  className="text-3xl md:text-4xl font-extrabold text-white tracking-tight"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.2 }}
                >
                  {role}
                </motion.h1>
                <motion.div
                  className="flex items-center gap-3 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{level}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{timeframe}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span className="text-xs font-medium text-red-400 uppercase tracking-wider">{totalHours}h total</span>
                </motion.div>
              </div>
              <motion.div
                className="flex gap-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.16, duration: 0.2 }}
              >
                <motion.button
                  onClick={downloadMarkdown}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(239,68,68,0.2)' }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                    bg-red-500/10 text-red-300 border border-red-500/20
                    hover:bg-red-500/20 hover:border-red-500/30 transition-colors duration-200"
                >
                  <Download size={15} />
                  <span className="hidden sm:inline">Export</span>
                </motion.button>
                <motion.button
                  onClick={resetForm}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                    bg-white/5 text-slate-300 border border-white/10
                    hover:bg-white/10 hover:border-white/20 transition-colors duration-200"
                >
                  <RotateCcw size={15} />
                  <span className="hidden sm:inline">New</span>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>

          {/* Overview */}
          <motion.div variants={scaleIn}>
            <motion.div
              className="glass-card p-6 mb-8 relative overflow-hidden"
              style={{ borderColor: 'rgba(239,68,68,0.1)' }}
              whileHover={{ borderColor: 'rgba(239,68,68,0.25)' }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.25, delay: 0.12 }}
              />
              <div className="flex items-center gap-2.5 mb-3">
                <motion.div
                  className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center"
                  whileHover={{ rotate: 15, scale: 1.1 }}
                >
                  <Target size={16} className="text-red-400" />
                </motion.div>
                <h2 className="text-base font-bold text-white uppercase tracking-wide">Strategy Overview</h2>
              </div>
              <p className="text-slate-300 leading-relaxed text-[15px]">{roadmap.overview}</p>
            </motion.div>
          </motion.div>

          {/* Topics */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <BookOpen size={16} className="text-red-400" />
              </div>
              <h2 className="text-base font-bold text-white uppercase tracking-wide">Core Topics</h2>
              <span className="text-xs text-slate-600 ml-1">{roadmap.topics.length} areas</span>
            </div>
            <div className="space-y-3">
              {roadmap.topics.map((topic, i) => {
                const pConfig = priorityConfig[topic.priority] || priorityConfig.medium;
                const PriorityIcon = pConfig.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.16 + i * 0.04, duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    whileHover={{
                      scale: 1.01,
                      borderColor: 'rgba(239,68,68,0.2)',
                      transition: { duration: 0.2 }
                    }}
                    className="glass-card p-0 overflow-hidden"
                    style={{ borderColor: 'rgba(239,68,68,0.08)' }}
                  >
                    <div className="flex">
                      <motion.div
                        className={`w-1 flex-shrink-0 ${pConfig.barColor}`}
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        transition={{ delay: 0.25 + i * 0.04, duration: 0.2 }}
                      />
                      <div className="p-5 flex-1">
                        <div className="flex items-start justify-between mb-2.5">
                          <span className="text-white font-semibold text-[15px]">{topic.name}</span>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <motion.span
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 + i * 0.04 }}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${pConfig.bg} ${pConfig.color}`}
                            >
                              <PriorityIcon size={10} />
                              {pConfig.label}
                            </motion.span>
                            <span className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                              <Clock size={10} />
                              {topic.estimatedHours}h
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-3">{topic.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {topic.resources.map((r, j) => (
                            <motion.span
                              key={j}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.35 + i * 0.04 + j * 0.03 }}
                              whileHover={{ y: -2, borderColor: 'rgba(239,68,68,0.3)' }}
                              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-dark-600/80 text-slate-400 border border-white/5 hover:text-red-300 transition-colors duration-200 cursor-default"
                            >
                              {r}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Weekly Plan */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Calendar size={16} className="text-red-400" />
              </div>
              <h2 className="text-base font-bold text-white uppercase tracking-wide">Weekly Breakdown</h2>
            </div>
            <div className="space-y-2">
              {roadmap.weeklyPlan.map((week, i) => {
                const isExpanded = expandedWeeks.has(week.week);
                return (
                  <motion.div
                    key={week.week}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.04, duration: 0.2 }}
                    className="glass-card overflow-hidden"
                    style={{ borderColor: 'rgba(239,68,68,0.08)' }}
                    layout
                  >
                    <motion.button
                      onClick={() => toggleWeek(week.week)}
                      className="w-full flex items-center justify-between p-4 text-left group transition-colors duration-200 hover:bg-white/[0.02]"
                      whileTap={{ scale: 0.995 }}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                            isExpanded
                              ? 'bg-red-500/15 text-red-400'
                              : 'bg-dark-600 text-slate-400 group-hover:text-slate-200'
                          }`}
                          animate={isExpanded ? {
                            boxShadow: '0 0 12px rgba(239,68,68,0.15)',
                          } : {
                            boxShadow: '0 0 0px rgba(239,68,68,0)',
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          W{week.week}
                        </motion.div>
                        <span className="text-white font-medium text-sm">{week.focus}</span>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                      >
                        <ChevronDown size={16} className="text-slate-500" />
                      </motion.div>
                    </motion.button>
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-white/5">
                            <ul className="space-y-2.5 mt-3.5">
                              {week.tasks.map((task, j) => (
                                <motion.li
                                  key={j}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: j * 0.03, duration: 0.2 }}
                                  className="flex items-start gap-3 text-sm text-slate-300"
                                >
                                  <div className="w-5 h-5 rounded border border-red-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-[10px] text-red-400/50 font-mono">{j + 1}</span>
                                  </div>
                                  {task}
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div variants={itemVariants}>
            <motion.div
              className="glass-card p-6 mb-8 relative overflow-hidden"
              style={{ borderColor: 'rgba(239,68,68,0.1)' }}
              whileHover={{ borderColor: 'rgba(239,68,68,0.2)' }}
            >
              <motion.div
                className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-400/50 to-transparent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.25, delay: 0.2 }}
              />
              <div className="flex items-center gap-2.5 mb-4">
                <motion.div
                  className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center"
                  whileHover={{ rotate: -15, scale: 1.1 }}
                >
                  <Lightbulb size={16} className="text-red-300" />
                </motion.div>
                <h2 className="text-base font-bold text-white uppercase tracking-wide">Strategic Tips</h2>
              </div>
              <div className="space-y-3">
                {roadmap.tips.map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.04 }}
                    className="flex items-start gap-3 group"
                    whileHover={{ x: 4 }}
                  >
                    <div className="w-6 h-6 rounded-md bg-dark-600 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-red-500/10 transition-colors duration-200">
                      <span className="text-[10px] text-slate-500 font-mono font-bold group-hover:text-red-400 transition-colors duration-200">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{tip}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom actions */}
          <motion.div
            variants={itemVariants}
            className="flex gap-3 pt-2"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/"
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium
                  bg-dark-600 text-slate-300 border border-white/5
                  hover:bg-dark-500 hover:border-white/10 transition-all duration-200"
              >
                <ArrowLeft size={15} />
                Home
              </Link>
            </motion.div>
            <motion.button
              onClick={downloadMarkdown}
              whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(239,68,68,0.3)' }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white
                bg-gradient-to-r from-red-600 to-red-500
                transition-all duration-300"
            >
              <Download size={15} />
              Download Full Roadmap
            </motion.button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Form view
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="form"
        className="container mx-auto px-4 py-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        {/* Hero */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.05 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 mb-4"
          >
            <Shield size={12} />
            Interview Preparation
          </motion.div>
          <motion.h1
            className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.25 }}
          >
            Prepare to{' '}
            <motion.span
              className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600"
              initial={{ backgroundSize: '0% 100%' }}
              animate={{ backgroundSize: '100% 100%' }}
              transition={{ delay: 0.2, duration: 0.25 }}
            >
              Succeed
            </motion.span>
          </motion.h1>
          <motion.p
            className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.16, duration: 0.25 }}
          >
            Define your interview parameters. Our AI will generate a structured preparation roadmap tailored to your timeline and skill level.
          </motion.p>
        </motion.div>

        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {['Role & Skills', 'Details & Generate'].map((label, i) => (
              <motion.button
                key={i}
                onClick={() => i === 0 && setFormStep(0)}
                whileHover={i < formStep ? { scale: 1.05 } : {}}
                whileTap={i < formStep ? { scale: 0.95 } : {}}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  formStep === i
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : formStep > i
                    ? 'bg-red-500/5 text-red-400/60 border border-transparent cursor-pointer hover:border-red-500/10'
                    : 'bg-dark-700/50 text-slate-600 border border-transparent'
                }`}
              >
                <motion.span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    formStep === i ? 'bg-red-500/20 text-red-400' : formStep > i ? 'bg-red-500/10 text-red-400/60' : 'bg-dark-600 text-slate-600'
                  }`}
                  animate={formStep === i ? {
                    boxShadow: ['0 0 0px rgba(239,68,68,0)', '0 0 8px rgba(239,68,68,0.3)', '0 0 0px rgba(239,68,68,0)']
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {i + 1}
                </motion.span>
                {label}
              </motion.button>
            ))}
          </div>

          <motion.div
            className="glass-card p-6 sm:p-8 relative overflow-hidden"
            style={{ borderColor: 'rgba(239,68,68,0.1)' }}
            variants={pulseGlow}
            initial="idle"
            animate="glow"
            layout
          >
            {/* Top accent line */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.25, delay: 0.2 }}
            />

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="flex items-start gap-2.5 mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20"
                >
                  <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {/* Step 1: Role & Skills */}
                {formStep === 0 && (
                  <motion.div
                    key="step-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                      >
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          <Crosshair size={12} className="text-red-400" />
                          Target Role
                        </label>
                        <input
                          type="text"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          placeholder="e.g., Frontend Developer, Data Scientist, DevOps Engineer"
                          className="w-full px-4 py-3.5 rounded-xl bg-dark-800 border border-white/5 text-slate-200
                            text-sm outline-none focus:border-red-500/40 focus:shadow-[0_0_20px_rgba(239,68,68,0.08)]
                            transition-all duration-300 placeholder:text-slate-600"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          <Zap size={12} className="text-red-500" />
                          Key Skills
                        </label>
                        <input
                          type="text"
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                          placeholder="e.g., React, TypeScript, System Design, SQL, DSA"
                          className="w-full px-4 py-3.5 rounded-xl bg-dark-800 border border-white/5 text-slate-200
                            text-sm outline-none focus:border-red-500/40 focus:shadow-[0_0_20px_rgba(239,68,68,0.08)]
                            transition-all duration-300 placeholder:text-slate-600"
                        />
                        <p className="text-[11px] text-slate-600 mt-1.5 tracking-wide">Comma-separated list of skills to focus on</p>
                      </motion.div>

                      <motion.button
                        type="button"
                        onClick={() => setFormStep(1)}
                        disabled={!role.trim() || !skills.trim()}
                        whileHover={role.trim() && skills.trim() ? { scale: 1.02, boxShadow: '0 0 25px rgba(239,68,68,0.3)' } : {}}
                        whileTap={role.trim() && skills.trim() ? { scale: 0.98 } : {}}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 }}
                        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white
                          px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500
                          disabled:opacity-40 disabled:cursor-not-allowed
                          transition-colors duration-300"
                      >
                        Continue
                        <ChevronRight size={16} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Details */}
                {formStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-6">
                      {/* Summary of step 1 */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 }}
                        className="flex items-center gap-3 p-3.5 rounded-xl bg-dark-700/60 border border-red-500/10"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                          <Crosshair size={14} className="text-red-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{role}</p>
                          <p className="text-[11px] text-slate-500 truncate">{skills}</p>
                        </div>
                        <motion.button
                          type="button"
                          onClick={() => setFormStep(0)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="ml-auto text-[11px] text-slate-500 hover:text-red-400 transition-colors duration-200 uppercase tracking-wider font-semibold flex-shrink-0"
                        >
                          Edit
                        </motion.button>
                      </motion.div>

                      <motion.div
                        className="grid grid-cols-2 gap-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                      >
                        <div>
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            <Shield size={12} className="text-red-400" />
                            Experience Level
                          </label>
                          <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            className="w-full"
                          >
                            {LEVELS.map(l => (
                              <option key={l.value} value={l.value}>{l.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            <Clock size={12} className="text-red-500" />
                            Timeframe
                          </label>
                          <select
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                            className="w-full"
                          >
                            {TIMEFRAMES.map(t => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                          Additional Context <span className="text-slate-600 normal-case tracking-normal">(Optional)</span>
                        </label>
                        <textarea
                          value={additionalNotes}
                          onChange={(e) => setAdditionalNotes(e.target.value)}
                          placeholder="Company name, weak areas, interview format, specific focus areas..."
                          rows={3}
                          className="w-full p-4 rounded-xl bg-dark-800 border border-white/5 text-slate-200
                            text-sm leading-relaxed resize-none outline-none
                            focus:border-red-500/40 focus:shadow-[0_0_20px_rgba(239,68,68,0.08)]
                            transition-all duration-300 placeholder:text-slate-600"
                        />
                      </motion.div>

                      <motion.button
                        type="submit"
                        disabled={loading || !role.trim() || !skills.trim()}
                        whileHover={!loading && role.trim() && skills.trim() ? {
                          scale: 1.02,
                          boxShadow: '0 0 30px rgba(239,68,68,0.35)'
                        } : {}}
                        whileTap={!loading && role.trim() && skills.trim() ? { scale: 0.98 } : {}}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12 }}
                        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white
                          px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500
                          disabled:opacity-40 disabled:cursor-not-allowed
                          transition-colors duration-300"
                      >
                        <Sparkles size={16} />
                        Generate Preparation Roadmap
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>

          {/* Home button */}
          <motion.div
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div className="inline-block" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium
                  bg-dark-600 text-slate-300 border border-white/5 hover:bg-dark-500 hover:text-white transition-all"
              >
                <ArrowLeft size={16} />
                Back to Home
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Prepare;
