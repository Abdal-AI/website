import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function hasRealValue(value) {
  return Boolean(
    value &&
      !String(value).startsWith('your-') &&
      !String(value).includes('your-project-id')
  );
}

export const hasSupabaseConfig = hasRealValue(supabaseUrl) && hasRealValue(supabaseKey);

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

export function subscribeToRemoteReviews(onChange) {
  if (!supabase) return null;

  const channel = supabase
    .channel('public:reviews')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reviews' },
      async () => {
        const reviews = await fetchRemoteReviews();
        if (reviews) onChange(reviews);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
