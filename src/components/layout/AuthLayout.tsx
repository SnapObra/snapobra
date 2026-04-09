import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F4F7FE]">
      {/* Left Side: Brand & Visual */}
      <div className="hidden md:flex md:w-1/2 bg-[#4318FF] relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-transparent pointer-events-none" />
        
        {/* Animated background circles */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/4 -right-1/4 w-[500px] h-[500px] border border-white/5 rounded-full" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-1/4 -left-1/4 w-[600px] h-[600px] border border-white/5 rounded-full" 
        />

        <div className="relative z-10 max-w-md space-y-8">
          <Link to="/">
            <img 
              src="/logo_snapobra.png" 
              alt="SnapObra" 
              className="h-12 w-auto brightness-0 invert" 
            />
          </Link>

          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-display text-white italic leading-tight">
              {title}
            </h2>
            <p className="text-xl text-white/60 leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="pt-8 flex items-center space-x-4">
             <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-10 h-10 rounded-full border-2 border-brand-dark bg-slate-800" />
               ))}
             </div>
             <p className="text-sm text-white/40 italic">+500 engenheiros já automatizam seus relatórios</p>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-24 bg-white md:rounded-l-3xl shadow-2xl relative z-20">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="md:hidden flex justify-center mb-10">
             <Link to="/">
                <img 
                  src="/logo_snapobra.png" 
                  alt="SnapObra" 
                  className="h-10 w-auto" 
                />
             </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
