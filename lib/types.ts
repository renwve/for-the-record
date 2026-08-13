export const MEDIA_TYPES = [
  'Movie', 
  'Series', 
  'Film', 
  'Documentary', 
  'Short', 
  'Anime', 
  'Other'];

export type Media = {
  id: string;
  user_id: string;
  title: string;
  actors: string | null;
  release_date: string | null;
  media_type: string;
  rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  nickname: string;
  background_url: string | null;
  updated_at: string;
};