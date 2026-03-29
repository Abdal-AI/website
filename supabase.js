import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function fetchRemoteReviews() {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('reviews')
    .select('name, rating, message, created_at')
    .order('created_at', { ascending: false })
    .limit(12);

  if (error) {
    console.error('Failed to fetch reviews from Supabase:', error.message);
    return null;
  }

  return data;
}

export async function insertRemoteReview(review) {
  if (!supabase) return false;

  const { error } = await supabase.from('reviews').insert({
    name: review.name,
    rating: review.rating,
    message: review.message
  });

  if (error) {
    console.error('Failed to save review to Supabase:', error.message);
    return false;
  }

  return true;
}
