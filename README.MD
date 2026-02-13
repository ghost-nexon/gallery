# Comatozze Gallery Website

## Overview
Comatozze is an image gallery website with a public client view and a private admin panel. Built using HTML, Tailwind CSS (via CDN), Vanilla JavaScript, and Supabase for authentication, database, and storage. Deployed on Netlify.

## Tech Stack
- HTML5
- Tailwind CSS (CDN)
- Vanilla JavaScript (ES6+)
- Supabase
- Netlify

## Setup Instructions

### Supabase Setup
1. Create a Supabase project.
2. Create a database table named `images` with columns:
   - `id` (uuid, primary key)
   - `title` (text)
   - `description` (text)
   - `image_url` (text)
   - `created_at` (timestamptz, default now())
3. Enable Row Level Security (RLS):
   - For `select`: Allow all (public read).
   - For `insert`, `update`, `delete`: Allow authenticated users only.
4. Create a storage bucket named `gallery-images` with public read access.
5. For authentication: Use email/password. Manually create an admin user in Supabase dashboard (no signup page).
6. Note your Supabase URL and Anon Key.

### Local Development
1. Clone the repo.
2. Replace placeholders in `assets/js/supabase.js` with your Supabase URL and Anon Key.
3. Open `index.html` and `admin.html` in a browser (use a local server like Live Server for CORS if needed).

### Deployment on Netlify
1. Push the repo to GitHub.
2. Connect GitHub repo to Netlify.
3. Set environment variables in Netlify dashboard:
   - `SUPABASE_URL`: Your Supabase project URL.
   - `SUPABASE_ANON_KEY`: Your Supabase anon key.
4. Note: Since this is pure static, replace placeholders in `supabase.js` manually or use a build step if needed. For production, ensure keys are handled securely (anon key is public).
5. Deploy: Netlify will serve static files.

## Repository Structure
- `index.html`: Public gallery.
- `admin.html`: Admin panel (requires login).
- `assets/js/`: JavaScript files.
- `netlify/netlify.toml`: Netlify config.
- `.gitignore`: Ignore files.

## Usage
- Client: Visit the site to view the gallery.
- Admin: Go to `/admin.html`, login with admin credentials to manage images.
