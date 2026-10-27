'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { extractStoragePath } from '@/lib/storageUtils';
import ImageUploadField from './ImageUploadField';

interface AdminVariant {
  id?: number;
  label: string;
  price: string;
  discount_percent: string;
}

interface AdminColor {
  id?: number;
  color_name: string;
}

interface AdminProduct {
  id: number;
  title: string;
  category_id: number | null;
  category_name?: string;
  description: string | null;
  img_url: string | null;
  images: string[] | null;
  badge: string | null;
  active: boolean;
  is_new: boolean;
  variants?: AdminVariant[];
  colors?: AdminColor[];
  stockMap?: Record<string, number>;
}

interface FormState {
  title: string;
  category_id: string;
  description: string;
  images: string[];
  badge: string;
  active: boolean;
  is_new: boolean;
  variants: AdminVariant[];
  colors: AdminColor[];
  stockMatrix: Record<string, string>;
}

const emptyForm: FormState = {
  title: '',
  category_id: '',
  description: '',
  images: [],
  badge: '',
  active: true,
  is_new: false,
  variants: [],
  colors: [],
  stockMatrix: {},
};

export default function ProductsManager() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories ( name ),
        product_variants (
          id,
          label,
          price,
          discount_percent,
          variant_color_stock ( color_id, stock )
        ),
        product_colors ( id, color_name )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al cargar productos:', error.message || error);
      setLoading(false);
      return;
    }

    if (data) {
      const mappedProducts: AdminProduct[] = data.map((p: any) => {
        const stockMap: Record<string, number> = {};
        (p.product_variants || []).forEach((v: any) => {
          (v.variant_color_stock || []).forEach((vcs: any) => {
            stockMap[`${v.id}-${vcs.color_id}`] = vcs.stock;
          });
        });

        return {
          ...p,
          category_name: p.categories?.name || 'Sin categoría',
          variants: (p.product_variants || []).map((v: any) => ({
            id: v.id,
            label: v.label,
            price: String(v.price),
            discount_percent: String(v.discount_percent ?? 0),
          })),
          colors: (p.product_colors || []).map((c: any) => ({
            id: c.id,
            color_name: c.color_name,
          })),
          stockMap,
        };
      });
      setProducts(mappedProducts);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('id, name').order('name', { ascending: true });
    if (!error && data) setCategories(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      variants: [{ label: 'Único', price: '5000', discount_percent: '0' }],
      colors: [{ color_name: 'Estándar' }],
      stockMatrix: { '0-0': '10' },
    });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (p: AdminProduct) => {
    setEditingId(p.id);

    const initialImages = p.images && p.images.length > 0 ? p.images : p.img_url ? [p.img_url] : [];
    const variants =
      p.variants && p.variants.length > 0
        ? p.variants
        : [{ label: 'Único', price: '0', discount_percent: '0' }];
    const colors = p.colors && p.colors.length > 0 ? p.colors : [{ color_name: 'Estándar' }];

    const stockMatrix: Record<string, string> = {};
    variants.forEach((v, vIdx) => {
      colors.forEach((c, cIdx) => {
        const key = v.id != null && c.id != null ? `${v.id}-${c.id}` : undefined;
        const stock = key ? p.stockMap?.[key] : undefined;
        stockMatrix[`${vIdx}-${cIdx}`] = stock != null ? String(stock) : '0';
      });
    });

    setForm({
      title: p.title,
      category_id: p.category_id ? String(p.category_id) : '',
      description: p.description ?? '',
      images: initialImages,
      badge: p.badge ?? '',
      active: p.active,
      is_new: p.is_new,
      variants,
      colors,
      stockMatrix,
    });
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // ---------- Variantes de Label / Precio ----------
  const updateVariant = (idx: number, patch: Partial<AdminVariant>) => {
    const updated = [...form.variants];
    updated[idx] = { ...updated[idx], ...patch };
    setForm({ ...form, variants: updated });
  };

  const addVariant = () => {
    const newIdx = form.variants.length;
    const newStockMatrix = { ...form.stockMatrix };
    form.colors.forEach((_, cIdx) => {
      newStockMatrix[`${newIdx}-${cIdx}`] = '0';
    });
    setForm({
      ...form,
      variants: [...form.variants, { label: '', price: '', discount_percent: '0' }],
      stockMatrix: newStockMatrix,
    });
  };

  const removeVariant = (idx: number) => {
    const newVariants = form.variants.filter((_, i) => i !== idx);
    const newStockMatrix: Record<string, string> = {};
    Object.entries(form.stockMatrix).forEach(([key, val]) => {
      const [vIdxStr, cIdxStr] = key.split('-');
      const vIdx = parseInt(vIdxStr, 10);
      if (vIdx === idx) return;
      const newVIdx = vIdx > idx ? vIdx - 1 : vIdx;
      newStockMatrix[`${newVIdx}-${cIdxStr}`] = val ?? '0';
    });
    setForm({ ...form, variants: newVariants, stockMatrix: newStockMatrix });
  };

  const calculateFinalPrice = (priceStr: string, discountStr: string) => {
    const price = parseFloat(priceStr) || 0;
    const discount = parseFloat(discountStr) || 0;
    if (price <= 0) return 0;
    if (discount <= 0) return price;
    return Math.round(price - price * (discount / 100));
  };

  // ---------- Colores ----------
  const updateColor = (idx: number, patch: Partial<AdminColor>) => {
    const updated = [...form.colors];
    updated[idx] = { ...updated[idx], ...patch };
    setForm({ ...form, colors: updated });
  };

  const addColor = () => {
    const newIdx = form.colors.length;
    const newStockMatrix = { ...form.stockMatrix };
    form.variants.forEach((_, vIdx) => {
      newStockMatrix[`${vIdx}-${newIdx}`] = '0';
    });
    setForm({
      ...form,
      colors: [...form.colors, { color_name: '' }],
      stockMatrix: newStockMatrix,
    });
  };

  const removeColor = (idx: number) => {
    const newColors = form.colors.filter((_, i) => i !== idx);
    const newStockMatrix: Record<string, string> = {};
    Object.entries(form.stockMatrix).forEach(([key, val]) => {
      const [vIdxStr, cIdxStr] = key.split('-');
      const cIdx = parseInt(cIdxStr, 10);
      if (cIdx === idx) return;
      const newCIdx = cIdx > idx ? cIdx - 1 : cIdx;
      newStockMatrix[`${vIdxStr}-${newCIdx}`] = val ?? '0';
    });
    setForm({ ...form, colors: newColors, stockMatrix: newStockMatrix });
  };

  // ---------- Matriz de Stock ----------
  const updateStock = (vIdx: number, cIdx: number, value: string) => {
    setForm({ ...form, stockMatrix: { ...form.stockMatrix, [`${vIdx}-${cIdx}`]: value } });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const categoryIdNum = form.category_id ? parseInt(form.category_id, 10) : null;

    if (!form.title.trim() || !categoryIdNum) {
      setFormError('Completa el título y selecciona una categoría.');
      return;
    }
    if (form.variants.length === 0 || form.variants.some((v) => !v.label.trim() || v.price === '')) {
      setFormError('Agrega al menos una opción de variante con precio.');
      return;
    }
    if (form.colors.length === 0 || form.colors.some((c) => !c.color_name.trim())) {
      setFormError('Agrega al menos un color con nombre.');
      return;
    }

    setSaving(true);
    setFormError(null);

    const mainImageUrl = form.images.length > 0 ? form.images[0] : null;

    const productPayload = {
      title: form.title.trim(),
      category_id: categoryIdNum,
      description: form.description.trim() || null,
      img_url: mainImageUrl,
      images: form.images,
      badge: form.badge.trim() || null,
      active: form.active,
      is_new: form.is_new,
    };

    const sanitizedStockMatrix: Record<string, string> = {};
    form.variants.forEach((_, vIdx) => {
      form.colors.forEach((_, cIdx) => {
        const key = `${vIdx}-${cIdx}`;
        const val = form.stockMatrix[key];
        sanitizedStockMatrix[key] = (val === undefined || val === null || val === '') ? '0' : String(val);
      });
    });

    const { error: rpcError } = await supabase.rpc('save_product_transactional', {
      p_product_id: editingId,
      p_product_data: productPayload,
      p_variants: form.variants,
      p_colors: form.colors,
      p_stock_matrix: sanitizedStockMatrix,
    });

    setSaving(false);

    if (rpcError) {
      setFormError(`Error al guardar el producto: ${rpcError.message}`);
      return;
    }

    closeModal();
    fetchProducts();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este producto? Esto también borrará sus imágenes.')) return;

    const product = products.find((p) => p.id === id);
    const paths = (product?.images || [])
      .map((url) => extractStoragePath(url, 'product-images'))
      .filter((p): p is string => Boolean(p));

    if (paths.length > 0) {
      await supabase.storage.from('product-images').remove(paths);
    }

    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  };

  const toggleActive = async (p: AdminProduct) => {
    await supabase.from('products').update({ active: !p.active }).eq('id', p.id);
    fetchProducts();
  };

  const totalStockFor = (p: AdminProduct) =>
    p.stockMap ? Object.values(p.stockMap).reduce((sum, s) => sum + s, 0) : 0;

  const filteredProducts = products.filter((p) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    const titleMatch = p.title.toLowerCase().includes(query);
    const categoryMatch = p.category_name?.toLowerCase().includes(query);
    return titleMatch || categoryMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-ink">Productos ({filteredProducts.length})</h2>
        <button
          onClick={openCreateModal}
          className="py-2 px-4 rounded-xl bg-brand text-white font-bold text-xs shadow-sm hover:bg-brand/90 transition-all cursor-pointer"
        >
          + Nuevo producto
        </button>
      </div>

      {/* Buscador */}
      <div>
        <input
          type="text"
          placeholder="Buscar producto por nombre o categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-ink/15 rounded-xl px-4 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
        />
      </div>

      {loading ? (
        <p className="text-center py-12 text-ink/60 font-medium">Cargando...</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-center py-12 text-ink/60 font-medium">
          {searchTerm ? 'No se encontraron productos que coincidan.' : 'Aún no hay productos.'}
        </p>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-4 p-3 bg-white border border-ink/10 rounded-2xl shadow-sm hover:border-ink/20 transition-all"
            >
              {p.img_url ? (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                  <Image src={p.img_url} alt={p.title} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-neutral-100 shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-ink truncate">{p.title}</h4>
                <p className="text-xs text-ink/60 truncate">
                  {p.category_name} · {p.variants?.length || 0} opciones · {p.colors?.length || 0} colores · Stock: {totalStockFor(p)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleActive(p)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  p.active
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {p.active ? 'Activo' : 'Inactivo'}
              </button>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEditModal(p)}
                  className="w-8 h-8 rounded-lg border border-ink/10 bg-white text-ink hover:bg-neutral-50 flex items-center justify-center font-bold text-xs"
                >
                  ✎
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="w-8 h-8 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center font-bold text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear/Editar */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-ink">
              {editingId ? 'Editar producto' : 'Nuevo producto'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  Nombre del producto
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full bg-neutral-50 border border-ink/15 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Categoría</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    required
                    className="w-full bg-neutral-50 border border-ink/15 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-brand"
                  >
                    <option value="" disabled>
                      Selecciona categoría
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">
                    Etiqueta (Badge)
                  </label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="Top Ventas..."
                    className="w-full bg-neutral-50 border border-ink/15 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* SECCIÓN VARIANTES DE OPCIÓN/PRECIO */}
              <div className="pt-4 border-t border-ink/10 space-y-3">
                <label className="block text-sm font-bold text-ink">Opciones y Precios</label>

                {form.variants.map((v, vIdx) => {
                  const finalPrice = calculateFinalPrice(v.price, v.discount_percent);
                  const hasDiscount =
                    parseFloat(v.discount_percent || '0') > 0 && parseFloat(v.price || '0') > 0;

                  return (
                    <div
                      key={vIdx}
                      className="p-3 border border-ink/10 rounded-xl bg-neutral-50 space-y-2"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                        <div>
                          <label className="block text-xs font-semibold text-ink/70 mb-1">
                            Opción / Formato
                          </label>
                          <input
                            type="text"
                            value={v.label}
                            onChange={(e) => updateVariant(vIdx, { label: e.target.value })}
                            placeholder="Ej. Normal, 500g..."
                            required
                            className="w-full bg-white border border-ink/15 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brand"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-ink/70 mb-1">
                            Precio Lista ($)
                          </label>
                          <input
                            type="number"
                            value={v.price}
                            onChange={(e) => updateVariant(vIdx, { price: e.target.value })}
                            placeholder="5000"
                            required
                            className="w-full bg-white border border-ink/15 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brand"
                          />
                        </div>

                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="block text-xs font-semibold text-ink/70 mb-1">
                              % Descuento
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={v.discount_percent}
                              onChange={(e) =>
                                updateVariant(vIdx, { discount_percent: e.target.value })
                              }
                              placeholder="0"
                              className="w-full bg-white border border-ink/15 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brand"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => removeVariant(vIdx)}
                            className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 text-xs font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {hasDiscount && (
                        <p className="text-xs font-semibold text-emerald-600">
                          🏷️ Precio Venta: ${finalPrice.toLocaleString('es-CL')} (
                          {v.discount_percent}% dcto)
                        </p>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={addVariant}
                  className="py-1.5 px-3 rounded-lg bg-ink text-white font-bold text-xs"
                >
                  + Agregar opción
                </button>
              </div>

              {/* SECCIÓN COLORES */}
              <div className="pt-4 border-t border-ink/10 space-y-3">
                <label className="block text-sm font-bold text-ink">Colores</label>

                {form.colors.map((c, cIdx) => (
                  <div key={cIdx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={c.color_name}
                      onChange={(e) => updateColor(cIdx, { color_name: e.target.value })}
                      placeholder="Nombre del color"
                      required
                      className="flex-1 bg-neutral-50 border border-ink/15 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={() => removeColor(cIdx)}
                      className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addColor}
                  className="py-1.5 px-3 rounded-lg bg-ink text-white font-bold text-xs"
                >
                  + Agregar color
                </button>
              </div>

              {/* MATRIZ DE STOCK */}
              {form.variants.length > 0 && form.colors.length > 0 && (
                <div className="pt-4 border-t border-ink/10 space-y-3">
                  <label className="block text-sm font-bold text-ink">
                    Stock por combinación (opción × color)
                  </label>

                  <div className="overflow-x-auto border border-ink/10 rounded-xl">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-neutral-100 text-ink/70 font-bold border-b border-ink/10">
                        <tr>
                          <th className="p-2.5">Color \ Opción</th>
                          {form.variants.map((v, vIdx) => (
                            <th key={vIdx} className="p-2.5 text-center min-w-20">
                              {v.label || `Opción ${vIdx + 1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/10">
                        {form.colors.map((c, cIdx) => (
                          <tr key={cIdx}>
                            <td className="p-2.5 font-semibold text-ink">
                              {c.color_name || `Color ${cIdx + 1}`}
                            </td>
                            {form.variants.map((_, vIdx) => (
                              <td key={vIdx} className="p-2 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  value={form.stockMatrix[`${vIdx}-${cIdx}`] ?? '0'}
                                  onChange={(e) => updateStock(vIdx, cIdx, e.target.value)}
                                  className="w-16 text-center border border-ink/15 rounded-md py-1 text-xs outline-none focus:border-brand"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-neutral-50 border border-ink/15 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-brand"
                />
              </div>

              <ImageUploadField
                bucket="product-images"
                value={form.images}
                onChange={(urls) => setForm({ ...form, images: urls })}
                label="Imágenes"
                altText={form.title}
              />

              <div className="flex flex-col gap-2 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="accent-brand"
                  />
                  Visible en la tienda
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_new}
                    onChange={(e) => setForm({ ...form, is_new: e.target.checked })}
                    className="accent-brand"
                  />
                  Marcar como novedad
                </label>
              </div>

              {formError && (
                <p className="text-xs font-semibold text-red-500 bg-red-50 p-2.5 rounded-xl border border-red-200">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-ink/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="py-2 px-4 rounded-xl border border-ink/15 text-ink font-bold text-xs hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="py-2 px-4 rounded-xl bg-brand text-white font-bold text-xs shadow-sm hover:bg-brand/90 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}