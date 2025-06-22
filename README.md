# CAF Avignon - Prêt de Matériel

Application de gestion de prêt de matériel pour le Club Alpin Français d'Avignon.

## Technologies utilisées

- React
- TypeScript
- Vite
- Supabase (base de données)
- Tailwind CSS
- ESLint & Prettier

## Configuration du projet

### Prérequis

- Node.js (v14 ou supérieur)
- npm (v6 ou supérieur)

### Installation

1. Cloner le dépôt
2. Installer les dépendances:
   ```bash
   npm install
   ```
3. Créer un fichier `.env.local` à la racine du projet avec les variables suivantes:
   ```
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_clé_anonyme_supabase
   ```

### Développement

Pour lancer le serveur de développement:

```bash
npm run dev
```

L'application sera disponible à l'adresse [http://localhost:5173](http://localhost:5173) (ou un autre port si celui-ci est déjà utilisé).

### Build

Pour construire l'application pour la production:

```bash
npm run build
```

Les fichiers générés seront disponibles dans le dossier `dist`.

### Linting

Pour vérifier le code avec ESLint:

```bash
npm run lint
```

## Fonctionnalités

- Catalogue d'articles disponibles
- Système de panier
- Gestion des emprunts
- Espace administrateur