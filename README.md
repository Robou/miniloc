# 🏔️ Gestionnaire d'Emprunts pour Clubs de Sports de Montagne

Application complète de gestion d'emprunts pour clubs alpins, clubs de randonnée et associations de sports de montagne. Conçue pour gérer à la fois une bibliothèque de livres/topos et du matériel de montagne (EPI, équipement technique, etc.).

## 🎯 À qui s'adresse cette application ?

Cette application est idéale pour :
- **Clubs alpins** (CAF, FFME, etc.)
- **Associations de randonnée**
- **Clubs de sports de montagne**
- **Écoles d'aventure et d'escalade**
- **Tout organisme gérant des emprunts de matériel ou de documentation**

## ✨ Fonctionnalités principales

### 🤝 Système basé sur la confiance
- **Pas d'authentification utilisateur** : système simple basé sur la confiance
- **Un compte administrateur uniquement** pour la gestion du catalogue
- **Transparence** : tous les emprunts sont visibles publiquement

### 📚 Mode Bibliothèque
- Gestion de livres, cartes topographiques, topos d'escalade/alpinisme
- Catégories : romans, manuels techniques, beaux livres, cartes IGN
- Recherche par titre, auteur, catégorie, mots-clés
- Gestion des emprunts avec dates de retour

### ⛷️ Mode Matériel de Montagne
- Gestion d'équipements de protection individuelle (EPI)
- Suivi détaillé : fabricant, modèle, taille, état opérationnel
- Gestion des prix d'emprunt
- Encadrement : nom du superviseur pour les sorties
- État du matériel : excellent, bon, acceptable, hors service

### 🛒 Fonctionnalités avancées
- **Panier d'emprunts** : sélection multiple avant validation
- **Recherche multicritères** avec filtres
- **Import en batch** pour ajouter rapidement de nombreux articles
- **Interface responsive** adaptée mobile/desktop
- **Animations fluides** pour une meilleure UX

### 🔒 Sécurité et performances
- **Fonctions PostgreSQL sécurisées** : transactions atomiques
- **Row Level Security (RLS)** configuré
- **Rate limiting** et protection CSRF
- **Sanitization** des données d'entrée
- **Logging de sécurité** intégré

## 🛠️ Technologies utilisées

- **Frontend** : React 18 + TypeScript + Vite
- **Base de données** : Supabase (PostgreSQL)
- **UI/UX** : Tailwind CSS + composants personnalisés
- **Déploiement** : AWS Amplify
- **Code quality** : ESLint + Prettier

## 🚀 Installation et configuration

### Prérequis

- **Node.js** (v18 ou supérieur)
- **Compte Supabase** (gratuit pour commencer)
- **Compte AWS** (pour le déploiement Amplify)
- **Git** (pour cloner le repository)

### 1. Clonage et installation

```bash
# Cloner le repository
git clone <votre-repo-url>
cd gestionnaire-emprunts-club

# Installer les dépendances
npm install
```

### 2. Configuration Supabase

#### Option A : Installation guidée semi-auto (recommandée)

Exécutez le script d'installation automatique qui configure tout pour vous :

```bash
# Lancer le script d'installation Supabase
chmod +x scripts/setup-supabase.sh
./scripts/setup-supabase.sh
```

Ce script va :
- ✅ Créer un projet Supabase
- ✅ Configurer les tables (books/equipment)
- ✅ Installer les fonctions PostgreSQL sécurisées
- ✅ Configurer les policies RLS
- ✅ Générer un fichier `.env.local` avec vos credentials

#### Option B : Configuration manuelle

1. **Créer un projet Supabase** :
   - Aller sur [supabase.com](https://supabase.com)
   - Créer un nouveau projet
   - Noter l'URL et la clé anonyme

2. **Exécuter les scripts SQL** :
   ```sql
   -- Dans l'éditeur SQL de Supabase, exécuter dans l'ordre :

   -- 1. Tables pour la bibliothèque
   -- Contenu du fichier database/create_books_tables.sql

   -- 2. Tables pour le matériel
   -- Contenu du fichier database/create_equipment_tables.sql

   -- 3. Fonctions sécurisées
   -- Contenu du fichier database/create_book_functions.sql
   -- Contenu du fichier database/create_equipment_functions.sql
   ```

3. **Configurer les variables d'environnement** :
   ```bash
   cp .env.example .env.local
   ```

   Modifier `.env.local` :
   ```env
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre-clé-anonyme
   ```

### 3. Développement local

```bash
# Lancer le serveur de développement
npm run dev

# L'application sera disponible sur http://localhost:5173
```

### 4. Déploiement sur AWS Amplify

1. **Connecter à Amplify** :
   ```bash
   # Installer l'CLI Amplify (si pas déjà fait)
   npm install -g @aws-amplify/cli

   # Initialiser Amplify dans le projet
   amplify init
   ```

2. **Configuration automatique** :
   - Le fichier `amplify.yml` est préconfiguré
   - Build automatique avec les optimisations de cache
   - Headers de sécurité configurés

3. **Déployer** :
   ```bash
   # Build de production
   npm run build

   # Deploy sur Amplify
   amplify publish
   ```

### 5. Configuration des modes (après déploiement)

L'application supporte deux modes de fonctionnement (optionnel - configurable à tout moment dans l'interface admin) :

