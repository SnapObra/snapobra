// src/services/pdf/pdfComponents.tsx
import React from 'react'
import { View, Text, Image } from '@react-pdf/renderer'
import { DailyReport, ActivityEntry, PhotoEntry, ReportSignature } from '../../types/report'

interface ComponentProps {
  styles: any
  report: DailyReport
}

// ─── CABEÇALHO DA PÁGINA ─────────────────────────────────────
export const PageHeader: React.FC<ComponentProps> = ({ styles, report }) => (
  <View fixed>
    <View style={styles.pageHeader}>
      <View style={styles.headerLeft}>
        <Text style={styles.companyName}>{report.company.name}</Text>
        <Text style={styles.companyTagline}>GESTÃO DE OBRAS E RELATÓRIOS TÉCNICOS</Text>
        
        <View style={{ marginTop: 4 }}>
          {/* Linha Fiscais/Registro */}
          <Text style={styles.companyDetails}>
            {[
              report.company.cnpj && `CNPJ: ${report.company.cnpj}`,
              report.company.crea && `CREA: ${report.company.crea}`,
              report.company.inscricao_estadual && `IE: ${report.company.inscricao_estadual}`,
              report.company.inscricao_municipal && `IM: ${report.company.inscricao_municipal}`,
            ].filter(Boolean).join('  |  ')}
          </Text>

          {/* Linha Contato */}
          <Text style={styles.companyDetails}>
            {[
              report.company.address && report.company.address,
              report.company.phone && `WhatsApp: ${report.company.phone}`,
              report.company.email && `E-mail: ${report.company.email}`,
            ].filter(Boolean).join('  •  ')}
          </Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.reportTitle}>{report.title || 'Relatório Diário de Obra'}</Text>
        <Text style={styles.reportNumber}>{report.reportNumber}</Text>
        <Text style={styles.reportDate}>{new Date(report.date + 'T12:00:00').toLocaleDateString('pt-BR')}</Text>
      </View>
    </View>
    <View style={styles.headerAccent} />
  </View>
)

// ─── TÍTULO DE SEÇÃO ─────────────────────────────────────────
export const SectionTitle: React.FC<{ styles: any; title: string }> = ({ styles, title }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionAccentBar} />
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
)

// ─── INFO DA OBRA ─────────────────────────────────────────────
export const ObraInfo: React.FC<ComponentProps> = ({ styles, report }) => (
  <View style={styles.section}>
    <SectionTitle styles={styles} title="Identificação da Obra" />
    <View style={styles.obraInfoGrid}>
      <View style={styles.obraInfoCard}>
        <Text style={styles.obraInfoLabel}>Obra / Projeto</Text>
        <Text style={styles.obraInfoValue}>{report.obra.name}</Text>
        <Text style={styles.obraInfoValueSecondary}>{report.obra.address}</Text>
      </View>
      <View style={styles.obraInfoCard}>
        <Text style={styles.obraInfoLabel}>Cliente / Contratante</Text>
        <Text style={styles.obraInfoValue}>{report.obra.client}</Text>
        {report.obra.contract_number && (
          <Text style={styles.obraInfoValueSecondary}>Contrato: {report.obra.contract_number}</Text>
        )}
      </View>
    </View>
  </View>
)

