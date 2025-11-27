import React, { useState, useEffect } from 'react';
import { ConfigPanel } from './components/ConfigPanel';
import { UploadSection } from './components/UploadSection';
import { Dashboard } from './components/Dashboard';
import { ParsedTransaction, ViewMode } from './types';
import { processStatementWithGemini } from './services/geminiService';
import { INITIAL_PROJECTS } from './data/projects';
import { LayoutDashboard } from 'lucide-react';

const App: React.FC = () => {
  // Initialize from localStorage if available, otherwise use the empty default from code
  const [projects, setProjects] = useState<string[]>(() => {
    const saved = localStorage.getItem('statement_ai_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.UPLOAD);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);

  // Persist project changes to localStorage
  useEffect(() => {
    localStorage.setItem('statement_ai_projects', JSON.stringify(projects));
  }, [projects]);

  const handleProcess = async (csvContent: string) => {
    setIsProcessing(true);
    setProgress(0);
    try {
      const results = await processStatementWithGemini(csvContent, projects, setProgress);
      setTransactions(results);
      setViewMode(ViewMode.DASHBOARD);
    } catch (error) {
      console.error('Processing failed', error);
      alert('Failed to process the CSV. Please try again or check the console.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleReset = () => {
    setTransactions([]);
    setViewMode(ViewMode.UPLOAD);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Statement AI
            </span>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === ViewMode.UPLOAD ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <ConfigPanel projects={projects} setProjects={setProjects} />
            </div>
            <div className="lg:col-span-2">
              <UploadSection 
                onProcess={handleProcess} 
                isProcessing={isProcessing} 
                progress={progress} 
              />
              
              {/* Instructions / Demo Info */}
              <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
                <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                  <li>Configure your project names in the left panel.</li>
                  <li>Upload a bank statement CSV (headers in row 1).</li>
                  <li>Gemini will extract clean supplier names (ignoring invoice IDs).</li>
                  <li>It matches descriptions to your configured projects.</li>
                  <li>Amounts are extracted from the Debit/Amount column automatically.</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <Dashboard transactions={transactions} onReset={handleReset} />
        )}
      </main>
    </div>
  );
};

export default App;
