import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Clock, Terminal, Search, ChevronRight, CheckCircle2, AlertTriangle, Info, XOctagon, ZoomIn, ZoomOut, ChevronLeft, BarChart2, ChevronDown, Maximize2, HelpCircle, Loader2 } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { listWorkflows } from '../api';
import type { WorkflowResponse } from '../types/api';

const generateTimelineData = () => Array.from({ length: 48 }).map((_, i) => ({
  time: `15:${String(i).padStart(2, '0')}`,
  count: Math.random() > 0.4 ? Math.floor(Math.random() * 20) : Math.floor(Math.random() * 5),
}));

const BASE_LOG_MOCK_DATA = [
  {
    id: "LOG-001X9",
    timestamp: "10:42:01 AM",
    level: "INFO",
    module: "RESUME_PARSER",
    message: "Extracted 14 entities and routed candidate Alice to Screening.",
    payload: JSON.stringify({ candidateId: "CAND-89912", name: "Alice Johnson", confidenceScore: 0.94, extractedSkills: ["React", "TypeScript", "Node.js", "AWS"], nextAction: "SCREENING_ROUND_1" }, null, 2)
  },
  {
    id: "LOG-001X8",
    timestamp: "10:41:55 AM",
    level: "SUCCESS",
    module: "WORKFLOW_ROUTER",
    message: "Workflow transition completed: Alice successfully entered pipeline.",
    payload: JSON.stringify({ workflowId: "WF-11002", status: "ACTIVE", latencyMs: 142 }, null, 2)
  },
  {
    id: "LOG-001X7",
    timestamp: "10:40:12 AM",
    level: "WARN",
    module: "API_GATEWAY",
    message: "High latency detected on resume OCR endpoint (850ms).",
    payload: JSON.stringify({ endpoint: "/api/v1/ocr", duration: 850, threshold: 500, retries: 1 }, null, 2)
  },
  {
    id: "LOG-001X6",
    timestamp: "10:39:44 AM",
    level: "ERROR",
    module: "EMAIL_SERVICE",
    message: "Failed to send rejection email to candidate ID: 9942.",
    payload: JSON.stringify({ recipient: "unknown_address@gmail", errorCode: "SMTP_550", reason: "Invalid recipient address" }, null, 2)
  },
  {
    id: "LOG-001X5",
    timestamp: "10:35:10 AM",
    level: "INFO",
    module: "GLM_ORCHESTRATOR",
    message: "Initiated automated background check for pending offers.",
    payload: JSON.stringify({ batchSize: 5, provider: "Checkr", estimatedCompletion: "24h" }, null, 2)
  },
  {
    id: "LOG-001X4",
    timestamp: "10:31:02 AM",
    level: "SUCCESS",
    module: "INTERVIEW_SCHEDULER",
    message: "Generated optimal calendar slots for technical round.",
    payload: JSON.stringify({ interviewer: "Sarah Lead", slots: ["Tomorrow 10AM", "Tomorrow 2PM", "Thursday 11AM"] }, null, 2)
  }
];

// Generate 94 more logs to enable pagination
const LOG_MOCK_DATA = [
  ...BASE_LOG_MOCK_DATA,
  ...Array.from({ length: 94 }).map((_, i) => {
    const base = BASE_LOG_MOCK_DATA[i % BASE_LOG_MOCK_DATA.length];
    return {
      ...base,
      id: `LOG-001Y${i}`,
      timestamp: `10:${String(29 - Math.floor(i / 3)).padStart(2, '0')}:${String((60 - i) % 60).padStart(2, '0')} AM`,
      message: `${base.message} (Duplicate ${i + 1})`
    };
  })
];

const SEVERITY_INFO = {
  INFO: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  SUCCESS: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  WARN: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ERROR: { icon: XOctagon, color: 'text-rose-400', bg: 'bg-rose-500/10' }
};

