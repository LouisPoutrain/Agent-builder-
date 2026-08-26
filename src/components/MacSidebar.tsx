import React, { useState } from 'react';
import { 
  Bot, 
  Terminal, 
  FileText, 
  Code2, 
  Database, 
  CheckSquare, 
  Search, 
  Plus, 
  MoreVertical, 
  Trash2, 
  Copy, 
  Sliders,
  Sparkles
} from 'lucide-react';
import { AgentCategory, AgentDefinition } from '../types';

interface MacSidebarProps {
  agents: AgentDefinition[];
  activeAgentId: string;
  onSelectAgent: (agentId: string) => void;
  onNewAgent: () => void;
  onDuplicateAgent: (agent: AgentDefinition) => void;
  onDeleteAgent: (agentId: string) => void;
  onEditAgent: (agent: AgentDefinition) => void;
  isDarkMode: boolean;
}

export const MacSidebar: React.FC<MacSidebarProps> = ({
  agents,
  activeAgentId,
  onSelectAgent,
  onNewAgent,
  onDuplicateAgent,
  onDeleteAgent,
  onEditAgent,
  isDarkMode,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const categories: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Tous les agents', icon: <Bot className="w-3.5 h-3.5" /> },
    { id: 'development', label: 'Code & Développement', icon: <Terminal className="w-3.5 h-3.5" /> },
    { id: 'code-review', label: 'Revue de Code', icon: <Code2 className="w-3.5 h-3.5" /> },
    { id: 'data-analysis', label: 'Analyse de Données', icon: <Database className="w-3.5 h-3.5" /> },
    { id: 'planning', label: 'Planning & Productivité', icon: <CheckSquare className="w-3.5 h-3.5" /> },
    { id: 'research', label: 'Recherche & Veille', icon: <Search className="w-3.5 h-3.5" /> },
  ];

  const filteredAgents = agents.filter((agent) => {
    const matchCategory = selectedCategory === 'all' || agent.category === selectedCategory;
    const matchSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const customAgents = filteredAgents.filter(a => !a.isBuiltIn);
  const builtInAgents = filteredAgents.filter(a => a.isBuiltIn);

  return (
    <aside 
      className={`w-68 flex-shrink-0 border-r flex flex-col justify-between select-none h-full transition-colors duration-200 ${
        isDarkMode 
          ? 'bg-[#18181c]/90 border-[#2c2c30] text-neutral-300' 
          : 'bg-[#EBEBEB]/80 backdrop-blur-md border-[#D2D2D7] text-[#1D1D1F]'
      }`}
    >
      {/* Top section: Search & Categories */}
      <div className="p-4 space-y-3.5">
        {/* Search inside sidebar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B]" />
          <input
            type="text"
            id="sidebar-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrer les agents..."
            className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none transition-all ${
              isDarkMode 
                ? 'bg-neutral-900/80 border-neutral-700 text-neutral-200 placeholder-neutral-500 focus:border-blue-500' 
                : 'bg-[#F5F5F7] border-[#D2D2D7] text-[#1D1D1F] placeholder-[#86868B] focus:bg-white focus:ring-1 focus:ring-blue-500'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-neutral-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Categories Quick Filter */}
        <div className="space-y-0.5">
          <div className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-2 px-2">
            Bibliothèque
          </div>
          {categories.map((cat) => {
            const isCatActive = selectedCategory === cat.id;
            const count = cat.id === 'all' 
              ? agents.length 
              : agents.filter(a => a.category === cat.id).length;
            
            return (
              <button
                key={cat.id}
                id={`cat-btn-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isCatActive
                    ? isDarkMode
                      ? 'bg-blue-600/20 text-blue-400 font-semibold'
                      : 'bg-blue-600/10 text-blue-600 font-semibold'
                    : isDarkMode
                      ? 'hover:bg-neutral-800/60 text-neutral-400 hover:text-neutral-200'
                      : 'text-[#424245] hover:bg-[#D2D2D7]/70'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={isCatActive ? 'text-blue-600' : 'text-[#86868B]'}>{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </div>
                <span className="text-[10px] font-mono text-[#86868B]">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Center section: Agents List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4 min-h-0 custom-scrollbar">
        {/* Custom Agents Group */}
        {customAgents.length > 0 && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold tracking-wider text-[#86868B] uppercase px-2 flex items-center justify-between">
              <span>Mes Agents ({customAgents.length})</span>
            </div>
            {customAgents.map((agent) => (
              <AgentListItem
                key={agent.id}
                agent={agent}
                isActive={activeAgentId === agent.id}
                isDarkMode={isDarkMode}
                menuOpen={menuOpenId === agent.id}
                onToggleMenu={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === agent.id ? null : agent.id);
                }}
                onSelect={() => {
                  onSelectAgent(agent.id);
                  setMenuOpenId(null);
                }}
                onDuplicate={() => {
                  onDuplicateAgent(agent);
                  setMenuOpenId(null);
                }}
                onDelete={() => {
                  onDeleteAgent(agent.id);
                  setMenuOpenId(null);
                }}
                onEdit={() => {
                  onEditAgent(agent);
                  setMenuOpenId(null);
                }}
              />
            ))}
          </div>
        )}

        {/* Built-in Preset Agents Group */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold tracking-wider text-[#86868B] uppercase px-2 flex items-center justify-between">
            <span>Modèles Intégrés ({builtInAgents.length})</span>
          </div>
          {builtInAgents.length === 0 ? (
            <div className="p-3 text-center text-xs text-[#86868B] italic">
              Aucun agent trouvé.
            </div>
          ) : (
            builtInAgents.map((agent) => (
              <AgentListItem
                key={agent.id}
                agent={agent}
                isActive={activeAgentId === agent.id}
                isDarkMode={isDarkMode}
                menuOpen={menuOpenId === agent.id}
                onToggleMenu={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === agent.id ? null : agent.id);
                }}
                onSelect={() => {
                  onSelectAgent(agent.id);
                  setMenuOpenId(null);
                }}
                onDuplicate={() => {
                  onDuplicateAgent(agent);
                  setMenuOpenId(null);
                }}
                onDelete={() => {
                  onDeleteAgent(agent.id);
                  setMenuOpenId(null);
                }}
                onEdit={() => {
                  onEditAgent(agent);
                  setMenuOpenId(null);
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Bottom section: Quota status & New Agent CTA */}
      <div className={`p-4 border-t space-y-3 ${
        isDarkMode ? 'border-[#2c2c30] bg-neutral-900/40' : 'border-[#D2D2D7] bg-[#EBEBEB]/40'
      }`}>
        {/* Geometric Balance Quota Widget */}
        <div className={`p-3 rounded-xl border ${
          isDarkMode ? 'bg-neutral-900/70 border-neutral-800' : 'bg-white/60 border-[#D2D2D7]'
        }`}>
          <div className="flex items-center justify-between text-[10px] text-[#86868B] uppercase mb-1.5 font-bold tracking-wider">
            <span>Quota Gemini</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono">Actif</span>
          </div>
          <div className="h-1.5 w-full bg-[#D2D2D7] dark:bg-neutral-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-4/5 rounded-full"></div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-[#424245] dark:text-neutral-400 font-medium">
            <span>{agents.length} agents configurés</span>
            <span className="font-mono">Flash 3.7</span>
          </div>
        </div>

        <button
          id="sidebar-new-agent-btn"
          onClick={onNewAgent}
          className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-200 dark:shadow-none transition-all active:scale-98"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouvel Agent</span>
        </button>
      </div>
    </aside>
  );
};

interface AgentListItemProps {
  agent: AgentDefinition;
  isActive: boolean;
  isDarkMode: boolean;
  menuOpen: boolean;
  onToggleMenu: (e: React.MouseEvent) => void;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const AgentListItem: React.FC<AgentListItemProps> = ({
  agent,
  isActive,
  isDarkMode,
  menuOpen,
  onToggleMenu,
  onSelect,
  onDuplicate,
  onDelete,
  onEdit,
}) => {
  return (
    <div className="relative group">
      <div
        id={`agent-item-${agent.id}`}
        onClick={onSelect}
        className={`w-full flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
          isActive
            ? isDarkMode
              ? 'bg-blue-600 text-white shadow-xs font-medium'
              : 'bg-blue-600 text-white shadow-xs font-medium'
            : isDarkMode
              ? 'hover:bg-neutral-800/80 text-neutral-200'
              : 'hover:bg-[#D2D2D7]/60 text-[#1D1D1F]'
        }`}
      >
        <div className="flex items-center space-x-2.5 min-w-0 pr-1">
          <div className="text-base flex-shrink-0">{agent.icon}</div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold truncate leading-tight">{agent.name}</div>
            <div className={`text-[10px] truncate leading-tight mt-0.5 ${
              isActive ? 'text-blue-100' : 'text-[#86868B]'
            }`}>
              {agent.description}
            </div>
          </div>
        </div>

        <button
          id={`agent-menu-trigger-${agent.id}`}
          onClick={onToggleMenu}
          className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
            isActive
              ? 'text-white hover:bg-blue-700'
              : isDarkMode
                ? 'text-neutral-400 hover:bg-neutral-700 hover:text-white'
                : 'text-neutral-500 hover:bg-[#D2D2D7] hover:text-neutral-900'
          }`}
          title="Options de l'agent"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div 
          className={`absolute right-2 top-8 w-44 rounded-xl shadow-xl border z-50 py-1 text-xs animate-in fade-in-50 zoom-in-95 ${
            isDarkMode 
              ? 'bg-neutral-900 border-neutral-700 text-neutral-200' 
              : 'bg-white border-[#D2D2D7] text-[#1D1D1F]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onEdit}
            className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Modifier l'agent</span>
          </button>
          <button
            onClick={onDuplicate}
            className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-blue-600 hover:text-white transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Dupliquer</span>
          </button>
          {!agent.isBuiltIn && (
            <button
              onClick={onDelete}
              className="w-full flex items-center space-x-2 px-3 py-1.5 text-rose-500 hover:bg-rose-600 hover:text-white transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Supprimer</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
