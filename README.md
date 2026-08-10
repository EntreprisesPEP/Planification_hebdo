# Planification Hebdomadaire - PEP2000

Version web (Next.js + Supabase) du prototype construit dans Claude. Ce document
explique comment mettre ce projet en ligne via **GitHub + Supabase + Vercel**.

## 1. Supabase (la base de donnees)

**Si tu as deja un projet Supabase pour ton Toolbox PEP, reutilise-le** - pas besoin
d'en creer un nouveau. Cette app vit dans son propre schema Postgres (`planif_hebdo`),
separe des tables de tes autres apps (Carnet de taches, etc.), donc aucun risque de
conflit dans le meme projet Supabase.

Si tu n'as pas encore de projet Supabase pour le Toolbox, cree-le une seule fois
(pas un par app) : [supabase.com](https://supabase.com) > New Project.

1. Dans le projet Supabase (nouveau ou existant), ouvre **SQL Editor > New query**,
   colle le contenu de `supabase/schema.sql`, puis **Run**. Ca cree le schema
   `planif_hebdo`, ses tables, et active le temps reel.
2. Nouvelle requete, colle cette fois `supabase/seed.sql`, puis **Run**. Ca importe
   les 43 projets, les contremaitres, les charges de projet et les surintendants deja
   configures dans le prototype - rien a retaper.
3. Etape obligatoire car le schema n'est pas `public` : va dans
   **Project Settings > API > Exposed schemas** et ajoute `planif_hebdo` a la liste
   (elle contient deja `public` par defaut - ajoute la nouvelle sans l'enlever).
   Sans cette etape, l'app ne pourra pas lire/ecrire meme si le reste fonctionne.
4. Toujours dans **Project Settings > API**, note :
   - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`

*(Une prochaine app Toolbox PEP ferait pareil : son propre schema, ex. `ordre_du_jour`,
dans ce meme projet Supabase - jamais un nouveau projet Supabase par app.)*

## 2. GitHub (le code)

1. Cree un nouveau depot (prive, recommande) sur GitHub, ex. `pep-planification`.
2. Depuis ce dossier :
   ```bash
   git init
   git add .
   git commit -m "Premiere version - migration depuis le prototype"
   git branch -M main
   git remote add origin https://github.com/<ton-compte>/pep-planification.git
   git push -u origin main
   ```

## 3. Vercel (le site en ligne)

1. Va sur [vercel.com](https://vercel.com), connecte ton compte GitHub.
2. **Add New > Project**, choisis le depot `pep-planification`.
3. Dans **Environment Variables**, ajoute les deux valeurs de l'etape 1 :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy**. Vercel te donne une URL (ex. `pep-planification.vercel.app`) - c'est
   le lien a partager avec l'equipe.

Chaque fois que tu pousses un changement sur `main`, Vercel redeploie automatiquement.

## 4. Tester en local (optionnel, avant de pousser)

```bash
npm install
cp .env.example .env.local   # puis remplis les 2 valeurs Supabase
npm run dev
```
Ouvre http://localhost:3000

## Le logo

Depose le vrai logo PEP2000 dans `public/logo-pep.png` (remplace le fichier
`public/README-logo.txt`). Le header le cherche automatiquement a ce chemin.

## Ce qui a change par rapport au prototype Claude

- **Stockage** : `window.storage` (propre a Claude) -> vraies tables Postgres
  dans Supabase. Les donnees ne disparaissent plus si le lien Claude change.
- **Synchronisation** : le "polling" toutes les 0.5 seconde est remplace par le
  **temps reel de Supabase** (les changements arrivent instantanement, sans
  boucle qui interroge le serveur en continu).
- **Preferences personnelles** (theme jour/nuit, mode animateur/participant) :
  stockees dans le `localStorage` du navigateur au lieu du stockage Claude -
  fonctionne pareil, propre a chaque appareil.

## Simplifications assumees (a ameliorer si besoin)

Pour livrer une base solide sans faire exploser la portee, quelques details du
prototype n'ont **pas** ete reproduits a l'identique :

- **Filtre Charge/Surintendant** : ici un simple menu deroulant ("Tous" + un nom
  a la fois) plutot que le style Excel avec cases a cocher multiples.
- **Redimensionnement des colonnes a la souris** : pas encore porte (les
  largeurs sont fixes par pourcentage, comme au tout debut).
- **Annuler/Retablir (Ctrl+Z / Ctrl+Y)** : pas encore porte. Comme les donnees
  vivent maintenant dans une vraie base, on pourrait le rebatir proprement
  avec une table d'historique Postgres plutot qu'une pile en memoire - dis-le
  moi si tu veux qu'on l'ajoute.
- **Aucune authentification** : comme avant, le mode animateur/participant est
  un simple bouton, pas un vrai compte. N'importe qui avec le lien peut
  modifier. Pour restreindre l'acces, l'etape suivante logique est d'ajouter
  Supabase Auth (email/mot de passe ou lien magique) - je peux batir ca dans
  une prochaine passe si tu veux vraiment barrer l'acces.

## Structure du projet

```
pages/index.js          Page principale (bascule entre les 4 vues)
components/              Header, AdminView, Meeting1View, Meeting2View, TerminesView, ...
hooks/useBoard.js        Tout le CRUD + le temps reel Supabase
hooks/usePrefs.js        Preferences personnelles (theme, role) en localStorage
lib/                     Dates, couleurs de statut, client Supabase
styles/globals.css       Feuille de style (meme palette navy/rouge que le prototype)
supabase/schema.sql      Tables + policies + temps reel
supabase/seed.sql        Donnees actuelles (43 projets, contremaitres, etc.)
```
