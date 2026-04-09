import { useLocation, useNavigate } from 'react-router-dom'
import { Home, HardHat, FileText, Settings, LogOut, User, ClipboardCheck } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useProfileStore } from '../../store/profileStore'
import { useEffect } from 'react'

export const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut, isLoading: authLoading } = useAuthStore()
  const { profile, fetchProfile, isLoading: profileLoading } = useProfileStore()

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Skeleton robusto para evitar FOUC de branding/sessão
  if (authLoading || (profileLoading && !profile)) {
    return (
      <aside className="hidden lg:flex w-72 bg-white/50 backdrop-blur-md min-h-[calc(100vh-2.5rem)] flex-col p-6 soft-card border-none">
        {/* Brand Placeholder */}
        <div className="flex items-center space-x-3 mb-10 px-2 animate-pulse">
          <div className="h-6 w-40 rounded-lg bg-slate-100" />
        </div>

        {/* Navigation Placeholder */}
        <nav className="flex-1 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4 px-4 py-3 animate-pulse">
              <div className="w-5 h-5 rounded bg-slate-100" />
              <div className="h-3 rounded bg-slate-100" style={{ width: `${60 + i * 8}%` }} />
            </div>
          ))}
        </nav>
      </aside>
    );
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const menuItems = [
    { id: 'home', icon: Home, label: 'Dashboard', path: '/dashboard' },
    { id: 'obras', icon: HardHat, label: 'Obras', path: '/dashboard/obras' },
    { id: 'relatorios', icon: FileText, label: 'Relatórios', path: '/dashboard/relatorios' },
    { id: 'vistorias', icon: ClipboardCheck, label: 'Vistoria Técnica', path: '/dashboard/vistorias' },
    { id: 'config', icon: Settings, label: 'Configurações', path: '/dashboard/configuracoes' },
  ]

  const activeTab = [...menuItems].reverse().find(item => 
    location.pathname === item.path || 
    location.pathname.startsWith(item.path + '/')
  )?.id || 'home'
  const userName = profile?.full_name || user?.user_metadata?.full_name || 'Usuário'

  return (
    <aside className="hidden lg:flex w-72 bg-white/70 backdrop-blur-xl min-h-[calc(100vh-2.5rem)] flex-col p-8 soft-card border-none sticky top-5">
      {/* Brand */}
      <div className="flex items-center text-brand-dark mb-10 px-4">
        <span className="font-display text-xl font-bold tracking-tight truncate bg-clip-text text-transparent bg-gradient-to-r from-brand-dark to-slate-500">
          {profile?.company_name || userName}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              navigate(item.path)
            }}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group ${
              activeTab === item.id 
                ? 'bg-brand-soft-bg font-bold text-brand-dark shadow-sm' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <item.icon className={`w-5 h-5 transition-colors ${
                activeTab === item.id ? 'text-[#4318FF]' : 'group-hover:text-slate-500'
              }`} />
              <span className="text-sm tracking-tight">{item.label}</span>
            </div>
            {activeTab === item.id && (
              <div className="w-1.5 h-6 bg-gradient-to-b from-[#4318FF] to-blue-400 rounded-full shadow-[0px_4px_12px_rgba(67,24,255,0.4)]" />
            )}
          </button>
        ))}
      </nav>

      {/* User Footer */}
      <div className="pt-8 border-t border-slate-50 space-y-6">
         <div className="flex items-center space-x-3 px-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#4318FF] to-[#7018FF] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
               <User className="w-5 h-5" />
            </div>
            <div className="min-w-0">
               <p className="text-sm font-bold text-brand-dark leading-none truncate pr-2">
                 {userName}
               </p>
               <div className="flex items-center mt-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#4318FF] bg-blue-50 px-2 py-0.5 rounded-md">Pro Plan</span>
               </div>
            </div>
         </div>
         
         <button 
           onClick={handleSignOut}
           className="flex items-center space-x-3 px-5 py-3.5 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-500 w-full transition-all group font-medium border border-transparent hover:border-red-100"
         >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Encerrar Sessão</span>
         </button>
      </div>
    </aside>
  )
}
