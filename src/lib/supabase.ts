import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Storage keys for custom client credentials
const STORAGE_KEY_URL = 'ali_custom_supabase_url';
const STORAGE_KEY_KEY = 'ali_custom_supabase_anon_key';

export function getSupabaseConfig(): { url: string; key: string; isConfigured: boolean } {
  let url = ENV_SUPABASE_URL;
  let key = ENV_SUPABASE_ANON_KEY;

  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem(STORAGE_KEY_URL);
    const customKey = localStorage.getItem(STORAGE_KEY_KEY);
    if (customUrl && customKey) {
      url = customUrl;
      key = customKey;
    }
  }

  const isConfigured = Boolean(
    url && 
    url.trim() !== '' && 
    url.startsWith('https://') && 
    key && 
    key.trim() !== ''
  );

  return { url: url.trim(), key: key.trim(), isConfigured };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, key, isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig().isConfigured;
}

export function saveSupabaseConfig(url: string, key: string): void {
  if (typeof window !== 'undefined') {
    if (url && key) {
      localStorage.setItem(STORAGE_KEY_URL, url.trim());
      localStorage.setItem(STORAGE_KEY_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_URL);
      localStorage.removeItem(STORAGE_KEY_KEY);
    }
    // Reset instance so next call re-instantiates with new credentials
    supabaseInstance = null;
  }
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabase();
  if (!client) {
    return { 
      success: false, 
      message: 'Supabase credentials are not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' 
    };
  }

  try {
    const { data, error } = await client.from('categories').select('id').limit(1);
    if (error) {
      return { 
        success: false, 
        message: `Connected to Supabase, but query error: ${error.message}. Please make sure schema.sql has been run.` 
      };
    }
    return { 
      success: true, 
      message: 'Supabase connection verified successfully! Products and orders are syncing directly with PostgreSQL.' 
    };
  } catch (err: any) {
    return { 
      success: false, 
      message: err.message || 'Network error while contacting Supabase.' 
    };
  }
}

/**
 * Upload a product image to Supabase Storage bucket 'product-images'
 * Returns the permanent public URL
 */
export async function uploadProductImageToStorage(
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const client = getSupabase();
  if (!client) {
    return { 
      url: null, 
      error: 'Supabase is not configured. Please configure your Supabase URL & Anon Key in Store Settings.' 
    };
  }

  try {
    const bucket = 'product-images';
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `products/${Date.now()}-${cleanFileName}`;

    const { error: uploadError } = await client.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      return { url: null, error: uploadError.message };
    }

    const { data: publicUrlData } = client.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      return { url: null, error: 'Could not obtain public URL for uploaded image.' };
    }

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || 'Unexpected upload error' };
  }
}
