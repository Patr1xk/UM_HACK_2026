import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { FileItem, KanbanCard } from '../types/orchestration';
import ResumeQueue from './ResumeQueue';
import KanbanBoard from './KanbanBoard';
import ChatInterface from './ChatInterface';
import InterviewSchedulingView from './InterviewSchedulingView';

import ResumeDetailView from './ResumeDetailView';
import AutomatedRejectionView from './AutomatedRejectionView';

export default function ResumeAnalyzeView({ onTransitionComplete }: { onTransitionComplete?: () => void }) {
  const [files, setFiles] = useState<FileItem[]>([
    { id: 'f1', name: 'Resume_Alex.pdf', status: 'pending' },
    { id: 'f2', name: 'Resume_Unknown.pdf', status: 'pending' },
    { id: 'f3', name: 'Resume_John.pdf', status: 'pending' }
  ]);
  const [kanbanCards, setKanbanCards] = useState<KanbanCard[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isQueueCollapsed, setIsQueueCollapsed] = useState(false);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const hasStartedRef = React.useRef(false);

  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      handleStartAnalysis();
    }
  }, []);
  
  const [popupState, setPopupState] = useState<{
    show: boolean;
    type: 'screening' | 'intervention' | 'rejected' | null;
    candidate: any;
    stage: 'f1' | 'f2' | null;
  }>({ show: false, type: null, candidate: null, stage: null });

  const activeFile = files.find(f => f.id === activeFileId);

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setIsQueueCollapsed(false);
    setFiles(files.map(f => ({ ...f, status: 'pending' })));
    setKanbanCards([]);
    
    // Set First File Active
    setFiles(prev => prev.map(f => f.id === 'f1' ? { ...f, status: 'active' } : f));
    setActiveFileId('f1');
  };

  const handleDropKanban = (card: KanbanCard) => {
    setKanbanCards(prev => [...prev, card]);
  };

  const doProceedNext = () => {
    if (activeFileId === 'f1') {
      setFiles(prev => prev.map(f => f.id === 'f1' ? { ...f, status: 'completed' } : f));
      setFiles(prev => prev.map(f => f.id === 'f2' ? { ...f, status: 'active' } : f));
      setActiveFileId('f2');
    } else if (activeFileId === 'f2') {
      setFiles(prev => prev.map(f => f.id === 'f2' ? { ...f, status: 'completed' } : f));
      setFiles(prev => prev.map(f => f.id === 'f3' ? { ...f, status: 'active' } : f));
      setActiveFileId('f3');
    }
  };

  const doCompleteFlow = () => {
    setFiles(prev => prev.map(f => f.id === 'f3' ? { ...f, status: 'completed' } : f));
    
    setIsAnalyzing(false);
    setActiveFileId(null);
    
    // Trigger transition overlay
    setIsTransitioning(true);

    if (onTransitionComplete) {
      setTimeout(() => {
        onTransitionComplete();
      }, 2000);
    }
  };

  const handleProceedNext = () => {
    if (activeFileId === 'f1') {
      const kcard = kanbanCards.find(c => c.id === 'k1'); 
      if (kcard) {
        setPopupState({
          show: true,
          type: kcard.column as any,
          candidate: { name: kcard.candidateName, role: "Software Engineer", matchScore: kcard.score },
          stage: 'f1'
        });
        return;
      }
    } else if (activeFileId === 'f2') {
      const kcard = kanbanCards.find(c => c.id === 'k2'); 
      if (kcard) {
        setPopupState({
          show: true,
          type: kcard.column as any,
          candidate: { name: kcard.candidateName, role: "Software Engineer", matchScore: kcard.score },
          stage: 'f2'
        });
        return;
      }
    }
    doProceedNext();
  };

  const handleClosePopup = () => {
    const stage = popupState.stage;
    setPopupState({ show: false, type: null, candidate: null, stage: null as any });
    if (stage === 'f1' || stage === 'f2') {
      doProceedNext();
    } else if (stage === 'f3') {
      doCompleteFlow();
    }
  };

  const handleInterventionAction = (action: 'accept' | 'reject') => {
    setKanbanCards(prev => prev.map(c => 
      c.candidateName === popupState.candidate?.name
        ? { ...c, column: action === 'accept' ? 'screening' : 'rejected' }
        : c
    ));
    handleClosePopup();
  };

  const handleCompleteFlow = () => {
    if (activeFileId === 'f3') {
      const kcard = kanbanCards.find(c => c.id === 'k3'); 
      if (kcard) {
        setPopupState({
          show: true,
          type: kcard.column as any,
          candidate: { name: kcard.candidateName, role: "Software Engineer", matchScore: kcard.score },
          stage: 'f3'
        });
        return;
      }
    }
    doCompleteFlow();
  };

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full min-h-0 bg-[#0a0a0a]">
        
        {/* LEFT COLUMN (60%) */}
        <div className="xl:col-span-7 flex flex-col gap-6 h-full min-h-0">
          <ResumeQueue 
            files={files} 
            isAnalyzing={isAnalyzing} 
            isCollapsed={isQueueCollapsed} 
            onToggleCollapse={() => setIsQueueCollapsed(!isQueueCollapsed)} 
            onStart={handleStartAnalysis} 
          />
          
          <KanbanBoard 
            cards={kanbanCards} 
            onAction={(card) => {
              setPopupState({
                show: true,
                type: card.column as any,
                candidate: { name: card.candidateName, role: "Software Engineer", matchScore: card.score },
                stage: activeFileId || ''
              });
            }}
          />
        </div>

        {/* RIGHT COLUMN (40%) - INTERACTIVE AGENT COPILOT */}
        <div className="xl:col-span-5 h-full min-h-0">
          <ChatInterface 
            activeFile={activeFile} 
            onDropKanban={handleDropKanban} 
            onProceedNext={handleProceedNext} 
            onCompleteFlow={handleCompleteFlow} 
          />
        </div>

      </div>

      {/* Screen Transition Overlay */}
      <AnimatePresence>
        {popupState.show && popupState.candidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/90 flex flex-col items-center justify-center p-6 backdrop-blur-sm overflow-y-auto"
          >
            <div className="w-full max-w-5xl relative my-auto">
              <div className="w-full h-[90vh] flex flex-col overflow-hidden rounded-xl bg-[#0a0a0a] shadow-2xl border border-white/10">
                {popupState.type === 'screening' && (
                  <div className="overflow-y-auto w-full h-full p-4">
                    <InterviewSchedulingView candidate={popupState.candidate} onBack={handleClosePopup} isPopup={true} />
                  </div>
                )}
                {popupState.type === 'intervention' && (
                  <ResumeDetailView 
                    candidate={popupState.candidate} 
                    onBack={handleClosePopup} 
                    onAccept={() => handleInterventionAction('accept')}
                    onReject={() => handleInterventionAction('reject')}
                    isPopup={true} 
                  />
                )}
                {popupState.type === 'rejected' && (
                  <div className="overflow-y-auto w-full h-full p-4">
                    <AutomatedRejectionView candidate={popupState.candidate} onBack={handleClosePopup} isPopup={true} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center backdrop-blur-md"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px]" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center z-10"
            >
              <div className="w-16 h-16 relative flex items-center justify-center mb-8">
                <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin" />
                <Loader2 className="text-purple-400 absolute animate-pulse" size={24} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Compiling Analytical Dashboard</h2>
              <div className="flex items-center gap-2 text-zinc-400 font-mono text-sm">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Aggregating pipeline data...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
