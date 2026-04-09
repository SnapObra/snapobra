import jsPDF from "jspdf";
import { supabase } from "./supabase";
import { Relatorio } from "../store/reportStore";

// Bypass SDK for maximum stability
// Modelo recomendado pelo usuário: gemini-2.0-flash
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const generateAIPdfReport = async (
  report: Relatorio, 
  profile: any, 
  obraName: string
): Promise<string | null> => {
  try {
    // 1. Polimento de Texto com Gemini via Conexão Direta (Fetch)
    const prompt = `
      Você é um engenheiro civil sênior especializado em auditoria e relatórios técnicos.
      Sua tarefa é transformar notas de campo em um texto editorial, profissional e elegante para um relatório fotográfico.
      
      Dados do Relatório:
      - Título: ${report.title}
      - Obra: ${obraName}
      - Empresa: ${profile?.company_name || 'SnapObra Engineering'}
      - Notas de Campo: ${report.notes || 'Registros de acompanhamento de rotina.'}
      - Clima: ${report.weather?.condition || 'Não informado'}
      - Efetivo: ${report.workforce ? `Supervisor: ${report.workforce.supervisor || 0}, Encarregado: ${report.workforce.encarregado || 0}, Profissional: ${report.workforce.profissional || 0}, Ajudante: ${report.workforce.ajudante || 0}` : 'Não informado'}
      
      Fotos e Legendas Originais:
      ${report.fotos?.map((f, i) => `Foto ${i+1}: ${f.caption || 'Sem legenda'}`).join('\n')}
      
      Instruções Finais:
      - Reescreva as legendas de forma técnica porém fluida.
      - Crie um parágrafo de introdução elegante.
      - Mantenha o tom profissional e focado em engenharia.
      - Retorne APENAS um JSON com o seguinte formato:
      {
        "introducao": "texto aqui",
        "fotos_polidas": ["legenda 1", "legenda 2", ...]
      }
    `;

    const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          // Removido responseMimeType para evitar erro 400 em certas versões da API
          temperature: 0.7,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 429) {
        throw new Error("Limite de uso da IA atingido. A cota gratuita do Google Gemini foi excedida. Por favor, aguarde o tempo indicado no console ou tente novamente mais tarde.");
      }
      throw new Error(`Gemini API Error (${response.status}): ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // Fallback caso o JSON venha envolto em markdown ```json
    let rawText = data.candidates[0].content.parts[0].text;
    rawText = rawText.replace(/```json\n?|```/g, '').trim();
    
    const aiContent = JSON.parse(rawText);

    // 2. Geração do PDF Editorial (Preservando Estética Premium)
    const doc = new jsPDF();
    const brandColor = profile?.brand_color || "#1B6B4A";
    
    // Header
    doc.setFillColor(brandColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(report.title.toUpperCase(), 20, 25);
    
    doc.setFontSize(10);
    doc.text(`OBRA: ${obraName.toUpperCase()}`, 20, 33);
    
    let yPos = 55;

    // Bloco Clima + Efetivo (lado a lado)
    const weatherLabel = report.weather?.condition || 'Não informado';
    const wf = report.workforce || { supervisor: 0, encarregado: 0, profissional: 0, ajudante: 0 };
    const totalEfetivo = (wf.supervisor || 0) + (wf.encarregado || 0) + (wf.profissional || 0) + (wf.ajudante || 0);

    // Background do bloco
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(15, yPos - 5, 180, 32, 3, 3, 'F');

    // Clima, Praticável e Efetivo (lado a lado)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('CLIMA', 22, yPos + 2);
    doc.text('PRATICÁVEL', 75, yPos + 2);
    doc.text('EFETIVO TOTAL', 135, yPos + 2);
    
    doc.setFontSize(11);
    doc.setTextColor(26, 32, 44);
    doc.text(weatherLabel.toUpperCase(), 22, yPos + 10);
    doc.text((report.weather?.praticavel || 'Sim').toUpperCase(), 75, yPos + 10);
    doc.text(totalEfetivo.toString(), 135, yPos + 10);

    // Separadores verticais
    doc.setDrawColor(203, 213, 225);
    doc.line(70, yPos - 2, 70, yPos + 24);
    doc.line(130, yPos - 2, 130, yPos + 24);

    // Detalhamento do Efetivo abaixo
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const efetivoLines = [];
    if (wf.supervisor > 0) efetivoLines.push(`Sup. Téc.: ${wf.supervisor}`);
    if (wf.encarregado > 0) efetivoLines.push(`Enc.: ${wf.encarregado}`);
    if (wf.profissional > 0) efetivoLines.push(`Prof.: ${wf.profissional}`);
    if (wf.ajudante > 0) efetivoLines.push(`Ajud.: ${wf.ajudante}`);
    doc.text(efetivoLines.join('  |  ') || 'Efetivo não detalhado', 22, yPos + 20);

    yPos += 45;

    yPos += 38;

    // Introduction
    doc.setTextColor(44, 62, 80);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const splitIntro = doc.splitTextToSize(aiContent.introducao, 170);
    doc.text(splitIntro, 20, yPos);
    
    yPos += (splitIntro.length * 5) + 10;

    // Renderizar Fotos
    if (report.fotos) {
      for (let i = 0; i < report.fotos.length; i++) {
        const foto = report.fotos[i];
        const caption = aiContent.fotos_polidas[i] || foto.caption || "";

        // Nova página se necessário antes da imagem
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        try {
          doc.addImage(foto.public_url, 'JPEG', 20, yPos, 170, 110, undefined, 'FAST');
          yPos += 115;
          
          doc.setFont("helvetica", "italic");
          doc.setFontSize(10);
          doc.setTextColor(127, 140, 141);
          const splitCaption = doc.splitTextToSize(caption, 170);
          doc.text(splitCaption, 20, yPos);
          
          yPos += (splitCaption.length * 5) + 15;
        } catch (e) {
          console.error("Erro ao adicionar imagem ao PDF IA:", e);
          yPos += 20;
        }
      }
    }

    // 3. Upload do PDF para o Supabase Storage
    const pdfBlob = doc.output('blob');
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    if (!userId) throw new Error("Usuário não autenticado");

    const filePath = `users/${userId}/obras/${report.obra_id}/relatorios/${report.id}_ai_editorial.pdf`;
    
    const { error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Atualizar registro no banco
    const { data: { publicUrl } } = supabase.storage.from('pdfs').getPublicUrl(filePath);
    
    const { error: updateError } = await supabase
      .from('relatorios')
      .update({ pdf_url: publicUrl })
      .eq('id', report.id);

    if (updateError) throw updateError;

    return publicUrl;

  } catch (error) {
    console.error("AI PDF Generation Error:", error);
    throw error;
  }
};
