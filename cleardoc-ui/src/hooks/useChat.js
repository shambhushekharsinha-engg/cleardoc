import { useState, useCallback } from 'react';
import { sendChatMessage } from '../services/api';

const DEFAULT_WELCOME = {
  id: 'msg-welcome',
  role: 'assistant',
  content: "Hi! I've analyzed your document. What questions do you have about the clauses, obligations, or potential liabilities?",
  timestamp: 'Just now',
};

export function useChat(documentId) {
  const [messages, setMessages] = useState([DEFAULT_WELCOME]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  /**
   * Sends a message to the AI assistant.
   */
  const sendMessage = useCallback(
    async (questionText) => {
      const trimmed = questionText?.trim();
      if (!trimmed || isChatLoading) return;

      const userMessage = {
        id: `msg-user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsChatLoading(true);
      setChatError(null);

      try {
        const response = await sendChatMessage({
          documentId,
          question: trimmed,
        });

        const assistantMessage = {
          id: `msg-assistant-${Date.now()}`,
          role: 'assistant',
          content: response.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMock: response.is_mock,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        console.error('Chat submission error:', err);
        setChatError('Failed to send question. Please try again.');
      } finally {
        setIsChatLoading(false);
      }
    },
    [documentId, isChatLoading]
  );

  /**
   * Clears conversation and resets to welcome greeting.
   */
  const clearChat = useCallback(() => {
    setMessages([DEFAULT_WELCOME]);
    setChatError(null);
  }, []);

  return {
    messages,
    isChatLoading,
    chatError,
    sendMessage,
    clearChat,
  };
}
