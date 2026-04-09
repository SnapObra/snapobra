import { Relatorio, Foto } from '../../store/reportStore';
import { Profile } from '../../store/profileStore';
import { Obra } from '../../store/obraStore';
import { DailyReport, PhotoEntry } from '../../types/report';

/**
 * Mapeia os dados simples do SnapObra para o formato rico do RDO Premium.
 * Como o banco atual não possui campos como 'clima' ou 'equipe',
 * usamos dados do relatório (notas) e valores padrão inteligentes.
 */
export const mapToDailyReport = (
  report: Relatorio,
  profile: Profile,
  obra: Obra
): DailyReport => {
  // Mapear fotos
  const photos: PhotoEntry[] = (report.fotos || []).map((f: Foto) => ({
    url: f.public_url,
    caption: f.caption,
    area_setor: f.area_setor || 'Geral',
    location: '', 
    takenAt: f.created_at
  }));

  const reportDate = new Date(report.date);
  const reportNumber = report.rdo_number || `RDO-${reportDate.getFullYear()}-${String(report.id).slice(-4).toUpperCase()}`;

  return {
    id: report.id,
    reportNumber,
    date: report.date,
    generatedAt: new Date().toISOString(),
    
    company: {
      name: profile.company_name || 'Sua Empresa',
      logoUrl: profile.company_logo_url || undefined,
      primaryColor: profile.brand_color || '#64748B',
      secondaryColor: profile.brand_color ? '#C97B2E' : '#94A3B8', // Destaque padrão ou cinza suave
      cnpj: profile.cnpj || undefined,
      inscricao_estadual: profile.inscricao_estadual || undefined,
      inscricao_municipal: profile.inscricao_municipal || undefined,
      crea: profile.company_crea || undefined, // Adicionando CREA da empresa se existir
      email: profile.email || undefined,
      phone: profile.whatsapp || undefined,
      address: `${profile.logradouro || ''}, ${profile.numero || ''} - ${profile.cidade || ''}/${profile.estado || ''}`.replace(/^, , - \//, '')
    },

    obra: {
      id: obra.id,
      name: obra.name,
      address: `${obra.logradouro || ''}, ${obra.numero || ''} - ${obra.cidade || ''}/${obra.estado || ''}`.replace(/^, , - \//, ''),
      client: obra.client_name,
      contract_number: obra.contract_number || '',
      startDate: obra.created_at,
      currentStage: 'Execução Atual',
      progressPercent: 0 // Valor padrão se não houver no banco
    },

    // Usar dados reais de clima do relatório ou fallback
    weather: {
      condition: (report.weather?.condition === 'Claro' ? 'ensolarado' 
                : report.weather?.condition === 'Nublado' ? 'nublado'
                : report.weather?.condition === 'Chuvoso' ? 'chuvoso'
                : 'ensolarado') as any,
      observation: report.weather?.condition 
        ? `Clima: ${report.weather.condition}` 
        : 'Condições climáticas favoráveis para execução.',
      praticavel: report.weather?.praticavel || 'Sim'
    },

    // Usar dados reais de efetivo do relatório
    workforce: report.workforce 
      ? [
          ...(report.workforce.supervisor > 0 ? [{ role: 'Supervisor Técnico', count: report.workforce.supervisor }] : []),
          ...(report.workforce.encarregado > 0 ? [{ role: 'Encarregado', count: report.workforce.encarregado }] : []),
          ...(report.workforce.profissional > 0 ? [{ role: 'Profissional', count: report.workforce.profissional }] : []),
          ...(report.workforce.ajudante > 0 ? [{ role: 'Ajudante', count: report.workforce.ajudante }] : []),
        ]
      : [],
    equipment: [],  // Ainda não coletado no UI
    materials: [],  // Ainda não coletado no UI
    
    // Mapear atividades reais
    activities: (report.atividades && report.atividades.length > 0) 
      ? report.atividades.map(atv => ({
          area: atv.area,
          description: atv.description,
          status: atv.status as any,
          percentComplete: atv.status === 'concluido' ? 100 : 0
        }))
      : [
          {
            area: 'Geral',
            description: report.notes || 'Execução de atividades conforme cronograma.',
            status: 'em_andamento',
            percentComplete: 0
          }
        ],

    photos,
    occurrences: [], // Ainda não coletado no UI
    generalNotes: report.notes,
    
    signatures: [
      {
        name: profile.full_name || 'Responsável Técnico',
        role: 'Engenheiro Responsável',
        registrationNumber: profile.engineer_crea || undefined
      }
    ]
  };
};
