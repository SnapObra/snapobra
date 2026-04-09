import React from 'react'
import { Document, Page, View, Text } from '@react-pdf/renderer'
import { Vistoria } from '../../store/vistoriaStore'
import { createStyles } from './pdfStyles'
import { PageHeader, PageFooter, SectionTitle, PhotoGrid } from './pdfComponents'

interface Props {
  vistoria: Vistoria
  company: any // Profile data
}

export const VistoriaDocument: React.FC<Props> = ({ vistoria, company }) => {
  const styles = createStyles(company.primaryColor || '#4318FF', company.secondaryColor || '#7018FF')

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ok': return 'OK';
      case 'ajustar': return 'AJUSTAR';
      case 'critico': return 'CRÍTICO';
      default: return 'N/A';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return '#10B981'; // Green
      case 'ajustar': return '#F59E0B'; // Yellow
      case 'critico': return '#EF4444'; // Red
      default: return '#94A3B8';
    }
  };

  const pendencias: any[] = [];
  if (vistoria.checklist_data) {
    Object.entries(vistoria.checklist_data).forEach(([cat, items]: [string, any]) => {
      Object.entries(items).forEach(([item, data]: [string, any]) => {
        if (data.status === 'ajustar' || data.status === 'critico') {
          pendencias.push({ cat, item, desc: data.description });
        }
      });
    });
  }

  // Header compatible bridge for PageHeader component
  const reportBridge = {
    reportNumber: vistoria.vt_number,
    date: vistoria.data_vistoria,
    title: 'LAUDO DE VISTORIA TÉCNICA',
    generatedAt: new Date().toISOString(),
    company: {
      name: company.company_name || company.full_name,
      logoUrl: company.logo_url,
      document: company.document,
      email: company.email,
      phone: company.phone
    },
    photos: (vistoria.fotos || []).map(f => ({
      url: f.public_url,
      caption: f.caption
    }))
  };

  return (
    <Document title={vistoria.vt_number} author={company.full_name}>
      <Page size="A4" style={styles.page}>
        <PageHeader styles={styles} report={reportBridge as any} />
        
        <View style={styles.body}>
          {/* 1. IDENTIFICAÇÃO */}
          <SectionTitle styles={styles} title="1. Identificação do Imóvel" />
          <View style={styles.obraInfoGrid}>
            <View style={styles.obraInfoCard} wrap={false}>
              <Text style={styles.obraInfoLabel}>Empreendimento</Text>
              <Text style={styles.obraInfoValue}>{vistoria.empreendimento_nome || '---'}</Text>
              <Text style={styles.obraInfoLabel}>Unidade</Text>
              <Text style={styles.obraInfoValue}>{vistoria.unidade || '---'}</Text>
            </View>
            <View style={styles.obraInfoCard} wrap={false}>
              <Text style={styles.obraInfoLabel}>Proprietário / Cliente</Text>
              <Text style={styles.obraInfoValue}>{vistoria.proprietario || '---'}</Text>
              <Text style={styles.obraInfoLabel}>Data da Vistoria</Text>
              <Text style={styles.obraInfoValue}>{new Date(vistoria.data_vistoria + 'T12:00:00').toLocaleDateString('pt-BR')}</Text>
            </View>
          </View>

          <View style={[styles.obraInfoGrid, { marginTop: 10 }]}>
            <View style={[styles.obraInfoCard, { borderLeftColor: '#6366F1' }]} wrap={false}>
              <Text style={styles.obraInfoLabel}>Responsável Técnico</Text>
              <Text style={styles.obraInfoValue}>{vistoria.responsavel_tecnico || '---'}</Text>
            </View>
            <View style={[styles.obraInfoCard, { borderLeftColor: '#6366F1' }]} wrap={false}>
              <Text style={styles.obraInfoLabel}>Registro Profissional (CREA/CAU)</Text>
              <Text style={styles.obraInfoValue}>{vistoria.crea_cau || '---'}</Text>
            </View>
          </View>

          {/* CHECKLIST SECTIONS */}
          {vistoria.checklist_data && Object.entries(vistoria.checklist_data).map(([catTitle, items]: [string, any], idx) => (
            <View key={idx} style={{ marginTop: 20 }}>
               <SectionTitle styles={styles} title={catTitle} />
               <View style={{ marginTop: 5 }}>
                  {Object.entries(items).map(([itemText, data]: [string, any], itemIdx) => (
                    <View key={itemIdx} style={[styles.tableRow, itemIdx % 2 === 0 ? {} : styles.tableRowAlt]} wrap={false}>
                       <View style={{ flex: 1 }}>
                          <Text style={styles.tableCell}>{itemText}</Text>
                          {data.description && (
                            <Text style={[styles.tableCellMuted, { marginTop: 2, fontStyle: 'italic' }]}>Obs: {data.description}</Text>
                          )}
                       </View>
                       <View style={{ width: 80, alignItems: 'flex-end' }}>
                          <Text style={[styles.tableCell, { color: getStatusColor(data.status), fontFamily: 'Helvetica-Bold' }]}>
                             {getStatusText(data.status)}
                          </Text>
                       </View>
                    </View>
                  ))}
               </View>
            </View>
          ))}

          {/* 11. RESUMO DE PENDÊNCIAS */}
          <View style={{ marginTop: 20 }}>
            <SectionTitle styles={styles} title="11. Resumo de Pendências" />
            {pendencias.length === 0 ? (
              <View style={styles.executiveSummaryBox} wrap={false}>
                 <Text style={styles.executiveSummaryText}>Nenhuma pendência ou inconformidade foi observada durante a vistoria.</Text>
              </View>
            ) : (
              <View style={{ marginTop: 10 }}>
                 {pendencias.map((p, idx) => (
                    <View key={idx} style={[styles.occurrenceCard, p.status === 'critico' ? styles.occurrenceCardHigh : styles.occurrenceCardMid]} wrap={false}>
                       <Text style={styles.occurrenceType}>{p.item}</Text>
                       <Text style={styles.occurrenceDesc}>{p.desc || 'Sem descrição detalhada.'}</Text>
                    </View>
                 ))}
              </View>
            )}
          </View>

          {/* PHOTO SECTION */}
          {reportBridge.photos.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <SectionTitle styles={styles} title="Relatório Fotográfico" />
              <PhotoGrid styles={styles} photos={reportBridge.photos} />
            </View>
          )}

          {/* FINAL SECTION: CONCLUSION & SIGNATURES */}
          <View style={{ marginTop: 20 }} wrap={false}>
            <SectionTitle styles={styles} title="Conclusão do Laudo" />
            <View style={[styles.progressContainer, { borderLeftWidth: 4, borderLeftColor: vistoria.conclusao === 'aprovado_sem_ressalvas' ? '#10B981' : vistoria.conclusao === 'reprovado' ? '#EF4444' : '#F59E0B' }]}>
              <Text style={[styles.progressPercent, { fontSize: 14 }]}>
                {vistoria.conclusao === 'aprovado_sem_ressalvas' ? 'IMÓVEL APROVADO SEM RESSALVAS' : 
                 vistoria.conclusao === 'reprovado' ? 'IMÓVEL REPROVADO / AGUARDANDO RETESTE' : 
                 'IMÓVEL APROVADO COM PENDÊNCIAS'}
              </Text>
              <Text style={[styles.progressStage, { marginTop: 8 }]}>
                Declaramos que a vistoria foi realizada nas condições acima descritas, servindo este laudo como registro oficial da entrega/inspeção técnica da unidade.
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 60 }} wrap={false}>
            <View style={styles.signaturesGrid}>
              <View style={styles.signatureCard}>
                <Text style={styles.signatureName}>{vistoria.responsavel_tecnico || 'RESPONSÁVEL TÉCNICO'}</Text>
                <Text style={styles.signatureRole}>SnapObra / Engenharia</Text>
                <Text style={styles.signatureRegistration}>{vistoria.crea_cau || 'CREA/CAU'}</Text>
              </View>
              <View style={styles.signatureCard}>
                 <Text style={styles.signatureName}>{vistoria.proprietario || 'CLIENTE / PROPRIETÁRIO'}</Text>
                 <Text style={styles.signatureRole}>Recebedor da Unidade</Text>
              </View>
            </View>
          </View>
        </View>
        <PageFooter styles={styles} report={reportBridge as any} />
      </Page>
    </Document>
  );
}
