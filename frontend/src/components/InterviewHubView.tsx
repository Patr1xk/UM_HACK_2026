import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Video,
  User,
  Clock,
  CheckCircle2,
  Calendar,
  Star
} from 'lucide-react';
import { listWorkflows } from '../api';
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

// Mock Database for Interviews
const interviews = Array.from({ length: 48 }, (_, i) => {
  const names = ['Tsang Da Xin', 'Alice Chen', 'Marcus Johnson', 'Priya Patel', 'James Kim', 'Sarah Connor', 'John Doe', 'Jane Smith'];
  const roles = ['AI Engineer', 'Frontend Engineer', 'Product Manager', 'Data Scientist', 'Backend Engineer', 'Solutions Architect'];
  const statuses = ['Awaiting HR Review', 'Evaluated', 'Offer Extended'];
  const hrs = [
    { name: 'Sarah Jenkins', img: 'https://i.pravatar.cc/150?u=sarah' },
    { name: 'Michael Chen', img: 'https://i.pravatar.cc/150?u=michael' },
    { name: 'Emma Watson', img: 'https://i.pravatar.cc/150?u=emma' },
    { name: 'David Kim', img: 'https://i.pravatar.cc/150?u=david' }
  ];

  return {
    id: (205 - i).toString(),
    name: names[i % names.length],
    role: roles[i % roles.length],
    score: 70 + Math.floor(Math.random() * 28),
    status: statuses[i % statuses.length],
    date: `Oct ${Math.max(1, 25 - i)}, 2026`,
    hr: hrs[i % hrs.length],
    thumb: `https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&q=80&w=150&h=100` || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=100',
    recordingUrl: i === 0 ? 'https://www.youtube.com/watch?v=Ti5vfu9arXQ&t=1345s' : null
  };
});

