import { Link } from 'react-router-dom'
import { CheckCircle2, Play, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export const Hero = () => {
  return (
    <section id="hero" className="relative pt-32 pb-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-brand-primary/5 to-transparent -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary font-medium text-sm"
          >
            <Zap className="w-4 h-4" />
            <span>A Revolução nos Relatórios de Obra</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-display leading-[1.1]"
          >
            Chega de perder horas com <br />
            <span className="text-brand-primary italic">relatórios manuais.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto"
          >
            O SnapObra automatiza seus diários de obra. Capture fotos, registre o progresso e envie relatórios profissionais via WhatsApp em segundos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link to="/register" className="btn-primary w-full sm:w-auto h-14 flex items-center justify-center">
              Começar Teste Grátis
            </Link>
            <button className="btn-secondary w-full sm:w-auto h-14 flex items-center justify-center space-x-2 group">
              <Play className="w-5 h-5 fill-brand-primary text-brand-primary group-hover:scale-110 transition-transform" />
              <span>Ver Demonstração</span>
            </button>
          </motion.div>

          {/* Social Proof / Features mini */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-8 pt-10 text-slate-400 font-medium"
          >
            {[
              "Relatórios PDF Profissionais",
              "Envio Automático WhatsApp",
              "Fotos de Alta Qualidade",
              "Armazenamento Nuvem"
            ].map((feature, i) => (
              <div key={i} className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-brand-primary/40" />
                <span>{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
