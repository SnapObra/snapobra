import { useState, useEffect } from 'react';
import { X, Save, Trash2, Camera, Loader2, ClipboardCheck, Layout, ListChecks, ImageIcon, FileCheck, CheckCircle2, AlertCircle, AlertTriangle, FileDown, ChevronRight, User } from 'lucide-react';
import { useVistoriaStore, Vistoria, VistoriaFoto } from '../../store/vistoriaStore';
import { generateVistoriaPDF } from '../../services/pdf/vistoriaPdfService';
import { motion, AnimatePresence } from 'framer-motion';

interface VistoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  vistoria?: Vistoria | null;
}

const CHECKLIST_CATEGORIES = [
  {
    title: '2. Estrutura e Alvenaria',
    items: [
      'Presença de trincas ou fissuras',
      'Paredes alinhadas e no prumo',
      'Tetos sem deformações',
      'Revestimentos bem aderidos'
    ]
  },
  {
    title: '🎨 3. Acabamentos',
    items: [
      'Pintura uniforme (sem manchas ou bolhas)',
      'Rejuntes íntegros e bem aplicados',
      'Pisos sem peças soltas ou ocas',
      'Nivelamento adequado dos pisos',
      'Rodapés bem fixados'
    ]
  },
  {
    title: '🚪 4. Esquadrias (Portas e Janelas)',
    items: [
      'Abertura e fechamento adequados',
      'Vedação correta',
      'Sem empenamentos',
      'Fechaduras funcionando',
      'Vidros sem trincas ou riscos'
    ]
  },
  {
    title: '💡 5. Instalações Elétricas',
    items: [
      'Tomadas funcionando',
      'Interruptores funcionando',
      'Quadro elétrico identificado',
      'Disjuntores funcionando',
      'Iluminação instalada/testada'
    ]
  },
  {
    title: '🚿 6. Instalações Hidráulicas',
    items: [
      'Torneiras funcionando',
      'Pressão de água adequada',
      'Descargas funcionando',
      'Ausência de vazamentos',
      'Ralos com escoamento adequado'
    ]
  },
  {
    title: '🚽 7. Louças e Metais',
    items: [
      'Vasos sanitários instalados corretamente',
      'Pias e lavatórios bem fixados',
      'Metais sem vazamentos',
      'Acabamento sem riscos or danos'
    ]
  },
  {
    title: '🧊 8. Impermeabilização e Umidade',
    items: [
      'Ausência de infiltrações',
      'Ausência de mofo ou bolor',
      'Áreas molhadas bem vedadas'
    ]
  },
  {
    title: '🧰 9. Áreas Externas (se houver)',
    items: [
      'Calçadas niveladas',
      'Drenagem adequada',
      'Portões funcionando',
      'Pintura externa em bom estado'
    ]
  },
  {
    title: '📐 10. Conformidade com Projeto',
    items: [
      'Medidas conferem com planta',
      'Materiais conforme especificação',
      'Itens entregues conforme contrato'
    ]
  }
];

const CaptionInput = ({ foto, onUpdate }: { foto: VistoriaFoto, onUpdate: (id: string, cap: string) => void }) => {
  const [localCaption, setLocalCaption] = useState(foto.caption || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localCaption !== foto.caption) {
        onUpdate(foto.id, localCaption);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [localCaption, foto.id, foto.caption, onUpdate]);

  return (
    <input 
      type="text" 
      placeholder="Legenda..." 
      value={localCaption}
      onChange={(e) => setLocalCaption(e.target.value)}
      className="w-full bg-white/20 backdrop-blur-md text-white text-[10px] p-2 rounded-lg outline-none placeholder:text-white/60 border border-white/10 focus:border-white/30 transition-all font-medium" 
    />
  );
};

