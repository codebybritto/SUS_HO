import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuração oficial do Supabase
const defaultUrl = 'https://jqgpxlydbijpujjnntci.supabase.co';
const defaultAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZ3B4bHlkYmlqcHVqam5udGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNjEzNjksImV4cCI6MjEwNTkzNzM2OX0.FBf83CHVqWtznGxRFEAV4zAE57DpbCfhWOQabopWd70';

// Remove aspas, quebras de linha e espaços acidentais de variáveis de ambiente
const sanitizeValue = (val?: string): string => {
  if (!val) return '';
  let cleaned = val.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
};

const resolveSupabaseUrl = (): string => {
  const envVal = sanitizeValue(import.meta.env.VITE_SUPABASE_URL as string | undefined);
  if (envVal && envVal.startsWith('http')) {
    return envVal.replace(/\/+$/, '');
  }
  return defaultUrl;
};

const resolveSupabaseAnonKey = (): string => {
  const envVal = sanitizeValue(import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);
  // O token JWT anon do Supabase possui obrigatoriamente 3 partes separadas por ponto
  if (envVal) {
    const parts = envVal.split('.');
    if (parts.length === 3 && parts[0].length > 5 && parts[1].length > 5 && parts[2].length > 5) {
      return envVal;
    }
  }
  return defaultAnonKey;
};

const supabaseUrl = resolveSupabaseUrl();
const supabaseAnonKey = resolveSupabaseAnonKey();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl.trim() !== '' &&
      supabaseAnonKey.trim() !== '' &&
      supabaseUrl !== 'https://xyzcompany.supabase.co' &&
      !supabaseUrl.includes('placeholder')
  );
};

// Create a Supabase client instance or null if not configured
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Test connectivity with Supabase database
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  if (!supabase || !isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env',
    };
  }

  try {
    const { error } = await supabase.from('units').select('count', { count: 'exact', head: true });
    if (error) {
      return { success: false, message: `Erro ao conectar: ${error.message}` };
    }
    return { success: true, message: 'Conexão com o Supabase estabelecida com sucesso!' };
  } catch (err: any) {
    return { success: false, message: `Falha na requisição: ${err?.message || err}` };
  }
}
