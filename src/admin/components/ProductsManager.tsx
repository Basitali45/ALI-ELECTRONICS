import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Copy,
  Check,
  X,
  Sparkles,
  AlertTriangle,
  Upload,
  Tag,
  Image as ImageIcon
} from 'lucide-react';
import { Product, Category, ProductBadge } from '../../types';
import { api } from '../../services/api';

interface ProductsManagerProps {
  products: Product[];
  categories: Category[];
  onRefresh: () => void;
  showToast: (msg: string) => void;
}

export function ProductsManager({ products, categories, onRefresh, showToast }: ProductsManagerProps) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: '',
    brand: 'Generic Tech',
    sku: '',
    stock: '15',
    price: '',
    oldPrice: '',
    discount: '',
    badge: '' as ProductBadge,
    image: '',
    additionalImages: [] as string[],
    shortDescription: '',
    description: '',
    specifications: [''],
    availability: 'In Stock' as 'In Stock' | 'Limited Stock' | 'Out of Stock',
    featured: false,
    isNewArrival: false,
    showOnHomepage: true,
    whatsappEnabled: true,
    displayOrder: 1,
  });

  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);

  const filtered = products.filter(p => {
    if (selectedCat!== 'all' && p.category.toLowerCase()!== selectedCat.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q)) || (p.sku && p.sku.toLowerCase().includes(q));
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      category: categories[0]?.name || 'Mobile Accessories',
      brand: 'Generic Tech',
      sku: `AE-${Math.floor(1000 + Math.random() * 9000)}`,
      stock: '15',
      price: '',
      oldPrice: '',
      discount: '',
      badge: '',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      additionalImages: [],
      shortDescription: '',
      description: '',
      specifications: ['High quality build', 'Fast performance'],
      availability: 'In Stock',
      featured: false,
      isNewArrival: false,
      showOnHomepage: true,
      whatsappEnabled: true,
      displayOrder: products.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      category: p.category,
      brand: p.brand || 'Generic Tech',
      sku: p.sku || `AE-${p.id.slice(-4)}`,
      stock: String(p.stock?? 10),
      price: String(p.price),
      oldPrice: p.oldPrice? String(p.oldPrice) : '',
      discount: p.discount || '',
      badge: p.badge || '',
      image: p.image,
      additionalImages: p.additionalImages || [],
      shortDescription: p.shortDescription || '',
      description: p.description,
      specifications: p.specifications && p.specifications.length? [...p.specifications] : [''],
      availability: p.availability,
      featured: p.featured,
      isNewArrival: Boolean(p.isNewArrival),
      showOnHomepage: p.showOnHomepage!== false,
      whatsappEnabled: p.whatsappEnabled!== false,
      displayOrder: p.displayOrder || 1,
    });
    setIsModalOpen(true);
  };

  // FINAL FIXED SAVE FUNCTION
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return showToast('Product name is required');
    const priceNum = Number(form.price);
    if (isNaN(priceNum) || priceNum <= 0) return showToast('Valid price in PKR is required');

    const finalShortDesc = form.shortDescription.trim() || form.name.trim() + ' - High quality product from Ali Electronics';
    const finalDesc = form.description.trim() || finalShortDesc;
    const finalBrand = form.brand.trim() || 'Generic Tech';
    const finalSku = form.sku.trim() || `AE-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalCategory = form.category || categories[0]?.name || 'General';
    const finalImage = form.image.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30';
    const finalSlug = form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString().slice(-4);

    try {
      const payload: any = {
        name: form.name.trim(),
        slug: finalSlug,
        category: finalCategory,
        brand: finalBrand,
        sku: finalSku,
        stock: Number(form.stock) || 10,
        price: priceNum,
        oldPrice: form.oldPrice? Number(form.oldPrice) : undefined,
        old_price: form.oldPrice? Number(form.oldPrice) : null,
        discount: form.discount.trim() || undefined,
        badge: form.badge || undefined,
        image: finalImage,
        additionalImages: form.additionalImages.filter(Boolean),
        additional_images: form.additionalImages.filter(Boolean),
        shortDescription: finalShortDesc,
        short_description: finalShortDesc,
        description: finalDesc,
        specifications: form.specifications.filter(s => s.trim()!== ''),
        availability: form.availability,
        featured: form.featured,
        isNewArrival: form.isNewArrival,
        is_new_arrival: form.isNewArrival,
        showOnHomepage: form.showOnHomepage,
        show_on_homepage: form.showOnHomepage,
        whatsappEnabled: form.whatsappEnabled,
        whatsapp_enabled: form.whatsappEnabled,
        displayOrder: Number(form.displayOrder) || 1,
        display_order: Number(form.displayOrder) || 1,
        active: true,
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        showToast('Product updated successfully!');
      } else {
        await api.createProduct(payload);
        showToast('Product saved permanently!');
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error saving product');
    }
  };

  const handleSaveInlinePrice = async (id: string) => {
    const val = Number(editingPriceValue);
    if (isNaN(val) || val <= 0) {
      showToast('Enter a valid price');
      return;
    }
    try
