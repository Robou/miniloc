#!/bin/bash

# Script d'installation automatique pour Supabase
# Gestionnaire d'Emprunts pour Clubs de Sports de Montagne

set -e

echo "🏔️  Configuration automatique de Supabase pour le Gestionnaire d'Emprunts"
echo "=========================================================================="

# Vérifier si les outils nécessaires sont installés
command -v curl >/dev/null 2>&1 || { echo "❌ curl est requis mais n'est pas installé. Installez-le d'abord."; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "❌ jq est requis mais n'est pas installé. Installez-le d'abord."; exit 1; }

# Demander les informations à l'utilisateur
echo ""
echo "📝 Informations de configuration Supabase :"
echo ""

# Demander le nom du projet
read -p "Nom de votre club/organisation (ex: CAF-Avignon): " PROJECT_NAME

# Créer un nom de projet URL-friendly
PROJECT_SLUG=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')

# Générer un mot de passe admin
ADMIN_PASSWORD=$(openssl rand -base64 12)

echo ""
echo "🔧 Configuration :"
echo "   Nom du projet : $PROJECT_NAME"
echo "   Slug projet : $PROJECT_SLUG"
echo "   Mot de passe admin généré : $ADMIN_PASSWORD"
echo ""

read -p "Voulez-vous continuer avec ces paramètres ? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Installation annulée."
    exit 1
fi

echo ""
echo "🔄 Création du projet Supabase..."

# Créer le projet Supabase via l'API
# Note: Cette partie nécessiterait un token d'API Supabase
# Pour l'instant, on affiche les instructions manuelles

echo ""
echo "⚠️  Création manuelle du projet Supabase :"
echo ""
echo "1. Allez sur https://supabase.com/dashboard"
echo "2. Cliquez sur 'New Project'"
echo "3. Renseignez :"
echo "   - Name: $PROJECT_NAME"
echo "   - Database Password: $ADMIN_PASSWORD"
echo "   - Region: choisissez la plus proche de vous"
echo "4. Attendez la création du projet (2-3 minutes)"
echo ""

echo "📋 Une fois le projet créé, notez ces informations :"
echo "   - Project URL: https://xxxxxxxxx.supabase.co"
echo "   - Project API keys > anon public key: eyJ..."
echo ""

read -p "Votre projet Supabase est-il créé ? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "✅ Vous pouvez relancer ce script quand votre projet sera créé."
    exit 0
fi

# Demander les informations du projet créé
read -p "Project URL (https://xxxxxxxxx.supabase.co): " SUPABASE_URL
read -p "Anon public key: " SUPABASE_ANON_KEY

# Nettoyer l'URL
SUPABASE_URL=$(echo "$SUPABASE_URL" | sed 's:/*$::')

echo ""
echo "🔧 Configuration des tables et fonctions..."

# Créer le fichier .env.local
cat > .env.local << EOF
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF

echo "✅ Fichier .env.local créé"

# Vérifier que le script d'installation existe
if [[ ! -f "database/setup-complete.sql" ]]; then
    echo "❌ Fichier database/setup-complete.sql manquant"
    echo "   Assurez-vous que le script d'installation est présent."
    exit 1
fi

echo "✅ Script d'installation trouvé : database/setup-complete.sql"

echo ""
echo "📊 Installation automatique de la base de données..."
echo ""
echo "🔐 Pour des raisons de sécurité, nous devons utiliser l'interface web de Supabase."
echo ""
echo "📋 Instructions pour finaliser l'installation :"
echo ""
echo "1. Allez sur votre dashboard Supabase : $SUPABASE_URL"
echo "2. Ouvrez l'onglet 'SQL Editor'"
echo "3. Copiez/collez le contenu du fichier 'database/setup-complete.sql'"
echo "4. Cliquez sur 'Run' pour exécuter tout le script"
echo ""
echo "💡 Le script va créer :"
echo "   ✅ Tables (books, equipment, emprunts)"
echo "   ✅ Fonctions sécurisées"
echo "   ✅ Policies RLS"
echo "   ✅ Permissions d'accès"
echo ""
echo "📝 Le script utilise la syntaxe PostgreSQL \\i pour inclure :"
echo "   - database/create_books_tables.sql"
echo "   - database/create_equipment_tables.sql"
echo "   - database/create_book_functions.sql"
echo "   - database/create_equipment_functions.sql"
echo ""

read -p "Avez-vous exécuté le script database/setup-complete.sql ? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "⚠️  N'oubliez pas d'exécuter le script SQL avant de continuer !"
    echo ""
    echo "📄 Le fichier database/setup-complete.sql contient tout le nécessaire."
    echo "Vous pouvez relancer ce script une fois l'exécution terminée."
    exit 0
fi

echo ""
echo "🎉 Configuration terminée avec succès !"
echo ""
echo "📝 Résumé de l'installation :"
echo "✅ Projet Supabase créé"
echo "✅ Tables configurées"
echo "✅ Fonctions sécurisées installées"
echo "✅ Variables d'environnement configurées"
echo "✅ Sécurité (RLS) activée"
echo ""

echo "🚀 Prochaines étapes :"
echo ""
echo "1. Test de l'application :"
echo "   npm run dev"
echo ""
echo "2. Configuration des modes (optionnel) :"
echo "   - Ouvrez l'application"
echo "   - Connectez-vous en admin"
echo "   - Configurez les modes Bibliothèque/Matériel"
echo ""
echo "3. Import des données :"
echo "   - Onglet Admin > Import en batch"
echo "   - Importez vos livres et matériel"
echo ""
echo "4. Déploiement (optionnel) :"
echo "   - Configurez AWS Amplify"
echo "   - Déployez avec amplify.yml"
echo ""

echo "🔗 Liens utiles :"
echo "📖 Documentation Supabase : https://supabase.com/docs"
echo "🏔️  README complet : ./README.md"
echo "💻 Code source : src/"
echo ""

echo "✅ Installation terminée ! Votre application est prête à être utilisée."