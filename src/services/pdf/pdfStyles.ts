// src/services/pdf/pdfStyles.ts
import { StyleSheet } from '@react-pdf/renderer'

export function createStyles(primaryColor: string, secondaryColor: string) {
  return StyleSheet.create({

    // ─── PÁGINA ──────────────────────────────────────────────
    page: {
      fontFamily: 'Helvetica',
      backgroundColor: '#FFFFFF',
      paddingTop: 0,
      paddingBottom: 40,
      paddingLeft: 0,
      paddingRight: 0,
    },

    // ─── HEADER DA PÁGINA ─────────────────────────────────────
    pageHeader: {
      backgroundColor: primaryColor,
      paddingTop: 28,
      paddingBottom: 22,
      paddingLeft: 40,
      paddingRight: 40,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLeft: {
      flexDirection: 'column',
      gap: 4,
    },
    companyName: {
      fontSize: 16,
      fontFamily: 'Helvetica-Bold',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },
    companyTagline: {
      fontSize: 9,
      color: 'rgba(255,255,255,0.75)',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    companyDetails: {
      fontSize: 8,
      color: 'rgba(255,255,255,0.85)',
      letterSpacing: 0.2,
      lineHeight: 1.4,
    },
    headerRight: {
      alignItems: 'flex-end',
      gap: 3,
    },
    reportTitle: {
      fontSize: 11,
      fontFamily: 'Helvetica-Bold',
      color: '#FFFFFF',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    reportNumber: {
      fontSize: 9,
      color: 'rgba(255,255,255,0.8)',
      fontFamily: 'Helvetica',
    },
    reportDate: {
      fontSize: 9,
      color: 'rgba(255,255,255,0.8)',
    },

    // ─── FAIXA DECORATIVA ABAIXO DO HEADER ──────────────────
    headerAccent: {
      height: 4,
      backgroundColor: secondaryColor,
    },

    // ─── CONTAINER PRINCIPAL ────────────────────────────────
    body: {
      paddingTop: 24,
      paddingLeft: 40,
      paddingRight: 40,
    },

    // ─── SEÇÃO GENÉRICA ──────────────────────────────────────
    section: {
      marginBottom: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      gap: 8,
    },
    sectionAccentBar: {
      width: 3,
      height: 14,
      backgroundColor: primaryColor,
      borderRadius: 2,
    },
    sectionTitle: {
      fontSize: 10,
      fontFamily: 'Helvetica-Bold',
      color: '#1A1916',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    sectionDivider: {
      height: 0.5,
      backgroundColor: '#E0DDD6',
      marginBottom: 12,
    },

    // ─── BLOCO DE INFORMAÇÕES DA OBRA ───────────────────────
    obraInfoGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 0,
    },
    obraInfoCard: {
      flex: 1,
      backgroundColor: '#F7F6F3',
      borderRadius: 6,
      padding: 12,
      borderLeftWidth: 3,
      borderLeftColor: primaryColor,
    },
    obraInfoLabel: {
      fontSize: 7.5,
      color: '#9A9890',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      marginBottom: 3,
      fontFamily: 'Helvetica',
    },
    obraInfoValue: {
      fontSize: 10,
      fontFamily: 'Helvetica-Bold',
      color: '#1A1916',
    },
    obraInfoValueSecondary: {
      fontSize: 9,
      color: '#6B6860',
      marginTop: 1,
    },

    // ─── PROGRESSO DA OBRA ────────────────────────────────────
    progressContainer: {
      backgroundColor: '#F7F6F3',
      borderRadius: 8,
      padding: 14,
      marginBottom: 20,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    progressLabel: {
      fontSize: 9,
      color: '#6B6860',
    },
    progressPercent: {
      fontSize: 20,
      fontFamily: 'Helvetica-Bold',
      color: primaryColor,
    },
    progressBarBg: {
      height: 8,
      backgroundColor: '#E0DDD6',
      borderRadius: 4,
    },
    progressBarFill: {
      height: 8,
      backgroundColor: primaryColor,
      borderRadius: 4,
    },
    progressStage: {
      fontSize: 8.5,
      color: '#6B6860',
      marginTop: 6,
    },

    // ─── RESUMO EXECUTIVO (Notas) ────────────────────────────────
    executiveSummaryBox: {
      backgroundColor: '#F0F7F3',
      borderRadius: 8,
      padding: 16,
      borderWidth: 1,
      borderColor: '#A3D4BC',
      marginBottom: 20,
    },
    executiveSummaryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 5,
    },
    executiveSummaryBadgeDot: {
      width: 5,
      height: 5,
      backgroundColor: primaryColor,
      borderRadius: 3,
    },
    executiveSummaryBadgeText: {
      fontSize: 7.5,
      fontFamily: 'Helvetica-Bold',
      color: primaryColor,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    executiveSummaryText: {
      fontSize: 9.5,
      color: '#2C2C2A',
      lineHeight: 1.65,
      fontFamily: 'Helvetica',
    },

    // ─── CLIMA ────────────────────────────────────────────────
    weatherGrid: {
      flexDirection: 'row',
      gap: 8,
    },
    weatherCard: {
      flex: 1,
      backgroundColor: '#F7F6F3',
      borderRadius: 6,
      padding: 10,
      alignItems: 'center',
    },
    weatherIcon: {
      fontSize: 18,
      marginBottom: 4,
    },
    weatherLabel: {
      fontSize: 7.5,
      color: '#9A9890',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      marginBottom: 2,
    },
    weatherValue: {
      fontSize: 11,
      fontFamily: 'Helvetica-Bold',
      color: '#1A1916',
    },
    weatherObs: {
      fontSize: 8,
      color: '#6B6860',
      marginTop: 6,
      fontStyle: 'italic',
    },

    // ─── TABELA DE ATIVIDADES ────────────────────────────────
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: primaryColor,
      borderRadius: 5,
      paddingVertical: 7,
      paddingHorizontal: 10,
      marginBottom: 1,
    },
    tableHeaderCell: {
      fontSize: 7.5,
      fontFamily: 'Helvetica-Bold',
      color: '#FFFFFF',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 7,
      paddingHorizontal: 10,
      borderBottomWidth: 0.5,
      borderBottomColor: '#E0DDD6',
    },
    tableRowAlt: {
      backgroundColor: '#FAFAF8',
    },
    tableCell: {
      fontSize: 9,
      color: '#2C2C2A',
    },
    tableCellMuted: {
      fontSize: 8.5,
      color: '#6B6860',
    },

    // ─── STATUS BADGES ───────────────────────────────────────
    badgeConcluido: {
      backgroundColor: '#E8F5EF',
      borderRadius: 10,
      paddingHorizontal: 7,
      paddingVertical: 2,
      alignSelf: 'flex-start',
    },
    badgeConcluidoText: {
      fontSize: 7.5,
      color: '#0F6E56',
      fontFamily: 'Helvetica-Bold',
    },
    badgeAndamento: {
      backgroundColor: '#FDF3E7',
      borderRadius: 10,
      paddingHorizontal: 7,
      paddingVertical: 2,
      alignSelf: 'flex-start',
    },
    badgeAndamentoText: {
      fontSize: 7.5,
      color: '#854F0B',
      fontFamily: 'Helvetica-Bold',
    },
    badgePendente: {
      backgroundColor: '#FCEBEB',
      borderRadius: 10,
      paddingHorizontal: 7,
      paddingVertical: 2,
      alignSelf: 'flex-start',
    },
    badgePendenteText: {
      fontSize: 7.5,
      color: '#A32D2D',
      fontFamily: 'Helvetica-Bold',
    },

    // ─── TABELA MÃO DE OBRA + EQUIPAMENTOS ──────────────────
    twoColGrid: {
      flexDirection: 'row',
      gap: 16,
    },
    twoColLeft: {
      flex: 1,
    },
    twoColRight: {
      flex: 1,
    },

    // ─── GRID DE FOTOS ────────────────────────────────────────
    photoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    photoCard: {
      width: '48%',
      borderRadius: 6,
      overflow: 'hidden',
      backgroundColor: '#F7F6F3',
      marginBottom: 5,
    },
    photoImage: {
      width: '100%',
      height: 180,
      objectFit: 'cover',
    },
    photoCaption: {
      padding: 6,
      fontSize: 7.5,
      color: '#6B6860',
      lineHeight: 1.4,
    },
    photoLocation: {
      paddingHorizontal: 6,
      paddingBottom: 6,
      fontSize: 7,
      color: '#9A9890',
    },

    // ─── OCORRÊNCIAS ──────────────────────────────────────────
    occurrenceCard: {
      borderRadius: 6,
      padding: 12,
      marginBottom: 8,
      borderLeftWidth: 3,
    },
    occurrenceCardHigh: {
      backgroundColor: '#FFF5F5',
      borderLeftColor: '#C0392B',
    },
    occurrenceCardMid: {
      backgroundColor: '#FFFBF0',
      borderLeftColor: '#C97B2E',
    },
    occurrenceCardLow: {
      backgroundColor: '#F7F6F3',
      borderLeftColor: '#888780',
    },
    occurrenceType: {
      fontSize: 7.5,
      fontFamily: 'Helvetica-Bold',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      marginBottom: 3,
    },
    occurrenceDesc: {
      fontSize: 9,
      color: '#2C2C2A',
      lineHeight: 1.5,
    },
    occurrenceAction: {
      fontSize: 8.5,
      color: '#6B6860',
      marginTop: 4,
      fontStyle: 'italic',
    },

    // ─── NOTAS / PLANEJAMENTO ────────────────────────────────
    notesBox: {
      backgroundColor: '#F7F6F3',
      borderRadius: 6,
      padding: 12,
    },
    notesText: {
      fontSize: 9.5,
      color: '#2C2C2A',
      lineHeight: 1.6,
    },

    // ─── BLOCO DE ASSINATURAS ────────────────────────────────
    signaturesGrid: {
      flexDirection: 'row',
      gap: 16,
      marginTop: 8,
    },
    signatureCard: {
      flex: 1,
      borderTopWidth: 1,
      borderTopColor: '#1A1916',
      paddingTop: 8,
      alignItems: 'center',
    },
    signatureName: {
      fontSize: 9.5,
      fontFamily: 'Helvetica-Bold',
      color: '#1A1916',
      marginBottom: 2,
    },
    signatureRole: {
      fontSize: 8.5,
      color: '#6B6860',
    },
    signatureRegistration: {
      fontSize: 8,
      color: '#9A9890',
      marginTop: 2,
    },
    signatureImage: {
      width: 120,
      height: 40,
      marginBottom: 6,
      objectFit: 'contain',
    },

    // ─── RODAPÉ DA PÁGINA ────────────────────────────────────
    pageFooter: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingVertical: 12,
      borderTopWidth: 0.5,
      borderTopColor: '#E0DDD6',
    },
    footerLeft: {
      flexDirection: 'column',
      gap: 2,
    },
    footerText: {
      fontSize: 7.5,
      color: '#9A9890',
    },
    footerBrand: {
      fontSize: 7.5,
      color: '#9A9890',
    },
    footerPage: {
      fontSize: 8,
      color: '#6B6860',
      fontFamily: 'Helvetica-Bold',
    },

    // ─── SEPARADOR DE SEÇÃO DECORATIVO ──────────────────────
    sectionSeparator: {
      height: 1,
      backgroundColor: '#F0EDE8',
      marginVertical: 16,
    },

    // ─── MINI KPI CARDS (topo do relatório) ─────────────────
    kpiGrid: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 20,
    },
    kpiCard: {
      flex: 1,
      backgroundColor: '#F7F6F3',
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    kpiValue: {
      fontSize: 18,
      fontFamily: 'Helvetica-Bold',
      color: primaryColor,
      marginBottom: 3,
    },
    kpiLabel: {
      fontSize: 7.5,
      color: '#9A9890',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      textAlign: 'center',
    },

  })
}
