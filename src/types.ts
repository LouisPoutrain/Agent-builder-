export type AgentCategory = 
  | 'mac-automation' 
  | 'productivity' 
  | 'coding' 
  | 'data-analysis' 
  | 'writing' 
  | 'research';

export type InputVariableType = 'text' | 'textarea' | 'select' | 'code' | 'number';

export interface AgentInputVariable {
  id: string;
  label: string;
  type: InputVariableType;
  placeholder?: string;
  defaultValue?: string;
  options?: string[]; // For select type
  description?: string;
  required?: boolean;
}

export type OutputFormat = 'markdown' | 'code' | 'json' | 'checklist' | 'table';

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or Lucide icon name
  category: AgentCategory;
  accentColor: string; // Tailwind color class or hex
  isBuiltIn?: boolean;
  systemInstruction: string;
  promptTemplate: string; // Contains {{variable_id}} placeholders
  inputVariables: AgentInputVariable[];
  model: string;
  temperature: number;
  topP?: number;
  thinkingLevel?: 'LOW' | 'HIGH' | 'MINIMAL';
  enableSearch?: boolean;
  jsonResponse?: boolean;
  outputFormat: OutputFormat;
  createdAt: number;
  updatedAt: number;
  samplePresets?: Record<string, string>[];
}

export interface ExecutionRecord {
  id: string;
  agentId: string;
  agentName: string;
  timestamp: number;
  inputs: Record<string, string>;
  output: string;
  durationMs: number;
  model: string;
  status: 'success' | 'error';
  errorMessage?: string;
  tokenUsage?: {
    promptTokens?: number;
    candidatesTokens?: number;
    totalTokens?: number;
  };
  groundingSources?: Array<{ uri: string; title: string }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  durationMs?: number;
}

export type ActiveTab = 'runner' | 'builder' | 'chat' | 'batch' | 'export' | 'history';
