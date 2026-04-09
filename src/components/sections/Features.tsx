import { Camera, FileText, Share2, Smartphone, Shield, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    title: 'Registro Instantâneo',
    description: 'Capture fotos da obra e anote observações em tempo real diretamente do canteiro.',
    icon: Camera,
    color: 'bg-blue-50 text-blue-600'
  },
  {
    title: 'Relatórios Geometria',
    description: 'Relatórios organizados com data, hora, clima e localização automática de cada foto.',
    icon: FileText,
    color: 'bg-blue-50 text-[#4318FF]'
  },
  {
    title: 'Envio Pelo WhatsApp',
    description: 'Encaminhe o PDF final para o cliente ou supervisor com um único clique.',
    icon: Share2,
    color: 'bg-green-50 text-green-600'
  },
  {
    title: 'App Mobile Leve',
    description: 'Funciona perfeitamente em qualquer dispositivo, mesmo em conexões instáveis.',
    icon: Smartphone,
    color: 'bg-purple-50 text-purple-600'
  },
  {
    title: 'Segurança de Dados',
    description: 'Suas fotos e relatórios ficam seguros e organizados por obra na nuvem.',
    icon: Shield,
    color: 'bg-amber-50 text-brand-amber'
  },
  {
    title: 'Economia de Tempo',
    description: 'Reduza em até 80% o tempo gasto na criação de diários e relatórios.',
    icon: Zap,
    color: 'bg-red-50 text-red-600'
  }
]

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-4xl md:text-5xl font-display text-brand-dark">
            Tudo o que você precisa em <br />
            <span className="text-brand-primary italic">um só lugar.</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Desenvolvido para engenheiros e mestres de obra que não têm tempo a perder com burocracia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-8 rounded-[2rem] border border-slate-100 bg-white hover:border-brand-primary/20 hover:shadow-xl hover:shadow-slate-200/40 transition-all group"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${feature.color}`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
