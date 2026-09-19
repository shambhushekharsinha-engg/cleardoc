import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';

describe('App Integration Test Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial state with header, upload zone, and guide closed', () => {
    render(<App />);

    // Header
    expect(screen.getByText(/AI Legal Guardian/i)).toBeInTheDocument();

    // Upload Zone
    expect(screen.getByText(/Don't sign what you/i)).toBeInTheDocument();
    expect(screen.getByText(/Supports PDF, JPG, PNG/i)).toBeInTheDocument();
    expect(screen.getByText(/Select a Sample Document/i)).toBeInTheDocument();

    // Guide modal not open initially
    expect(screen.queryByText(/From dense legalese to plain English clarity/i)).not.toBeInTheDocument();
  });

  it('opens and closes the Onboarding Guide walkthrough modal', async () => {
    render(<App />);

    // Click "How it Works" in header
    const howItWorksBtn = screen.getByRole('button', { name: /How it Works/i });
    fireEvent.click(howItWorksBtn);

    // Guide modal should be visible
    await waitFor(() => {
      expect(screen.getByText(/How ClearDoc Works/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Upload Document/i)).toBeInTheDocument();
    expect(screen.getByText(/Amazon Textract OCR/i)).toBeInTheDocument();
    expect(screen.getByText(/Claude 3 Clause Analysis/i)).toBeInTheDocument();

    // Click "Got It, Let's Go" button
    const closeBtn = screen.getByRole('button', { name: /Got It, Let's Go/i });
    fireEvent.click(closeBtn);

    // Guide modal closed
    await waitFor(() => {
      expect(screen.queryByText(/How ClearDoc Works/i)).not.toBeInTheDocument();
    });
  });

  it('completes the 1-click sample lease starter flow', async () => {
    render(<App />);

    const sampleBtn = screen.getByRole('button', { name: /Select a Sample Document/i });
    fireEvent.click(sampleBtn);
    
    const option = screen.getByText(/Bangalore Residential Lease/i);
    fireEvent.click(option);

    // Should transition to processing status
    await waitFor(() => {
      expect(screen.getByText(/Analyzing Your Document/i)).toBeInTheDocument();
    });

    // Wait for analysis dashboard to appear after sample timer steps
    await waitFor(
      () => {
        expect(screen.getByText(/Plain English Summary/i)).toBeInTheDocument();
      },
      { timeout: 4000 }
    );

    // Verify sample analysis contents
    expect(screen.getByText(/Sample Bangalore Residential Lease/i)).toBeInTheDocument();
    expect(screen.getByText(/Red Flags & Critical Concerns/i)).toBeInTheDocument();
    expect(screen.getByText(/Standard & Safe Clauses/i)).toBeInTheDocument();
    expect(screen.getByText(/Ask ClearDoc/i)).toBeInTheDocument();

    // Test reset mechanism (multiple buttons may match, pick first)
    const resetBtns = screen.getAllByRole('button', { name: /Analyze Another/i });
    fireEvent.click(resetBtns[0]);

    // Back to upload zone
    await waitFor(() => {
      expect(screen.getByText(/Don't sign what you/i)).toBeInTheDocument();
    });
  });

  it('executes full live upload -> processing status -> analysis dashboard -> chat flow', async () => {
    // Mock fetch for upload, analyze, and chat endpoints
    global.fetch = vi.fn().mockImplementation((url, options) => {
      const urlStr = String(url);
      if (urlStr.includes('/upload')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              uploadUrl: 'https://test-s3.amazonaws.com/uploads/doc-999.pdf',
              documentId: 'doc-live-999',
              objectKey: 'doc-live-999/live_contract.pdf',
              is_mock: false,
            }),
        });
      }

      if (urlStr.includes('/analyze')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              documentId: 'doc-live-999',
              summary: 'Live AI summary: Valid 24-month commercial lease with indemnity requirements.',
              redFlags: [
                'Clause 12 requires tenant to indemnify landlord against all liabilities.',
                'Clause 19 allows unilateral rent increase with 15 days notice.',
              ],
              greenFlags: [
                'Deposit held in interest-bearing account.',
                'HVAC repair covered by building management.',
              ],
              is_mock: false,
            }),
        });
      }

      if (urlStr.includes('/chat')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              answer: 'Clause 12 imposes broad indemnity obligations on the tenant.',
              is_mock: false,
            }),
        });
      }

      // S3 PUT mock
      if (options?.method === 'PUT') {
        return Promise.resolve({ ok: true, status: 200 });
      }

      return Promise.reject(new Error(`Unhandled URL: ${urlStr}`));
    });

    render(<App />);

    // Select file for upload
    const fileInput = document.querySelector('input[type="file"]');
    const contractFile = new File(['mock content'], 'commercial_lease.pdf', {
      type: 'application/pdf',
    });
    fireEvent.change(fileInput, { target: { files: [contractFile] } });

    // Verify processing status displays
    await waitFor(() => {
      expect(screen.getByText(/Analyzing Your Document/i)).toBeInTheDocument();
    });

    // Wait for analysis dashboard
    await waitFor(
      () => {
        expect(
          screen.getByText(/Valid 24-month commercial lease with indemnity requirements/i)
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify red and green flags
    expect(
      screen.getByText(/Clause 12 requires tenant to indemnify landlord/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Deposit held in interest-bearing account/i)
    ).toBeInTheDocument();

    // Submit chat message
    const chatInput = screen.getByPlaceholderText(/Ask a question about this contract.../i);
    fireEvent.change(chatInput, { target: { value: 'Explain clause 12' } });

    const sendBtn = screen.getByRole('button', { name: /Send message/i });
    fireEvent.click(sendBtn);

    // Verify user message appears immediately
    expect(screen.getByText('Explain clause 12')).toBeInTheDocument();

    // Verify AI response arrives
    await waitFor(
      () => {
        expect(
          screen.getByText(/Clause 12 imposes broad indemnity obligations/i)
        ).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('demonstrates offline / API failure resilience with graceful fallback', async () => {
    // Force all fetch calls to fail (simulate offline / backend unavailable)
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error: backend offline'));

    render(<App />);

    const fileInput = document.querySelector('input[type="file"]');
    const contractFile = new File(['mock content'], 'offline_agreement.pdf', {
      type: 'application/pdf',
    });
    fireEvent.change(fileInput, { target: { files: [contractFile] } });

    // System should still progress through pipeline and fall back to realistic demo analysis
    await waitFor(
      () => {
        expect(screen.getByText(/Plain English Summary/i)).toBeInTheDocument();
      },
      { timeout: 3500 }
    );

    expect(screen.getByText(/Demo Mode/i)).toBeInTheDocument();
    expect(screen.getAllByText(/offline_agreement.pdf/i).length).toBeGreaterThanOrEqual(1);
  });
});
