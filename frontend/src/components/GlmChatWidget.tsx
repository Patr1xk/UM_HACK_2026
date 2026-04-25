import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Loader2, Bot, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { startWorkflow, clarifyWorkflow } from '../api';
import type { WorkflowResponse } from '../types/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  workflow?: WorkflowResponse;
  isClarification?: boolean;
  workflowId?: string;
}

export default function GlmChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const appendMsg = (role: ChatMessage['role'], content: string, extra?: Partial<ChatMessage>) => {
    setMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), role, content, ...extra }]);
  };

  const handleSend = async (overrideInput?: string) => {
    const text = overrideInput || input.trim();
    if (!text || isLoading) return;

    setInput('');
    appendMsg('user', text);
    setIsLoading(true);

    try {
      const result = await startWorkflow(text);
      handleWorkflowResponse(result, text);
    } catch (err: any) {
      appendMsg('agent', `Error: ${err.message || 'Failed to start workflow.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClarify = async (workflowId: string, response: string) => {
    setIsLoading(true);
    appendMsg('user', response);

    try {
      const result = await clarifyWorkflow(workflowId, response);
      handleWorkflowResponse(result, response);
    } catch (err: any) {
      appendMsg('agent', `Error: ${err.message || 'Failed to submit clarification.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkflowResponse = (result: WorkflowResponse, _userMsg: string) => {
    if (result.status === 'awaiting_clarification') {
      const question = result.clarification?.question || 'Please provide the missing information.';
      appendMsg('agent', question, {
        workflow: result,
        isClarification: true,
        workflowId: result.workflow_id,
      });
    } else if (result.status === 'completed') {
      const stepCount = result.completed_steps?.length || 0;
      const failedCount = result.failed_steps?.length || 0;
      let msg = `Workflow completed! ${stepCount} step(s) executed.`;
      if (failedCount > 0) msg += ` ${failedCount} step(s) failed.`;
      if (result.workflow_type === 'onboarding') {
        const emp = result.entities?.employee_name || 'Employee';
        msg = `Onboarding for **${emp}** completed! ${stepCount} step(s) executed.`;
      } else if (result.workflow_type === 'resume_screening') {
        const score = result.runtime_data?.match_score || 0;
        const decision = result.runtime_data?.decision || 'Unknown';
        msg = `Resume screening completed. Match score: ${score}%. Decision: **${decision}**.`;
      }
      appendMsg('agent', msg, { workflow: result });
    } else if (result.status === 'paused') {
      appendMsg('agent', `Workflow paused. GLM recommended a pause during execution.`, { workflow: result });
    } else if (result.status === 'failed') {
      appendMsg('agent', `Workflow failed. ${result.failed_steps?.length || 0} step(s) encountered errors.`, { workflow: result });
    } else if (result.status === 'in_progress') {
      appendMsg('agent', `Workflow started and in progress. ${result.completed_steps?.length || 0}/${result.steps?.length || 0} steps completed.`, { workflow: result });
    } else if (result.status === 'not_implemented') {
      appendMsg('agent', `This workflow type is not yet implemented. Try: "Onboard [name] to [department] starting [date]" or "Screen resumes for [role]".`);
    } else {
      appendMsg('agent', `Workflow status: ${result.status}.`, { workflow: result });
    }
  };

  const quickActions = [
    { label: 'Onboard new employee', prompt: 'Onboard ' },
    { label: 'Screen resumes', prompt: 'Screen resumes for ' },
  ];

  return (
    <>
      {/* Floating bubble */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_25px_rgba(168,85,247,0.5)] flex items-center justify-center z-50 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-[400px] h-[520px] bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-zinc-900/80 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-600/20 flex items-center justify-center border border-purple-500/30">
                  <Bot size={16} className="text-purple-400" />
                </div>
                <span className="text-sm font-semibold text-white">GLM Orchestrator</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                <span className="text-[10px] text-emerald-400 font-medium">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-3">
                  <Bot size={36} className="text-zinc-700" />
                  <p className="text-xs text-center leading-relaxed">
                    Type a natural language command to start a workflow.<br />
                    e.g. "Onboard Sarah to Engineering starting next Monday"
                  </p>
                </div>
              )}

              {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-purple-600/20 text-purple-200 border border-purple-500/20'
                      : msg.role === 'system'
                        ? 'bg-zinc-800/50 text-zinc-400 border border-white/5 text-xs'
                        : 'bg-zinc-900 text-zinc-200 border border-white/10'
                  }`}>
                    {msg.content.split('**').map((part, i) =>
                      i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : <span key={i}>{part}</span>
                    )}

                    {/* Workflow progress */}
                    {msg.workflow && msg.workflow.steps && msg.workflow.steps.length > 0 && msg.workflow.status !== 'awaiting_clarification' && (
                      <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                        {msg.workflow.steps.map((step: string, idx: number) => {
                          const isCompleted = idx < (msg.workflow?.completed_steps?.length || 0);
                          const isFailed = msg.workflow?.failed_steps?.some((f: any) =>
                            typeof f === 'object' && f.step === step
                          );
                          return (
                            <div key={step} className="flex items-center gap-2 text-xs">
                              {isFailed ? (
                                <AlertCircle size={12} className="text-rose-400 shrink-0" />
                              ) : isCompleted ? (
                                <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                              ) : (
                                <Clock size={12} className="text-zinc-500 shrink-0" />
                              )}
                              <span className={isCompleted ? 'text-zinc-300' : 'text-zinc-500'}>
                                {step.replace(/_/g, ' ')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Clarification input */}
                    {msg.isClarification && msg.workflowId && (
                      <ClarificationInput workflowId={msg.workflowId} onSubmit={handleClarify} isLoading={isLoading} />
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-zinc-500 text-xs">
                  <Loader2 size={14} className="animate-spin text-purple-500" />
                  <span className="font-mono tracking-widest uppercase">GLM reasoning...</span>
                </div>
              )}

              <div ref={bottomRef} className="h-1" />
            </div>

            {/* Quick actions */}
            <div className="px-3 py-2 border-t border-white/5 flex gap-2 overflow-x-auto">
              {quickActions.map(action => (
                <button
                  key={action.label}
                  onClick={() => setInput(action.prompt)}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-[11px] font-medium text-zinc-300 hover:bg-purple-900/30 hover:border-purple-500/30 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 bg-zinc-950">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a workflow command..."
                  disabled={isLoading}
                  className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-purple-600 rounded-lg text-white disabled:opacity-30 disabled:bg-zinc-700 hover:bg-purple-500 transition-colors"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ClarificationInput({ workflowId, onSubmit, isLoading }: { workflowId: string; onSubmit: (id: string, response: string) => void; isLoading: boolean }) {
  const [value, setValue] = useState('');

  return (
    <div className="mt-2 pt-2 border-t border-white/10">
      <form onSubmit={(e) => { e.preventDefault(); if (value.trim()) { onSubmit(workflowId, value.trim()); setValue(''); } }} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your answer..."
          disabled={isLoading}
          className="flex-1 bg-zinc-950/50 border border-white/10 rounded px-2 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!value.trim() || isLoading}
          className="px-2 py-1.5 bg-purple-600 rounded text-[10px] font-semibold text-white disabled:opacity-30 disabled:bg-zinc-700 hover:bg-purple-500 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
