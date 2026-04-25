import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, User, ChevronRight, Loader2, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { ChatMessage, TraceStep, TraceSubStep } from '../types/orchestration';

const colorizeJson = (obj: any) => {
  const jsonStr = JSON.stringify(obj, null, 2);
  const html = jsonStr
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'text-amber-400'; // number
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'text-indigo-400'; // key
            } else {
                cls = 'text-emerald-400'; // string
            }
        } else if (/true|false/.test(match)) {
            cls = 'text-blue-400'; // boolean
        } else if (/null/.test(match)) {
            cls = 'text-red-400'; // null
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
  return html;
};

// Extremely basic markdown parser for strong logic `**bold**`
const renderText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
};

const TraceRenderer = ({ steps, isComplete }: { steps: TraceStep[], isComplete?: boolean }) => {
  return (
    <div className="mt-2 w-full max-w-xl bg-zinc-950/80 border border-white/10 rounded-xl p-5 shadow-2xl relative font-sans">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5">
        {!isComplete ? (
          <Loader2 size={16} className="text-purple-400 animate-spin" />
        ) : (
          <CheckCircle2 size={16} className="text-emerald-500" />
        )}
        <span className="text-sm font-semibold text-zinc-100">
          {!isComplete ? 'Analyzing candidate profile...' : 'Analysis complete'}
        </span>
        <span className="ml-auto text-[10px] font-mono text-zinc-500 tracking-widest uppercase flex items-center gap-2">
          {!isComplete && <span className="animate-pulse">Processing</span>}
          GLM Engine
        </span>
      </div>

      <div className="flex flex-col relative pl-2">
        {/* Continuous vertical line for the main steps */}
        <div className="absolute top-2 bottom-6 left-[14px] w-px bg-zinc-800" />

        {steps.map((step, idx) => (
          <div key={step.id} className="relative mb-5 last:mb-0">
            {/* Step Header */}
            <div className="flex items-start gap-4">
              <div className="bg-zinc-950 z-10 shrink-0 mt-0.5">
                {step.status === 'completed' ? (
                  <div className="w-4 h-4 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                ) : step.status === 'loading' ? (
                  <div className="w-4 h-4 rounded-full bg-zinc-900 border-2 border-purple-500/50 flex items-center justify-center">
                    <Loader2 size={10} className="text-purple-400 animate-spin" />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-zinc-900 border-2 border-zinc-800" />
                )}
              </div>
              <div className="flex flex-col gap-1.5 flex-1 mt-0.5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className={`text-sm tracking-tight ${step.status === 'completed' ? 'text-zinc-300' : step.status === 'loading' ? 'text-zinc-100 font-medium' : 'text-zinc-500'}`}>
                    {step.title}
                  </span>
                  {step.pills && step.pills.map((pill, pIdx) => (
                    <span key={pIdx} className="bg-zinc-900 border border-white/5 text-[11px] font-mono text-zinc-400 px-2 py-0.5 rounded-md shadow-sm">
                      {pill}
                    </span>
                  ))}
                </div>

                {/* Sub-steps Box */}
                {step.subSteps && step.subSteps.length > 0 && (
                  <div className="mt-2 mb-1 bg-zinc-900/50 border border-white/5 rounded-lg p-3 flex flex-col gap-2.5 shadow-inner">
                    {step.subSteps.map((sub) => (
                      <div key={sub.id} className="flex items-start gap-3">
                        <div className="shrink-0 mt-[3px]">
                          {sub.status === 'completed' ? (
                            <CheckCircle2 size={14} className="text-emerald-500/80" />
                          ) : sub.status === 'error' ? (
                            <AlertCircle size={14} className="text-red-400/80" />
                          ) : sub.status === 'loading' ? (
                            <Loader2 size={14} className="text-zinc-500 animate-spin" />
                          ) : (
                            <Circle size={14} className="text-zinc-700" />
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className={`text-xs leading-relaxed ${sub.status === 'completed' ? 'text-zinc-300' : 'text-zinc-400'}`}>
                             {renderText(sub.text)}
                           </span>
                           {sub.pills && sub.pills.length > 0 && (
                             <div className="flex flex-wrap gap-2 mt-0.5">
                               {sub.pills.map((pill, spIdx) => (
                                 <span key={spIdx} className="bg-zinc-950 border border-white/5 text-[10px] font-mono text-zinc-500 px-1.5 py-0.5 rounded shadow-sm">
                                   {pill}
                                 </span>
                               ))}
                             </div>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function MessageBubble({ message, onActionClick }: { message: ChatMessage, onActionClick?: (label: string) => void }) {
  if (message.role === 'system') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex justify-center py-4 my-2"
      >
        <span className="px-4 py-1 rounded-full bg-zinc-900 border border-white/5 text-xs font-mono text-zinc-500 tracking-widest uppercase">
          {message.content}
        </span>
      </motion.div>
    );
  }

  const isAgent = message.role === 'agent';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex items-start gap-4 mb-6 ${isAgent ? '' : 'flex-row-reverse'}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
        isAgent 
          ? 'bg-purple-900/50 border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
          : 'bg-zinc-800 border-zinc-700 text-zinc-400'
      }`}>
        {isAgent ? <Sparkles size={14} /> : <User size={14} />}
      </div>

      <div className={`flex flex-col gap-2 w-full ${isAgent ? 'items-start' : 'items-end'}`}>
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold text-zinc-300">
            {isAgent ? 'GLM Agent' : 'HR Admin'}
          </span>
        </div>

        {message.type === 'text' && (
          <div className={`text-sm leading-relaxed max-w-[85%] ${isAgent ? 'text-zinc-300' : 'text-zinc-200 bg-zinc-800/80 px-4 py-2.5 rounded-2xl rounded-tr-sm border border-zinc-700'}`}>
            {renderText(message.content)}
          </div>
        )}

        {message.type === 'trace' && isAgent && (
          <TraceRenderer steps={message.content as TraceStep[]} isComplete={message.isComplete} />
        )}

        {message.type === 'json' && isAgent && (
          <div className="mt-1 w-full max-w-[85%] bg-[#050505] border border-white/10 rounded-xl p-4 overflow-x-auto shadow-inner relative group">
            <div className="absolute top-2 right-3 text-[9px] font-mono text-zinc-600 tracking-widest uppercase">JSON PAYLOAD</div>
            <pre 
              className="text-[12px] font-mono leading-loose tracking-wide pt-4"
              dangerouslySetInnerHTML={{ __html: colorizeJson(message.content) }} 
            />
          </div>
        )}

        {message.type === 'action' && isAgent && (
           <div className="flex flex-col gap-3 mt-1 bg-zinc-900/50 border border-purple-500/20 p-4 rounded-xl backdrop-blur-sm max-w-[85%]">
              <div className="text-sm text-zinc-300 leading-relaxed">
                {renderText(message.content)}
              </div>
              <button 
                onClick={() => onActionClick && onActionClick(message.actionLabel || 'Proceed')}
                className="self-start flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)] ring-1 ring-white/10 mt-1"
              >
                {message.actionLabel}
                <ChevronRight size={16} />
              </button>
           </div>
        )}
      </div>
    </motion.div>
  );
}
