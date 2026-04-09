import { Link } from 'react-router-dom'
import { Globe } from 'lucide-react'

export const Footer = () => {
  return (
    <footer className="bg-brand-dark py-16 text-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link to="/" className="flex items-center">
              <img 
                src="/logo_snapobra.png" 
                alt="SnapObra" 
                className="h-10 w-auto brightness-0 invert" 
              />
            </Link>
            <p className="max-w-sm text-lg leading-relaxed">
              Transformando a gestão de obras através da tecnologia e simplicidade. O parceiro ideal do engenheiro moderno.
            </p>
            <div className="flex space-x-4">
              <Link to="#" className="hover:text-brand-primary transition-colors"><Globe /></Link>
              <Link to="#" className="hover:text-brand-primary transition-colors"><Globe /></Link>
              <Link to="#" className="hover:text-brand-primary transition-colors"><Globe /></Link>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-white font-bold text-lg">Plataforma</h4>
            <ul className="space-y-4">
              <li><Link to="#features" className="hover:text-white transition-colors">Funcionalidades</Link></li>
              <li><Link to="#pricing" className="hover:text-white transition-colors">Preços</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Criar Conta</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-white font-bold text-lg">Suporte</h4>
            <ul className="space-y-4">
              <li><Link to="#" className="hover:text-white transition-colors">Ajuda</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Privacidade</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Termos</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Contato</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© {new Date().getFullYear()} SnapObra - Todos os direitos reservados.</p>
          <p className="mt-4 md:mt-0 italic opacity-50 font-display">Construindo o seu legado digital.</p>
        </div>
      </div>
    </footer>
  )
}
