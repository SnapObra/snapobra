import { create } from 'zustand';
import { supabase, storageClient } from '../lib/supabase';
import { processImage, generateStoragePath } from '../lib/imageUtils';
import { generateAIPdfReport } from '../lib/aiPdfService';
import { useObraStore } from './obraStore';
import { useProfileStore } from './profileStore';

export interface Foto {
  id: string;
  report_id: string;
  storage_path: string;
  public_url: string;
  caption: string;
  area_setor?: string;
  order_index: number;
  created_at: string;
}

export interface Atividade {
  id: string;
  report_id: string;
  area: string;
  description: string;
  status: 'concluido' | 'em_andamento' | 'iniciado' | 'pendente';
  created_at: string;
}

export interface Relatorio {
  id: string;
  obra_id: string;
  user_id?: string;
  rdo_number?: string;
  title: string;
  date: string;
  notes: string;
  pdf_url?: string;
  last_generated_at?: string;
  created_at: string;
  fotos?: Foto[];
  atividades?: Atividade[];
  weather?: { condition: string; praticavel?: string };
  workforce?: { supervisor: number; encarregado: number; profissional: number; ajudante: number };
}

interface ReportState {
  reports: Relatorio[];
  currentReport: Relatorio | null;
  isLoading: boolean;
  error: string | null;
  
  fetchReports: (obraId?: string) => Promise<void>;
  fetchReportById: (reportId: string) => Promise<Relatorio | null>;
  createReport: (obraId: string, title: string, date: string, notes?: string, weather?: any, workforce?: any) => Promise<Relatorio | null>;
  updateReport: (reportId: string, updates: Partial<Relatorio>) => Promise<{ error: any }>;
  uploadFoto: (reportId: string, obraId: string, file: File, caption?: string) => Promise<Foto | null>;
  updateFotoCaption: (fotoId: string, caption: string) => Promise<void>;
  updateFotosOrder: (reportId: string, fotos: Foto[]) => Promise<void>;
  deleteReport: (reportId: string) => Promise<void>;
  deleteFoto: (fotoId: string, storagePath: string) => Promise<void>;
  updateFotoArea: (fotoId: string, area: string) => Promise<void>;
  createAtividade: (reportId: string, obraId: string, area: string, description: string) => Promise<void>;
  deleteAtividade: (atividadeId: string) => Promise<void>;
  generateAIReport: (reportId: string) => Promise<string | null>;
  generateRDONumber: (obraId: string, date: string) => Promise<string>;
  fetchPublicReport: (reportId: string) => Promise<{ report: Relatorio; profile: any } | null>;
}

