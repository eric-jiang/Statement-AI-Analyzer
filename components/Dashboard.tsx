import React, { useMemo, useState } from 'react';
import { ParsedTransaction } from '../types';
import { ArrowLeft, Wallet, Building2, FolderKanban, Filter, Calculator } from 'lucide-react';

interface DashboardProps {
  transactions: ParsedTransaction[];
  onReset: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, onReset }) => {
  const [activeTab, setActiveTab] = useState<'supplier' | 'project'>('supplier');
  const [filterValue, setFilterValue] = useState<string>('All');
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  // Reset selection and filter when tab changes
  const handleTabChange = (tab: 'supplier' | 'project') => {
    setActiveTab(tab);
    setFilterValue('All');
    setSelectedIndices(new Set());
  };

  // Compute global summaries
  const summary = useMemo(() => {
    const total = transactions.reduce((acc, t) => acc + t.amount, 0);
    
    const bySupplier = transactions.reduce((acc, t) => {
      const name = t.supplier || 'Unknown';
      acc[name] = (acc[name] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const byProject = transactions.reduce((acc, t) => {
      const name = t.project || 'Unassigned';
      acc[name] = (acc[name] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return { total, bySupplier, byProject };
  }, [transactions]);

  // Compute options for the dropdown based on active tab
  const filterOptions = useMemo(() => {
    const source = activeTab === 'supplier' ? summary.bySupplier : summary.byProject;
    return Object.entries(source)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by highest amount
  }, [summary, activeTab]);

  // Compute filtered transactions
  const filteredTransactions = useMemo(() => {
    if (filterValue === 'All') return transactions;
    return transactions.filter(t => {
      const val = activeTab === 'supplier' ? (t.supplier || 'Unknown') : (t.project || 'Unassigned');
      return val === filterValue;
    });
  }, [transactions, activeTab, filterValue]);

  const visibleTotal = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const selectedTotal = useMemo(() => {
    let total = 0;
    selectedIndices.forEach(idx => {
      if (idx < transactions.length) {
        total += transactions[idx].amount;
      }
    });
    return total;
  }, [selectedIndices, transactions]);

  // Selection Logic
  const isAllVisibleSelected = useMemo(() => {
    if (filteredTransactions.length === 0) return false;
    return filteredTransactions.every(t => selectedIndices.has(transactions.indexOf(t)));
  }, [filteredTransactions, selectedIndices, transactions]);

  const handleSelectAll = () => {
    const newSet = new Set(selectedIndices);
    if (isAllVisibleSelected) {
      filteredTransactions.forEach(t => newSet.delete(transactions.indexOf(t)));
    } else {
      filteredTransactions.forEach(t => newSet.add(transactions.indexOf(t)));
    }
    setSelectedIndices(newSet);
  };

  const toggleSelection = (originalIndex: number) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(originalIndex)) newSet.delete(originalIndex);
    else newSet.add(originalIndex);
    setSelectedIndices(newSet);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Wallet className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-slate-500 font-medium">Total Spend</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            ${summary.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-50 rounded-lg">
              <Building2 className="w-5 h-5 text-cyan-600" />
            </div>
            <span className="text-slate-500 font-medium">Unique Suppliers</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {Object.keys(summary.bySupplier).length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <FolderKanban className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-slate-500 font-medium">Active Projects</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {Object.keys(summary.byProject).filter(k => k !== 'Unassigned').length}
          </p>
        </div>
      </div>

      {/* View Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
        <div className="flex space-x-2 w-full sm:w-auto">
          <button
            onClick={() => handleTabChange('supplier')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'supplier'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Group by Supplier
          </button>
          <button
            onClick={() => handleTabChange('project')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'project'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Group by Project
          </button>
        </div>
        <button
          onClick={onReset}
          className="w-full sm:w-auto flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Upload New File
        </button>
      </div>

      {/* Unified Table View */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
        {/* Filter Toolbar */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-5 h-5 text-indigo-600" />
            <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
              Filter by {activeTab === 'supplier' ? 'Supplier' : 'Project'}:
            </label>
            <div className="relative flex-1 sm:w-72">
              <select
                value={filterValue}
                onChange={(e) => {
                  setFilterValue(e.target.value);
                  setSelectedIndices(new Set());
                }}
                className="appearance-none bg-white border border-slate-300 hover:border-indigo-400 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-8 py-2.5 shadow-sm transition-all"
              >
                <option value="All">All {activeTab === 'supplier' ? 'Suppliers' : 'Projects'} ({summary.total.toLocaleString(undefined, {style: 'currency', currency: 'USD'})})</option>
                {filterOptions.map((opt) => (
                  <option key={opt.name} value={opt.name}>
                    {opt.name} ({opt.value.toLocaleString(undefined, {style: 'currency', currency: 'USD'})})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm w-full sm:w-auto justify-end">
            <div className="text-slate-500 hidden sm:flex flex-col items-end">
              <span className="text-xs font-medium uppercase tracking-wide">
                {filterValue === 'All' ? 'Total Amount' : 'Filtered Total'}
              </span>
              <span className="font-bold text-slate-800 text-lg">
                ${visibleTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${selectedIndices.size > 0 ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white border-slate-200 text-slate-400'}`}>
              <Calculator className="w-4 h-4" />
              <span className="font-medium">
                 Selected: ${selectedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 font-semibold w-12">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={isAllVisibleSelected && filteredTransactions.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 focus:ring-2 cursor-pointer"
                    />
                  </div>
                </th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Supplier</th>
                <th className="px-6 py-4 font-semibold">Project</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredTransactions.length === 0 ? (
                 <tr>
                   <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                     No transactions found matching this filter.
                   </td>
                 </tr>
              ) : (
                filteredTransactions.map((t) => {
                  const originalIndex = transactions.indexOf(t);
                  const isSelected = selectedIndices.has(originalIndex);
                  return (
                    <tr 
                      key={originalIndex} 
                      className={`transition-colors cursor-pointer ${isSelected ? 'bg-indigo-50 hover:bg-indigo-100' : 'hover:bg-slate-50'}`}
                      onClick={() => toggleSelection(originalIndex)}
                    >
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => toggleSelection(originalIndex)}
                            className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 focus:ring-2 cursor-pointer"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">{t.date || '-'}</td>
                      <td className="px-6 py-4 text-slate-700 max-w-xs truncate" title={t.originalDescription}>
                        {t.originalDescription}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {t.supplier}
                      </td>
                      <td className="px-6 py-4">
                        {t.project ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {t.project}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900">
                        ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
