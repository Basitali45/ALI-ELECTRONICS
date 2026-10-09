import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Vercel Environment Variables - Ye har device ke liye same hoga
const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export function getSupabaseConfig(): { url: string; key: string; isConfigured: boolean } {
  const url = ENV_SUPABASE_URL.trim();
  const key = ENV_SUPABASE_ANON_KEY.trim();

  const isConfigured = Boolean(
    url && url.startsWith('https://') && key
  );

  return { url, key, isConfigured };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig().isConfigured;
}

// Ab ye function kuch nahi karega, bas rakha hai taake error na aaye
export function saveSupabaseConfig(url: string, key: string): void {
  console.log("Config is now managed by Vercel, not localStorage");
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; details?: { productsCount: number; categoriesCount: number } }> {
  const client = getSupabase();
  if (!client) {
    return { success: false, message: 'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY Vercel me set nahi hai.' };
  }
  try {
    const { count: catCount, error: catError } = await client.from('categories').select('*', { count: 'exact', head: true });
    if (catError) return { success: false, message: `categories table error: ${catError.message}` };

    const { count: prodCount, error: prodError } = await client.from('products').select('*', { count: 'exact', head: true });
    if (prodError) return { success: false, message: `products table error: ${prodError.message}` };

    return { success: true, message: `Connected! ${prodCount ?? 0} products, ${catCount ?? 0} categories live.`, details: { productsCount: prodCount ?? 0, categoriesCount: catCount ?? 0 } };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network error' };
  }
}

export async function uploadProductImageToStorage(file: File): Promise<{ url: string | null; error: string | null }> {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!validTypes.includes(file.type)) {
    return { url: null, error: 'Invalid format. Use JPG, PNG, WEBP, GIF.' };
  }
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { url: null, error: 'File > 5MB. Please compress.' };
  }
  const client = getSupabase();
  if (!client) return { url: null, error: 'Supabase not configured in Vercel.' };

  try {
    const bucket = 'product-images';
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `products/${Date.now()}-${cleanFileName}`;

    const { error: uploadError } = await client.storage.from(bucket).upload(filePath, file, { cacheControl: '3600', upsert: true });
    if (uploadError) return { url: null, error: uploadError.message };

    const { data: publicUrlData } = client.storage.from(bucket).getPublicUrl(filePath);
    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || 'Upload error' };
  }
}
