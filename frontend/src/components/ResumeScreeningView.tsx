import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, FileText, X, AlertCircle, Play, FileIcon, Briefcase } from 'lucide-react';
import { runScreening } from '../api';
import type { WorkflowResponse } from '../types/api';

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function ResumeScreeningView({ onAnalysisComplete }: { onAnalysisComplete?: (results?: WorkflowResponse[]) => void }) {
  const [phase, setPhase] = useState<'upload' | 'config' | 'processing'>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [roleTitle, setRoleTitle] = useState('');
  const [screeningResults, setScreeningResults] = useState<WorkflowResponse[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILES = 5;

  const validateAndAddFiles = (newFiles: File[]) => {
    if (files.length + newFiles.length > MAX_FILES) {
      setErrorDetails(`Upload limit exceeded. Please select a maximum of ${MAX_FILES} resumes per batch.`);
      setFiles((prev) => [...prev, ...newFiles]);
    } else {
      setErrorDetails(null);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  }, [files]);

  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => {
      const newFiles = prev.filter((_, idx) => idx !== indexToRemove);
      if (newFiles.length <= MAX_FILES) {
        setErrorDetails(null);
      }
      return newFiles;
    });
  };

  const startExtraction = async () => {
    setPhase('processing');
    setScreeningResults([]);

    const results: WorkflowResponse[] = [];
    for (const file of files) {
      try {
        const formData = new FormData();
        const workflowId = `rs_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        formData.append('workflow_id', workflowId);
        formData.append('role_name', roleTitle);
        formData.append('resume', file);
        const result = await runScreening(formData);
        results.push(result);
      } catch (err: any) {
        results.push({
          workflow_id: `err_${Date.now()}`,
          workflow_type: 'resume_screening',
          status: 'failed',
          intent_summary: `Failed to screen ${file.name}`,
          confidence: 0,
          entities: { employee_name: '', department: '', start_date: '', resources_needed: [], job_role: '', required_skills: [], minimum_experience_years: 0, candidate_count: 0, requirement_source: 'unknown', job_description_provided: false },
          missing_fields: [],
          next_action: 'fallback',
          steps: [],
          current_step_index: 0,
          completed_steps: [],
          failed_steps: [{ step: 'upload', message: err.message || 'Upload failed' }],
          runtime_data: {},
          action_logs: [],
          clarification: {},
          user_clarification: {},
        });
      }
    }
    setScreeningResults(results);
  };

  const isExceeded = files.length > MAX_FILES;
  const isReady = files.length > 0 && files.length <= MAX_FILES && roleTitle.trim().length > 0;

  if (phase === 'processing') {
    return (
      <ScannerView
        results={screeningResults}
        totalFiles={files.length}
        onComplete={() => onAnalysisComplete && onAnalysisComplete(screeningResults)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full flex-1">
      {/* Header - Always visible during upload and config */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-1 shrink-0"
      >
        <h1 className="text-2xl font-semibold text-white tracking-tight">Resume Screening</h1>
        <p className="text-sm text-zinc-400">Batch Intake Protocol: Upload candidate files for GLM extraction and initial scoring.</p>
      </motion.div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {phase === 'upload' && (
          <motion.div 
            key="upload-phase"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6"
          >
            {/* Error Banner */}
            <AnimatePresence>
              {isExceeded && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
                <AlertCircle size={18} className="shrink-0" />
                <span className="text-sm font-medium">
                  {errorDetails || `Upload limit exceeded. Please select a maximum of ${MAX_FILES} resumes per batch.`}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center p-12 rounded-xl transition-all duration-200 border-2 border-dashed ${
            isDragging 
              ? 'border-purple-500 bg-purple-500/5 drop-shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
              : 'border-zinc-700 bg-zinc-900/40 hover:border-zinc-500 hover:bg-zinc-900/60'
          }`}
        >
          <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-800/50 text-zinc-400'}`}>
            <UploadCloud size={32} />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Drag & drop candidate files here</h3>
          <p className="text-sm text-zinc-500 mb-6 font-medium">Supported formats: PDF, DOCX, TXT. Maximum {MAX_FILES} files.</p>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleSelectFiles} 
            className="hidden" 
            multiple 
            accept=".pdf,.doc,.docx,.txt"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium transition-colors border border-white/5 hover:border-white/10"
          >
            Select Files
          </button>
        </div>

        {/* File Staging Area */}
        <div className="flex flex-col gap-2 min-h-[150px]">
          <AnimatePresence>
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/40 border border-white/5 group hover:bg-zinc-800/40 transition-colors"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-10 h-10 rounded bg-zinc-950 flex items-center justify-center border border-white/5 shrink-0 text-zinc-400 group-hover:text-purple-400 transition-colors">
                    {file.name.endsWith('.pdf') ? <FileText size={18} /> : <FileIcon size={18} />}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-medium text-zinc-200 truncate pr-4">{file.name}</span>
                    <span className="text-xs text-zinc-500">{formatFileSize(file.size)}</span>
                  </div>
                </div>
                <button 
                  onClick={() => removeFile(index)}
                  className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  aria-label="Remove file"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {files.length === 0 && (
            <div className="flex items-center justify-center h-full text-zinc-600 text-sm font-medium border border-dashed border-white/5 rounded-lg bg-zinc-900/20 py-8">
              No files currently staged.
            </div>
          )}
        </div>

        {/* Role Assignment */}
        <div className="flex flex-col gap-3 bg-zinc-900/30 border border-white/5 rounded-xl p-5 mb-2">
          <label htmlFor="roleTitle" className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            Target Role <span className="text-purple-400">*</span>
          </label>
          <div className="relative w-full md:w-2/3 lg:w-1/2">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Briefcase size={16} />
            </div>
            <input
              id="roleTitle"
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g., Senior Frontend Engineer"
              className="w-full bg-zinc-950/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner"
            />
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            The system will analyze and score candidates based on the required skills and experience for this role.
          </p>
        </div>

        {/* Call to Action */}
        <div className="pt-4 border-t border-white/5 flex justify-end">
          <button
            disabled={!isReady}
            onClick={startExtraction}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
              isReady 
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer' 
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-70'
            }`}
          >
            <Play size={16} className={isReady ? 'fill-white' : 'fill-zinc-500'} />
            Initialize Extraction
          </button>
        </div>

      </motion.div>
    )}
      </AnimatePresence>
    </div>
  );
}

function ScannerView({ results, totalFiles, onComplete }: { results: WorkflowResponse[]; totalFiles: number; onComplete: () => void }) {
  const [status, setStatus] = useState("Processing...");
  const [subTask, setSubTask] = useState("Uploading resumes to GLM pipeline...");
  const [hashes, setHashes] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const hasCompleted = useRef(false);

  const allDone = results.length === totalFiles && totalFiles > 0;

  useEffect(() => {
    if (allDone && !hasCompleted.current) {
      hasCompleted.current = true;
      setStatus("Complete");
      setSubTask("All resumes processed. Click to view results.");
      setProgress(100);
      const t = setTimeout(() => onComplete(), 2000);
      return () => clearTimeout(t);
    }
  }, [allDone, onComplete]);

  useEffect(() => {
    if (allDone) return;
    const tasks = [
      'Parsing unstructured document layers...',
      'Extracting semantic entity logic...',
      'Routing to GLM inference engine...',
      'Computing alignment vectors...',
      'Evaluating candidate fit...',
      'Deciding candidate outcome...',
      'Scheduling & notifications...',
    ];
    let idx = 0;
    setSubTask(tasks[0]);
    const interval = setInterval(() => {
      idx++;
      setSubTask(tasks[idx % tasks.length]);
    }, 600);
    return () => clearInterval(interval);
  }, [allDone]);

  useEffect(() => {
    const generateHashes = () => {
      return Array.from({ length: 7 }, () => '0x' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase());
    };
    setHashes(generateHashes());
    const interval = setInterval(() => {
      setHashes(generateHashes());
    }, 120);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (allDone) return;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const base = (results.length / totalFiles) * 80;
      const timeBonus = Math.min((elapsed / 30000) * 20, 20);
      setProgress(Math.min(base + timeBonus, 95));
    }, 100);
    return () => clearInterval(interval);
  }, [results.length, totalFiles, allDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[600px] w-full max-w-5xl mx-auto relative z-10 overflow-hidden rounded-3xl"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] md:text-[14rem] font-black text-white/[0.02] whitespace-nowrap pointer-events-none tracking-tighter select-none">
        ANALYSIS_V4
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="flex flex-col items-center z-20 w-full max-w-lg mt-8">
        <AnimatePresence mode="wait">
          <motion.h2
            key={status}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 tracking-tighter text-center drop-shadow-2xl"
          >
            {status}
          </motion.h2>
        </AnimatePresence>

        <div className="h-8 mt-4 mb-10 flex items-center justify-center w-full px-6 bg-zinc-950/40 border border-white/5 rounded-full backdrop-blur-sm max-w-sm">
          <p className="text-purple-400 font-mono text-xs tracking-widest uppercase overflow-hidden whitespace-nowrap text-ellipsis inline-block">
            <span className="opacity-40 select-none mr-2">sys&gt;</span>{subTask}
          </p>
        </div>

        <div className="relative w-64 h-80 bg-zinc-950/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_0_80px_rgba(168,85,247,0.15)] flex flex-col items-center pt-10 pb-8 px-6 overflow-hidden z-10 ring-1 ring-white/10">
          <div className="w-[85%] h-3 bg-zinc-800 rounded-full mb-8 self-start shadow-inner" />
          <div className="w-full flex flex-col gap-3">
            <div className="w-full h-2 bg-zinc-800/60 rounded-full" />
            <div className="w-[90%] h-2 bg-zinc-800/60 rounded-full" />
            <div className="w-[95%] h-2 bg-zinc-800/60 rounded-full" />
            <div className="w-[70%] h-2 bg-zinc-800/60 rounded-full mb-4" />
            <div className="w-[60%] h-2 bg-zinc-800/60 rounded-full block" />
            <div className="w-full h-2 bg-zinc-800/60 rounded-full" />
            <div className="w-[85%] h-2 bg-zinc-800/60 rounded-full" />
          </div>

          {!allDone && (
            <>
              <motion.div
                animate={{ top: ['-10%', '110%', '-10%'] }}
                transition={{ duration: 2.2, ease: 'linear', repeat: Infinity }}
                className="absolute left-0 right-0 h-[2px] bg-purple-400 shadow-[0_0_20px_4px_rgba(168,85,247,0.8)] z-20"
              />
              <motion.div
                animate={{ top: ['-10%', '110%', '-10%'] }}
                transition={{ duration: 2.2, ease: 'linear', repeat: Infinity }}
                className="absolute left-0 right-0 h-40 bg-gradient-to-t from-purple-500/0 via-purple-500/10 to-purple-500/30 -translate-y-full z-10 pointer-events-none"
              />
            </>
          )}
        </div>

        {/* Results summary if available */}
        {results.length > 0 && (
          <div className="mt-6 w-full max-w-sm space-y-2">
            {results.map((r, idx) => (
              <div key={r.workflow_id} className="flex items-center gap-2 bg-zinc-900/50 border border-white/5 rounded-lg px-3 py-2">
                <span className={`text-xs font-bold ${r.status === 'completed' ? 'text-emerald-400' : r.status === 'failed' ? 'text-rose-400' : 'text-amber-400'}`}>
                  {r.status === 'completed' ? 'DONE' : r.status === 'failed' ? 'FAIL' : '...'}
                </span>
                <span className="text-xs text-zinc-400">
                  {r.runtime_data?.candidate?.name || r.runtime_data?.resume_filename || `Resume ${idx + 1}`}
                  {r.runtime_data?.match_score != null && ` — ${r.runtime_data.match_score}%`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
