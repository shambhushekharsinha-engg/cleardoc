import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Sparkles, AlertCircle, FileCheck2, ShieldAlert, ArrowRight, Database, Zap, ScanText } from 'lucide-react';
import { validateDocumentFile } from '../../utils/fileValidation';
import SampleDocumentLoader from '../common/SampleDocumentLoader';

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload Your Document',
    desc: 'Drop a PDF or image of any legal document — lease, contract, or agreement. Stored securely on Amazon S3.',
    color: 'from-indigo-500 to-indigo-600',
    light: 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
  },
  {
    step: '02',
    icon: ScanText,
    title: 'AWS AI Analyzes',
    desc: 'Amazon Textract extracts every word from even scanned documents. Amazon Bedrock (Claude 3) decodes the legal language.',
    color: 'from-purple-500 to-purple-600',
    light: 'bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
  },
  {
    step: '03',
    icon: Zap,
    title: 'Get Plain English Results',
    desc: 'See a summary, severity-rated red flags with negotiation advice, and safe clauses — in seconds. Chat with your document.',
    color: 'from-emerald-500 to-emerald-600',
    light: 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
  },
];

const AWS_BADGES = [
  { name: 'Amazon Textract', desc: 'OCR & Document Extraction', icon: ScanText, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800' },
  { name: 'Amazon Bedrock', desc: 'Claude 3 AI Analysis', icon: Sparkles, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800' },
  { name: 'Amazon S3', desc: 'Secure Document Storage', icon: Database, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800' },
];

export default function FileUploadZone({ onFileSelect, onLoadSample, isProcessing = false }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;
    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      setValidationError(validation.error);
      return;
    }
    setValidationError(null);
    onFileSelect(file);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length > 0) processFile(e.dataTransfer.files[0]);
  };
  const handleFileInputChange = (e) => {
    if (e.target.files?.length > 0) processFile(e.target.files[0]);
  };

  return (
    <motion.div
      key="upload-zone"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto mt-4 px-4"
    >
      {/* ── HERO SECTION ── */}
      <div className="text-center mb-12">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="inline-flex items-center space-x-2 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-4 py-2 rounded-full font-semibold text-xs sm:text-sm mb-6 border border-rose-100 dark:border-rose-800 shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <span>Over <strong>60% of Indian tenants</strong> sign agreements without understanding all key clauses.</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-slate-50 tracking-tight mb-6 leading-[1.05]">
          Don't sign what you{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            don't understand.
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
          Upload your rental lease, employment contract, or vendor agreement. ClearDoc's AWS AI translates dense legalese into plain English, flags hidden liabilities with expert negotiation tips, and lets you chat with your document.
        </motion.p>

        {/* AWS Service Trust Badges */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="flex flex-wrap justify-center gap-2 mb-10">
          {AWS_BADGES.map((badge) => (
            <span key={badge.name} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${badge.color}`}>
              <badge.icon className="w-3.5 h-3.5" />
              {badge.name}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 flex items-start space-x-3 text-rose-800 dark:text-rose-300 text-sm shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{validationError}</div>
          <button onClick={() => setValidationError(null)} className="text-xs underline text-rose-600 dark:text-rose-400 hover:text-rose-900 ml-2">Dismiss</button>
        </motion.div>
      )}

      {/* ── DROP ZONE ── */}
      <motion.div
        whileHover={{ scale: 1.008 }} whileTap={{ scale: 0.995 }}
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center transition-all cursor-pointer shadow-xl group relative overflow-hidden ${
          isDragOver
            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-900/30 ring-4 ring-indigo-500/10'
            : 'border-indigo-200/80 dark:border-indigo-700/50 bg-white dark:bg-slate-800/60 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 shadow-slate-200/50 dark:shadow-slate-900/50'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="relative z-10">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 shadow-md ${
            isDragOver
              ? 'bg-indigo-600 text-white scale-110'
              : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white'
          }`}>
            <Upload className="h-9 w-9" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50">
            {isDragOver ? 'Drop to start analyzing' : 'Drop your document here'}
          </h3>
          <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400">Supports PDF, JPG, PNG — Max 10MB. Your document is never stored permanently.</p>
          <div className="mt-8">
            <button type="button"
              className="w-full sm:w-auto bg-slate-900 dark:bg-indigo-600 text-white py-3.5 px-10 rounded-full font-bold text-base hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors shadow-lg shadow-slate-300/60 dark:shadow-indigo-900/40">
              Browse Files
            </button>
            <input ref={fileInputRef} id="file-upload-input" type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileInputChange} />
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex items-center justify-center space-x-6 text-xs text-slate-400 dark:text-slate-500 font-medium">
            <span className="flex items-center"><FileCheck2 className="w-4 h-4 mr-1 text-emerald-500" />Auto-classified</span>
            <span className="flex items-center"><ShieldAlert className="w-4 h-4 mr-1 text-indigo-500" />Liability flags</span>
          </div>
        </div>
      </motion.div>

      {/* Sample Document Quick-Start */}
      <div className="mt-6">
        <SampleDocumentLoader onLoadSample={onLoadSample} disabled={isProcessing} />
      </div>

      {/* ── HOW IT WORKS ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="mt-20">
        <p className="text-center text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-8">How It Works</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((step, i) => (
            <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
              className="bg-white dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/60 shadow-lg shadow-slate-100/60 dark:shadow-slate-900/40 relative">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${step.light}`}>
                <step.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-black text-slate-300 dark:text-slate-600 tracking-widest">{step.step}</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-6 h-6 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="mt-16 pb-8 text-center text-xs text-slate-400 dark:text-slate-600 space-x-4">
        <span>Built for WeMakeDevs × AWS Hackathon 2026</span>
        <span>·</span>
        <span>Powered by Amazon Bedrock · Textract · S3 · DynamoDB</span>
      </motion.div>
    </motion.div>
  );
}
