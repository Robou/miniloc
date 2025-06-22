-- Fonction PostgreSQL pour créer un emprunt de manière atomique
-- Cette fonction gère la création de l'emprunt ET la mise à jour de disponibilité
-- dans une seule transaction pour éviter les problèmes de permissions RLS

CREATE OR REPLACE FUNCTION create_borrow(
  p_article_id INTEGER,
  p_name TEXT,
  p_email TEXT
) RETURNS JSON AS $$
DECLARE
  article_exists BOOLEAN;
  article_available BOOLEAN;
  borrow_id INTEGER;
BEGIN
  -- Vérifier que l'article existe et récupérer sa disponibilité
  SELECT EXISTS(SELECT 1 FROM articles WHERE id = p_article_id), 
         COALESCE((SELECT available FROM articles WHERE id = p_article_id), FALSE)
  INTO article_exists, article_available;
  
  -- Vérifier que l'article existe
  IF NOT article_exists THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Article introuvable'
    );
  END IF;
  
  -- Vérifier que l'article est disponible
  IF NOT article_available THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Article déjà emprunté'
    );
  END IF;
  
  -- Valider les paramètres d'entrée
  IF p_name IS NULL OR TRIM(p_name) = '' THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Le nom de l''emprunteur est requis'
    );
  END IF;
  
  -- Validation de l'email seulement s'il est fourni
  IF p_email IS NOT NULL AND TRIM(p_email) != '' THEN
    -- Validation basique de l'email
    IF p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RETURN json_build_object(
        'success', FALSE,
        'error', 'Format d''email invalide'
      );
    END IF;
  END IF;
  
  -- Créer l'emprunt dans une transaction atomique
  BEGIN
    -- Insérer l'emprunt
    INSERT INTO borrows (article_id, name, email, borrowed_at)
    VALUES (p_article_id, TRIM(p_name),
            CASE WHEN p_email IS NULL OR TRIM(p_email) = '' THEN NULL ELSE TRIM(p_email) END,
            NOW())
    RETURNING id INTO borrow_id;
    
    -- Mettre à jour la disponibilité de l'article
    UPDATE articles 
    SET available = FALSE 
    WHERE id = p_article_id;
    
    -- Vérifier que la mise à jour a bien eu lieu
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Impossible de mettre à jour la disponibilité de l''article';
    END IF;
    
    -- Retourner le succès avec l'ID de l'emprunt
    RETURN json_build_object(
      'success', TRUE,
      'borrow_id', borrow_id,
      'message', 'Emprunt créé avec succès'
    );
    
  EXCEPTION
    WHEN OTHERS THEN
      -- En cas d'erreur, la transaction sera automatiquement annulée
      RETURN json_build_object(
        'success', FALSE,
        'error', 'Erreur lors de la création de l''emprunt: ' || SQLERRM
      );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accorder les permissions d'exécution aux utilisateurs publics
GRANT EXECUTE ON FUNCTION create_borrow(INTEGER, TEXT, TEXT) TO public;

-- Commentaire pour la documentation
COMMENT ON FUNCTION create_borrow(INTEGER, TEXT, TEXT) IS 
'Fonction pour créer un emprunt de manière atomique. Vérifie la disponibilité de l''article, crée l''emprunt et met à jour la disponibilité dans une seule transaction.';