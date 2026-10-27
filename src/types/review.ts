export interface Review {
  id: number;
  rating: number;
  author_name: string | null;
  comment: string;
  created_at: string;
}

export interface ReviewStats {
  avg_rating: number;
  total: number;
}