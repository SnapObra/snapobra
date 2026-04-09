import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, ArrowRight, Building2, Loader2 } from 'lucide-react';
import { ObraModal } from '../components/features/ObraModal';
import { useObraStore } from '../store/obraStore';
import { useReportStore } from '../store/reportStore';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MetricCard = ({ title, value }: any) => (
  <div className="soft-card p-6 sm:p-10 hover:translate-y-[-5px] transition-all duration-300 group cursor-default flex flex-col items-center justify-center text-center">
    <p className="text-[10px] sm:text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">{title}</p>
    <p className="text-4xl sm:text-5xl font-display font-bold text-brand-dark tracking-tight">{value}</p>
  </div>
);

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { obras, fetchObras, isLoading: loadingObras } = useObraStore();
  const { reports, fetchReports, isLoading: loadingReports } = useReportStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchObras();
    fetchReports();
  }, [fetchObras, fetchReports]);

  const isLoading = loadingObras || loadingReports;
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Engenheiro';

  const stats = [
    { title: 'Obras Ativas', value: obras.length },
    { title: 'Relatórios', value: reports.length },
    { title: 'Clientes', value: Array.from(new Set(obras.map(o => o.client_name))).length },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 lg:mb-12">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-brand-dark tracking-tight">Olá, {userName}!</h1>
            <p className="text-sm sm:text-base text-slate-400 font-medium">Bem-vindo de volta ao seu painel de controle.</p>
          </div>


        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-8 lg:mb-12">
          {stats.map((stat, i) => (
            <MetricCard key={i} {...stat} />
          ))}
        </div>

         {/* Main Content Area */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 sm:gap-10">
           {/* Section: List of Obras */}
           <div className="xl:col-span-2 space-y-6">
              <div className="flex justify-between items-end px-2 sm:px-4">
                 <h2 className="text-xl sm:text-2xl font-display font-bold text-brand-dark">Obras Recentes</h2>
                 <Link to="/dashboard/obras" className="text-[#4318FF] text-[11px] sm:text-sm font-bold uppercase tracking-wider hover:opacity-80 transition-opacity">Ver todas</Link>
              </div>
              
              <div className="soft-card overflow-hidden animate-fade-up border-none">
                 {isLoading ? (
                   <div className="p-16 text-center text-slate-400 text-sm flex flex-col items-center">
                     <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#4318FF]" />
                     Sincronizando seus projetos...
                   </div>
                 ) : obras.length === 0 ? (
                   <div className="p-12 sm:p-20 text-center space-y-6">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                         <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-slate-200" />
                      </div>
                      <div className="space-y-2">
                         <h3 className="text-lg sm:text-xl font-bold text-brand-dark">Sua lista está vazia</h3>
                         <p className="text-xs sm:text-slate-400 max-w-xs mx-auto">Comece agora mesmo cadastrando seu primeiro projeto de engenharia.</p>
                      </div>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary mx-auto px-10 py-3 sm:py-4"
                      >
                         Cadastrar Primeira Obra
                      </button>
                   </div>
                 ) : (
                    <div className="w-full">
                       {/* Desktop Table */}
                       <div className="hidden sm:block overflow-x-auto">
                          <table className="w-full text-left">
                             <thead className="bg-slate-50/30 border-b border-slate-50">
                                <tr>
                                   <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Projeto</th>
                                   <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400 hidden sm:table-cell">Cliente</th>
                                   <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                                   <th className="px-8 py-5 text-right"></th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-50">
                                {obras.slice(0, 5).map((obra) => (
                                   <tr key={obra.id} className="group hover:bg-slate-50/40 transition-colors">
                                      <td className="px-8 py-6">
                                         <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 rounded-2xl bg-brand-soft-bg flex items-center justify-center text-[#4318FF] transition-colors group-hover:bg-white group-hover:shadow-sm">
                                               <Building2 className="w-6 h-6" />
                                            </div>
                                            <div>
                                               <div className="flex items-center gap-2">
                                                  <p className="text-base font-bold text-brand-dark group-hover:text-[#4318FF] transition-colors">{obra.name}</p>
                                                  {obra.ndo && (
                                                    <span className="text-[10px] font-bold text-[#4318FF] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/50 uppercase tracking-tighter">
                                                      NDO: {obra.ndo}
                                                    </span>
                                                  )}
                                                </div>
                                               <p className="text-xs text-slate-400 font-medium mt-0.5">{obra.cidade}, {obra.estado}</p>
                                            </div>
                                         </div>
                                      </td>
                                      <td className="px-8 py-6 text-sm text-slate-500 font-medium hidden sm:table-cell">
                                         {obra.client_name}
                                      </td>
                                      <td className="px-8 py-6">
                                         <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                                           obra.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                          }`}>
                                            {obra.status === 'active' ? 'Ativa' : 'Pausada'}
                                         </span>
                                      </td>
                                      <td className="px-8 py-6 text-right">
                                         <Link 
                                           to={`/dashboard/obras/${obra.id}/relatorios`}
                                           className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-xl transition-all opacity-0 group-hover:opacity-100 hover:bg-[#4318FF] hover:text-white mx-auto shadow-sm"
                                         >
                                            <ArrowRight className="w-5 h-5" />
                                         </Link>
                                      </td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>

                       {/* Mobile List View */}
                       <div className="sm:hidden divide-y divide-slate-50 px-4">
                          {obras.slice(0, 5).map((obra) => (
                             <Link 
                                key={obra.id}
                                to={`/dashboard/obras/${obra.id}/relatorios`}
                                className="flex items-center justify-between py-5 group active:bg-slate-50 transition-colors"
                             >
                                <div className="flex items-center space-x-4 pr-4 min-w-0">
                                   <div className="w-11 h-11 rounded-xl bg-brand-soft-bg flex items-center justify-center text-[#4318FF] shrink-0">
                                      <Building2 className="w-5 h-5" />
                                   </div>
                                   <div className="min-w-0">
                                      <p className="text-sm font-bold text-brand-dark group-hover:text-[#4318FF] transition-colors truncate">{obra.name}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                         <span className="text-[9px] font-bold text-slate-400 uppercase truncate">{obra.cidade}</span>
                                         <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                           obra.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                         }`}>
                                            {obra.status === 'active' ? 'Ativa' : 'Pausada'}
                                         </span>
                                      </div>
                                   </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#4318FF] transition-colors shrink-0" />
                             </Link>
                          ))}
                       </div>
                    </div>
                  )}
              </div>
           </div>

           {/* Latest Reports Sidebar */}
           <div className="space-y-6">
              <h2 className="text-lg sm:text-xl font-display font-bold text-brand-dark px-2 sm:px-4">Relatórios Recentes</h2>
              <div className="soft-card p-6 sm:p-8 space-y-5 lg:h-[520px] relative">
                 {reports.length === 0 ? (
                   <div className="py-20 text-center flex flex-col items-center justify-center h-full">
                     <ClipboardCheck className="w-12 h-12 text-slate-100 mb-4" />
                     <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Nenhum registro</p>
                   </div>
                 ) : (
                   <div className="space-y-4">
                    {reports.slice(0, 5).map((report) => (
                      <Link 
                        key={report.id}
                        to={`/dashboard/relatorios/${report.id}`}
                        className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
                      >
                        <div className="w-12 h-12 bg-brand-soft-bg rounded-2xl flex items-center justify-center text-[#05CD99] group-hover:bg-white group-hover:shadow-sm transition-all shrink-0">
                          <ClipboardCheck className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-brand-dark truncate group-hover:text-[#4318FF] transition-colors">{report.title}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">
                            {format(new Date(report.date), "dd MMM, yyyy", { locale: ptBR })}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-[#4318FF] group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                   </div>
                 )}
                 
                 <div className="lg:absolute lg:bottom-8 lg:left-8 lg:right-8 mt-4 lg:mt-0">
                  <Link 
                    to="/dashboard/relatorios"
                    className="flex items-center justify-center w-full py-4 text-[11px] font-bold uppercase tracking-widest text-[#4318FF] bg-blue-50/50 rounded-2xl hover:bg-blue-50 transition-all border border-blue-100/50"
                  >
                      Ver Atividade Completa
                  </Link>
                 </div>
              </div>
           </div>
        </div>
      <ObraModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
