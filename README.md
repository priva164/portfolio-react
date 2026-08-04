# Portfolio — Nako Priva (version React)

Application React (Vite) + Supabase comme "backend" tout fait.
Tu modifies tes infos et projets depuis `/admin`, sans jamais retoucher le code.

## 1. Créer ton projet Supabase (10 minutes, une seule fois)

1. Va sur https://supabase.com → **Start your project** → connecte-toi avec GitHub ou email.
2. Crée un nouveau projet (choisis un mot de passe de base de données, garde-le).
3. Une fois le projet prêt, va dans **SQL Editor** → **New query**.
4. Colle tout le contenu du fichier `schema.sql` (fourni ici) → clique **Run**.
   Cela crée tes deux tables (`profile`, `projects`) et les règles de sécurité.

## 2. Créer le stockage pour tes images

1. **Storage** → **New bucket** → nom : `portfolio` → coche **Public bucket** → **Create bucket**.
2. Clique sur le bucket `portfolio` → **Policies** → **New policy** :
   - `SELECT` pour `public`, condition `true` (lecture publique).
   - Les insert/update/delete sont déjà réservés aux utilisateurs connectés via `schema.sql`.

## 3. Créer ton compte de connexion admin

1. **Authentication** → **Users** → **Add user** → **Create new user**.
2. Mets ton email (ex. nakopriva164@gmail.com) et un mot de passe fort.
3. Va dans **Authentication** → **Providers** → **Email** → décoche "Allow new users to sign up"
   pour empêcher que quelqu'un d'autre crée un compte.

## 4. Configurer le projet en local

1. Installe les dépendances :
   ```bash
   npm install
   ```
2. Copie `.env.example` en `.env` :
   ```bash
   cp .env.example .env
   ```
3. Remplis `.env` avec tes clés Supabase (**Project Settings > API**) :
   ```
   VITE_SUPABASE_URL=https://ton-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=ta_cle_anon_publique
   ```
4. Lance le site en local :
   ```bash
   npm run dev
   ```
   Va sur `http://localhost:5173` pour le site public et `http://localhost:5173/admin`
   pour te connecter et ajouter du contenu.

## 5. Déployer (Vercel — le plus simple pour un projet Vite/React)

1. Mets ce dossier dans un repo GitHub.
2. Va sur https://vercel.com → **Add New Project** → importe ton repo.
3. Vercel détecte automatiquement Vite. Avant de cliquer "Deploy", ouvre **Environment Variables**
   et ajoute les deux mêmes clés que dans ton `.env` :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Clique **Deploy**. Ton site est en ligne sur `tonsite.vercel.app`.
5. `tonsite.vercel.app/admin` reste accessible directement grâce au routage React
   (le fichier `vercel.json` inclus redirige toutes les routes vers `index.html`).

**Tu ne redéploies plus jamais pour ajouter une photo ou un projet.**
Un redéploiement n'est nécessaire que si tu modifies le design ou le code lui-même —
Vercel le refait automatiquement à chaque `git push`.

## Structure du projet

```
index.html                    → point d'entrée Vite
vercel.json                   → redirige toutes les routes vers index.html (nécessaire pour /admin)
schema.sql                    → à coller une fois dans Supabase (étape 1)
.env.example                  → modèle pour tes clés Supabase
src/
  main.jsx                    → point d'entrée React + routes
  index.css                   → tout le design visuel
  supabaseClient.js            → connexion Supabase partagée
  components/
    Header.jsx                → navigation par catégories
    Hero.jsx                  → nom, bio, contacts, photo, pile de cartes signature
    ProjectsGrid.jsx          → grille de projets filtrée par catégorie
    Footer.jsx
  pages/
    Portfolio.jsx              → page publique ("/")
    Admin.jsx                  → connexion + gestion du contenu ("/admin")
```

## Ce que tu peux modifier depuis /admin

- Nom, accroche, bio
- Numéros de téléphone, WhatsApp, email
- Photo de la page d'accueil (hero)
- Ajout / suppression de projets, avec pour chacun :
  - titre, catégorie (Design / UI-UX / Développement / IA)
  - description
  - lien vers le projet
  - photo du projet

Tout est visible instantanément par tes visiteurs, sans redéploiement.
