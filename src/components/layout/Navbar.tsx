import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Menu, X } from 'lucide-react'

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-offwhite/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center group">
            <img 
              src="/logo_snapobra.png" 
              alt="SnapObra" 
              className="h-10 w-auto transform group-hover:scale-105 transition-transform duration-300" 
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/#features" className="text-slate-600 hover:text-brand-primary transition-colors">Funcionalidades</Link>
            <Link to="/#pricing" className="text-slate-600 hover:text-brand-primary transition-colors">Planos</Link>
            <Link to="/login" className="text-slate-600 hover:text-brand-primary transition-colors">Entrar</Link>
            <Link to="/register" className="btn-primary py-2 px-6">Começar Agora</Link>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-slate-600" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4 animate-fade-up">
          <Link to="/#features" className="block text-slate-600" onClick={() => setIsOpen(false)}>Funcionalidades</Link>
          <Link to="/#pricing" className="block text-slate-600" onClick={() => setIsOpen(false)}>Planos</Link>
          <Link to="/login" className="block text-slate-600" onClick={() => setIsOpen(false)}>Entrar</Link>
          <Link to="/register" className="btn-primary block text-center" onClick={() => setIsOpen(false)}>Começar Agora</Link>
        </div>
      )}
    </nav>
  )
}
