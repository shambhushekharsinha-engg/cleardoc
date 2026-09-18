import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AnalysisDashboard from '../components/analysis/AnalysisDashboard';

const mockAnalysisData = {
  documentId: 'doc-test-456',
  documentName: 'Sample Lease Agreement.pdf',
  riskLevel: 'High',
  riskScore: 85,
  summary: 'This is a 12-month residential lease agreement with significant tenant liabilities.',
  redFlags: [
    {
      id: 'rf-1',
      title: 'Structural Maintenance Trap',
      text: 'Clause 4.2 requires tenant to handle all structural and plumbing repairs.',
      severity: 'critical',
      category: 'High Exposure',
      recommendation: 'Request landlord retain structural maintenance obligations.',
    },
    {
      id: 'rf-2',
      title: 'Short Notice Termination',
      text: 'Clause 7 permits landlord to evict on 7 days notice without cause.',
      severity: 'warning',
      category: 'Contract Advisory',
      recommendation: 'Amend to 30 days written notice with specified cause.',
    },
  ],
  greenFlags: [
    {
      id: 'gf-1',
      title: 'Escrow Protected Deposit',
      text: 'Security deposit is held in an interest-bearing escrow account.',
      benefit: 'Protects tenant funds from commingling.',
    },
  ],
  is_mock: true,
};

const mockChatState = {
  messages: [
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: 'Hi! What questions do you have?',
    },
  ],
  isChatLoading: false,
  sendMessage: vi.fn(),
  clearChat: vi.fn(),
};

describe('AnalysisDashboard Component', () => {
  it('renders metadata bar, summary card, risk meter, flags, and chat sidebar', () => {
    const handleReset = vi.fn();

    render(
      <AnalysisDashboard
        analysis={mockAnalysisData}
        documentFile={{ name: 'Sample Lease Agreement.pdf' }}
        onReset={handleReset}
        chatState={mockChatState}
      />
    );

    // Title and demo mode badge
    expect(screen.getByText(/Sample Lease Agreement.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/Demo Mode/i)).toBeInTheDocument();

    // Risk meter
    expect(screen.getByText(/Document Risk Meter/i)).toBeInTheDocument();
    expect(screen.getByText(/High Risk/i)).toBeInTheDocument();
    expect(screen.getByText(/85\/100/i)).toBeInTheDocument();

    // Summary Card
    expect(screen.getByText(/Plain English Summary/i)).toBeInTheDocument();
    expect(screen.getByText(mockAnalysisData.summary)).toBeInTheDocument();

    // Red Flags Card
    expect(screen.getByText(/Red Flags & Critical Concerns/i)).toBeInTheDocument();
    expect(screen.getByText('Structural Maintenance Trap')).toBeInTheDocument();
    expect(screen.getByText(/Critical Trap/i)).toBeInTheDocument();
    expect(screen.getAllByText(/What to negotiate:/i).length).toBeGreaterThanOrEqual(1);

    // Green Flags Card
    expect(screen.getByText(/Standard & Safe Clauses/i)).toBeInTheDocument();
    expect(screen.getByText(/Escrow Protected Deposit/i)).toBeInTheDocument();
    expect(screen.getByText(/Why it protects you:/i)).toBeInTheDocument();

    // Chat Sidebar
    expect(screen.getByText(/Ask ClearDoc/i)).toBeInTheDocument();
  });

  it('calls onReset when "Analyze Another Document" is clicked', () => {
    const handleReset = vi.fn();

    render(
      <AnalysisDashboard
        analysis={mockAnalysisData}
        documentFile={{ name: 'test.pdf' }}
        onReset={handleReset}
        chatState={mockChatState}
      />
    );

    const resetBtn = screen.getByRole('button', { name: /Analyze Another/i });
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it('handles "Copy Full Report" button and triggers clipboard write', async () => {
    render(
      <AnalysisDashboard
        analysis={mockAnalysisData}
        documentFile={{ name: 'test.pdf' }}
        onReset={vi.fn()}
        chatState={mockChatState}
      />
    );

    const copyBtn = screen.getByRole('button', { name: /Copy Full Report/i });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText(/Report Copied!/i)).toBeInTheDocument();
    });
  });

  it('renders tooltips on hover over tooltip triggers', async () => {
    render(
      <AnalysisDashboard
        analysis={mockAnalysisData}
        documentFile={{ name: 'test.pdf' }}
        onReset={vi.fn()}
        chatState={mockChatState}
      />
    );

    // Find the Risk Meter help trigger
    const riskHelpTrigger = screen.getByRole('button', { name: /Risk Meter details/i });
    fireEvent.mouseEnter(riskHelpTrigger);

    await waitFor(
      () => {
        expect(
          screen.getByText(/Risk score is calculated based on red flag clause severity/i)
        ).toBeInTheDocument();
      },
      { timeout: 500 }
    );
  });

  it('renders gracefully when red and green flags are empty', () => {
    const emptyFlagsAnalysis = {
      ...mockAnalysisData,
      redFlags: [],
      greenFlags: [],
    };

    render(
      <AnalysisDashboard
        analysis={emptyFlagsAnalysis}
        documentFile={{ name: 'empty.pdf' }}
        onReset={vi.fn()}
        chatState={mockChatState}
      />
    );

    const noClauseNotices = screen.getAllByText(/No clauses identified in this category/i);
    expect(noClauseNotices.length).toBe(2);
  });
});
