# Famma-Me V2 🇹🇳 — Powered by Choko

V2 is a community map designed for Tunisia: shops, water, pharmacies, bakeries, fuel stations and other useful resources.

## Stack
- Static HTML/CSS/JavaScript
- Leaflet + OpenStreetMap
- Supabase Auth + PostgreSQL + Realtime
- GitHub Pages

Supabase's browser JavaScript client is loaded from its CDN. GitHub Pages can publish the static files directly from the repository.

## Activate the shared community database

1. Create a Supabase project.
2. Open **SQL Editor**.
3. Run `supabase/schema.sql`.
4. Copy the Project URL and Publishable/anon key into `assets/config.js`.
5. In Supabase Auth, enable Email/OTP.
6. Push the project to GitHub.
7. Enable GitHub Pages using GitHub Actions.

Do NOT put a Supabase `service_role`/secret key in `config.js`.

## Deploy

```bash
git init
git add .
git commit -m "Famma-Me V2"
git branch -M main
git remote add origin https://github.com/YOUR-USER/famma-me.git
git push -u origin main
```

The included workflow deploys every push to `main`.

## Moderation

New authenticated reports are inserted as `pending`. Public users only see `approved` rows. For production, add an admin/moderator role and an admin dashboard to approve/reject reports.

## Current V2
- Community database architecture
- Email OTP login architecture
- Realtime updates
- Moderation status
- Map + geolocation
- Search / governorate / category filters
- Water availability filter
- French / Arabic UI
- Mobile responsive design
- Demo mode when Supabase is not configured
