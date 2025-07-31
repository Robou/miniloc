# Plan de développement de l'app - Club Alpin Prêt de Matériel
Ceci est le plan de développement de mon appli de gestion simple d'articles pour mon club alpin de sports de montagnes. Le fichier principal de l'app est dans le fichier App.tsx.


## Contexte et Problème Identifié

### Application Actuelle
- **Type** : Application de gestion d'emprunts pour club alpin
- **Principe** : Système basé sur la confiance pour petit club
- **Tables** : `articles` et `borrows`
- **Utilisateurs** : Publics non-authentifiés + admins authentifiés

### Problème Actuel
il n'existe pas encore assez de fonctions

### Logiques générales
L'idée générale est de concevoir un crm modulable et généraliste pour un petit club, sans compte utilisateur, seulement un compte admin.
Le code sera publié sur github avec manuel d'installation et scripts pour faciliter au maximum la réappropriation et la réutilisation par d'autres clubs.

il faudra créer les script sql nécessaires pour les opérations sur la pase de données (conseillé SUpabase. J'utilise supabase)

Les maitres mots sont simplicité pour l'utilisateur, sobriété du code, efficacité.

### technos utilisées
Typescript, react, vite, supabase, sql, tailwindcss

### Schéma de la base de données Supabase actuelle
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.articles (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  type text,
  available boolean DEFAULT true,
  CONSTRAINT articles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.borrows (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  article_id bigint,
  name text NOT NULL,
  email text NOT NULL,
  borrowed_at timestamp without time zone DEFAULT now(),
  CONSTRAINT borrows_pkey PRIMARY KEY (id),
  CONSTRAINT borrows_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id)
);

### Configuration RLS Actuelle
- **Table articles** : ALL pour admins uniquement + SELECT pour public
- **Table borrows** : ALL pour admins uniquement + SELECT pour public



### Architecture de la Solution

La solution repose sur des fonctions PostgreSQL sécurisées qui centralisent la logique métier côté base de données. Ces fonctions garantissent l'atomicité des opérations et préviennent les incohérences.

## Fonctionnalités Implémentées

### 1. Fonction d'Emprunt Sécurisée
- Vérification automatique de la disponibilité
- Création atomique de l'emprunt + mise à jour de la disponibilité
- Gestion des erreurs intégrée

### 2. Fonction de Retour d'Article
- Suppression de l'emprunt et remise à disposition automatique
- Accessible au public pour simplifier les retours

## Analyse des Risques de Sécurité

### Risques Éliminés ✅
- **Modification non autorisée** : Impossible de modifier `articles.available` sans créer d'emprunt
- **Incohérence des données** : Transaction atomique garantit la cohérence
- **Abus du système** : Logique métier centralisée et sécurisée
- **Erreurs de concurrence** : Gestion automatique par PostgreSQL

### Risques Résiduels ⚠️
- **Spam d'emprunts** : Un utilisateur pourrait créer de nombreux emprunts
  - *Mitigation* : Ajouter une limite par email/IP si nécessaire
- **Données personnelles** : Stockage des emails
  - *Mitigation* : Conforme au contexte club (données nécessaires)

### Risques Acceptables pour le Contexte 📝
- **Pas d'authentification forte** : Acceptable pour un système basé sur la confiance
- **Visibilité publique des emprunts** : Transparence souhaitée dans le club

## État Actuel

### Fonctionnalités Opérationnelles ✅
- **Fonction `create_borrow`** : Implémentée et fonctionnelle
- **Interface d'emprunt** : Frontend modifié pour utiliser la nouvelle fonction
- **Fonction `return_article`** : Implémentée avec interface de retour
- **Gestion des erreurs** : Messages d'erreur appropriés côté utilisateur

### Système Fonctionnel
L'application permet actuellement :
- Emprunts sécurisés par les utilisateurs publics
- Retours d'articles simplifiés
- Gestion administrative complète
- Cohérence des données garantie

## Plan d'améliorations Prochaines Étapes



### Étape 1 : PROJET:Système de Champs Personnalisés Modulaires
**Objectif :** Rendre l'application modulaire pour différents types de clubs (bibliothèque, matériel de montagne, etc.)

#### Phase 1 : Architecture Base de Données
**Objectif :** Créer la structure pour les champs personnalisés

##### 1.1 Création des nouvelles tables
- Table `field_configurations` pour stocker les métadonnées des champs
- Table `presets` pour les configurations prédéfinies
- Modification table `articles` avec colonne `custom_fields` (JSONB)
- Modification table `borrows` pour champs d'emprunt personnalisés

```sql
CREATE TABLE public.field_configurations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  field_name text NOT NULL,
  field_label text NOT NULL,
  field_type text NOT NULL, -- 'text', 'number', 'date', 'select', 'textarea', 'boolean'
  is_active boolean DEFAULT true,
  is_required boolean DEFAULT false,
  field_order integer DEFAULT 0,
  field_options jsonb, -- Pour les listes déroulantes
  preset_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.presets (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  is_active boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.articles
ADD COLUMN custom_fields jsonb DEFAULT '{}',
ADD COLUMN preset_name text DEFAULT 'default';

ALTER TABLE public.borrows
ADD COLUMN custom_borrow_fields jsonb DEFAULT '{}';
```

##### 1.2 Scripts SQL à créer
- `create_field_system.sql` : Création des tables
- `insert_presets.sql` : Insertion des 2 presets (Bibliothèque + Matériel montagne)
- `migrate_existing_data.sql` : Migration des données actuelles

#### Phase 2 : Backend - Fonctions PostgreSQL
**Objectif :** Adapter les fonctions existantes au nouveau système

##### 2.1 Nouvelles fonctions
- `get_active_fields(preset_name)` : Récupérer la configuration active
- `create_article_with_custom_fields()` : Création d'articles avec champs personnalisés
- `update_field_configuration()` : Gestion des configurations par l'admin
- `activate_preset(preset_name)` : Activation d'un preset

##### 2.2 Modification des fonctions existantes
- Adapter `create_borrow()` pour les champs d'emprunt personnalisés
- Mise à jour des requêtes de recherche et filtrage

#### Phase 3 : Frontend - Interface Dynamique
**Objectif :** Interface qui s'adapte à la configuration active

##### 3.1 Composants génériques
- `DynamicForm` : Génération automatique de formulaires
- `FieldRenderer` : Affichage des différents types de champs
- `PresetSelector` : Sélection des configurations prédéfinies
- `CustomFieldDisplay` : Affichage des champs personnalisés dans le catalogue

##### 3.2 Adaptation des écrans existants
- Catalogue : Affichage des champs personnalisés
- Formulaire d'ajout d'articles : Champs dynamiques
- Interface d'emprunt : Champs d'emprunt personnalisés
- Recherche et filtres : Adaptation aux nouveaux champs

#### Phase 4 : Interface d'Administration
**Objectif :** Permettre à l'admin de configurer les champs

##### 4.1 Écrans de configuration
- Gestion des presets (activation/désactivation)
- Configuration personnalisée des champs
- Prévisualisation des changements
- Modification/suppression d'articles avec nouveaux champs
- Configuration du titre de la page

##### 4.2 Fonctionnalités avancées
- Import/Export de configurations
- Validation des données lors des changements
- Migration assistée entre presets

#### Phase 5 : Tests et Validation
**Objectif :** Assurer la robustesse du système

##### 5.1 Tests fonctionnels
- Test des 2 presets complets
- Validation des migrations de données
- Test de performance avec champs JSONB

##### 5.2 Tests utilisateur
- Interface intuitive pour l'admin
- Workflow complet d'emprunt avec nouveaux champs
- Compatibilité avec données existantes

#### Détail des Presets

##### Preset "Bibliothèque"
**Champs articles :**
- Titre (text, requis)
- Auteur (text)
- Catégorie (select: carte topographique, topo randonnée, topo escalade, topo alpinisme, manuel technique, beau livre, roman)
- Éditeur (text)
- Année d'édition (number)
- Description (textarea)
- Mots-clés (text)
- ISBN (text)
- Type (select: livre, carte topographique)
- Lieu de stockage (text)

##### Preset "Matériel de montagne"
**Champs articles :**
- Désignation (text, requis)
- EPI (boolean)
- Type (text)
- Couleur (text)
- Fabricant (text)
- Modèle (text)
- Taille (text)
- N° d'identification fabricant (text)
- N° d'identification club (text)
- Date de fabrication (date)
- État opérationnel (select: 4 options à définir)
- Remarque utilisation (textarea)

**Champs emprunt spécifiques :**
- Prix d'emprunt (number)
- Nom de l'encadrant pour la sortie (text)

#### Estimation de développement
- **Phase 1-2 :** 2-3 jours (Base de données + Backend)
- **Phase 3 :** 3-4 jours (Interface dynamique)
- **Phase 4 :** 2-3 jours (Admin interface)
- **Phase 5 :** 1-2 jours (Tests)
- **Total :** 8-12 jours de développement

#### Avantages de cette approche
✅ **Flexibilité maximale** : L'admin peut créer/modifier/supprimer des champs
✅ **Pas de migration DB complexe** : Nouveaux champs ajoutés dynamiquement
✅ **Réutilisable** : Même structure pour tous types de clubs
✅ **Interface dynamique** : Formulaires générés automatiquement
✅ **Presets prêts à l'emploi** : Configuration immédiate pour bibliothèque ou matériel

#### INCONVENIENTS : TROP LOURD ET COMPLEXE A METTRE EN OEUVRE
il sera préférable de créer un script d'installation qui demande de choisir si on veut une appli pour gestion de bibliothèque ou une appli d'emprunt de matériel de montagne.

### Étape 2 : Améliorer la recherche d'articles au catalogue
1. ajouter des filtres de recherche suivant les champs (la base de données s'étoffera dans le futur et de nouveaux champs seront ajoutés)

### Étape 3 : Améliorer l'aspect de la GUI avec du CSS un peu plus beau. A FINIR
1. ✅ Bases posées
2. améliorer l'utilisation de tailwindcss et voir si on peut diminuer la taille du css grâce à ça.
3. quelques bugs au niveau des cartes d'articles
4. voir pour changer les pop-up navigateur par des toasts ?

### Étape 4 : Installation Automatisée
Un script d'installation automatisé sera développé pour faciliter le déploiement par d'autres clubs :
- Configuration automatique de Supabase
- Création des tables et fonctions
- Configuration des policies RLS
- Documentation d'installation simplifiée
