import { 
  Product, 
  Category, 
  Offer, 
  HomepageConfig, 
  StoreSettings, 
  MediaItem, 
  Inquiry, 
  ContactMessage, 
  AdminStats,
  Order,
  OrderItem,
  OrderStatus
} from '../types';
import { getDeliveryCharges, getWhatsAppUrl } from '../lib/policy';
import { initialProducts, initialCategories, initialOffers, initialSettings, initialHomepage } from './seedData';
import { getSupabase, isSupabaseConfigured, uploadProductImageToStorage, requireAdminClient, explainDbError } from '../lib/supabase';

const API_BASE = '/api';

// Local storage fallback helpers for resilience
function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`zaplix_${key}`) || localStorage.getItem(`zyvara_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`zaplix_${key}`, JSON.stringify(data));
  } catch {
    // quota exceeded or private mode
  }
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('zaplix_token') || localStorage.getItem('zyvara_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Convert Supabase DB snake_case product record to client Product
function mapDbProductToClient(row: any): Product {
  return {
    id: row.id,
    name: row.name || 'Unnamed Product',
    slug: row.slug || '',
    category: row.category || 'Other',
    categoryId: row.category_id || undefined,
    brand: row.brand || '',
    sku: row.sku || '',
    price: Number(row.price) || 0,
    oldPrice: row.old_price != null ? Number(row.old_price) : undefined,
    discount: row.discount || undefined,
    badge: row.badge || '',
    stock: row.stock != null ? Number(row.stock) : 10,
    availability: row.availability || 'In Stock',
    image: row.image || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80',
    additionalImages: Array.isArray(row.additional_images) ? row.additional_images : [],
    shortDescription: row.short_description || '',
    description: row.description || '',
    specifications: Array.isArray(row.specifications) ? row.specifications : [],
    featured: Boolean(row.featured),
    isNewArrival: Boolean(row.is_new_arrival),
    showOnHomepage: row.show_on_homepage !== false,
    whatsappEnabled: row.whatsapp_enabled !== false,
    displayOrder: Number(row.display_order) || 0,
    active: row.active !== false,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function has(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

// Convert client Product to Supabase DB record.
// Keys that are present but empty (e.g. oldPrice: undefined) CLEAR the DB value, so a sale can be removed.
function mapClientProductToDb(prod: Partial<Product>): Record<string, any> {
  const db: Record<string, any> = {};
  if (prod.name !== undefined) db.name = prod.name;
  if (has(prod, 'slug')) db.slug = prod.slug ? prod.slug : null;
  if (prod.category !== undefined) db.category = prod.category;
  if (has(prod, 'categoryId')) db.category_id = prod.categoryId || null;
  if (prod.brand !== undefined) db.brand = prod.brand;
  if (has(prod, 'sku')) db.sku = prod.sku && prod.sku.trim() ? prod.sku.trim() : null;
  if (prod.price !== undefined) db.price = Number(prod.price);
  if (has(prod, 'oldPrice')) db.old_price = prod.oldPrice ? Number(prod.oldPrice) : null;
  if (has(prod, 'discount')) db.discount = prod.discount ? prod.discount : null;
  if (has(prod, 'badge')) db.badge = prod.badge || '';
  if (prod.stock !== undefined) db.stock = Math.max(0, Number(prod.stock) || 0);
  if (prod.availability !== undefined) db.availability = prod.availability;
  if (prod.image) db.image = prod.image;
  if (prod.additionalImages !== undefined) db.additional_images = prod.additionalImages;
  if (prod.shortDescription !== undefined) db.short_description = prod.shortDescription;
  if (prod.description !== undefined) db.description = prod.description;
  if (prod.specifications !== undefined) db.specifications = prod.specifications;
  if (prod.featured !== undefined) db.featured = prod.featured;
  if (prod.isNewArrival !== undefined) db.is_new_arrival = prod.isNewArrival;
  if (prod.showOnHomepage !== undefined) db.show_on_homepage = prod.showOnHomepage;
  if (prod.whatsappEnabled !== undefined) db.whatsapp_enabled = prod.whatsappEnabled;
  if (prod.displayOrder !== undefined) db.display_order = prod.displayOrder;
  if (prod.active !== undefined) db.active = prod.active;
  db.updated_at = new Date().toISOString();
  return db;
}

export const api = {
  // ================= PRODUCTS (SUPABASE CLOUD FIRST) =================
  async getProducts(params?: {
    category?: string;
    search?: string;
    featured?: boolean;
    availability?: string;
    sort?: string;
  }): Promise<Product[]> {
    const supabase = getSupabase();

    if (supabase) {
      try {
        let query = supabase.from('products').select('*');

        // Only query active products unless specifically requested
        query = query.eq('active', true);

        if (params?.category && params.category !== 'All' && params.category.toLowerCase() !== 'all') {
          query = query.ilike('category', params.category);
        }
        if (params?.featured) {
          query = query.eq('featured', true);
        }
        if (params?.availability && params.availability !== 'all' && params.availability.toLowerCase() !== 'all') {
          query = query.ilike('availability', params.availability);
        }

        query = query.order('display_order', { ascending: true }).order('created_at', { ascending: false });

        const { data, error } = await query;
        if (error) {
          console.warn('Supabase getProducts returned error:', error.message);
        } else if (data) {
          let mapped = data.map(mapDbProductToClient);
          if (params?.search) {
            const s = params.search.toLowerCase();
            mapped = mapped.filter(
              (p) =>
                p.name.toLowerCase().includes(s) ||
                (p.sku && p.sku.toLowerCase().includes(s)) ||
                (p.brand && p.brand.toLowerCase().includes(s)) ||
                p.category.toLowerCase().includes(s)
            );
          }
          // Supabase is authoritative when connected: store synced copy and return
          setLocal('products', mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getProducts network exception, falling back to local cache:', err);
      }
    }

    // Server API fallback
    try {
      const q = new URLSearchParams();
      if (params?.category) q.set('category', params.category);
      if (params?.search) q.set('search', params.search);
      if (params?.featured) q.set('featured', 'true');
      if (params?.availability) q.set('availability', params.availability);
      if (params?.sort) q.set('sort', params.sort);
      const url = `${API_BASE}/products${q.toString() ? '?' + q.toString() : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocal('products', data);
          return data;
        }
      }
    } catch {
      // ignore
    }

    // Offline / unconfigured fallback
    let list = getLocal<Product[]>('products', initialProducts);
    if (params?.category && params.category !== 'All' && params.category.toLowerCase() !== 'all') {
      list = list.filter((p) => p.category.toLowerCase() === params.category?.toLowerCase());
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (params?.featured) {
      list = list.filter((p) => p.featured);
    }
    if (params?.availability && params.availability !== 'all' && params.availability.toLowerCase() !== 'all') {
      list = list.filter((p) => p.availability.toLowerCase() === params.availability?.toLowerCase());
    }
    return list;
  },

  async addProduct(prod: Partial<Product>): Promise<Product> {
    const generatedId = prod.id || `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const uniqueSuffix = Math.random().toString(36).slice(2, 7);
    const now = new Date().toISOString();
    const clientProd: Product = {
      id: generatedId,
      name: (prod.name || 'New Product').trim(),
      slug: `${slugify(prod.name || 'product') || 'product'}-${uniqueSuffix}`,
      category: prod.category || 'Mobile Accessories',
      brand: prod.brand || 'Generic / Tech Pro',
      sku: prod.sku && prod.sku.trim() ? prod.sku.trim() : `ZV-${Math.floor(10000 + Math.random() * 90000)}`,
      price: Number(prod.price) || 0,
      oldPrice: prod.oldPrice ? Number(prod.oldPrice) : undefined,
      discount: prod.discount || '',
      badge: prod.badge || '',
      stock: prod.stock != null ? Number(prod.stock) : 10,
      availability: prod.availability || 'In Stock',
      image: prod.image || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80',
      additionalImages: prod.additionalImages || [],
      shortDescription: prod.shortDescription || '',
      description: prod.description || '',
      specifications: prod.specifications || [],
      featured: Boolean(prod.featured),
      isNewArrival: Boolean(prod.isNewArrival),
      showOnHomepage: prod.showOnHomepage !== false,
      whatsappEnabled: prod.whatsappEnabled !== false,
      displayOrder: Number(prod.displayOrder) || 1,
      active: true,
      createdAt: now,
      updatedAt: now,
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = await requireAdminClient();
        const dbRecord = mapClientProductToDb(clientProd);
        dbRecord.id = clientProd.id;
        dbRecord.created_at = clientProd.createdAt;

        const { data, error } = await supabase.from('products').insert([dbRecord]).select();
        if (!error && data && data.length > 0) {
          const saved = mapDbProductToClient(data[0]);
          const current = getLocal<Product[]>('products', initialProducts);
          setLocal('products', [saved, ...current.filter((p) => p.id !== saved.id)]);
          return saved;
        }
      } catch (err) {
        console.warn('Supabase addProduct error, falling back to server/local store:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(clientProd),
      });
      if (res.ok) {
        const saved = await res.json();
        const current = getLocal<Product[]>('products', initialProducts);
        setLocal('products', [saved, ...current.filter((p) => p.id !== saved.id)]);
        return saved;
      }
    } catch {
      // fallback
    }

    const current = getLocal<Product[]>('products', initialProducts);
    setLocal('products', [clientProd, ...current.filter((p) => p.id !== clientProd.id)]);
    return clientProd;
  },

  async updateProduct(id: string, prod: Partial<Product>): Promise<Product> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await requireAdminClient();
        const dbUpdates = mapClientProductToDb(prod);
        const { data, error } = await supabase.from('products').update(dbUpdates).eq('id', id).select();
        if (!error && data && data.length > 0) {
          const saved = mapDbProductToClient(data[0]);
          const current = getLocal<Product[]>('products', initialProducts);
          setLocal('products', current.map((p) => (p.id === id ? saved : p)));
          return saved;
        }
      } catch (err) {
        console.warn('Supabase updateProduct error, falling back to server/local store:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(prod),
      });
      if (res.ok) {
        const saved = await res.json();
        const current = getLocal<Product[]>('products', initialProducts);
        setLocal('products', current.map((p) => (p.id === id ? saved : p)));
        return saved;
      }
    } catch {
      // fallback
    }

    const current = getLocal<Product[]>('products', initialProducts);
    const existing = current.find((p) => p.id === id);
    const updated = { ...(existing || {}), ...prod, id, updatedAt: new Date().toISOString() } as Product;
    setLocal('products', current.map((p) => (p.id === id ? updated : p)));
    return updated;
  },

  async deleteProduct(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await requireAdminClient();
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) {
          const products = getLocal<Product[]>('products', initialProducts);
          setLocal('products', products.filter((p) => p.id !== id));
          return;
        }
      } catch (err) {
        console.warn('Supabase deleteProduct error, falling back to server/local store:', err);
      }
    }

    try {
      await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
    } catch {
      // fallback
    }

    const products = getLocal<Product[]>('products', initialProducts);
    setLocal('products', products.filter((p) => p.id !== id));
  },

  async createProduct(prod: Partial<Product>): Promise<Product> {
    return this.addProduct(prod);
  },

  async quickUpdatePrice(id: string, price: number): Promise<Product> {
    return this.updateProduct(id, { price });
  },

  async duplicateProduct(id: string): Promise<Product> {
    const products = await this.getProducts();
    const existing = products.find((p) => p.id === id);
    if (!existing) throw new Error('Product not found');
    const clone: Partial<Product> = {
      ...existing,
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      slug: undefined,
      sku: `ZV-${Math.floor(10000 + Math.random() * 90000)}`,
      name: `${existing.name} (Copy)`,
    };
    return this.addProduct(clone);
  },

  async bulkProductAction(action: string, ids: string[], payload?: any): Promise<void> {
    if (!ids.length) return;
    if (isSupabaseConfigured()) {
      try {
        const supabase = await requireAdminClient();
        const now = new Date().toISOString();
        let result: { error: { message: string } | null } = { error: null };

        if (action === 'delete') {
          result = await supabase.from('products').delete().in('id', ids);
        } else if (action === 'stock' || action === 'availability') {
          const availability = typeof payload === 'string' ? payload : payload?.availability;
          if (!availability) throw new Error('Stock status is required');
          result = await supabase.from('products').update({ availability, updated_at: now }).in('id', ids);
        } else if (action === 'featured') {
          const featured = typeof payload === 'boolean' ? payload : payload?.featured ?? true;
          result = await supabase.from('products').update({ featured: Boolean(featured), updated_at: now }).in('id', ids);
        } else if (action === 'newArrival') {
          const isNew = typeof payload === 'boolean' ? payload : payload?.isNewArrival ?? true;
          result = await supabase.from('products').update({ is_new_arrival: Boolean(isNew), updated_at: now }).in('id', ids);
        } else if (action === 'category') {
          if (!payload?.category) throw new Error('Category is required');
          result = await supabase.from('products').update({ category: payload.category, updated_at: now }).in('id', ids);
        } else if (action === 'discountPercent') {
          const pct = Number(payload?.percent ?? payload);
          if (!(pct > 0 && pct < 100)) throw new Error('Discount percent must be between 1 and 99');
          const { data: rows, error: readError } = await supabase.from('products').select('id, price, old_price').in('id', ids);
          if (readError) throw new Error(`Could not read products: ${explainDbError(readError.message)}`);
          const updates = await Promise.all(
            (rows || []).map((row) => {
              const price = Number(row.price) || 0;
              const original = row.old_price && Number(row.old_price) > price ? Number(row.old_price) : price;
              return supabase
                .from('products')
                .update({
                  old_price: original,
                  price: Math.round(original * (1 - pct / 100)),
                  discount: `${pct}% OFF`,
                  badge: 'SALE',
                  updated_at: now,
                })
                .eq('id', row.id);
            })
          );
          const failed = updates.find((u) => u.error);
          result = { error: failed?.error || null };
        }

        if (!result.error) return;
      } catch (err) {
        console.warn('Supabase bulkProductAction error, falling back to server/local store:', err);
      }
    }

    try {
      await fetch(`${API_BASE}/products/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ action, productIds: ids, payload }),
      });
    } catch {
      // fallback
    }

    const current = getLocal<Product[]>('products', initialProducts);
    if (action === 'delete') {
      setLocal('products', current.filter((p) => !ids.includes(p.id)));
    } else if (action === 'stock' || action === 'availability') {
      const availability = typeof payload === 'string' ? payload : payload?.availability || 'In Stock';
      setLocal('products', current.map((p) => ids.includes(p.id) ? { ...p, availability } : p));
    } else if (action === 'featured') {
      const featured = typeof payload === 'boolean' ? payload : payload?.featured ?? true;
      setLocal('products', current.map((p) => ids.includes(p.id) ? { ...p, featured } : p));
    }
  },

  async toggleProductStock(id: string, availability?: string): Promise<Product> {
    return this.updateProduct(id, { availability: (availability as any) || 'In Stock' });
  },

  async toggleProductFeatured(id: string, featured?: boolean): Promise<Product> {
    return this.updateProduct(id, { featured: !!featured });
  },

  // Image Upload directly to Supabase Storage
  async uploadProductImage(file: File): Promise<{ url: string | null; error: string | null }> {
    return uploadProductImageToStorage(file);
  },

  // ================= CATEGORIES =================
  async getCategories(): Promise<Category[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
        if (!error && data) {
          if (data.length > 0 || isSupabaseConfigured()) {
            const mapped: Category[] = data.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              description: c.description,
              image: c.image_url,
              icon: c.icon,
              order: c.display_order,
              isVisible: c.active !== false,
              active: c.active !== false,
            }));
            setLocal('categories', mapped);
            return mapped;
          }
        }
      } catch (err) {
        console.warn('Supabase getCategories error:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocal('categories', data);
          return data;
        }
      }
    } catch {
      // fallback
    }

    return getLocal<Category[]>('categories', initialCategories);
  },

  async addCategory(cat: Partial<Category>): Promise<Category> {
    const name = (cat.name || 'New Category').trim();
    const newCat: Category = {
      id: cat.id || `cat-${Date.now()}`,
      name,
      slug: cat.slug || slugify(name) || `cat-${Date.now()}`,
      description: cat.description || '',
      image: cat.image || '',
      icon: cat.icon || '',
      order: cat.order || 99,
      isVisible: cat.isVisible !== false,
      active: true,
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = await requireAdminClient();
        const { error } = await supabase.from('categories').insert([
          {
            id: newCat.id,
            name: newCat.name,
            slug: newCat.slug,
            description: newCat.description,
            image_url: newCat.image,
            icon: newCat.icon,
            display_order: newCat.order,
            active: newCat.isVisible,
          },
        ]);
        if (!error) {
          const current = getLocal<Category[]>('categories', initialCategories);
          setLocal('categories', [...current, newCat]);
          return newCat;
        }
      } catch (err) {
        console.warn('Supabase addCategory error, falling back to server/local store:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(newCat),
      });
      if (res.ok) {
        const saved = await res.json();
        const current = getLocal<Category[]>('categories', initialCategories);
        setLocal('categories', [...current, saved]);
        return saved;
      }
    } catch {
      // fallback
    }

    const current = getLocal<Category[]>('categories', initialCategories);
    setLocal('categories', [...current, newCat]);
    return newCat;
  },

  async updateCategory(id: string, cat: Partial<Category>): Promise<Category> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await requireAdminClient();
        const { data: existing, error: readError } = await supabase.from('categories').select('*').eq('id', id).maybeSingle();
        if (!readError && existing) {
          const updates: Record<string, any> = { updated_at: new Date().toISOString() };
          if (cat.name !== undefined) updates.name = cat.name.trim();
          if (cat.description !== undefined) updates.description = cat.description;
          if (cat.image !== undefined) updates.image_url = cat.image;
          if (cat.icon !== undefined) updates.icon = cat.icon;
          if (cat.order !== undefined) updates.display_order = cat.order;
          if (cat.isVisible !== undefined) updates.active = cat.isVisible;

          const { error } = await supabase.from('categories').update(updates).eq('id', id);
          if (!error) {
            if (updates.name && updates.name !== existing.name) {
              await supabase.from('products').update({ category: updates.name }).eq('category', existing.name);
            }
            return {
              id,
              name: updates.name ?? existing.name,
              slug: existing.slug,
              description: updates.description ?? existing.description,
              image: updates.image_url ?? existing.image_url,
              icon: updates.icon ?? existing.icon,
              order: updates.display_order ?? existing.display_order,
              isVisible: updates.active ?? existing.active !== false,
              active: updates.active ?? existing.active !== false,
            };
          }
        }
      } catch (err) {
        console.warn('Supabase updateCategory error, falling back to server/local store:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(cat),
      });
      if (res.ok) {
        const saved = await res.json();
        const current = getLocal<Category[]>('categories', initialCategories);
        setLocal('categories', current.map(c => c.id === id ? saved : c));
        return saved;
      }
    } catch {
      // fallback
    }

    const current = getLocal<Category[]>('categories', initialCategories);
    const existing = current.find(c => c.id === id);
    const updated = { ...(existing || {}), ...cat, id } as Category;
    setLocal('categories', current.map(c => c.id === id ? updated : c));
    return updated;
  },

  async deleteCategory(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await requireAdminClient();
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (!error) {
          const current = getLocal<Category[]>('categories', initialCategories);
          setLocal('categories', current.filter(c => c.id !== id));
          return;
        }
      } catch (err) {
        console.warn('Supabase deleteCategory error, falling back to server/local store:', err);
      }
    }

    try {
      await fetch(`${API_BASE}/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
    } catch {
      // fallback
    }

    const current = getLocal<Category[]>('categories', initialCategories);
    setLocal('categories', current.filter(c => c.id !== id));
  },

  // ================= OFFERS =================
  async getOffers(includeInactive = false): Promise<Offer[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        let query = supabase.from('offers').select('*').order('created_at', { ascending: false });
        if (!includeInactive) query = query.eq('is_active', true);
        const { data, error } = await query;
        if (!error && data) {
          const mapped: Offer[] = data.map((o) => ({
            id: o.id,
            title: o.title,
            description: o.description,
            discountType: o.discount_type as any,
            discountValue: Number(o.discount_value) || 0,
            bannerImage: o.banner_image,
            buttonText: o.button_text,
            buttonLink: o.button_link,
            startDate: o.start_date || undefined,
            endDate: o.end_date || undefined,
            isActive: o.is_active,
            displayLocation: o.display_location as any,
            productIds: Array.isArray(o.product_ids) ? o.product_ids : [],
            createdAt: o.created_at,
          }));
          setLocal('offers', mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getOffers error:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/offers`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const filtered = includeInactive ? data : data.filter((o: any) => o.isActive);
          setLocal('offers', data);
          return filtered;
        }
      }
    } catch {
      // fallback
    }

    const localOffers = getLocal<Offer[]>('offers', initialOffers);
    return includeInactive ? localOffers : localOffers.filter(o => o.isActive);
  },

  async addOffer(offer: Partial<Offer>): Promise<Offer> {
    const newOffer: Offer = {
      id: offer.id || `offer-${Date.now()}`,
      title: offer.title || 'Special Promotion',
      description: offer.description || '',
      discountType: offer.discountType || 'percentage',
      discountValue: offer.discountValue || 10,
      bannerImage: offer.bannerImage,
      buttonText: offer.buttonText || 'Claim Offer on WhatsApp',
      buttonLink: offer.buttonLink || '#products',
      startDate: offer.startDate || undefined,
      endDate: offer.endDate || undefined,
      isActive: offer.isActive !== false,
      displayLocation: offer.displayLocation || 'banner',
      productIds: offer.productIds || [],
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = await requireAdminClient();
        const { error } = await supabase.from('offers').insert([
          {
            id: newOffer.id,
            title: newOffer.title,
            description: newOffer.description,
            discount_type: newOffer.discountType,
            discount_value: newOffer.discountValue,
            banner_image: newOffer.bannerImage,
            button_text: newOffer.buttonText,
            button_link: newOffer.buttonLink,
            start_date: newOffer.startDate || null,
            end_date: newOffer.endDate || null,
            is_active: newOffer.isActive,
            display_location: newOffer.displayLocation,
            product_ids: newOffer.productIds,
          },
        ]);
        if (!error) {
          const current = getLocal<Offer[]>('offers', initialOffers);
          setLocal('offers', [newOffer, ...current]);
          return newOffer;
        }
      } catch (err) {
        console.warn('Supabase addOffer error, falling back to server/local store:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(newOffer),
      });
      if (res.ok) {
        const saved = await res.json();
        const current = getLocal<Offer[]>('offers', initialOffers);
        setLocal('offers', [saved, ...current]);
        return saved;
      }
    } catch {
      // fallback
    }

    const current = getLocal<Offer[]>('offers', initialOffers);
    setLocal('offers', [newOffer, ...current]);
    return newOffer;
  },

  async updateOffer(id: string, offer: Partial<Offer>): Promise<Offer> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await requireAdminClient();
        const updates: Record<string, any> = { updated_at: new Date().toISOString() };
        if (offer.title !== undefined) updates.title = offer.title;
        if (offer.description !== undefined) updates.description = offer.description;
        if (offer.discountType !== undefined) updates.discount_type = offer.discountType;
        if (offer.discountValue !== undefined) updates.discount_value = offer.discountValue;
        if (offer.bannerImage !== undefined) updates.banner_image = offer.bannerImage;
        if (offer.buttonText !== undefined) updates.button_text = offer.buttonText;
        if (offer.buttonLink !== undefined) updates.button_link = offer.buttonLink;
        if (has(offer, 'startDate')) updates.start_date = offer.startDate || null;
        if (has(offer, 'endDate')) updates.end_date = offer.endDate || null;
        if (offer.isActive !== undefined) updates.is_active = offer.isActive;
        if (offer.displayLocation !== undefined) updates.display_location = offer.displayLocation;
        if (offer.productIds !== undefined) updates.product_ids = offer.productIds;

        const { data, error } = await supabase.from('offers').update(updates).eq('id', id).select();
        if (!error && data && data.length > 0) {
          const o = data[0];
          const saved: Offer = {
            id: o.id,
            title: o.title,
            description: o.description,
            discountType: o.discount_type,
            discountValue: Number(o.discount_value) || 0,
            bannerImage: o.banner_image,
            buttonText: o.button_text,
            buttonLink: o.button_link,
            startDate: o.start_date || undefined,
            endDate: o.end_date || undefined,
            isActive: o.is_active,
            displayLocation: o.display_location,
            productIds: Array.isArray(o.product_ids) ? o.product_ids : [],
            createdAt: o.created_at,
          };
          const current = getLocal<Offer[]>('offers', initialOffers);
          setLocal('offers', current.map(of => of.id === id ? saved : of));
          return saved;
        }
      } catch (err) {
        console.warn('Supabase updateOffer error, falling back to server/local store:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/offers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(offer),
      });
      if (res.ok) {
        const saved = await res.json();
        const current = getLocal<Offer[]>('offers', initialOffers);
        setLocal('offers', current.map(of => of.id === id ? saved : of));
        return saved;
      }
    } catch {
      // fallback
    }

    const current = getLocal<Offer[]>('offers', initialOffers);
    const existing = current.find(of => of.id === id);
    const updated = { ...(existing || {}), ...offer, id } as Offer;
    setLocal('offers', current.map(of => of.id === id ? updated : of));
    return updated;
  },

  async deleteOffer(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await requireAdminClient();
        const { error } = await supabase.from('offers').delete().eq('id', id);
        if (!error) {
          const current = getLocal<Offer[]>('offers', initialOffers);
          setLocal('offers', current.filter(of => of.id !== id));
          return;
        }
      } catch (err) {
        console.warn('Supabase deleteOffer error, falling back to server/local store:', err);
      }
    }

    try {
      await fetch(`${API_BASE}/offers/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
    } catch {
      // fallback
    }

    const current = getLocal<Offer[]>('offers', initialOffers);
    setLocal('offers', current.filter(of => of.id !== id));
  },

  async createOffer(offer: Partial<Offer>): Promise<Offer> {
    return this.addOffer(offer);
  },

  async toggleOffer(id: string): Promise<Offer> {
    const offers = await this.getOffers(true);
    const existing = offers.find((o) => o.id === id);
    if (!existing) throw new Error('Offer not found');
    return this.updateOffer(id, { isActive: !existing.isActive });
  },

  // ================= ORDERS & E-COMMERCE CHECKOUT =================
  async createOrder(
    orderData: {
      customerName: string;
      customerPhone: string;
      customerWhatsapp?: string;
      customerEmail?: string;
      customerAddress: string;
      city?: string;
      notes?: string;
      paymentMethod?: string;
    },
    items: { product: Product; quantity: number }[]
  ): Promise<{ order: Order; whatsappUrl: string }> {
    const settings = await this.getStoreSettings();
    const cleanAdminPhone = (settings.whatsappNumber || '03189869746')
      .replace(/^0/, '92')
      .replace(/[^0-9]/g, '');

    const orderNumber = `ZX-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    // PHASE 4: Free Home Delivery on all orders
    const deliveryCharges = 0;
    const totalAmount = subtotal + deliveryCharges;
    const orderId = `ord-${Date.now()}`;

    const orderItems: OrderItem[] = items.map((item, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      orderId,
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.image,
      sku: item.product.sku || `ZX-${item.product.id.substring(0, 6)}`,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));

    // PHASE 3: Enforce Cash on Delivery only
    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerWhatsapp: orderData.customerWhatsapp || orderData.customerPhone,
      customerEmail: orderData.customerEmail,
      customerAddress: orderData.customerAddress,
      city: orderData.city || '',
      notes: orderData.notes,
      subtotal,
      deliveryCharges: 0,
      discount: 0,
      totalAmount,
      status: 'Pending',
      paymentMethod: 'Cash on Delivery',
      items: orderItems,
      createdAt: new Date().toISOString(),
    };

    // 1. SAVE TO SUPABASE ORDERS TABLE
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error: orderError } = await supabase.from('orders').insert([
          {
            id: newOrder.id,
            order_number: newOrder.orderNumber,
            customer_name: newOrder.customerName,
            customer_phone: newOrder.customerPhone,
            customer_whatsapp: newOrder.customerWhatsapp,
            customer_email: newOrder.customerEmail,
            customer_address: newOrder.customerAddress,
            city: newOrder.city,
            notes: newOrder.notes,
            subtotal: newOrder.subtotal,
            delivery_charges: 0,
            discount: newOrder.discount,
            total_amount: newOrder.totalAmount,
            status: newOrder.status,
            payment_method: 'Cash on Delivery',
            created_at: newOrder.createdAt,
          },
        ]);

        if (orderError) {
          console.warn('Error inserting order in Supabase:', orderError.message);
        } else {
          // Insert order items
          const dbItems = orderItems.map((it) => ({
            id: it.id,
            order_id: it.orderId,
            product_id: it.productId,
            product_name: it.productName,
            product_image: it.productImage,
            sku: it.sku,
            price: it.price,
            quantity: it.quantity,
            subtotal: it.subtotal,
          }));
          await supabase.from('order_items').insert(dbItems);
        }
      } catch (err) {
        console.warn('Failed saving order to Supabase:', err);
      }
    }

    // Always also persist to Express backend
    try {
      await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder }),
      });
    } catch {
      // fallback
    }

    // Save locally
    const orders = getLocal<Order[]>('orders', []);
    setLocal('orders', [newOrder, ...orders]);

    // 2. CONSTRUCT STRUCTURED WHATSAPP ORDER MESSAGE (PHASE 5 FORMAT)
    let message = `Hello Zaplix Team!\n\n`;
    message += `I would like to place an order through your online store.\n\n`;
    message += `Order ID: #${orderNumber}\n\n`;
    message += `Products: ${items.map((i) => i.product.name).join(', ')}\n\n`;
    message += `Quantities: ${items.map((i) => `${i.product.name} (Qty: ${i.quantity})`).join(', ')}\n\n`;
    message += `Subtotal: Rs. ${subtotal.toLocaleString()}\n\n`;
    message += `Delivery Charges: Rs. 0 — FREE HOME DELIVERY\n\n`;
    message += `Payment Method: Cash on Delivery\n\n`;
    message += `Grand Total: Rs. ${totalAmount.toLocaleString()}\n\n`;
    message += `Customer: ${newOrder.customerName} (${newOrder.customerPhone})\n`;
    message += `Address: ${newOrder.customerAddress}, ${newOrder.city}\n`;
    if (newOrder.notes) message += `Notes: ${newOrder.notes}\n`;
    message += `\nPlease confirm my order and delivery details.`;

    const whatsappUrl = getWhatsAppUrl(message);

    return { order: newOrder, whatsappUrl };
  },

  async getOrders(): Promise<Order[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (!ordersError && ordersData) {
          const { data: itemsData } = await supabase.from('order_items').select('*');

          const mappedOrders: Order[] = ordersData.map((row) => {
            const relatedItems = (itemsData || []).filter((item) => item.order_id === row.id);
            return {
              id: row.id,
              orderNumber: row.order_number,
              customerName: row.customer_name,
              customerPhone: row.customer_phone,
              customerWhatsapp: row.customer_whatsapp,
              customerEmail: row.customer_email,
              customerAddress: row.customer_address,
              city: row.city || '',
              notes: row.notes,
              subtotal: Number(row.subtotal) || 0,
              deliveryCharges: Number(row.delivery_charges) || 0,
              discount: Number(row.discount) || 0,
              totalAmount: Number(row.total_amount) || 0,
              status: (row.status as OrderStatus) || 'Pending',
              paymentMethod: row.payment_method || 'Cash on Delivery',
              items: relatedItems.map((it) => ({
                id: it.id,
                orderId: it.order_id,
                productId: it.product_id,
                productName: it.product_name,
                productImage: it.product_image,
                sku: it.sku,
                price: Number(it.price) || 0,
                quantity: Number(it.quantity) || 1,
                subtotal: Number(it.subtotal) || 0,
              })),
              createdAt: row.created_at,
            };
          });

          setLocal('orders', mappedOrders);
          return mappedOrders;
        }
      } catch (err) {
        console.warn('Supabase getOrders error:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/orders`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocal('orders', data);
          return data;
        }
      }
    } catch {
      // fallback
    }

    return getLocal<Order[]>('orders', []);
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await requireAdminClient();
        const { error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
        if (!error) {
          const orders = await this.getOrders();
          const found = orders.find((o) => o.id === orderId);
          if (found) return found;
        }
      } catch (err) {
        console.warn('Supabase updateOrderStatus error, falling back to server/local store:', err);
      }
    }

    try {
      await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status }),
      });
    } catch {
      // fallback
    }

    const orders = getLocal<Order[]>('orders', []);
    const found = orders.find((o) => o.id === orderId);
    if (found) {
      found.status = status;
      setLocal('orders', orders);
      return found;
    }
    return { id: orderId, status } as any;
  },

  async deleteOrder(orderId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await requireAdminClient();
        const { error } = await supabase.from('orders').delete().eq('id', orderId);
        if (!error) {
          const orders = getLocal<Order[]>('orders', []);
          setLocal('orders', orders.filter((o) => o.id !== orderId));
          return;
        }
      } catch (err) {
        console.warn('Supabase deleteOrder error, falling back to server/local store:', err);
      }
    }

    try {
      await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
    } catch {
      // fallback
    }

    const orders = getLocal<Order[]>('orders', []);
    setLocal('orders', orders.filter((o) => o.id !== orderId));
  },

  // ================= STORE SETTINGS =================
  async getStoreSettings(): Promise<StoreSettings> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('store_settings').select('*').eq('id', 'default').single();
        if (!error && data) {
          const mapped: StoreSettings = {
            businessName: data.business_name || 'ZAPLIX',
            tagline: data.tagline || 'Shop Smarter. Live Better.',
            supportingText: data.supporting_text || 'Pakistan\'s trusted online shopping destination. Free Home Delivery on all orders with Cash on Delivery nationwide.',
            location: data.location || 'Pakistan (Online Store)',
            googleMapsUrl: data.google_maps_url || '',
            phone1: data.phone1 || '03189869746',
            phone1Name: data.phone1_name || 'Customer Helpline',
            phone2: data.phone2 || '03189869746',
            phone2Name: data.phone2_name || 'WhatsApp Support',
            whatsappNumber: data.whatsapp_number || '03189869746',
            whatsappFloatingEnabled: data.whatsapp_floating_enabled !== false,
            whatsappProductButtonEnabled: data.whatsapp_product_button_enabled !== false,
            whatsappTemplate: data.whatsapp_template || 'Hello Zaplix Team!\n\nI would like to inquire about {product_name} (Price: {price}). Please confirm availability and delivery.',
            deliveryCharges: 0,
            businessHours: data.business_hours || 'Daily 9:00 AM - 11:00 PM',
            email: data.email || 'support@zaplix.pk',
            aboutText: data.about_text || 'ZAPLIX is Pakistan\'s premier multi-category online shopping brand.',
            logoUrl: data.logo_url || '/images/zaplix/zaplix-logo-full-light.svg',
            footerText: data.footer_text || '© 2026 ZAPLIX. All rights reserved. Shop Smarter. Live Better.',
            themePreset: (data.theme_preset as any) || 'clean-premium',
            currency: data.currency || 'PKR',
          };
          setLocal('settings', mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getStoreSettings error:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/settings`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.businessName) {
          setLocal('settings', data);
          return data;
        }
      }
    } catch {
      // fallback
    }

    return getLocal<StoreSettings>('settings', initialSettings);
  },

  async updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = await this.getStoreSettings();
    const updated = { ...current, ...settings, businessName: 'ZAPLIX' };

    if (isSupabaseConfigured()) {
      try {
        const supabase = await requireAdminClient();
        await supabase.from('store_settings').upsert({
          id: 'default',
          business_name: 'ZAPLIX',
          tagline: updated.tagline,
          supporting_text: updated.supportingText,
          location: updated.location,
          google_maps_url: updated.googleMapsUrl,
          phone1: updated.phone1,
          phone1_name: updated.phone1Name,
          phone2: updated.phone2,
          phone2_name: updated.phone2Name,
          whatsapp_number: updated.whatsappNumber,
          whatsapp_floating_enabled: updated.whatsappFloatingEnabled,
          whatsapp_product_button_enabled: updated.whatsappProductButtonEnabled,
          whatsapp_template: updated.whatsappTemplate,
          delivery_charges: updated.deliveryCharges,
          business_hours: updated.businessHours,
          email: updated.email,
          about_text: updated.aboutText,
          logo_url: updated.logoUrl,
          footer_text: updated.footerText,
          theme_preset: updated.themePreset,
          currency: updated.currency || 'PKR',
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase updateStoreSettings error, falling back to server/local store:', err);
      }
    }

    try {
      await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(updated),
      });
    } catch {
      // fallback
    }

    setLocal('settings', updated);
    return updated;
  },

  async getSettings(): Promise<StoreSettings> {
    return this.getStoreSettings();
  },

  async updateSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    return this.updateStoreSettings(settings);
  },

  // ================= HOMEPAGE CONFIG =================
  async getHomepageConfig(): Promise<HomepageConfig> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('homepage_config').select('config').eq('id', 'default').maybeSingle();
        if (!error && data?.config) {
          const merged: HomepageConfig = { ...initialHomepage, ...(data?.config || {}) };
          setLocal('homepage', merged);
          return merged;
        }
      } catch (err) {
        console.warn('Supabase getHomepageConfig exception:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/homepage`);
      if (res.ok) {
        const data = await res.json();
        if (data && (data.heroHeading || data.sections)) {
          const merged: HomepageConfig = { ...initialHomepage, ...data };
          setLocal('homepage', merged);
          return merged;
        }
      }
    } catch {
      // fallback
    }

    return getLocal<HomepageConfig>('homepage', initialHomepage);
  },

  async getHomepage(): Promise<HomepageConfig> {
    return this.getHomepageConfig();
  },

  async updateHomepageConfig(homepage: Partial<HomepageConfig>): Promise<HomepageConfig> {
    const current = await this.getHomepageConfig();
    const updated = { ...current, ...homepage };

    if (isSupabaseConfigured()) {
      try {
        const supabase = await requireAdminClient();
        await supabase.from('homepage_config').upsert({
          id: 'default',
          config: updated,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase updateHomepageConfig error, falling back to server/local store:', err);
      }
    }

    try {
      await fetch(`${API_BASE}/homepage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(updated),
      });
    } catch {
      // fallback
    }

    setLocal('homepage', updated);
    return updated;
  },

  async updateHomepage(homepage: Partial<HomepageConfig>): Promise<HomepageConfig> {
    return this.updateHomepageConfig(homepage);
  },

  // ================= INQUIRIES =================
  async getInquiries(): Promise<Inquiry[]> {
    try {
      const res = await fetch(`${API_BASE}/inquiries`, {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return getLocal<Inquiry[]>('inquiries', []);
  },

  async updateInquiryStatus(id: string, status: any): Promise<Inquiry> {
    const list = getLocal<Inquiry[]>('inquiries', []);
    const inq = list.find((i) => i.id === id);
    if (inq) {
      inq.status = status;
      setLocal('inquiries', list);
    }
    try {
      await fetch(`${API_BASE}/inquiries/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ status }),
      });
    } catch {
      // fallback
    }
    return inq || {
      id,
      customerName: '',
      customerPhone: '',
      productName: '',
      price: 0,
      quantity: 1,
      message: '',
      status: status || 'New',
      createdAt: new Date().toISOString()
    };
  },

  async deleteInquiry(id: string): Promise<void> {
    const list = getLocal<Inquiry[]>('inquiries', []);
    setLocal('inquiries', list.filter((i) => i.id !== id));
    try {
      await fetch(`${API_BASE}/inquiries/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
    } catch {
      // fallback
    }
  },

  // ================= CONTACT MESSAGES =================
  async submitContact(data: { name: string; phone: string; message: string }): Promise<{ success: boolean; whatsappUrl: string }> {
    const settings = await this.getStoreSettings();
    const waText = `Hello Zaplix Team, message from ${data.name} (${data.phone}): ${data.message}`;
    const waUrl = getWhatsAppUrl(waText);

    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      message: data.message,
      status: 'Unread',
      createdAt: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('contact_messages').insert([
        {
          id: newMsg.id,
          name: newMsg.name,
          phone: newMsg.phone,
          message: newMsg.message,
          status: newMsg.status,
          created_at: newMsg.createdAt,
        },
      ]);
    }

    const messages = getLocal<ContactMessage[]>('contact_messages', []);
    setLocal('contact_messages', [newMsg, ...messages]);
    return { success: true, whatsappUrl: waUrl };
  },

  async getContactMessages(): Promise<ContactMessage[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          const mapped: ContactMessage[] = data.map((d) => ({
            id: d.id,
            name: d.name,
            phone: d.phone,
            message: d.message,
            status: d.status as any,
            createdAt: d.created_at,
          }));
          setLocal('contact_messages', mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getContactMessages error:', err);
      }
    }
    return getLocal<ContactMessage[]>('contact_messages', []);
  },

  async deleteContactMessage(id: string): Promise<void> {
    const supabase = await requireAdminClient();
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) {
      throw new Error(`Could not delete message: ${explainDbError(error.message)}`);
    }
  },

  // ================= ADMIN STATS =================
  async getAdminStats(): Promise<AdminStats> {
    const prods = await this.getProducts();
    const orders = await this.getOrders();
    const offers = await this.getOffers(true);
    const cats = await this.getCategories();
    const msgs = await this.getContactMessages();

    const todayStr = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));
    const totalSales = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.totalAmount : 0), 0);
    const todaySales = todayOrders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.totalAmount : 0), 0);

    return {
      totalProducts: prods.length,
      inStock: prods.filter((p) => p.availability === 'In Stock').length,
      outOfStock: prods.filter((p) => p.availability === 'Out of Stock').length,
      featuredProducts: prods.filter((p) => p.featured).length,
      newArrivals: prods.filter((p) => p.isNewArrival).length,
      activeOffers: offers.filter((o) => o.isActive).length,
      totalCategories: cats.length,
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === 'Pending').length,
      totalSales,
      todaySales,
      totalInquiries: orders.length,
      newInquiries: orders.filter((o) => o.status === 'Pending').length,
      unreadMessages: msgs.filter((m) => m.status === 'Unread').length,
      recentOrders: orders.slice(0, 5),
      recentProducts: prods.slice(0, 5),
    };
  },

  // ================= AUTHENTICATION (Supabase Auth & Server/Local Fallback) =================
  async login(email: string, password: string): Promise<{ token: string; user: { username: string } }> {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // 1. If Supabase is configured, try Supabase first
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        });
        if (!error && data.session) {
          const token = data.session.access_token;
          const user = { username: data.user?.email || trimmedEmail };
          localStorage.setItem('zaplix_token', token);
          return { token, user };
        }
      } catch (err) {
        console.warn('Supabase auth attempt error:', err);
      }
    }

    // 2. Server Auth endpoint (/api/auth/login)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedEmail, password: trimmedPassword }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.token) {
          localStorage.setItem('zaplix_token', json.token);
          return {
            token: json.token,
            user: json.user || { username: trimmedEmail },
          };
        }
      }
    } catch (e) {
      console.warn('Server auth request error:', e);
    }

    // 3. Built-in store fallback validation
    const validAdmins = ['admin', 'admin@zaplix.pk', 'admin@zyvara.pk', 'owner@zaplix.pk'];
    if (validAdmins.includes(trimmedEmail.toLowerCase()) && trimmedPassword === 'admin123') {
      const token = 'zaplix_token_session_' + Date.now();
      localStorage.setItem('zaplix_token', token);
      return {
        token,
        user: { username: 'admin@zaplix.pk' },
      };
    }

    throw new Error('Invalid credentials. Admin Email: admin@zaplix.pk (or admin) | Password: admin123');
  },

  async logout(): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    localStorage.removeItem('zaplix_token');
    localStorage.removeItem('zyvara_token');
  },

  async changePassword(currentPass: string, newPass: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const client = await requireAdminClient();
        const { data: userData } = await client.auth.getUser();
        const email = userData.user?.email;
        if (email) {
          const { error } = await client.auth.updateUser({ password: newPass });
          if (!error) return true;
        }
      } catch {
        // fallback to server
      }
    }

    try {
      const token = localStorage.getItem('zaplix_token');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      });
      return res.ok;
    } catch {
      return true;
    }
  },

  async checkAuth(): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) return true;
      } catch {
        // ignore
      }
    }
    const token = localStorage.getItem('zaplix_token');
    return Boolean(token);
  },

  async getSessionEmail(): Promise<string | null> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user?.email) return data.session.user.email;
      } catch {
        // ignore
      }
    }
    const token = localStorage.getItem('zaplix_token');
    if (token) {
      return 'admin@zaplix.pk';
    }
    return null;
  },

  // ================= MEDIA LIBRARY (Supabase / Local) =================
  async getMedia(): Promise<MediaItem[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('media_library').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          const mapped: MediaItem[] = data.map((m) => ({
            id: m.id,
            title: m.title,
            url: m.url,
            category: m.category as any,
            createdAt: m.created_at,
          }));
          setLocal('media', mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getMedia error:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/media`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocal('media', data);
          return data;
        }
      }
    } catch {
      // fallback
    }

    return getLocal<MediaItem[]>('media', []);
  },

  async uploadMedia(data: { title: string; url: string; category?: string }): Promise<MediaItem> {
    const newItem: MediaItem = {
      id: `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: data.title,
      url: data.url,
      category: (data.category as any) || 'product',
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = await requireAdminClient();
        const { error } = await supabase.from('media_library').insert([
          {
            id: newItem.id,
            title: newItem.title,
            url: newItem.url,
            category: newItem.category,
            created_at: newItem.createdAt,
          },
        ]);
        if (!error) {
          const current = getLocal<MediaItem[]>('media', []);
          setLocal('media', [newItem, ...current]);
          return newItem;
        }
      } catch (err) {
        console.warn('Supabase uploadMedia error, falling back to server/local store:', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        const saved = await res.json();
        const current = getLocal<MediaItem[]>('media', []);
        setLocal('media', [saved, ...current]);
        return saved;
      }
    } catch {
      // fallback
    }

    const current = getLocal<MediaItem[]>('media', []);
    setLocal('media', [newItem, ...current]);
    return newItem;
  },

  async deleteMedia(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = await requireAdminClient();
        const { error } = await supabase.from('media_library').delete().eq('id', id);
        if (!error) {
          const current = getLocal<MediaItem[]>('media', []);
          setLocal('media', current.filter((m) => m.id !== id));
          return;
        }
      } catch (err) {
        console.warn('Supabase deleteMedia error, falling back to server/local store:', err);
      }
    }

    try {
      await fetch(`${API_BASE}/media/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
    } catch {
      // fallback
    }

    const current = getLocal<MediaItem[]>('media', []);
    setLocal('media', current.filter((m) => m.id !== id));
  },
};
