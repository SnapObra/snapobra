import { useState, useEffect } from 'react';
import { Save, Upload, Building2, User as UserIcon, Loader2, MapPin, Phone, Mail, Award, Palette, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfileStore } from '../store/profileStore';
import { storageClient } from '../lib/supabase';
import { useMasks } from '../hooks/useMasks';

const Settings = () => {
  const { profile, fetchProfile, updateProfile } = useProfileStore();
  const { maskCEP, maskPhone, maskDocument } = useMasks();
  const [formData, setFormData] = useState({
    full_name: '',
    engineer_crea: '',
    company_name: '',
    company_crea: '',
    email: '',
    whatsapp: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    brand_color: '#4318FF',
    cnpj: '',
    inscricao_estadual: '',
    inscricao_municipal: '',
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        engineer_crea: profile.engineer_crea || '',
        company_name: profile.company_name || '',
        company_crea: profile.company_crea || '',
        email: profile.email || '',
        whatsapp: profile.whatsapp || '',
        cep: profile.cep || '',
        logradouro: profile.logradouro || '',
        numero: profile.numero || '',
        complemento: profile.complemento || '',
        bairro: profile.bairro || '',
        cidade: profile.cidade || '',
        estado: profile.estado || '',
        brand_color: profile.brand_color || '#4318FF',
        cnpj: profile.cnpj || '',
        inscricao_estadual: profile.inscricao_estadual || '',
        inscricao_municipal: profile.inscricao_municipal || '',
      });
      setLogoPreview(profile.company_logo_url);
    }
  }, [profile]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCEP(e.target.value);
    setFormData(prev => ({ ...prev, cep: masked }));
  };

  useEffect(() => {
    const numbers = formData.cep.replace(/\D/g, '');
    if (numbers.length === 8) {
      const timer = setTimeout(() => {
        fetchAddress(numbers);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [formData.cep]);

  const fetchAddress = async (cep: string) => {
    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || ''
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setCepLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      let logoUrl = profile?.company_logo_url;

      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${profile?.id}/logo_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await storageClient.storage
          .from('fotos-obras')
          .upload(fileName, logoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = storageClient.storage
          .from('fotos-obras')
          .getPublicUrl(fileName);
        
        logoUrl = publicUrl;
      }

      await updateProfile({
        ...formData,
        company_logo_url: logoUrl,
      });

      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erro ao salvar: ' + (error.message || 'Erro desconhecido') });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-8 sm:space-y-12">
      <header className="flex flex-col space-y-8 animate-fade-up">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
           <Link to="/dashboard" className="hover:text-[#4318FF] transition-colors">Painel</Link>
           <span className="opacity-30">/</span>
           <span className="text-slate-600">Configurações</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-brand-dark tracking-tight">Preferências</h1>
            <p className="text-slate-500 text-sm sm:text-base font-medium mt-1">Personalize a identidade da sua construtora.</p>
          </div>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary w-full sm:w-auto px-8 py-3.5 sm:py-4 flex items-center justify-center gap-3 disabled:opacity-50 group shadow-xl shadow-blue-500/20"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
            )}
            <span className="font-bold text-sm sm:text-base">Salvar Alterações</span>
          </button>
        </div>
      </header>

      {message.text && (
        <div className={`p-4 sm:p-5 rounded-2xl flex items-center gap-4 animate-fade-up ${
          message.type === 'success' 
            ? 'bg-blue-50/50 border border-blue-100 text-[#4318FF] backdrop-blur-md' 
            : 'bg-red-50/50 border border-red-100 text-red-600 backdrop-blur-md'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <Loader2 className="w-5 h-5 sm:w-6 sm:h-6" />}
          <p className="font-bold text-xs sm:text-sm tracking-tight">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8 sm:space-y-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        {/* Perfil Pessoal / Engenheiro */}
        <section className="soft-card p-5 sm:p-8">
          <div className="flex items-center gap-4 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F4F7FE] rounded-2xl flex items-center justify-center text-[#4318FF] shrink-0">
              <UserIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-brand-dark tracking-tight leading-none">Perfil do Engenheiro</h2>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1 font-medium italic">Dados profissionais do responsável técnico.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Nome Completo</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-5 py-3.5 rounded-xl sm:rounded-2xl bg-[#F4F7FE]/50 border border-slate-100 focus:border-[#4318FF] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-sans font-medium text-brand-dark text-sm"
                placeholder="Seu nome"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">CREA do Engenheiro</label>
              <div className="relative">
                <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.engineer_crea}
                  onChange={(e) => setFormData({ ...formData, engineer_crea: e.target.value })}
                  className="w-full pl-11 sm:pl-12 pr-5 py-3.5 rounded-xl sm:rounded-2xl bg-[#F4F7FE]/50 border border-slate-100 focus:border-[#4318FF] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-sans font-medium text-brand-dark text-sm"
                  placeholder="Ex: 123456789-0"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Dados da Construtora */}
        <section className="soft-card p-5 sm:p-8">
          <div className="flex items-center gap-4 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F4F7FE] rounded-2xl flex items-center justify-center text-[#4318FF] shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-brand-dark tracking-tight leading-none">Dados da Empresa</h2>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1 font-medium italic">Informações jurídicas e fiscais.</p>
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Razão Social / Nome Fantasia</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  className="w-full px-5 py-3.5 rounded-xl sm:rounded-2xl bg-[#F4F7FE]/50 border border-slate-100 focus:border-[#4318FF] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-sans font-medium text-brand-dark text-sm"
                  placeholder="Nome da sua construtora"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">CREA da Empresa (Opcional)</label>
                <input
                  type="text"
                  value={formData.company_crea}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_crea: e.target.value }))}
                  className="w-full px-5 py-3.5 rounded-xl sm:rounded-2xl bg-[#F4F7FE]/50 border border-slate-100 focus:border-[#4318FF] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-sans font-medium text-brand-dark text-sm"
                  placeholder="Registro CREA Jurídico"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">CNPJ</label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => setFormData(prev => ({ ...prev, cnpj: maskDocument(e.target.value) }))}
                  className="w-full px-5 py-3.5 rounded-xl sm:rounded-2xl bg-[#F4F7FE]/50 border border-slate-100 focus:border-[#4318FF] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-sans font-medium text-brand-dark text-sm"
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Inscrição Estadual</label>
                <input
                  type="text"
                  value={formData.inscricao_estadual}
                  onChange={(e) => setFormData(prev => ({ ...prev, inscricao_estadual: e.target.value }))}
                  className="w-full px-5 py-3.5 rounded-xl sm:rounded-2xl bg-[#F4F7FE]/50 border border-slate-100 focus:border-[#4318FF] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-sans font-medium text-brand-dark text-sm"
                  placeholder="Isenta ou Número"
                />
              </div>
              <div className="space-y-2 sm:col-span-2 md:col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Inscrição Municipal</label>
                <input
                  type="text"
                  value={formData.inscricao_municipal}
                  onChange={(e) => setFormData(prev => ({ ...prev, inscricao_municipal: e.target.value }))}
                  className="w-full px-5 py-3.5 rounded-xl sm:rounded-2xl bg-[#F4F7FE]/50 border border-slate-100 focus:border-[#4318FF] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-sans font-medium text-brand-dark text-sm"
                  placeholder="Número da I.M."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">E-mail de Contato</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-11 sm:pl-12 pr-5 py-3.5 rounded-xl sm:rounded-2xl bg-[#F4F7FE]/50 border border-slate-100 focus:border-[#4318FF] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-sans font-medium text-brand-dark text-sm"
                    placeholder="contato@empresa.com.br"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">WhatsApp / Telefone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: maskPhone(e.target.value) })}
                    className="w-full pl-11 sm:pl-12 pr-5 py-3.5 rounded-xl sm:rounded-2xl bg-[#F4F7FE]/50 border border-slate-100 focus:border-[#4318FF] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-sans font-medium text-brand-dark text-sm"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="pt-8 border-t border-slate-100/50">
               <h3 className="text-[10px] font-black text-[#4318FF] uppercase tracking-[0.2em] mb-6 flex items-center">
                 <MapPin className="w-3.5 h-3.5 mr-2" /> Endereço Sede
               </h3>
               <div className="grid grid-cols-6 gap-4 sm:gap-6">
                  <div className="col-span-6 sm:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">CEP</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.cep}
                        onChange={handleCEPChange}
                        className={`w-full px-5 py-3.5 rounded-xl sm:rounded-2xl bg-[#F4F7FE]/50 border border-slate-100 focus:border-[#4318FF] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-sans font-medium text-brand-dark text-sm ${cepLoading ? 'opacity-50 pr-12' : ''}`}
                        placeholder="00000-000"
                      />
                      {cepLoading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-4 h-4 text-[#4318FF] animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-6 sm:col-span-4 space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Logradouro</label>
                    <input
                      type="text"
                      value={formData.logradouro}
                      onChange={(e) => setFormData(prev => ({ ...prev, logradouro: e.target.value }))}
                      className="w-full px-5 py-3.5 rounded-xl sm:rounded-2xl bg-[#F4F7FE]/50 border border-slate-100 focus:border-[#4318FF] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-sans font-medium text-brand-dark text-sm"
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1 space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Nº</label>
                    <input
                      type="text"
                      value={formData.numero}
                      onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                      className="w-full px-2 py-3.5 rounded-xl sm:rounded-2xl bg-[#F4F7FE]/50 border border-slate-100 focus:border-[#4318FF] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-sans font-medium text-brand-dark text-center text-sm"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Complemento</label>
                    <input
                      type="text"
                      value={formData.complemento}
                      onChange={(e) => setFormData(prev => ({ ...prev, complemento: e.target.value }))}
                      className="w-full px-5 py-3.5 rounded-xl sm:rounded-2xl bg-[#F4F7FE]/50 border border-slate-100 focus:border-[#4318FF] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-sans font-medium text-brand-dark text-sm"
                      placeholder="Sala, Andar..."
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3 space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Bairro</label>
                    <input
                      type="text"
                      value={formData.bairro}
                      onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                      className="w-full px-5 py-3.5 rounded-xl sm:rounded-2xl bg-[#F4F7FE]/50 border border-slate-100 focus:border-[#4318FF] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-sans font-medium text-brand-dark text-sm"
                    />
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Identidade Visual */}
        <section className="soft-card p-5 sm:p-8">
          <div className="flex items-center gap-4 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F4F7FE] rounded-2xl flex items-center justify-center text-[#4318FF] shrink-0">
              <Palette className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-brand-dark tracking-tight leading-none">Identidade Visual</h2>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1 font-medium italic">Customização dos relatórios gerados.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Logo Upload */}
            <div className="space-y-6">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Logo da Empresa</label>
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-dashed border-slate-200 bg-[#F4F7FE]/50 flex items-center justify-center overflow-hidden transition-all relative shrink-0">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-4 transition-transform hover:scale-105" />
                  ) : (
                    <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300" />
                  )}
                </div>
                
                <div className="flex-1 space-y-4 w-full sm:w-auto">
                  <label className="cursor-pointer bg-[#4318FF] hover:bg-[#320fe3] text-white px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95">
                    <Upload className="w-4 h-4 shrink-0" />
                    Trocar Logo
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                  </label>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-relaxed text-center sm:text-left italic">
                    Use <strong>PNG transparente</strong> para melhor qualidade no PDF.
                  </p>
                </div>
              </div>
            </div>

            {/* Color Picker */}
            <div className="space-y-6">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Cor Primária do PDF</label>
              <div className="flex items-center gap-6">
                <div className="relative group shrink-0">
                  <input
                    type="color"
                    value={formData.brand_color}
                    onChange={(e) => setFormData({ ...formData, brand_color: e.target.value })}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-4 border-white shadow-xl cursor-pointer bg-transparent overflow-hidden transition-transform active:scale-95"
                  />
                  <div className="absolute -inset-1 rounded-[1.25rem] border-2 border-slate-100 -z-10 group-hover:border-[#4318FF]/20 transition-colors" />
                </div>
                <div className="flex-1">
                  <div className="font-mono text-xs sm:text-sm uppercase font-bold text-[#4318FF] bg-[#F4F7FE] px-4 py-3 rounded-xl sm:rounded-2xl border border-blue-50 flex items-center justify-between">
                    <span>{formData.brand_color}</span>
                    <Palette className="w-4 h-4 opacity-50" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-3 leading-relaxed italic">
                    Cor usada em cabeçalhos e detalhes do PDF gerado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
};

export default Settings;
