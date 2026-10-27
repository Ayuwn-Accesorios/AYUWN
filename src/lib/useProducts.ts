import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/types/products';

interface CategoryOption {
  id: string | null;
  name: string;
}

interface UseProductsOptions {
  activeCategory?: string;
  searchQuery?: string;
  currentPage?: number;
  itemsPerPage?: number;
}

export function useProducts({
  activeCategory = 'Todos',
  searchQuery = '',
  currentPage = 1,
  itemsPerPage = 12,
}: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Cargar categorías disponibles
  useEffect(() => {
    async function fetchCategories() {
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('id, name');

      if (!catError && catData) {
        const loadedCategories: CategoryOption[] = [
          { id: null, name: 'Todos' },
          ...catData.map((c: any) => ({ id: c.id, name: c.name })),
        ];

        setCategories(loadedCategories);
      }
    }

    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    let matchedIds: number[] = [];
    const hasSearch = searchQuery.trim().length > 0;

    if (hasSearch) {
      const { data: matches, error: searchError } = await supabase.rpc('search_products', {
        p_query: searchQuery.trim(),
      });
      if (searchError) {
        console.error('Error en búsqueda:', searchError.message);
        setError('No se pudo realizar la búsqueda.');
        setLoading(false);
        return;
      }
      matchedIds = (matches || []).map((m: any) => m.id);
      if (matchedIds.length === 0) {
        setProducts([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }
    }

    // Aplica los filtros comunes (categoría/búsqueda)
    function applyFilters<T>(base: T): T {
      let q = (base as any).eq('active', true);
      if (activeCategory !== 'Todos' && categories.length > 0) {
        const selectedCatObj = categories.find((c) => c.name === activeCategory);
        if (selectedCatObj?.id) {
          q = q.eq('category_id', selectedCatObj.id);
        }
      }
      if (hasSearch) {
        q = q.in('id', matchedIds);
      }
      return q;
    }

    // 1. Conteo liviano para calcular la paginación real
    const countBase = supabase.from('products').select('id', { count: 'exact', head: true });
    const { count: filteredCount } = await applyFilters(countBase);
    const safeTotalPages = Math.max(1, Math.ceil((filteredCount || 0) / itemsPerPage));
    const safePage = Math.min(currentPage, safeTotalPages);
    const from = (safePage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    // 2. Query real con los joins actualizados
    const dataBase = supabase
      .from('products')
      .select(
        `
        id,
        title,
        category_id,
        description,
        img_url,
        images,
        badge,
        is_new,
        categories ( id, name ),
        product_variants (
          id,
          label,
          price,
          discount_percent,
          variant_color_stock ( color_id, stock )
        ),
        product_colors ( id, color_name )
      `,
        { count: 'exact' }
      );

    let query = applyFilters(dataBase);
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching products:', fetchError.message || fetchError);
      setError('No se pudieron cargar los productos.');
      setLoading(false);
      return;
    }

    if (data) {
      const fetched: Product[] = data.map((item: any) => ({
        ...item,
        category_name: item.categories?.name || 'Sin categoría',
        variants: (item.product_variants || []).map((v: any) => ({
          id: v.id,
          label: v.label,
          price: v.price,
          discount_percent: v.discount_percent,
          stocks: (v.variant_color_stock || []).map((s: any) => ({ color_id: s.color_id, stock: s.stock })),
        })),
        colors: (item.product_colors || []).map((c: any) => ({
          id: c.id,
          color_name: c.color_name,
        })),
      }));
      setProducts(fetched);
      setTotalCount(count || 0);
    }

    setLoading(false);
  }, [currentPage, activeCategory, searchQuery, categories, itemsPerPage]);

  useEffect(() => {
    if (categories.length > 0 || activeCategory === 'Todos') {
      fetchProducts();
    }
  }, [fetchProducts, categories.length, activeCategory]);

  return {
    products,
    categories,
    loading,
    error,
    totalCount,
    refetch: fetchProducts,
  };
}