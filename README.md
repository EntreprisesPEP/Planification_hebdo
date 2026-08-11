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

Deja inclus (`public/logo-pep.png`) - rien a faire.

## Mise a jour d'un site deja en ligne (deuxieme livraison)

Si tu as deja fait tourner `schema.sql` une premiere fois, tu n'as PAS besoin
de le rejouer. Ajoute seulement la nouvelle table des notes libres :

1. Supabase > SQL Editor > New query > colle `supabase/migration_1_comments.sql` > Run.
2. Redeploie le site sur Vercel (pousse le nouveau code sur GitHub, ou "Redeploy"
   depuis le dashboard Vercel).
3. Optionnel mais recommande : ajoute la variable `ANIMATEUR_PASSWORD` dans
   Vercel (voir section "Qui a acces au mode animateur" plus bas).

## Qui a acces au mode animateur ?

Le bouton "passer en mode animateur" demande maintenant un mot de passe,
verifie cote serveur (jamais visible dans le code du navigateur) :

1. Dans Vercel > Settings > Environment Variables, ajoute :
   - Key : `ANIMATEUR_PASSWORD`
   - Value : le mot de passe de ton choix
   - **Ne coche PAS "Sensitive" en NEXT_PUBLIC** - cette variable n'a justement
     pas ce prefixe, donc elle ne part jamais au navigateur.
2. Redeploie.
3. Partage ce mot de passe seulement aux personnes qui doivent pouvoir modifier
   (toi, les charges de projet). Les autres ouvrent le lien et restent
   automatiquement en mode participant (lecture seule) tant qu'ils ne
   l'entrent pas.

Si tu ne configures pas cette variable, le mode animateur reste ouvert a tous
(comme avant) - l'app vous avertit dans les logs serveur mais ne bloque rien.

Ce n'est toujours pas un vrai systeme de comptes (pas de "qui a fait quoi"),
mais ca empeche l'acces accidentel ou non autorise. Pour un vrai systeme de
comptes avec des roles individuels, l'etape suivante est Supabase Auth - dis-le
moi si tu veux qu'on le construise.

## Notes libres ("pastille") sur chaque projet

Dans Meeting 1 et Projets termines, une petite pastille apparait a cote du nom
du projet. Elle affiche le nombre de notes deja laissees; cliquer dessus ouvre
une fenetre pour lire l'historique et en ajouter une nouvelle. Contrairement au
reste du tableau, **tout le monde peut ecrire une note ici, meme en mode
participant** - c'est pense comme un fil de discussion rapide ("ajouter 2 gars
mardi"), separe du commentaire officiel de la reunion.

## Annuler / Retablir

Les boutons "Annuler" / "Retablir" en haut fonctionnent maintenant pour : les
projets (ajout, modification, suppression), les contremaitres, les charges de
projet, les surintendants, et les attributions de la grille Meeting 2.
Exception assumee : le changement de semaine dans Meeting 1 (archivage des
notes) et les notes libres ("pastille") ne sont pas couverts par l'annulation -
ce sont des actions de journal, pas des editions a corriger.

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

- **Redimensionnement des colonnes a la souris** : pas encore porte (les
  largeurs sont fixes par pourcentage). Dis-le moi si tu veux qu'on l'ajoute.
- **Comptes individuels** : le systeme de mot de passe partage (voir plus haut)
  protege l'acces, mais ne distingue pas encore une personne d'une autre. Pour
  ca, il faudrait Supabase Auth.

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
