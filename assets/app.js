// --- INITIALISATION SUPABASE ---
const db = window.db;

// --- GESTION DES MODALES ET BOUTONS ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Bouton "+ Signaler un lieu"
  const addBtn = document.getElementById('addBtn');
  const placeModal = document.getElementById('placeModal');
  
  if (addBtn && placeModal) {
    addBtn.addEventListener('click', () => {
      placeModal.classList.remove('hidden');
    });
  }

  // 2. Bouton "Connexion"
  const authBtn = document.querySelector('header button:last-child');
  const authModal = document.getElementById('authModal');
  
  if (authBtn && authModal) {
    authBtn.addEventListener('click', () => {
      authModal.classList.remove('hidden');
    });
  }

  // 3. Boutons de fermeture (Croix 'x')
  const closeButtons = document.querySelectorAll('[data-close]');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (placeModal) placeModal.classList.add('hidden');
      if (authModal) authModal.classList.add('hidden');
    });
  });

  // 4. Fermer la modale en cliquant à l'extérieur
  window.addEventListener('click', (e) => {
    if (e.target === placeModal) placeModal.classList.add('hidden');
    if (e.target === authModal) authModal.classList.add('hidden');
  });

  // Charger les données de Supabase
  loadPlacesFromSupabase();
  initForms();
});

// --- CHARGER ET AFFICHER LES LIEUX ---
async function loadPlacesFromSupabase() {
  if (!db) return;

  const { data: places, error } = await db
    .from('places')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur Supabase :', error.message);
    return;
  }

  // Mise à jour des compteurs du dashboard
  const countElem = document.getElementById('count');
  const waterElem = document.getElementById('waterCount');

  if (countElem) countElem.textContent = places.length;
  if (waterElem) {
    const totalWater = places.filter(p => p.category === 'water').length;
    waterElem.textContent = totalWater;
  }

  // Marqueurs sur la carte Leaflet
  if (typeof map !== 'undefined' && places) {
    places.forEach(place => {
      if (place.latitude && place.longitude) {
        L.marker([place.latitude, place.longitude])
          .addTo(map)
          .bindPopup(`<b>${place.name}</b><br>${place.address || ''}`);
      }
    });
  }
}

// --- SOUMISSION DES FORMULAIRES ---
function initForms() {
  // Formulaire d'ajout de lieu
  const placeForm = document.getElementById('placeForm');
  if (placeForm) {
    placeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const newPlace = {
        name: document.getElementById('name').value,
        category: document.getElementById('formCat').value,
        governorate: document.getElementById('formGov').value,
        address: document.getElementById('address').value,
        latitude: parseFloat(document.getElementById('lat').value),
        longitude: parseFloat(document.getElementById('lng').value)
      };

      const { error } = await db.from('places').insert([newPlace]);

      if (error) {
        alert("Erreur lors de l'ajout : " + error.message);
      } else {
        alert("Lieu ajouté avec succès !");
        document.getElementById('placeModal').classList.add('hidden');
        placeForm.reset();
        loadPlacesFromSupabase();
      }
    });
  }

  // Formulaire de connexion Magic Link
  const authForm = document.querySelector('#authModal form');
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = authForm.querySelector('input[type="email"]').value;

      const { error } = await db.auth.signInWithOtp({
        email: email,
        options: { emailRedirectTo: window.location.href }
      });

      if (error) {
        alert("Erreur : " + error.message);
      } else {
        alert("Lien de connexion envoyé ! Vérifiez votre boîte mail.");
        document.getElementById('authModal').classList.add('hidden');
      }
    });
  }
}
