import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { createPortal } from 'react-dom';
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Download,
  CheckCircle2,
  XOctagon,
  Clock
} from 'lucide-react';
import InterviewSchedulingView from './InterviewSchedulingView';
import AutomatedRejectionView from './AutomatedRejectionView';
import { listWorkflows, getScreeningResults } from '../api';
import type { WorkflowResponse } from '../types/api';

const FADE_UP_ANIMATION = {
  hidden: { opacity: 0, y: 8 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
  }
};

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    }
  }
};

// Mock Database
const INITIAL_CANDIDATES = [
  { id: '1093', name: 'Tsang Da Xin', role: 'AI Engineer', score: 88, status: 'Interview', date: 'Oct 24, 2026', source: 'Direct Upload' },
  { id: '1092', name: 'Alice Chen', role: 'Frontend Engineer', score: 92, status: 'Interview', date: 'Oct 24, 2026', source: 'LinkedIn' },
  { id: '1091', name: 'Marcus Johnson', role: 'Product Manager', score: 88, status: 'Interview', date: 'Oct 24, 2026', source: 'Direct' },
  { id: '1090', name: 'Priya Patel', role: 'Data Scientist', score: 76, status: 'Review', date: 'Oct 24, 2026', source: 'Referral' },
  { id: '1089', name: 'David Smith', role: 'Backend Engineer', score: 65, status: 'Review', date: 'Oct 23, 2026', source: 'Indeed' },
  { id: '1088', name: 'O. Thompson', role: 'UX Designer', score: 42, status: 'Reject', date: 'Oct 23, 2026', source: 'LinkedIn' },
  { id: '1087', name: 'E. Rodriguez', role: 'DevOps', score: 38, status: 'Reject', date: 'Oct 23, 2026', source: 'Direct' },
  { id: '1086', name: 'Sarah Jenkins', role: 'Frontend Engineer', score: 85, status: 'Interview', date: 'Oct 22, 2026', source: 'LinkedIn' },
  { id: '1085', name: 'Michael Chang', role: 'Data Scientist', score: 94, status: 'Interview', date: 'Oct 22, 2026', source: 'Referral' },
  { id: '1084', name: 'Emma Wilson', role: 'Product Manager', score: 55, status: 'Reject', date: 'Oct 21, 2026', source: 'Indeed' },
  { id: '1083', name: 'James Kim', role: 'Backend Engineer', score: 72, status: 'Review', date: 'Oct 21, 2026', source: 'Direct' },
];

