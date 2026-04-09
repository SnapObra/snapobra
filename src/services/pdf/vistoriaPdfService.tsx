import { pdf } from '@react-pdf/renderer';
import { Vistoria } from '../../store/vistoriaStore';
import { VistoriaDocument } from './VistoriaDocument';
import { supabase } from '../../lib/supabase';

export const generateVistoriaPDF = async (vistoria: Vistoria) => {
  try {
    // 1. Fetch Company Profile for the Header
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', vistoria.user_id)
      .single();

    if (profileError) throw profileError;

    // 2. Generate PDF component
    const blob = await pdf(<VistoriaDocument vistoria={vistoria} company={profile} />).toBlob();

    // 3. Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laudo_Vistoria_${vistoria.vt_number}_${vistoria.empreendimento_nome.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Erro ao gerar PDF de vistoria:', error);
    throw error;
  }
};
