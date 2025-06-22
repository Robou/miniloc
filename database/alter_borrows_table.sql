-- Script pour modifier la table borrows et rendre l'email facultatif
-- À exécuter dans Supabase SQL Editor

-- Modifier la colonne email pour permettre les valeurs NULL
ALTER TABLE public.borrows 
ALTER COLUMN email DROP NOT NULL;

-- Commentaire pour la documentation
COMMENT ON COLUMN public.borrows.email IS 'Email de l''emprunteur (facultatif)';