import { Menu, X, HardHat, Home, FileText, Settings, LogOut, User, ChevronRight, ClipboardCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';

export const MobileHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const menuItems = [
    { id: 'home', icon: Home, label: 'Dashboard', path: '/dashboard' },
    { id: 'obras', icon: HardHat, label: 'Minhas Obras', path: '/dashboard/obras' },
    { id: 'relatorios', icon: FileText, label: 'Relatórios', path: '/dashboard/relatorios' },
    { id: 'vistorias', icon: ClipboardCheck, label: 'Vistorias Técnicas', path: '/dashboard/vistorias' },
    { id: 'config', icon: Settings, label: 'Configurações', path: '/dashboard/configuracoes' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const activeTab = [...menuItems].reverse().find(item => 
    location.pathname === item.path || 
    location.pathname.startsWith(item.path + '/')
  )?.id || 'home';

  const userName = profile?.full_name || 'Engenheiro';

  return (
    <>
      <header className="lg:hidden bg-white/80 backdrop-blur-xl border-b border-slate-100 p-4 sticky top-0 z-50 flex justify-between items-center shadow-sm h-16">
        <Link to="/dashboard" className="flex items-center">
          <img 
            src="/logo_snapobra.png" 
            alt="SnapObra" 
            className="h-8 w-auto" 
          />
        </Link>

        <button 
          onClick={() => setIsOpen(true)} 
          className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-600 rounded-xl active:scale-95 transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
            />

            {/* Drawer container (keeps scroll separate from body if needed) */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white z-[70] lg:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 flex justify-between items-center border-b border-slate-50">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#4318FF] flex items-center justify-center text-white">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-brand-dark truncate pr-4">{userName}</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Menu Principal</p>
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all group ${
                      activeTab === item.id 
                        ? 'bg-blue-50/50 text-[#4318FF] shadow-sm' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-[#4318FF]' : ''}`} />
                      <span className="text-sm font-bold tracking-tight">{item.label}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === item.id ? 'opacity-100 flex' : 'hidden'}`} />
                  </button>
                ))}
              </nav>

              <div className="p-6 border-t border-slate-50 bg-slate-50/30">
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-slate-400 bg-white border border-slate-100 hover:text-red-500 hover:border-red-100 transition-all font-bold"
                >
                  <div className="flex items-center space-x-3">
                    <LogOut className="w-5 h-5 font-bold" />
                    <span className="text-sm">Encerrar Sessão</span>
                  </div>
                </button>
                <div className="mt-6 flex items-center justify-center space-x-2 opacity-50">
                   <img src="/logo_snapobra.png" alt="SnapObra" className="h-4 w-auto grayscale" />
                   <span className="text-[10px] font-display font-medium text-slate-400">v1.0 • Pro Plan</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