export default function OrchestratorLogsView() {
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState(LOG_MOCK_DATA[0]);

  // Interactive Timeline States
  const [timelineData, setTimelineData] = useState(generateTimelineData());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [timeFilter, setTimeFilter] = useState('Last 1 Hour');

  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Real workflow data
  const [realLogs, setRealLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    const fetchWorkflowLogs = async () => {
      setIsLoadingLogs(true);
      try {
        const workflows = await listWorkflows();
        const logs: any[] = [];
        for (const w of workflows) {
          const actionLogs = w.action_logs || [];
          for (const log of actionLogs) {
            const stepName = typeof log === 'object' ? (log.step || 'unknown') : String(log);
            const status = typeof log === 'object' ? log.status : 'success';
            const message = typeof log === 'object' ? log.message : `${stepName} completed`;
            logs.push({
              id: `${w.workflow_id}-${stepName}`,
              timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              level: status === 'failed' ? 'ERROR' : status === 'paused' ? 'WARN' : 'SUCCESS',
              module: stepName.replace(/_/g, '').toUpperCase().slice(0, 20),
              message: `[${w.workflow_type}] ${message}`,
              payload: JSON.stringify(log, null, 2),
            });
          }
          // Add workflow-level log
          logs.push({
            id: w.workflow_id,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            level: w.status === 'failed' ? 'ERROR' : w.status === 'awaiting_clarification' ? 'WARN' : 'INFO',
            module: 'GLM_ORCHESTRATOR',
            message: `Workflow ${w.workflow_id}: ${w.intent_summary} (${w.status})`,
            payload: JSON.stringify({ workflow_id: w.workflow_id, type: w.workflow_type, status: w.status, entities: w.entities, confidence: w.confidence }, null, 2),
          });
        }
        if (logs.length > 0) {
          setRealLogs(logs);
          if (logs.length > 0) setSelectedLog(logs[0]);
        }
      } catch {
        // Keep mock data as fallback
      } finally {
        setIsLoadingLogs(false);
      }
    };
    fetchWorkflowLogs();
  }, []);

  const allLogs = realLogs.length > 0 ? [...realLogs, ...LOG_MOCK_DATA] : LOG_MOCK_DATA;

  const handleTimeChange = (val: string) => {
    setTimeFilter(val);
    setTimelineData(generateTimelineData());
    setShowTimeDropdown(false);
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  const filteredLogs = allLogs.filter(log => {
    const matchesFilter = filter === 'ALL' || log.level === filter;
    const matchesSearch = 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
  const currentLogs = filteredLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset page when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  return (
    <div className="w-full pb-12">
      {/* 1. Top Telemetry Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
        <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 flex items-center">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mr-4">
            <Activity className="text-emerald-400" size={20} />
          </div>
          <div>
            <p className="text-sm text-zinc-500 font-medium">System Status</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
              <p className="text-xl font-bold text-white tracking-tight">Online</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 flex items-center">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mr-4">
            <Terminal className="text-purple-400" size={20} />
          </div>
          <div>
            <p className="text-sm text-zinc-500 font-medium">Automated Actions</p>
            <p className="text-xl font-bold text-white tracking-tight mt-0.5">1,492</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mr-4">
            <Clock className="text-blue-400" size={20} />
          </div>
          <div>
            <p className="text-sm text-zinc-500 font-medium">Average GLM Latency</p>
            <p className="text-xl font-bold text-white tracking-tight mt-0.5">412ms</p>
          </div>
        </div>
      </div>

      {/* 1.5 Timeline Chart (Dark Theme) */}
      <div className="bg-[#0f1115] rounded-xl mb-6 shrink-0 shadow-sm border border-white/10 overflow-hidden flex flex-col relative z-10 w-full">
        {/* Timeline Top header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-zinc-900/50">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-zinc-300">Timeline</span>
            
            {/* Custom Time Filter Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                className="bg-black/20 hover:bg-black/40 border border-white/10 rounded-md text-xs text-zinc-300 px-3 py-1.5 outline-none transition-colors flex items-center gap-2"
              >
                {timeFilter} <ChevronDown size={14} className="text-zinc-500" />
              </button>
              
              <AnimatePresence>
                {showTimeDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 mt-1 w-40 bg-zinc-800 border border-white/10 rounded-lg shadow-xl overflow-hidden z-[100] text-sm"
                  >
                     <div className="py-1">
                        {['Last 1 Hour', 'Last 24 Hours', 'Last 7 Days', 'Custom Range...'].map(f => (
                          <button 
                            key={f}
                            onClick={() => handleTimeChange(f)}
                            className={`w-full text-left px-4 py-2 hover:bg-white/5 hover:text-white transition-colors ${timeFilter === f ? 'text-purple-400 bg-purple-500/5' : 'text-zinc-300'}`}
                          >
                            {f}
                          </button>
                        ))}
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <button className="hover:text-white hover:bg-white/5 p-1.5 rounded-full transition-colors"><ZoomOut size={18} strokeWidth={2} /></button>
            <button className="hover:text-white hover:bg-white/5 p-1.5 rounded-full transition-colors"><ZoomIn size={18} strokeWidth={2} /></button>
          </div>
        </div>

        {/* Timeline Body */}
        <div className="flex items-stretch bg-zinc-950/30 relative pb-7">
           {/* Left expand arrow */}
           <button className="px-3 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors flex items-center justify-center"><ChevronLeft size={22} strokeWidth={2.5} /></button>
           
           <div className="flex-1 relative h-28 pt-6 pb-2 px-0 overflow-visible z-10 w-full">
              <div className="w-full h-full relative" style={{ marginLeft: '-8px', marginRight: '-8px' }}>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart 
                    data={timelineData} 
                    margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                    onMouseMove={(state) => {
                      if (state && state.activeTooltipIndex !== undefined) {
                        // Interactive hover logic can go here
                      }
                    }}
                  >
                     <Tooltip 
                       contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '12px', color: '#e4e4e7' }}
                       itemStyle={{ color: '#a855f7' }}
                       cursor={{ fill: 'rgba(168,85,247,0.1)' }}
                     />
                     <Bar 
                       dataKey="count" 
                       fill="#a855f7" 
                       radius={[2, 2, 0, 0]} 
                       fillOpacity={0.8}
                       activeBar={{ fill: '#c084fc', stroke: '#c084fc', strokeWidth: 1 }}
                       animationBegin={200}
                     />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Highlight Overlay - Matching Theme */}
              <div className="absolute bottom-[20px] left-0 right-[0] h-[78%] pointer-events-none z-20">
                 {/* The timeline axis base line full width */}
                 <div className="absolute bottom-[-1px] left-[-24px] right-[-24px] border-b border-white/10 z-0"></div>

                 {/* Selection area background */}
                 <div className="absolute left-[8%] right-[5%] h-full bg-purple-500/10 border-l border-r border-purple-500/50">
                    {/* Bold bottom line inside selection */}
                    <div className="absolute bottom-[-1px] left-0 right-0 border-b-2 border-purple-500 z-0 shadow-[0_0_8px_rgba(168,85,247,0.4)]"></div>
                 </div>
                 
                 {/* Left marker */}
                 <div className="absolute left-[8%] bottom-[-16px] -ml-[23px] flex flex-col items-center z-10">
                    <div className="w-[9px] h-[9px] bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.8)] rounded-full mb-[2px]"></div>
                    <div className="bg-purple-600 text-white text-[9px] tracking-wide px-1 py-[2px] rounded-sm font-medium shadow-sm">14:42:00</div>
                 </div>

                 {/* Right marker */}
                 <div className="absolute right-[5%] bottom-[-16px] -mr-[23px] flex flex-col items-center z-10">
                    {/* Floating eye handle */}
                    <div className="absolute top-[-68px] bg-zinc-800 border border-white/20 shadow-lg p-[3px] rounded-sm cursor-pointer pointer-events-auto hover:bg-zinc-700 flex items-center justify-center z-30 transition-colors">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                       {/* Line down to the marker */}
                       <div className="absolute top-full left-[50%] -translate-x-[50%] h-[58px] w-px border-l-[1.5px] border-dashed border-white/20 pointer-events-none"></div>
                    </div>
                    <div className="w-[9px] h-[9px] bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.8)] rounded-full mb-[2px]"></div>
                    <div className="bg-purple-600 text-white text-[9px] tracking-wide px-1 py-[2px] rounded-sm font-medium shadow-sm">15:43:00</div>
                 </div>
              </div>

               {/* Time labels under axis */}
               <div className="absolute bottom-[2px] left-[8%] right-[5%] flex justify-between text-[11px] text-zinc-500 font-mono pointer-events-none px-6 tracking-tight">
                  <span>14:50</span>
                  <span>14:55</span>
                  <span>15:00</span>
                  <span>15:05</span>
                  <span>15:10</span>
                  <span>15:15</span>
                  <span>15:20</span>
                  <span>15:25</span>
                  <span>15:30</span>
                  <span>15:35</span>
               </div>
           </div>
           
           {/* Right expand arrow */}
           <button className="px-3 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors flex items-center justify-center z-10 pointer-events-auto"><ChevronRight size={22} strokeWidth={2.5} /></button>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/5 bg-zinc-900/50">
          <span className="text-[13px] font-semibold text-zinc-300 tracking-tight">{filteredLogs.length} results</span>
          <div className="flex items-center gap-7">
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-2 text-[13px] font-semibold tracking-tight text-purple-400 hover:text-purple-300 transition-colors pointer-events-auto disabled:opacity-50"
            >
              {isAnalyzing ? <Loader2 size={16} strokeWidth={2.5} className="animate-spin" /> : <BarChart2 size={16} strokeWidth={2.5} />} 
              {isAnalyzing ? "Analyzing..." : "Analyze results"}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                className="flex items-center gap-1 text-[13px] font-semibold tracking-tight text-purple-400 hover:text-purple-300 transition-colors"
              >
                Actions <ChevronDown size={14} strokeWidth={2.5} />
              </button>
              
              <AnimatePresence>
                {showActionsDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-full right-0 mb-2 w-48 bg-zinc-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 text-sm"
                  >
                    <div className="py-1">
                      <button className="w-full text-left px-4 py-2 text-zinc-300 hover:bg-white/5 hover:text-white transition-colors">Export Logs (JSON)</button>
                      <button className="w-full text-left px-4 py-2 text-zinc-300 hover:bg-white/5 hover:text-white transition-colors">Download Payload</button>
                      <button className="w-full text-left px-4 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-white/5 mt-1 pt-2">Clear Selection</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 p-1.5 rounded-sm transition-colors flex items-center justify-center"><Maximize2 size={16} strokeWidth={2.5} className="rotate-45" /></button>
          </div>
        </div>
      </div>

      {/* 2. Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shrink-0 bg-zinc-900/50 p-3 rounded-xl border border-white/5">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search logs by ID, module..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
          {['ALL', 'INFO', 'SUCCESS', 'WARN', 'ERROR'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === f 
                  ? 'bg-white text-black' 
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {f === 'ALL' ? 'All' : `[${f}]`}
            </button>
          ))}
        </div>
      </div>

      {/* 3. The Split-Pane Log Viewer */}
      <div className="flex flex-col md:flex-row gap-6 bg-zinc-950/20 rounded-2xl border border-white/5">
        
        {/* Left Column (The Feed) */}
        <div className="w-full md:w-[60%] flex flex-col border-r border-white/5">
          <div className="flex items-center px-6 py-3 border-b border-white/5 bg-zinc-900/30">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Live Feed</span>
          </div>
          <div className="p-4 space-y-2">
            <AnimatePresence>
              {currentLogs.map(log => {
                const config = SEVERITY_INFO[log.level as keyof typeof SEVERITY_INFO];
                const isSelected = selectedLog?.id === log.id;
                
                return (
                  <motion.div
                    key={log.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedLog(log)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-purple-500/30 bg-purple-500/5' 
                        : 'border-white/5 bg-black/20 hover:bg-zinc-900/80 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 mt-0.5">
                        <span className="font-mono text-xs text-zinc-500">{log.timestamp}</span>
                      </div>
                      
                      <div className="flex-1 min-w-0 flex flex-col items-start gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${config.bg} ${config.color}`}>
                            {log.level}
                          </span>
                          <span className="font-mono text-xs text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                            [{log.module}]
                          </span>
                        </div>
                        <p className={`text-sm ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                          {log.message}
                        </p>
                      </div>
                      
                      <div className="shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {isSelected && <ChevronRight size={16} className="text-purple-400" />}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {currentLogs.length === 0 && (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  No logs found matching your criteria.
                </div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-white/5 bg-zinc-900/30 flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors bg-black/20 text-zinc-500 hover:text-white border border-white/5 disabled:opacity-30 disabled:hover:text-zinc-500"
              >
                <ChevronLeft size={16} />
              </button>
              
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;
                if (totalPages <= maxVisiblePages) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  if (currentPage <= 3) {
                    pages.push(1, 2, 3, '...', totalPages);
                  } else if (currentPage >= totalPages - 2) {
                    pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
                  } else {
                    pages.push(1, '...', currentPage, '...', totalPages);
                  }
                }

                return pages.map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="w-8 h-8 flex items-center flex-col justify-end pb-2 text-zinc-500 font-bold">
                        ...
                      </span>
                    );
                  }
                  
                  const isCurrent = page === currentPage;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                        isCurrent 
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' 
                          : 'bg-black/20 text-zinc-400 hover:bg-white/5 hover:text-white border border-white/5'
                      }`}
                    >
                      {page}
                    </button>
                  );
                });
              })()}

              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors bg-black/20 text-zinc-500 hover:text-white border border-white/5 disabled:opacity-30 disabled:hover:text-zinc-500"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Right Column (The Inspector) */}
        <div className="w-full md:w-[40%] flex flex-col bg-zinc-900/20 sticky top-6 self-start rounded-r-2xl h-[calc(100vh-120px)]">
          {selectedLog ? (
            <>
              <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-zinc-900/30">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Log Details</span>
                <span className="font-mono text-xs text-zinc-500">{selectedLog.id}</span>
              </div>
              <div className="overflow-y-auto p-6 scrollbar-hide">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">{selectedLog.module}</h3>
                  <p className="text-zinc-400 text-sm">{selectedLog.message}</p>
                </div>
                
                <div className="space-y-2">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Payload</span>
                  <div className="bg-[#0f1115] border border-white/5 rounded-xl p-4 overflow-x-auto">
                    <pre className="font-mono text-[13px] leading-relaxed">
                      <code className="text-indigo-300">
                        {selectedLog.payload}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-500 p-8 text-center h-full">
              <Terminal size={32} className="mb-4 opacity-50" />
              <p className="text-sm">Select a log entry to inspect details and payloads.</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
