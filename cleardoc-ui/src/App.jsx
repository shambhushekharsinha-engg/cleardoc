import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import Header from './components/common/Header';
import OnboardingGuide from './components/common/OnboardingGuide';
import ErrorBoundary from './components/common/ErrorBoundary';
import FileUploadZone from './components/upload/FileUploadZone';
import ProcessingStatus from './components/upload/ProcessingStatus';
import AnalysisDashboard from './components/analysis/AnalysisDashboard';
import { useDocumentAnalysis } from './hooks/useDocumentAnalysis';
import { useChat } from './hooks/useChat';

export default function App() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const {
    file,
    isProcessing,
    currentStep,
    loadingPhase,
    analysis,
    error,
    uploadAndAnalyze,
    loadSampleDocument,
    reset,
  } = useDocumentAnalysis();

  const chatState = useChat(analysis?.documentId);

  const handleResetAll = () => {
    reset();
    chatState.clearChat();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Header */}
      <Header
        onOpenGuide={() => setIsGuideOpen(true)}
        onReset={handleResetAll}
        hasAnalysis={Boolean(analysis && !isProcessing)}
      />

      {/* Onboarding Guide Walkthrough Modal */}
      <OnboardingGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Main Content Area with Error Boundary */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <ErrorBoundary onReset={handleResetAll}>
          {/* Global Pipeline Error Banner */}
          {error && !isProcessing && (
            <div className="max-w-3xl mx-auto mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-800 text-sm shadow-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {isProcessing ? (
              <ProcessingStatus
                key="processing-status"
                currentStep={currentStep}
                loadingPhase={loadingPhase}
              />
            ) : analysis ? (
              <AnalysisDashboard
                key="analysis-dashboard"
                analysis={analysis}
                documentFile={file}
                onReset={handleResetAll}
                chatState={chatState}
              />
            ) : (
              <FileUploadZone
                key="file-upload-zone"
                onFileSelect={uploadAndAnalyze}
                onLoadSample={loadSampleDocument}
                isProcessing={isProcessing}
              />
            )}
          </AnimatePresence>
        </ErrorBoundary>
      </main>
    </div>
  );
}
