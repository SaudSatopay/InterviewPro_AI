import { Link, useNavigate } from 'react-router-dom';
import { Mic, GraduationCap, Sparkles, Clock, LogOut, User, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.header
      className="border-b border-white/5 bg-dark-900/80 backdrop-blur-xl sticky top-0 z-50"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link to={isAuthenticated ? '/home' : '/'} className="flex items-center gap-3 group">
            <div className="relative">
              <GraduationCap size={30} className="text-neon-cyan" />
              <div className="absolute inset-0 bg-neon-cyan/20 blur-lg rounded-full group-hover:bg-neon-cyan/30 transition-all" />
            </div>
            <div>
              <span className="text-xl font-bold text-white tracking-tight">
                InterviewPro
              </span>
              <span className="text-xl font-bold text-neon-cyan ml-1">AI</span>
            </div>
          </Link>
        </motion.div>

        {isAuthenticated ? (
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            <motion.div
              className="badge badge-cyan"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Sparkles size={12} className="mr-1.5" />
              v0.5 Beta
            </motion.div>

            <motion.div whileHover={{ scale: 1.08, y: -1 }} whileTap={{ scale: 0.92 }}>
              <Link
                to="/prepare"
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-neon-cyan transition-colors"
              >
                <BookOpen size={14} />
                <span className="hidden sm:inline">Prepare</span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.08, y: -1 }} whileTap={{ scale: 0.92 }}>
              <Link
                to="/history"
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-neon-cyan transition-colors"
              >
                <Clock size={14} />
                <span className="hidden sm:inline">History</span>
              </Link>
            </motion.div>

            <div className="flex items-center gap-1.5 text-sm text-slate-400">
              <User size={14} className="text-neon-purple" />
              <span className="hidden sm:inline">{user?.username}</span>
            </div>

            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.08, color: '#f87171' }}
              whileTap={{ scale: 0.92 }}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-400 transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className="flex items-center gap-2 text-sm text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Mic size={14} className="text-neon-purple" />
            <span className="hidden sm:inline">Voice-Enabled</span>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
