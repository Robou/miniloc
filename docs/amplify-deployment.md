# Déploiement AWS Amplify - Miniloc

## Configuration actuelle

L'application est configurée pour être déployée sur AWS Amplify tout en conservant la base de données Supabase.

### Architecture
- **Frontend**: React + Vite hébergé sur AWS Amplify
- **Base de données**: Supabase (externe)
- **Authentification**: Supabase Auth

## Variables d'environnement requises

Dans la console AWS Amplify, configurer les variables d'environnement suivantes :

```
VITE_SUPABASE_URL=https://jcqenwmnhblctzxjrwko.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjcWVud21uaGJsY3R6eGpyd2tvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjQxOTksImV4cCI6MjA2NTg0MDE5OX0.CgNPMFldAMhHsWvHoaFUxz54qfK8M7lgBxkzqviOcic
```

## Étapes de déploiement

### 1. Connexion du repository
1. Se connecter à la console AWS Amplify
2. Créer une nouvelle application
3. Connecter le repository GitHub/GitLab
4. Sélectionner la branche principale

### 2. Configuration du build
Le fichier `amplify.yml` est déjà configuré avec :
- Installation des dépendances avec cache npm
- Build avec Vite
- Headers de sécurité optimisés
- Cache des assets statiques

### 3. Variables d'environnement
Dans l'onglet "Environment variables" d'Amplify :
- Ajouter `VITE_SUPABASE_URL`
- Ajouter `VITE_SUPABASE_ANON_KEY`

### 4. Domaine personnalisé (optionnel)
Configurer un domaine personnalisé dans l'onglet "Domain management"

## Fonctionnalités préservées

✅ **Base de données Supabase** : Toutes les opérations CRUD restent inchangées
✅ **Authentification** : Login admin via Supabase Auth
✅ **Fonctions RPC** : `create_borrow` et `return_article` fonctionnent
✅ **Real-time** : Prêt pour les mises à jour en temps réel si nécessaire

## Optimisations incluses

- **Headers de sécurité** : HSTS, X-Frame-Options, etc.
- **Cache optimisé** : Assets statiques mis en cache 1 an
- **Build performant** : Vite avec optimisations de production
- **Variables d'environnement** : Sécurisées côté Amplify

## Surveillance et logs

- **Build logs** : Disponibles dans la console Amplify
- **Access logs** : Configurables via CloudWatch
- **Monitoring** : Métriques de performance intégrées

## Commandes utiles

```bash
# Test local
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview