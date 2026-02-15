export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
}

export interface Note {
  id: number;
  content: string;
  created_at: string;
}
