import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChatSidebar from '../components/chat/ChatSidebar';

const sampleMessages = [
  {
    id: 'msg-1',
    role: 'assistant',
    content: "Hi! I've analyzed your document. What questions do you have?",
    timestamp: '10:00 AM',
  },
  {
    id: 'msg-2',
    role: 'user',
    content: 'Can the landlord evict me without 30 days notice?',
    timestamp: '10:01 AM',
  },
  {
    id: 'msg-3',
    role: 'assistant',
    content: 'Clause 7 permits eviction on only 7 days notice without cause.',
    timestamp: '10:01 AM',
  },
];

describe('ChatSidebar Component', () => {
  it('renders chat header, existing messages, suggested prompt chips, and input field', () => {
    render(
      <ChatSidebar
        messages={sampleMessages}
        isLoading={false}
        onSendMessage={vi.fn()}
        onClearChat={vi.fn()}
      />
    );

    expect(screen.getByText(/Ask ClearDoc/i)).toBeInTheDocument();
    expect(screen.getByText(/Can the landlord evict me without 30 days notice\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Clause 7 permits eviction on only 7 days notice/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask a question about this contract.../i)).toBeInTheDocument();
    expect(screen.getByText(/Who pays for structural maintenance\?/i)).toBeInTheDocument();
  });

  it('submits a user question when clicking the send button and clears input', () => {
    const handleSendMessage = vi.fn();

    render(
      <ChatSidebar
        messages={sampleMessages}
        isLoading={false}
        onSendMessage={handleSendMessage}
        onClearChat={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/Ask a question about this contract.../i);
    fireEvent.change(input, { target: { value: 'Is the security deposit refundable?' } });

    const sendBtn = screen.getByRole('button', { name: /Send message/i });
    expect(sendBtn).not.toBeDisabled();

    fireEvent.click(sendBtn);

    expect(handleSendMessage).toHaveBeenCalledTimes(1);
    expect(handleSendMessage).toHaveBeenCalledWith('Is the security deposit refundable?');
    expect(input.value).toBe('');
  });

  it('does not submit when input contains only whitespace', () => {
    const handleSendMessage = vi.fn();

    render(
      <ChatSidebar
        messages={sampleMessages}
        isLoading={false}
        onSendMessage={handleSendMessage}
        onClearChat={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText(/Ask a question about this contract.../i);
    fireEvent.change(input, { target: { value: '   ' } });

    const sendBtn = screen.getByRole('button', { name: /Send message/i });
    expect(sendBtn).toBeDisabled();

    fireEvent.submit(sendBtn.closest('form'));
    expect(handleSendMessage).not.toHaveBeenCalled();
  });

  it('triggers onSendMessage when a suggested prompt chip is clicked', () => {
    const handleSendMessage = vi.fn();

    render(
      <ChatSidebar
        messages={sampleMessages}
        isLoading={false}
        onSendMessage={handleSendMessage}
        onClearChat={vi.fn()}
      />
    );

    const promptChip = screen.getByText(/Who pays for structural maintenance\?/i);
    fireEvent.click(promptChip);

    expect(handleSendMessage).toHaveBeenCalledTimes(1);
    expect(handleSendMessage).toHaveBeenCalledWith('Who pays for structural maintenance?');
  });

  it('shows loading indicator and disables inputs when isLoading is true', () => {
    render(
      <ChatSidebar
        messages={sampleMessages}
        isLoading={true}
        onSendMessage={vi.fn()}
        onClearChat={vi.fn()}
      />
    );

    expect(screen.getByText(/Analyzing clauses with Claude 3.../i)).toBeInTheDocument();
    const input = screen.getByPlaceholderText(/Ask a question about this contract.../i);
    expect(input).toBeDisabled();

    const sendBtn = screen.getByRole('button', { name: /Send message/i });
    expect(sendBtn).toBeDisabled();
  });

  it('renders clear chat button when messages > 1 and triggers onClearChat', () => {
    const handleClearChat = vi.fn();

    render(
      <ChatSidebar
        messages={sampleMessages}
        isLoading={false}
        onSendMessage={vi.fn()}
        onClearChat={handleClearChat}
      />
    );

    const clearBtn = screen.getByRole('button', { name: /Clear chat/i });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(handleClearChat).toHaveBeenCalledTimes(1);
  });
});
