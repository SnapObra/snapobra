/**
 * Utilitários para processamento de imagem no navegador.
 * Foco: Conversão para WebP e compressão agressiva para SnapObra.
 */

interface ProcessImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export const processImage = async (
  file: File, 
  options: ProcessImageOptions = { maxWidth: 1600, maxHeight: 1600, quality: 0.6 }
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensionamento mantendo proporção
        if (width > (options.maxWidth || 1600) || height > (options.maxHeight || 1600)) {
          const ratio = Math.min((options.maxWidth || 1600) / width, (options.maxHeight || 1600) / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Falha ao obter contexto 2D do Canvas'));
          return;
        }

        // Desenhar imagem no canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Exportar como JPEG com compressão equilibrada (compatibilidade total PDF)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Falha ao converter imagem para JPEG'));
            }
          },
          'image/jpeg',
          options.quality || 0.8
        );
      };

      img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    };

    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
  });
};

/**
 * Gera um nome de arquivo único e amigável para o storage organizado por usuário.
 * Para vistorias, o identifier é o número do laudo (VTXXX).
 */
export const generateStoragePath = (userId: string, identifier: string, type: 'obras' | 'vistorias' = 'obras'): string => {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 8);
  // Usando .jpg para máxima compatibilidade com geradores de PDF e mobile
  const extension = 'jpg';
  
  if (type === 'vistorias') {
    return `users/${userId}/vistorias/laudos/${identifier}/${timestamp}_${randomString}.${extension}`;
  }
  
  return `users/${userId}/obras/${identifier}/${timestamp}_${randomString}.${extension}`;
};
