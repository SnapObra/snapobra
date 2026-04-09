import { create } from 'zustand';
import { supabase, storageClient } from '../lib/supabase';

export interface Obra {
  id: string;
  ndo?: string;
  name: string;
  client_name: string;
  client_whatsapp?: string;
  client_document?: string;
  contract_number?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  status: 'active' | 'completed' | 'paused';
  description?: string;
  total_reports: number;
  created_at: string;
}

interface ObraState {
  obras: Obra[];
  isLoading: boolean;
  error: string | null;
  fetchObras: () => Promise<void>;
  createObra: (obra: Omit<Obra, 'id' | 'created_at' | 'total_reports' | 'user_id'>) => Promise<{ error: any }>;
  updateObra: (id: string, updates: Partial<Obra>) => Promise<{ error: any }>;
  deleteObra: (id: string) => Promise<{ error: any }>;
}

export const useObraStore = create<ObraState>((set, get) => ({
  obras: [],
  isLoading: false,
  error: null,

  fetchObras: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('obras')
        .select(`
          *,
          relatorios(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedData = (data || []).map(obra => ({
        ...obra,
        total_reports: obra.relatorios?.[0]?.count || 0
      }));

      set({ obras: mappedData, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createObra: async (obraData) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('obras')
        .insert([obraData])
        .select();

      if (error) throw error;
      
      const currentObras = get().obras;
      set({ obras: [data[0], ...currentObras], isLoading: false });
      return { error: null };
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return { error: err };
    }
  },

  updateObra: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('obras')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await get().fetchObras(); // Refresh
      return { error: null };
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return { error: err };
    }
  },

  deleteObra: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Buscar todas as fotos vinculadas a esta obra para deletar do storage
      const { data: fotos } = await supabase
        .from('fotos')
        .select('storage_path')
        .eq('obra_id', id);

      if (fotos && fotos.length > 0) {
        const paths = fotos.map(f => f.storage_path);
        // 2. Remover arquivos do storage em lote
        await storageClient
          .storage
          .from('fotos-obras')
          .remove(paths);
      }

      // 3. Deletar do banco (o cascade no Banco apaga os registros em relatorios e fotos)
      const { error } = await supabase
        .from('obras')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set({ 
        obras: get().obras.filter(o => o.id !== id),
        isLoading: false 
      });
      return { error: null };
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return { error: err };
    }
  },
}));
