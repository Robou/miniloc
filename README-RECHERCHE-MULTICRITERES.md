# Recherche Multicritères - Documentation

## Vue d'ensemble

La fonctionnalité de recherche multicritères permet aux utilisateurs de filtrer les articles et livres selon plusieurs critères simultanément, offrant une recherche plus précise et flexible.

## Fonctionnalités implémentées

### Pour les livres
- **Titre** : Recherche textuelle dans le titre du livre
- **Auteur** : Recherche textuelle dans le nom de l'auteur
- **Type** : Sélection parmi "livre" ou "carte topographique"
- **Catégorie** : Sélection parmi :
  - carte topographique
  - topo randonnée
  - topo escalade
  - topo alpinisme
  - manuel technique
  - beau livre
  - roman
- **Éditeur** : Recherche textuelle dans le nom de l'éditeur
- **Année de publication** : Recherche exacte sur l'année
- **ISBN** : Recherche textuelle (utile avec scanner de codes-barres)
- **Emplacement de stockage** : Recherche textuelle
- **Mots-clés** : Recherche textuelle dans les mots-clés

### Pour les articles de montagne
- **Désignation** : Recherche textuelle dans la désignation
- **Type** : Recherche textuelle
- **Couleur** : Recherche textuelle
- **Fabricant** : Recherche textuelle
- **Modèle** : Recherche textuelle
- **État opérationnel** : Sélection parmi :
  - excellent
  - bon
  - acceptable
  - hors_service
- **ID Fabricant** : Recherche textuelle (utile avec scanner)
- **ID Club** : Recherche textuelle (utile avec scanner)
- **EPI** : Case à cocher pour filtrer les équipements de protection individuelle

## Utilisation

### Interface utilisateur
1. **Recherche simple** : Utilisez la barre de recherche principale pour une recherche rapide (rétrocompatible)
2. **Recherche avancée** : Cliquez sur "Recherche avancée" pour afficher le formulaire multicritères
3. **Combinaison de critères** : Remplissez autant de champs que souhaité - tous les critères sont combinés avec un ET logique
4. **Réinitialisation** : Videz les champs pour revenir à la recherche simple

### Logique de filtrage
- La recherche respecte la casse (insensible à la casse)
- Les champs vides sont ignorés
- Pour les champs de sélection, seule la valeur exacte correspond
- La recherche simple reste disponible pour la compatibilité

## Architecture technique

### Types TypeScript
```typescript
// Types de critères de recherche
export type BookSearchCriteria = {
  title?: string;
  author?: string;
  type?: 'livre' | 'carte topographique';
  category?: 'carte topographique' | 'topo randonnée' | ...;
  // ... autres champs
};

export type ArticleSearchCriteria = {
  designation?: string;
  type?: string;
  color?: string;
  // ... autres champs
};
```

### Composants modifiés
1. **`src/types/AppMode.tsx`** : Ajout des types SearchCriteria
2. **`src/components/ui/SearchBar.tsx`** : Interface utilisateur avec formulaire avancé
3. **`src/components/CatalogTab.tsx`** : Logique de filtrage multicritères

### État et gestion
- État local `advancedCriteria` dans CatalogTab
- Callback `onAdvancedSearchChange` pour mettre à jour les critères
- Filtrage en temps réel lors des changements

## Compatibilité
- **Rétrocompatible** : La recherche simple fonctionne comme avant
- **Mode adaptatif** : L'interface s'adapte selon le mode (articles/livres)
- **Performance** : Filtrage optimisé avec early returns

## Évolutions futures
- Tables de référence pour éditeur, fabricant, couleur, storage_location
- Recherche par plage de dates
- Recherche par mots-clés multiples
- Historique des recherches
- Export des résultats filtrés

## Tests
L'implémentation a été testée avec :
- Recherche simple (rétrocompatibilité)
- Combinaisons de critères multiples
- Changement de mode (articles/livres)
- Interface responsive
- Gestion des champs vides

---
*Document créé le 05/09/2025*