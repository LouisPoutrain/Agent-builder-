import React, { useState } from 'react';
import { AgentDefinition, MultiAgentWorkflow, WorkflowStep } from '../types';
import { Plus, Trash2, GitMerge, ArrowRight, Play, Settings2, Network } from 'lucide-react';

interface MultiAgentStudioProps {
  workflows: MultiAgentWorkflow[];
  agents: AgentDefinition[];
  onSaveWorkflow: (workflow: MultiAgentWorkflow) => void;
  onDeleteWorkflow: (workflowId: string) => void;
  isDarkMode: boolean;
}

export const MultiAgentStudio: React.FC<MultiAgentStudioProps> = ({
  workflows,
  agents,
  onSaveWorkflow,
  onDeleteWorkflow,
  isDarkMode
}) => {
  const [editingWorkflow, setEditingWorkflow] = useState<MultiAgentWorkflow | null>(null);

  const handleCreateNew = () => {
    setEditingWorkflow({
      id: `workflow_${Date.now()}`,
      name: 'Nouveau Pipeline',
      description: 'Description du pipeline multi-agent',
      icon: 'Network',
      steps: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  };

  const handleAddStep = () => {
    if (!editingWorkflow) return;
    setEditingWorkflow({
      ...editingWorkflow,
      steps: [
        ...editingWorkflow.steps,
        {
          id: `step_${Date.now()}`,
          agentId: agents[0]?.id || '',
          name: `Étape ${editingWorkflow.steps.length + 1}`,
          inputMapping: '{{input}}'
        }
      ]
    });
  };

  const handleUpdateStep = (index: number, updatedStep: WorkflowStep) => {
    if (!editingWorkflow) return;
    const newSteps = [...editingWorkflow.steps];
    newSteps[index] = updatedStep;
    setEditingWorkflow({ ...editingWorkflow, steps: newSteps });
  };

  const handleDeleteStep = (index: number) => {
    if (!editingWorkflow) return;
    const newSteps = [...editingWorkflow.steps];
    newSteps.splice(index, 1);
    setEditingWorkflow({ ...editingWorkflow, steps: newSteps });
  };

  const handleSave = () => {
    if (editingWorkflow && editingWorkflow.name) {
      onSaveWorkflow({ ...editingWorkflow, updatedAt: Date.now() });
      setEditingWorkflow(null);
    }
  };

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-[#121215] text-[#f4f4f7]' : 'bg-[#F5F5F7] text-[#1D1D1F]'}`}>
      <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Studio Multi-Agents</h1>
          <p className="text-sm text-neutral-500 mt-1">Concevez des pipelines d'orchestration entre plusieurs agents spécialisés.</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Pipeline</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {editingWorkflow ? (
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-[#1a1a1f] border-neutral-800' : 'bg-white border-neutral-200'}`}>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-bold">Configuration du Pipeline</h2>
                <div className="flex space-x-2">
                  <button onClick={() => setEditingWorkflow(null)} className="px-3 py-1.5 text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md">Annuler</button>
                  <button onClick={handleSave} className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md">Enregistrer</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Nom du Pipeline</label>
                  <input
                    type="text"
                    value={editingWorkflow.name}
                    onChange={(e) => setEditingWorkflow({ ...editingWorkflow, name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-100 border-neutral-300'}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1">Description</label>
                  <input
                    type="text"
                    value={editingWorkflow.description}
                    onChange={(e) => setEditingWorkflow({ ...editingWorkflow, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-100 border-neutral-300'}`}
                  />
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border flex flex-col items-center ${isDarkMode ? 'bg-[#1a1a1f] border-neutral-800' : 'bg-white border-neutral-200'}`}>
              <h3 className="text-sm font-bold uppercase tracking-wider w-full mb-6 flex items-center"><GitMerge className="w-4 h-4 mr-2"/> Séquence des Agents</h3>
              
              {editingWorkflow.steps.length === 0 ? (
                <div className="text-center py-10 text-neutral-500">
                  <p className="mb-4">Aucun agent dans ce pipeline.</p>
                </div>
              ) : (
                <div className="w-full max-w-2xl space-y-4 relative">
                  {editingWorkflow.steps.map((step, index) => (
                    <div key={step.id} className="relative">
                      {index > 0 && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center text-neutral-400">
                          <ArrowRight className="w-4 h-4 rotate-90" />
                        </div>
                      )}
                      <div className={`p-4 rounded-xl border flex gap-4 ${isDarkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-neutral-50 border-neutral-300'}`}>
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-neutral-500">Agent ({index + 1})</label>
                            <select
                              value={step.agentId}
                              onChange={(e) => handleUpdateStep(index, { ...step, agentId: e.target.value })}
                              className={`w-full px-2 py-1.5 rounded-lg border text-sm outline-none ${isDarkMode ? 'bg-[#1a1a1f] border-neutral-600' : 'bg-white border-neutral-200'}`}
                            >
                              {agents.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-neutral-500">Injection des données</label>
                            <input
                              type="text"
                              value={step.inputMapping}
                              onChange={(e) => handleUpdateStep(index, { ...step, inputMapping: e.target.value })}
                              placeholder="ex: {{step1_output}}"
                              className={`w-full px-2 py-1.5 rounded-lg border text-sm outline-none font-mono text-xs ${isDarkMode ? 'bg-[#1a1a1f] border-neutral-600' : 'bg-white border-neutral-200'}`}
                            />
                          </div>
                        </div>
                        <button onClick={() => handleDeleteStep(index)} className="self-center p-2 text-neutral-500 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <button
                onClick={handleAddStep}
                className="mt-6 flex items-center space-x-2 px-4 py-2 border border-dashed border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une étape</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows.length === 0 ? (
              <div className="col-span-full text-center py-12 text-neutral-500">
                <GitMerge className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Aucun pipeline d'agents.</p>
              </div>
            ) : (
              workflows.map((workflow) => (
                <div key={workflow.id} className={`p-5 rounded-2xl border flex flex-col justify-between ${isDarkMode ? 'bg-[#1a1a1f] border-neutral-800' : 'bg-white border-neutral-200'}`}>
                  <div>
                    <h3 className="font-bold text-base flex items-center gap-2">
                      <Network className="w-4 h-4 text-blue-500"/>
                      {workflow.name}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">{workflow.description}</p>
                    <div className="mt-4 flex items-center gap-1 flex-wrap">
                      {workflow.steps.map((step, i) => {
                        const agent = agents.find(a => a.id === step.agentId);
                        return (
                          <React.Fragment key={step.id}>
                            {i > 0 && <ArrowRight className="w-3 h-3 text-neutral-400" />}
                            <span className="text-[10px] px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded font-medium truncate max-w-[100px]" title={agent?.name}>
                              {agent?.icon || '🤖'} {agent?.name || 'Inconnu'}
                            </span>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-5 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <button onClick={() => setEditingWorkflow(workflow)} className="p-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                      <Settings2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteWorkflow(workflow.id)} className="p-2 bg-neutral-100 dark:bg-neutral-800 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
