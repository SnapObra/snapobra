import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/layout/AuthLayout'
import { User, Mail, Lock, Phone, Building2, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

export const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            company: formData.company,
          }
        }
      })

      if (authError) throw authError

      // Se o usuário já estiver logado (e-mail confirmado ou confirmação desativada)
      if (data.session) {
        setSession(data.session)
        navigate('/dashboard')
      } else {
        // Fallback caso o Supabase exija confirmação de e-mail apesar do desejo do usuário
        // (Isso depende da config do projeto no painel do Supabase)
        setError('Conta criada com sucesso! Por favor, verifique seu e-mail para ativar sua conta.')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar cadastro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout 
      title="Construindo o seu legado digital." 
      subtitle="Crie sua conta em segundos e comece a automatizar seus relatórios agora mesmo."
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-display text-brand-dark leading-tight">Começar Agora</h1>
          <p className="text-slate-500">Insira seus dados para criar sua conta.</p>
        </div>

        {error && (
          <div className={`p-4 rounded-xl flex items-center gap-3 text-sm animate-fade-up ${
            error.includes('sucesso') ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' : 'bg-red-50 border border-red-100 text-red-600'
          }`}>
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nome e Sobrenome"
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-[#4318FF] outline-none transition-all text-sm"
                />
              </div>
            </div>
            <div className="space-y-1">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">WhatsApp</label>
               <div className="relative">
                 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   type="text" 
                   name="phone"
                   required
                   value={formData.phone}
                   onChange={handleChange}
                   placeholder="(00) 00000-0000"
                   className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-[#4318FF] outline-none transition-all text-sm"
                 />
               </div>
            </div>
          </div>

          <div className="space-y-1">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">E-mail Corporativo</label>
             <div className="relative">
               <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="email" 
                 name="email"
                 required
                 value={formData.email}
                 onChange={handleChange}
                 placeholder="seu@trabalho.com"
                 className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all text-sm"
               />
             </div>
          </div>

          <div className="space-y-1">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome da Construtora</label>
             <div className="relative">
               <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input 
                 type="text" 
                 name="company"
                 required
                 value={formData.company}
                 onChange={handleChange}
                 placeholder="Ex: Construtora Silva"
                 className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all text-sm"
               />
             </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Crie uma Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="password" 
                name="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all text-sm"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Mínimo de 8 caracteres.</p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="btn-primary w-full h-14 flex items-center justify-center space-x-2 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Criar Minha Conta</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm">
          Já tem conta?{' '}
          <Link to="/login" className="text-[#4318FF] font-bold hover:underline transition-all">Fazer Login</Link>
        </p>

        <p className="text-center text-[10px] text-slate-400 leading-relaxed max-w-xs mx-auto">
          Ao se cadastrar, você concorda com nossos Termos de Uso e Política de Privacidade.
        </p>
      </div>
    </AuthLayout>
  )
}
