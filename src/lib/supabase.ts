import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const storageUrl = import.meta.env.VITE_STORAGE_SUPABASE_URL
const storageAnonKey = import.meta.env.VITE_STORAGE_SUPABASE_ANON_KEY

// Cliente principal para Auth e Banco de Dados (snapobra_bd)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY no configurados!');
}
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// Cliente secundrio apenas para o Storage (snapobra_store)
if (!storageUrl || !storageAnonKey) {
  console.error('ERRO: VITE_STORAGE_SUPABASE_URL ou VITE_STORAGE_SUPABASE_ANON_KEY no configurados!');
}
export const storageClient = createClient(storageUrl || '', storageAnonKey || '')
