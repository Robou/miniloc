# Déploiement AWS Amplify - Guide rapide

## 🚀 Configuration terminée

L'application Miniloc est maintenant prête pour le déploiement sur AWS Amplify avec conservation de la base Supabase.

## ✅ Fichiers configurés

- `amplify.yml` - Configuration de build optimisée
- `vite.config.mts` - Build optimisé pour production
- `public/_redirects` - Redirections SPA
- `eslint.config.js` - Configuration ESLint v9
- `.env.example` - Template des variables d'environnement

## 🔧 Étapes de déploiement

### 1. Console AWS Amplify
1. Aller sur [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Cliquer "New app" > "Host web app"
3. Connecter le repository Git

### 2. Variables d'environnement
Dans Amplify, ajouter ces variables :
```
VITE_SUPABASE_URL=https://jcqenwmnhblctzxjrwko.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjcWVud21uaGJsY3R6eGpyd2tvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjQxOTksImV4cCI6MjA2NTg0MDE5OX0.CgNPMFldAMhHsWvHoaFUxz54qfK8M7lgBxkzqviOcic
```

### 3. Build automatique
Le fichier `amplify.yml` gère automatiquement :
- Installation des dépendances avec cache
- Build TypeScript + Vite
- Optimisations de performance
- Headers de sécurité

## 🔒 Sécurité

- Headers HSTS, X-Frame-Options configurés
- Variables d'environnement sécurisées
- Build minifié et optimisé
- Cache des assets statiques

## 📊 Base de données

✅ **Supabase préservé** - Aucun changement nécessaire
- Toutes les fonctions RPC fonctionnent
- Authentification admin maintenue
- Connexion directe depuis Amplify

## 🧪 Test local

```bash
npm run deploy:check  # Lint + build de production
npm run dev          # Développement local
npm run preview      # Test du build
```

## 📈 Monitoring

Une fois déployé, surveiller via :
- Console Amplify (builds, métriques)
- CloudWatch (logs, performances)
- Supabase Dashboard (base de données)