#### Mode Bibliothèque uniquement
- Gérez uniquement les livres et cartes
- Interface optimisée pour la documentation

#### Mode Matériel uniquement
- Gérez uniquement l'équipement de montagne
- Interface adaptée aux EPI et matériel technique

#### Mode Mixte (recommandé)
- Les deux modes activés
- Basculez entre les interfaces avec le sélecteur de mode

### 6. Import initial des données (après déploiement)

Une fois l'application déployée et accessible, utilisez la **fonction d'import intégrée** dans l'onglet Admin :

1. **Préparez vos fichiers CSV** selon le format des exemples fournis
2. **Connectez-vous en tant qu'admin**
3. **Allez dans l'onglet Admin > Import en batch**
4. **Importez vos livres et/ou matériel directement depuis l'interface**

Cette méthode est beaucoup plus simple que les commandes SQL complexes et ne nécessite aucune connaissance technique particulière.

## 📖 Guide d'utilisation

### Pour les utilisateurs (emprunteurs)

1. **Naviguer dans le catalogue** :
   - Choisir le mode (Bibliothèque/Matériel)
   - Utiliser les filtres de recherche
   - Consulter les détails des articles

2. **Emprunter** :
   - Ajouter des articles au panier
   - Renseigner nom et email (optionnel)
   - Pour le matériel : prix d'emprunt et encadrant si nécessaire
   - Confirmer l'emprunt

3. **Retour** :
   - Cliquer sur "Retourner" sur l'article emprunté
   - L'article redevient disponible automatiquement

### Pour les administrateurs

1. **Accès admin** :
   - Se connecter avec les credentials Supabase
   - Accès complet en lecture/écriture

2. **Gestion du catalogue** :
   - Ajouter/modifier/supprimer des articles
   - Import en batch pour les grandes quantités
   - Modifier la disponibilité

3. **Supervision** :
   - Voir tous les emprunts actifs
   - Historique des mouvements
   - Gestion des retours

## 🔧 Structure de la base de données

### Tables principales

#### Pour la bibliothèque (`books`, `book_borrows`)
- **books** : titre, auteur, catégorie, éditeur, année, ISBN, etc.
- **book_borrows** : emprunts avec nom, email, dates

#### Pour le matériel (`equipment`, `equipment_borrows`)
- **equipment** : désignation, EPI, fabricant, modèle, état, etc.
- **equipment_borrows** : emprunts avec prix, encadrant, etc.

### Sécurité
- **RLS activé** sur toutes les tables
- **Fonctions PostgreSQL sécurisées** pour les emprunts
- **Transactions atomiques** : impossible d'avoir d'incohérences

## 🛡️ Sécurité

- **Pas de données sensibles** stockées
- **Validation côté serveur** des emprunts
- **Protection contre les abus** (rate limiting)
- **Logs de sécurité** pour audit
- **Headers de sécurité** sur le déploiement

## 🤝 Contribution

Cette application est conçue pour être facilement réutilisable par d'autres clubs. N'hésitez pas à :

1. **Fork le projet** pour votre club
2. **Adapter les catégories** à vos besoins
3. **Ajouter des champs** spécifiques à votre activité
4. **Partager vos améliorations**

## 📄 Licence

Ce projet est sous licence libre pour encourager son adoption par la communauté des sports de montagne.

## 🆘 Support

En cas de problème ou de question :
1. Consulter la [documentation Supabase](https://supabase.com/docs)
2. Vérifier les logs dans l'interface Supabase
3. Ouvrir une issue sur le repository GitHub

---

**Développé avec ❤️ pour la communauté des sports de montagne**