import React, { useState } from 'react';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';

interface UploadSectionProps {
  onProcess: (fileContent: string) => Promise<void>;
  isProcessing: boolean;
  progress: number;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onProcess, isProcessing, progress }) => {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        await onProcess(content);
      }
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsText(file);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
      <div className="mb-6 flex justify-center">
        <div className="p-4 bg-indigo-50 rounded-full">
          {isProcessing ? (
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-indigo-600" />
          )}
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-800 mb-2">
        {isProcessing ? 'Analyzing Statement...' : 'Upload Bank Statement'}
      </h2>
      
      <p className="text-slate-500 mb-6 max-w-md mx-auto">
        {isProcessing
          ? `Extracting suppliers and matching projects using Gemini 2.5 Flash... (${progress}%)`
          : 'Select a CSV file containing your bank transactions. The AI will automatically identify suppliers and projects.'}
      </p>

      {!isProcessing && (
        <div className="relative inline-block">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Select CSV File
          </label>
        </div>
      )}

      {fileName && !isProcessing && !error && (
        <div className="mt-4 text-sm text-green-600 font-medium">
          File loaded: {fileName}
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center justify-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {isProcessing && (
        <div className="mt-6 w-full max-w-md mx-auto bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};
