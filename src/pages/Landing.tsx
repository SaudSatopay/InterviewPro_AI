import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic, Brain, BookOpen, ChevronRight, Sparkles,
  Target, Clock, Shield, Zap, ArrowRight, CheckCircle2
} from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col min-h-[calc(100vh-120px)]"
    >
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-16 relative overflow-hidden">
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0 ? '#22d3ee' : i % 3 === 1 ? '#a855f7' : '#ec4899',
            }}
            animate={{
              y: [0, -30 - Math.random() * 40, 0],
              x: [0, (Math.random() - 0.5) * 20, 0],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Animated glow rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className="w-[600px] h-[600px] rounded-full border border-cyan-500/10"
            animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.25, 0.1], rotate: [0, 180, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full border border-purple-500/15"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.15, 0.05, 0.15], rotate: [360, 180, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute w-[200px] h-[200px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)' }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Moving gradient blobs */}
        <motion.div
          className="absolute w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }}
          animate={{ x: [-100, 100, -100], y: [-50, 50, -50] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }}
          animate={{ x: [80, -80, 80], y: [40, -60, 40] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 mb-8"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-300 text-sm font-medium">AI-Powered Interview Platform</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Master Your Next
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Interview
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Practice with AI-generated questions, answer by voice, get instant feedback,
            and build a personalized preparation roadmap.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              to="/login"
              className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white font-semibold text-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 px-8 py-4 border border-gray-600 rounded-xl text-gray-300 font-medium text-lg hover:border-cyan-500/50 hover:text-cyan-300 transition-all duration-200"
            >
              Learn More
              <ChevronRight className="w-5 h-5" />
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              { value: 'AI', label: 'Powered Questions' },
              { value: 'Voice', label: 'Input Ready' },
              { value: 'Smart', label: 'Roadmaps' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-cyan-400">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to{' '}
              <span className="text-cyan-400">Succeed</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              A complete interview preparation toolkit powered by AI
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Mic,
                title: 'Voice Answers',
                desc: 'Answer questions naturally using your microphone with real-time speech-to-text',
                color: 'cyan',
              },
              {
                icon: Brain,
                title: 'AI Evaluation',
                desc: 'Get instant, detailed feedback on your answers powered by Llama 3.3',
                color: 'purple',
              },
              {
                icon: BookOpen,
                title: 'Prep Roadmap',
                desc: 'Generate a personalized week-by-week study plan tailored to your role',
                color: 'pink',
              },
              {
                icon: Target,
                title: 'Tailored Questions',
                desc: 'Questions generated from your actual job description and resume',
                color: 'cyan',
              },
              {
                icon: Clock,
                title: 'Timed Practice',
                desc: '2-minute timer per question to simulate real interview pressure',
                color: 'purple',
              },
              {
                icon: Zap,
                title: 'Skip & Navigate',
                desc: 'Jump between questions freely and come back to skipped ones',
                color: 'pink',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                whileHover={{ y: -4, transition: { duration: 0.15 } }}
                className="group p-6 rounded-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:border-cyan-500/30 transition-colors duration-200"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  feature.color === 'cyan' ? 'bg-cyan-500/10 text-cyan-400' :
                  feature.color === 'purple' ? 'bg-purple-500/10 text-purple-400' :
                  'bg-pink-500/10 text-pink-400'
                }`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It <span className="text-purple-400">Works</span>
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              { step: '01', title: 'Upload Your Details', desc: 'Add your job description and resume to get personalized questions' },
              { step: '02', title: 'Practice Interview', desc: 'Answer AI-generated questions by voice or text with a timed format' },
              { step: '03', title: 'Get AI Feedback', desc: 'Receive instant evaluation and scoring on each answer' },
              { step: '04', title: 'Build Your Roadmap', desc: 'Generate a tailored preparation plan with weekly goals and resources' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="flex items-start gap-6 p-6 rounded-2xl border border-gray-800 bg-gray-900/30 hover:border-purple-500/30 transition-colors duration-200"
              >
                <div className="text-3xl font-bold bg-gradient-to-b from-purple-400 to-purple-600 bg-clip-text text-transparent shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="max-w-3xl mx-auto text-center p-12 rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-sm relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none" />
          <div className="relative z-10">
            <Shield className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Ace Your Interview?
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              Start practicing now and walk into your next interview with confidence.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white font-semibold text-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
};

export default Landing;
