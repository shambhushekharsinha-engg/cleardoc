import { useState, useCallback } from 'react';
import {
  getUploadUrl,
  uploadFileToS3,
  analyzeDocument,
} from '../services/api';
import { SAMPLE_ANALYSIS } from '../constants/mockData';

export function useDocumentAnalysis() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'uploading' | 'analyzing' | 'success' | 'error'
  const [currentStep, setCurrentStep] = useState(0); // 0=idle, 1=S3, 2=Textract, 3=Claude 3
  const [loadingPhase, setLoadingPhase] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);

  /**
   * Orchestrates the document upload and analysis pipeline.
   */
  const uploadAndAnalyze = useCallback(async (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setStatus('uploading');
    setError(null);
    setCurrentStep(1);
    setLoadingPhase('Uploading to AWS S3...');

    try {
      // Step 1: Get pre-signed upload URL
      const { uploadUrl, objectKey, documentId: newDocId, isMock: uploadMock } =
        await getUploadUrl(selectedFile);

      // Upload file directly to S3
      await uploadFileToS3(uploadUrl, selectedFile);

      // Step 2: Textract OCR phase
      setCurrentStep(2);
      setStatus('analyzing');
      setLoadingPhase('Extracting text with Amazon Textract...');
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Step 3: Bedrock Claude 3 clause analysis
      setCurrentStep(3);
      setLoadingPhase('Analyzing legal clauses with Claude 3...');

      const result = await analyzeDocument({
        objectKey,
        documentId: newDocId,
        file: selectedFile,
      });

      setDocumentId(result.documentId);
      setAnalysis(result);
      setIsMock(Boolean(uploadMock || result.is_mock));
      setStatus('success');
      setCurrentStep(0);
      setLoadingPhase('');
    } catch (err) {
      console.error('Error during document analysis flow:', err);
      setError(err.message || 'Failed to analyze document.');
      setStatus('error');
      setCurrentStep(0);
      setLoadingPhase('');
    }
  }, []);

  /**
   * One-click starter that loads the sample residential lease.
   * Requirement R3: Skips S3 upload entirely, immediately begins simulated Textract + Bedrock
   * analysis cycling through loading phases with a realistic 3.1s delay (< 4000ms test timeout).
   */
  const loadSampleDocument = useCallback(async () => {
    const mockFile = new File(
      ['Sample Bangalore Residential Lease Content'],
      'Sample Bangalore Residential Lease (2026).pdf',
      { type: 'application/pdf' }
    );
    setFile(mockFile);
    setError(null);

    // Skip S3 upload entirely: immediately begin simulated analysis
    setStatus('analyzing');
    setCurrentStep(2);
    setLoadingPhase('Extracting text with Amazon Textract...');

    // Phase 1: Amazon Textract OCR extraction (1000ms)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Phase 2: Amazon Bedrock Claude 3 clause analysis (1100ms)
    setCurrentStep(3);
    setLoadingPhase('Analyzing legal clauses with Amazon Bedrock Claude 3...');
    await new Promise((resolve) => setTimeout(resolve, 1100));

    // Phase 3: Synthesizing plain English risk assessment (1000ms)
    setLoadingPhase('Synthesizing plain English risk assessment...');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Total realistic delay: 3100ms (3.1s, satisfies 3-4s requirement and < 4000ms timeout)
    setDocumentId(SAMPLE_ANALYSIS.documentId);
    setAnalysis(SAMPLE_ANALYSIS);
    setIsMock(true);
    setStatus('success');
    setCurrentStep(0);
    setLoadingPhase('');
  }, []);

  /**
   * Resets state back to the idle upload screen.
   */
  const reset = useCallback(() => {
    setFile(null);
    setStatus('idle');
    setCurrentStep(0);
    setLoadingPhase('');
    setAnalysis(null);
    setDocumentId(null);
    setError(null);
    setIsMock(false);
  }, []);

  return {
    file,
    status,
    isProcessing: status === 'uploading' || status === 'analyzing',
    currentStep,
    loadingPhase,
    analysis,
    documentId,
    error,
    isMock,
    uploadAndAnalyze,
    loadSampleDocument,
    reset,
  };
}
