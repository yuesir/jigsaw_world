export interface Puzzle {
  id: string;
  title: string;
  slug: string;
  image_url: string;
  description: string | null;
  seo_description: string | null;
  piece_count: number;
  created_at: string | null;
  updated_at: string | null;
}