export default function InterviewHubView({ onViewInterview }: { onViewInterview?: (candidate: any) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [realInterviews, setRealInterviews] = useState<any[]>([]);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const workflows = await listWorkflows({ workflow_type: 'resume_screening' });
        const interviewWorkflows = workflows.filter((w: WorkflowResponse) =>
          w.runtime_data?.interview_info || w.runtime_data?.decision === 'shortlisted'
        );
        const mapped = interviewWorkflows.map((w: WorkflowResponse) => ({
          id: w.workflow_id,
          name: w.runtime_data?.candidate?.name || w.runtime_data?.resume_filename || 'Unknown',
          role: w.entities?.job_role || 'Unknown',
          score: w.runtime_data?.match_score || 0,
          status: w.status === 'completed' ? 'Evaluated' : 'Awaiting HR Review',
          date: w.runtime_data?.interview_info?.display_time || 'TBD',
          hr: { name: 'GLM Agent', img: '' },
          thumb: '',
          recordingUrl: null,
          _workflow: w,
        }));
        if (mapped.length > 0) {
          setRealInterviews(mapped);
        }
      } catch {
        // Keep mock data as fallback
      }
    };
    fetchInterviews();
  }, []);

  const allInterviews = realInterviews.length > 0 ? [...realInterviews, ...interviews] : interviews;

  const filteredInterviews = allInterviews.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || i.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredInterviews.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInterviews = filteredInterviews.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filtering
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  return (
    <motion.div 
      className="max-w-6xl mx-auto flex flex-col gap-6 w-full pb-12 h-full min-h-0"
      initial="hidden"
      animate="visible"
      variants={STAGGER_CONTAINER}
    >
      {/* Header */}
      <motion.div variants={FADE_UP_ANIMATION} className="flex flex-col gap-1 mb-2">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Interview Hub</h1>
        <p className="text-sm text-zinc-400">Manage and review recorded interview sessions.</p>
      </motion.div>

      {/* Toolbar */}
      <motion.div variants={FADE_UP_ANIMATION} className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-900/40 p-2 rounded-xl border border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative group w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950/50 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          <FilterBadge label="All" active={selectedStatus === 'All'} onClick={() => setSelectedStatus('All')} />
          <FilterBadge label="Awaiting HR Review" active={selectedStatus === 'Awaiting HR Review'} onClick={() => setSelectedStatus('Awaiting HR Review')} />
          <FilterBadge label="Evaluated" active={selectedStatus === 'Evaluated'} onClick={() => setSelectedStatus('Evaluated')} />
          <FilterBadge label="Offer Extended" active={selectedStatus === 'Offer Extended'} onClick={() => setSelectedStatus('Offer Extended')} />
        </div>
      </motion.div>

      {/* Database Data Table */}
      <motion.div variants={FADE_UP_ANIMATION} className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden flex flex-col backdrop-blur-sm overscroll-contain">
        <div className="overflow-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-950/80 sticky top-0 z-10 backdrop-blur-md">
              <tr className="text-xs font-medium text-zinc-500 border-b border-white/5">
                <th className="py-4 px-6 font-medium">Recording</th>
                <th className="py-4 px-6 font-medium">Candidate Profile</th>
                <th className="py-4 px-6 font-medium hidden sm:table-cell">Applied Role</th>
                <th className="py-4 px-6 font-medium hidden lg:table-cell">Date of Interview</th>
                <th className="py-4 px-6 font-medium">AI Confidence Score</th>
                <th className="py-4 px-6 font-medium">Interviewer</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedInterviews.map((interview) => (
                <tr 
                  key={interview.id} 
                  className="hover:bg-zinc-800/30 transition-colors group cursor-pointer"
                  onClick={() => onViewInterview && onViewInterview(interview)}
                >
                  <td className="py-4 px-6">
                    <div className="relative w-16 h-10 rounded border border-white/10 overflow-hidden bg-zinc-900 flex-shrink-0 group-hover:border-blue-500/50 transition-colors">
                      <img src={interview.thumb} alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (interview.recordingUrl) {
                            setSelectedVideo(interview.recordingUrl);
                          }
                        }}
                        className="absolute inset-0 flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer group"
                      >
                        <div className="w-5 h-5 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center group-hover:bg-blue-600/80 transition-colors">
                           <Play size={10} className="text-white ml-0.5" />
                        </div>
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-200">{interview.name}</span>
                      <span className="text-xs text-zinc-500">ID: #{interview.id}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 hidden sm:table-cell">
                    <span className="text-sm text-zinc-300">{interview.role}</span>
                  </td>
                  <td className="py-4 px-6 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Calendar size={12} className="text-zinc-500" />
                      {interview.date}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                       <Star size={14} className={interview.score >= 90 ? "text-yellow-500" : "text-zinc-500"} />
                       <span className="text-sm font-medium text-zinc-300">{interview.score}% Match</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                       <img src={interview.hr.img} alt={interview.hr.name} className="w-6 h-6 rounded-full border border-white/10 object-cover" />
                       <span className="text-sm text-zinc-400">{interview.hr.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={interview.status} />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 text-zinc-500 group-hover:text-blue-400 transition-colors">
                       <span className="text-xs font-medium uppercase tracking-wider">Review Pipeline</span>
                    </div>
                  </td>
                </tr>
              ))}
              
              {paginatedInterviews.length === 0 && (
                <tr>
                   <td colSpan={8} className="py-12 text-center text-zinc-500 text-sm">
                      No interviews found matching this view.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* External Pagination UI - Sitting outside the main container as per reference */}
      <motion.div 
        variants={FADE_UP_ANIMATION}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2"
      >
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-zinc-900/40 text-zinc-500 hover:text-zinc-200 hover:border-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
             <div className="rotate-90"><ChevronDown size={14} /></div>
          </button>

          <div className="flex items-center gap-2">
            {getPageNumbers(currentPage, totalPages).map((pageNum, idx) => {
              if (pageNum === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-zinc-600 font-medium">
                    ...
                  </span>
                );
              }
              
              return (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => setCurrentPage(pageNum as number)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl border font-medium text-sm transition-all focus:outline-none ${
                    currentPage === pageNum
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                      : 'bg-zinc-900/40 border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-200'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 bg-zinc-900/40 text-zinc-500 hover:text-zinc-200 hover:border-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
             <div className="-rotate-90"><ChevronDown size={14} /></div>
          </button>
        </div>
      </motion.div>

      {/* YouTube Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden max-w-4xl w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-zinc-950/50">
              <h2 className="text-lg font-semibold text-white">Interview Recording</h2>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${extractYouTubeId(selectedVideo)}?start=1345&autoplay=1`}
                title="Interview Recording"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Extract YouTube video ID from URL
function extractYouTubeId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : '';
}

// Logic for generating page numbers with ellipsis
function getPageNumbers(current: number, total: number) {
  const pages: (number | string)[] = [];
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    // Always show first page
    pages.push(1);
    
    if (current > 3) {
      pages.push('...');
    }
    
    // Show pages around current
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    
    if (current < total - 2) {
      pages.push('...');
    }
    
    // Always show last page
    if (!pages.includes(total)) pages.push(total);
  }
  
  return pages;
}

// Re-defining ChevronDown since it might be missing in local scope imports
function ChevronDown({ size = 16, className = "" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}

function FilterBadge({ label, active, onClick }: { label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
        active 
          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(37,99,235,0.1)]' 
          : 'bg-transparent text-zinc-500 hover:text-zinc-300 border border-transparent custom-hover'
      }`}
    >
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'Awaiting HR Review') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 text-amber-500 text-xs font-medium border border-amber-500/20">
        <Clock size={12} />
        Awaiting Review
      </span>
    );
  }
  if (status === 'Evaluated') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
        <CheckCircle2 size={12} />
        Evaluated
      </span>
    );
  }
  if (status === 'Offer Extended') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
        <Star size={12} className="fill-emerald-400" />
        Offer Extended
      </span>
    );
  }
  return null;
}
