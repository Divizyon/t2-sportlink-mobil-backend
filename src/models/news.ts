export interface News {
  id: bigint;
  title: string;
  content: string;
  source_url: string;
  image_url: string;
  published_date: Date;
  sport_id: bigint;
  created_at: Date;
  updated_at: Date;
}

export interface NewsFilters {
  sport_id?: bigint;
  limit?: number;
  offset?: number;
} 