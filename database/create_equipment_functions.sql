-- Fonctions PostgreSQL pour les opérations sur le matériel de montagne

-- Fonction pour créer un emprunt de matériel
CREATE OR REPLACE FUNCTION create_equipment_borrow(
  p_equipment_id INTEGER,
  p_name TEXT,
  p_email TEXT,
  p_rental_price NUMERIC DEFAULT NULL,
  p_supervisor_name TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  equipment_exists BOOLEAN;
  equipment_available BOOLEAN;
  borrow_id INTEGER;
BEGIN
  -- Vérifier que le matériel existe et récupérer sa disponibilité
  SELECT EXISTS(SELECT 1 FROM equipment WHERE id = p_equipment_id), 
         COALESCE((SELECT available FROM equipment WHERE id = p_equipment_id), FALSE)
  INTO equipment_exists, equipment_available;
  
  -- Vérifier que le matériel existe
  IF NOT equipment_exists THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Matériel introuvable'
    );
  END IF;
  
  -- Vérifier que le matériel est disponible
  IF NOT equipment_available THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Matériel déjà emprunté'
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
  
  -- Validation du prix d'emprunt s'il est fourni
  IF p_rental_price IS NOT NULL AND p_rental_price < 0 THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Le prix d''emprunt ne peut pas être négatif'
    );
  END IF;
  
  -- Créer l'emprunt dans une transaction atomique
  BEGIN
    -- Insérer l'emprunt
    INSERT INTO equipment_borrows (equipment_id, name, email, borrowed_at, rental_price, supervisor_name)
    VALUES (p_equipment_id, TRIM(p_name),
            CASE WHEN p_email IS NULL OR TRIM(p_email) = '' THEN NULL ELSE TRIM(p_email) END,
            NOW(),
            p_rental_price,
            CASE WHEN p_supervisor_name IS NULL OR TRIM(p_supervisor_name) = '' THEN NULL ELSE TRIM(p_supervisor_name) END)
    RETURNING id INTO borrow_id;
    
    -- Mettre à jour la disponibilité du matériel
    UPDATE equipment 
    SET available = FALSE 
    WHERE id = p_equipment_id;
    
    -- Vérifier que la mise à jour a bien eu lieu
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Impossible de mettre à jour la disponibilité du matériel';
    END IF;
    
    -- Retourner le succès avec l'ID de l'emprunt
    RETURN json_build_object(
      'success', TRUE,
      'borrow_id', borrow_id,
      'message', 'Emprunt de matériel créé avec succès'
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

-- Fonction pour retourner du matériel
CREATE OR REPLACE FUNCTION return_equipment(
  p_borrow_id bigint
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_equipment_id bigint;
BEGIN
  -- Récupérer l'ID du matériel depuis l'emprunt
  SELECT equipment_id INTO v_equipment_id
  FROM equipment_borrows
  WHERE id = p_borrow_id;
  
  IF v_equipment_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Emprunt de matériel non trouvé');
  END IF;
  
  -- Supprimer l'emprunt
  DELETE FROM equipment_borrows WHERE id = p_borrow_id;
  
  -- Marquer le matériel comme disponible
  UPDATE equipment
  SET available = true
  WHERE id = v_equipment_id;
  
  RETURN json_build_object('success', true, 'equipment_id', v_equipment_id);
END;
$$;

-- Accorder les permissions d'exécution aux utilisateurs publics
GRANT EXECUTE ON FUNCTION create_equipment_borrow(INTEGER, TEXT, TEXT, NUMERIC, TEXT) TO public;
GRANT EXECUTE ON FUNCTION return_equipment(bigint) TO public;

-- Commentaires pour la documentation
COMMENT ON FUNCTION create_equipment_borrow(INTEGER, TEXT, TEXT, NUMERIC, TEXT) IS 
'Fonction pour créer un emprunt de matériel de manière atomique. Vérifie la disponibilité du matériel, crée l''emprunt et met à jour la disponibilité dans une seule transaction.';

COMMENT ON FUNCTION return_equipment(bigint) IS 
'Fonction pour retourner du matériel emprunté. Supprime l''emprunt et remet le matériel à disposition.';