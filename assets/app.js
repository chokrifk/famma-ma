const GOVS=["Ariana","Béja","Ben Arous","Bizerte","Gabès","Gafsa","Jendouba","Kairouan","Kasserine","Kébili","Le Kef","Mahdia","Manouba","Médenine","Monastir","Nabeul","Sfax","Sidi Bouzid","Siliana","Sousse","Tataouine","Tozeur","Tunis","Zaghouan"];
const demo=[
{id:"d1",name:"Épicerie El Amal",category:"shop",gov:"Tunis",address:"Centre-ville",water:true,lat:36.8065,lng:10.1815,verified:true},
{id:"d2",name:"Point d'eau Ariana",category:"water",gov:"Ariana",address:"Ariana",water:true,lat:36.8665,lng:10.1647,verified:true},
{id:"d3",name:"Boulangerie Exemple",category:"bakery",gov:"Sousse",address:"Sousse",water:false,lat:35.8256,lng:10.63699,verified:false}
];
let places=[],markers=L.layerGroup(),map=L.map("map").setView([34.2,9.4],7),waterOnly=false,db=null;
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"}).addTo(map);markers.addTo(map);
GOVS.forEach(g=>{gov.add(new Option(g,g));formGov.add(new Option(g,g));});
const $=id=>document.getElementById(id), esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const labels={shop:"🛒 Commerce",market:"🛍️ Supermarché",bakery:"🥖 Boulangerie",pharmacy:"💊 Pharmacie",fuel:"⛽ Station-service",water:"💧 Eau",other:"📍 Autre"};
async function initDB(){
 const c=window.FAMMA_CONFIG||{};
 if(c.supabaseUrl&&c.supabaseKey&&window.supabase){db=window.supabase.createClient(c.supabaseUrl,c.supabaseKey);await loadRemote();}
 else {places=JSON.parse(localStorage.getItem("famma-v2")||"null")||demo;render();}
}
async function loadRemote(){
 const {data,error}=await db.from("places").select("*").eq("status","approved").order("created_at",{ascending:false});
 places=error?demo:data||[];render();
 db.channel("places-live").on("postgres_changes",{event:"*",schema:"public",table:"places"},()=>loadRemote()).subscribe();
}
function render(){
 markers.clearLayers();
 const q=$("search").value.toLowerCase(),g=$("gov").value,c=$("cat").value;
 const arr=places.filter(p=>(!q||`${p.name} ${p.address||""} ${p.gov}`.toLowerCase().includes(q))&&(!g||p.gov===g)&&(!c||p.category===c)&&(!waterOnly||p.water));
 $("count").textContent=places.length;$("waterCount").textContent=places.filter(p=>p.water).length;
 $("list").innerHTML=arr.length?"":"<div class='empty'>Aucun résultat.<br>Ajoute le premier lieu !</div>";
 arr.forEach(p=>{
  const m=L.marker([p.lat,p.lng]).addTo(markers).bindPopup(`<b>${esc(p.name)}</b><br>${labels[p.category]||"📍"} · ${esc(p.gov)}<br>${p.water?"💧 Eau disponible":"Pas d'information eau"}${p.verified?"<br>✅ Communauté confirmée":""}`);
  const el=document.createElement("article");el.className="card";el.innerHTML=`<span class='pill'>${labels[p.category]||"📍"}</span><h3>${esc(p.name)}</h3><p>${esc(p.address||"")}<br>📍 ${esc(p.gov)}</p><footer>${p.water?"💧 Eau disponible":"—"} ${p.verified?" · ✅ Confirmé":""}</footer>`;
  el.onclick=()=>{map.setView([p.lat,p.lng],15);m.openPopup()};$("list").appendChild(el);
 });
}
["search","gov","cat"].forEach(x=>$(x).addEventListener("input",render));
$("waterFilter").onclick=()=>{waterOnly=!waterOnly;$("waterFilter").classList.toggle("active",waterOnly);render()};
$("locBtn").onclick=()=>navigator.geolocation?.getCurrentPosition(p=>{map.setView([p.coords.latitude,p.coords.longitude],15);L.circleMarker([p.coords.latitude,p.coords.longitude],{radius:9}).addTo(map).bindPopup("📍 Vous êtes ici").openPopup()});
$("addBtn").onclick=()=>{$("placeModal").classList.remove("hidden")};
$("authBtn").onclick=()=>{$("authModal").classList.remove("hidden")};
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>b.closest(".overlay").classList.add("hidden"));
map.on("click",e=>{$("lat").value=e.latlng.lat.toFixed(6);$("lng").value=e.latlng.lng.toFixed(6)});
$("placeForm").onsubmit=async e=>{
 e.preventDefault();
 const p={name:$("name").value.trim(),category:$("formCat").value,gov:$("formGov").value,address:$("address").value.trim(),water:$("hasWater").checked,lat:+$("lat").value,lng:+$("lng").value,status:db?"pending":"approved"};
 if(db){const {error}=await db.from("places").insert(p);if(error){alert("Erreur : "+error.message);return}}else{p.id="local-"+Date.now();places.unshift(p);localStorage.setItem("famma-v2",JSON.stringify(places));render();}
 $("placeModal").classList.add("hidden");e.target.reset();alert(db?"Signalement envoyé pour modération.":"Lieu ajouté en mode démo local.");
};
$("authForm").onsubmit=async e=>{e.preventDefault();if(db){const {error}=await db.auth.signInWithOtp({email:$("email").value});if(error)alert(error.message);else alert("Lien de connexion envoyé.");}else alert("Configure Supabase pour activer la connexion.");};
$("lang").onclick=()=>{document.documentElement.lang="ar";document.body.dir="rtl";$("lang").textContent="Français";$("h1").textContent="فمّا؟ نلقاوها.";$("sub").textContent="خريطة تشاركية لمعرفة وين تلقى الحوانت والماء والموارد في تونس.";};
initDB();