import React, { useState, useEffect, useMemo } from 'react';
import { DEFAULT_AGENTS } from './data/defaultAgents';
import { ActiveTab, AgentDefinition, ExecutionRecord, AgentSkillDefinition, MultiAgentWorkflow } from './types';
import { MacTitleBar } from './components/MacTitleBar';
import { MacSidebar } from './components/MacSidebar';
import { AgentRunner } from './components/AgentRunner';
import { AgentBuilder } from './components/AgentBuilder';
import { AgentPlayground } from './components/AgentPlayground';
import { AgentExport } from './components/AgentExport';
import { AgentLogs } from './components/AgentLogs';
import { SpotlightModal } from './components/SpotlightModal';
import { SkillManager } from './components/SkillManager';
import { MultiAgentStudio } from './components/MultiAgentStudio';

const AGENTS_STORAGE_KEY = 'mac_agents_studio_v1';
const LOGS_STORAGE_KEY = 'mac_agents_logs_v1';
const THEME_STORAGE_KEY = 'mac_agents_theme_v1';
const SKILLS_STORAGE_KEY = 'mac_agents_skills_v1';
const WORKFLOWS_STORAGE_KEY = 'mac_agents_workflows_v1';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sync dark class on document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  }, [isDarkMode]);

  // Agents state
  const [agents, setAgents] = useState<AgentDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(AGENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const custom = parsed.filter((a: AgentDefinition) => !a.isBuiltIn);
          return [...DEFAULT_AGENTS, ...custom];
        }
      }
    } catch (e) {
      console.error('Error loading agents:', e);
    }
    return DEFAULT_AGENTS;
  });

  // Custom Skills State
  const [customSkills, setCustomSkills] = useState<AgentSkillDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(SKILLS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Workflows State
  const [workflows, setWorkflows] = useState<MultiAgentWorkflow[]>(() => {
    try {
      const saved = localStorage.getItem(WORKFLOWS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Active agent state
  const [activeAgentId, setActiveAgentId] = useState<string>(DEFAULT_AGENTS[0].id);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('runner');

  // Agent to edit in Builder tab
  const [agentToEdit, setAgentToEdit] = useState<AgentDefinition | null>(null);

  // Execution history logs
  const [logs, setLogs] = useState<ExecutionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading logs:', e);
    }
    return [];
  });

  // Spotlight modal state
  const [spotlightOpen, setSpotlightOpen] = useState<boolean>(false);

  // Chat playground initial message
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>('');

  // API Status check
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean>(true);

  // Save custom agents to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(agents));
    } catch (e) {
      console.error('Error saving agents:', e);
    }
  }, [agents]);

  // Save logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs.slice(0, 100)));
    } catch (e) {
      console.error('Error saving logs:', e);
    }
  }, [logs]);

  // Save skills to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(customSkills));
    } catch (e) {}
  }, [customSkills]);

  // Save workflows to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(workflows));
    } catch (e) {}
  }, [workflows]);

  const handleSaveSkill = (skill: AgentSkillDefinition) => {
    setCustomSkills(prev => {
      const idx = prev.findIndex(s => s.id === skill.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = skill;
        return copy;
      }
      return [...prev, skill];
    });
  };

  const handleDeleteSkill = (skillId: string) => {
    setCustomSkills(prev => prev.filter(s => s.id !== skillId));
  };

  const handleSaveWorkflow = (workflow: MultiAgentWorkflow) => {
    setWorkflows(prev => {
      const idx = prev.findIndex(w => w.id === workflow.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = workflow;
        return copy;
      }
      return [...prev, workflow];
    });
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== workflowId));
  };

  // Check health on load
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.hasApiKey === 'boolean') {
          setApiKeyConfigured(data.hasApiKey);
        }
      })
      .catch(() => {});
  }, []);

  // Global keyboard shortcuts (Cmd+K for Spotlight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSpotlightOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeAgent = useMemo(() => {
    return agents.find((a) => a.id === activeAgentId) || agents[0] || DEFAULT_AGENTS[0];
  }, [agents, activeAgentId]);

  // Handle agent execution
  const handleExecuteAgent = async (inputs: Record<string, string>): Promise<ExecutionRecord | null> => {
    // Generate prompt by replacing placeholders
    let renderedPrompt = activeAgent.promptTemplate;
    Object.entries(inputs).forEach(([key, val]) => {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      renderedPrompt = renderedPrompt.replace(regex, val || '');
    });

    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: activeAgent.systemInstruction,
          prompt: renderedPrompt,
          model: activeAgent.model,
          temperature: activeAgent.temperature,
          topP: activeAgent.topP,
          thinkingLevel: activeAgent.thinkingLevel,
          enableSearch: activeAgent.enableSearch,
          jsonResponse: activeAgent.jsonResponse,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const record: ExecutionRecord = {
          id: `exec_${Date.now()}`,
          agentId: activeAgent.id,
          agentName: activeAgent.name,
          timestamp: Date.now(),
          inputs,
          output: data.output || '',
          durationMs: data.durationMs || 0,
          model: activeAgent.model,
          status: 'success',
          tokenUsage: data.usage ? {
            promptTokens: data.usage.promptTokenCount,
            candidatesTokens: data.usage.candidatesTokenCount,
            totalTokens: data.usage.totalTokenCount,
          } : undefined,
          groundingSources: data.groundingSources,
        };

        setLogs(prev => [record, ...prev]);
        return record;
      } else {
        const errRecord: ExecutionRecord = {
          id: `exec_${Date.now()}`,
          agentId: activeAgent.id,
          agentName: activeAgent.name,
          timestamp: Date.now(),
          inputs,
          output: `⚠️ Erreur : ${data.error || "Impossible d'exécuter la tâche."}`,
          durationMs: 0,
          model: activeAgent.model,
          status: 'error',
          errorMessage: data.error,
        };
        setLogs(prev => [errRecord, ...prev]);
        return errRecord;
      }
    } catch (err: any) {
      const errRecord: ExecutionRecord = {
        id: `exec_${Date.now()}`,
        agentId: activeAgent.id,
        agentName: activeAgent.name,
        timestamp: Date.now(),
        inputs,
        output: `⚠️ Erreur de communication : ${err.message || 'Échec du réseau.'}`,
        durationMs: 0,
        model: activeAgent.model,
        status: 'error',
        errorMessage: err.message,
      };
      setLogs(prev => [errRecord, ...prev]);
      return errRecord;
    }
  };

  // Agent Management Actions
  const handleNewAgent = () => {
    setAgentToEdit(null);
    setActiveTab('builder');
  };

  const handleEditAgent = (agent: AgentDefinition) => {
    setAgentToEdit(agent);
    setActiveTab('builder');
  };

  const handleSaveAgent = (savedAgent: AgentDefinition) => {
    setAgents(prev => {
      const exists = prev.some(a => a.id === savedAgent.id);
      if (exists) {
        return prev.map(a => a.id === savedAgent.id ? savedAgent : a);
      }
      return [savedAgent, ...prev];
    });
    setActiveAgentId(savedAgent.id);
    setActiveTab('runner');
  };

  const handleDuplicateAgent = (agent: AgentDefinition) => {
    const duplicated: AgentDefinition = {
      ...agent,
      id: `agent_${Date.now()}`,
      name: `${agent.name} (Copie)`,
      isBuiltIn: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setAgents(prev => [duplicated, ...prev]);
    setActiveAgentId(duplicated.id);
  };

  const handleDeleteAgent = (agentId: string) => {
    setAgents(prev => prev.filter(a => a.id !== agentId));
    if (activeAgentId === agentId) {
      const remaining = agents.filter(a => a.id !== agentId);
      if (remaining.length > 0) {
        setActiveAgentId(remaining[0].id);
      }
    }
  };

  const handleImportAgent = (imported: AgentDefinition) => {
    const withNewId: AgentDefinition = {
      ...imported,
      id: `agent_imported_${Date.now()}`,
      isBuiltIn: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setAgents(prev => [withNewId, ...prev]);
    setActiveAgentId(withNewId.id);
    setActiveTab('runner');
  };

  const handleSendToChat = (prompt: string) => {
    setChatInitialPrompt(prompt);
    setActiveTab('chat');
  };

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden font-sans antialiased select-none ${
      isDarkMode ? 'bg-[#121215] text-[#f4f4f7]' : 'bg-[#F5F5F7] text-[#1D1D1F]'
    }`}>
      {/* App Title Bar Header */}
      <MacTitleBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeAgent={activeAgent}
        onNewAgent={handleNewAgent}
        onOpenSpotlight={() => setSpotlightOpen(true)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        apiKeyConfigured={apiKeyConfigured}
      />

      {/* Main App Workspace with Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <MacSidebar
          agents={agents}
          activeAgentId={activeAgent.id}
          onSelectAgent={(id) => {
            setActiveAgentId(id);
            if (activeTab === 'builder') setActiveTab('runner');
          }}
          onNewAgent={handleNewAgent}
          onDuplicateAgent={handleDuplicateAgent}
          onDeleteAgent={handleDeleteAgent}
          onEditAgent={handleEditAgent}
          isDarkMode={isDarkMode}
        />

        {/* Main Central View based on activeTab */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'runner' && (
            <AgentRunner
              agent={activeAgent}
              onExecute={handleExecuteAgent}
              onSendToChat={handleSendToChat}
              onEditAgent={handleEditAgent}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'builder' && (
            <AgentBuilder
              agentToEdit={agentToEdit}
              customSkills={customSkills}
              onSaveAgent={handleSaveAgent}
              onCancel={() => setActiveTab('runner')}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'chat' && (
            <AgentPlayground
              agent={activeAgent}
              initialPrompt={chatInitialPrompt}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'skills' && (
            <SkillManager
              customSkills={customSkills}
              onSaveSkill={handleSaveSkill}
              onDeleteSkill={handleDeleteSkill}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'workflows' && (
            <MultiAgentStudio
              workflows={workflows}
              agents={agents}
              onSaveWorkflow={handleSaveWorkflow}
              onDeleteWorkflow={handleDeleteWorkflow}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'export' && (
            <AgentExport
              agent={activeAgent}
              onImportAgent={handleImportAgent}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'history' && (
            <AgentLogs
              logs={logs}
              onClearLogs={() => setLogs([])}
              onSelectLog={(log) => {
                setActiveAgentId(log.agentId);
                setActiveTab('runner');
              }}
              isDarkMode={isDarkMode}
            />
          )}
        </main>
      </div>

      {/* Quick Spotlight Search Overlay (⌘K) */}
      <SpotlightModal
        isOpen={spotlightOpen}
        onClose={() => setSpotlightOpen(false)}
        agents={agents}
        onSelectAgent={(id) => {
          setActiveAgentId(id);
          setActiveTab('runner');
        }}
        onNewAgent={handleNewAgent}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
