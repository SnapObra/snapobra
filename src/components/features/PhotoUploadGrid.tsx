import { useState, useRef, useCallback } from 'react';
import { Camera, Image as ImageIcon, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useReportStore } from '../../store/reportStore';

interface PhotoUploadGridProps {
  reportId: string;
  obraId: string;
}

interface UploadStatus {
  id: string;
  file: File;
  preview: string;
  status: 'processing' | 'uploading' | 'success' | 'error';
  progress: number;
}

export const PhotoUploadGrid = ({ reportId, obraId }: PhotoUploadGridProps) => {
  const [uploads, setUploads] = useState<UploadStatus[]>([]);
  const { uploadFoto } = useReportStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;
    
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

    const newUploads: UploadStatus[] = Array.from(files)
      .filter(file => {
        if (!ALLOWED_TYPES.includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
          console.warn(`Arquivo ignorado (tipo não suportado): ${file.name}`);
          return false;
        }
        if (file.size > MAX_FILE_SIZE) {
          console.warn(`Arquivo ignorado (muito grande): ${file.name}`);
          return false;
        }
        return true;
      })
      .map(file => ({
        id: crypto.randomUUID?.() || Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file),
        status: 'processing',
        progress: 0
      }));

    if (newUploads.length === 0) return;
    setUploads(prev => [...prev, ...newUploads]);

    // Processar e Fazer Upload de cada foto sequencialmente (ou paralelo controlado)
    for (const upload of newUploads) {
      try {
        // 1. Iniciar processamento (WebP + Compressão)
        setUploads(prev => prev.map(u => u.id === upload.id ? { ...u, status: 'processing' } : u));
        
        // 2. Upload para Supabase (O store já chama o processImage internamente conforme planejado)
        setUploads(prev => prev.map(u => u.id === upload.id ? { ...u, status: 'uploading' } : u));
        
        const result = await uploadFoto(reportId, obraId, upload.file);
        
        if (result) {
          setUploads(prev => prev.map(u => u.id === upload.id ? { ...u, status: 'success' } : u));
          // Limpar preview após sucesso (opcional, para liberar memória)
          setTimeout(() => {
            setUploads(prev => prev.filter(u => u.id !== upload.id));
          }, 2000);
        } else {
          setUploads(prev => prev.map(u => u.id === upload.id ? { ...u, status: 'error' } : u));
        }
      } catch (error) {
        setUploads(prev => prev.map(u => u.id === upload.id ? { ...u, status: 'error' } : u));
      }
    }
  }, [reportId, obraId, uploadFoto]);

  return (
    <div className="space-y-6">
      {/* Upload Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-slate-200 rounded-3xl hover:border-brand-primary hover:bg-brand-primary/5 transition-all group"
        >
          <Camera className="w-8 h-8 text-slate-400 group-hover:text-brand-primary mb-2" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-brand-primary">Tirar Foto</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-slate-200 rounded-3xl hover:border-brand-primary hover:bg-brand-primary/5 transition-all group"
        >
          <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-brand-primary mb-2" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-brand-primary">Galeria</span>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*"
        capture="environment" // Habilita câmera no mobile
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />

      {/* Upload Progress Grid */}
      {uploads.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in fade-in slide-in-from-bottom-4">
          {uploads.map((upload) => (
            <div key={upload.id} className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 ring-1 ring-slate-200 shadow-sm transition-all group">
              <img 
                src={upload.preview} 
                alt="Preview" 
                className={`w-full h-full object-cover transition-opacity duration-500 ${upload.status === 'processing' ? 'opacity-40 animate-pulse' : 'opacity-100'}`}
              />
              
              {/* Overlay Status */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity">
                {upload.status === 'processing' && (
                  <div className="text-center px-2">
                    <Loader2 className="w-6 h-6 text-white animate-spin mx-auto mb-1" />
                    <span className="text-[9px] text-white font-bold uppercase tracking-widest">Otimizando WebP</span>
                  </div>
                )}
                {upload.status === 'uploading' && (
                  <div className="text-center px-2">
                    <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden mb-2">
                       <div className="h-full bg-brand-primary animate-progress-indefinite" />
                    </div>
                    <span className="text-[9px] text-white font-bold uppercase tracking-widest">Enviando</span>
                  </div>
                )}
                {upload.status === 'success' && (
                  <div className="text-center animate-out zoom-out duration-1000 fill-mode-forwards text-brand-primary">
                    <CheckCircle2 className="w-8 h-8 filter drop-shadow-md" />
                  </div>
                )}
                {upload.status === 'error' && (
                  <div className="text-center text-red-400">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                )}
              </div>

              {/* Delete Button (only if not uploading) */}
              {upload.status !== 'uploading' && (
                <button 
                  onClick={() => setUploads(prev => prev.filter(u => u.id !== upload.id))}
                  className="absolute top-2 right-2 p-1 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