export const useReportStore = create<ReportState>((set, get) => ({
  reports: [],
  currentReport: null,
  isLoading: false,
  error: null,

  generateRDONumber: async (obraId, date) => {
    try {
      const dateObj = new Date(date + 'T12:00:00'); // Garantir meio-dia para evitar problemas de fuso
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = String(dateObj.getFullYear()).slice(-2);
      const prefix = `${day}${month}${year}`;

      // Buscar relatórios daquela obra naquele dia
      const { data, error } = await supabase
        .from('relatorios')
        .select('rdo_number')
        .eq('obra_id', obraId)
        .eq('date', date)
        .not('rdo_number', 'is', null);

      if (error) throw error;

      let nextSeq = 1;
      if (data && data.length > 0) {
        // Extrair os maiores sequenciais existentes para aquele dia
        const sequences = data
          .map(r => parseInt(r.rdo_number.slice(-2)))
          .filter(s => !isNaN(s));
        
        if (sequences.length > 0) {
          nextSeq = Math.max(...sequences) + 1;
        }
      }

      return `${prefix}${String(nextSeq).padStart(2, '0')}`;
    } catch (err) {
      console.error('Erro ao gerar RDO:', err);
      return 'ERR00000';
    }
  },

  fetchReports: async (obraId?: string) => {
    set({ isLoading: true, error: null });
    try {
      let query = supabase
        .from('relatorios')
        .select(`
          *,
          fotos (*),
          atividades:atividades_relatorio (*)
        `)
        .order('date', { ascending: false })
        .order('order_index', { foreignTable: 'fotos', ascending: true });

      if (obraId) {
        query = query.eq('obra_id', obraId);
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ reports: data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchReportById: async (reportId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('relatorios')
        .select(`
          *,
          fotos (*),
          atividades:atividades_relatorio (*)
        `)
        .eq('id', reportId)
        .order('order_index', { foreignTable: 'fotos', ascending: true })
        .single();

      if (error) throw error;
      
      // Obter URLs públicas para as fotos (usando o storageClient do projeto snapobra_store)
      const fotosWithUrls = await Promise.all((data.fotos || []).map(async (foto: any) => {
        const { data: { publicUrl } } = storageClient
          .storage
          .from('fotos-obras')
          .getPublicUrl(foto.storage_path);
        return { ...foto, public_url: publicUrl };
      }));

      const reportWithUrls = { ...data, fotos: fotosWithUrls };
      set({ currentReport: reportWithUrls, isLoading: false });
      return reportWithUrls;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  createReport: async (obraId, title, date, notes, weather, workforce) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Usuário não autenticado.");

      // Gerar RDO Automático
      const rdoNumber = await get().generateRDONumber(obraId, date);

      const { data, error } = await supabase
        .from('relatorios')
        .insert([{ 
          obra_id: obraId, 
          title, 
          date, 
          notes,
          rdo_number: rdoNumber,
          user_id: session.user.id,
          weather: weather || {},
          workforce: workforce || {}
        }])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ reports: [data, ...state.reports], isLoading: false }));
      return data;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  updateReport: async (reportId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('relatorios')
        .update(updates)
        .eq('id', reportId)
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({
        reports: state.reports.map(r => r.id === reportId ? data : r),
        currentReport: state.currentReport?.id === reportId ? data : state.currentReport,
        isLoading: false
      }));

      return { error: null };
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return { error: err };
    }
  },

  uploadFoto: async (reportId, obraId, file, caption = '') => {
    try {
      // Obter ID do usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // 1. Processar Foto (Converter para WebP + Compressão)
      const webpBlob = await processImage(file);
      const storagePath = generateStoragePath(user.id, obraId);

      // 2. Upload para o projeto snapobra_store (bucket: fotos-obras)
      const { error: uploadError } = await storageClient
        .storage
        .from('fotos-obras')
        .upload(storagePath, webpBlob, {
          contentType: 'image/webp',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 3. Obter URL pública antes de registrar no banco
      const { data: { publicUrl } } = storageClient
        .storage
        .from('fotos-obras')
        .getPublicUrl(storagePath);

      // 4. Registrar metadados no banco principal (snapobra_bd)
      const currentFotos = get().currentReport?.fotos || [];
      const nextOrder = currentFotos.length;

      const { data, error: dbError } = await supabase
        .from('fotos')
        .insert([{
          report_id: reportId,
          storage_path: storagePath,
          public_url: publicUrl,
          caption,
          order_index: nextOrder
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      const fotoWithUrl = { ...data, public_url: publicUrl };

      // Atualizar estado local
      set((state) => {
        if (state.currentReport && state.currentReport.id === reportId) {
          return {
            currentReport: {
              ...state.currentReport,
              fotos: [...(state.currentReport.fotos || []), fotoWithUrl]
            }
          };
        }
        return state;
      });

      return fotoWithUrl;
    } catch (err: any) {
      set({ error: err.message });
      console.error('Erro no upload de foto:', err);
      return null;
    }
  },

  updateFotoCaption: async (fotoId, caption) => {
    try {
      const { error } = await supabase
        .from('fotos')
        .update({ caption })
        .eq('id', fotoId);

      if (error) throw error;
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateFotosOrder: async (reportId, fotos) => {
    set({ isLoading: true });
    try {
      // Atualização em lote (batch update) via RPC ou múltiplos updates
      // Para manter simples e sem precisar de RPC customizada no Supabase:
      const updates = fotos.map((foto, index) => 
        supabase
          .from('fotos')
          .update({ order_index: index })
          .eq('id', foto.id)
      );

      await Promise.all(updates);

      set((state) => {
        if (state.currentReport && state.currentReport.id === reportId) {
          return {
            currentReport: {
              ...state.currentReport,
              fotos: [...fotos].map((f, i) => ({ ...f, order_index: i }))
            },
            isLoading: false
          };
        }
        return { isLoading: false };
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  deleteReport: async (reportId) => {
    try {
      // 1. Buscar fotos para obter caminhos do storage antes de deletar
      const { data: fotos } = await supabase
        .from('fotos')
        .select('storage_path')
        .eq('report_id', reportId);

      if (fotos && fotos.length > 0) {
        const paths = fotos.map(f => f.storage_path);
        // 2. Remover do storage
        await storageClient
          .storage
          .from('fotos-obras')
          .remove(paths);
      }

      // 3. Deletar do banco (o cascading apaga fotos e atividades no DB)
      const { error } = await supabase
        .from('relatorios')
        .delete()
        .eq('id', reportId);

      if (error) throw error;
      
      set((state) => ({ 
        reports: state.reports.filter(r => r.id !== reportId),
        currentReport: state.currentReport?.id === reportId ? null : state.currentReport
      }));
    } catch (err: any) {
      set({ error: err.message });
      console.error('Erro ao deletar relatório:', err);
    }
  },

  updateFotoArea: async (fotoId, area) => {
    try {
      const { error } = await supabase
        .from('fotos')
        .update({ area_setor: area })
        .eq('id', fotoId);

      if (error) throw error;

      set((state) => {
        if (state.currentReport) {
          return {
            currentReport: {
              ...state.currentReport,
              fotos: state.currentReport.fotos?.map(f => f.id === fotoId ? { ...f, area_setor: area } : f)
            }
          };
        }
        return state;
      });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  createAtividade: async (reportId, obraId, area, description) => {
    try {
      const { error } = await supabase
        .from('atividades_relatorio')
        .insert([{ report_id: reportId, obra_id: obraId, area, description, status: 'em_andamento' }]);
      
      if (error) throw error;
      get().fetchReportById(reportId); // Recarregar
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteAtividade: async (atividadeId) => {
    try {
      const { error } = await supabase
        .from('atividades_relatorio')
        .delete()
        .eq('id', atividadeId);
      
      if (error) throw error;
      const reportId = get().currentReport?.id;
      if (reportId) get().fetchReportById(reportId);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteFoto: async (fotoId, storagePath) => {
    try {
      // 1. Remover do storage (snapobra_store)
      const { error: storageError } = await storageClient
        .storage
        .from('fotos-obras')
        .remove([storagePath]);

      if (storageError) throw storageError;

      // 2. Remover do banco (snapobra_bd)
      const { error: dbError } = await supabase
        .from('fotos')
        .delete()
        .eq('id', fotoId);

      if (dbError) throw dbError;

      // Atualizar estado local
      set((state) => {
        if (state.currentReport) {
          return {
            currentReport: {
              ...state.currentReport,
              fotos: state.currentReport.fotos?.filter(f => f.id !== fotoId)
            }
          };
        }
        return state;
      });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  generateAIReport: async (reportId) => {
    set({ isLoading: true, error: null });
    try {
      const report = get().currentReport;
      if (!report || report.id !== reportId) {
        throw new Error("Relatório não carregado no estado.");
      }

      const obra = useObraStore.getState().obras.find(o => o.id === report.obra_id);
      const profile = useProfileStore.getState().profile;

      if (!obra || !profile) {
        throw new Error("Dados de obra ou perfil não encontrados.");
      }

      const publicUrl = await generateAIPdfReport(report, profile, obra.name);
      
      if (!publicUrl) throw new Error('Erro ao gerar relatório com IA');

      // Atualizar o estado local
      set((state) => ({
        reports: state.reports.map(r => 
          r.id === reportId ? { ...r, pdf_url: publicUrl, last_generated_at: new Date().toISOString() } : r
        ),
        currentReport: state.currentReport?.id === reportId 
          ? { ...state.currentReport, pdf_url: publicUrl, last_generated_at: new Date().toISOString() } 
          : state.currentReport,
        isLoading: false
      }));

      return publicUrl;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      console.error('Erro na geração IA:', err);
      return null;
    }
  },

  fetchPublicReport: async (reportId: string) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Buscar o relatório e suas fotos
      const { data: report, error: reportError } = await supabase
        .from('relatorios')
        .select(`
          *,
          fotos (*)
        `)
        .eq('id', reportId)
        .order('order_index', { foreignTable: 'fotos', ascending: true })
        .single();

      if (reportError) throw reportError;

      // 2. Buscar as fotos com URLs públicas
      const fotosWithUrls = await Promise.all((report.fotos || []).map(async (foto: any) => {
        const { data: { publicUrl } } = storageClient
          .storage
          .from('fotos-obras')
          .getPublicUrl(foto.storage_path);
        return { ...foto, public_url: publicUrl };
      }));

      const fullReport = { ...report, fotos: fotosWithUrls };
      
      // 3. Buscar o perfil da empresa (branding) baseado no owner do relatório
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', report.user_id)
        .single();

      if (profileError) {
        console.warn('Perfil não encontrado para o relatório público:', profileError);
      }

      set({ currentReport: fullReport, isLoading: false });
      return { report: fullReport, profile };
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return null;
    }
  }
}));
