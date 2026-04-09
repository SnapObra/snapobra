// src/services/pdf/pdfGeneratorService.ts
import { pdf } from '@react-pdf/renderer'
import { ReportDocument } from './ReportDocument'
import { mapToDailyReport } from './reportMapper'
import { Relatorio } from '../../store/reportStore'
import { Profile } from '../../store/profileStore'
import { Obra } from '../../store/obraStore'

/**
 * Converte uma URL de imagem (especialmente WebP) em uma Data URL JPEG
 * compatível com o motor de PDF, utilizando um Canvas para a conversão.
 */
async function getSafeImageData(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Evita problemas de CORS
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Falha ao obter contexto do canvas'));
          return;
        }
        
        ctx.fillStyle = '#FFFFFF'; // Fundo branco caso haja transparência
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        // Exporta como JPEG (formato universalmente aceito pelo PDF)
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      
      img.onerror = () => {
        console.error('Erro ao processar imagem para o PDF:', url);
        resolve(''); // Retorna vazio em vez de travar tudo
      };
      
      // Cria uma URL temporária para carregar no objeto Image
      const objectUrl = URL.createObjectURL(blob);
      img.src = objectUrl;
    });
  } catch (error) {
    console.warn(`Falha crítica ao carregar imagem para o PDF: ${url}`, error);
    return '';
  }
}

/**
 * Serviço central para geração do PDF Premium.
 * Transforma os dados do banco no formato rico e gera o Blob final.
 */
export const generatePremiumPDF = async (
  report: Relatorio,
  profile: Profile,
  obra: Obra
): Promise<Blob> => {
  try {
    // 1. Mapear dados para o formato rico (DailyReport)
    const dailyReport = mapToDailyReport(report, profile, obra)

    // 2. PRÉ-PROCESSAMENTO: Converter todas as fotos e logo para Data URLs (Safe)
    if (dailyReport.company.logoUrl) {
      dailyReport.company.logoUrl = await getSafeImageData(dailyReport.company.logoUrl);
    }

    const processedPhotos = await Promise.all(
      dailyReport.photos.map(async (photo) => ({
        ...photo,
        url: await getSafeImageData(photo.url)
      }))
    );
    dailyReport.photos = processedPhotos.filter(p => p.url !== '');

    // 3. Renderizar para Blob usando o motor Premium
    const blob = await pdf(<ReportDocument report={dailyReport} /> as any).toBlob()
    
    return blob
  } catch (error) {
    console.error('Erro na geração do PDF Premium:', error);
    throw new Error('Falha ao gerar o documento PDF de alta qualidade.');
  }
}

/**
 * Helper para disparar o download direto no browser
 */
export const downloadPremiumPDF = async (
  report: Relatorio,
  profile: Profile,
  obra: Obra
) => {
  const blob = await generatePremiumPDF(report, profile, obra)
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `Relatorio_${obra.name}_${report.date}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}
