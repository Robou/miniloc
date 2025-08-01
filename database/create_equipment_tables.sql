-- Script de création des tables pour le preset "Matériel de montagne"
-- Tables: equipment et equipment_borrows

-- Table du matériel de montagne
CREATE TABLE public.equipment (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  designation text NOT NULL,
  is_epi boolean DEFAULT false,
  type text,
  color text,
  manufacturer text,
  model text,
  size text,
  manufacturer_id text,
  club_id text,
  manufacturing_date date,
  operational_status text CHECK (operational_status IN ('excellent', 'bon', 'acceptable', 'hors_service')),
  usage_notes text,
  available boolean DEFAULT true,
  CONSTRAINT equipment_pkey PRIMARY KEY (id)
);

-- Table des emprunts de matériel
CREATE TABLE public.equipment_borrows (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  equipment_id bigint,
  name text NOT NULL,
  email text,
  borrowed_at timestamp without time zone DEFAULT now(),
  rental_price numeric(10,2),
  supervisor_name text,
  CONSTRAINT equipment_borrows_pkey PRIMARY KEY (id),
  CONSTRAINT equipment_borrows_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id)
);

-- Configuration RLS pour le matériel
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre la lecture publique du matériel
CREATE POLICY "Allow public read access on equipment" ON public.equipment
  FOR SELECT USING (true);

-- Policy pour permettre toutes les opérations aux admins authentifiés
CREATE POLICY "Allow authenticated users full access on equipment" ON public.equipment
  FOR ALL USING (auth.role() = 'authenticated');

-- Configuration RLS pour les emprunts de matériel
ALTER TABLE public.equipment_borrows ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre la lecture publique des emprunts de matériel
CREATE POLICY "Allow public read access on equipment_borrows" ON public.equipment_borrows
  FOR SELECT USING (true);

-- Policy pour permettre toutes les opérations aux admins authentifiés
CREATE POLICY "Allow authenticated users full access on equipment_borrows" ON public.equipment_borrows
  FOR ALL USING (auth.role() = 'authenticated');

-- Commentaires pour la documentation
COMMENT ON TABLE public.equipment IS 'Table du matériel de montagne';
COMMENT ON TABLE public.equipment_borrows IS 'Table des emprunts de matériel de montagne';

COMMENT ON COLUMN public.equipment.designation IS 'Désignation du matériel (requis)';
COMMENT ON COLUMN public.equipment.is_epi IS 'Équipement de Protection Individuelle (EPI)';
COMMENT ON COLUMN public.equipment.type IS 'Type de matériel';
COMMENT ON COLUMN public.equipment.color IS 'Couleur du matériel';
COMMENT ON COLUMN public.equipment.manufacturer IS 'Fabricant';
COMMENT ON COLUMN public.equipment.model IS 'Modèle';
COMMENT ON COLUMN public.equipment.size IS 'Taille';
COMMENT ON COLUMN public.equipment.manufacturer_id IS 'N° d''identification fabricant';
COMMENT ON COLUMN public.equipment.club_id IS 'N° d''identification club';
COMMENT ON COLUMN public.equipment.manufacturing_date IS 'Date de fabrication';
COMMENT ON COLUMN public.equipment.operational_status IS 'État opérationnel';
COMMENT ON COLUMN public.equipment.usage_notes IS 'Remarques d''utilisation';
COMMENT ON COLUMN public.equipment.available IS 'Disponibilité du matériel';

COMMENT ON COLUMN public.equipment_borrows.equipment_id IS 'Référence vers le matériel emprunté';
COMMENT ON COLUMN public.equipment_borrows.name IS 'Nom de l''emprunteur';
COMMENT ON COLUMN public.equipment_borrows.email IS 'Email de l''emprunteur (facultatif)';
COMMENT ON COLUMN public.equipment_borrows.borrowed_at IS 'Date et heure de l''emprunt';
COMMENT ON COLUMN public.equipment_borrows.rental_price IS 'Prix d''emprunt';
COMMENT ON COLUMN public.equipment_borrows.supervisor_name IS 'Nom de l''encadrant pour la sortie';