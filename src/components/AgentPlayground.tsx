import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  RotateCcw, 
  Copy, 
  Check, 
  User
} from 'lucide-react';
import { AgentDefinition, ChatMessage } from '../types';

interface AgentPlaygroundProps {
  agent: AgentDefinition;
  initialPrompt?: string;
  isDarkMode: boolean;
}

export const AgentPlayground: React.FC<AgentPlaygroundProps> = ({
  agent,
  initialPrompt = '',
  isDarkMode,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>(initialPrompt);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize with greeting if empty
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          content: `Bonjour ! Je suis **${agent.name}** ${agent.icon}. ${agent.description}\n\nComment puis-je vous aider pour cette tâche aujourd'hui ?`,
          timestamp: Date.now(),
        }
      ]);
    }
  }, [agent.id]);

  useEffect(() => {
    if (initialPrompt && initialPrompt !== inputMessage) {
      setInputMessage(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Filter out welcome message for API call
      const apiMessages = newMessages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: agent.systemInstruction,
          messages: apiMessages,
          model: agent.model,
          temperature: agent.temperature,
          enableSearch: agent.enableSearch,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const modelMsg: ChatMessage = {
          id: `model_${Date.now()}`,
          role: 'model',
          content: data.reply,
          timestamp: Date.now(),
          durationMs: data.durationMs,
        };
        setMessages([...newMessages, modelMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `err_${Date.now()}`,
          role: 'model',
          content: `⚠️ Erreur : ${data.error || "Impossible d'obtenir une réponse de Gemini."}`,
          timestamp: Date.now(),
        };
        setMessages([...newMessages, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'model',
        content: `⚠️ Erreur réseau : ${err.message || 'Échec de connexion au serveur.'}`,
        timestamp: Date.now(),
      };
      setMessages([...newMessages, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        content: `Conversation réinitialisée. Que voulez-vous tester avec **${agent.name}** ?`,
        timestamp: Date.now(),
      }
    ]);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden select-none transition-colors ${
      isDarkMode ? 'bg-[#121215]' : 'bg-[#F5F5F7]'
    }`}>
      {/* Playground Header */}
      <header className={`h-14 border-b flex items-center justify-between px-8 transition-colors ${
        isDarkMode ? 'bg-[#18181c]/80 border-[#2c2c30]' : 'bg-white/70 border-[#D2D2D7]'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="text-xl">{agent.icon}</div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#1D1D1F] dark:text-white uppercase tracking-tight">Playground Conversationnel</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-600/10 text-blue-600 font-bold uppercase tracking-wider">
                {agent.name}
              </span>
            </div>
            <p className="text-[11px] text-[#86868B]">
              Dialogue interactif multi-tours direct avec l'agent.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="btn-clear-chat"
            onClick={handleClearChat}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              isDarkMode ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800' : 'border-[#D2D2D7] text-[#424245] hover:bg-gray-50'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Réinitialiser</span>
          </button>
        </div>
      </header>

      {/* Messages List Container */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 max-w-4xl mx-auto w-full custom-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                  {agent.icon}
                </div>
              )}

              <div className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed transition-all group relative ${
                isUser
                  ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                  : isDarkMode
                    ? 'bg-[#1a1a1f] border border-[#2c2c30] text-neutral-100 rounded-bl-xs'
                    : 'bg-white border border-[#D2D2D7] text-[#1D1D1F] rounded-bl-xs shadow-xs'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Telemetry and quick copy */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-black/10 dark:border-white/10 text-[10px] opacity-70">
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  {msg.durationMs && <span>⚡ {msg.durationMs}ms</span>}
                  <button
                    onClick={() => handleCopyMessage(msg.id, msg.content)}
                    className="hover:opacity-100 p-0.5 rounded"
                    title="Copier le message"
                  >
                    {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-neutral-700 dark:text-neutral-200" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-sm flex-shrink-0">
              {agent.icon}
            </div>
            <div className={`rounded-2xl p-4 text-xs flex items-center space-x-2.5 ${
              isDarkMode ? 'bg-[#1a1a1f] border border-[#2c2c30]' : 'bg-white border border-[#D2D2D7]'
            }`}>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
              </div>
              <span className="text-[#86868B] text-[11px] font-medium">L'agent réfléchit avec Gemini...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className={`p-4 border-t transition-colors ${
        isDarkMode ? 'bg-[#18181c] border-[#2c2c30]' : 'bg-white border-[#D2D2D7]'
      }`}>
        <div className="max-w-4xl mx-auto w-full">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              type="text"
              id="playground-chat-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Envoyez un message ou une consigne à ${agent.name}...`}
              className={`w-full pl-4 pr-24 py-3 text-xs rounded-full border outline-none transition-all ${
                isDarkMode
                  ? 'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:border-blue-500'
                  : 'bg-[#F5F5F7] border-[#D2D2D7] text-[#1D1D1F] placeholder-[#86868B] focus:border-blue-500 focus:bg-white'
              }`}
            />

            <button
              type="submit"
              id="btn-send-playground-msg"
              disabled={!inputMessage.trim() || isLoading}
              className={`absolute right-2 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                !inputMessage.trim() || isLoading
                  ? 'opacity-40 cursor-not-allowed text-neutral-400'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Envoyer</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
