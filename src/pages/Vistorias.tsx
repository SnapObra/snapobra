import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Loader2, Calendar, ClipboardCheck, ChevronRight, ImageIcon, FileDown } from 'lucide-react';
import { VistoriaModal } from '../components/features/VistoriaModal';
import { Vistoria, useVistoriaStore } from '../store/vistoriaStore';
import { useObraStore } from '../store/obraStore';
import { generateVistoriaPDF } from '../services/pdf/vistoriaPdfService';

export const Vistorias = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVistoriaId, setSelectedVistoriaId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);
  
  const { vistorias, fetchVistorias, isLoading } = useVistoriaStore();
  const { obras, fetchObras } = useObraStore();

  const selectedVistoria = vistorias.find(v => v.id === selectedVistoriaId) || null;

  useEffect(() => {
    fetchVistorias();
    if (obras.length === 0) fetchObras();
  }, [fetchVistorias, fetchObras, obras.length]);

  const handleEditVistoria = (vt: Vistoria) => {
    setSelectedVistoriaId(vt.id);
    setIsModalOpen(true);
  };

  const handleNewVistoria = () => {
    setSelectedVistoriaId(null);
    setIsModalOpen(true);
  };

  const handleDownloadPDF = async (vt: Vistoria, e: React.MouseEvent) => {
    e.stopPropagation();
    setPdfLoadingId(vt.id);
    try {
      await generateVistoriaPDF(vt);
    } catch (error) {
      console.error('Falha ao gerar PDF:', error);
    } finally {
      setPdfLoadingId(null);
    }
  };

  const filteredVistorias = vistorias
    .filter(vt => {
      const matchesSearch = 
        (vt.empreendimento_nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vt.vt_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vt.proprietario || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStart = !startDate || vt.data_vistoria >= startDate;
      const matchesEnd = !endDate || vt.data_vistoria <= endDate;

      return matchesSearch && matchesStart && matchesEnd;
    })
    .sort((a, b) => new Date(b.data_vistoria).getTime() - new Date(a.data_vistoria).getTime());

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Header / Breadcrumb */}
      <div className="mb-8 lg:mb-10">
        <div className="flex items-center space-x-2 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-4">
           <Link to="/dashboard" className="hover:text-[#4318FF] transition-colors">Painel</Link>
           <span className="opacity-30">/</span>
           <span className="text-slate-400 font-medium tracking-tight">Vistorias Técnicas</span>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-brand-dark tracking-tight">Vistorias Técnicas</h1>
            <p className="text-slate-500 text-sm sm:text-base font-medium mt-1">Laudos de vistoria e checklists de entrega.</p>
          </div>
          <button 
            onClick={handleNewVistoria}
            className="btn-primary flex items-center justify-center space-x-3 w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-2xl shadow-xl shadow-blue-500/20"
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-bold text-sm sm:text-base">Novo Laudo</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-5xl mx-auto mb-8 sm:mb-12">
        <div className="soft-card p-5 sm:p-6 lg:p-8 space-y-5 border-none shadow-[14px_17px_40px_4px_rgba(112,144,176,0.12)]">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
             <div className="relative flex-1">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase ml-1 mb-2 block tracking-widest">Busca Inteligente</span>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#4318FF] transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Número VT, Empreendimento ou Proprietário..." 
                    className="input-compact pl-12 h-12 sm:h-[52px] rounded-2xl text-sm bg-slate-50 border-none focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
             </div>
             
             <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex flex-col space-y-2 w-full sm:w-auto flex-1">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Desde</span>
                  <input 
                    type="date" 
                    className="input-compact text-sm h-12 sm:h-[52px] rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-100 w-full" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-2 w-full sm:w-auto flex-1">
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Até</span>
                  <input 
                    type="date" 
                    className="input-compact text-sm h-12 sm:h-[52px] rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-100 w-full" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                
                {(startDate || endDate || searchTerm) && (
                  <button 
                    onClick={() => { setStartDate(''); setEndDate(''); setSearchTerm(''); }}
                    className="h-12 sm:h-[52px] px-6 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center border-none w-full sm:w-auto"
                  >
                    Limpar
                  </button>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* List Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400 font-display italic">
           <div className="w-12 h-12 border-4 border-slate-100 border-t-[#4318FF] rounded-full animate-spin mb-4" />
           Carregando vistorias...
        </div>
      ) : filteredVistorias.length === 0 ? (
        <div className="soft-card border-dashed border-2 border-slate-100 p-16 sm:p-24 text-center bg-transparent shadow-none">
           <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <ClipboardCheck className="w-8 h-8 sm:w-10 sm:h-10 text-slate-200" />
           </div>
           <h3 className="text-xl sm:text-2xl font-display font-bold text-slate-400">Sem vistorias registradas</h3>
           <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-sm mx-auto">Comece agora criando seu primeiro laudo de vistoria técnica.</p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-up">
          {/* Desktop Header */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="col-span-2">CÓDIGO VT</div>
            <div className="col-span-4">Empreendimento / Proprietário</div>
            <div className="col-span-2">Data</div>
            <div className="col-span-2">Fotos</div>
            <div className="col-span-2 text-right">Ações</div>
          </div>

          {/* Rows */}
          {filteredVistorias.map((vt) => (
            <div 
              key={vt.id} 
              onClick={() => handleEditVistoria(vt)}
              className="bg-white rounded-[1.5rem] p-5 lg:p-0 shadow-sm hover:shadow-soft lg:h-24 flex flex-col lg:grid lg:grid-cols-12 gap-5 lg:gap-4 items-center cursor-pointer transition-all border border-slate-50 border-l-4 border-l-transparent lg:hover:border-l-[#4318FF] group"
            >
              {/* VT Number */}
              <div className="lg:col-span-2 lg:pl-8 flex items-center justify-between lg:justify-start w-full lg:w-auto">
                 <span className="px-3 py-1 bg-slate-50 text-[#4318FF] rounded-xl text-[11px] sm:text-[13px] font-bold group-hover:bg-blue-50 transition-all tracking-wider">
                   {vt.vt_number}
                 </span>
                 <div className="lg:hidden flex items-center text-slate-400 text-[10px] font-bold uppercase">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-40" />
                    {new Date(vt.data_vistoria + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                 </div>
              </div>

              {/* Info */}
              <div className="lg:col-span-4 flex items-center space-x-4 w-full lg:w-auto border-t border-slate-50 lg:border-none pt-4 lg:pt-0">
                <div className="hidden sm:flex w-10 h-10 rounded-xl bg-blue-50/50 items-center justify-center text-[#4318FF] group-hover:bg-white group-hover:shadow-sm transition-all shrink-0">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-brand-dark group-hover:text-[#4318FF] transition-colors leading-tight truncate">
                    {vt.empreendimento_nome || 'Sem nome'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium mt-1 truncate">
                    Proprietário: {vt.proprietario || 'N/A'}
                  </p>
                </div>
                <ChevronRight className="lg:hidden w-5 h-5 text-slate-200" />
              </div>

              {/* Date */}
              <div className="hidden lg:flex lg:col-span-2 items-center text-slate-500 text-xs font-semibold w-full lg:w-auto">
                <Calendar className="w-4 h-4 mr-2.5 text-slate-300 group-hover:text-[#4318FF]/40" />
                {new Date(vt.data_vistoria + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>

              {/* Photos */}
              <div className="lg:col-span-2 flex items-center w-full lg:w-auto">
                <div className="flex items-center text-[10px] sm:text-[11px] font-bold text-slate-400 bg-slate-50/30 lg:bg-slate-50/50 px-3 py-1.5 rounded-xl border border-slate-100 lg:border-none w-full lg:w-auto justify-center lg:justify-start">
                  <ImageIcon className="w-3.5 h-3.5 mr-2 text-slate-300" />
                  {vt.fotos?.length || 0} Evidências
                </div>
              </div>

              {/* Actions */}
              <div className="lg:col-span-2 lg:pr-8 flex justify-end w-full lg:w-auto mt-2 lg:mt-0">
                <button 
                  onClick={(e) => handleDownloadPDF(vt, e)}
                  disabled={pdfLoadingId === vt.id}
                  className="flex items-center justify-center space-x-2 px-6 py-4 lg:py-2.5 bg-slate-50 lg:bg-white border border-slate-100 text-slate-400 hover:text-[#4318FF] hover:border-blue-100 rounded-2xl transition-all shadow-sm group/btn w-full lg:w-auto"
                >
                  {pdfLoadingId === vt.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4" />
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-widest">Baixar PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <VistoriaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        vistoria={selectedVistoria}
      />
    </div>
  );
};
