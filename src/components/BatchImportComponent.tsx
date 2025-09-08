import React, { useState } from 'react';
import Papa from 'papaparse';
import supabase from '../lib/supabase';
import toast from 'react-hot-toast';

interface BatchImportComponentProps {
  mode: 'books' | 'equipment';
}

const BatchImportComponent: React.FC<BatchImportComponentProps> = ({ mode }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const expectedColumns =
    mode === 'books'
      ? [
          'title',
          'author',
          'category',
          'publisher',
          'publication_year',
          'description',
          'keywords',
          'isbn',
          'type',
          'storage_location',
          'available',
        ]
      : [
          'designation',
          'is_epi',
          'type',
          'color',
          'manufacturer',
          'model',
          'size',
          'manufacturer_id',
          'club_id',
          'manufacturing_date',
          'operational_status',
          'usage_notes',
          'available',
        ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast.error('Veuillez sélectionner un fichier CSV valide.');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        quoteChar: '"',
        escapeChar: '"',
      });

      if (result.errors.length > 0) {
        toast.error('Erreur lors du parsing du CSV.');
        return;
      }

      const data = result.data as any[];
      if (data.length === 0) {
        toast.error('Le fichier CSV est vide.');
        return;
      }

      // Vérifier les colonnes
      const csvColumns = Object.keys(data[0]);
      const missingColumns = expectedColumns.filter((col) => !csvColumns.includes(col));
      if (missingColumns.length > 0) {
        toast.error(`Colonnes manquantes : ${missingColumns.join(', ')}`);
        return;
      }

      // Appeler la fonction SQL
      const functionName = mode === 'books' ? 'batch_import_books' : 'batch_import_equipment';
      const { error } = await supabase.rpc(functionName, { data });

      if (error) {
        toast.error(`Erreur lors de l'import : ${error.message}`);
      } else {
        toast.success('Import réussi !');
        setFile(null);
      }
    } catch {
      toast.error('Erreur lors du traitement du fichier.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-8 rounded-lg border bg-gray-50 p-4">
      <h3 className="mb-4 text-lg font-semibold">
        Import par lot - {mode === 'books' ? 'Livres' : 'Équipement'}
      </h3>
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Sélectionner un fichier CSV</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="btn btn-primary disabled:opacity-50"
        >
          {isUploading ? 'Import en cours...' : 'Importer'}
        </button>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>Colonnes attendues : {expectedColumns.join(', ')}</p>
        <p>Note : Les colonnes 'id' et 'created_at' seront ignorées si présentes.</p>
      </div>
    </div>
  );
};

export default BatchImportComponent;