export const VistoriaModal = ({ isOpen, onClose, vistoria }: VistoriaModalProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    empreendimento_nome: '',
    unidade: '',
    proprietario: '',
    data_vistoria: new Date().toISOString().split('T')[0],
    responsavel_tecnico: '',
    crea_cau: '',
    conclusao: 'aprovado_sem_ressalvas',
    checklist: {} as any
  });
  const [isSaving, setIsSaving] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  
  const { createVistoria, updateVistoria, uploadFoto, deleteFoto, updateFotoCaption } = useVistoriaStore();

  const [activeVistoriaId, setActiveVistoriaId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setActiveVistoriaId(null);
      return;
    }

    const currentId = vistoria?.id || 'new';
    
    // Só reinicia o formulário se o ID mudar (mudança de vistoria) ou se o modal acabou de abrir
    if (currentId !== activeVistoriaId) {
      if (vistoria) {
        setFormData({
          empreendimento_nome: vistoria.empreendimento_nome || '',
          unidade: vistoria.unidade || '',
          proprietario: vistoria.proprietario || '',
          data_vistoria: vistoria.data_vistoria || new Date().toISOString().split('T')[0],
          responsavel_tecnico: vistoria.responsavel_tecnico || '',
          crea_cau: vistoria.crea_cau || '',
          conclusao: vistoria.conclusao || 'aprovado_sem_ressalvas',
          checklist: vistoria.checklist_data || {}
        });
      } else {
        setFormData({
          empreendimento_nome: '',
          unidade: '',
          proprietario: '',
          data_vistoria: new Date().toISOString().split('T')[0],
          responsavel_tecnico: '',
          crea_cau: '',
          conclusao: 'aprovado_sem_ressalvas',
          checklist: {}
        });
      }
      setStep(1);
      setActiveVistoriaId(currentId);
    }
  }, [vistoria?.id, isOpen, activeVistoriaId]);

  if (!isOpen) return null;

  const handleCheckChange = (category: string, item: string, status: string) => {
    setFormData(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [category]: {
          ...prev.checklist[category],
          [item]: {
            ...(prev.checklist[category]?.[item] || {}),
            status
          }
        }
      }
    }));
  };

  const handleDescriptionChange = (category: string, item: string, description: string) => {
    setFormData(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [category]: {
          ...prev.checklist[category],
          [item]: {
            ...(prev.checklist[category]?.[item] || {}),
            description
          }
        }
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { checklist, ...rest } = formData;
      const payload = {
        ...rest,
        checklist_data: checklist
      };

      if (vistoria) {
        await updateVistoria(vistoria.id, payload);
      } else {
        await createVistoria(payload);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar vistoria:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!vistoria) return;
    setPdfLoading(true);
    try {
      await generateVistoriaPDF(vistoria);
    } catch (error) {
      console.error('Falha ao gerar PDF:', error);
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vistoria) return;

    setUploadLoading(true);
    try {
      await uploadFoto(vistoria.id, vistoria.vt_number, file);
    } catch (error) {
      console.error('Erro no upload:', error);
    } finally {
      setUploadLoading(false);
    }
  };

  const getPendencias = () => {
    const pendencias: { category: string, item: string, description: string }[] = [];
    Object.entries(formData.checklist).forEach(([catTitle, items]: [string, any]) => {
      Object.entries(items).forEach(([itemTitle, data]: [string, any]) => {
        if (data.status === 'ajustar' || data.status === 'critico') {
          pendencias.push({
            category: catTitle,
            item: itemTitle,
            description: data.description || 'Sem descrição'
          });
        }
      });
    });
    return pendencias;
  };

  const renderStepIcon = (s: number, Icon: any) => (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${step === s ? 'bg-[#4318FF] text-white shadow-lg' : step > s ? 'bg-green-50 text-green-500' : 'bg-slate-100 text-slate-400'}`}>
      {step > s ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative z-10"
      >
        {/* Modal Header */}
        <div className="p-6 sm:p-8 flex items-center justify-between border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-blue-50/50 rounded-2xl flex items-center justify-center text-[#4318FF]">
                <ClipboardCheck className="w-6 h-6" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-brand-dark leading-none">{vistoria ? 'Editar Laudo' : 'Novo Laudo de Vistoria'}</h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">{vistoria ? `Referência: ${vistoria.vt_number}` : 'Criação estruturada de checklist técnico'}</p>
             </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-brand-dark rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Multi-step indicator */}
        <div className="px-8 py-4 bg-slate-50/50 flex items-center justify-center sm:justify-start gap-4 border-b border-slate-100 shrink-0 overflow-x-auto no-scrollbar">
           <button onClick={() => setStep(1)} className="flex items-center gap-2 group">
              {renderStepIcon(1, Layout)}
              <span className={`text-[10px] font-bold uppercase tracking-widest hidden sm:inline ${step === 1 ? 'text-[#4318FF]' : 'text-slate-400'}`}>Identificação</span>
           </button>
           <div className="h-px w-4 bg-slate-200 hidden sm:block" />
           <button onClick={() => setStep(2)} className="flex items-center gap-2 group">
              {renderStepIcon(2, ListChecks)}
              <span className={`text-[10px] font-bold uppercase tracking-widest hidden sm:inline ${step === 2 ? 'text-[#4318FF]' : 'text-slate-400'}`}>Checklist</span>
           </button>
           <div className="h-px w-4 bg-slate-200 hidden sm:block" />
           <button onClick={() => setStep(3)} className="flex items-center gap-2 group">
              {renderStepIcon(3, ImageIcon)}
              <span className={`text-[10px] font-bold uppercase tracking-widest hidden sm:inline ${step === 3 ? 'text-[#4318FF]' : 'text-slate-400'}`}>Fotos</span>
           </button>
           <div className="h-px w-4 bg-slate-200 hidden sm:block" />
           <button onClick={() => setStep(4)} className="flex items-center gap-2 group">
              {renderStepIcon(4, FileCheck)}
              <span className={`text-[10px] font-bold uppercase tracking-widest hidden sm:inline ${step === 4 ? 'text-[#4318FF]' : 'text-slate-400'}`}>Conclusão</span>
           </button>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome do Empreendimento</label>
                      <input 
                        type="text" 
                        value={formData.empreendimento_nome}
                        onChange={(e) => setFormData(f => ({ ...f, empreendimento_nome: e.target.value }))}
                        className="input-compact rounded-2xl h-12 bg-slate-50 border-transparent focus:bg-white"
                        placeholder="Ex: Residencial Solar"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Unidade / Apartamento</label>
                      <input 
                        type="text" 
                        value={formData.unidade}
                        onChange={(e) => setFormData(f => ({ ...f, unidade: e.target.value }))}
                        className="input-compact rounded-2xl h-12 bg-slate-50 border-transparent focus:bg-white"
                        placeholder="Ex: Apt 402, Bloco B"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Proprietário / Cliente</label>
                      <input 
                        type="text" 
                        value={formData.proprietario}
                        onChange={(e) => setFormData(f => ({ ...f, proprietario: e.target.value }))}
                        className="input-compact rounded-2xl h-12 bg-slate-50 border-transparent focus:bg-white"
                        placeholder="Nome do proprietário"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Data da Vistoria</label>
                      <input 
                        type="date" 
                        value={formData.data_vistoria}
                        onChange={(e) => setFormData(f => ({ ...f, data_vistoria: e.target.value }))}
                        className="input-compact rounded-2xl h-12 bg-slate-50 border-transparent focus:bg-white"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Responsável Técnico</label>
                      <input 
                        type="text" 
                        value={formData.responsavel_tecnico}
                        onChange={(e) => setFormData(f => ({ ...f, responsavel_tecnico: e.target.value }))}
                        className="input-compact rounded-2xl h-12 bg-slate-50 border-transparent focus:bg-white"
                        placeholder="Nome do engenheiro"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">CREA / CAU</label>
                      <input 
                        type="text" 
                        value={formData.crea_cau}
                        onChange={(e) => setFormData(f => ({ ...f, crea_cau: e.target.value }))}
                        className="input-compact rounded-2xl h-12 bg-slate-50 border-transparent focus:bg-white"
                        placeholder="Registro profissional"
                      />
                   </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                {CHECKLIST_CATEGORIES.map((cat, catIdx) => (
                  <div key={catIdx} className="space-y-4">
                     <h3 className="text-sm font-bold text-[#4318FF] uppercase tracking-wider flex items-center">
                        <div className="w-1.5 h-4 bg-[#4318FF] rounded-full mr-2" />
                        {cat.title}
                     </h3>
                     <div className="space-y-3">
                        {cat.items.map((item, itemIdx) => {
                          const itemData = formData.checklist[cat.title]?.[item] || { status: 'ok' };
                          return (
                            <div key={itemIdx} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 space-y-3">
                               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <span className="text-xs sm:text-sm font-semibold text-brand-dark">{item}</span>
                                  <div className="flex items-center gap-2">
                                     <button onClick={() => handleCheckChange(cat.title, item, 'ok')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${itemData.status === 'ok' ? 'bg-green-500 text-white shadow-sm' : 'bg-white text-slate-400'}`}>OK</button>
                                     <button onClick={() => handleCheckChange(cat.title, item, 'ajustar')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${itemData.status === 'ajustar' ? 'bg-yellow-500 text-white shadow-sm' : 'bg-white text-slate-400'}`}>Ajustar</button>
                                     <button onClick={() => handleCheckChange(cat.title, item, 'critico')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${itemData.status === 'critico' ? 'bg-red-500 text-white shadow-sm' : 'bg-white text-slate-400'}`}>Crítico</button>
                                  </div>
                               </div>
                               {(itemData.status === 'ajustar' || itemData.status === 'critico') && (
                                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                    <textarea 
                                      value={itemData.description || ''}
                                      onChange={(e) => handleDescriptionChange(cat.title, item, e.target.value)}
                                      className="w-full mt-2 p-3 text-xs bg-white rounded-xl border border-slate-100 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                                      placeholder="Descreva a pendência encontrada..."
                                      rows={2}
                                    />
                                 </motion.div>
                               )}
                            </div>
                          );
                        })}
                     </div>
                  </div>
                ))}
                
                <div className="pt-8 border-t border-slate-100">
                   <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider flex items-center mb-4">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      11. Resumo de Pendências (Automático)
                   </h3>
                   <div className="bg-red-50/50 p-6 rounded-3xl border border-red-50 space-y-3">
                      {getPendencias().length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Nenhuma pendência registrada até o momento.</p>
                      ) : (
                        getPendencias().map((p, idx) => (
                          <div key={idx} className="flex items-start gap-3 py-2 border-b border-red-100/30 last:border-0">
                             <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5" />
                             <div>
                                <p className="text-xs font-bold text-red-900">{p.item}</p>
                                <p className="text-[11px] text-red-600 mt-0.5">{p.description}</p>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                {!vistoria ? (
                  <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <ImageIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-sm text-slate-500 font-medium px-8">Para adicionar fotos, salve o rascunho da vistoria primeiro.</p>
                    <button onClick={handleSave} disabled={isSaving} className="mt-6 px-6 py-3 bg-white text-[#4318FF] border border-blue-100 rounded-2xl text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 mx-auto">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Salvar Rascunho e Habilitar Fotos
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-sm font-bold text-brand-dark uppercase tracking-widest">Evidências Visuais</h3>
                       <label className={`cursor-pointer h-12 px-6 rounded-2xl bg-[#4318FF] text-white flex items-center gap-3 font-bold text-xs shadow-lg shadow-blue-500/20 active:scale-95 transition-all ${uploadLoading ? 'opacity-50' : ''}`}>
                          <Camera className="w-4 h-4" />
                          {uploadLoading ? 'Enviando...' : 'Adicionar Foto'}
                          <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploadLoading} />
                       </label>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                       {vistoria.fotos?.map((foto) => (
                         <div key={foto.id} className="relative aspect-square rounded-2xl overflow-hidden group shadow-md">
                            <img src={foto.public_url} alt="Evidência" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteFoto(foto.id, foto.storage_path);
                                  }} 
                                  className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center absolute top-2 right-2 shadow-lg hover:bg-red-600 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                               <CaptionInput foto={foto} onUpdate={updateFotoCaption} />
                            </div>
                         </div>
                       ))}
                       {uploadLoading && (
                         <div className="aspect-square rounded-2xl bg-slate-50 flex items-center justify-center border border-dashed border-slate-200">
                           <Loader2 className="w-6 h-6 text-[#4318FF] animate-spin" />
                         </div>
                       )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="space-y-4">
                   <h3 className="text-sm font-bold text-brand-dark uppercase tracking-widest">Resultado do Laudo</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <button onClick={() => setFormData(f => ({ ...f, conclusao: 'aprovado_sem_ressalvas' }))} className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${formData.conclusao === 'aprovado_sem_ressalvas' ? 'border-green-500 bg-green-50 text-green-700 shadow-lg' : 'border-slate-50 bg-slate-50/50 text-slate-400 grayscale'}`}>
                         <CheckCircle2 className="w-8 h-8" />
                         <span className="text-[10px] font-black uppercase text-center">Aprovado sem Ressalvas</span>
                      </button>
                      <button onClick={() => setFormData(f => ({ ...f, conclusao: 'aprovado_com_pendencias' }))} className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${formData.conclusao === 'aprovado_com_pendencias' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 shadow-lg' : 'border-slate-50 bg-slate-50/50 text-slate-400 grayscale'}`}>
                         <AlertTriangle className="w-8 h-8" />
                         <span className="text-[10px] font-black uppercase text-center">Aprovado com Pendências</span>
                      </button>
                      <button onClick={() => setFormData(f => ({ ...f, conclusao: 'reprovado' }))} className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${formData.conclusao === 'reprovado' ? 'border-red-500 bg-red-50 text-red-700 shadow-lg' : 'border-slate-50 bg-slate-50/50 text-slate-400 grayscale'}`}>
                         <AlertCircle className="w-8 h-8" />
                         <span className="text-[10px] font-black uppercase text-center">Reprovado / Reteste</span>
                      </button>
                   </div>
                </div>

                <div className="p-8 bg-blue-50/30 rounded-3xl border border-blue-50/50">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-[#4318FF] shadow-sm">
                         <FileCheck className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-[#4318FF] uppercase tracking-widest">Assinaturas do Laudo (Físicas)</h4>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Técnico Responsável</label>
                         <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-3">
                            <User className="w-4 h-4 text-slate-300" />
                            <span className="text-xs font-bold text-brand-dark">{formData.responsavel_tecnico || '---'}</span>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Cliente / Proprietário</label>
                         <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center gap-3">
                            <User className="w-4 h-4 text-slate-300" />
                            <span className="text-xs font-bold text-brand-dark">{formData.proprietario || '---'}</span>
                         </div>
                      </div>
                   </div>

                   {vistoria && (
                     <div className="mt-8 pt-6 border-t border-blue-100/50 flex justify-center">
                        <button 
                          onClick={handleDownloadPDF}
                          disabled={pdfLoading}
                          className="flex items-center gap-3 px-8 py-4 bg-white border border-blue-200 text-[#4318FF] rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-sm"
                        >
                          {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                          Gerar Laudo Técnico PDF
                        </button>
                     </div>
                   )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Footer */}
        <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between shrink-0">
           <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="px-8 py-3.5 sm:py-4 rounded-2xl text-slate-500 font-bold text-sm sm:text-base hover:bg-white transition-all border border-transparent hover:border-slate-100">
             {step === 1 ? 'Cancelar' : 'Anterior'}
           </button>
           
           <div className="flex items-center gap-3">
              {step < 4 ? (
                <button onClick={() => setStep(step + 1)} className="px-8 py-3.5 sm:py-4 rounded-2xl bg-slate-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-slate-200 active:scale-95 transition-all flex items-center gap-2">
                  Próximo Passo
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleSave} disabled={isSaving} className="btn-primary px-10 py-3.5 sm:py-4 rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  <span className="font-bold text-sm sm:text-base">Finalizar e Salvar</span>
                </button>
              )}
           </div>
        </div>
      </motion.div>
    </div>
  );
};
