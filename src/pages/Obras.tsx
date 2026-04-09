import { useState, useEffect } from 'react';
import { Plus, Building2, Search, ExternalLink, MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ObraModal } from '../components/features/ObraModal';
import { Obra, useObraStore } from '../store/obraStore';

export const Obras = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const { obras, fetchObras, isLoading } = useObraStore();

  useEffect(() => {
    fetchObras();
  }, [fetchObras]);

  const handleEditObra = (obra: Obra) => {
    setSelectedObra(obra);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedObra(null);
  };

  const filteredObras = obras
    .filter(obra => {
      const matchesSearch = 
        obra.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obra.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obra.cidade?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const obraDate = new Date(obra.created_at).toISOString().split('T')[0];
      const matchesStart = !startDate || obraDate >= startDate;
      const matchesEnd = !endDate || obraDate <= endDate;

      return matchesSearch && matchesStart && matchesEnd;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header Section */}
        <div className="mb-8 lg:mb-10">
          <div className="flex items-center space-x-2 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-4">
             <Link to="/dashboard" className="hover:text-[#4318FF] transition-colors">Painel</Link>
             <span className="opacity-30">/</span>
             <span className="text-slate-600">Minhas Obras</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-brand-dark tracking-tight">Gerenciamento de Obras</h1>
              <p className="text-slate-500 text-sm sm:text-base font-medium mt-1">Visualize e organize todos os seus projetos.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center justify-center space-x-3 w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-2xl shadow-xl shadow-blue-500/20"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="font-bold text-sm sm:text-base">Cadastrar Obra</span>
            </button>
          </div>
        </div>

        {/* Filters - Centralized Soft Card */}
        <div className="max-w-5xl mx-auto mb-8 sm:mb-12">
          <div className="soft-card p-5 sm:p-6 lg:p-8 space-y-5 border-none shadow-[14px_17px_40px_4px_rgba(112,144,176,0.12)]">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
               <div className="relative flex-1">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase ml-1 mb-2 block tracking-widest">Busca Inteligente</span>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#4318FF] transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Nome, cliente ou local..." 
                      className="input-compact pl-12 h-12 sm:h-[52px] rounded-2xl text-sm bg-slate-50 border-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
               </div>
               
               <div className="flex flex-col sm:flex-row gap-4 items-end transition-all">
                  <div className="flex flex-col space-y-2 w-full sm:w-auto flex-1">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Data Início</span>
                    <input 
                      type="date" 
                      className="input-compact text-sm h-12 sm:h-[52px] rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-100 w-full" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col space-y-2 w-full sm:w-auto flex-1">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Data Fim</span>
                    <input 
                      type="date" 
                      className="input-compact text-sm h-12 sm:h-[52px] rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-100 w-full" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  
                  {/* Reset Button */}
                  {(startDate || endDate || searchTerm) && (
                    <button 
                      onClick={() => { setStartDate(''); setEndDate(''); setSearchTerm(''); }}
                      className="h-12 sm:h-[52px] px-6 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center border-none w-full sm:w-auto"
                      title="Limpar Filtros"
                    >
                      Limpar
                    </button>
                  )}
               </div>
            </div>
          </div>
        </div>

        {/* Content Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400 font-display italic">
             <div className="w-12 h-12 border-4 border-slate-100 border-t-[#4318FF] rounded-full animate-spin mb-4" />
             Carregando seus projetos...
          </div>
        ) : filteredObras.length === 0 ? (
          <div className="soft-card border-dashed border-2 border-slate-100 p-16 sm:p-24 text-center bg-transparent shadow-none">
             <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-50">
                <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-slate-200" />
             </div>
             <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-400">Nenhuma obra encontrada</h3>
             <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-sm mx-auto">Ajuste os filtros de busca ou cadastre um novo projeto.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 animate-fade-up">
            {/* Desktop Header Mirror */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="col-span-4">Identificação do Projeto</div>
              <div className="col-span-2">Informações Cliente</div>
              <div className="col-span-2">Localidade</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-1 text-center">Relatórios</div>
              <div className="col-span-2 text-right pr-4">Ações Rápidas</div>
            </div>

            {filteredObras.map((obra) => (
              <div 
                key={obra.id} 
                onClick={() => handleEditObra(obra)}
                className="bg-white rounded-[1.5rem] p-5 lg:p-0 shadow-sm hover:shadow-soft lg:h-28 flex flex-col lg:grid lg:grid-cols-12 gap-5 lg:gap-4 items-center cursor-pointer transition-all border border-slate-50 border-l-4 border-l-transparent lg:hover:border-l-[#4318FF] group"
              >
                {/* ID / Name */}
                <div className="lg:col-span-4 lg:pl-8 flex items-center w-full min-w-0">
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-soft-bg flex items-center justify-center text-[#4318FF] group-hover:bg-white group-hover:shadow-sm transition-all shrink-0">
                      <Building2 className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-display text-base sm:text-lg font-bold text-brand-dark group-hover:text-[#4318FF] transition-colors block leading-tight truncate">{obra.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] sm:text-[10px] text-[#4318FF] font-bold uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/50">
                          {obra.ndo ? `NDO: ${obra.ndo}` : `ID: ${obra.id.split('-')[0]}`}
                        </span>
                      </div>
                    </div>
                    {/* Mobile Chevron */}
                    <ChevronRight className="lg:hidden w-5 h-5 text-slate-300" />
                  </div>
                </div>

                {/* Client - Full width row on mobile */}
                <div className="lg:col-span-2 flex flex-col w-full lg:w-auto border-t border-slate-50 lg:border-none pt-4 lg:pt-0">
                  <span className="text-sm text-brand-dark font-bold block leading-tight truncate">{obra.client_name}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Titular do Contrato</span>
                </div>

                {/* Location */}
                <div className="lg:col-span-2 flex items-center text-slate-500 text-xs font-semibold w-full lg:w-auto">
                  <MapPin className="w-4 h-4 mr-2.5 text-[#4318FF]/40 shrink-0" />
                  <span className="truncate">{obra.cidade || 'Não informada'}</span>
                </div>

                {/* Status & Reports - Grouped on mobile */}
                <div className="w-full lg:col-span-2 flex items-center justify-between lg:justify-center gap-4 py-3 lg:py-0 bg-slate-50/50 lg:bg-transparent px-4 lg:px-0 rounded-2xl">
                   {/* Status */}
                   <div className="lg:col-span-1">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm ${
                        obra.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 
                        obra.status === 'completed' ? 'bg-blue-50 text-blue-600 border border-blue-100/50' : 'bg-slate-100 text-slate-400'
                      }`}>
                         {obra.status === 'active' ? 'Ativa' : 
                          obra.status === 'completed' ? 'Concluída' : 'Pausada'}
                      </span>
                   </div>

                   {/* Reports Count */}
                   <div className="lg:col-span-1 flex flex-col items-end lg:items-center">
                      <span className="text-lg sm:text-xl font-display font-bold text-brand-dark">{obra.total_reports}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Registros</span>
                   </div>
                </div>

                {/* Action Button - Sticky at bottom/end of card */}
                <div className="lg:col-span-2 lg:pr-8 flex justify-end w-full lg:w-auto mt-2 lg:mt-0" onClick={(e) => e.stopPropagation()}>
                  <Link 
                    to={`/dashboard/obras/${obra.id}/relatorios`}
                    className="bg-[#4318FF] hover:bg-[#3311DB] text-white flex items-center justify-center space-x-2 px-6 py-4 lg:py-3 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 w-full lg:w-auto whitespace-nowrap"
                  >
                    <span className="text-xs font-bold uppercase tracking-widest">Painel do Projeto</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      <ObraModal 
        isOpen={isModalOpen} 
        obra={selectedObra}
        onClose={handleCloseModal} 
      />
    </div>
  );
};
