const SUPABASE_URL = 'https://iahzasnluqapwppclfmn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_TIb7eyfTYz5x-DhexGOWDw_VkPja_E-'; // Ta clé publishable

// On utilise window.db pour éviter tout conflit de nom 'supabase'
window.db = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
