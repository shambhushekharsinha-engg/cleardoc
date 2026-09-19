import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FileUploadZone from '../components/upload/FileUploadZone';

describe('FileUploadZone Component', () => {
  it('renders headline, drop area, browse button and sample loader', () => {
    const handleFileSelect = vi.fn();
    const handleLoadSample = vi.fn();

    render(
      <FileUploadZone
        onFileSelect={handleFileSelect}
        onLoadSample={handleLoadSample}
        isProcessing={false}
      />
    );

    expect(screen.getByText(/Don't sign what you/i)).toBeInTheDocument();
    expect(screen.getByText(/Drop your document here/i)).toBeInTheDocument();
    expect(screen.getByText(/Supports PDF, JPG, PNG/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Browse Files/i })).toBeInTheDocument();
    expect(screen.getByText(/Select a Sample Document/i)).toBeInTheDocument();
  });

  it('allows valid PDF file selection via input change and triggers onFileSelect', () => {
    const handleFileSelect = vi.fn();
    render(<FileUploadZone onFileSelect={handleFileSelect} />);

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();

    const validPdf = new File(['%PDF-1.4 mock content'], 'contract.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(fileInput, { target: { files: [validPdf] } });

    expect(handleFileSelect).toHaveBeenCalledTimes(1);
    expect(handleFileSelect).toHaveBeenCalledWith(validPdf);
  });

  it('allows valid PNG/JPG image selection', () => {
    const handleFileSelect = vi.fn();
    render(<FileUploadZone onFileSelect={handleFileSelect} />);

    const fileInput = document.querySelector('input[type="file"]');
    const validPng = new File(['mock png'], 'agreement_photo.png', {
      type: 'image/png',
    });

    fireEvent.change(fileInput, { target: { files: [validPng] } });

    expect(handleFileSelect).toHaveBeenCalledTimes(1);
    expect(handleFileSelect).toHaveBeenCalledWith(validPng);
  });

  it('rejects unsupported file formats (.docx, .txt) and displays validation error', () => {
    const handleFileSelect = vi.fn();
    render(<FileUploadZone onFileSelect={handleFileSelect} />);

    const fileInput = document.querySelector('input[type="file"]');
    const invalidDoc = new File(['plain text'], 'document.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    fireEvent.change(fileInput, { target: { files: [invalidDoc] } });

    expect(handleFileSelect).not.toHaveBeenCalled();
    expect(screen.getByText(/Unsupported file type/i)).toBeInTheDocument();
  });

  it('rejects files larger than 10MB and shows size error banner', () => {
    const handleFileSelect = vi.fn();
    render(<FileUploadZone onFileSelect={handleFileSelect} />);

    const fileInput = document.querySelector('input[type="file"]');
    // Create an 11MB dummy file
    const oversizedFile = new File(['x'], 'large_document.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(oversizedFile, 'size', { value: 11 * 1024 * 1024 });

    fireEvent.change(fileInput, { target: { files: [oversizedFile] } });

    expect(handleFileSelect).not.toHaveBeenCalled();
    expect(screen.getByText(/exceeds the 10MB limit/i)).toBeInTheDocument();
  });

  it('handles drag & drop events: dragover, dragleave, and drop', () => {
    const handleFileSelect = vi.fn();
    render(<FileUploadZone onFileSelect={handleFileSelect} />);

    const dropArea = screen.getByText(/Drop your document here/i).closest('div.border-dashed');
    expect(dropArea).toBeInTheDocument();

    // Drag over
    fireEvent.dragOver(dropArea, { preventDefault: vi.fn() });
    expect(screen.getByText(/Drop to start analyzing/i)).toBeInTheDocument();

    // Drag leave
    fireEvent.dragLeave(dropArea, { preventDefault: vi.fn() });
    expect(screen.getByText(/Drop your document here/i)).toBeInTheDocument();

    // Drop valid file
    const droppedPdf = new File(['dummy content'], 'dropped_lease.pdf', {
      type: 'application/pdf',
    });
    fireEvent.drop(dropArea, {
      preventDefault: vi.fn(),
      dataTransfer: { files: [droppedPdf] },
    });

    expect(handleFileSelect).toHaveBeenCalledWith(droppedPdf);
  });

  it('allows dismissing the validation error', () => {
    const handleFileSelect = vi.fn();
    render(<FileUploadZone onFileSelect={handleFileSelect} />);

    const fileInput = document.querySelector('input[type="file"]');
    const invalidFile = new File(['data'], 'notes.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    const dismissBtn = screen.getByRole('button', { name: /Dismiss/i });
    expect(dismissBtn).toBeInTheDocument();

    fireEvent.click(dismissBtn);
    expect(screen.queryByText(/Unsupported file type/i)).not.toBeInTheDocument();
  });

  it('triggers onLoadSample when sample document button is clicked', () => {
    const handleLoadSample = vi.fn();
    render(<FileUploadZone onFileSelect={vi.fn()} onLoadSample={handleLoadSample} />);

    const sampleBtn = screen.getByRole('button', { name: /Select a Sample Document/i });
    fireEvent.click(sampleBtn);
    
    const option = screen.getByText(/Bangalore Residential Lease/i);
    fireEvent.click(option);

    expect(handleLoadSample).toHaveBeenCalledTimes(1);
    expect(handleLoadSample).toHaveBeenCalledWith('sample-bangalore-lease-2026');
  });
});
