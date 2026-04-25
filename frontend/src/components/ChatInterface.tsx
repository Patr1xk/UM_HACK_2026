import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Send, Loader2, Bot } from 'lucide-react';
import { ChatMessage, FileItem, KanbanCard, TraceStep } from '../types/orchestration';
import MessageBubble from './MessageBubble';

interface ChatInterfaceProps {
  activeFile: FileItem | null | undefined;
  onDropKanban: (card: KanbanCard) => void;
  onProceedNext: () => void;
  onCompleteFlow: () => void;
}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export default function ChatInterface({ activeFile, onDropKanban, onProceedNext, onCompleteFlow }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (!activeFile) return;

    // Clear the chat to start a fresh session for the new resume
    setMessages([{ 
      id: Date.now().toString(), 
      role: 'system', 
      type: 'text', 
      content: `--- NEW SESSION: ${activeFile.name} ---` 
    }]);

    runAnalysisSimulation(activeFile);
  }, [activeFile?.id]);

  // Helper to dynamically stream trace updates into the state tree
  const updateTraceState = (msgId: string, stepsUpdate: TraceStep[], isComplete: boolean = false) => {
    setMessages(prev => prev.map(m => 
      m.id === msgId ? { ...m, content: stepsUpdate, isComplete } : m
    ));
  };

  const runAnalysisSimulation = async (file: FileItem) => {
    setIsTyping(true);
    await sleep(800);
    
    // Agent implicitly acknowledges user intent
    appendMsg('user', 'text', `Analyze candidate document: ${file.name}`);
    await sleep(500);

    const traceMsgId = Math.random().toString(36).substring(7);
    
    // Initial Trace State
    const traceSteps: TraceStep[] = [
      { id: 't1', status: 'loading', title: 'Parsing document structure', pills: [file.name, 'PDF'] },
      { id: 't2', status: 'pending', title: 'Extracting semantic entities' },
      { id: 't3', status: 'pending', title: 'Evaluating against Job Requisition', pills: ['REQ-8891'] },
    ];

    // Push the trace container
    appendMsg('agent', 'trace', traceSteps, undefined, traceMsgId);
    
    // Step 1: Parse
    await sleep(1500);
    traceSteps[0].status = 'completed';
    traceSteps[1].status = 'loading';
    traceSteps[1].subSteps = [
      { id: 's1', status: 'loading', text: 'Scanning for known entity formats...' }
    ];
    updateTraceState(traceMsgId, [...traceSteps]);

    // Step 2: Extraction (Varies based on file)
    await sleep(1200);
    traceSteps[1].subSteps![0].status = 'completed';
    traceSteps[1].subSteps![0].text = `Identified candidate name: **${file.name.includes("Alex") ? "Alex R." : "Unknown"}**`;
    
    traceSteps[1].subSteps!.push({ id: 's2', status: 'loading', text: 'Extracting technical proficiency map' });
    updateTraceState(traceMsgId, [...traceSteps]);

    await sleep(1500);
    traceSteps[1].subSteps![1].status = 'completed';
    if (file.name.includes("Alex")) {
      traceSteps[1].subSteps![1].text = 'Extracted primary frameworks from work history';
      traceSteps[1].subSteps![1].pills = ['React', 'TypeScript', 'Node.js'];
    } else {
       traceSteps[1].subSteps![1].text = 'Failed to extract coherent technical map - unstructured blocks detected';
       traceSteps[1].subSteps![1].status = 'error';
    }
    traceSteps[1].status = 'completed';
    traceSteps[2].status = 'loading';
    updateTraceState(traceMsgId, [...traceSteps]);

    // Step 3: Evaluation
    await sleep(800);
    traceSteps[2].subSteps = [
      { id: 's3', status: 'loading', text: 'Correlating entities with Requisition DB requirements' }
    ];
    updateTraceState(traceMsgId, [...traceSteps]);

    await sleep(2000);
    traceSteps[2].subSteps![0].status = 'completed';
    traceSteps[2].status = 'completed';
    updateTraceState(traceMsgId, [...traceSteps], true); // Mark entire trace complete

    // Output final decision directly following the trace
    if (file.name.includes("Alex")) {
      await sleep(800);
      const payload = { 
        entities: { 
          employee_name: "Alex R.", 
          job_role: "Software Engineer", 
          match_score: 88,
          required_skills: ["React", "TypeScript", "Node.js"]
        }
      };
      appendMsg('agent', 'json', payload);
      await sleep(1000);
      appendMsg('agent', 'text', "✅ **Decision: 88% Match.** I have automatically routed Alex to the Screening Workflow.");
      onDropKanban({ id: 'k1', candidateName: "Alex R.", score: 88, column: "screening" });
      await sleep(1200);
      appendMsg('agent', 'action', "Do you have any questions about this evaluation, or shall I proceed to the next candidate?", "Perform Action");
    } else if (file.name.includes("Unknown")) {
      await sleep(800);
      const payload2 = { 
        entities: { 
          employee_name: "Unknown Candidate", 
          job_role: "Software Engineer", 
          match_score: 42,
          missing_skills: ["React", "TypeScript", "Node.js"]
        }
      };
      appendMsg('agent', 'json', payload2);
      await sleep(1000);
      appendMsg('agent', 'text', "⚠️ **Decision: 42% Match.** Low entity confidence and missing critical skills. Routing to HR Intervention.");
      onDropKanban({ id: 'k2', candidateName: "Unknown Candidate", score: 42, column: "intervention" });
      await sleep(1200);
      appendMsg('agent', 'action', "Do you have any questions about this evaluation, or shall I proceed to the next candidate?", "Perform Action");
    } else {
      await sleep(800);
      const payload3 = { 
        entities: { 
          employee_name: "John Doe", 
          job_role: "Software Engineer", 
          match_score: 12,
          missing_skills: ["React", "TypeScript", "Node.js", "JavaScript"]
        }
      };
      appendMsg('agent', 'json', payload3);
      await sleep(1000);
      appendMsg('agent', 'text', "❌ **Decision: 12% Match.** Poor match across all requirements. Automatically routing to Rejected Workflow.");
      onDropKanban({ id: 'k3', candidateName: "John Doe", score: 12, column: "rejected" });
      await sleep(1200);
      appendMsg('agent', 'action', "Do you have any questions about this evaluation, or shall we verify the results?", "Perform Action");
    }

    setIsTyping(false);
  };

  const appendMsg = (role: 'agent'|'user'|'system', type: 'text'|'json'|'action'|'trace', content: any, actionLabel?: string, overrideId?: string) => {
    setMessages(prev => [...prev, {
      id: overrideId || Math.random().toString(36).substring(7),
      role, type, content, actionLabel
    }]);
  };

  const clearSession = () => {
    setMessages([]);
  };

  const handleAction = (label: string) => {
    if (label === 'Proceed to Next Resume' || label === 'Perform Action') {
      if (activeFile?.id === 'f3') {
        onCompleteFlow();
      } else {
        onProceedNext();
      }
    } else if (label === 'View Analytics Dashboard' || label === 'End Flow') {
      onCompleteFlow();
    }
  };

  const handleCustomQuestion = async (e?: React.FormEvent, questionOverride?: string) => {
    if (e) e.preventDefault();
    const q = questionOverride || inputValue;
    if (!q.trim()) return;

    appendMsg('user', 'text', q);
    setInputValue('');
    setIsTyping(true);
    await sleep(1200);

    const qLower = q.toLowerCase();
    if (qLower.includes("why this score") || qLower.includes("why 88")) {
       appendMsg('agent', 'text', "Alex has strong **React** and **Node.js** skills matching the core requirements, but is missing a requested **AWS certification** which reduced the confidence from 100%.");
    } else if (qLower.includes("skills")) {
       appendMsg('agent', 'text', "Missing **AWS certification**. Present and verified: **React**, **TypeScript**, **Node.js**.");
    } else {
       appendMsg('agent', 'text', "As a demo, my reasoning engine is currently focused on the predefined evaluation parameters. I am fully integrated into the workflow framework.");
    }
    
    await sleep(800);
    const isLastFile = activeFile?.id === 'f3';
    const actionLabel = "Perform Action";
    appendMsg('agent', 'action', "Would you like me to clarify anything else, or shall we move on?", actionLabel);
    
    setIsTyping(false);
  };

  return (
    <div className="bg-zinc-950 border border-white/10 rounded-2xl flex flex-col h-full shadow-2xl relative ring-1 ring-white/5 overflow-hidden">
      
      {/* Header */}
      <div className="bg-zinc-900/80 border-b border-white/10 px-6 py-4 flex justify-between items-center z-10 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-600/20 flex flex-col items-center justify-center border border-purple-500/30">
            <Bot size={18} className="text-purple-400" />
          </div>
          <h3 className="text-white font-semibold">GLM Agent</h3>
        </div>
        <button 
          onClick={clearSession}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-medium border border-white/5 transition-colors"
        >
          <RefreshCw size={12} /> Clear Session
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        {messages.length === 0 && !isTyping && (
           <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-4 opacity-70">
             <Bot size={48} className="text-zinc-700" />
             <p className="text-sm font-medium">Awaiting Orchestrator Input...</p>
           </div>
        )}

        <div className="flex flex-col">
          <AnimatePresence>
            {messages.map(msg => (
               // @ts-ignore - TS complains about key prop here
               <MessageBubble key={msg.id} message={msg} onActionClick={handleAction} />
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 text-zinc-500 mt-2"
            >
              <Loader2 size={16} className="animate-spin text-purple-500" />
              <span className="text-xs font-mono tracking-widest uppercase">Agent reasoning...</span>
            </motion.div>
          )}
          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* Interactive Footer */}
      <div className="p-4 border-t border-white/10 bg-zinc-950 flex flex-col gap-3 flex-shrink-0 z-10">
        
        {/* Suggested Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button 
            onClick={() => handleCustomQuestion(undefined, "Why this score?")}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-xs font-medium text-zinc-300 hover:bg-purple-900/30 hover:border-purple-500/30 transition-colors"
          >
            Why this score?
          </button>
          <button 
            onClick={() => handleCustomQuestion(undefined, "List missing skills")}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-xs font-medium text-zinc-300 hover:bg-purple-900/30 hover:border-purple-500/30 transition-colors"
          >
            List missing skills
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleCustomQuestion} className="flex relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={!activeFile || isTyping}
            placeholder="Ask the Agent a question about this candidate..."
            className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 disabled:opacity-50 transition-all font-sans"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 rounded-lg text-white disabled:opacity-30 disabled:bg-zinc-700 transition-colors"
          >
            <Send size={14} />
          </button>
        </form>
      </div>

    </div>
  );
}
