// --- INITIALISATION SUPABASE ---
const db = window.db;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Géolocalisation automatique au chargement
  getUserLocation();

  // 2. Bouton "Me localiser" dans l'en-tête
  const locateBtn = document.getElementById('locateBtn');
  if (locateBtn) {
    locateBtn.addEventListener('click', getUserLocation);
  }

  // 3. Gestion de la modale "+ Signaler un lieu"
  const addBtn = document.getElementById('addBtn');
  const placeModal = document.getElementById('placeModal');
  
  if (addBtn && placeModal) {
    addBtn.addEventListener('click', () => {
      placeModal.classList.remove('hidden');
    });
  }

  // Fermeture de la modale
  const closeButtons = document.querySelectorAll('[data-close]');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (placeModal) placeModal.classList.add('hidden');
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target === placeModal) placeModal.classList.add('hidden');
  });

  // Charger les données de la base
  loadPlacesFromSupabase();
  initPlaceForm();
});

// --- GEOLOCALISATION AUTOMATIQUE ---
function getUserLocation() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Centrer la carte sur la position de l'utilisateur
        if (typeof map !== 'undefined') {
          map.setView([lat, lng], 13);
          
          // Ajouter un marqueur de position actuelle
          L.circleMarker([lat, lng], {
            color: '#10b981',
            radius: 8,
            fillOpacity: 0.8
          }).addTo(map).bindPopup("<b>Vous êtes ici</b>").openPopup();
        }

        // Remplir automatiquement la latitude/longitude dans le formulaire si vide
        const latInput = document.getElementById('lat');
        const lngInput = document.getElementById('lng');
        if (latInput && !latInput.value) latInput.value = lat;
        if (lngInput && !lngInput.value) lngInput.value = lng;
      },
      (error) => {
        console.warn('Géolocalisation refusée ou non disponible :', error.message);
      }
    );
  }
}

// --- CHARGER LES LIEUX DEPUIS SUPABASE ---
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

// --- FORMULAIRE D'AJOUT DE LIEU ---
function initPlaceForm() {
  const placeForm = document.getElementById('placeForm');
  if (!placeForm) return;

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
