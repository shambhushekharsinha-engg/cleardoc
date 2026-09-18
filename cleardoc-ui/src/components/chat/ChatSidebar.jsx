import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, ChevronRight, Loader2, Trash2, Bot, User, Copy, Check } from 'lucide-react';
import SuggestedPrompts from './SuggestedPrompts';

export default function ChatSidebar({
  messages = [],
  isLoading = false,
  onSendMessage,
  onClearChat,
  className = '',
}) {
  // Local input state completely decoupled from parent dashboard to prevent re-renders
  const [inputValue, setInputValue] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleSelectSuggestedPrompt = (promptText) => {
    if (isLoading) return;
    onSendMessage(promptText);
  };

  const handleCopyMessage = async (msgId, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.warn('Message copy failed:', err);
    }
  };

  return (
    <div
      className={`bg-white shadow-2xl shadow-slate-200/50 rounded-3xl border border-slate-100 h-[750px] flex flex-col overflow-hidden sticky top-24 ${className}`}
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center">
              Ask ClearDoc
              <span className="ml-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Ask questions about clauses, penalties & terms
            </p>
          </div>
        </div>

        {messages.length > 1 && (
          <button
            onClick={onClearChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Clear chat history"
            aria-label="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const msgId = msg.id || `${msg.role}-${msg.content.slice(0, 10)}`;

          return (
            <div
              key={msgId}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center space-x-1.5 mb-1 px-1 text-[11px] text-slate-400 font-medium">
                {isUser ? (
                  <>
                    <span>You</span>
                    <User className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3 text-indigo-600" />
                    <span>ClearDoc AI</span>
                  </>
                )}
                {msg.timestamp && <span>• {msg.timestamp}</span>}
              </div>

              <div
                className={`relative group p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed max-w-[88%] font-medium shadow-xs ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Copy button for assistant responses */}
                {!isUser && (
                  <button
                    onClick={() => handleCopyMessage(msgId, msg.content)}
                    className="absolute top-2 right-2 p-1 rounded-md bg-slate-100/80 hover:bg-slate-200 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy response"
                    aria-label="Copy response"
                  >
                    {copiedId === msgId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-1 mb-1 px-1 text-[11px] text-slate-400 font-medium">
              <Bot className="w-3 h-3 text-indigo-600" />
              <span>ClearDoc AI</span>
            </div>
            <div className="bg-white border border-slate-200 text-slate-500 p-3.5 rounded-2xl rounded-tl-xs max-w-[85%] text-xs flex items-center shadow-xs">
              <Loader2 className="w-4 h-4 mr-2 animate-spin text-indigo-600" />
              <span>Analyzing clauses with Claude 3...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Chips (Fixed above input) */}
      <div className="p-3 bg-slate-50/90 border-t border-slate-200/50 flex-shrink-0">
        <SuggestedPrompts
          onSelectPrompt={handleSelectSuggestedPrompt}
          disabled={isLoading}
        />
      </div>

      {/* Input Box */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-100 flex-shrink-0">
        <form
          onSubmit={handleSubmit}
          className="flex items-center bg-slate-100 rounded-2xl px-3 sm:px-4 py-1.5 border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all"
        >
          <input
            type="text"
            placeholder="Ask a question about this contract..."
            className="bg-transparent border-none focus:outline-none flex-1 text-xs sm:text-sm text-slate-900 py-2 font-medium"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 ml-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
            aria-label="Send message"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
