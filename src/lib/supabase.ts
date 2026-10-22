import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Storage keys for custom client credentials
const STORAGE_KEY_URL = 'zaplix_custom_supabase_url';
const STORAGE_KEY_KEY = 'zaplix_custom_supabase_anon_key';

export function getSupabaseConfig(): { url: string; key: string; isConfigured: boolean } {
  let url = ENV_SUPABASE_URL;
  let key = ENV_SUPABASE_ANON_KEY;

  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem(STORAGE_KEY_URL) || localStorage.getItem('zyvara_custom_supabase_url');
    const customKey = localStorage.getItem(STORAGE_KEY_KEY) || localStorage.getItem('zyvara_custom_supabase_anon_key');
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

/**
 * Returns a Supabase client that is allowed to WRITE (admin session required).
 * Throws a clear error instead of silently saving data on one device only.
 */
export async function requireAdminClient(): Promise<SupabaseClient> {
  const client = getSupabase();
  if (!client) {
    throw new Error(
      'Supabase is not connected. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your hosting (Vercel) environment variables and redeploy.'
    );
  }
  const { data } = await client.auth.getSession();
  if (!data.session) {
    throw new Error(
      'Admin session expired or missing. Please log out and sign in again with your Supabase admin email and password.'
    );
  }
  return client;
}

/** Turns raw Supabase/PostgREST errors into messages the shop owner can act on. */
export function explainDbError(message: string): string {
  const m = (message || '').toLowerCase();
  if (m.includes('row-level security') || m.includes('permission denied')) {
    return 'Permission denied by Supabase (RLS). Sign in with your Supabase admin email and make sure /supabase/schema.sql was run.';
  }
  if (m.includes('duplicate key') && m.includes('sku')) {
    return 'This SKU is already used by another product. Use a different SKU.';
  }
  if (m.includes('duplicate key') && m.includes('slug')) {
    return 'A product with the same URL slug already exists. Change the product name slightly.';
  }
  if (m.includes('duplicate key')) {
    return 'This record already exists (duplicate value).';
  }
  if (m.includes('does not exist') || m.includes('could not find')) {
    return 'A database table or column is missing. Run the latest /supabase/schema.sql in the Supabase SQL Editor.';
  }
  return message;
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

  let client: SupabaseClient;
  try {
    client = await requireAdminClient();
  } catch (e: any) {
    return { url: null, error: e.message };
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
