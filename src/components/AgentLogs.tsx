import React, { useState } from 'react';
import { 
  Clock, 
  Trash2, 
  Copy, 
  Check, 
  CheckCircle2, 
  XCircle,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { ExecutionRecord } from '../types';

interface AgentLogsProps {
  logs: ExecutionRecord[];
  onClearLogs: () => void;
  onSelectLog: (log: ExecutionRecord) => void;
  isDarkMode: boolean;
}

export const AgentLogs: React.FC<AgentLogsProps> = ({
  logs,
  onClearLogs,
  isDarkMode,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(logs[0]?.id || null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden select-none transition-colors ${
      isDarkMode ? 'bg-[#121215]' : 'bg-[#F5F5F7]'
    }`}>
      {/* Header */}
      <header className={`h-14 border-b flex items-center justify-between px-8 transition-colors ${
        isDarkMode ? 'bg-[#18181c]/80 border-[#2c2c30]' : 'bg-white/70 border-[#D2D2D7]'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-lg">
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#1D1D1F] dark:text-white uppercase tracking-tight">
              Historique des Exécutions & Traces
            </h1>
            <p className="text-[11px] text-[#86868B]">
              {logs.length} exécution{logs.length > 1 ? 's' : ''} enregistrée{logs.length > 1 ? 's' : ''} en local.
            </p>
          </div>
        </div>

        {logs.length > 0 && (
          <button
            onClick={onClearLogs}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border text-rose-600 hover:bg-rose-500/10 transition-colors ${
              isDarkMode ? 'border-neutral-800' : 'border-[#D2D2D7]'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Effacer l'historique</span>
          </button>
        )}
      </header>

      {/* Logs Content List */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 max-w-5xl mx-auto w-full custom-scrollbar">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EBEBEB] dark:bg-neutral-800 flex items-center justify-center text-2xl">
              📜
            </div>
            <div>
              <div className="font-semibold text-sm text-[#1D1D1F] dark:text-neutral-200">
                Aucune exécution récente
              </div>
              <p className="text-xs text-[#86868B] max-w-sm mt-1">
                Lorsque vous exécutez un agent ou un lot, chaque trace, latence et prompt sera consigné ici.
              </p>
            </div>
          </div>
        ) : (
          logs.map((log) => {
            const isExpanded = expandedId === log.id;
            return (
              <div
                key={log.id}
                className={`rounded-2xl border shadow-xs transition-all overflow-hidden ${
                  isDarkMode ? 'bg-[#1a1a1f] border-[#2c2c30]' : 'bg-white border-[#D2D2D7]'
                }`}
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="p-4 md:px-5 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {log.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#1D1D1F] dark:text-white">
                          {log.agentName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F5F5F7] dark:bg-neutral-800 text-[#424245] dark:text-neutral-300 font-medium">
                          {log.model}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#86868B] mt-0.5">
                        {new Date(log.timestamp).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-medium text-[#86868B]">
                      ⚡ {log.durationMs}ms
                    </span>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-[#86868B]" /> : <ChevronRight className="w-4 h-4 text-[#86868B]" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className={`p-5 pt-0 border-t space-y-4 text-xs mt-3 ${
                    isDarkMode ? 'border-[#2c2c30]' : 'border-[#D2D2D7]'
                  }`}>
                    {/* Inputs */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">Entrées fournies :</div>
                      <pre className={`p-3 rounded-xl font-mono text-[11px] overflow-x-auto ${
                        isDarkMode ? 'bg-neutral-950 text-neutral-300' : 'bg-[#F5F5F7] text-[#1D1D1F]'
                      }`}>
                        {JSON.stringify(log.inputs, null, 2)}
                      </pre>
                    </div>

                    {/* Output */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B]">Résultat généré :</span>
                        <button
                          onClick={() => handleCopy(log.id, log.output)}
                          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            copiedId === log.id
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : isDarkMode
                                ? 'bg-neutral-800 border-neutral-700 text-neutral-300'
                                : 'bg-white border-[#D2D2D7] text-[#424245] hover:bg-[#F5F5F7]'
                          }`}
                        >
                          {copiedId === log.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === log.id ? 'Copié !' : 'Copier'}</span>
                        </button>
                      </div>
                      <pre className={`p-4 rounded-xl font-mono text-[11px] overflow-x-auto whitespace-pre-wrap ${
                        isDarkMode ? 'bg-neutral-950 text-emerald-400' : 'bg-[#1D1D1F] text-emerald-400'
                      }`}>
                        {log.output}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
