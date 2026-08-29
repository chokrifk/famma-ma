// --- 1. INITIALISATION DU CLIENT SUPABASE ---
const db = window.dbClient;
// --- 2. FONCTION : CHARGER ET AFFICHER LES LIEUX ---
async function loadPlacesFromSupabase() {
  if (!db) return;

  const { data: places, error } = await db
    .from('places')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur :', error.message);
    return;
  }

  const countElem = document.getElementById('count');
  const waterElem = document.getElementById('waterCount');

  if (countElem) countElem.textContent = places.length;
  if (waterElem) {
    const totalWater = places.filter(p => p.category === 'water').length;
    waterElem.textContent = totalWater;
  }

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
  }

  console.log('Lieux chargés :', places);

  // Mise à jour des compteurs dans l'en-tête (Dashboard)
  const countElem = document.getElementById('count');
  const waterElem = document.getElementById('waterCount');

  if (countElem) countElem.textContent = places.length;
  if (waterElem) {
    const totalWater = places.filter(p => p.category === 'water').length;
    waterElem.textContent = totalWater;
  }

  // Ajout des marqueurs sur la carte Leaflet (si l'objet global map existe)
  if (typeof map !== 'undefined' && places) {
    places.forEach(place => {
      if (place.latitude && place.longitude) {
        L.marker([place.latitude, place.longitude])
          .addTo(map)
          .bindPopup(`
            <strong>${place.name}</strong><br>
            <span>Catégorie : ${place.category}</span><br>
            <small>${place.address || ''} (${place.governorate})</small>
          `);
      }
    });
  }
}

// --- 3. FONCTION : SIGNALER UN NOUVEAU LIEU ---
function initPlaceForm() {
  const placeForm = document.getElementById('placeForm');
  if (!placeForm) return;

  placeForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('name');
    const catInput = document.getElementById('formCat');
    const govInput = document.getElementById('formGov');
    const addressInput = document.getElementById('address');
    const latInput = document.getElementById('lat');
    const lngInput = document.getElementById('lng');

    const newPlace = {
      name: nameInput ? nameInput.value : '',
      category: catInput ? catInput.value : 'shop',
      governorate: govInput ? govInput.value : '',
      address: addressInput ? addressInput.value : '',
      latitude: latInput ? parseFloat(latInput.value) : 0,
      longitude: lngInput ? parseFloat(lngInput.value) : 0
    };

    const { data, error } = await supabase
      .from('places')
      .insert([newPlace]);

    if (error) {
      alert("Erreur lors du signalement : " + error.message);
    } else {
      alert("Lieu ajouté avec succès !");
      const modal = document.getElementById('placeModal');
      if (modal) modal.classList.add('hidden');
      placeForm.reset();
      loadPlacesFromSupabase(); // Recharger la carte et les stats
    }
  });
}

// --- 4. FONCTION : AUTHENTIFICATION MAGIC LINK ---
function initAuthForm() {
  const authModal = document.getElementById('authModal');
  if (!authModal) return;

  const authForm = authModal.querySelector('form');
  if (!authForm) return;

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = authForm.querySelector('input[type="email"]');
    if (!emailInput) return;

    const email = emailInput.value;

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: window.location.href
      }
    });

    if (error) {
      alert("Erreur de connexion : " + error.message);
    } else {
      alert("Lien de connexion envoyé ! Vérifie tes emails.");
      authModal.classList.add('hidden');
    }
  });
}

// --- 5. EXECUTION AU CHARGEMENT DE LA PAGE ---
document.addEventListener('DOMContentLoaded', () => {
  loadPlacesFromSupabase();
  initPlaceForm();
  initAuthForm();
});
