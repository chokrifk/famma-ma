const SUPABASE_URL = 'https://iahzasnluqapwppclfmn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_TIb7eyfTYz5x-DhexGOWDw_VkPja_E-'; // 

// On utilise 'clientSupabase' au lieu de 'supabase' pour éviter tout conflit de nom
window.clientSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
