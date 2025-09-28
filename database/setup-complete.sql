-- =====================================================
-- Script d'installation complète pour Gestionnaire d'Emprunts
-- Clubs de Sports de Montagne
--
-- Utilise l'instruction \i pour inclure les fichiers sources
-- =====================================================

\echo '🏔️  Installation du Gestionnaire d''Emprunts - Clubs de Sports de Montagne'
\echo '=========================================================================='

\echo ''
\echo '📚 Étape 1: Création des tables pour la bibliothèque...'
\i database/create_books_tables.sql

\echo ''
\echo '⛷️  Étape 2: Création des tables pour le matériel de montagne...'
\i database/create_equipment_tables.sql

\echo ''
\echo '🔧 Étape 3: Création des fonctions sécurisées...'
\i database/create_book_functions.sql
\i database/create_equipment_functions.sql

\echo ''
\echo '✅ Installation terminée avec succès !'
\echo ''
\echo '📋 Résumé :'
\echo '   ✅ Tables bibliothèque créées'
\echo '   ✅ Tables matériel créées'
\echo '   ✅ Fonctions sécurisées installées'
\echo '   ✅ Policies RLS configurées'
\echo '   ✅ Permissions accordées'
\echo ''
\echo '🎉 Votre base de données est prête pour l''application !'

-- =====================================================
-- FIN DE L'INSTALLATION
-- =====================================================