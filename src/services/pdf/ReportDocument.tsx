// src/services/pdf/ReportDocument.tsx
import React from 'react'
import { Document, Page, View } from '@react-pdf/renderer'
import { DailyReport } from '../../types/report'
import { createStyles } from './pdfStyles'
import { 
  PageHeader, 
  PageFooter, 
  ObraInfo,
  WeatherWorkforceInfo,
  GeneralNotes, 
  ActivitiesTable, 
  PhotoGrid, 
  Signatures,
  SectionTitle
} from './pdfComponents'

interface Props {
  report: DailyReport
}

export const ReportDocument: React.FC<Props> = ({ report }) => {
  const styles = createStyles(report.company.primaryColor, report.company.secondaryColor || '#C97B2E')

  // Agrupar fotos em lotes de 6 para cada página (3 linhas de 2)
  const photoChunks: any[][] = []
  for (let i = 0; i < (report.photos || []).length; i += 6) {
    photoChunks.push(report.photos.slice(i, i + 6))
  }

  return (
    <Document title={report.reportNumber} author={report.company.name} creator="SnapObra Premium">
      
      {/* ─── PÁGINA 1: DADOS E ATIVIDADES ─────────────────────── */}
      <Page size="A4" style={styles.page}>
        <PageHeader styles={styles} report={report} />
        
        <View style={styles.body}>
          <ObraInfo styles={styles} report={report} />
          
          <WeatherWorkforceInfo styles={styles} report={report} />
          
          <GeneralNotes styles={styles} report={report} />
          
          <ActivitiesTable styles={styles} report={report} />
          
          {/* Caso tenha 2 fotos ou menos, elas saem na Pág 1 com a assinatura logo abaixo */}
          {report.photos.length <= 2 && report.photos.length > 0 && (
            <>
              <View style={styles.section}>
                <SectionTitle styles={styles} title="Registros Fotográficos" />
                <PhotoGrid styles={styles} photos={report.photos} />
              </View>
              <Signatures styles={styles} report={report} />
            </>
          )}

          {/* Se não tiver fotos nenhuma, a assinatura sai aqui também */}
          {report.photos.length === 0 && (
            <Signatures styles={styles} report={report} />
          )}
        </View>

        <PageFooter styles={styles} report={report} />
      </Page>

      {/* ─── PÁGINAS SEGUINTES: RELATÓRIO FOTOGRÁFICO ─────────── */}
      {report.photos.length > 2 && photoChunks.map((chunk, index) => {
        const isLastPage = index === photoChunks.length - 1;
        
        return (
          <Page key={index} size="A4" style={styles.page}>
            <PageHeader styles={styles} report={report} />
            
            <View style={styles.body}>
              <SectionTitle styles={styles} title={`Relatório Fotográfico — Parte ${index + 1}`} />
              <PhotoGrid styles={styles} photos={chunk} />
              
              {/* Se for a ÚLTIMA página de fotos, adicionamos a Assinatura ao final */}
              {isLastPage && (
                <View style={{ marginTop: 20 }}>
                  <Signatures styles={styles} report={report} />
                </View>
              )}
            </View>

            <PageFooter styles={styles} report={report} />
          </Page>
        );
      })}

    </Document>
  )
}
