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


le texte ci-dessous présente les fonctionnalités dernièrement implémentées, mais ça n'a pas été tout terminé.




## Solution Recommandée : Fonction PostgreSQL Sécurisée

### Avantages de cette Approche
✅ **Sécurité maximale** : Logique métier centralisée côté base de données  
✅ **Atomicité garantie** : Transaction unique (emprunt + mise à jour disponibilité)  
✅ **Simplicité d'usage** : Un seul appel depuis le frontend  
✅ **Prévention des abus** : Impossible de modifier la disponibilité sans créer d'emprunt  
✅ **Maintien de la confiance** : Système reste simple pour les utilisateurs  

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

### Système Fonctionnel
L'application permet actuellement :
- Emprunts sécurisés par les utilisateurs publics
- Retours d'articles simplifiés
- Gestion administrative complète
- Cohérence des données garantie

## Plan de Migration

### Étape 1 : Préparation Base de Données ✅ COMPLÉTÉE
- ✅ Fonction `create_borrow` créée et testée
- ✅ Policies RLS mises à jour
- ✅ Permissions accordées

### Étape 2 : Modification Frontend ✅ COMPLÉTÉE  
- ✅ Fonction `confirmBorrow` modifiée
- ✅ Gestion d'erreurs améliorée implémentée
- ✅ Flux complet testé et validé

### Étape 3 : Fonctionnalités Additionnelles ✅ COMPLÉTÉE
- ✅ Fonction de retour d'articles implémentée
- ✅ Interface de retour ajoutée
- ✅ Validations intégrées

### Étape 4 : Tests et Validation ✅ COMPLÉTÉE
- ✅ Tests complets des scénarios d'usage
- ✅ Validation finale de la sécurité
- ✅ Tests de performance


### Étape 5 : améliorer la gestion du panier ✅ COMPLÉTÉE
1. ✅ dans l'onglet catalogue, quand un article est ajouté au panier, remplacer le texte "ajouter au panier" par un texte grisé "ajouté au panier". Il faudrait aussi qu'à l'instant du clic, la carte de l'article saute légèrement vers le haut pour montrer que le cli a été pris en compte.
2. ✅ dans l'onglet panier, ajouter un bouton "vider panier" à côté de celui existant "emprunter"
3. ✅ pour un emprunt, l'indication du mail doit être facultative.

## Prochaines Étapes


### Étape 6 : bases de données pour gérer la bibliothèques et le matériel du club : EN COURS DE TEST ET FIABILISATION ET DEBUG
**Objectif :** Rendre l'application compatible pour différents types de clubs (bibliothèque ou matériel de montagne) en créant des tables distinctes dans la base de données : deux tables pour les livres et leurs emprunts (déjà implémentée mais à étoffer), et deux tables pour des articles de matériel de montagne et leurs emprunts. L'installateur humain pourra choisir s'il installe l'appli pour l'un, pour l'autre, ou pour les deux modes de fonctionnement.
L'utilisateur final pourra switcher entre deux interfaces similaires mais indépendantes, entre bibliothèque livres et matériel, à volonté, si les deux modes sont implémentés.

Il faudra créer ou mettre à jour les scripts de création des tables de la base de données pour l'installateur.

#### Détail des deux Presets

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
- Lieu de stockage (select: options à définir)

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



### Étape 7 : Améliorer la recherche d'articles au catalogue
1. ajouter des filtres de recherche suivant les champs (la base de données s'étoffera dans le futur et de nouveaux champs seront ajoutés)

### Étape 8 : Améliorer l'aspect de la GUI avec du CSS un peu plus beau. A FINIR
1. ✅ Bases posées
2. améliorer l'utilisation de tailwindcss et voir si on peut diminuer la taille du css grâce à ça.
3. quelques bugs au niveau des cartes d'articles
4. voir pour changer les pop-up navigateur par des toasts ?

### Étape 9 : Installation Automatisée
Un script d'installation automatisé sera développé pour faciliter le déploiement par d'autres clubs :
- Configuration automatique de Supabase
- Création des tables et fonctions
- Configuration des policies RLS
- Documentation d'installation simplifiée

## Conclusion

Le système est maintenant **opérationnel** avec :

- **Sécurité robuste** grâce aux fonctions PostgreSQL
- **Simplicité d'usage** préservée pour les utilisateurs
- **Fonctionnalités complètes** d'emprunt et de retour
- **Respect du principe de confiance** du club

L'application est presque prête pour utilisation en production et peut être facilement adaptée par d'autres clubs grâce au futur script d'installation automatisé.