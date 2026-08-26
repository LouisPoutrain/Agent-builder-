import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  RotateCcw, 
  Globe, 
  Code, 
  FileText, 
  Layers, 
  Send, 
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Terminal,
  Zap,
  Clock,
  Eye,
  Sliders
} from 'lucide-react';
import { AgentDefinition, ExecutionRecord } from '../types';

interface AgentRunnerProps {
  agent: AgentDefinition;
  onExecute: (inputs: Record<string, string>) => Promise<ExecutionRecord | null>;
  onSendToChat: (initialPrompt: string) => void;
  onEditAgent: (agent: AgentDefinition) => void;
  isDarkMode: boolean;
}

export const AgentRunner: React.FC<AgentRunnerProps> = ({
  agent,
  onExecute,
  onSendToChat,
  onEditAgent,
  isDarkMode,
}) => {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<ExecutionRecord | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showPromptPreview, setShowPromptPreview] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('rendered');

  // Initialize input defaults when agent changes
  useEffect(() => {
    const initialValues: Record<string, string> = {};
    agent.inputVariables.forEach((v) => {
      initialValues[v.id] = v.defaultValue || '';
    });
    setInputs(initialValues);
    setCurrentResult(null);
  }, [agent.id]);

  const handleInputChange = (id: string, value: string) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleApplyPreset = (preset: Record<string, string>) => {
    setInputs(preset);
  };

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    try {
      const record = await onExecute(inputs);
      if (record) {
        setCurrentResult(record);
      }
    } finally {
      setIsRunning(false);
    }
  };

  // Keyboard shortcut: Cmd + Enter / Ctrl + Enter to run
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputs, isRunning, agent]);

  const handleCopy = () => {
    if (!currentResult?.output) return;
    navigator.clipboard.writeText(currentResult.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentResult?.output) return;
    const ext = agent.outputFormat === 'json' ? 'json' : agent.outputFormat === 'code' ? 'sh' : 'md';
    const blob = new Blob([currentResult.output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agent.id}-output.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate rendered prompt string
  const computedPrompt = agent.promptTemplate.replace(/\{\{([^}]+)\}\}/g, (_, varName) => {
    return inputs[varName.trim()] || `[${varName.trim()}]`;
  });

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden select-none transition-colors ${
      isDarkMode ? 'bg-[#121215]' : 'bg-[#F5F5F7]'
    }`}>
      {/* Header bar of the active agent */}
      <header className={`h-14 border-b flex items-center justify-between px-8 transition-colors ${
        isDarkMode ? 'bg-[#18181c]/80 border-[#2c2c30]' : 'bg-white/70 border-[#D2D2D7]'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 border border-blue-500/20 flex items-center justify-center text-lg">
            {agent.icon}
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-semibold text-[#86868B]">Agent</span>
              <span className="text-[#D2D2D7]">/</span>
              <h1 className="text-sm font-bold text-[#1D1D1F] dark:text-white uppercase tracking-tight">{agent.name}</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-neutral-200/80 dark:bg-neutral-800 text-[#424245] dark:text-neutral-300">
                {agent.model}
              </span>
              {agent.enableSearch && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" /> Web Search
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="btn-edit-agent-config"
            onClick={() => onEditAgent(agent)}
            className={`px-4 py-1.5 border rounded-full text-xs font-medium transition-colors ${
              isDarkMode 
                ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700' 
                : 'bg-white border-[#D2D2D7] text-[#424245] hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3 h-3" />
              <span>Modifier</span>
            </span>
          </button>

          <button
            id="btn-run-agent-header"
            onClick={handleRun}
            disabled={isRunning}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-semibold shadow-sm shadow-blue-200 dark:shadow-none flex items-center space-x-1.5 transition-all"
          >
            {isRunning ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Exécution...</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-white" />
                <span>Exécuter (⌘↵)</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main split workspace: Left = Input Form, Right = Output Result */}
      <div className="flex-1 p-6 md:p-8 grid grid-cols-12 gap-6 md:gap-8 overflow-y-auto custom-scrollbar">
        {/* Left Side: Parameters & Input Form (Geometric Card) */}
        <section className="col-span-12 lg:col-span-7 space-y-6">
          <div className={`p-6 rounded-2xl border shadow-sm space-y-6 ${
            isDarkMode ? 'bg-[#1a1a1f] border-[#2c2c30]' : 'bg-white border-[#D2D2D7]'
          }`}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#86868B]">
                Paramètres d'Entrée
              </h2>
              <span className="text-[10px] uppercase font-bold text-[#86868B]">
                {agent.inputVariables.length} variable{agent.inputVariables.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Sample Presets Quick Pill Bar */}
            {agent.samplePresets && agent.samplePresets.length > 0 && (
              <div className="space-y-2 p-3 rounded-xl bg-[#F5F5F7] dark:bg-neutral-900/60 border border-[#D2D2D7] dark:border-neutral-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Exemples & Scénarios rapides
                  </span>
                  <span>1 clic pour charger</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {agent.samplePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      id={`preset-btn-${idx}`}
                      onClick={() => handleApplyPreset(preset)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all font-medium ${
                        isDarkMode
                          ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-300'
                          : 'bg-white border-[#D2D2D7] hover:border-blue-500 hover:bg-blue-50/50 text-[#1D1D1F]'
                      }`}
                    >
                      Scénario {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Inputs Form */}
            <div className="space-y-4">
              {agent.inputVariables.map((variable) => (
                <div key={variable.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor={`input-${variable.id}`} className="block text-[11px] font-bold text-[#424245] dark:text-neutral-300 uppercase tracking-wide">
                      <span>{variable.label}</span>
                      {variable.required && <span className="text-rose-500 ml-1">*</span>}
                    </label>
                    {variable.description && (
                      <span className="text-[10px] text-[#86868B]">{variable.description}</span>
                    )}
                  </div>

                  {variable.type === 'textarea' ? (
                    <textarea
                      id={`input-${variable.id}`}
                      rows={4}
                      value={inputs[variable.id] || ''}
                      onChange={(e) => handleInputChange(variable.id, e.target.value)}
                      placeholder={variable.placeholder}
                      className={`w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none font-sans transition-all resize-y ${
                        isDarkMode
                          ? 'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                          : 'bg-[#F5F5F7] border-[#D2D2D7] text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white'
                      }`}
                    />
                  ) : variable.type === 'code' ? (
                    <textarea
                      id={`input-${variable.id}`}
                      rows={6}
                      value={inputs[variable.id] || ''}
                      onChange={(e) => handleInputChange(variable.id, e.target.value)}
                      placeholder={variable.placeholder}
                      className={`w-full p-3 text-xs rounded-lg border outline-none font-mono transition-all resize-y ${
                        isDarkMode
                          ? 'bg-neutral-950 border-neutral-700 text-emerald-400 placeholder-neutral-600 focus:ring-1 focus:ring-blue-500'
                          : 'bg-[#1D1D1F] border-[#D2D2D7] text-emerald-400 placeholder-neutral-500 focus:ring-1 focus:ring-blue-500'
                      }`}
                    />
                  ) : variable.type === 'select' ? (
                    <select
                      id={`input-${variable.id}`}
                      value={inputs[variable.id] || ''}
                      onChange={(e) => handleInputChange(variable.id, e.target.value)}
                      className={`w-full px-3 py-2 text-sm rounded-lg border outline-none transition-all ${
                        isDarkMode
                          ? 'bg-neutral-900 border-neutral-700 text-neutral-100 focus:ring-1 focus:ring-blue-500'
                          : 'bg-[#F5F5F7] border-[#D2D2D7] text-[#1D1D1F] focus:ring-1 focus:ring-blue-500'
                      }`}
                    >
                      {variable.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      id={`input-${variable.id}`}
                      value={inputs[variable.id] || ''}
                      onChange={(e) => handleInputChange(variable.id, e.target.value)}
                      placeholder={variable.placeholder}
                      className={`w-full px-3 py-2 text-sm rounded-lg border outline-none transition-all ${
                        isDarkMode
                          ? 'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:ring-1 focus:ring-blue-500'
                          : 'bg-[#F5F5F7] border-[#D2D2D7] text-[#1D1D1F] placeholder-[#86868B] focus:ring-1 focus:ring-blue-500 focus:bg-white'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Prompt Preview Accordion */}
            <div className="pt-3 border-t border-[#D2D2D7] dark:border-neutral-800">
              <button
                onClick={() => setShowPromptPreview(!showPromptPreview)}
                className="flex items-center space-x-1.5 text-xs text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-neutral-200 transition-colors"
              >
                {showPromptPreview ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <span className="font-medium">Aperçu des instructions et du prompt</span>
              </button>

              {showPromptPreview && (
                <div className="mt-2.5 p-3 rounded-xl bg-[#1D1D1F] text-neutral-300 font-mono text-[11px] whitespace-pre-wrap border border-black max-h-48 overflow-y-auto">
                  <div className="text-gray-500 font-bold mb-1">[CONSIGNES SYSTÈME]</div>
                  <div className="text-gray-300 mb-2">{agent.systemInstruction}</div>
                  <div className="text-gray-500 font-bold mb-1">[PROMPT RENDU]</div>
                  <div className="text-emerald-400">{computedPrompt}</div>
                </div>
              )}
            </div>

            {/* Run Action Button with pill geometry */}
            <div className="pt-2">
              <button
                id="btn-run-agent-task"
                onClick={handleRun}
                disabled={isRunning}
                className={`w-full py-2.5 px-5 rounded-full text-xs font-bold flex items-center justify-center space-x-2 text-white shadow-sm shadow-blue-200 dark:shadow-none transition-all active:scale-99 ${
                  isRunning
                    ? 'bg-blue-700 cursor-not-allowed opacity-80'
                    : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                {isRunning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Gemini exécute la tâche...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Lancer l'Agent</span>
                    <span className="text-[10px] opacity-75 font-mono">(⌘ + Entrée)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Right Side: Output Result Terminal (Geometric Dark Card) */}
        <section className="col-span-12 lg:col-span-5 flex flex-col">
          <div className="bg-[#1D1D1F] text-white p-6 rounded-2xl min-h-[480px] h-full flex flex-col border border-black shadow-xl">
            {/* Dark Card Header with Gemini Badge */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Aperçu du Modèle
                </h2>
                {currentResult && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                    ⚡ {currentResult.durationMs}ms
                  </span>
                )}
              </div>

              <div className="flex items-center px-2.5 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30 text-[10px] font-bold uppercase tracking-wide">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                {agent.model.toUpperCase()}
              </div>
            </div>

            {/* Results Content View */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {isRunning ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-center p-6">
                  <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
                  <div className="text-xs text-gray-300 font-medium italic">
                    Génération intelligente avec {agent.model}...
                  </div>
                </div>
              ) : currentResult ? (
                <div className="flex-1 flex flex-col space-y-4 overflow-y-auto custom-scrollbar pr-1">
                  {/* Grounding search citations if available */}
                  {currentResult.groundingSources && currentResult.groundingSources.length > 0 && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5 text-xs">
                      <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-blue-400" /> Sources vérifiées sur le Web :
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {currentResult.groundingSources.map((source, sIdx) => (
                          <a
                            key={sIdx}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 max-w-[240px] truncate"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span className="truncate">{source.title || source.uri}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bubble / Output display */}
                  <div className="p-4 rounded-2xl rounded-tl-none bg-white/10 border border-white/10 text-xs leading-relaxed font-sans whitespace-pre-wrap">
                    {viewMode === 'raw' ? (
                      <pre className="font-mono text-emerald-400">{currentResult.output}</pre>
                    ) : (
                      <RenderedOutput output={currentResult.output} format={agent.outputFormat} isDarkMode={true} />
                    )}
                  </div>

                  {/* Token stats */}
                  {currentResult.tokenUsage && (
                    <div className="flex items-center justify-between text-[10px] text-gray-500 px-1 font-mono">
                      <span>Tokens : {currentResult.tokenUsage.promptTokens} in / {currentResult.tokenUsage.candidatesTokens} out</span>
                      <span>Total : {currentResult.tokenUsage.totalTokens}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 text-gray-400">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                    {agent.icon}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-200">
                      Prêt pour la commande
                    </div>
                    <p className="text-[11px] text-gray-500 max-w-xs mt-1">
                      Configurez vos données à gauche et lancez l'agent pour voir les résultats ici en direct.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Output Toolbar (Actions) */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              {currentResult ? (
                <div className="flex items-center space-x-2">
                  <button
                    id="btn-copy-agent-output"
                    onClick={handleCopy}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copié !' : 'Copier'}</span>
                  </button>

                  <button
                    id="btn-download-agent-output"
                    onClick={handleDownload}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Télécharger le fichier"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setViewMode(viewMode === 'rendered' ? 'raw' : 'rendered')}
                    className="px-2.5 py-1.5 rounded-full text-[10px] font-medium bg-white/5 hover:bg-white/15 text-gray-300 transition-colors"
                  >
                    {viewMode === 'rendered' ? 'Format Brut' : 'Rendu'}
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-gray-500 font-mono">En attente d'entrée</span>
              )}

              <button
                id="btn-send-to-playground"
                onClick={() => onSendToChat(computedPrompt)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors"
                title="Continuer la discussion dans le playground"
              >
                <Send className="w-3 h-3" />
                <span>Playground</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// Component to render formatted code, markdown, or JSON
const RenderedOutput: React.FC<{ output: string; format: string; isDarkMode: boolean }> = ({
  output,
  format,
  isDarkMode,
}) => {
  if (format === 'json') {
    try {
      const parsed = JSON.parse(output);
      return (
        <pre className="text-emerald-400 font-mono text-xs whitespace-pre-wrap">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      );
    } catch {
      return <pre className="whitespace-pre-wrap font-mono text-emerald-400">{output}</pre>;
    }
  }

  return (
    <div className="whitespace-pre-wrap text-xs leading-relaxed space-y-2">
      {output}
    </div>
  );
};
