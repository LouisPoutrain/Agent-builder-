import React from 'react';
import { 
  Search, 
  Plus, 
  Sun, 
  Moon, 
  Play, 
  Sliders, 
  MessageSquare, 
  Layers, 
  Share2, 
  Clock,
  Sparkles
} from 'lucide-react';
import { ActiveTab, AgentDefinition } from '../types';

interface MacTitleBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeAgent: AgentDefinition | null;
  onNewAgent: () => void;
  onOpenSpotlight: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  apiKeyConfigured: boolean;
}

export const MacTitleBar: React.FC<MacTitleBarProps> = ({
  activeTab,
  setActiveTab,
  activeAgent,
  onNewAgent,
  onOpenSpotlight,
  isDarkMode,
  setIsDarkMode,
  apiKeyConfigured,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'runner', label: 'Exécuter', icon: <Play className="w-3.5 h-3.5" /> },
    { id: 'builder', label: 'Studio Builder', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'chat', label: 'Playground', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'export', label: 'Export', icon: <Share2 className="w-3.5 h-3.5" /> },
    { id: 'history', label: 'Activité', icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className={`h-14 border-b flex items-center justify-between px-5 select-none transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-[#18181b]/90 border-[#2c2c30] text-[#f4f4f7]' 
        : 'bg-white/80 border-[#D2D2D7] text-[#1D1D1F]'
    } backdrop-blur-md sticky top-0 z-30`}>
      {/* Left: Geometric Logo & App Breadcrumbs */}
      <div className="flex items-center space-x-3.5">
        {/* Geometric Balance Logo */}
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow-xs">
            <div className="w-3.5 h-3.5 bg-white rounded-xs rotate-45 transform"></div>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="font-bold text-sm tracking-tight text-[#1D1D1F] dark:text-white">GeminiForge</span>
            <span className="text-[10px] uppercase font-semibold text-[#86868B] tracking-wider hidden sm:inline">Dev Studio</span>
          </div>
        </div>

        {activeAgent && (
          <div className="hidden lg:flex items-center space-x-2 pl-2">
            <span className="text-[#D2D2D7] text-xs font-light">/</span>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#1D1D1F] dark:text-neutral-200 uppercase tracking-tight px-2.5 py-1 rounded-md bg-[#F5F5F7] dark:bg-neutral-800/80 border border-[#D2D2D7] dark:border-neutral-700 max-w-[200px] truncate">
              <span>{activeAgent.icon}</span>
              <span className="truncate">{activeAgent.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Center: Segmented Navigation Control with Geometric Balance pill styling */}
      <nav aria-label="App navigation" className={`flex items-center p-1 rounded-xl border text-xs ${
        isDarkMode 
          ? 'bg-neutral-900/90 border-neutral-800' 
          : 'bg-[#F5F5F7] border-[#D2D2D7]'
      }`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all duration-150 text-xs font-medium ${
                isActive
                  ? isDarkMode
                    ? 'bg-neutral-800 text-white shadow-xs font-semibold'
                    : 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                  : isDarkMode
                    ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                    : 'text-[#424245] hover:text-[#1D1D1F] hover:bg-[#EBEBEB]'
              }`}
            >
              {tab.icon}
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Quick Actions (Spotlight, New Agent, Dark Mode, Status) */}
      <div className="flex items-center space-x-2.5">
        {/* Spotlight Cmd+K */}
        <button
          id="btn-spotlight-search"
          onClick={onOpenSpotlight}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            isDarkMode 
              ? 'bg-neutral-800/70 border-neutral-700 text-neutral-300 hover:bg-neutral-800' 
              : 'bg-white border-[#D2D2D7] text-[#424245] hover:bg-gray-50 shadow-2xs'
          }`}
          title="Recherche rapide d'agent (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-[#86868B]" />
          <span className="hidden sm:inline text-xs text-[#86868B]">Rechercher</span>
          <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F5F5F7] dark:bg-neutral-700 text-[#86868B] dark:text-neutral-300 border border-[#D2D2D7] dark:border-neutral-600">
            ⌘K
          </kbd>
        </button>

        {/* New Agent Button with pill & subtle blue shadow */}
        <button
          id="btn-new-agent-top"
          onClick={onNewAgent}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-200 dark:shadow-none transition-all active:scale-98"
          title="Créer un nouvel agent spécialisé"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Créer</span>
        </button>

        {/* Theme Toggle */}
        <button
          id="btn-theme-toggle"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2 rounded-full text-xs border transition-colors ${
            isDarkMode
              ? 'bg-neutral-800 border-neutral-700 text-amber-400 hover:bg-neutral-700'
              : 'bg-white border-[#D2D2D7] text-[#424245] hover:bg-gray-50'
          }`}
          title={isDarkMode ? "Passer en mode clair" : "Passer en mode sombre"}
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Gemini API Status Badge */}
        <div 
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
            apiKeyConfigured
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
          }`}
          title={apiKeyConfigured ? "Connecté à Google Gemini" : "Prêt avec Gemini API"}
        >
          <Sparkles className="w-3 h-3 animate-pulse" />
          <span className="hidden lg:inline">Gemini 3.7</span>
        </div>
      </div>
    </header>
  );
};