// ─── CLIMA E EFETIVO ──────────────────────────────────────────
export const WeatherWorkforceInfo: React.FC<ComponentProps> = ({ styles, report }) => {
  const weatherLabel = report.weather?.condition === 'ensolarado' ? 'Claro' 
    : report.weather?.condition === 'nublado' ? 'Nublado'
    : report.weather?.condition === 'chuvoso' ? 'Chuvoso'
    : report.weather?.observation || 'Nao informado';
  
  const totalWorkers = report.workforce.reduce((sum, w) => sum + w.count, 0);

  return (
    <View style={styles.section}>
      <SectionTitle styles={styles} title="Condições do Dia" />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {/* Clima */}
        <View style={[styles.obraInfoCard, { flex: 1 }]}>
          <Text style={styles.obraInfoLabel}>Clima</Text>
          <Text style={styles.obraInfoValue}>{weatherLabel}</Text>
        </View>
        {/* Praticável */}
        <View style={[styles.obraInfoCard, { flex: 1 }]}>
          <Text style={styles.obraInfoLabel}>Praticável</Text>
          <Text style={styles.obraInfoValue}>
            {report.weather?.praticavel || 'Sim'}
          </Text>
        </View>
        {/* Efetivo Total */}
        <View style={[styles.obraInfoCard, { flex: 1 }]}>
          <Text style={styles.obraInfoLabel}>Efetivo Total</Text>
          <Text style={[styles.obraInfoValue, { fontSize: 14 }]}>{totalWorkers}</Text>
        </View>
      </View>
      {/* Detalhamento do Efetivo */}
      {report.workforce.length > 0 && (
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
          {report.workforce.map((w, i) => (
            <View key={i} style={[styles.obraInfoCard, { flex: 1, paddingVertical: 4, paddingHorizontal: 6 }]}>
              <Text style={[styles.obraInfoLabel, { fontSize: 6 }]}>{w.role}</Text>
              <Text style={[styles.obraInfoValue, { fontSize: 11, textAlign: 'center' as any }]}>{w.count}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── NOTAS GERAIS (Substituto da IA) ──────────────────────────
export const GeneralNotes: React.FC<ComponentProps> = ({ styles, report }) => (
  <View style={styles.section}>
    <SectionTitle styles={styles} title="Resumo das Atividades e Observações" />
    <View style={styles.executiveSummaryBox}>
      <View style={styles.executiveSummaryBadge}>
        <View style={styles.executiveSummaryBadgeDot} />
        <Text style={styles.executiveSummaryBadgeText}>Relato do Responsável</Text>
      </View>
      <Text style={styles.executiveSummaryText}>
        {report.generalNotes || 'Nenhuma observação geral registrada para este período.'}
      </Text>
    </View>
  </View>
)

// ─── TABELA DE ATIVIDADES ────────────────────────────────────
export const ActivitiesTable: React.FC<ComponentProps> = ({ styles, report }) => (
  <View style={styles.section}>
    <SectionTitle styles={styles} title="Atividades Realizadas" />
    <View style={styles.tableHeader}>
      <View style={{ flex: 1.5 }}><Text style={styles.tableHeaderCell}>Área / Setor</Text></View>
      <View style={{ flex: 3 }}><Text style={styles.tableHeaderCell}>Descrição da Atividade</Text></View>
      <View style={{ flex: 1 }}><Text style={styles.tableHeaderCell}>Status</Text></View>
    </View>
    {report.activities.map((act: ActivityEntry, i: number) => (
      <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
        <View style={{ flex: 1.5 }}><Text style={styles.tableCell}>{act.area}</Text></View>
        <View style={{ flex: 3 }}><Text style={styles.tableCell}>{act.description}</Text></View>
        <View style={{ flex: 1 }}>
          <View style={act.status === 'concluído' ? styles.badgeConcluido : styles.badgeAndamento}>
            <Text style={act.status === 'concluído' ? styles.badgeConcluidoText : styles.badgeAndamentoText}>
              {act.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>
    ))}
  </View>
)

// ─── GRID DE FOTOS ───────────────────────────────────────────
export const PhotoGrid: React.FC<{ styles: any; photos: PhotoEntry[] }> = ({ styles, photos }) => (
  <View style={styles.photoGrid}>
    {photos.map((photo, i) => (
      <View key={i} style={styles.photoCard} wrap={false}>
        <Image src={photo.url} style={styles.photoImage} />
        <Text style={styles.photoCaption}>{photo.caption || 'Sem legenda'}</Text>
      </View>
    ))}
  </View>
)

// ─── ASSINATURAS ──────────────────────────────────────────────
export const Signatures: React.FC<ComponentProps> = ({ styles, report }) => (
  <View style={styles.section} wrap={false}>
    <SectionTitle styles={styles} title="Responsabilidade Técnica" />
    <View style={styles.signaturesGrid}>
      {report.signatures.map((sig: ReportSignature, i: number) => (
        <View key={i} style={styles.signatureCard}>
          <Text style={styles.signatureName}>{sig.name}</Text>
          <Text style={styles.signatureRole}>{sig.role}</Text>
          {sig.registrationNumber && <Text style={styles.signatureRegistration}>{sig.registrationNumber}</Text>}
        </View>
      ))}
    </View>
  </View>
)

// ─── RODAPÉ ──────────────────────────────────────────────────
export const PageFooter: React.FC<ComponentProps> = ({ styles, report }) => (
  <View style={styles.pageFooter} fixed>
    <View style={styles.footerLeft}>
      <Text style={styles.footerText}>Relatório gerado em {new Date(report.generatedAt).toLocaleString('pt-BR')}</Text>
      <Text style={styles.footerBrand}>Powered by SnapObra</Text>
    </View>
    <Text style={styles.footerPage} render={({ pageNumber, totalPages }) => (
      `Página ${pageNumber} de ${totalPages}`
    )} />
  </View>
)
