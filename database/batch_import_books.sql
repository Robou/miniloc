-- Fonction pour importer des livres par lot
CREATE OR REPLACE FUNCTION batch_import_books(data JSONB)
RETURNS VOID AS $$
DECLARE
  item JSONB;
  title TEXT;
  author TEXT;
  category TEXT;
  publisher TEXT;
  publication_year INTEGER;
  description TEXT;
  keywords TEXT;
  isbn TEXT;
  type TEXT;
  storage_location TEXT;
  available BOOLEAN;
BEGIN
  -- Vérifier que data est un tableau
  IF jsonb_typeof(data) != 'array' THEN
    RAISE EXCEPTION 'Les données doivent être un tableau JSON';
  END IF;

  -- Parcourir chaque élément du tableau
  FOR item IN SELECT * FROM jsonb_array_elements(data)
  LOOP
    -- Extraire les valeurs
    title := item->>'title';
    author := item->>'author';
    category := item->>'category';
    publisher := item->>'publisher';
    publication_year := (item->>'publication_year')::INTEGER;
    description := item->>'description';
    keywords := item->>'keywords';
    isbn := item->>'isbn';
    type := item->>'type';
    storage_location := item->>'storage_location';
    available := COALESCE((item->>'available')::BOOLEAN, true);

    -- Validation des champs obligatoires
    IF title IS NULL OR title = '' THEN
      RAISE EXCEPTION 'Le titre est obligatoire';
    END IF;

    -- Validation de la catégorie
    IF category IS NOT NULL AND category NOT IN ('carte topographique', 'topo randonnée', 'topo escalade', 'topo alpinisme', 'manuel technique', 'beau livre', 'roman') THEN
      RAISE EXCEPTION 'Catégorie invalide: %', category;
    END IF;

    -- Validation du type
    IF type IS NOT NULL AND type NOT IN ('livre', 'carte topographique') THEN
      RAISE EXCEPTION 'Type invalide: %', type;
    END IF;

    -- Insérer dans la table books
    INSERT INTO public.books (
      title,
      author,
      category,
      publisher,
      publication_year,
      description,
      keywords,
      isbn,
      type,
      storage_location,
      available
    ) VALUES (
      title,
      author,
      category,
      publisher,
      publication_year,
      description,
      keywords,
      isbn,
      type,
      storage_location,
      available
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;