import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building2, Calendar, HardHat, 
  MapPin, Loader2, Download, Share2, Check
} from 'lucide-react';
import { useReportStore } from '../store/reportStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { downloadPremiumPDF } from '../services/pdf/pdfGeneratorService';

export const PublicReportView = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { fetchPublicReport, isLoading } = useReportStore();
  const [reportData, setReportData] = useState<{ report: any, profile: any } | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const loadReport = async () => {
      if (reportId) {
        const data = await fetchPublicReport(reportId);
        setReportData(data);
        if (data) {
          document.title = `Relatório: ${data.report.title} | ${data.profile?.company_name || 'SnapObra'}`;
        }
      }
    };
    loadReport();
    return () => {
      document.title = 'SnapObra — Relatórios Fotográficos Inteligentes';
    };
  }, [reportId, fetchPublicReport]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!reportData) return;
    setIsGeneratingPDF(true);
    try {
      const { report, profile } = reportData;
      // Precisamos de um objeto Obra básico para o gerador
      const mockObra: any = {
        id: report.obra_id,
        name: report.title, // Fallback se não tivermos o nome da obra aqui
        client_name: profile?.company_name || 'Cliente',
        created_at: report.created_at
      };
      await downloadPremiumPDF(report, profile, mockObra);
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      alert('Erro ao gerar o PDF Premium.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading && !reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
         <Building2 className="w-16 h-16 text-slate-200 mb-4" />
         <h1 className="text-2xl font-display text-slate-800">Relatório não encontrado</h1>
         <p className="text-slate-500 mt-2">O link pode estar expirado ou incorreto.</p>
         <Link to="/" className="mt-6 text-brand-primary font-medium underline underline-offset-4 decoration-brand-primary/30">Voltar para Início</Link>
      </div>
    );
  }

  const { report, profile } = reportData;
  const systemBrandColor = '#4318FF';
  const brandColor = systemBrandColor;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans print:bg-white print:pb-0">
      {/* Editorial Header (Public) - Hidden on Print */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 py-4 sticky top-0 z-50 shadow-sm print:hidden">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             {profile?.company_logo_url ? (
               <img src={profile.company_logo_url} alt={profile.company_name} className="h-8 w-auto object-contain" />
             ) : (
               <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: brandColor }}>
                 <HardHat className="w-5 h-5" />
               </div>
             )}
             <span className="font-display text-xl text-slate-900 hidden sm:block">
               {profile?.company_name || 'SnapObra'}
             </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all font-medium text-sm"
            >
              {isCopying ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isCopying ? 'Copiado!' : 'Compartilhar'}</span>
            </button>
            <button 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white shadow-lg shadow-brand/20 transition-all font-medium text-sm hover:brightness-110 active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: brandColor }}
            >
              {isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden sm:inline">{isGeneratingPDF ? 'Gerando...' : 'Baixar PDF Premium'}</span>
            </button>
          </div>
        </div>
      </header>

      <main id="report-content" className="max-w-5xl mx-auto bg-white sm:mt-8 print:mt-0 print:shadow-none shadow-xl shadow-slate-200/50 border-x border-b border-slate-100 min-h-[29.7cm]">
         {/* Report Metadata Header */}
         <div className="p-8 lg:p-16 border-t-8" style={{ borderTopColor: brandColor }}>
            <div className="flex justify-between items-start mb-12">
               <div className="space-y-4">
                  <div className="inline-flex items-center space-x-3 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brandColor }} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Relatório Fotográfico</span>
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-display text-slate-900 leading-tight">
                    {report.title}
                  </h1>
               </div>
               {profile?.company_logo_url && (
                 <img src={profile.company_logo_url} alt="Logo" className="w-24 h-24 object-contain print:w-32" />
               )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-10 border-t border-slate-50">
               <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Data do Registro</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 ml-5">
                    {format(new Date(report.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </p>
               </div>
               <div className="space-y-1">
                   <div className="flex items-center space-x-2 text-slate-400">
                    <Building2 className="w-3.5 h-3.5" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Construtora</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 ml-5">{profile?.company_name || '---'}</p>
               </div>
               <div className="space-y-1 print:hidden">
                   <div className="flex items-center space-x-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Localização</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 ml-5 italic">Obra em andamento</p>
               </div>
            </div>

            {report.notes && (
              <div className="mt-12 p-6 bg-slate-50/50 rounded-2xl text-slate-600 text-sm leading-relaxed border-l-4" style={{ borderColor: brandColor }}>
                <p className="font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-2">Observações Gerais</p>
                "{report.notes}"
              </div>
            )}
         </div>

         {/* Photos List - High Quality Editorial Layout */}
         <div className="mt-4 px-8 lg:px-16 space-y-16 pb-20">
            {report.fotos?.map((foto: any, index: number) => (
              <div key={foto.id} className="group break-inside-avoid animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                 <div className="relative mb-6">
                    <div className="bg-slate-100 rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100">
                      <img 
                        src={foto.public_url} 
                        alt={`Registro ${index + 1}`}
                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    {/* Index Marker */}
                    <div 
                      className="absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-display italic shadow-xl z-10 border-4 border-white"
                      style={{ backgroundColor: brandColor }}
                    >
                       {index + 1}
                    </div>
                 </div>

                 {foto.caption && (
                   <div className="max-w-3xl ml-4 sm:ml-8 border-l-2 pl-6" style={{ borderColor: brandColor + '40' }}>
                      <div className="flex items-center text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: brandColor }}>
                        Nota Técnica do Engenheiro
                      </div>
                      <p className="text-base text-slate-700 leading-relaxed font-sans">
                        {foto.caption}
                      </p>
                   </div>
                 )}
              </div>
            ))}
         </div>

         {/* Editorial Signature Block */}
         <div className="p-16 border-t border-slate-50 bg-slate-50/20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
               <div className="text-center md:text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2 dark:text-slate-500">Autenticidade Garantida</p>
                  <p className="text-sm font-display text-slate-800">
                    {profile?.company_name || 'SnapObra'}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-1">Gerado via SnapObra em {format(new Date(), "dd/MM/yyyy HH:mm")}</p>
               </div>
               
               <div className="flex flex-col items-center">
                  <div className="w-32 h-px bg-slate-200 mb-2" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Responsável Técnico</p>
                  <p className="text-xs text-slate-600 mt-1">{profile?.full_name || 'Assinado Digitalmente'}</p>
               </div>
            </div>
         </div>
      </main>

      {/* WhatsApp Support Floating Action - Only for mobile audience */}
      <div className="fixed bottom-6 right-6 print:hidden hidden sm:block">
         <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Visualização Online Ativa</span>
         </div>
      </div>
    </div>
  );
};
