import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Save, Share2, Trash2, Edit3, 
  Calendar, Loader2, Maximize2, Copy, Check, FileCheck
} from 'lucide-react';
import { PhotoUploadGrid } from '../components/features/PhotoUploadGrid';
import { useReportStore, Foto } from '../store/reportStore';
import { useObraStore } from '../store/obraStore';
import { useProfileStore } from '../store/profileStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { downloadPremiumPDF } from '../services/pdf/pdfGeneratorService';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { shortenUrl } from '../lib/urlShortener';
import { GripVertical } from 'lucide-react';

export const ReportView = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { 
    currentReport, fetchReportById, updateFotoCaption, updateFotoArea, 
    deleteFoto, createAtividade, deleteAtividade, isLoading: isReportLoading 
  } = useReportStore();
  const { obras, fetchObras } = useObraStore();
  const { profile, fetchProfile, isLoading: isProfileLoading } = useProfileStore();
  
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [tempCaption, setTempCaption] = useState('');
  const [isCopying, setIsCopying] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isShortening, setIsShortening] = useState(false);
  const [localFotos, setLocalFotos] = useState<Foto[]>([]);
  const [newArea, setNewArea] = useState('Geral');
  const [newActivity, setNewActivity] = useState('');
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  
  const commonAreas = ['Geral', 'Fundação', 'Estrutura', 'Alvenaria', 'Instalações', 'Elétrica', 'Hidráulica', 'Revestimento', 'Acabamento', 'Canteiro', 'Pintura'];

  useEffect(() => {
    if (currentReport?.fotos) {
      setLocalFotos(currentReport.fotos);
    }
  }, [currentReport]);

  const onDragEnd = async (result: any) => {
    if (!result.destination || !currentReport || !reportId) return;

    const items = Array.from(localFotos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLocalFotos(items);
    await useReportStore.getState().updateFotosOrder(reportId, items);
  };

  useEffect(() => {
    if (reportId) {
      fetchReportById(reportId);
    }
    fetchObras();
    fetchProfile();
  }, [reportId, fetchReportById, fetchObras, fetchProfile]);

  const isLoading = isReportLoading || isProfileLoading;

  const handleSaveCaption = async (fotoId: string, area?: string) => {
    await updateFotoCaption(fotoId, tempCaption);
    if (area) await updateFotoArea(fotoId, area);
    setEditingCaption(null);
    if (reportId) fetchReportById(reportId); // Recarregar para garantir sincronia
  };

  const handleAddActivity = async () => {
    if (!reportId || !currentReport || !newActivity) return;
    setIsAddingActivity(true);
    try {
      await createAtividade(reportId, currentReport.obra_id, newArea, newActivity);
      setNewActivity('');
      setNewArea('Geral');
    } finally {
      setIsAddingActivity(false);
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (window.confirm('Excluir esta atividade?')) {
      await deleteAtividade(id);
    }
  };

  const handleDeletePhoto = async (foto: Foto) => {
    if (window.confirm('Deseja realmente remover esta foto?')) {
      await deleteFoto(foto.id, foto.storage_path);
    }
  };

  const handleDeleteReport = async () => {
    if (!reportId || !currentReport) return;
    if (window.confirm('Tem certeza que deseja excluir todo este relatório? Esta ação não pode ser desfeita.')) {
      try {
        await useReportStore.getState().deleteReport(reportId);
        navigate(`/dashboard/obras/${currentReport.obra_id}/relatorios`);
      } catch (error) {
        console.error('Erro ao deletar relatório:', error);
        alert('Erro ao excluir o relatório.');
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (!currentReport || !profile) return;
    
    const obraObj = obras.find(o => o.id === currentReport.obra_id);
    if (!obraObj) return;

    setIsGeneratingPDF(true);
    try {
      await downloadPremiumPDF(currentReport, profile, obraObj);
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      alert('Ocorreu um erro ao gerar o PDF Premium.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Ocultado temporariamente a pedido do usuário
  // const handleGenerateAIReport = async () => { ... }

  const handleShareWhatsApp = async () => {
    if (!currentReport) return;
    setIsShortening(true);
    try {
      const obra = obras.find(o => o.id === currentReport.obra_id);
      const publicUrl = `${window.location.origin}/public/relatorios/${reportId}`;
      const shortUrl = await shortenUrl(publicUrl);
      const message = `Olá! Segue o Relatório Fotográfico da obra: ${obra?.name}. \n\nVisualize aqui: ${shortUrl}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
    } finally {
      setIsShortening(false);
    }
  };

  const copyToClipboard = async () => {
    const publicUrl = `${window.location.origin}/public/relatorios/${reportId}`;
    setIsShortening(true);
    try {
      const shortUrl = await shortenUrl(publicUrl);
      await navigator.clipboard.writeText(shortUrl);
      setIsCopying(true);
      setTimeout(() => setIsCopying(false), 2000);
    } finally {
      setIsShortening(false);
    }
  };

  if (isLoading && !currentReport) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!currentReport) return null;

  const obra = obras.find(o => o.id === currentReport.obra_id);

  return (
    <div className="min-h-screen bg-[#F4F7FE] p-4 lg:p-8 animate-fade-in">
      <div id="report-content" className="max-w-6xl mx-auto space-y-8">
        
        {/* Breadcrumbs e Botão Voltar */}
        <div className="flex items-center justify-between mb-2 px-2">
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
             <Link to={`/dashboard/obras/${currentReport.obra_id}/relatorios`} className="hover:text-[#4318FF] flex items-center transition-colors">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Relatórios
             </Link>
             <span className="opacity-30">/</span>
             <span className="text-slate-600 font-bold uppercase tracking-widest truncate max-w-[200px]">{currentReport.title}</span>
          </div>
        </div>

        {/* Card Principal de Informações */}
        <div className="soft-card p-6 lg:p-10 relative overflow-hidden">
          {/* Background Accent Decorativo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#4318FF]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          
          {profile?.company_logo_url && (
            <div className="mb-10 pb-8 border-b border-slate-50 flex justify-between items-center relative z-10">
              <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-50">
                <img src={profile.company_logo_url} alt={profile.company_name || 'Logo'} className="h-10 w-auto object-contain" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{profile.company_name}</p>
                <p className="text-[9px] text-[#4318FF]/60 font-bold uppercase tracking-tighter">Powered by SnapObra</p>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
            <div className="flex-1 space-y-6 flex flex-col items-center md:items-start w-full text-center md:text-left">
              <div className="space-y-4 flex flex-col items-center md:items-start">
                <div className="flex items-center space-x-3 text-[#4318FF]">
                   <div className="w-2.5 h-2.5 rounded-full bg-[#4318FF] animate-pulse" />
                   <span className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-80">Documento Técnico Oficial</span>
                </div>
                <h1 className="text-3xl lg:text-5xl font-display font-bold text-brand-dark leading-tight -tracking-wide">
                  {currentReport.title}
                </h1>
              </div>

              <div className="flex flex-row items-center justify-center gap-3 w-full">
                 <div className="flex items-center justify-center space-x-2.5 bg-[#F4F7FE] px-3 sm:px-4 py-2 rounded-2xl border border-white flex-1 sm:flex-initial">
                    <Calendar className="w-4 h-4 text-[#4318FF]" />
                    <span className="text-[11px] sm:text-[13px] font-bold text-slate-600 truncate">
                      {format(new Date(currentReport.date), "dd/MM/yyyy")}
                    </span>
                 </div>
                 <div className="flex items-center justify-center space-x-2.5 bg-[#F4F7FE] px-3 sm:px-4 py-2 rounded-2xl border border-white flex-1 sm:flex-initial">
                    <div className="w-1.5 h-1.5 bg-[#4318FF]/30 rounded-full shrink-0" />
                    <div className="flex items-baseline space-x-1 truncate">
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Projeto:</span>
                      <span className="text-[11px] sm:text-[13px] font-bold text-brand-dark truncate">{obra?.name}</span>
                    </div>
                 </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center md:items-start gap-4 w-full md:w-auto mt-2">
              {currentReport.pdf_url ? (
                <a 
                  href={currentReport.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm transition-all shadow-xl hover:-translate-y-1 active:translate-y-0 w-full sm:w-auto"
                >
                  <FileCheck className="w-5 h-5 text-[#4318FF]" />
                  <span>Visualizar PDF Final</span>
                </a>
              ) : (
                <button 
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#4318FF] text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 hover:brightness-110 hover:-translate-y-1 active:translate-y-0 w-full sm:w-auto"
                >
                  {isGeneratingPDF ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileCheck className="w-5 h-5" />}
                  <span>{isGeneratingPDF ? 'Gerando Documento...' : 'Exportar PDF Premium'}</span>
                </button>
              )}
              
              <div className="flex gap-3 justify-center w-full sm:w-auto">
                 <button 
                   onClick={handleShareWhatsApp}
                   disabled={isShortening}
                   className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all shadow-lg ${
                     isShortening ? 'bg-emerald-100' : 'bg-white hover:bg-emerald-50 border border-slate-50 text-emerald-500 shadow-emerald-500/5'
                   }`}
                   title="Compartilhar no WhatsApp"
                 >
                   {isShortening ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
                 </button>
                 
                 <button 
                   onClick={copyToClipboard}
                   disabled={isShortening}
                   className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all shadow-lg border ${
                     isCopying ? 'bg-blue-50 border-blue-200 text-[#4318FF]' : 'bg-white border-slate-50 text-slate-400 hover:text-[#4318FF]'
                   }`}
                   title="Copiar Link Público"
                 >
                   {isShortening ? <Loader2 className="w-5 h-5 animate-spin" /> : (isCopying ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />)}
                 </button>

                 <button 
                   onClick={handleDeleteReport}
                   className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all shadow-lg"
                   title="Excluir Relatório"
                 >
                   <Trash2 className="w-5 h-5" />
                 </button>
              </div>
            </div>
          </div>

          {currentReport.notes && (
            <div className="mt-10 p-6 bg-[#F4F7FE] rounded-[1.5rem] relative flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#4318FF] rounded-full hidden sm:block" />
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#4318FF] rounded-full sm:hidden" />
              <p className="text-slate-600 text-sm italic leading-relaxed pt-2 sm:pt-0 sm:pl-4">
                "{currentReport.notes}"
              </p>
            </div>
          )}
        </div>

        {/* Atividades Realizadas - Novo Design SnapSoft */}
        <div className="soft-card overflow-hidden">
           <div className="p-6 px-8 flex justify-between items-center border-b border-slate-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#4318FF]/10 rounded-2xl flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-[#4318FF]" />
                </div>
                <h2 className="text-sm font-bold text-brand-dark uppercase tracking-widest">Cronograma de Atividades</h2>
              </div>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4F7FE]/50">
                    <th className="p-5 px-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Setor / Área</th>
                    <th className="p-5 px-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Descrição Técnica</th>
                    <th className="p-5 px-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="p-5 px-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentReport.atividades && currentReport.atividades.length > 0 ? (
                    currentReport.atividades.map((atv) => (
                      <tr key={atv.id} className="hover:bg-[#F4F7FE]/30 transition-colors group">
                        <td className="p-5 px-8">
                          <span className="text-[13px] font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-50 shadow-sm">{atv.area}</span>
                        </td>
                        <td className="p-5 px-8 text-[13px] text-slate-500 leading-relaxed max-w-md">{atv.description}</td>
                        <td className="p-5 px-8">
                           <span className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-bold uppercase border border-amber-100">
                              {atv.status === 'em_andamento' ? 'EM ANDAMENTO' : atv.status.replace('_', ' ').toUpperCase()}
                           </span>
                        </td>
                        <td className="p-5 px-8 text-right">
                           <button 
                             onClick={() => handleDeleteActivity(atv.id)}
                             className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-slate-400 text-sm italic">Nenhuma atividade registrada para esta visita técnica.</td>
                    </tr>
                  )}
                  
                  {/* Linha para adicionar nova atividade (Glassmorphism inspired) */}
                  <tr className="bg-[#F4F7FE]/20">
                    <td className="p-4 px-8">
                       <div className="relative">
                          <select 
                            className="w-full bg-white border border-slate-100 rounded-xl p-3 text-xs font-bold text-slate-600 focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/5 outline-none appearance-none transition-all shadow-sm"
                            value={newArea}
                            onChange={(e) => setNewArea(e.target.value)}
                          >
                             {commonAreas.map(area => <option key={area} value={area}>{area}</option>)}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                            <div className="w-1 h-1 border-r-2 border-b-2 border-slate-900 rotate-45" />
                          </div>
                       </div>
                    </td>
                    <td className="p-4 px-8">
                       <input 
                          type="text" 
                          placeholder="Descreva a atividade realizada..." 
                          className="w-full bg-white border border-slate-100 rounded-xl p-3 text-xs focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/5 outline-none transition-all shadow-sm"
                          value={newActivity}
                          onChange={(e) => setNewActivity(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddActivity()}
                       />
                    </td>
                    <td className="p-4 px-8">
                       <div className="w-24 h-8 bg-white/50 border border-white rounded-xl shadow-inner" />
                    </td>
                    <td className="p-4 px-8 text-right">
                       <button 
                         onClick={handleAddActivity}
                         disabled={isAddingActivity || !newActivity}
                         className="w-11 h-11 bg-[#4318FF] text-white rounded-2xl hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center shadow-lg shadow-blue-500/20"
                       >
                          {isAddingActivity ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                       </button>
                    </td>
                  </tr>
                </tbody>
              </table>
           </div>
        </div>

        {/* Photo Section */}
        <div className="space-y-10 pb-24">
          <div className="flex items-center justify-between px-2">
             <h2 className="text-2xl font-display font-bold text-brand-dark flex items-center">
               Galeria de Registros 
               <span className="ml-4 px-3 py-1 bg-white rounded-full text-xs text-[#4318FF] font-bold border border-slate-50 shadow-sm">
                 {currentReport.fotos?.length || 0} fotos
               </span>
             </h2>
          </div>

          {/* Grid de Fotos com SnapSoft Styling */}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="fotos" direction="vertical">
              {(provided) => (
                <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
                >
                  {localFotos.map((foto, index) => (
                    <Draggable key={foto.id} draggableId={foto.id} index={index}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`soft-card group overflow-hidden transition-all animate-fade-up ${
                            snapshot.isDragging ? 'rotate-2 scale-105 z-50 ring-4 ring-[#4318FF]/20 shadow-2xl' : ''
                          }`}
                        >
                          {/* Image Container */}
                          <div className="relative aspect-[16/10] bg-slate-50 overflow-hidden">
                            <img 
                              src={foto.public_url} 
                              alt={`Foto ${index + 1}`} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            
                            {/* Overlay de Ações (Glassmorphism) */}
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-6">
                              <div className="flex justify-between items-start">
                                <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/20">
                                  <span className="text-[10px] text-white font-bold tracking-widest uppercase">Registro {index + 1}</span>
                                </div>
                                <div 
                                  {...provided.dragHandleProps}
                                  className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/30 cursor-grab active:cursor-grabbing transition-colors border border-white/10"
                                >
                                  <GripVertical className="w-5 h-5" />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                  <button className="flex-1 py-3 bg-white/20 backdrop-blur-md rounded-2xl text-white text-xs font-bold hover:bg-white/30 transition-all flex items-center justify-center gap-2 border border-white/10">
                                    <Maximize2 className="w-4 h-4" /> Ampliar
                                  </button>
                                  <button 
                                    onClick={() => handleDeletePhoto(foto)}
                                    className="w-12 h-12 bg-red-500/20 backdrop-blur-md rounded-2xl text-white hover:bg-red-500/40 transition-all flex items-center justify-center border border-white/10"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                              </div>
                            </div>
                          </div>

                          {/* Caption Area */}
                          <div className="p-6">
                            {editingCaption === foto.id ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Localização / Setor</label>
                                    <select 
                                      className="w-full bg-[#F4F7FE] border border-slate-100 rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#4318FF] transition-all"
                                      value={tempCaption.split('||')[1] || foto.area_setor || 'Geral'}
                                      onChange={(e) => setTempCaption(prev => `${prev.split('||')[0]}||${e.target.value}`)}
                                    >
                                      {commonAreas.map(area => <option key={area} value={area}>{area}</option>)}
                                    </select>
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Observação Foto</label>
                                    <textarea
                                      autoFocus
                                      placeholder="O que esta foto representa?"
                                      className="w-full bg-[#F4F7FE] border border-slate-100 rounded-xl p-4 text-xs focus:outline-none focus:border-[#4318FF] resize-none min-h-[80px] transition-all"
                                      value={tempCaption.split('||')[0]}
                                      onChange={(e) => setTempCaption(prev => `${e.target.value}||${prev.split('||')[1] || foto.area_setor || 'Geral'}`)}
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-3">
                                  <button 
                                    onClick={() => {
                                      const [_cap, area] = tempCaption.split('||');
                                      handleSaveCaption(foto.id, area);
                                    }}
                                    className="flex-1 py-3 bg-[#4318FF] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10 hover:brightness-110 flex items-center justify-center gap-2"
                                  >
                                    <Save className="w-4 h-4" /> Confirmar
                                  </button>
                                  <button 
                                    onClick={() => setEditingCaption(null)}
                                    className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-200"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div 
                                onClick={() => {
                                  setEditingCaption(foto.id);
                                  setTempCaption(`${foto.caption || ''}||${foto.area_setor || 'Geral'}`);
                                }}
                                className="cursor-pointer group/caption"
                              >
                                <div className="flex items-center text-[#4318FF] text-[10px] font-bold uppercase tracking-widest mb-3 opacity-70 group-hover/caption:opacity-100 transition-opacity">
                                  <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Setor: {foto.area_setor || 'Geral'}
                                </div>
                                <p className={`text-[13px] leading-relaxed font-medium ${foto.caption ? 'text-slate-600' : 'text-slate-300 italic'}`}>
                                  {foto.caption || 'Clique aqui para adicionar uma legenda a este registro fotográfico...'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  
                  {/* Uploader Integrado na Grid */}
                  <div className="flex items-center justify-center p-8 bg-[#4318FF]/5 rounded-[2rem] border-2 border-dashed border-[#4318FF]/10 min-h-[400px]">
                    <div className="w-full max-w-sm">
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm mx-auto flex items-center justify-center mb-4 text-[#4318FF]">
                           <Maximize2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-display font-bold text-brand-dark">Novos Registros</h3>
                        <p className="text-xs text-slate-400 mt-1">Arraste fotos ou clique no botão abaixo para adicionar</p>
                      </div>
                      <PhotoUploadGrid reportId={currentReport.id} obraId={currentReport.obra_id} />
                    </div>
                  </div>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};