export default function ResumeDatabaseView({
  onViewCandidate,
  onAdvanceSchedule,
  onAdvanceReject
}: {
  onViewCandidate?: (candidate: any) => void;
  onAdvanceSchedule?: (candidate: any) => void;
  onAdvanceReject?: (candidate: any) => void;
}) {
  const [candidatesData, setCandidatesData] = useState(INITIAL_CANDIDATES);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch real screening results from backend
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const workflows = await listWorkflows({ workflow_type: 'resume_screening' });
        const completed = workflows.filter((w: WorkflowResponse) =>
          w.status === 'completed' || w.runtime_data?.candidate
        );
        if (completed.length > 0) {
          const realCandidates = completed.map((w: WorkflowResponse) => ({
            id: w.workflow_id,
            name: w.runtime_data?.candidate?.name || w.runtime_data?.resume_filename || 'Unknown',
            role: w.entities?.job_role || 'Unknown',
            score: w.runtime_data?.match_score || 0,
            status: w.runtime_data?.decision === 'shortlisted' ? 'Interview' : w.runtime_data?.decision === 'rejected' ? 'Rejected' : 'Screening',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            source: 'GLM Pipeline',
            _workflow: w,
          }));
          setCandidatesData([...realCandidates, ...INITIAL_CANDIDATES]);
        }
      } catch {
        // Keep mock data as fallback
      }
    };
    fetchCandidates();
  }, []);
  const [showAdvanceModal, setShowAdvanceModal] = useState<any>(null);
  const [activeModal, setActiveModal] = useState<'none' | 'schedule' | 'reject'>('none');
  const [activeCandidate, setActiveCandidate] = useState<any>(null);

  const filteredCandidates = candidatesData.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStatus = (candidateId: string, newStatus: string) => {
    setCandidatesData(prev => prev.map(c => c.id === candidateId ? { ...c, status: newStatus } : c));
  };


  return (
    <motion.div 
      className="max-w-6xl mx-auto flex flex-col gap-6 w-full pb-12 h-full min-h-0"
      initial="hidden"
      animate="visible"
      variants={STAGGER_CONTAINER}
    >
      {/* Header */}
      <motion.div variants={FADE_UP_ANIMATION} className="flex flex-col gap-1 mb-2">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Resume Database</h1>
        <p className="text-sm text-zinc-400">Complete historical index of all parsed and scored candidate profiles.</p>
      </motion.div>

      {/* Toolbar */}
      <motion.div variants={FADE_UP_ANIMATION} className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-900/40 p-2 rounded-xl border border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative group w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950/50 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
          </div>
          <button className="p-2 border border-white/10 bg-zinc-950/50 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors flex shrink-0 items-center justify-center">
            <Filter size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          <FilterBadge label="All Statuses" active />
          <FilterBadge label="Interview" />
          <FilterBadge label="Review" />
          <FilterBadge label="Reject" />
        </div>
      </motion.div>

      {/* Database Data Table */}
      <motion.div variants={FADE_UP_ANIMATION} className="flex-1 min-h-0 bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden flex flex-col backdrop-blur-sm">
        <div className="flex-1 overflow-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-950/80 sticky top-0 z-10 backdrop-blur-md">
              <tr className="text-xs font-medium text-zinc-500 border-b border-white/5">
                <th className="py-4 px-6 font-medium">Candidate Profile</th>
                <th className="py-4 px-6 font-medium">Applied Role</th>
                <th className="py-4 px-6 font-medium">GLM Score</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium hidden sm:table-cell">Source</th>
                <th className="py-4 px-6 font-medium hidden sm:table-cell">Date</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCandidates.map((candidate, idx) => (
                <tr key={candidate.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex flex-col items-center justify-center text-xs font-medium text-zinc-400 group-hover:border-purple-500/30 group-hover:text-purple-300 transition-colors">
                        {candidate.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-200">{candidate.name}</span>
                        <span className="text-xs text-zinc-500">ID: #{candidate.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-zinc-300">{candidate.role}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                       <div className="h-1.5 w-16 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${candidate.score >= 80 ? 'bg-emerald-500' : candidate.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} 
                            style={{ width: `${candidate.score}%` }} 
                          />
                       </div>
                       <span className="text-sm font-mono text-zinc-400">{candidate.score}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={candidate.status} />
                  </td>
                  <td className="py-4 px-6 hidden sm:table-cell">
                    <span className="text-xs text-zinc-400">{candidate.source}</span>
                  </td>
                  <td className="py-4 px-6 hidden sm:table-cell">
                    <span className="text-xs text-zinc-500 tabular-nums">{candidate.date}</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setShowAdvanceModal(candidate)}
                        className="px-2 py-1.5 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 rounded-md text-xs font-semibold transition-colors border border-purple-500/20 mr-1"
                      >
                        Advance Candidate
                      </button>
                      <button 
                        onClick={() => onViewCandidate && onViewCandidate(candidate)}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md transition-colors" 
                        title="View Resume Detail"
                      >
                        <FileText size={16} />
                      </button>
                      <button className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md transition-colors" title="Download Extract">
                        <Download size={16} />
                      </button>
                      <button className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500 text-sm">
                    No candidates found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Advance Modal */}
      {showAdvanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setShowAdvanceModal(null)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white">Advance Candidate</h3>
              <p className="text-zinc-400 mt-2 text-sm">Choose the next step for {showAdvanceModal.name}</p>
              
              <div className="mt-6 flex flex-col gap-3">
                <button 
                  onClick={() => {
                    setActiveCandidate(showAdvanceModal);
                    setShowAdvanceModal(null);
                    setActiveModal('schedule');
                  }}
                  className="flex flex-col items-start p-4 rounded-xl border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all text-left group"
                >
                  <span className="text-sm font-semibold text-white group-hover:text-purple-300">Schedule Interview</span>
                  <span className="text-xs text-zinc-500 mt-1">Move to the active interview pipeline</span>
                </button>
                <button 
                  onClick={() => {
                    setActiveCandidate(showAdvanceModal);
                    setShowAdvanceModal(null);
                    setActiveModal('reject');
                  }}
                  className="flex flex-col items-start p-4 rounded-xl border border-white/5 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all text-left group"
                >
                  <span className="text-sm font-semibold text-white group-hover:text-rose-300">Reject Candidate</span>
                  <span className="text-xs text-zinc-500 mt-1">Send a polite rejection via automated email</span>
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => setShowAdvanceModal(null)}
                  className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* RENDER MODAL OVERLAYS IN PORTALS */}
      {activeModal === 'schedule' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-950 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl relative">
            <InterviewSchedulingView 
              candidate={activeCandidate} 
              onBack={() => setActiveModal('none')} 
              isPopup={true}
              onSuccess={() => handleUpdateStatus(activeCandidate.id, 'Interview')}
            />
          </div>
        </div>,
        document.body
      )}

      {activeModal === 'reject' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-950 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl relative">
            <AutomatedRejectionView 
              candidate={activeCandidate} 
              onBack={() => setActiveModal('none')} 
              isPopup={true}
              onSuccess={() => handleUpdateStatus(activeCandidate.id, 'Reject')}
            />
          </div>
        </div>,
        document.body
      )}
    </motion.div>
  );
}

function FilterBadge({ label, active = false }: { label: string, active?: boolean }) {
  return (
    <button className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
      active 
        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
        : 'bg-zinc-800/50 text-zinc-400 border border-transparent hover:bg-zinc-800 hover:text-zinc-200'
    }`}>
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'Interview') {
    return (
      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full w-max border border-emerald-500/20">
        <CheckCircle2 size={12} />
        {status}
      </div>
    );
  }
  if (status === 'Review') {
    return (
      <div className="flex items-center gap-1.5 text-amber-400 text-xs font-medium bg-amber-500/10 px-2.5 py-1 rounded-full w-max border border-amber-500/20">
        <Clock size={12} />
        {status}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-red-400 text-xs font-medium bg-red-500/10 px-2.5 py-1 rounded-full w-max border border-red-500/20">
      <XOctagon size={12} />
      {status}
    </div>
  );
}
