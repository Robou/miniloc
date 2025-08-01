-- Script de création des tables pour le preset "Bibliothèque"
-- Tables: books et book_borrows

-- Table des livres
CREATE TABLE public.books (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  title text NOT NULL,
  author text,
  category text CHECK (category IN ('carte topographique', 'topo randonnée', 'topo escalade', 'topo alpinisme', 'manuel technique', 'beau livre', 'roman')),
  publisher text,
  publication_year integer,
  description text,
  keywords text,
  isbn text,
  type text CHECK (type IN ('livre', 'carte topographique')),
  storage_location text,
  available boolean DEFAULT true,
  CONSTRAINT books_pkey PRIMARY KEY (id)
);

-- Table des emprunts de livres
CREATE TABLE public.book_borrows (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  book_id bigint,
  name text NOT NULL,
  email text,
  borrowed_at timestamp without time zone DEFAULT now(),
  CONSTRAINT book_borrows_pkey PRIMARY KEY (id),
  CONSTRAINT book_borrows_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id)
);

-- Configuration RLS pour les livres
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre la lecture publique des livres
CREATE POLICY "Allow public read access on books" ON public.books
  FOR SELECT USING (true);

-- Policy pour permettre toutes les opérations aux admins authentifiés
CREATE POLICY "Allow authenticated users full access on books" ON public.books
  FOR ALL USING (auth.role() = 'authenticated');

-- Configuration RLS pour les emprunts de livres
ALTER TABLE public.book_borrows ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre la lecture publique des emprunts de livres
CREATE POLICY "Allow public read access on book_borrows" ON public.book_borrows
  FOR SELECT USING (true);

-- Policy pour permettre toutes les opérations aux admins authentifiés
CREATE POLICY "Allow authenticated users full access on book_borrows" ON public.book_borrows
  FOR ALL USING (auth.role() = 'authenticated');

-- Commentaires pour la documentation
COMMENT ON TABLE public.books IS 'Table des livres et cartes topographiques de la bibliothèque';
COMMENT ON TABLE public.book_borrows IS 'Table des emprunts de livres';

COMMENT ON COLUMN public.books.title IS 'Titre du livre (requis)';
COMMENT ON COLUMN public.books.author IS 'Auteur du livre';
COMMENT ON COLUMN public.books.category IS 'Catégorie du livre';
COMMENT ON COLUMN public.books.publisher IS 'Éditeur';
COMMENT ON COLUMN public.books.publication_year IS 'Année d''édition';
COMMENT ON COLUMN public.books.description IS 'Description du livre';
COMMENT ON COLUMN public.books.keywords IS 'Mots-clés pour la recherche';
COMMENT ON COLUMN public.books.isbn IS 'Numéro ISBN';
COMMENT ON COLUMN public.books.type IS 'Type: livre ou carte topographique';
COMMENT ON COLUMN public.books.storage_location IS 'Lieu de stockage';
COMMENT ON COLUMN public.books.available IS 'Disponibilité du livre';

COMMENT ON COLUMN public.book_borrows.book_id IS 'Référence vers le livre emprunté';
COMMENT ON COLUMN public.book_borrows.name IS 'Nom de l''emprunteur';
COMMENT ON COLUMN public.book_borrows.email IS 'Email de l''emprunteur (facultatif)';
COMMENT ON COLUMN public.book_borrows.borrowed_at IS 'Date et heure de l''emprunt';