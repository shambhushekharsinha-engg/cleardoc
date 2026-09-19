import { describe, it, expect } from 'vitest';
import { validateDocumentFile } from '../utils/fileValidation';

describe('fileValidation Utils', () => {
  it('should return valid: true for a standard PDF file under 10MB', () => {
    const validPdf = new File(['dummy pdf content'], 'test_document.pdf', {
      type: 'application/pdf',
    });
    
    const result = validateDocumentFile(validPdf);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should return an error for unsupported file extensions like .txt or .exe', () => {
    const invalidTextFile = new File(['hello world'], 'notes.txt', {
      type: 'text/plain',
    });
    
    const result = validateDocumentFile(invalidTextFile);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Unsupported file type/i);
  });

  it('should return an error for files exceeding the 10MB size limit', () => {
    const largePdf = new File(['x'], 'huge_file.pdf', {
      type: 'application/pdf',
    });
    // Mock the size property to simulate 15MB
    Object.defineProperty(largePdf, 'size', { value: 15 * 1024 * 1024 });

    const result = validateDocumentFile(largePdf);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/exceeds the 10MB limit/i);
  });

  it('should return valid: true for a file with a valid image mime type even if extension is missing/weird', () => {
    const validImage = new File(['image data'], 'weird_file_name', {
      type: 'image/jpeg',
    });
    
    const result = validateDocumentFile(validImage);
    expect(result.valid).toBe(true);
  });
});
