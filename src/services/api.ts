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
import { initialProducts, initialCategories, initialOffers, initialSettings, initialHomepage } from './seedData';
import { getSupabase, isSupabaseConfigured, uploadProductImageToStorage } from '../lib/supabase';

const API_BASE = '/api';

// Local storage fallback helpers for resilience
function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`ali_electronic_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`ali_electronic_${key}`, JSON.stringify(data));
  } catch {
    // quota exceeded or private mode
  }
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('ali_electronic_token');
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

// Convert client Product to Supabase DB record
function mapClientProductToDb(prod: Partial<Product>): Record<string, any> {
  const db: Record<string, any> = {};
  if (prod.name !== undefined) db.name = prod.name;
  if (prod.slug !== undefined) db.slug = prod.slug;
  if (prod.category !== undefined) db.category = prod.category;
  if (prod.categoryId !== undefined) db.category_id = prod.categoryId;
  if (prod.brand !== undefined) db.brand = prod.brand;
  if (prod.sku !== undefined) db.sku = prod.sku;
  if (prod.price !== undefined) db.price = Number(prod.price);
  if (prod.oldPrice !== undefined) db.old_price = prod.oldPrice ? Number(prod.oldPrice) : null;
  if (prod.discount !== undefined) db.discount = prod.discount;
  if (prod.badge !== undefined) db.badge = prod.badge;
  if (prod.stock !== undefined) db.stock = Number(prod.stock);
  if (prod.availability !== undefined) db.availability = prod.availability;
  if (prod.image !== undefined) db.image = prod.image;
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
        let query = supabase.from('products').select('*').eq('active', true);

        if (params?.category && params.category !== 'All') {
          query = query.eq('category', params.category);
        }
        if (params?.featured) {
          query = query.eq('featured', true);
        }
        if (params?.availability && params.availability !== 'all') {
          query = query.eq('availability', params.availability);
        }

        query = query.order('display_order', { ascending: true });

        const { data, error } = await query;
        if (!error && data) {
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
          if (mapped.length > 0 || isSupabaseConfigured()) {
            setLocal('products', mapped);
            return mapped;
          }
        }
      } catch (err) {
        console.warn('Supabase getProducts error, checking local store:', err);
      }
    }

    // Server or fallback
    let list = getLocal<Product[]>('products', initialProducts);
    if (params?.category && params.category !== 'All') {
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
    if (params?.availability && params.availability !== 'all') {
      list = list.filter((p) => p.availability === params.availability);
    }
    return list;
  },

  async addProduct(prod: Partial<Product>): Promise<Product> {
    const supabase = getSupabase();
    const clientProd: Product = {
      id: prod.id || `p-${Date.now()}`,
      name: prod.name || 'New Product',
      slug: prod.slug || prod.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `p-${Date.now()}`,
      category: prod.category || 'Mobile Accessories',
      brand: prod.brand || 'Generic / Tech Pro',
      sku: prod.sku || `AE-${Math.floor(1000 + Math.random() * 9000)}`,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (supabase) {
      const dbRecord = mapClientProductToDb(clientProd);
      dbRecord.id = clientProd.id;
      dbRecord.created_at = clientProd.createdAt;

      const { data, error } = await supabase.from('products').insert([dbRecord]).select().single();
      if (error) {
        throw new Error(`Failed to save product in Supabase: ${error.message}`);
      }
      if (data) {
        const saved = mapDbProductToClient(data);
        const current = getLocal<Product[]>('products', initialProducts);
        setLocal('products', [saved, ...current.filter((p) => p.id !== saved.id)]);
        return saved;
      }
    }

    // Local / fallback
    const products = getLocal<Product[]>('products', initialProducts);
    const updated = [clientProd, ...products];
    setLocal('products', updated);
    return clientProd;
  },

  async updateProduct(id: string, prod: Partial<Product>): Promise<Product> {
    const supabase = getSupabase();

    if (supabase) {
      const dbUpdates = mapClientProductToDb(prod);
      const { data, error } = await supabase.from('products').update(dbUpdates).eq('id', id).select().single();
      if (error) {
        throw new Error(`Failed to update product in Supabase: ${error.message}`);
      }
      if (data) {
        const saved = mapDbProductToClient(data);
        const current = getLocal<Product[]>('products', initialProducts);
        setLocal('products', current.map((p) => (p.id === id ? saved : p)));
        return saved;
      }
    }

    const products = getLocal<Product[]>('products', initialProducts);
    const updated = products.map((p) => (p.id === id ? { ...p, ...prod, updatedAt: new Date().toISOString() } : p));
    setLocal('products', updated);
    const found = updated.find((p) => p.id === id);
    if (!found) throw new Error('Product not found');
    return found;
  },

  async deleteProduct(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.warn('Supabase delete error:', error.message);
      }
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
      id: `p-${Date.now()}`,
      sku: `AE-${Math.floor(1000 + Math.random() * 9000)}`,
      name: `${existing.name} (Copy)`,
    };
    return this.addProduct(clone);
  },

  async bulkProductAction(action: string, ids: string[], payload?: any): Promise<void> {
    const supabase = getSupabase();
    if (action === 'delete') {
      if (supabase) {
        await supabase.from('products').delete().in('id', ids);
      }
      const products = getLocal<Product[]>('products', initialProducts);
      setLocal('products', products.filter((p) => !ids.includes(p.id)));
    } else if (action === 'availability' && payload) {
      if (supabase) {
        await supabase.from('products').update({ availability: payload }).in('id', ids);
      }
      const products = getLocal<Product[]>('products', initialProducts);
      setLocal('products', products.map((p) => (ids.includes(p.id) ? { ...p, availability: payload } : p)));
    } else if (action === 'featured') {
      const isFeat = payload ?? true;
      if (supabase) {
        await supabase.from('products').update({ featured: isFeat }).in('id', ids);
      }
      const products = getLocal<Product[]>('products', initialProducts);
      setLocal('products', products.map((p) => (ids.includes(p.id) ? { ...p, featured: isFeat } : p)));
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
    return getLocal<Category[]>('categories', initialCategories);
  },

  async addCategory(cat: Partial<Category>): Promise<Category> {
    const newCat: Category = {
      id: cat.id || `cat-${Date.now()}`,
      name: cat.name || 'New Category',
      slug: cat.slug || cat.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `cat-${Date.now()}`,
      description: cat.description || '',
      image: cat.image || '',
      icon: cat.icon || '',
      order: cat.order || 99,
      isVisible: cat.isVisible !== false,
      active: true,
    };

    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('categories').insert([
        {
          id: newCat.id,
          name: newCat.name,
          slug: newCat.slug,
          description: newCat.description,
          image_url: newCat.image,
          icon: newCat.icon,
          display_order: newCat.order,
          active: true,
        },
      ]);
    }

    const categories = getLocal<Category[]>('categories', initialCategories);
    const updated = [...categories, newCat];
    setLocal('categories', updated);
    return newCat;
  },

  async updateCategory(id: string, cat: Partial<Category>): Promise<Category> {
    const supabase = getSupabase();
    if (supabase) {
      await supabase
        .from('categories')
        .update({
          name: cat.name,
          description: cat.description,
          image_url: cat.image,
          icon: cat.icon,
          display_order: cat.order,
          active: cat.isVisible !== false,
        })
        .eq('id', id);
    }

    const categories = getLocal<Category[]>('categories', initialCategories);
    const updated = categories.map((c) => (c.id === id ? { ...c, ...cat } : c));
    setLocal('categories', updated);
    const found = updated.find((c) => c.id === id);
    if (!found) throw new Error('Category not found');
    return found;
  },

  async deleteCategory(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('categories').delete().eq('id', id);
    }
    const categories = getLocal<Category[]>('categories', initialCategories);
    setLocal('categories', categories.filter((c) => c.id !== id));
  },

  // ================= OFFERS =================
  async getOffers(): Promise<Offer[]> {
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('offers').select('*').eq('is_active', true);
        if (!error && data) {
          if (data.length > 0 || isSupabaseConfigured()) {
            const mapped: Offer[] = data.map((o) => ({
              id: o.id,
              title: o.title,
              description: o.description,
              discountType: o.discount_type as any,
              discountValue: Number(o.discount_value) || 0,
              bannerImage: o.banner_image,
              buttonText: o.button_text,
              buttonLink: o.button_link,
              isActive: o.is_active,
              displayLocation: o.display_location as any,
              productIds: Array.isArray(o.product_ids) ? o.product_ids : [],
              createdAt: o.created_at,
            }));
            setLocal('offers', mapped);
            return mapped;
          }
        }
      } catch (err) {
        console.warn('Supabase getOffers error:', err);
      }
    }
    return getLocal<Offer[]>('offers', initialOffers);
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
      isActive: offer.isActive !== false,
      displayLocation: offer.displayLocation || 'banner',
      productIds: offer.productIds || [],
      createdAt: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('offers').insert([
        {
          id: newOffer.id,
          title: newOffer.title,
          description: newOffer.description,
          discount_type: newOffer.discountType,
          discount_value: newOffer.discountValue,
          banner_image: newOffer.bannerImage,
          button_text: newOffer.buttonText,
          button_link: newOffer.buttonLink,
          is_active: newOffer.isActive,
          display_location: newOffer.displayLocation,
          product_ids: newOffer.productIds,
        },
      ]);
    }

    const offers = getLocal<Offer[]>('offers', initialOffers);
    const updated = [...offers, newOffer];
    setLocal('offers', updated);
    return newOffer;
  },

  async updateOffer(id: string, offer: Partial<Offer>): Promise<Offer> {
    const supabase = getSupabase();
    if (supabase) {
      await supabase
        .from('offers')
        .update({
          title: offer.title,
          description: offer.description,
          discount_type: offer.discountType,
          discount_value: offer.discountValue,
          banner_image: offer.bannerImage,
          button_text: offer.buttonText,
          button_link: offer.buttonLink,
          is_active: offer.isActive,
          display_location: offer.displayLocation,
        })
        .eq('id', id);
    }

    const offers = getLocal<Offer[]>('offers', initialOffers);
    const updated = offers.map((o) => (o.id === id ? { ...o, ...offer } : o));
    setLocal('offers', updated);
    const found = updated.find((o) => o.id === id);
    if (!found) throw new Error('Offer not found');
    return found;
  },

  async deleteOffer(id: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('offers').delete().eq('id', id);
    }
    const offers = getLocal<Offer[]>('offers', initialOffers);
    setLocal('offers', offers.filter((o) => o.id !== id));
  },

  async createOffer(offer: Partial<Offer>): Promise<Offer> {
    return this.addOffer(offer);
  },

  async toggleOffer(id: string): Promise<Offer> {
    const offers = await this.getOffers();
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
    const cleanAdminPhone = (settings.whatsappNumber || '03115321647')
      .replace(/^0/, '92')
      .replace(/[^0-9]/g, '');

    const orderNumber = `AE-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const deliveryCharges = settings.deliveryCharges || 0;
    const totalAmount = subtotal + deliveryCharges;
    const orderId = `ord-${Date.now()}`;

    const orderItems: OrderItem[] = items.map((item, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      orderId,
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.image,
      sku: item.product.sku || `AE-${item.product.id.substring(0, 6)}`,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerWhatsapp: orderData.customerWhatsapp || orderData.customerPhone,
      customerEmail: orderData.customerEmail,
      customerAddress: orderData.customerAddress,
      city: orderData.city || 'Hassan Abdal',
      notes: orderData.notes,
      subtotal,
      deliveryCharges,
      discount: 0,
      totalAmount,
      status: 'Pending',
      paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
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
            delivery_charges: newOrder.deliveryCharges,
            discount: newOrder.discount,
            total_amount: newOrder.totalAmount,
            status: newOrder.status,
            payment_method: newOrder.paymentMethod,
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

    // Save locally
    const orders = getLocal<Order[]>('orders', []);
    setLocal('orders', [newOrder, ...orders]);

    // 2. CONSTRUCT STRUCTURED WHATSAPP ORDER MESSAGE WITH PERMANENT IMAGE URLS
    let message = `*NEW ORDER — ALI ELECTRONIC*\n`;
    message += `Order ID: #${orderNumber}\n`;
    message += `Date: ${new Date().toLocaleDateString('en-PK')}\n\n`;
    message += `*--- CUSTOMER DETAILS ---*\n`;
    message += `Name: ${newOrder.customerName}\n`;
    message += `Phone: ${newOrder.customerPhone}\n`;
    if (newOrder.customerWhatsapp && newOrder.customerWhatsapp !== newOrder.customerPhone) {
      message += `WhatsApp: ${newOrder.customerWhatsapp}\n`;
    }
    message += `Address: ${newOrder.customerAddress}, ${newOrder.city}\n`;
    if (newOrder.notes) {
      message += `Notes: ${newOrder.notes}\n`;
    }
    message += `\n*--- ORDER ITEMS ---*\n`;

    items.forEach((item, index) => {
      message += `\n${index + 1}. *${item.product.name}*\n`;
      if (item.product.sku) message += `   SKU: ${item.product.sku}\n`;
      message += `   Qty: ${item.quantity} x Rs. ${item.product.price.toLocaleString()}\n`;
      message += `   Subtotal: Rs. ${(item.product.price * item.quantity).toLocaleString()}\n`;
      if (item.product.image) {
        message += `   Product Image: ${item.product.image}\n`;
      }
    });

    message += `\n*--- PAYMENT SUMMARY ---*\n`;
    message += `Subtotal: Rs. ${subtotal.toLocaleString()}\n`;
    message += `Delivery: ${deliveryCharges > 0 ? `Rs. ${deliveryCharges.toLocaleString()}` : 'FREE (Hassan Abdal)'}\n`;
    message += `*Grand Total: Rs. ${totalAmount.toLocaleString()}*\n`;
    message += `Payment Method: ${newOrder.paymentMethod}\n\n`;
    message += `Please confirm my order. Thank you!`;

    const whatsappUrl = `https://wa.me/${cleanAdminPhone}?text=${encodeURIComponent(message)}`;

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
              city: row.city || 'Hassan Abdal',
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

    return getLocal<Order[]>('orders', []);
  },

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('orders').update({ status }).eq('id', orderId);
    }
    const orders = getLocal<Order[]>('orders', []);
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    setLocal('orders', updated);
    const found = updated.find((o) => o.id === orderId);
    if (!found) throw new Error('Order not found');
    return found;
  },

  async deleteOrder(orderId: string): Promise<void> {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('orders').delete().eq('id', orderId);
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
            businessName: data.business_name || 'Ali Electronic',
            tagline: data.tagline || 'Smart Technology. Better Living.',
            supportingText: data.supporting_text || 'Premium electronics, competitive prices and trusted service in Hassan Abdal.',
            location: data.location || 'Main Bus Stop, Islam Shaheed Road, Opposite New Sethi Flour Mills, Hassan Abdal, Pakistan',
            googleMapsUrl: data.google_maps_url || 'https://maps.google.com/?q=Main+Bus+Stop+Islam+Shaheed+Road+Hassan+Abdal+Pakistan',
            phone1: data.phone1 || '03115321647',
            phone1Name: data.phone1_name || 'Arbaz Ahmed',
            phone2: data.phone2 || '03133332141',
            phone2Name: data.phone2_name || 'Faraz Ahmed',
            whatsappNumber: data.whatsapp_number || '03115321647',
            whatsappFloatingEnabled: data.whatsapp_floating_enabled !== false,
            whatsappProductButtonEnabled: data.whatsapp_product_button_enabled !== false,
            whatsappTemplate: data.whatsapp_template || 'Assalam-o-Alaikum Ali Electronic, I am interested in {product_name}. Current price is {price}. Please confirm availability.',
            deliveryCharges: Number(data.delivery_charges) || 0,
            businessHours: data.business_hours || 'Mon - Sat: 9:00 AM - 9:00 PM',
            email: data.email || 'contact@alielectronic.pk',
            aboutText: data.about_text || 'Ali Electronic is your trusted electronics store in Hassan Abdal.',
            logoUrl: data.logo_url || '',
            footerText: data.footer_text || '© 2026 Ali Electronic. All Rights Reserved. Hassan Abdal, Pakistan.',
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
    return getLocal<StoreSettings>('settings', initialSettings);
  },

  async updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = await this.getStoreSettings();
    const updated = { ...current, ...settings, businessName: 'Ali Electronic' };

    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('store_settings').upsert({
        id: 'default',
        business_name: 'Ali Electronic',
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
    return getLocal<HomepageConfig>('homepage', initialHomepage);
  },

  async getHomepage(): Promise<HomepageConfig> {
    return this.getHomepageConfig();
  },

  async updateHomepageConfig(homepage: Partial<HomepageConfig>): Promise<HomepageConfig> {
    const current = getLocal<HomepageConfig>('homepage', initialHomepage);
    const updated = { ...current, ...homepage };
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
    const cleanPhone = (settings.whatsappNumber || '03115321647').replace(/^0/, '92').replace(/[^0-9]/g, '');
    const waText = `Assalam-o-Alaikum Ali Electronic, Message from ${data.name} (${data.phone}): ${data.message}`;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`;

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
        const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
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
    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('contact_messages').delete().eq('id', id);
    }
    const messages = getLocal<ContactMessage[]>('contact_messages', []);
    setLocal('contact_messages', messages.filter((m) => m.id !== id));
  },

  // ================= ADMIN STATS =================
  async getAdminStats(): Promise<AdminStats> {
    const prods = await this.getProducts();
    const orders = await this.getOrders();
    const offers = await this.getOffers();
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
      totalCategories: 6,
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

  // ================= AUTHENTICATION =================
  async login(username: string, password: string): Promise<{ token: string; user: { username: string } }> {
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    // 1. Check Supabase Auth if username is an email
    const supabase = getSupabase();
    if (supabase && trimmedUser.includes('@')) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: trimmedUser,
          password: trimmedPass,
        });
        if (!authError && authData.session) {
          localStorage.setItem('ali_electronic_token', authData.session.access_token);
          return {
            token: authData.session.access_token,
            user: { username: authData.user?.email || trimmedUser },
          };
        }
      } catch (sbErr) {
        console.warn('Supabase auth attempt notice:', sbErr);
      }
    }

    // 2. Server API authentication
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUser, password: trimmedPass }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('ali_electronic_token', data.token);
        return data;
      }
    } catch {
      // static host fallback
    }

    // 3. Built-in Admin Credentials fallback for store management
    if (
      (trimmedUser === 'admin' && trimmedPass === 'admin123') ||
      (trimmedUser === 'alitech' && trimmedPass === 'hassanabdal') ||
      (trimmedUser === 'arbaz' && trimmedPass === 'admin123')
    ) {
      const token = `static-admin-token-${Date.now()}`;
      localStorage.setItem('ali_electronic_token', token);
      return { token, user: { username: trimmedUser } };
    }

    throw new Error('Invalid credentials. Default username is "admin" and password is "admin123", or use your Supabase admin email.');
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
    localStorage.removeItem('ali_electronic_token');
    localStorage.removeItem('ali_electronics_token');
  },

  async changePassword(currentPass: string, newPass: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      });
      if (res.ok) return true;
    } catch {
      // offline
    }
    return true;
  },

  async checkAuth(): Promise<boolean> {
    const token = localStorage.getItem('ali_electronic_token') || localStorage.getItem('ali_electronics_token');
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE}/auth/verify`, {
        headers: getAuthHeader(),
      });
      if (res.ok) return true;
    } catch {
      // offline / static host
    }
    return Boolean(token);
  },

  // Media Library
  async getMedia(): Promise<MediaItem[]> {
    return getLocal<MediaItem[]>('media', []);
  },

  async uploadMedia(data: { title: string; url: string; category?: string }): Promise<MediaItem> {
    const media = getLocal<MediaItem[]>('media', []);
    const newItem: MediaItem = {
      id: `m-${Date.now()}`,
      title: data.title,
      url: data.url,
      category: (data.category as any) || 'product',
      createdAt: new Date().toISOString(),
    };
    setLocal('media', [newItem, ...media]);
    return newItem;
  },

  async deleteMedia(id: string): Promise<void> {
    const media = getLocal<MediaItem[]>('media', []);
    setLocal('media', media.filter((m) => m.id !== id));
  },
};
