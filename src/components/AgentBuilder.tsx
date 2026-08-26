import React, { useState } from 'react';
import { 
  Save, 
  Sparkles, 
  Plus, 
  Trash2, 
  Sliders, 
  Wand2, 
  Bot, 
  Code, 
  Layers, 
  Globe, 
  FileJson
} from 'lucide-react';
import { AgentCategory, AgentDefinition, AgentInputVariable, InputVariableType, OutputFormat } from '../types';

interface AgentBuilderProps {
  agentToEdit?: AgentDefinition | null;
  onSaveAgent: (agent: AgentDefinition) => void;
  onCancel: () => void;
  isDarkMode: boolean;
}

const EMOJI_OPTIONS = ['🤖', '⚡', '💻', '📝', '✉️', '📊', '🔍', '🎯', '🍎', '🛠️', '🚀', '🧠', '💼', '📁', '🎨', '🛡️'];

export const AgentBuilder: React.FC<AgentBuilderProps> = ({
  agentToEdit,
  onSaveAgent,
  onCancel,
  isDarkMode,
}) => {
  const [name, setName] = useState<string>(agentToEdit?.name || '');
  const [description, setDescription] = useState<string>(agentToEdit?.description || '');
  const [icon, setIcon] = useState<string>(agentToEdit?.icon || '🤖');
  const [category, setCategory] = useState<AgentCategory>(agentToEdit?.category || 'mac-automation');
  const [model, setModel] = useState<string>(agentToEdit?.model || 'gemini-3.7-flash');
  const [temperature, setTemperature] = useState<number>(agentToEdit?.temperature ?? 0.7);
  const [thinkingLevel, setThinkingLevel] = useState<'LOW' | 'HIGH' | 'MINIMAL' | undefined>(agentToEdit?.thinkingLevel || 'LOW');
  const [enableSearch, setEnableSearch] = useState<boolean>(agentToEdit?.enableSearch || false);
  const [jsonResponse, setJsonResponse] = useState<boolean>(agentToEdit?.jsonResponse || false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(agentToEdit?.outputFormat || 'markdown');
  const [systemInstruction, setSystemInstruction] = useState<string>(
    agentToEdit?.systemInstruction || 'Tu es un agent IA expert et performant pour Mac.'
  );
  const [promptTemplate, setPromptTemplate] = useState<string>(
    agentToEdit?.promptTemplate || 'Effectue la tâche suivante :\n{{input_task}}'
  );
  const [inputVariables, setInputVariables] = useState<AgentInputVariable[]>(
    agentToEdit?.inputVariables || [
      {
        id: 'input_task',
        label: 'Données ou tâche',
        type: 'textarea',
        placeholder: 'Saisissez vos données ici...',
        required: true,
      }
    ]
  );

  // Magic prompt optimizer states
  const [magicDescription, setMagicDescription] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [showMagicBox, setShowMagicBox] = useState<boolean>(!agentToEdit);

  const handleAddVariable = () => {
    const newId = `var_${Date.now().toString().slice(-4)}`;
    setInputVariables([
      ...inputVariables,
      {
        id: newId,
        label: 'Nouvelle Variable',
        type: 'text',
        placeholder: 'Valeur...',
        required: false,
      }
    ]);
  };

  const handleUpdateVariable = (index: number, updated: Partial<AgentInputVariable>) => {
    const newVars = [...inputVariables];
    newVars[index] = { ...newVars[index], ...updated };
    setInputVariables(newVars);
  };

  const handleRemoveVariable = (index: number) => {
    setInputVariables(inputVariables.filter((_, i) => i !== index));
  };

  // Magic Gemini Prompt Optimizer
  const handleOptimizeWithGemini = async () => {
    if (!magicDescription.trim()) return;
    setIsOptimizing(true);
    try {
      const res = await fetch('/api/agent/optimize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskDescription: magicDescription,
          role: name || undefined,
          inputs: inputVariables.map(v => v.id),
        }),
      });
      const data = await res.json();
      if (data.success && data.optimized) {
        const opt = data.optimized;
        if (opt.name && !name) setName(opt.name);
        if (opt.systemInstruction) setSystemInstruction(opt.systemInstruction);
        if (opt.samplePromptTemplate) setPromptTemplate(opt.samplePromptTemplate);
        if (opt.recommendedTemperature) setTemperature(opt.recommendedTemperature);
        if (opt.outputFormat) setOutputFormat(opt.outputFormat);
        if (opt.suggestedInputs && Array.isArray(opt.suggestedInputs) && opt.suggestedInputs.length > 0) {
          setInputVariables(opt.suggestedInputs);
        }
      }
    } catch (err) {
      console.error('Error optimizing prompt:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Veuillez donner un nom à votre agent.');
      return;
    }

    const newAgent: AgentDefinition = {
      id: agentToEdit?.id || `agent_${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Agent personnalisé pour Mac',
      icon,
      category,
      accentColor: 'from-blue-600 to-indigo-600',
      isBuiltIn: false,
      model,
      temperature,
      thinkingLevel,
      enableSearch,
      jsonResponse,
      outputFormat,
      systemInstruction,
      promptTemplate,
      inputVariables,
      createdAt: agentToEdit?.createdAt || Date.now(),
      updatedAt: Date.now(),
      samplePresets: agentToEdit?.samplePresets || [],
    };

    onSaveAgent(newAgent);
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
            {icon}
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#1D1D1F] dark:text-white uppercase tracking-tight">
              {agentToEdit ? `Édition : ${agentToEdit.name}` : 'Studio de Création d\'Agent'}
            </h1>
            <p className="text-[11px] text-[#86868B]">
              Personnalisez les directives, le comportement et l'interface Mac de l'agent.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className={`px-4 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              isDarkMode ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800' : 'border-[#D2D2D7] text-[#424245] hover:bg-gray-50'
            }`}
          >
            Annuler
          </button>
          <button
            id="btn-save-agent-studio"
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-semibold rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-200 dark:shadow-none transition-all active:scale-98"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Enregistrer l'Agent</span>
          </button>
        </div>
      </header>

      {/* Main Form Body */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full custom-scrollbar">
        {/* Gemini Magic Auto-Builder Card */}
        <div className={`p-6 rounded-2xl border shadow-xs relative overflow-hidden transition-all ${
          isDarkMode 
            ? 'bg-[#1a1a1f] border-[#2c2c30]' 
            : 'bg-white border-[#D2D2D7]'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#1D1D1F] dark:text-white">
                Générateur Magique Gemini
              </h2>
            </div>
            <button
              onClick={() => setShowMagicBox(!showMagicBox)}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showMagicBox ? 'Masquer' : 'Afficher'}
            </button>
          </div>

          {showMagicBox && (
            <div className="space-y-3 mt-3">
              <p className="text-xs text-[#424245] dark:text-neutral-400">
                Décrivez la tâche que cet agent doit accomplir. Gemini rédigera automatiquement les instructions système, les variables nécessaires et le modèle approprié.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  id="magic-task-input"
                  value={magicDescription}
                  onChange={(e) => setMagicDescription(e.target.value)}
                  placeholder="Ex: Un agent qui convertit du texte brut en rapport hebdomadaire structuré..."
                  className={`flex-1 px-3.5 py-2 text-sm rounded-lg border outline-none ${
                    isDarkMode 
                      ? 'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:ring-1 focus:ring-blue-500' 
                      : 'bg-[#F5F5F7] border-[#D2D2D7] text-[#1D1D1F] placeholder-[#86868B] focus:ring-1 focus:ring-blue-500 focus:bg-white'
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleOptimizeWithGemini();
                    }
                  }}
                />
                <button
                  id="btn-magic-optimize"
                  onClick={handleOptimizeWithGemini}
                  disabled={isOptimizing || !magicDescription.trim()}
                  className={`flex items-center justify-center space-x-2 px-5 py-2 text-xs font-semibold rounded-full text-white shadow-sm transition-all whitespace-nowrap ${
                    isOptimizing || !magicDescription.trim()
                      ? 'bg-blue-800/50 cursor-not-allowed text-neutral-400'
                      : 'bg-blue-600 hover:bg-blue-500 active:scale-98 shadow-blue-200 dark:shadow-none'
                  }`}
                >
                  {isOptimizing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Génération...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Générer automatiquement</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 1: Identité de l'Agent */}
        <div className={`p-6 rounded-2xl border shadow-xs space-y-5 ${
          isDarkMode ? 'bg-[#1a1a1f] border-[#2c2c30]' : 'bg-white border-[#D2D2D7]'
        }`}>
          <div className="flex items-center space-x-2 border-b pb-3 border-[#D2D2D7] dark:border-neutral-800">
            <Bot className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#86868B]">
              1. Identité & Catégorie
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Emoji Icon Picker */}
            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-[11px] font-bold text-[#424245] dark:text-neutral-300 uppercase tracking-wide">
                Icône de l'agent
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-[#D2D2D7] dark:border-neutral-700 bg-[#F5F5F7] dark:bg-neutral-900 max-h-24 overflow-y-auto">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setIcon(e)}
                    className={`w-7 h-7 rounded text-sm flex items-center justify-center transition-all ${
                      icon === e ? 'bg-blue-600 text-white scale-105 shadow-xs' : 'hover:bg-[#EBEBEB] dark:hover:bg-neutral-800'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="sm:col-span-5 space-y-1.5">
              <label htmlFor="agent-name-input" className="text-[11px] font-bold text-[#424245] dark:text-neutral-300 uppercase tracking-wide">
                Nom de l'agent <span className="text-rose-500">*</span>
              </label>
              <input
                id="agent-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Rédacteur d'Emails Pro"
                className={`w-full px-3.5 py-2 text-sm rounded-lg border outline-none ${
                  isDarkMode 
                    ? 'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:ring-1 focus:ring-blue-500' 
                    : 'bg-[#F5F5F7] border-[#D2D2D7] text-[#1D1D1F] placeholder-[#86868B] focus:ring-1 focus:ring-blue-500 focus:bg-white'
                }`}
              />
            </div>

            {/* Category */}
            <div className="sm:col-span-4 space-y-1.5">
              <label htmlFor="agent-category-select" className="text-[11px] font-bold text-[#424245] dark:text-neutral-300 uppercase tracking-wide">
                Catégorie
              </label>
              <select
                id="agent-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as AgentCategory)}
                className={`w-full px-3 py-2 text-sm rounded-lg border outline-none ${
                  isDarkMode ? 'bg-neutral-900 border-neutral-700 text-neutral-100' : 'bg-[#F5F5F7] border-[#D2D2D7] text-[#1D1D1F]'
                }`}
              >
                <option value="mac-automation">Automatisation Mac & Scripts</option>
                <option value="writing">Rédaction & Communication</option>
                <option value="coding">Code & Développement</option>
                <option value="data-analysis">Données & Structuration JSON</option>
                <option value="productivity">Productivité & Tâches</option>
                <option value="research">Veille & Synthèse</option>
              </select>
            </div>

            {/* Description */}
            <div className="sm:col-span-12 space-y-1.5">
              <label htmlFor="agent-desc-input" className="text-[11px] font-bold text-[#424245] dark:text-neutral-300 uppercase tracking-wide">
                Description de la tâche
              </label>
              <input
                id="agent-desc-input"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Transforme des notes brutes en email soigné prêt pour l'envoi..."
                className={`w-full px-3.5 py-2 text-sm rounded-lg border outline-none ${
                  isDarkMode 
                    ? 'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:ring-1 focus:ring-blue-500' 
                    : 'bg-[#F5F5F7] border-[#D2D2D7] text-[#1D1D1F] placeholder-[#86868B] focus:ring-1 focus:ring-blue-500 focus:bg-white'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Modèle & Paramètres Gemini */}
        <div className={`p-6 rounded-2xl border shadow-xs space-y-5 ${
          isDarkMode ? 'bg-[#1a1a1f] border-[#2c2c30]' : 'bg-white border-[#D2D2D7]'
        }`}>
          <div className="flex items-center space-x-2 border-b pb-3 border-[#D2D2D7] dark:border-neutral-800">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#86868B]">
              2. Paramètres Google Gemini
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Model Selection */}
            <div className="space-y-1.5">
              <label htmlFor="agent-model-select" className="text-[11px] font-bold text-[#424245] dark:text-neutral-300 uppercase tracking-wide">
                Modèle
              </label>
              <select
                id="agent-model-select"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border outline-none font-mono ${
                  isDarkMode ? 'bg-neutral-900 border-neutral-700 text-neutral-100' : 'bg-[#F5F5F7] border-[#D2D2D7] text-[#1D1D1F]'
                }`}
              >
                <option value="gemini-3.7-flash">gemini-3.7-flash (Recommandé)</option>
              </select>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#424245] dark:text-neutral-300 uppercase tracking-wide">
                  Température : <span className="font-mono">{temperature}</span>
                </label>
                <span className="text-[10px] text-[#86868B]">
                  {temperature < 0.3 ? 'Précis' : temperature > 0.7 ? 'Créatif' : 'Équilibré'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#D2D2D7] dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Output Format */}
            <div className="space-y-1.5">
              <label htmlFor="agent-format-select" className="text-[11px] font-bold text-[#424245] dark:text-neutral-300 uppercase tracking-wide">
                Format de sortie
              </label>
              <select
                id="agent-format-select"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                className={`w-full px-3 py-2 text-sm rounded-lg border outline-none ${
                  isDarkMode ? 'bg-neutral-900 border-neutral-700 text-neutral-100' : 'bg-[#F5F5F7] border-[#D2D2D7] text-[#1D1D1F]'
                }`}
              >
                <option value="markdown">Markdown / Texte structuré</option>
                <option value="code">Code / Script exécutable</option>
                <option value="json">JSON Structuré</option>
                <option value="checklist">Checklist / Liste de tâches</option>
                <option value="table">Tableau comparatif</option>
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-5 pt-3 border-t border-[#D2D2D7] dark:border-neutral-800 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableSearch}
                onChange={(e) => setEnableSearch(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="text-[#1D1D1F] dark:text-neutral-300 flex items-center gap-1.5 font-medium">
                <Globe className="w-3.5 h-3.5 text-blue-600" /> Recherche Web Google Search en direct
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={jsonResponse}
                onChange={(e) => setJsonResponse(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="text-[#1D1D1F] dark:text-neutral-300 flex items-center gap-1.5 font-medium">
                <FileJson className="w-3.5 h-3.5 text-blue-600" /> Réponse JSON stricte
              </span>
            </label>
          </div>
        </div>

        {/* Section 3: Variables d'Entrée du Formulaire */}
        <div className={`p-6 rounded-2xl border shadow-xs space-y-5 ${
          isDarkMode ? 'bg-[#1a1a1f] border-[#2c2c30]' : 'bg-white border-[#D2D2D7]'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-[#D2D2D7] dark:border-neutral-800">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#86868B]">
                3. Variables d'Entrée Mac
              </h2>
            </div>
            <button
              id="btn-add-variable"
              onClick={handleAddVariable}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une variable</span>
            </button>
          </div>

          <p className="text-xs text-[#86868B]">
            Chaque variable crée un champ dans l'interface Mac. Utilisez <code className="text-blue-600 font-mono font-bold">{"{{id_variable}}"}</code> dans votre template de prompt ci-dessous.
          </p>

          <div className="space-y-3">
            {inputVariables.map((variable, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex flex-col md:flex-row gap-3 items-start md:items-center justify-between ${
                  isDarkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-[#F5F5F7] border-[#D2D2D7]'
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 w-full">
                  <div>
                    <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">ID (pour template)</label>
                    <input
                      type="text"
                      value={variable.id}
                      onChange={(e) => handleUpdateVariable(idx, { id: e.target.value.replace(/\s+/g, '_') })}
                      placeholder="nom_var"
                      className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border outline-none ${
                        isDarkMode ? 'bg-neutral-950 border-neutral-700 text-blue-400' : 'bg-white border-[#D2D2D7] text-blue-600'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Libellé UI</label>
                    <input
                      type="text"
                      value={variable.label}
                      onChange={(e) => handleUpdateVariable(idx, { label: e.target.value })}
                      placeholder="Texte source"
                      className={`w-full px-2.5 py-1.5 text-xs rounded-lg border outline-none ${
                        isDarkMode ? 'bg-neutral-950 border-neutral-700 text-neutral-200' : 'bg-white border-[#D2D2D7] text-[#1D1D1F]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#86868B] uppercase block mb-1">Type de champ</label>
                    <select
                      value={variable.type}
                      onChange={(e) => handleUpdateVariable(idx, { type: e.target.value as InputVariableType })}
                      className={`w-full px-2.5 py-1.5 text-xs rounded-lg border outline-none ${
                        isDarkMode ? 'bg-neutral-950 border-neutral-700 text-neutral-200' : 'bg-white border-[#D2D2D7] text-[#1D1D1F]'
                      }`}
                    >
                      <option value="text">Texte court</option>
                      <option value="textarea">Zone de texte (Multi-lignes)</option>
                      <option value="code">Éditeur de Code</option>
                      <option value="select">Menu déroulant (Select)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveVariable(idx)}
                  className="p-2 rounded-full text-[#86868B] hover:text-rose-500 hover:bg-rose-500/10 transition-colors self-end md:self-center"
                  title="Supprimer cette variable"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Instructions Système & Template de Prompt */}
        <div className={`p-6 rounded-2xl border shadow-xs space-y-5 ${
          isDarkMode ? 'bg-[#1a1a1f] border-[#2c2c30]' : 'bg-white border-[#D2D2D7]'
        }`}>
          <div className="flex items-center space-x-2 border-b pb-3 border-[#D2D2D7] dark:border-neutral-800">
            <Code className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#86868B]">
              4. Instructions Système & Modèle de Prompt
            </h2>
          </div>

          {/* System Instructions */}
          <div className="space-y-1.5">
            <label htmlFor="system-instruction-textarea" className="text-[11px] font-bold text-[#424245] dark:text-neutral-300 uppercase tracking-wide flex items-center justify-between">
              <span>Instructions Système (Rôle & Directives strictes)</span>
              <span className="text-[10px] text-[#86868B] font-normal">Comportement fondamental</span>
            </label>
            <textarea
              id="system-instruction-textarea"
              rows={4}
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              className={`w-full p-3 text-xs rounded-xl border outline-none font-mono resize-y ${
                isDarkMode ? 'bg-neutral-900 border-neutral-700 text-neutral-200' : 'bg-[#F5F5F7] border-[#D2D2D7] text-[#1D1D1F] focus:bg-white'
              }`}
            />
          </div>

          {/* Prompt Template */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="prompt-template-textarea" className="text-[11px] font-bold text-[#424245] dark:text-neutral-300 uppercase tracking-wide">
                Template de Prompt avec Variables
              </label>
              <div className="flex gap-1.5">
                {inputVariables.map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setPromptTemplate(prev => `${prev} {{${v.id}}}`)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 font-semibold"
                    title={`Insérer {{${v.id}}}`}
                  >
                    + {`{{${v.id}}}`}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              id="prompt-template-textarea"
              rows={4}
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              className={`w-full p-3 text-xs rounded-xl border outline-none font-mono resize-y ${
                isDarkMode ? 'bg-neutral-900 border-neutral-700 text-emerald-400' : 'bg-[#1D1D1F] border-[#D2D2D7] text-emerald-400'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
