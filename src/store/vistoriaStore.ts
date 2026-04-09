import { create } from 'zustand';
import { supabase, storageClient } from '../lib/supabase';
import { processImage, generateStoragePath } from '../lib/imageUtils';

export interface VistoriaFoto {
  id: string;
  vistoria_id: string;
  storage_path: string;
  public_url: string;
  caption: string;
  created_at: string;
}

export interface Vistoria {
  id: string;
  obra_id: string;
  user_id: string;
  vt_number: string;
  empreendimento_nome: string;
  unidade: string;
  proprietario: string;
  data_vistoria: string;
  responsavel_tecnico: string;
  crea_cau: string;
  checklist_data: any;
  conclusao: string;
  pdf_url?: string;
  created_at: string;
  fotos?: VistoriaFoto[];
}

interface VistoriaState {
  vistorias: Vistoria[];
  currentVistoria: Vistoria | null;
  isLoading: boolean;
  error: string | null;

  fetchVistorias: () => Promise<void>;
  fetchVistoriaById: (id: string) => Promise<Vistoria | null>;
  createVistoria: (data: Partial<Vistoria>) => Promise<Vistoria | null>;
  updateVistoria: (id: string, updates: Partial<Vistoria>) => Promise<{ error: any }>;
  deleteVistoria: (id: string) => Promise<void>;
  uploadFoto: (vistoriaId: string, vtNumber: string, file: File, caption?: string) => Promise<VistoriaFoto | null>;
  deleteFoto: (fotoId: string, storagePath: string) => Promise<void>;
  updateFotoCaption: (fotoId: string, caption: string) => Promise<void>;
  generateVTNumber: () => Promise<string>;
}

export const useVistoriaStore = create<VistoriaState>((set, get) => ({
  vistorias: [],
  currentVistoria: null,
  isLoading: false,
  error: null,

  generateVTNumber: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // Buscar a última vistoria desse usuário (empresa)
      const { data, error } = await supabase
        .from('vistorias')
        .select('vt_number')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      let nextNum = 1;
      if (data && data.length > 0) {
        const lastVT = data[0].vt_number;
        const numPart = lastVT.replace('VT', '');
        nextNum = parseInt(numPart) + 1;
      }

      return `VT${String(nextNum).padStart(3, '0')}`;
    } catch (err) {
      console.error('Erro ao gerar VT Number:', err);
      return 'VT001';
    }
  },

  fetchVistorias: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('vistorias')
        .select('*, fotos_vistoria(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Mapear fotos_vistoria para fotos para manter consistência
      const mapped = (data || []).map(v => ({
        ...v,
        fotos: v.fotos_vistoria
      }));

      set({ vistorias: mapped, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchVistoriaById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('vistorias')
        .select('*, fotos_vistoria(*)')
        .eq('id', id)
        .single();

      if (error) throw error;

      const vt = { ...data, fotos: data.fotos_vistoria };
      set({ currentVistoria: vt, isLoading: false });
      return vt;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  createVistoria: async (vtData) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const vtNumber = await get().generateVTNumber();

      const { data, error } = await supabase
        .from('vistorias')
        .insert([{ 
          ...vtData, 
          vt_number: vtNumber,
          user_id: user.id 
        }])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ vistorias: [data, ...state.vistorias], isLoading: false }));
      return data;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  updateVistoria: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('vistorias')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      set((state) => {
        const existingVistoria = state.vistorias.find(v => v.id === id);
        const existingFotos = existingVistoria?.fotos || [];

        const updatedData = {
          ...data,
          fotos: existingFotos
        };

        return {
          vistorias: state.vistorias.map(v => v.id === id ? updatedData : v),
          currentVistoria: state.currentVistoria?.id === id ? updatedData : state.currentVistoria,
          isLoading: false
        };
      });

      return { error: null };
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return { error: err };
    }
  },

  deleteVistoria: async (id) => {
    try {
      // 1. Buscar fotos para deletar do storage
      const { data: fotos } = await supabase
        .from('fotos_vistoria')
        .select('storage_path')
        .eq('vistoria_id', id);

      if (fotos && fotos.length > 0) {
        const paths = fotos.map(f => f.storage_path);
        await storageClient.storage.from('vistorias').remove(paths);
      }

      // 2. Deletar do banco
      const { error } = await supabase.from('vistorias').delete().eq('id', id);
      if (error) throw error;

      set((state) => ({
        vistorias: state.vistorias.filter(v => v.id !== id),
        currentVistoria: state.currentVistoria?.id === id ? null : state.currentVistoria
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  uploadFoto: async (vistoriaId, vtNumber, file, caption = '') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const webpBlob = await processImage(file);
      const storagePath = generateStoragePath(user.id, vtNumber, 'vistorias');

      const { error: uploadError } = await storageClient.storage
        .from('vistorias')
        .upload(storagePath, webpBlob, { contentType: 'image/webp' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = storageClient.storage
        .from('vistorias')
        .getPublicUrl(storagePath);

      const { data, error: dbError } = await supabase
        .from('fotos_vistoria')
        .insert([{
          vistoria_id: vistoriaId,
          storage_path: storagePath,
          public_url: publicUrl,
          caption
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      set((state) => {
        const updatedVistorias = state.vistorias.map(v => {
          if (v.id === vistoriaId) {
            return {
              ...v,
              fotos: [...(v.fotos || []), data]
            };
          }
          return v;
        });

        const updatedCurrent = state.currentVistoria?.id === vistoriaId
          ? {
              ...state.currentVistoria,
              fotos: [...(state.currentVistoria.fotos || []), data]
            }
          : state.currentVistoria;

        return {
          vistorias: updatedVistorias,
          currentVistoria: updatedCurrent
        };
      });

      return data;
    } catch (err: any) {
      set({ error: err.message });
      return null;
    }
  },

  deleteFoto: async (fotoId, storagePath) => {
    try {
      await storageClient.storage.from('vistorias').remove([storagePath]);
      const { error } = await supabase.from('fotos_vistoria').delete().eq('id', fotoId);
      if (error) throw error;

      set((state) => {
        const updatedVistorias = state.vistorias.map(v => ({
          ...v,
          fotos: (v.fotos || []).filter(f => f.id !== fotoId)
        }));

        const updatedCurrent = state.currentVistoria
          ? {
              ...state.currentVistoria,
              fotos: (state.currentVistoria.fotos || []).filter(f => f.id !== fotoId)
            }
          : null;

        return {
          vistorias: updatedVistorias,
          currentVistoria: updatedCurrent
        };
      });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateFotoCaption: async (fotoId, caption) => {
    try {
      const { error } = await supabase
        .from('fotos_vistoria')
        .update({ caption })
        .eq('id', fotoId);

      if (error) throw error;

      set((state) => {
        const updateFotos = (fotos: VistoriaFoto[] | undefined) => 
          (fotos || []).map(f => f.id === fotoId ? { ...f, caption } : f);

        return {
          vistorias: state.vistorias.map(v => ({
            ...v,
            fotos: updateFotos(v.fotos)
          })),
          currentVistoria: state.currentVistoria
            ? { ...state.currentVistoria, fotos: updateFotos(state.currentVistoria.fotos) }
            : null
        };
      });
    } catch (err: any) {
      console.error('Erro ao atualizar legenda:', err);
      set({ error: err.message });
    }
  }
}));
