-- Fonction pour importer de l'équipement par lot
CREATE OR REPLACE FUNCTION batch_import_equipment(data JSONB)
RETURNS VOID AS $$
DECLARE
  item JSONB;
  designation TEXT;
  is_epi BOOLEAN;
  type TEXT;
  color TEXT;
  manufacturer TEXT;
  model TEXT;
  size TEXT;
  manufacturer_id TEXT;
  club_id TEXT;
  manufacturing_date DATE;
  operational_status TEXT;
  usage_notes TEXT;
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
    designation := item->>'designation';
    is_epi := COALESCE((item->>'is_epi')::BOOLEAN, false);
    type := item->>'type';
    color := item->>'color';
    manufacturer := item->>'manufacturer';
    model := item->>'model';
    size := item->>'size';
    manufacturer_id := item->>'manufacturer_id';
    club_id := item->>'club_id';
    manufacturing_date := (item->>'manufacturing_date')::DATE;
    operational_status := item->>'operational_status';
    usage_notes := item->>'usage_notes';
    available := COALESCE((item->>'available')::BOOLEAN, true);

    -- Validation des champs obligatoires
    IF designation IS NULL OR designation = '' THEN
      RAISE EXCEPTION 'La désignation est obligatoire';
    END IF;

    -- Validation du statut opérationnel
    IF operational_status IS NOT NULL AND operational_status NOT IN ('excellent', 'bon', 'acceptable', 'hors_service') THEN
      RAISE EXCEPTION 'Statut opérationnel invalide: %', operational_status;
    END IF;

    -- Insérer dans la table equipment
    INSERT INTO public.equipment (
      designation,
      is_epi,
      type,
      color,
      manufacturer,
      model,
      size,
      manufacturer_id,
      club_id,
      manufacturing_date,
      operational_status,
      usage_notes,
      available
    ) VALUES (
      designation,
      is_epi,
      type,
      color,
      manufacturer,
      model,
      size,
      manufacturer_id,
      club_id,
      manufacturing_date,
      operational_status,
      usage_notes,
      available
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;