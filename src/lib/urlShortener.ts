/**
 * Utilitário para encurtar URLs usando a API gratuita do is.gd
 * Não requer chave de API para uso moderado.
 */
export const shortenUrl = async (longUrl: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      console.warn('Falha na API de encurtamento, usando link original.');
      return longUrl;
    }

    const data = await response.json();
    return data.shorturl || longUrl;
  } catch (error) {
    console.error('Erro ao encurtar URL:', error);
    return longUrl; // Fallback para o link original em caso de erro
  }
};
