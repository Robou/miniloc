# 🏔️ Gestionnaire d'Emprunts pour Clubs de Sports de Montagne

Application basique de gestion d'emprunts pour clubs alpins. Conçue pour gérer à la fois une bibliothèque de livres/topos et du matériel de montagne (EPI, équipement technique, etc.), ou seulement l'un des deux.

## 🎯 À qui s'adresse cette application ?

Cette application est idéale pour les clubs alpins ou toute autre petite association gérant des emprunts de matériel ou de documentation.

Pour l'instant, il est néanmoins indispensable d'avoir des compétences informatiques en hébergement web et en développement pour la phase d'installation.

## ✨ Fonctionnalités principales actuelles

### Parcours d'emprunt complet
- Recherche et consultation de la liste des articles disponibles
- Système de panier (emprunts multiples)
- Formulaire d'emprunt minimal
- Liste des articles actuellement sortis du stock
- Restitution d'emprunt en un clic

### 🤝 Système basé sur la confiance pour flexibilité maximale et lourdeur minimale
Le mode de fonctionnement décrit ci-dessous est un parti pris fort de l'application, 
- **Pas d'authentification utilisateur** : système simple basé sur la confiance
- **Un compte administrateur uniquement** pour la gestion du catalogue
- **Transparence** : tous les emprunts sont visibles publiquement
- L'utilisateur peut emprunter par panier, mais le retour des articles est effectué article par article (utile par exemple quand l'utilisateur ne rend qu'une partie du matériel qu'il a emprunté)
- Un article peut être rendu par n'importe qui


### 📚 Mode Bibliothèque
- Consultation de la liste d'ouvrages
- Champs : titre, auteur, catégorie, éditeur, année, ISBN, description, mots-clés, lieu de stockage
- Catégories: topos, cartes, manuels techniques, beaux livres, romans...

### ⛷️ Mode Matériel de Montagne
- Consultation de la liste des équipement proposés
- Nombreux champs : désignation, type, modèle, fabricant, numéro d'identification constructeur, numéro d'identification club, taille, état opérationnel, couleur, notes d'utilisation, classification EPI
- à venir : calcul du prix des emprunts

- **CETTE APPLICATION N'EST PAS UN GESTIONNAIRE D'EPI (équipements de protection individuelle)** (pas de gestion des dates de contrôle, de l'état etc.)


### 🛒 Fonctionnalités admin
- **Login sécurisé** avec authentification par adresse mail + mot de passe
- **Activation/désactivation des modes** bibliothèque ou matériel (l'un, l'autre, ou les deux)
- **Import par lots** pour ajouter rapidement de nombreux articles
- **Ajout et modification** d'articles individuels

### Interface

- **Interface responsive** adaptée mobile/desktop



## 🚀 Installation et configuration

L'installation est manuelle, avec l'aide du guide ci-dessous en cours de rédaction.

### Prérequis

Vous aurez besoin a minima de :

- **un compte Supabase** (gratuit pour petites applications)
- **un compte Amazon AWS** (pour le déploiement par Amplify)
- **un compte GitHub** (pour cloner le repository)

Pour le développement local :
- **VSCode** (logiciel interface de développement)
- **Node.js** (v18 ou supérieur)

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

En cours de rédaction.

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

### 3. Tester le fonctionnement correct en local


```bash
# Lancer le serveur de développement
npm run dev

# L'application sera disponible sur http://localhost:3000
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


## Origine du projet

Cette application a été conçue dans l'objectif de faciliter la vie des clubs alpins proposant à leurs membres des services de bibliothèque et d'emprunt de matériel de montagne. Les constats fondateurs du projet :
- les adhérents ont souvent du mal à utiliser un fichier d'emprunts fait sous un tableur comme Excel ou Libre Office.
- il n'y a pas forcément toujours un bénévole gérant la bibliothèque ou l'emprunt de matériel présent au moment de l'emprunt.
- les utilisateurs veulent une flexibilité maximale pour les emprunts et un désagrément minimal concernant les lourdeurs habituelles des applis (création de compte, connexion sécurisée...)
- pas de solution "sur étagère" mise à disposition par la FFCAM pour les clubs, pour un sujet qui pourtant se pose dans chacun de ceux-ci.
- le besoin pour les gestionnaires d'inventaire d'avoir une vue globale sur les articles sortis.

## 🔧 Sous le capot

### 🛠️ Technologies utilisées

- **Frontend** : React 18 + TypeScript + Vite
- **Base de données** : Supabase (PostgreSQL)
- **UI/UX** : Tailwind CSS + composants personnalisés
- **Déploiement** : AWS Amplify
- **Code quality** : ESLint + Prettier

### 🛡️ Sécurité

- **Fonctions PostgreSQL sécurisées** pour les emprunts
- **Pas de données sensibles** stockées, seul un nom ou pseudo est à renseigner. Champ email facultatif.
- **Protection contre les abus** (rate limiting)


## 📄 Licence

Ce projet est sous licence libre pour encourager son adoption par la communauté.

## 🆘 Support

En cas de problème ou de question, ouvrir une issue sur le repository GitHub.

---
