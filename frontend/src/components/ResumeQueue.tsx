import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Loader2, CheckCircle2, Circle, Play, ChevronDown, ChevronUp, FileIcon } from 'lucide-react';
import { FileItem } from '../types/orchestration';

export default function ResumeQueue({
  files,
  isAnalyzing,
  isCollapsed,
  onToggleCollapse,
  onStart
}: {
  files: FileItem[];
  isAnalyzing: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onStart: () => void;
}) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Loader2 size={16} className="text-purple-400 animate-spin" />;
      case 'completed': return <CheckCircle2 size={16} className="text-emerald-500" />;
      default: return <Circle size={16} className="text-zinc-700" />;
    }
  };

  const allCompleted = files.length > 0 && files.every(f => f.status === 'completed');

  return (
    <div className="bg-zinc-900/40 border border-white/10 rounded-2xl flex flex-col backdrop-blur-md relative overflow-hidden flex-shrink-0 transition-all duration-300">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600/50 to-indigo-600/50" />
      
      <div className="flex items-center justify-between p-6">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <FileText size={18} className="text-purple-400"/>
          Candidate Resume Queue
        </h3>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-2">
             {isAnalyzing && <Loader2 size={16} className="text-purple-400 animate-spin" />}
             <span className="text-sm font-medium text-zinc-400">
               {isAnalyzing ? "Processing..." : allCompleted ? "Analysis Complete" : "Waiting"}
             </span>
          </div>
          <button 
            onClick={onToggleCollapse}
            className="p-2 border border-white/10 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title={isCollapsed ? "Expand Queue" : "Collapse Queue"}
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 px-6 pb-6 pt-0">
              <AnimatePresence>
                {files.map((file) => (
                  <motion.div 
                    key={file.id} 
                    layout
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      file.status === 'active' 
                        ? 'bg-purple-500/10 border-purple-500/30 ring-1 ring-purple-500/20' 
                        : file.status === 'completed'
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-zinc-950/50 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded flex items-center justify-center bg-zinc-900 ${file.status === 'active' ? 'text-purple-400' : 'text-zinc-500'}`}>
                        <FileIcon size={14} />
                      </div>
                      <span className={`text-sm font-medium ${file.status === 'completed' ? 'text-zinc-400' : 'text-zinc-200'}`}>
                        {file.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-2">
                      <span className={`text-xs uppercase tracking-widest font-mono ${file.status === 'active' ? 'text-purple-400' : 'text-zinc-500'}`}>
                        {file.status}
                      </span>
                      {getStatusIcon(file.status)}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
