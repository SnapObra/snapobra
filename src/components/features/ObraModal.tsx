import { X, MapPin, Building2, User, Phone, FileText, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Obra, useObraStore } from '../../store/obraStore';
import { useMasks } from '../../hooks/useMasks';
import { useState, useEffect } from 'react';

interface ObraModalProps {
  isOpen: boolean;
  onClose: () => void;
  obra?: Obra | null;
}

export const ObraModal = ({ isOpen, onClose, obra }: ObraModalProps) => {
  const { createObra, updateObra, deleteObra, isLoading } = useObraStore();
  const { maskCEP, maskPhone, maskDocument } = useMasks();
  const [cepLoading, setCepLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      client_name: '',
      client_whatsapp: '',
      client_document: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      contract_number: '',
      status: 'active'
    }
  });

  useEffect(() => {
    if (obra) {
      reset({
        name: obra.name,
        client_name: obra.client_name,
        client_whatsapp: obra.client_whatsapp || '',
        client_document: obra.client_document || '',
        cep: obra.cep || '',
        logradouro: obra.logradouro || '',
        numero: obra.numero || '',
        complemento: obra.complemento || '',
        bairro: obra.bairro || '',
        cidade: obra.cidade || '',
        estado: obra.estado || '',
        contract_number: obra.contract_number || '',
        status: obra.status
      });
    } else {
      reset({
        name: '',
        client_name: '',
        client_whatsapp: '',
        client_document: '',
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        contract_number: '',
        status: 'active'
      });
    }
  }, [obra, reset, isOpen]);

  const onSubmit = async (data: any) => {
    if (obra) {
      const { error } = await updateObra(obra.id, data);
      if (!error) onClose();
    } else {
      const { error } = await createObra(data);
      if (!error) onClose();
    }
  };

  const handleDelete = async () => {
    if (obra) {
      const { error } = await deleteObra(obra.id);
      if (!error) {
        setShowDeleteConfirm(false);
        onClose();
      }
    }
  };

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const masked = maskCEP(value);
    
    // Atualiza o valor do CEP no formulário
    setValue('cep', masked, { shouldValidate: true, shouldDirty: true });

    const cep = masked.replace(/\D/g, '');
    if (cep.length === 8) {
      setCepLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          // Preenche os campos automaticamente com validação
          setValue('logradouro', data.logradouro || '', { shouldValidate: true, shouldDirty: true });
          setValue('bairro', data.bairro || '', { shouldValidate: true, shouldDirty: true });
          setValue('cidade', data.localidade || '', { shouldValidate: true, shouldDirty: true });
          setValue('estado', data.uf || '', { shouldValidate: true, shouldDirty: true });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      } finally {
        setCepLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-4 bg-brand-dark/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative transition-all duration-300">
        
        {/* Confirmação de Exclusão (Overlay) */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-[210] bg-white/95 backdrop-blur-md flex items-center justify-center p-6 text-center animate-fade-in">
            <div className="max-w-xs">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display font-bold text-brand-dark mb-2">Excluir Projeto?</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Esta ação é irreversível. Todos os relatórios e fotos desta obra serão perdidos definitivamente.
              </p>
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
              <Building2 className="w-5 h-5 text-[#4318FF]" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-brand-dark">{obra ? 'Editar Projeto' : 'Novo Projeto'}</h2>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Gestão Estratégica de Obra</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {obra && (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-xl transition-all"
                title="Excluir obra"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-xl transition-all">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto flex-1 space-y-6 bg-white custom-scrollbar">
          {/* Seção: Identificação */}
          <div className="space-y-5">
            <h3 className="text-[11px] font-bold text-[#4318FF] uppercase tracking-widest flex items-center ml-1">
              <FileText className="w-3.5 h-3.5 mr-2 opacity-70" /> Identificação do Projeto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="col-span-full space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome do Projeto</label>
                <input 
                  {...register('name', { required: true })}
                  placeholder="Ex: Residencial Aurora"
                  className="w-full h-[32px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/10 outline-none transition-all" 
                />
              </div>
              <div className="col-span-full md:col-span-1 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Número do Contrato</label>
                <input 
                  {...register('contract_number')}
                  placeholder="Ex: CT-2024-001"
                  className="w-full h-[32px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/10 outline-none transition-all" 
                />
              </div>
              <div className="col-span-full md:col-span-1 space-y-1.5">
                 <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status do Projeto</label>
                 <div className="relative">
                   <select 
                    {...register('status')} 
                    className="w-full h-[32px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/10 outline-none transition-all appearance-none"
                   >
                     <option value="active">Em Andamento</option>
                     <option value="paused">Pausada</option>
                     <option value="completed">Concluída</option>
                   </select>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-slate-400 rotate-45" />
                   </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Seção: Cliente */}
          <div className="space-y-5">
            <h3 className="text-[11px] font-bold text-[#4318FF] uppercase tracking-widest flex items-center ml-1">
              <User className="w-3.5 h-3.5 mr-2 opacity-70" /> Dados do Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="col-span-full sm:col-span-1 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Titular / Empresa</label>
                <input 
                  {...register('client_name', { required: true })}
                  placeholder="Nome completo ou Razão Social"
                  className="w-full h-[32px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/10 outline-none transition-all" 
                />
              </div>
              <div className="col-span-full sm:col-span-1 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">CPF / CNPJ</label>
                <input 
                  {...register('client_document')}
                  onChange={(e) => setValue('client_document', maskDocument(e.target.value), { shouldDirty: true })}
                  placeholder="000.000.000-00"
                  className="w-full h-[32px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/10 outline-none transition-all" 
                />
              </div>
              <div className="col-span-full sm:col-span-1 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">WhatsApp de Contato</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </span>
                  <input 
                    {...register('client_whatsapp')}
                    onChange={(e) => setValue('client_whatsapp', maskPhone(e.target.value), { shouldDirty: true })}
                    placeholder="(00) 00000-0000"
                    className="w-full h-[32px] bg-slate-50 border border-slate-100 rounded-xl pl-11 text-xs focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/10 outline-none transition-all" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção: Endereço */}
          <div className="space-y-5">
            <h3 className="text-[11px] font-bold text-[#4318FF] uppercase tracking-widest flex items-center ml-1">
              <MapPin className="w-3.5 h-3.5 mr-2 opacity-70" /> Geocalização
            </h3>
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-6 sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">CEP</label>
                <div className="relative">
                  <input 
                    {...register('cep')}
                    onChange={handleCEPChange}
                    placeholder="00000-000"
                    className={`w-full h-[32px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/10 outline-none transition-all ${cepLoading ? 'opacity-50 pr-10' : ''}`} 
                  />
                  {cepLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                       <div className="w-4 h-4 border-2 border-[#4318FF] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-6 sm:col-span-4 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Logradouro / Rua</label>
                <input 
                  {...register('logradouro')}
                  placeholder="Rua, Avenida, etc."
                  className="w-full h-[32px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/10 outline-none transition-all" 
                />
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nº</label>
                <input 
                  {...register('numero')}
                  className="w-full h-[32px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/10 outline-none transition-all" 
                />
              </div>
              <div className="col-span-4 sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bairro</label>
                <input 
                  {...register('bairro')}
                  className="w-full h-[32px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/10 outline-none transition-all" 
                />
              </div>
              <div className="col-span-4 sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cidade</label>
                <input 
                  {...register('cidade')}
                  className="w-full h-[32px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/10 outline-none transition-all" 
                />
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">UF</label>
                <input 
                  {...register('estado')}
                  maxLength={2}
                  className="w-full h-[32px] bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs focus:border-[#4318FF] focus:ring-2 focus:ring-[#4318FF]/10 outline-none transition-all uppercase" 
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-slate-50 flex justify-end space-x-4">
          <button 
            type="button"
            onClick={onClose}
            className="h-[32px] px-8 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="h-[32px] px-10 rounded-xl bg-[#4318FF] text-white font-bold text-xs shadow-lg shadow-blue-500/20 hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center min-w-[160px]"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : obra ? 'Salvar Alterações' : 'Criar Projeto'}
          </button>
        </div>
      </div>
    </div>
  );
};
