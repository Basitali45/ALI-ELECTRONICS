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

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; details?: { productsCount: number; categoriesCount: number } }> {
  const client = getSupabase();
  if (!client) {
    return { 
      success: false, 
      message: 'Supabase credentials are not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or enter them in Admin Settings).' 
    };
  }

  try {
    const { count: catCount, error: catError } = await client.from('categories').select('*', { count: 'exact', head: true });
    if (catError) {
      return { 
        success: false, 
        message: `Connected to Supabase, but "categories" table query failed: ${catError.message}. Make sure you ran /supabase/schema.sql in the Supabase SQL Editor.` 
      };
    }

    const { count: prodCount, error: prodError } = await client.from('products').select('*', { count: 'exact', head: true });
    if (prodError) {
      return { 
        success: false, 
        message: `Connected to Supabase, but "products" table query failed: ${prodError.message}. Make sure you ran /supabase/schema.sql in the Supabase SQL Editor.` 
      };
    }

    return { 
      success: true, 
      message: `Supabase connection active! Live dataset verified (${prodCount ?? 0} products, ${catCount ?? 0} categories). Permanent PostgreSQL cloud sync is fully operational.`,
      details: {
        productsCount: prodCount ?? 0,
        categoriesCount: catCount ?? 0,
      }
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
  // 1. Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!validTypes.includes(file.type)) {
    return {
      url: null,
      error: 'Invalid file format. Please upload JPG, PNG, WEBP, or GIF image.',
    };
  }

  // 2. Validate file size (max 5MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return {
      url: null,
      error: 'File size exceeds 5MB limit. Please select a smaller or compressed image.',
    };
  }

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
