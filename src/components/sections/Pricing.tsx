import { Check, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const plans = [
  {
    name: 'Mestre Itinerante',
    price: '0',
    description: 'Para quem faz o registro básico de obras.',
    features: ['Até 2 obras ativas', 'Relatórios com logomarca Padrão', 'Envio via link WhatsApp', 'Histórico de 30 dias'],
    cta: 'Começar Grátis',
    popular: false
  },
  {
    name: 'Engenheiro Pro',
    price: '97',
    description: 'A solução ideal para construtoras em crescimento.',
    features: ['Obras Ilimitadas', 'Logomarca Customizada', 'Relatório PDF Direto no WhatsApp', 'Histórico Ilimitado', 'Suporte Prioritário'],
    cta: 'Experimentar Pro',
    popular: true
  },
  {
    name: 'Construtora Elite',
    price: '297',
    description: 'Gestão completa para grandes projetos.',
    features: ['Tudo do Pro', 'Múltiplos Usuários', 'Dashboard de Desempenho', 'Integração Via API', 'Treinamento Exclusivo'],
    cta: 'Falar com Consultor',
    popular: false
  }
]

export const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-offwhite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-4xl md:text-5xl font-display text-brand-dark">
            Um plano para cada etapa <br />
            <span className="text-brand-primary italic">do seu crescimento.</span>
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Comece grátis hoje mesmo e escale conforme sua demanda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`p-10 rounded-[2rem] border transition-all duration-300 relative ${
                plan.popular 
                  ? 'bg-white border-brand-primary shadow-2xl scale-105 z-10' 
                  : 'bg-white/50 border-slate-200 hover:bg-white hover:border-slate-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-primary text-white px-4 py-1 rounded-full text-sm font-bold flex items-center space-x-1 shadow-lg shadow-blue-500/30">
                  <Zap className="w-3 h-3 fill-white" />
                  <span>MAIS POPULAR</span>
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-brand-dark">{plan.name}</h3>
                  <p className="text-slate-500 mt-2">{plan.description}</p>
                </div>

                <div className="flex items-baseline">
                  <span className="text-sm font-semibold text-slate-500">R$</span>
                  <span className="text-5xl font-bold text-brand-dark">{plan.price}</span>
                  <span className="text-slate-500 ml-1">/mês</span>
                </div>

                <ul className="space-y-4">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start space-x-3 text-slate-600">
                      <Check className="w-5 h-5 text-brand-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-4 rounded-xl font-bold transition-all ${
                  plan.popular 
                    ? 'btn-primary' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}>
                  {plan.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
