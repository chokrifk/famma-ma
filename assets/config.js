const SUPABASE_URL = 'https://iahzasnluqapwppclfmn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_TIb7eyfTYz5x-DhexGOWDw_VkPja_E-'; // Votre clé publishable

// Initialisation globale sur l'objet window
window.dbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
