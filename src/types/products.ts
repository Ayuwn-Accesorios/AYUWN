export interface ProductColor {
  id: number;
  color_name: string;
}

export interface VariantStock {
  color_id: number;
  stock: number;
}

export interface ProductVariant {
  id: number;
  label: string;
  price: number;
  discount_percent: number;
  stocks: VariantStock[];
}

export interface Product {
  id: number;
  title: string;
  category_id: number | null;
  category_name?: string;
  description: string | null;
  img_url: string | null;
  images?: string[] | null;
  badge?: string | null;
  is_new?: boolean;
  variants: ProductVariant[];
  colors: ProductColor[];
}