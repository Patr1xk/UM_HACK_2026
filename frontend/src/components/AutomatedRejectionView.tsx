import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Archive, Mail, CheckCircle2, ArrowLeft, Send } from 'lucide-react';

export default function AutomatedRejectionView({ candidate, onBack, isPopup, onSuccess }: { candidate: any, onBack: () => void, isPopup?: boolean, onSuccess?: () => void }) {
  const [archived, setArchived] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto w-full flex flex-col gap-6"
    >
      {!isPopup && (
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Back to Board</span>
          </button>
        </div>
      )}

      <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-zinc-950 p-6 border-b border-white/5 flex items-center justify-between">
           <div>
             <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
               <Archive size={20} className="text-red-400" /> 
               Automated Protocol: Confirm & Archive
             </h2>
             <p className="text-sm text-zinc-400 mt-1">Google Workspace Integration: Gmail Automated Communications</p>
           </div>
        </div>

        {/* Content */}
        {!archived ? (
          <div className="p-8 flex flex-col gap-8">
            
            <div className="flex flex-col gap-2 p-5 bg-red-500/5 rounded-lg border border-red-500/10">
               <div className="flex items-center justify-between">
                 <h3 className="text-zinc-200 font-medium tracking-tight">Candidate Profile: {candidate?.name || 'Applicant'}</h3>
                 <span className="text-xs font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded">REJECTED</span>
               </div>
               <p className="text-sm text-zinc-500">Reason: {candidate?.reason || 'System flagged discrepancy'}</p>
            </div>

            <div className="flex flex-col gap-3">
               <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                 <span>Rejection Template (Gmail Draft)</span>
                 <span className="text-emerald-400 font-mono lowercase">status: ready_to_send</span>
               </label>
               
               <div className="bg-zinc-950 border border-white/5 rounded-lg overflow-hidden flex flex-col font-sans text-sm shadow-inner">
                  <div className="p-3 border-b border-white/5 bg-zinc-900/50 flex flex-col gap-2">
                     <div className="flex items-center text-zinc-400">
                       <span className="w-16">To:</span> <span className="text-zinc-200">{candidate?.name?.split(' ')[0]?.toLowerCase() || 'applicant'}@example.com</span>
                     </div>
                     <div className="flex items-center text-zinc-400">
                       <span className="w-16">From:</span> <span className="text-zinc-200">careers@glm-hr.app</span>
                     </div>
                     <div className="flex items-center text-zinc-400">
                       <span className="w-16">Subject:</span> <span className="text-zinc-200">Update on your application for {candidate?.role || 'the role'}</span>
                     </div>
                  </div>
                  <div className="p-5 text-zinc-300 leading-relaxed min-h-[150px]">
                    Dear {candidate?.name?.split(' ')[0] || 'Candidate'},<br/><br/>
                    Thank you for applying to the {candidate?.role || 'open'} role and giving us the opportunity to review your background.<br/><br/>
                    While we appreciate your interest and the time you took to apply, we have decided to move forward with other candidates whose skill sets more closely align with our current structural needs.<br/><br/>
                    We wish you the best of luck in your job search.<br/><br/>
                    Best regards,<br/>GLM Talent Team
                  </div>
               </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
               <button onClick={onBack} className="px-5 py-2.5 rounded-lg font-medium text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                 Cancel
               </button>
               <button 
                 onClick={() => setArchived(true)}
                 className="px-5 py-2.5 rounded-lg font-medium text-sm bg-red-600 hover:bg-red-500 text-white transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)] flex items-center gap-2"
               >
                 <Send size={16} />
                 Send Email & Archive Data
               </button>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-16 flex flex-col items-center justify-center text-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(220,38,38,0.15)] border border-red-500/20">
               <Archive size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white">Candidate Archived</h3>
            <p className="text-zinc-400 max-w-md">
              The rejection email has been dispatched via Gmail API and the candidate's data has been permanently removed from the active screening pipeline.
            </p>
            <button 
              onClick={() => {
                if (onSuccess) onSuccess();
                onBack();
              }}
              className="mt-6 px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium transition-colors border border-white/5"
            >
              {isPopup ? "Return to Process" : "Return to Board"}
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
