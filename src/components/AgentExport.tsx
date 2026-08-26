import React, { useState } from 'react';
import { 
  Share2, 
  Terminal, 
  Apple, 
  Code, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  Command,
  Upload
} from 'lucide-react';
import { AgentDefinition } from '../types';

interface AgentExportProps {
  agent: AgentDefinition;
  onImportAgent: (agentJson: AgentDefinition) => void;
  isDarkMode: boolean;
}

export const AgentExport: React.FC<AgentExportProps> = ({
  agent,
  onImportAgent,
  isDarkMode,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'sh' | 'node' | 'raycast' | 'python' | 'json'>('sh');

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Generate Shell Script (bash / zsh)
  const shellScript = `#!/usr/bin/env zsh
# ==========================================
# Agent : ${agent.name}
# Généré par AI Dev & Research Studio
# ==========================================

# Clé API Gemini (ou export GEMINI_API_KEY="...")
API_KEY="\${GEMINI_API_KEY}"

if [ -z "$API_KEY" ]; then
  echo "Erreur : La variable GEMINI_API_KEY n'est pas définie."
  echo "Exportez-la avec : export GEMINI_API_KEY='votre_cle'"
  exit 1
fi

INPUT_DATA="\${1:-$(pbpaste)}"

echo "⚡ Exécution de l'agent '${agent.name}' avec Gemini..."

RESPONSE=$(curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/${agent.model}:generateContent?key=\${API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "systemInstruction": {
      "parts": [{ "text": "${agent.systemInstruction.replace(/"/g, '\\"').replace(/\n/g, '\\n')}" }]
    },
    "contents": [{
      "parts": [{ "text": "'"$INPUT_DATA"'" }]
    }],
    "generationConfig": {
      "temperature": ${agent.temperature}
    }
  }')

RESULT=$(echo "$RESPONSE" | grep -o '"text": *"[^"]*"' | sed 's/"text": *"//;s/"$//' | sed 's/\\\\n/\\n/g')

echo "\\n=== RÉSULTAT ==="
echo "$RESULT"
echo "$RESULT" | pbcopy
echo "\\n✅ Résultat copié dans le presse-papier (pbcopy) !"
`;

  // Node.js @google/genai script
  const nodeScript = `/**
 * Agent : ${agent.name}
 * Exécution autonome avec le SDK officiel Google GenAI pour Node.js
 */
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Erreur: variable d'environnement GEMINI_API_KEY manquante.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const systemInstruction = \`${agent.systemInstruction.replace(/`/g, '\\`')}\`;
const input_text = process.argv.slice(2).join(' ') || "Texte de test...";

async function runAgent() {
  const response = await ai.models.generateContent({
    model: '${agent.model}',
    contents: input_text,
    config: {
      systemInstruction,
      temperature: ${agent.temperature},
    }
  });

  console.log(response.text);
}

runAgent().catch(console.error);
`;

  // Python @google/genai script
  const pythonScript = `#!/usr/bin/env python3
"""
Agent : ${agent.name}
Exécution autonome avec le SDK officiel Google GenAI
"""
import os
import sys
from google import genai

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("Erreur: variable d'environnement GEMINI_API_KEY manquante.")
    sys.exit(1)

client = genai.Client(api_key=api_key)

system_instruction = """${agent.systemInstruction}"""

# Récupérer l'entrée depuis les arguments CLI ou standard input
input_text = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else sys.stdin.read()

response = client.models.generate_content(
    model="${agent.model}",
    contents=input_text,
    config={
        "system_instruction": system_instruction,
        "temperature": ${agent.temperature},
    }
)

print(response.text)
`;

  // Raycast Extension script
  const raycastScript = `#!/usr/bin/env bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title ${agent.name}
# @raycast.mode fullOutput
# @raycast.packageName AI Dev & Research Studio

# Optional parameters:
# @raycast.icon ${agent.icon}
# @raycast.argument1 { "type": "text", "placeholder": "Texte ou tâche...", "optional": true }

INPUT="\${1:-$(pbpaste)}"
API_KEY="\${GEMINI_API_KEY}"

curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/${agent.model}:generateContent?key=\${API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "systemInstruction": { "parts": [{ "text": "${agent.systemInstruction.replace(/"/g, '\\"').replace(/\n/g, '\\n')}" }] },
    "contents": [{ "parts": [{ "text": "'"$INPUT"'" }] }]
  }' | grep -o '"text": *"[^"]*"' | sed 's/"text": *"//;s/"$//'
`;

  const agentJsonString = JSON.stringify(agent, null, 2);

  const handleDownloadBlueprint = () => {
    const blob = new Blob([agentJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agent.id}.agent.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.name && parsed.systemInstruction) {
          onImportAgent(parsed);
        } else {
          alert('Fichier blueprint agent invalide.');
        }
      } catch (err) {
        alert('Erreur lors de la lecture du fichier JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden select-none transition-colors ${
      isDarkMode ? 'bg-[#121215]' : 'bg-[#F5F5F7]'
    }`}>
      {/* Top Header */}
      <header className={`h-14 border-b flex items-center justify-between px-8 transition-colors ${
        isDarkMode ? 'bg-[#18181c]/80 border-[#2c2c30]' : 'bg-white/70 border-[#D2D2D7]'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-lg">
            <Share2 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#1D1D1F] dark:text-white uppercase tracking-tight">
              Intégration & Export SDK
            </h1>
            <p className="text-[11px] text-[#86868B]">
              Déclenchez cet agent depuis votre Terminal, IDE, CI/CD ou via API.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border cursor-pointer transition-colors ${
            isDarkMode ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700' : 'bg-white border-[#D2D2D7] text-[#424245] hover:bg-gray-50'
          }`}>
            <Upload className="w-3.5 h-3.5" />
            <span>Importer Blueprint</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleDownloadBlueprint}
            className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-200 dark:shadow-none transition-all active:scale-98"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter Blueprint (.json)</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full custom-scrollbar">
        {/* Format Selector Pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'sh', label: 'Terminal (zsh / bash)', icon: <Terminal className="w-3.5 h-3.5" /> },
            { id: 'node', label: 'Node.js (SDK Google GenAI)', icon: <Code className="w-3.5 h-3.5" /> },
            { id: 'raycast', label: 'Script Raycast / Alfred', icon: <Command className="w-3.5 h-3.5" /> },
            { id: 'python', label: 'Python (SDK Google GenAI)', icon: <FileCode className="w-3.5 h-3.5" /> },
            { id: 'json', label: 'Blueprint JSON de l\'Agent', icon: <Code className="w-3.5 h-3.5" /> },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFormat(f.id as any)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                selectedFormat === f.id
                  ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] dark:bg-white dark:text-[#1D1D1F] shadow-xs'
                  : isDarkMode
                    ? 'bg-[#1a1a1f] border-[#2c2c30] text-neutral-300 hover:bg-neutral-800'
                    : 'bg-white border-[#D2D2D7] text-[#424245] hover:bg-gray-50'
              }`}
            >
              {f.icon}
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        {/* Code Snippet Box */}
        <div className={`p-6 rounded-2xl border shadow-xs space-y-4 ${
          isDarkMode ? 'bg-[#1a1a1f] border-[#2c2c30]' : 'bg-white border-[#D2D2D7]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1D1D1F] dark:text-neutral-200 font-mono">
              {selectedFormat === 'sh' && `run-${agent.id}.sh`}
              {selectedFormat === 'node' && `agent_${agent.id}.js`}
              {selectedFormat === 'raycast' && `raycast-${agent.id}.sh`}
              {selectedFormat === 'python' && `agent_${agent.id}.py`}
              {selectedFormat === 'json' && `${agent.id}.agent.json`}
            </span>

            <button
              onClick={() => {
                const code = selectedFormat === 'sh' ? shellScript
                  : selectedFormat === 'node' ? nodeScript
                  : selectedFormat === 'raycast' ? raycastScript
                  : selectedFormat === 'python' ? pythonScript
                  : agentJsonString;
                handleCopy(selectedFormat, code);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
                copiedSection === selectedFormat
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : isDarkMode
                    ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700'
                    : 'bg-[#F5F5F7] border-[#D2D2D7] text-[#424245] hover:bg-[#EBEBEB]'
              }`}
            >
              {copiedSection === selectedFormat ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === selectedFormat ? 'Copié !' : 'Copier le script'}</span>
            </button>
          </div>

          <pre className={`p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border max-h-[480px] ${
            isDarkMode 
              ? 'bg-neutral-950 border-neutral-800 text-emerald-400' 
              : 'bg-[#1D1D1F] border-neutral-800 text-emerald-400'
          }`}>
            {selectedFormat === 'sh' && shellScript}
            {selectedFormat === 'node' && nodeScript}
            {selectedFormat === 'raycast' && raycastScript}
            {selectedFormat === 'python' && pythonScript}
            {selectedFormat === 'json' && agentJsonString}
          </pre>
        </div>

        {/* Integration Instructions */}
        <div className={`p-6 rounded-2xl border shadow-xs space-y-3 ${
          isDarkMode ? 'bg-[#1a1a1f] border-[#2c2c30]' : 'bg-white border-[#D2D2D7]'
        }`}>
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-[#1D1D1F] dark:text-neutral-200" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#86868B]">
              Comment utiliser cet agent dans vos scripts et IDE :
            </h2>
          </div>

          <ol className="list-decimal list-inside space-y-2 text-xs text-[#424245] dark:text-neutral-400">
            <li>Installez le SDK officiel Google GenAI via <code className="bg-neutral-200 dark:bg-neutral-800 px-1 py-0.5 rounded">npm install @google/genai</code> ou <code className="bg-neutral-200 dark:bg-neutral-800 px-1 py-0.5 rounded">pip install google-genai</code>.</li>
            <li>Copiez le code d'intégration du langage de votre choix (Python, Node.js ou Shell).</li>
            <li>Assurez-vous que la variable d'environnement <strong>GEMINI_API_KEY</strong> est bien définie.</li>
            <li>Passez votre texte, code ou document en entrée du script pour que l'agent génère sa réponse.</li>
            <li>Vous pouvez ensuite intégrer ce script dans <strong>GitHub Actions</strong>, <strong>VS Code Tasks</strong> ou vos pipelines CI/CD.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
