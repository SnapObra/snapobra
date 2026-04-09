import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.0"
import { jsPDF } from "https://esm.sh/jspdf@2.5.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { reportId } = await req.json()
    
    // 1. Initialize Supabase Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Fetch Report Data
    const { data: report, error: reportError } = await supabaseClient
      .from('relatorios')
      .select(`
        *,
        obra:obras(*),
        fotos:fotos(*)
      `)
      .eq('id', reportId)
      .single()

    if (reportError || !report) throw new Error('Relatório não encontrado')

    // 3. Fetch Profile Data (for branding)
    const { data: profile } = await supabaseClient
      .from('profiles')
      .eq('id', report.user_id)
      .single()

    // 4. AI Polishing with Gemini
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') ?? '')
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `
      Você é um Engenheiro Civil Sênior e Editor de Revistas de Arquitetura. 
      Sua tarefa é reescrever os apontamentos de uma obra para um "Relatório de Progresso Editorial".
      
      Obra: ${report.obra.nome}
      Data do Relatório: ${new Date(report.data_relatorio).toLocaleDateString('pt-BR')}
      Setor/Atividade: ${report.setor || 'Geral'}
      Notas do Mestre de Obra: "${report.notas}"
      
      Regras:
      1. Use um tom profissional, elegante e inspirador.
      2. Foque na qualidade técnica e no progresso visual.
      3. Divida em dois parágrafos curtos: "Status Técnico" e "Visão de Progresso".
      4. Idioma: Português Brasileiro.
      
      RETORNE APENAS O TEXTO REESCRITO, SEM COMENTÁRIOS ADICIONAIS.
    `

    const result = await model.generateContent(prompt)
    const polishedText = result.response.text()

    // 5. Generate PDF with jsPDF
    const doc = new jsPDF()
    const margin = 20
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // -- Styling --
    const primaryColor = profile?.brand_color || '#1e293b'
    
    // Header
    doc.setFillColor(primaryColor)
    doc.rect(0, 0, pageWidth, 40, 'F')
    
    doc.setTextColor('#ffffff')
    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.text("Relatório de Obra", margin, 25)
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(report.obra.nome.toUpperCase(), margin, 35)

    // Body
    doc.setTextColor('#334155')
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Data:", margin, 55)
    doc.setFont("helvetica", "normal")
    doc.text(new Date(report.data_relatorio).toLocaleDateString('pt-BR'), margin + 15, 55)

    doc.setFont("helvetica", "bold")
    doc.text("Responsável:", margin, 65)
    doc.setFont("helvetica", "normal")
    doc.text(profile?.full_name || 'Engenheiro Responsável', margin + 30, 65)

    // AI Text Section
    doc.setDrawColor(primaryColor)
    doc.setLineWidth(0.5)
    doc.line(margin, 75, pageWidth - margin, 75)

    doc.setFont("helvetica", "italic")
    const splitText = doc.splitTextToSize(polishedText, pageWidth - (margin * 2))
    doc.text(splitText, margin, 85)

    // Add Photos (Real Image Implementation)
    let yPos = 110
    if (report.fotos && report.fotos.length > 0) {
      doc.setFont("helvetica", "bold")
      doc.text("Registros Fotográficos", margin, yPos)
      yPos += 10
      
      const imgWidth = 80
      const imgHeight = 60
      const gap = 10

      for (let i = 0; i < report.fotos.length; i++) {
        const foto = report.fotos[i]
        const xPos = margin + (i % 2) * (imgWidth + gap)
        
        try {
          // Fetch image and convert to Base64/TypedArray for jsPDF
          const imgResp = await fetch(foto.url)
          const imgBlob = await imgResp.blob()
          const imgArrayBuffer = await imgBlob.arrayBuffer()
          const imgUint8 = new Uint8Array(imgArrayBuffer)
          
          doc.addImage(imgUint8, 'JPEG', xPos, yPos, imgWidth, imgHeight)
          
          doc.setFontSize(8)
          doc.setFont("helvetica", "italic")
          doc.text(foto.legenda || `Foto ${i + 1}`, xPos, yPos + imgHeight + 5)
        } catch (e) {
          console.error(`Erro ao carregar foto ${i}:`, e)
          doc.rect(xPos, yPos, imgWidth, imgHeight)
          doc.text("Erro ao carregar imagem", xPos + 5, yPos + 10)
        }

        if (i % 2 === 1) yPos += imgHeight + 20
        if (yPos > 240 && i < report.fotos.length - 1) {
          doc.addPage()
          yPos = 30
        }
      }
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor('#94a3b8')
      doc.text(`SnapObra - Relatórios Inteligentes | Página ${i} de ${pageCount}`, pageWidth / 2, 285, { align: 'center' })
    }

    const pdfOutput = doc.output('arraybuffer')

    // 6. Upload to Storage
    const fileName = `pdfs/${reportId}_${Date.now()}.pdf`
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('fotos-obras')
      .upload(fileName, pdfOutput, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabaseClient
      .storage
      .from('fotos-obras')
      .getPublicUrl(fileName)

    // 7. Update Database
    await supabaseClient
      .from('relatorios')
      .update({ 
        pdf_url: publicUrl,
        last_generated_at: new Date().toISOString()
      })
      .eq('id', reportId)

    return new Response(
      JSON.stringify({ url: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
