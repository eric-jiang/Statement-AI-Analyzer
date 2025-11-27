import React, { useState } from 'react';
import { Plus, X, Briefcase } from 'lucide-react';

interface ConfigPanelProps {
  projects: string[];
  setProjects: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ projects, setProjects }) => {
  const [newProject, setNewProject] = useState('');

  const handleAdd = () => {
    if (newProject.trim() && !projects.includes(newProject.trim())) {
      setProjects([...projects, newProject.trim()]);
      setNewProject('');
    }
  };

  const handleRemove = (projectToRemove: string) => {
    setProjects(projects.filter((p) => p !== projectToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-slate-800">Project Configuration</h2>
      </div>
      
      <p className="text-sm text-slate-500 mb-4">
        Add project names here. The AI will look for these names in your bank statement descriptions.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newProject}
          onChange={(e) => setNewProject(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Alpha Upgrade"
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        <button
          onClick={handleAdd}
          className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {projects.length === 0 && (
          <span className="text-xs text-slate-400 italic">No projects configured.</span>
        )}
        {projects.map((project) => (
          <div
            key={project}
            className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
          >
            <span>{project}</span>
            <button
              onClick={() => handleRemove(project)}
              className="text-indigo-400 hover:text-indigo-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
