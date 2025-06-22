CREATE OR REPLACE FUNCTION return_article(
  p_borrow_id bigint
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_article_id bigint;
BEGIN
  -- Récupérer l'ID de l'article depuis l'emprunt
  SELECT article_id INTO v_article_id
  FROM borrows
  WHERE id = p_borrow_id;
  
  IF v_article_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Emprunt non trouvé');
  END IF;
  
  -- Supprimer l'emprunt
  DELETE FROM borrows WHERE id = p_borrow_id;
  
  -- Marquer l'article comme disponible
  UPDATE articles
  SET available = true
  WHERE id = v_article_id;
  
  RETURN json_build_object('success', true, 'article_id', v_article_id);
END;
$$;

GRANT EXECUTE ON FUNCTION return_article TO public;