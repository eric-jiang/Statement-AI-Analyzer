import React, { useState, useRef } from 'react';
import { Plus, X, Briefcase, Download, Upload, Trash2 } from 'lucide-react';

interface ConfigPanelProps {
  projects: string[];
  setProjects: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ projects, setProjects }) => {
  const [newProject, setNewProject] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (newProject.trim() && !projects.includes(newProject.trim())) {
      setProjects([...projects, newProject.trim()]);
      setNewProject('');
    }
  };

  const handleRemove = (projectToRemove: string) => {
    setProjects(projects.filter((p) => p !== projectToRemove));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all projects?')) {
      setProjects([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(projects, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'project_config.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
          setProjects(parsed);
        } else {
          alert('Invalid file format. Please upload a JSON file containing an array of project names.');
        }
      } catch (error) {
        alert('Failed to parse JSON file.');
      }
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-slate-800">Projects</h2>
        </div>
        <div className="flex gap-1">
           <button 
             onClick={handleImportClick} 
             className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
             title="Import Config"
           >
             <Upload className="w-4 h-4" />
           </button>
           <button 
             onClick={handleExport}
             className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
             title="Export Config"
           >
             <Download className="w-4 h-4" />
           </button>
           <input 
             type="file" 
             ref={fileInputRef}
             className="hidden" 
             accept=".json"
             onChange={handleFileChange}
           />
        </div>
      </div>
      
      <p className="text-sm text-slate-500 mb-4">
        Configure project keywords to match against transaction descriptions.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newProject}
          onChange={(e) => setNewProject(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="New Project..."
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        <button
          onClick={handleAdd}
          className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-[100px] mb-4">
        <div className="flex flex-wrap gap-2">
          {projects.length === 0 && (
            <div className="w-full text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
              <span className="text-xs italic">No projects configured.</span>
              <br/>
              <span className="text-[10px]">Import a list or add manually.</span>
            </div>
          )}
          {projects.map((project) => (
            <div
              key={project}
              className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100"
            >
              <span>{project}</span>
              <button
                onClick={() => handleRemove(project)}
                className="text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {projects.length > 0 && (
        <button
          onClick={handleClearAll}
          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 self-end mt-auto"
        >
          <Trash2 className="w-3 h-3" />
          Clear List
        </button>
      )}
    </div>
  );
};
