import { useState, useEffect } from 'react';
import { X, Calendar, Edit3, Loader2, Building2, AlertCircle, ArrowRight, Hash, Trash2, AlertTriangle, Cloud, Sun, CloudRain, Users } from 'lucide-react';
import { Relatorio, useReportStore } from '../../store/reportStore';
import { useObraStore } from '../../store/obraStore';
import { Link } from 'react-router-dom';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  obraId?: string;
  report?: Relatorio | null;
}

export const ReportModal = ({ isOpen, onClose, obraId: initialObraId, report }: ReportModalProps) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [area, setArea] = useState('Geral');
  const [activity, setActivity] = useState('');
  const [selectedObraId, setSelectedObraId] = useState(initialObraId || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [weatherCondition, setWeatherCondition] = useState('');
  const [praticavel, setPraticavel] = useState('');
  const [wfSupervisor, setWfSupervisor] = useState(0);
  const [wfEncarregado, setWfEncarregado] = useState(0);
  const [wfProfissional, setWfProfissional] = useState(0);
  const [wfAjudante, setWfAjudante] = useState(0);
  
  const { createReport, updateReport, deleteReport, isLoading } = useReportStore();
  const { obras, fetchObras, isLoading: isLoadingObras } = useObraStore();

  useEffect(() => {
    if (isOpen) {
      if (report) {
        setTitle(report.title);
        setDate(report.date);
        setNotes(report.notes || '');
        setSelectedObraId(report.obra_id);
        setWeatherCondition(report.weather?.condition || '');
        setPraticavel(report.weather?.praticavel || '');
        setWfSupervisor(report.workforce?.supervisor || 0);
        setWfEncarregado(report.workforce?.encarregado || 0);
        setWfProfissional(report.workforce?.profissional || 0);
        setWfAjudante(report.workforce?.ajudante || 0);
      } else {
        setTitle('');
        setDate(new Date().toISOString().split('T')[0]);
        setNotes('');
        setSelectedObraId(initialObraId || '');
        setWeatherCondition('');
        setPraticavel('');
        setWfSupervisor(0);
        setWfEncarregado(0);
        setWfProfissional(0);
        setWfAjudante(0);
      }
    }
  }, [isOpen, report, initialObraId]);

  useEffect(() => {
    if (isOpen && !initialObraId && obras.length === 0) {
      fetchObras();
    }
  }, [isOpen, initialObraId, fetchObras, obras.length]);

  if (!isOpen) return null;

  const weatherData = weatherCondition ? { condition: weatherCondition, praticavel } : undefined;
  const workforceData = { supervisor: wfSupervisor, encarregado: wfEncarregado, profissional: wfProfissional, ajudante: wfAjudante };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedObraId || !weatherCondition || !praticavel) return;

    if (report) {
      const { error } = await updateReport(report.id, { 
        title, 
        date, 
        notes,
        obra_id: selectedObraId,
        weather: weatherData,
        workforce: workforceData
      });
      if (!error) onClose();
    } else {
      const newReport = await createReport(selectedObraId, title, date, notes, weatherData, workforceData);
      if (newReport && activity) {
        await useReportStore.getState().createAtividade(newReport.id, selectedObraId, area, activity);
        onClose();
      } else if (newReport) {
        onClose();
      }
    }
  };

  const handleDelete = async () => {
    if (report) {
      await deleteReport(report.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const hasNoObras = !initialObraId && !isLoadingObras && obras.length === 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-brand-dark/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col relative transition-all duration-300">
        
        {/* Deletion Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-[110] bg-white/95 backdrop-blur-md flex items-center justify-center p-6 text-center animate-fade-in">
            <div className="max-w-xs">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display text-slate-900 mb-2">Excluir Relatório?</h3>
              <p className="text-slate-500 text-sm mb-8">Esta ação irá apagar todas as fotos vinculadas a este registro. Não é possível desfazer.</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDelete}
                  className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                >
                  Confirmar Exclusão
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#4318FF]/10 rounded-2xl flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-[#4318FF]" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-brand-dark">{report ? 'Editar Relatório' : 'Novo Relatório'}</h2>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Registro de Progresso Diário</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {report && (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-xl transition-all"
                title="Excluir relatório"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-xl transition-all">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          {/* Content */}
          {hasNoObras ? (
            <div className="p-12 text-center space-y-6">
              <div className="w-20 h-20 bg-[#4318FF]/5 rounded-3xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10 text-[#4318FF]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-display font-bold text-brand-dark">Nenhuma obra cadastrada</h3>
                <p className="text-slate-500 text-sm">Você precisa cadastrar uma obra antes de criar um relatório fotográfico.</p>
              </div>
              <Link 
                to="/dashboard/obras" 
                className="bg-[#4318FF] text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:brightness-110 transition-all inline-flex items-center space-x-2"
                onClick={onClose}
              >
                <span>Ir para Minhas Obras</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-5">
                
                {/* Campo RDO */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nº Identificador</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      disabled
                      type="text"
                      className="w-full h-[32px] bg-slate-50 border border-slate-100 rounded-xl pl-11 text-xs text-slate-500 font-bold"
                      value={report?.rdo_number || 'Sequencial automático'}
                    />
                  </div>
                </div>

                {!initialObraId && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Selecionar Obra</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        required
                        className="w-full h-[32px] bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-10 text-xs focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/10 outline-none transition-all appearance-none"
                        value={selectedObraId}
                        onChange={(e) => setSelectedObraId(e.target.value)}
                      >
                        <option value="">Escolha uma obra...</option>
                        {obras.map(obra => (
                          <option key={obra.id} value={obra.id}>{obra.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Título do Relatório</label>
                  <div className="relative">
                    <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="text"
                      placeholder="Ex: Visita Técnica - Fundações"
                      className="w-full h-[32px] bg-slate-50 border border-slate-100 rounded-xl pl-11 text-xs focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/10 outline-none transition-all"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Data da Visita</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="date"
                      className="w-full h-[32px] bg-slate-50 border border-slate-100 rounded-xl pl-11 text-xs focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/10 outline-none transition-all"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* ── CLIMA ── */}
                <div className="pt-6 border-t border-slate-50 mt-2">
                  <p className="text-[11px] font-bold text-[#4318FF] uppercase tracking-widest mb-4 ml-1">Clima</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'Claro', icon: Sun, label: 'Claro' },
                      { value: 'Nublado', icon: Cloud, label: 'Nublado' },
                      { value: 'Chuvoso', icon: CloudRain, label: 'Chuvoso' },
                    ].map(opt => {
                      const Icon = opt.icon;
                      const selected = weatherCondition === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setWeatherCondition(opt.value)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-bold ${
                            selected
                              ? 'border-[#4318FF] bg-[#4318FF]/5 text-[#4318FF]'
                              : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  {!weatherCondition && (
                    <p className="text-[10px] text-red-400 mt-1.5 ml-1">* Selecione o clima</p>
                  )}
                </div>

                {/* ── PRATICÁVEL ── */}
                <div className="pt-4 border-t border-slate-50 mt-2">
                  <p className="text-[11px] font-bold text-[#4318FF] uppercase tracking-widest mb-4 ml-1">Execução Praticável?</p>
                  <div className="flex gap-4">
                    {[
                      { value: 'Sim', label: 'Sim' },
                      { value: 'Não', label: 'Não' },
                    ].map(opt => {
                      const selected = praticavel === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setPraticavel(opt.value)}
                          className={`flex-1 py-2 px-4 rounded-xl border-2 transition-all text-xs font-bold flex items-center justify-center gap-2 ${
                            selected
                              ? 'border-[#4318FF] bg-[#4318FF]/5 text-[#4318FF]'
                              : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                          }`}
                        >
                          <div className={`w-3 h-3 rounded-full border ${selected ? 'bg-[#4318FF] border-[#4318FF]' : 'bg-white border-slate-300'}`} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  {!praticavel && (
                    <p className="text-[10px] text-red-400 mt-1.5 ml-1">* Responda se a execução foi praticável</p>
                  )}
                </div>

                {/* ── EFETIVO ── */}
                <div className="pt-6 border-t border-slate-50 mt-2">
                  <p className="text-[11px] font-bold text-[#4318FF] uppercase tracking-widest mb-4 ml-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Efetivo
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Supervisor Tec.', value: wfSupervisor, setter: setWfSupervisor },
                      { label: 'Encarregado', value: wfEncarregado, setter: setWfEncarregado },
                      { label: 'Profissional', value: wfProfissional, setter: setWfProfissional },
                      { label: 'Ajudante', value: wfAjudante, setter: setWfAjudante },
                    ].map(field => (
                      <div key={field.label} className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">{field.label}</label>
                        <input
                          type="number"
                          min="0"
                          className="w-full h-[32px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs text-center font-bold focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/10 outline-none transition-all"
                          value={field.value}
                          onChange={(e) => field.setter(Math.max(0, parseInt(e.target.value) || 0))}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 mt-2">
                  <p className="text-[11px] font-bold text-[#4318FF] uppercase tracking-widest mb-4 ml-1">Progresso Técnico</p>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Área / Setor</label>
                      <input
                        type="text"
                        placeholder="Ex: Fundação, Alvenaria, Geral..."
                        className="w-full h-[32px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/10 outline-none transition-all"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Atividades Realizadas</label>
                      <textarea
                        placeholder="Descreva o que foi feito nestas áreas..."
                        className="w-full rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/10 outline-none min-h-[80px] resize-none transition-all"
                        value={activity}
                        onChange={(e) => setActivity(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Notas Gerais (Opcional)</label>
                  <textarea
                    placeholder="Observações importantes sobre o dia..."
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/10 outline-none min-h-[80px] resize-none transition-all"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-[32px] rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !title || !selectedObraId || !weatherCondition}
                  className="flex-[2] h-[32px] rounded-xl bg-[#4318FF] text-white font-bold text-xs shadow-lg shadow-blue-500/20 hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    report ? 'Salvar Alterações' : 'Criar Relatório'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
