-- Fonctions PostgreSQL pour les opérations sur les livres

-- Fonction pour créer un emprunt de livre
CREATE OR REPLACE FUNCTION create_book_borrow(
  p_book_id INTEGER,
  p_name TEXT,
  p_email TEXT
) RETURNS JSON AS $$
DECLARE
  book_exists BOOLEAN;
  book_available BOOLEAN;
  borrow_id INTEGER;
BEGIN
  -- Vérifier que le livre existe et récupérer sa disponibilité
  SELECT EXISTS(SELECT 1 FROM books WHERE id = p_book_id), 
         COALESCE((SELECT available FROM books WHERE id = p_book_id), FALSE)
  INTO book_exists, book_available;
  
  -- Vérifier que le livre existe
  IF NOT book_exists THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Livre introuvable'
    );
  END IF;
  
  -- Vérifier que le livre est disponible
  IF NOT book_available THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Livre déjà emprunté'
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
    INSERT INTO book_borrows (book_id, name, email, borrowed_at)
    VALUES (p_book_id, TRIM(p_name),
            CASE WHEN p_email IS NULL OR TRIM(p_email) = '' THEN NULL ELSE TRIM(p_email) END,
            NOW())
    RETURNING id INTO borrow_id;
    
    -- Mettre à jour la disponibilité du livre
    UPDATE books 
    SET available = FALSE 
    WHERE id = p_book_id;
    
    -- Vérifier que la mise à jour a bien eu lieu
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Impossible de mettre à jour la disponibilité du livre';
    END IF;
    
    -- Retourner le succès avec l'ID de l'emprunt
    RETURN json_build_object(
      'success', TRUE,
      'borrow_id', borrow_id,
      'message', 'Emprunt de livre créé avec succès'
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

-- Fonction pour retourner un livre
CREATE OR REPLACE FUNCTION return_book(
  p_borrow_id bigint
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_book_id bigint;
BEGIN
  -- Récupérer l'ID du livre depuis l'emprunt
  SELECT book_id INTO v_book_id
  FROM book_borrows
  WHERE id = p_borrow_id;
  
  IF v_book_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Emprunt de livre non trouvé');
  END IF;
  
  -- Supprimer l'emprunt
  DELETE FROM book_borrows WHERE id = p_borrow_id;
  
  -- Marquer le livre comme disponible
  UPDATE books
  SET available = true
  WHERE id = v_book_id;
  
  RETURN json_build_object('success', true, 'book_id', v_book_id);
END;
$$;

-- Accorder les permissions d'exécution aux utilisateurs publics
GRANT EXECUTE ON FUNCTION create_book_borrow(INTEGER, TEXT, TEXT) TO public;
GRANT EXECUTE ON FUNCTION return_book(bigint) TO public;

-- Commentaires pour la documentation
COMMENT ON FUNCTION create_book_borrow(INTEGER, TEXT, TEXT) IS 
'Fonction pour créer un emprunt de livre de manière atomique. Vérifie la disponibilité du livre, crée l''emprunt et met à jour la disponibilité dans une seule transaction.';

COMMENT ON FUNCTION return_book(bigint) IS 
'Fonction pour retourner un livre emprunté. Supprime l''emprunt et remet le livre à disposition.';