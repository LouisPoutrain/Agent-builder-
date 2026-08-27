import React, { useState } from 'react';
import { AgentSkillDefinition } from '../types';
import { Plus, Trash2, Edit2, Sparkles, Save, X } from 'lucide-react';

interface SkillManagerProps {
  customSkills: AgentSkillDefinition[];
  onSaveSkill: (skill: AgentSkillDefinition) => void;
  onDeleteSkill: (skillId: string) => void;
  isDarkMode: boolean;
}

export const SkillManager: React.FC<SkillManagerProps> = ({
  customSkills,
  onSaveSkill,
  onDeleteSkill,
  isDarkMode
}) => {
  const [editingSkill, setEditingSkill] = useState<AgentSkillDefinition | null>(null);
  
  const handleCreateNew = () => {
    setEditingSkill({
      id: `skill_${Date.now()}`,
      name: '',
      description: '',
      icon: 'Sparkles',
      category: 'custom',
      systemPromptModifier: '',
      isCustom: true
    });
  };

  const handleSave = () => {
    if (editingSkill && editingSkill.name && editingSkill.systemPromptModifier) {
      onSaveSkill(editingSkill);
      setEditingSkill(null);
    }
  };

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-[#121215] text-[#f4f4f7]' : 'bg-[#F5F5F7] text-[#1D1D1F]'}`}>
      <div className="flex items-center justify-between px-8 py-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Gestion des Compétences (Skills)</h1>
          <p className="text-sm text-neutral-500 mt-1">Créez des capacités réutilisables à injecter dans vos agents.</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Compétence</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {editingSkill ? (
          <div className={`max-w-2xl mx-auto p-6 rounded-2xl border ${isDarkMode ? 'bg-[#1a1a1f] border-neutral-800' : 'bg-white border-neutral-200'}`}>
            <h2 className="text-lg font-bold mb-4">{editingSkill.name ? 'Éditer' : 'Créer'} une compétence</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Nom</label>
                <input
                  type="text"
                  value={editingSkill.name}
                  onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                  placeholder="Ex: Expert React"
                  className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-100 border-neutral-300'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Description courte</label>
                <input
                  type="text"
                  value={editingSkill.description}
                  onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                  placeholder="Ex: Permet à l'agent d'écrire du code React parfait."
                  className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-100 border-neutral-300'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Instructions Système (Prompt Modifier)</label>
                <textarea
                  value={editingSkill.systemPromptModifier}
                  onChange={(e) => setEditingSkill({ ...editingSkill, systemPromptModifier: e.target.value })}
                  placeholder="Ex: Tu es un expert React. Utilise toujours les Hooks. Ne crée pas de composants de classe."
                  rows={4}
                  className={`w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-100 border-neutral-300'}`}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setEditingSkill(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border ${isDarkMode ? 'border-neutral-700 hover:bg-neutral-800' : 'border-neutral-300 hover:bg-neutral-100'}`}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={!editingSkill.name || !editingSkill.systemPromptModifier}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customSkills.length === 0 ? (
              <div className="col-span-full text-center py-12 text-neutral-500">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Aucune compétence personnalisée.</p>
                <p className="text-sm">Créez votre première compétence pour enrichir vos agents.</p>
              </div>
            ) : (
              customSkills.map((skill) => (
                <div key={skill.id} className={`p-4 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-[#1a1a1f] border-neutral-800' : 'bg-white border-neutral-200'}`}>
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-sm">{skill.name}</h3>
                      <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-600/10 px-2 py-0.5 rounded-full">Custom</span>
                    </div>
                    <p className="text-xs text-neutral-500 mb-4">{skill.description}</p>
                    <div className="text-[10px] font-mono p-2 rounded bg-black/5 dark:bg-white/5 line-clamp-3">
                      {skill.systemPromptModifier}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                    <button onClick={() => setEditingSkill(skill)} className="p-1.5 text-neutral-500 hover:text-blue-600 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteSkill(skill.id)} className="p-1.5 text-neutral-500 hover:text-red-600 transition-colors">
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
