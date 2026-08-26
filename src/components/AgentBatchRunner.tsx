import React, { useState } from 'react';
import { 
  Layers, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileSpreadsheet,
  FileJson
} from 'lucide-react';
import { AgentDefinition } from '../types';

interface AgentBatchRunnerProps {
  agent: AgentDefinition;
  isDarkMode: boolean;
}

interface BatchItem {
  id: string;
  input: string;
  output?: string;
  status: 'idle' | 'running' | 'success' | 'error';
  durationMs?: number;
  error?: string;
}

export const AgentBatchRunner: React.FC<AgentBatchRunnerProps> = ({
  agent,
  isDarkMode,
}) => {
  const [rawTextLines, setRawTextLines] = useState<string>(
    `Rédiger un email de relance après 5 jours sans réponse
Demander un compte-rendu de réunion urgent
Féliciter un collaborateur pour la signature d'un gros contrat`
  );
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleParseLines = () => {
    const lines = rawTextLines
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    const items: BatchItem[] = lines.map((line, idx) => ({
      id: `item-${idx + 1}`,
      input: line,
      status: 'idle',
    }));

    setBatchItems(items);
  };

  const handleRunBatch = async () => {
    if (batchItems.length === 0) {
      handleParseLines();
    }
    const currentItems = batchItems.length > 0 ? batchItems : rawTextLines.split('\n').filter(Boolean).map((l, i) => ({ id: `item-${i+1}`, input: l.trim(), status: 'idle' as const }));
    
    if (currentItems.length === 0) return;

    setIsProcessing(true);
    setBatchItems(currentItems.map(i => ({ ...i, status: 'running' })));

    try {
      const payload = {
        systemInstruction: agent.systemInstruction,
        model: agent.model,
        temperature: agent.temperature,
        items: currentItems.map(i => ({ id: i.id, prompt: i.input })),
      };

      const res = await fetch('/api/agent/batch-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        const updated = currentItems.map(item => {
          const matched = data.results.find((r: any) => r.id === item.id);
          if (matched) {
            return {
              ...item,
              output: matched.output,
              status: matched.success ? 'success' as const : 'error' as const,
              durationMs: matched.durationMs,
              error: matched.error,
            };
          }
          return item;
        });
        setBatchItems(updated);
      }
    } catch (err: any) {
      console.error('Batch error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCSV = () => {
    if (batchItems.length === 0) return;
    const header = ['ID', 'Input', 'Output', 'Status', 'Duration (ms)'];
    const rows = batchItems.map(i => [
      i.id,
      `"${(i.input || '').replace(/"/g, '""')}"`,
      `"${(i.output || '').replace(/"/g, '""')}"`,
      i.status,
      i.durationMs || 0,
    ]);

    const csvContent = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch-${agent.id}-results.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (batchItems.length === 0) return;
    const blob = new Blob([JSON.stringify(batchItems, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch-${agent.id}-results.json`;
    link.click();
    URL.revokeObjectURL(url);
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
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#1D1D1F] dark:text-white uppercase tracking-tight">
              Traitement par Lot (Batch Runner)
            </h1>
            <p className="text-[11px] text-[#86868B]">
              Exécutez <span className="font-semibold">{agent.name}</span> sur une liste d'éléments en une seule fois.
            </p>
          </div>
        </div>

        {batchItems.some(i => i.output) && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                isDarkMode ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700' : 'bg-white border-[#D2D2D7] text-[#424245] hover:bg-gray-50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exporter CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                isDarkMode ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700' : 'bg-white border-[#D2D2D7] text-[#424245] hover:bg-gray-50'
              }`}
            >
              <FileJson className="w-3.5 h-3.5 text-blue-600" />
              <span>Exporter JSON</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full custom-scrollbar">
        {/* Step 1: Input List */}
        <div className={`p-6 rounded-2xl border shadow-xs space-y-4 ${
          isDarkMode ? 'bg-[#1a1a1f] border-[#2c2c30]' : 'bg-white border-[#D2D2D7]'
        }`}>
          <div className="flex items-center justify-between">
            <label htmlFor="batch-items-textarea" className="text-[11px] font-bold text-[#424245] dark:text-neutral-300 uppercase tracking-wide">
              Liste d'entrées (1 élément par ligne) :
            </label>
            <span className="text-[11px] font-medium text-[#86868B]">
              {rawTextLines.split('\n').filter(Boolean).length} éléments détectés
            </span>
          </div>

          <textarea
            id="batch-items-textarea"
            rows={5}
            value={rawTextLines}
            onChange={(e) => setRawTextLines(e.target.value)}
            placeholder="Collez vos éléments ici (une ligne par tâche)..."
            className={`w-full p-3 text-xs rounded-xl border outline-none font-mono ${
              isDarkMode ? 'bg-neutral-900 border-neutral-700 text-neutral-200 focus:ring-1 focus:ring-blue-500' : 'bg-[#F5F5F7] border-[#D2D2D7] text-[#1D1D1F] focus:bg-white focus:ring-1 focus:ring-blue-500'
            }`}
          />

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleParseLines}
              className={`px-4 py-1.5 text-xs font-medium rounded-full border ${
                isDarkMode ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800' : 'border-[#D2D2D7] text-[#424245] hover:bg-gray-50'
              }`}
            >
              Préparer le tableau
            </button>

            <button
              id="btn-start-batch-run"
              onClick={handleRunBatch}
              disabled={isProcessing || !rawTextLines.trim()}
              className={`flex items-center space-x-2 px-5 py-2 text-xs font-semibold rounded-full text-white shadow-sm transition-all ${
                isProcessing
                  ? 'bg-blue-800/50 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-200 dark:shadow-none active:scale-98'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Traitement en cours...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Lancer le Lot avec Gemini</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step 2: Batch Table Output */}
        {batchItems.length > 0 && (
          <div className={`p-6 rounded-2xl border shadow-xs space-y-4 ${
            isDarkMode ? 'bg-[#1a1a1f] border-[#2c2c30]' : 'bg-white border-[#D2D2D7]'
          }`}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#86868B]">
              Résultats du lot ({batchItems.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className={`border-b text-[11px] font-bold text-[#86868B] uppercase tracking-wider ${
                    isDarkMode ? 'border-neutral-800' : 'border-[#D2D2D7]'
                  }`}>
                    <th className="pb-2.5 pl-2">Statut</th>
                    <th className="pb-2.5">Entrée</th>
                    <th className="pb-2.5">Résultat Généré</th>
                    <th className="pb-2.5 pr-2 text-right">Durée</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-neutral-800' : 'divide-[#D2D2D7]'}`}>
                  {batchItems.map((item) => (
                    <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 pl-2 align-top">
                        {item.status === 'running' && (
                          <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                        )}
                        {item.status === 'success' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                        {item.status === 'error' && (
                          <XCircle className="w-4 h-4 text-rose-500" />
                        )}
                        {item.status === 'idle' && (
                          <Clock className="w-4 h-4 text-[#86868B]" />
                        )}
                      </td>
                      <td className="py-3.5 pr-4 align-top font-medium max-w-xs truncate text-[#1D1D1F] dark:text-neutral-200">
                        {item.input}
                      </td>
                      <td className="py-3.5 pr-4 align-top text-[#424245] dark:text-neutral-300 max-w-md font-mono text-[11px]">
                        {item.output ? (
                          <div className="line-clamp-3 whitespace-pre-wrap">{item.output}</div>
                        ) : item.status === 'running' ? (
                          <span className="text-blue-600 italic">En cours d'exécution...</span>
                        ) : (
                          <span className="text-[#86868B] italic">En attente</span>
                        )}
                      </td>
                      <td className="py-3.5 pr-2 align-top text-right font-mono text-[11px] text-[#86868B]">
                        {item.durationMs ? `${item.durationMs}ms` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
