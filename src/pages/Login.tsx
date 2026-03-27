import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, User, Lock, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    const success = login(username, password);
    if (!success) {
      setError('Invalid username or password');
    }
  };

  return (
    <motion.div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        width: '100%',
        padding: '2rem 1rem',
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <motion.div
        style={{ width: '100%', maxWidth: '28rem', margin: '0 auto' }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, duration: 0.2 }}
        >
          <div className="relative inline-flex mb-4">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/20 flex items-center justify-center"
              initial={{ rotate: -15, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.1 }}
            >
              <GraduationCap size={32} className="text-neon-cyan" />
            </motion.div>
            <motion.div
              className="absolute -inset-3 rounded-3xl border border-neon-cyan/10"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <motion.h1
            className="text-2xl font-bold text-white mb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            InterviewPro <span className="text-neon-cyan">AI</span>
          </motion.h1>
          <motion.p
            className="text-slate-500 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.16 }}
          >
            Sign in to start your interview prep
          </motion.p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          className="glass-card p-6 sm:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.2 }}
        >
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto', marginBottom: 20 }}
                exit={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
              >
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.16 }}
            >
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-800 border border-white/5 text-slate-200
                    text-sm outline-none focus:border-neon-cyan/40 focus:shadow-[0_0_15px_rgba(0,240,255,0.1)]
                    transition-all placeholder:text-slate-600"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-800 border border-white/5 text-slate-200
                    text-sm outline-none focus:border-neon-cyan/40 focus:shadow-[0_0_15px_rgba(0,240,255,0.1)]
                    transition-all placeholder:text-slate-600"
                />
              </div>
            </motion.div>

            <motion.button
              type="submit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(0,240,255,0.2)' }}
              whileTap={{ scale: 0.98 }}
              className="btn-neon w-full flex items-center justify-center gap-2 text-sm mt-2"
            >
              <LogIn size={16} />
              Sign In
            </motion.button>
          </form>

          {/* Demo credentials */}
          <motion.div
            className="mt-6 pt-5 border-t border-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={12} className="text-neon-cyan/60" />
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Demo Credentials</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { user: 'admin', pass: 'admin123' },
                { user: 'demo', pass: 'demo123' },
                { user: 'user', pass: 'pass' },
              ].map(({ user, pass }, i) => (
                <motion.button
                  key={user}
                  type="button"
                  onClick={() => { setUsername(user); setPassword(pass); setError(''); }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.04 }}
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.06)' }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-dark-700/50 hover:bg-dark-600 transition-colors text-center cursor-pointer"
                >
                  <p className="text-xs font-medium text-slate-300">{user}</p>
                  <p className="text-[10px] text-slate-600">{pass}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
