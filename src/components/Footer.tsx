import { Github, Heart, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <motion.footer
      className="border-t border-white/5 bg-dark-900/80 backdrop-blur-xl py-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.2 }}
    >
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Cpu size={14} className="text-neon-cyan/50" />
          <span>&copy; {new Date().getFullYear()} InterviewPro AI &mdash; Powered by Groq &amp; Llama 3.3</span>
        </div>
        <div className="flex items-center gap-5">
          <motion.a
            href="#"
            className="hover:text-neon-cyan transition-colors flex items-center gap-1.5"
            whileHover={{ scale: 1.08, y: -1 }}
            whileTap={{ scale: 0.92 }}
          >
            <Github size={14} />
            <span>Source</span>
          </motion.a>
          <div className="flex items-center gap-1.5">
            <span>Built with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Heart size={14} className="text-neon-pink fill-current" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
