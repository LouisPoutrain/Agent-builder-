import React, { useState, useEffect } from 'react';
import { Search, Plus, CornerDownLeft, X } from 'lucide-react';
import { AgentDefinition } from '../types';

interface SpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AgentDefinition[];
  onSelectAgent: (agentId: string) => void;
  onNewAgent: () => void;
  isDarkMode: boolean;
}

export const SpotlightModal: React.FC<SpotlightModalProps> = ({
  isOpen,
  onClose,
  agents,
  onSelectAgent,
  onNewAgent,
  isDarkMode,
}) => {
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filtered = agents.filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase()) ||
    a.description.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onSelectAgent(filtered[selectedIndex].id);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose, onSelectAgent]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50 backdrop-blur-xs p-4 animate-in fade-in-50 duration-150"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden transition-all duration-150 ${
          isDarkMode 
            ? 'bg-[#18181c] border-[#2c2c30] text-white' 
            : 'bg-white border-[#D2D2D7] text-[#1D1D1F]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Spotlight Search Header */}
        <div className={`p-4 border-b flex items-center space-x-3 ${
          isDarkMode ? 'border-[#2c2c30]' : 'border-[#D2D2D7]'
        }`}>
          <Search className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <input
            type="text"
            id="spotlight-query-input"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Rechercher un agent Mac, une tâche, un mot-clé..."
            className="w-full bg-transparent text-sm font-medium outline-none placeholder-[#86868B]"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#86868B] space-y-2">
              <p>Aucun agent ne correspond à « {query} »</p>
              <button
                onClick={() => {
                  onClose();
                  onNewAgent();
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Créer un agent pour cette tâche</span>
              </button>
            </div>
          ) : (
            filtered.map((agent, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={agent.id}
                  id={`spotlight-item-${agent.id}`}
                  onClick={() => {
                    onSelectAgent(agent.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isDarkMode
                        ? 'hover:bg-neutral-800 text-neutral-200'
                        : 'hover:bg-[#F5F5F7] text-[#1D1D1F]'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-2">
                    <span className="text-xl flex-shrink-0">{agent.icon}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate flex items-center gap-1.5">
                        <span>{agent.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium font-mono ${
                          isSelected ? 'bg-blue-700 text-blue-100' : isDarkMode ? 'bg-neutral-800 text-neutral-400' : 'bg-[#EBEBEB] text-[#424245]'
                        }`}>
                          {agent.category}
                        </span>
                      </div>
                      <div className={`text-[11px] truncate mt-0.5 ${
                        isSelected ? 'text-blue-100' : 'text-[#86868B]'
                      }`}>
                        {agent.description}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center space-x-1 text-[11px] font-mono text-blue-100 flex-shrink-0">
                      <span>Ouvrir</span>
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className={`p-3 px-4 border-t flex items-center justify-between text-[11px] text-[#86868B] ${
          isDarkMode ? 'border-[#2c2c30]' : 'border-[#D2D2D7]'
        }`}>
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-md bg-[#EBEBEB] dark:bg-neutral-800 text-[#424245] dark:text-neutral-300 font-mono text-[10px]">↑↓</kbd> Naviguer
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-md bg-[#EBEBEB] dark:bg-neutral-800 text-[#424245] dark:text-neutral-300 font-mono text-[10px]">↵</kbd> Sélectionner
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-md bg-[#EBEBEB] dark:bg-neutral-800 text-[#424245] dark:text-neutral-300 font-mono text-[10px]">esc</kbd> Fermer
            </span>
          </div>

          <button
            onClick={() => {
              onClose();
              onNewAgent();
            }}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-500 font-semibold"
          >
            <Plus className="w-3 h-3" />
            <span>Nouvel Agent</span>
          </button>
        </div>
      </div>
    </div>
  );
};
