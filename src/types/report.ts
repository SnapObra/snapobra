// src/types/report.ts

export interface Company {
  name: string                    // "Construtora Mendonça & Filhos"
  logoUrl?: string                // URL da imagem no Supabase Storage
  primaryColor: string            // hex: "#1B6B4A" — cor principal da construtora
  secondaryColor?: string         // hex: "#C97B2E" — cor de destaque
  cnpj?: string                   // "12.345.678/0001-90"
  inscricao_estadual?: string
  inscricao_municipal?: string
  crea?: string
  phone?: string                  // "(83) 99999-9999"
  email?: string                  // "contato@construtora.com.br"
  address?: string                // "Av. Epitácio Pessoa, 1500 — João Pessoa/PB"
}

export interface Obra {
  id: string
  name: string                    // "Residencial Alphaville — Bloco A"
  address: string                 // "Rua das Acácias, 120 — Intermares, Cabedelo/PB"
  client: string                  // "Sr. Roberto Alves"
  contract_number?: string        // "CT-2024-0042"
  startDate: string               // ISO date
  expectedEndDate?: string        // ISO date
  totalArea?: number              // m² — 2400
  currentStage: string            // "Estrutura — 3° Pavimento"
  progressPercent: number         // 0–100
}

export interface PhotoEntry {
  url: string                     // URL pública no Supabase Storage
  caption?: string                // "Concretagem da laje — setor B"
  area_setor?: string             // "Fundação", "Alvenaria", etc.
  location?: string               // "3° Pavimento — eixo C"
  takenAt?: string                // ISO datetime
}

export interface WeatherData {
  condition: 'ensolarado' | 'nublado' | 'chuvoso' | 'parcialmente_nublado'
  temperature?: number            // graus Celsius
  humidity?: number               // porcentagem
  wind?: string                   // "Vento leve NE"
  observation?: string            // "Chuva leve no período da tarde"
  praticavel?: string             // "Sim" | "Não"
}

export interface WorkforceEntry {
  role: string                    // "Pedreiro", "Ajudante", "Armador"
  count: number                   // quantidade de trabalhadores
}

export interface EquipmentEntry {
  name: string                    // "Betoneira 400L", "Andaime metálico"
  quantity: number
  status: 'operando' | 'parado' | 'manutenção'
}

export interface MaterialEntry {
  name: string                    // "Cimento CP-II 50kg"
  quantity: string                // "40 sacos"
  supplier?: string               // "Votorantim"
}

export interface ActivityEntry {
  area: string                    // "Estrutura", "Alvenaria", "Instalações"
  description: string             // "Concretagem da laje do 3° pavimento, setor A e B"
  status: 'concluído' | 'em_andamento' | 'iniciado' | 'pendente'
  percentComplete?: number        // 0–100
}

export interface OccurrenceEntry {
  type: 'acidente' | 'incidente' | 'não_conformidade' | 'observação' | 'paralisação'
  severity: 'baixa' | 'média' | 'alta'
  description: string
  action?: string                 // ação tomada
}

export interface ReportSignature {
  name: string                    // "José Ferreira da Silva"
  role: string                    // "Mestre de Obras"
  signatureDataUrl?: string       // base64 da assinatura desenhada
  registrationNumber?: string     // CREA/CAU se engenheiro
}

export interface DailyReport {
  id: string
  reportNumber: string            // "RDO-2026-0142"
  title?: string                  // "Laudo de Vistoria Técnica"
  date: string                    // ISO date — data do relatório
  generatedAt: string             // ISO datetime — quando foi gerado
  obra: Obra
  company: Company
  weather: WeatherData
  workforce: WorkforceEntry[]
  equipment: EquipmentEntry[]
  materials: MaterialEntry[]
  activities: ActivityEntry[]
  photos: PhotoEntry[]
  occurrences: OccurrenceEntry[]
  generalNotes?: string           // observações gerais do mestre
  nextDayPlan?: string            // planejamento do dia seguinte
  aiGeneratedSummary?: string     // texto gerado pela IA (parágrafo executivo)
  signatures: ReportSignature[]
}
