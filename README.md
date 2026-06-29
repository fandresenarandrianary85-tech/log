# Magasin Web

Application web statique inspirée de l'app desktop (Stock, Client, Fournisseur, Decaissement), prête à déployer.

## Fichiers

- `index.html`: structure de l'interface
- `styles.css`: style responsive desktop/mobile
- `app.js`: logique de navigation, tableaux, filtres, modal approvisionnement
- `vercel.json`: configuration de déploiement Vercel
- `netlify.toml`: configuration de déploiement Netlify

## Lancer en local

### Option 1: ouvrir directement

Double-clique sur `index.html`.

### Option 2: serveur local (recommandé)

Si Node.js est installé:

```bash
npx serve .
```

Puis ouvre l'URL affichée.

## Déployer sur Vercel

1. Crée un dépôt Git avec ces fichiers.
2. Importe le dépôt dans Vercel.
3. Framework preset: `Other`.
4. Build command: vide.
5. Output directory: `.`
6. Deploy.

## Déployer sur Netlify

1. Crée un site depuis le dépôt Git.
2. Build command: vide.
3. Publish directory: `.`
4. Deploy.

## Fonctions incluses

- Navigation entre modules
- Recherche rapide
- Filtre de statut
- KPI dynamiques
- Export CSV de la vue active
- Modal d'approvisionnement
- Persistance locale via `localStorage`

## Notes

- Les données sont initialisées avec un jeu d'exemple.
- Les modifications sont enregistrées dans le navigateur de l'utilisateur.
