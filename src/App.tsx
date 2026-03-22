import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Login';
import Home from './pages/Home';
import Interview from './pages/Interview';
import Report from './pages/Report';
import History from './pages/History';
import Prepare from './pages/Prepare';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { InterviewProvider } from './context/InterviewContext';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/prepare" element={<ProtectedRoute><Prepare /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <InterviewProvider>
          <div className="flex flex-col min-h-screen relative overflow-x-hidden">
            {/* Animated grid background */}
            <div className="bg-grid" />

            {/* Floating orbs */}
            <div className="orb orb-cyan w-96 h-96 -top-48 -left-48 fixed" />
            <div className="orb orb-purple w-80 h-80 top-1/3 -right-40 fixed" />
            <div className="orb orb-cyan w-64 h-64 bottom-0 left-1/4 fixed" />

            {/* Content */}
            <div className="relative z-10 flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow flex flex-col">
                <AnimatedRoutes />
              </main>
              <Footer />
            </div>
          </div>
        </InterviewProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
