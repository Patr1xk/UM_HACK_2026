import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Check, Calendar, User, CheckCircle2, XOctagon, Clock } from 'lucide-react';
import { KanbanCard } from '../types/orchestration';

interface KanbanBoardProps {
  cards: KanbanCard[];
  onAction?: (card: KanbanCard) => void;
}

function KanbanItem({ card, onAction }: { card: KanbanCard & { time?: string }, onAction?: (card: KanbanCard) => void, key?: React.Key }) {
  const isScreening = card.column === 'screening';
  const isIntervention = card.column === 'intervention';
  const isRejected = card.column === 'rejected';

  let accent = 'emerald';
  let primaryActionLabel = "Schedule Interview";
  let secondaryIcons = ['calendar', 'user'];
  let reason = '';
  if (isScreening) {
    accent = 'emerald';
    primaryActionLabel = 'Schedule Interview';
    secondaryIcons = ['calendar', 'user'];
  } else if (isIntervention) {
    accent = 'amber';
    primaryActionLabel = 'Review & Resolve';
    secondaryIcons = ['check', 'x'];
    reason = "Low entity confidence";
  } else if (isRejected) {
    accent = 'red';
    primaryActionLabel = 'Draft Email';
    secondaryIcons = [];
    reason = "Poor match across requirements";
  }

  const accentColors: any = {
    emerald: 'border-emerald-500/20 bg-emerald-500/5',
    amber: 'border-amber-500/20 bg-amber-500/5',
    red: 'border-red-500/20 bg-red-500/5'
  };

  const textColors: any = {
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400'
  };

  const buttonColors: any = {
    emerald: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
    amber: 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20',
    red: 'bg-zinc-800 text-red-200 hover:bg-zinc-700 hover:text-red-100'
  }

  const renderSecondaryIcon = (iconName: string, idx: number) => {
    switch(iconName) {
      case 'calendar': return <Calendar key={idx} size={13} className="text-zinc-500 hover:text-emerald-400 transition-colors cursor-pointer" />;
      case 'user': return <User key={idx} size={13} className="text-zinc-500 hover:text-emerald-400 transition-colors cursor-pointer" />;
      case 'check': return <CheckCircle2 key={idx} size={13} className="text-zinc-500 hover:text-amber-400 transition-colors cursor-pointer" onClick={() => onAction?.({...card, column: 'screening'})} />;
      case 'x': return <XOctagon key={idx} size={13} className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer" onClick={() => onAction?.({...card, column: 'rejected'})} />;
      default: return null;
    }
  }

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`kanban-card flex-shrink-0 p-3 rounded-lg border flex flex-col gap-1.5 relative overflow-hidden group hover:border-opacity-40 transition-all duration-300 ${accentColors[accent]}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-100">{card.candidateName}</span>
        {card.score && (
          <span className={`text-xs font-mono font-bold ${textColors[accent]} bg-black/40 px-1.5 py-0.5 rounded border border-white/5`}>
            {card.score}%
          </span>
        )}
      </div>
      <span className="text-[11px] text-zinc-400">Software Engineer</span>
      
      {(reason || card.time) && (
        <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/5 mb-2">
           {reason && <span className={`text-[10px] font-medium ${textColors[accent]} truncate max-w-[120px]`}>{reason}</span>}
           {card.time && <span className="text-[10px] text-zinc-500 flex items-center gap-1 ml-auto"><Clock size={10}/> {card.time}</span>}
        </div>
      )}
      
      {/* ACTION ROW */}
      <div className="mt-auto pt-1 flex items-center justify-between gap-2">
         {primaryActionLabel && (
           <button 
             onClick={() => onAction?.(card)} 
             className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors flex-1 text-center ${buttonColors[accent]}`}
           >
             {primaryActionLabel}
           </button>
         )}
         {secondaryIcons && secondaryIcons.length > 0 && (
           <div className="flex items-center gap-2 px-1">
             {secondaryIcons.map((icon: string, idx: number) => renderSecondaryIcon(icon, idx))}
           </div>
         )}
      </div>
    </motion.div>
  );
}

export default function KanbanBoard({ cards, onAction }: KanbanBoardProps) {
  const columns = [
    { id: 'screening', title: 'Screening', accent: 'bg-emerald-500' },
    { id: 'intervention', title: 'HR Intervention', accent: 'bg-amber-500' },
    { id: 'rejected', title: 'Rejected', accent: 'bg-red-500' }
  ];

  return (
    <div className="bg-zinc-900/40 border border-white/10 rounded-2xl flex flex-col flex-1 backdrop-blur-md overflow-hidden min-h-0">
      <div className="p-5 border-b border-white/5 bg-zinc-950/30 flex items-center gap-2 flex-shrink-0">
        <Activity size={18} className="text-indigo-400"/>
        <h3 className="text-white font-semibold flex items-center gap-2">
          Workflow Routing Board
        </h3>
      </div>
      
      <div className="flex-1 p-5 overflow-x-auto min-h-0 relative">
        <div className="flex gap-4 h-full w-full min-w-max">
          {columns.map(col => (
            <div key={col.id} className="flex-1 min-w-[200px] flex flex-col h-full bg-zinc-950/50 rounded-xl border border-white/5 overflow-hidden">
              <div className="p-3 flex items-center gap-2 border-b border-white/5 flex-shrink-0">
                <div className={`w-2 h-2 rounded-full ${col.accent} shadow-[0_0_8px_currentColor]`} />
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">{col.title}</span>
                <span className="text-xs text-zinc-500 font-mono ml-auto">{cards.filter(c => c.column === col.id).length} items</span>
              </div>
              <div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto min-h-0 scrollbar-hide">
                <AnimatePresence>
                  {cards
                    .filter(card => card.column === col.id)
                    .map(card => (
                      <KanbanItem key={card.id} card={card} onAction={onAction} />
                  ))}
                </AnimatePresence>
                {cards.filter(c => c.column === col.id).length === 0 && (
                  <div className="m-auto border border-dashed border-white/10 rounded-lg py-6 px-4 text-center text-xs text-zinc-600 font-medium">
                    Awaiting orchestration
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
