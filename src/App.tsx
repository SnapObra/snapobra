import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import Dashboard from './pages/Dashboard'
import { Obras } from './pages/Obras'
import { Relatorios } from './pages/Relatorios'
import { Vistorias } from './pages/Vistorias'
import { ReportView } from './pages/ReportView'
import { PublicReportView } from './pages/PublicReportView'
import Settings from './pages/Settings'
import { useAuthStore } from './store/authStore'

import { DashboardLayout } from './components/layout/DashboardLayout'

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useAuthStore()
  
  if (isLoading) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50">
        {/* Mobile Header Placeholder - Coincidindo com bg-brand-dark */}
        <div className="lg:hidden h-16 w-full bg-brand-dark flex items-center px-4">
          <div className="w-8 h-8 bg-brand-primary/20 rounded-lg animate-pulse" />
        </div>
        
        {/* Sidebar Placeholder (Uniformizado) */}
        <div className="hidden lg:block w-72 bg-brand-dark min-h-screen" />
        
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

const AppContent = () => {
  const location = useLocation()
  const { initialize } = useAuthStore()
  const isDashboard = location.pathname.startsWith('/dashboard')
  const isAuth = location.pathname === '/login' || location.pathname === '/register'

  useEffect(() => {
    initialize()
  }, [initialize])

  if (isDashboard) {
    return (
      <Routes>
        {/* Rotas do Dashboard com Layout Centralizado */}
        <Route 
          path="/dashboard" 
          element={
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          } 
        >
          <Route index element={<Dashboard />} />
          <Route path="obras" element={<Obras />} />
          <Route path="obras/:obraId/relatorios" element={<Relatorios />} />
          <Route path="obras/:obraId/vistorias" element={<Vistorias />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="vistorias" element={<Vistorias />} />
          <Route path="relatorios/:reportId" element={<ReportView />} />
          <Route path="configuracoes" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        {/* Fallback para rotas inexistentes dentro de /dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite">
      {!isAuth && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/public/relatorios/:reportId" element={<PublicReportView />} />
          
          {/* Se tentar acessar algo fora e não for dashboard, volta pra landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
