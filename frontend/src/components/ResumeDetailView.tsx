import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import InterviewSchedulingView from './InterviewSchedulingView';
import AutomatedRejectionView from './AutomatedRejectionView';
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  ZoomIn, 
  ZoomOut,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  XOctagon
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Legend,
  Tooltip
} from 'recharts';

// ==========================================
// DATA LAYER (Ready for Backend Integration)
// ==========================================
// Replace this mock function with your actual API call.
// e.g., const response = await fetch(`/api/candidates/${candidateId}/analysis`);
const fetchDetailedMetrics = async (candidateId: string) => {
  // Simulating network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (candidateId === '1093') {
    return {
      overallScore: 88,
      categories: [
        { id: 'tone', title: 'Communication', score: 85, target: 80, feedback: 'Strong action verbs like "Built and deployed", "Integrated", and "Developed" drive the narrative well.' },
        { id: 'content', title: 'Domain Experience', score: 75, target: 85, feedback: 'Great project scope! Enhance by adding specific numerical outcomes (e.g., "improved operational efficiency by X%").' },
        { id: 'structure', title: 'Technical Depth', score: 92, target: 80, feedback: 'Very clean, parseable structure. Education, Experience, and Skills sections are distinctly readable for ATS.' },
        { id: 'skills', title: 'Tooling Matrix', score: 98, target: 90, feedback: 'Exceptional match for AI Engineering. Mentions modern stack explicitly: RAG, LangChain, PyTorch, LiteLLM, AWS.' }
      ],
      atsFeedback: {
        score: 88,
        title: 'ATS Scan Results - 88/100',
        description: 'This candidate\'s resume parsed extremely well. Here is the technical breakdown:',
        issues: [
          { type: 'success', text: 'Detected core ML framework keywords (PyTorch, Python) mapped directly to Requirements.' },
          { type: 'success', text: 'Identified robust LLM workflow tooling (LangChain, RAG, LiteLLM).' },
          { type: 'warning', text: 'Missed opportunity to quantify the scale of "real-world business use cases" in the CelcomDigi role.' },
          { type: 'info', text: 'Consider moving the "Skills" section higher up if targeting keyword-heavy filtering systems.' }
        ]
      }
    };
  }

  return {
    overallScore: 78,
    categories: [
      { id: 'tone', title: 'Communication', score: 65, target: 80, feedback: 'Language is somewhat passive. The candidate should use more action verbs to describe achievements.' },
      { id: 'content', title: 'Domain Experience', score: 50, target: 85, feedback: 'Missing quantifiable metrics. Recommending specific numbers for impact statements.' },
      { id: 'structure', title: 'Technical Depth', score: 60, target: 80, feedback: 'Standard layout, but the skills section is buried. Technical skills should ideally be closer to the top.' },
      { id: 'skills', title: 'Tooling Matrix', score: 95, target: 90, feedback: 'Excellent match! Features 90% of the required tech stack including React, Node.js, and TypeScript.' }
    ],
    atsFeedback: {
      score: 70,
      title: 'ATS Scan Results - 70/100',
      description: 'This candidate\'s resume was scanned against standard employer ATS thresholds. Here is how it performed:',
      issues: [
        { type: 'warning', text: 'Consider a dedicated Skills section with technical keywords like JavaScript, React, Node.js.' },
        { type: 'error', text: 'Missing relevant technical keywords throughout the work experience section matching the job description.' },
        { type: 'success', text: 'Uses standard, parseable section headers ("Experience", "Education").' },
        { type: 'warning', text: 'Lacks quantifiable metrics. ATS systems often rank based on numeric impact.' }
      ]
    }
  };
};

// ==========================================
// COMPONENT
// ==========================================

export default function ResumeDetailView({ 
  candidate, 
  onBack,
  onAccept,
  onReject,
  onAdvanceSchedule,
  onAdvanceReject,
  isPopup 
}: { 
  candidate: any; 
  onBack: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onAdvanceSchedule?: () => void;
  onAdvanceReject?: () => void;
  isPopup?: boolean;
}) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'schedule' | 'reject'>('none');

  useEffect(() => {
    // Call the data fetching function when component mounts
    let isMounted = true;
    fetchDetailedMetrics(candidate.id).then(data => {
      if (isMounted) {
        setMetrics(data);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [candidate.id]);

  return (
    <div className="flex flex-col h-full w-full min-h-0 bg-[#0a0a0a]">
      {/* Top Header Navigation */}
      <div className="flex-shrink-0 h-16 border-b border-white/5 px-6 flex items-center justify-between bg-zinc-950/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {!isPopup && (
            <>
              <button 
                onClick={onBack}
                className="p-2 -ml-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                <span className="text-sm font-medium">Back to Database</span>
              </button>
              <div className="w-px h-6 bg-white/10" />
            </>
          )}
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-white">{candidate.name}</h2>
            <span className="text-xs text-zinc-500">{candidate.role || 'Unknown'} • Application ID: {candidate.id || 'N/A'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded transition-colors">
              <Download size={14} /> Download Report
           </button>
           
           {isPopup ? (
             <>
               <button onClick={onReject || onBack} className="flex items-center gap-2 px-4 py-1.5 border border-red-500/30 hover:bg-red-500/10 text-red-400 text-xs font-medium rounded transition-colors">
                  <XOctagon size={14} /> Reject
               </button>
               <button onClick={onAccept || onBack} className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded transition-colors shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 size={14} /> Accept
               </button>
             </>
           ) : (
             <>
               <button 
                 onClick={() => setShowAdvanceModal(true)}
                 className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded transition-colors shadow-[0_0_12px_rgba(147,51,234,0.3)]"
               >
                  Advance Candidate
               </button>

               <AnimatePresence>
                 {showAdvanceModal && createPortal(
                   <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                     <motion.div 
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                     >
                       <div className="p-6 border-b border-white/10">
                         <h3 className="text-xl font-semibold text-white">Advance Candidate</h3>
                         <p className="text-zinc-400 mt-2 text-sm">Choose the next step for {candidate.name}</p>
                       </div>
                       <div className="p-6 flex flex-col gap-3 relative z-10 bg-zinc-900">
                         <button 
                           onClick={() => { setShowAdvanceModal(false); setActiveModal('schedule'); }}
                           className="w-full p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 flex flex-col items-start gap-2 transition-colors text-left"
                         >
                           <div className="flex items-center gap-2 text-emerald-400 font-medium">
                             <CheckCircle2 size={18} />
                             Schedule Interview
                           </div>
                           <span className="text-xs text-zinc-400">Proceed to scheduling the first interview round.</span>
                         </button>
                         <button 
                           onClick={() => { setShowAdvanceModal(false); setActiveModal('reject'); }}
                           className="w-full p-4 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 flex flex-col items-start gap-2 transition-colors text-left"
                         >
                           <div className="flex items-center gap-2 text-red-400 font-medium">
                             <XOctagon size={18} />
                             Reject Candidate
                           </div>
                           <span className="text-xs text-zinc-400">Reject and send automated rejection email.</span>
                         </button>
                       </div>
                       <div className="p-4 bg-zinc-950 border-t border-white/10 flex justify-end">
                         <button 
                           onClick={() => setShowAdvanceModal(false)}
                           className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                         >
                           Cancel
                         </button>
                       </div>
                     </motion.div>
                   </div>,
                   document.body
                 )}
               </AnimatePresence>
             </>
           )}
        </div>
      </div>

      {/* Main Split View */}
      <div className={`flex-1 grid grid-cols-1 ${isPopup ? 'lg:grid-cols-2' : 'lg:grid-cols-5'} gap-4 md:gap-6 p-4 md:p-6 min-h-0 overflow-hidden`}>
        
        {/* LEFT COMPONENT: Embedded PDF Wrapper Mock */}
        <div className={`flex flex-col h-full bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl ${isPopup ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
          {/* PDF Viewer Toolbar */}
          <div className="flex-shrink-0 bg-zinc-950 p-2 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400">
              <FileText size={16} className="ml-2" />
              <span className="text-xs font-mono truncate max-w-[200px]">{candidate.name.replace(' ', '_')}_Resume.pdf</span>
            </div>
            <div className="flex items-center gap-1 opacity-60">
              <button className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300"><ZoomOut size={16} /></button>
              <span className="text-xs font-mono text-zinc-300 px-2">100%</span>
              <button className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300"><ZoomIn size={16} /></button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button className="p-1.5 hover:bg-zinc-800 rounded text-zinc-300"><Printer size={16} /></button>
            </div>
          </div>
          
          {/* PDF Viewer Canvas (White Paper) */}
          <div className="flex-1 overflow-y-auto bg-zinc-800 flex justify-center scrollbar-hide py-4 md:py-8">
            <div className={`bg-white shadow-2xl text-zinc-900 font-serif relative transition-all h-max ${isPopup ? 'w-full max-w-[800px] min-h-[1056px] px-8 py-10 mx-auto text-sm' : 'w-full max-w-[1000px] min-h-[1200px] px-12 py-16 sm:px-16 mx-auto'}`}>
                 {candidate.id === '1093' ? (
                   <TsangDaXinResumeContent />
                 ) : (
                   <FallbackResumeContent candidate={candidate} />
                 )}
            </div>
          </div>
        </div>

        {/* RIGHT COMPONENT: AI Scorecards & Insights (Dark Theme) */}
        <div className={`flex flex-col h-full overflow-y-auto pr-0 lg:pr-2 scrollbar-hide ${isPopup ? 'lg:col-span-1' : 'lg:col-span-2'}`}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
               <div className="flex flex-col items-center gap-4 text-purple-400">
                 <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                 <span className="text-sm uppercase tracking-wider font-mono">Analyzing Document...</span>
               </div>
            </div>
          ) : metrics ? (
            <div className="flex flex-col gap-6 pb-12">
              
              {/* Overall Score Banner */}
              <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex items-center gap-6">
                 {/* Circular Score */}
                 <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                      <circle 
                        cx="50" cy="50" r="40" fill="transparent" 
                        stroke={metrics.overallScore >= 80 ? '#10b981' : metrics.overallScore >= 60 ? '#f59e0b' : '#ef4444'} 
                        strokeWidth="8" strokeDasharray="251.2" 
                        strokeDashoffset={251.2 - (251.2 * metrics.overallScore) / 100}
                        className="transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-2xl font-bold text-white leading-none">{metrics.overallScore}</span>
                       <span className="text-[10px] text-zinc-500">/ 100</span>
                    </div>
                 </div>
                 <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-white">Candidate Match Score</h3>
                    <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                      This score aggregates linguistic analysis, ATS parsability, and core requirement density for the given role.
                    </p>
                 </div>
              </div>

              {/* Requirements Matrix Radar Chart */}
              <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-xl relative overflow-hidden flex flex-col">
                 
                 {/* Internal Ambient Glow */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

                 {/* Top Header */}
                 <div className="flex items-center justify-between mb-2 relative z-10">
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2 w-full">
                       <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse" />
                       Core Competency Matrix
                    </h4>
                 </div>

                 <div className="h-64 w-full mt-4 relative z-10">
                   <ResponsiveContainer width="100%" height="100%">
                     <RadarChart cx="50%" cy="50%" outerRadius="65%" data={metrics.categories}>
                       <defs>
                         {/* Rich Purple Gradient for Candidate Fill */}
                         <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor="#a855f7" stopOpacity={0.6} />
                           <stop offset="100%" stopColor="#6366f1" stopOpacity={0.1} />
                         </linearGradient>
                         {/* SVG Drop Shadow filter for the stroke glow */}
                         <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                           <feGaussianBlur stdDeviation="3" result="blur" />
                           <feMerge>
                             <feMergeNode in="blur" />
                             <feMergeNode in="SourceGraphic" />
                           </feMerge>
                         </filter>
                       </defs>

                       {/* Concentric spider-web backings */}
                       <PolarGrid gridType="polygon" stroke="#3f3f46" strokeDasharray="3 3" />
                       <PolarAngleAxis dataKey="title" tick={{ fill: '#d4d4d8', fontSize: 11, fontWeight: 600 }} />
                       <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                       
                       <Tooltip 
                         cursor={false}
                         content={({ active, payload }) => {
                           if (active && payload && payload.length) {
                             const target = payload.find((p: any) => p.dataKey === 'target')?.value;
                             const score = payload.find((p: any) => p.dataKey === 'score')?.value;
                             const title = payload[0].payload.title;
                             
                             return (
                               <div className="bg-zinc-950/90 border border-white/10 rounded-lg p-3.5 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md min-w-[180px]">
                                 <p className="text-[11px] font-bold text-white mb-3 uppercase tracking-wider border-b border-white/10 pb-2.5">{title}</p>
                                 <div className="flex flex-col gap-2.5">
                                    <div className="flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-2.5">
                                         <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                                         <span className="text-xs text-zinc-300 font-medium">Candidate</span>
                                      </div>
                                      <span className="text-xs font-mono font-bold text-purple-400">{score}/100</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-2.5">
                                         <div className="w-2 h-2 border border-zinc-500 border-dashed rounded-full" />
                                         <span className="text-xs text-zinc-400 font-medium">Requirement</span>
                                      </div>
                                      <span className="text-xs font-mono font-bold text-zinc-500">{target}/100</span>
                                    </div>
                                 </div>
                               </div>
                             );
                           }
                           return null;
                         }}
                       />

                       {/* Job Requirements (Target) - Dashed Line Tracker */}
                       <Radar 
                         name="Job Requirements" 
                         dataKey="target" 
                         stroke="#71717a" 
                         strokeWidth={1.5} 
                         strokeDasharray="4 4" 
                         fill="transparent" 
                       />
                       
                       {/* Candidate Profile (Actual) - Gradient + Glow + Dots */}
                       <Radar 
                         name="Candidate Profile" 
                         dataKey="score" 
                         stroke="#a855f7" 
                         strokeWidth={2.5} 
                         fill="url(#purpleGradient)" 
                         fillOpacity={1} 
                         style={{ filter: 'url(#glow)' }}
                         dot={{ r: 3.5, fill: '#18181b', stroke: '#c084fc', strokeWidth: 2 }}
                         activeDot={{ r: 5, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }}
                       />
                       
                       <Legend wrapperStyle={{ fontSize: '11px', color: '#a1a1aa', paddingTop: '15px' }} />
                     </RadarChart>
                   </ResponsiveContainer>
                 </div>
              </div>

              {/* Sub-Category Breakdowns */}
              <div className="flex flex-col gap-3">
                 {metrics.categories.map((cat: any) => (
                   // @ts-ignore
                   <CategoryAccordion key={cat.id} category={cat} />
                 ))}
              </div>

              {/* General ATS Feedback Panel */}
              <div className="bg-zinc-900/60 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
                 <div className="p-5 border-b border-white/5 flex items-center gap-3 bg-red-500/5">
                   <div className="p-1.5 bg-red-500/20 text-red-500 rounded">
                      <AlertOctagon size={18} />
                   </div>
                   <h3 className="font-medium text-white">{metrics.atsFeedback.title}</h3>
                 </div>
                 
                 <div className="p-5">
                   <p className="text-sm text-zinc-400 mb-6">{metrics.atsFeedback.description}</p>
                   
                   <div className="flex flex-col gap-4">
                     {metrics.atsFeedback.issues.map((issue: any, idx: number) => (
                       <div key={idx} className="flex gap-3 items-start">
                         <div className="mt-0.5">
                           {issue.type === 'error' && <XOctagon size={14} className="text-red-500" />}
                           {issue.type === 'warning' && <AlertTriangle size={14} className="text-amber-500" />}
                           {issue.type === 'success' && <CheckCircle2 size={14} className="text-emerald-500" />}
                           {issue.type === 'info' && <Lightbulb size={14} className="text-blue-500" />}
                         </div>
                         <p className="text-sm text-zinc-300 leading-relaxed">{issue.text}</p>
                       </div>
                     ))}
                   </div>
                 </div>
              </div>

            </div>
          ) : null}
        </div>

      </div>

      {/* RENDER MODAL OVERLAYS IN PORTALS */}
      {activeModal === 'schedule' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-950 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl relative">
            <InterviewSchedulingView 
              candidate={candidate} 
              onBack={() => setActiveModal('none')} 
              isPopup={true} 
            />
          </div>
        </div>,
        document.body
      )}

      {activeModal === 'reject' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-950 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl relative">
            <AutomatedRejectionView 
              candidate={candidate} 
              onBack={() => setActiveModal('none')} 
              isPopup={true} 
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function TsangDaXinResumeContent() {
  return (
    <div className="flex flex-col text-[#1a1a1a]">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold font-serif mb-2">TSANG DA XIN</h1>
        <p className="text-sm font-sans text-zinc-700">
          +60-10-935-1655 | owentsangdaxin@gmail.com | https://github.com/TsangDaXin | LinkedIn
        </p>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-center border-b border-black pb-1 mb-3">Description</h2>
        <p className="text-sm leading-relaxed text-justify">
          I am currently a Year 2, Semester 2 student at <strong>Asia Pacific University (APU)</strong>, pursuing a <strong>Bachelor's degree in Data Analytics</strong>. I am actively seeking a <strong>4-month internship</strong> opportunity from <strong>July to November</strong> in roles related to <strong>data analytics, data science, or IT</strong>. My academic background has equipped me with strong analytical and technical skills, and I am eager to gain hands-on industry experience to apply and further develop my knowledge in real-world projects.
        </p>
      </div>

      {/* Education */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-center border-b border-black pb-1 mb-3">Education</h2>
        
        <div className="mb-4">
          <div className="flex justify-between font-bold text-sm mb-1">
            <span>Asia Pacific University</span>
            <span className="font-normal">September 2022 - Present</span>
          </div>
          <div className="flex justify-between items-start text-sm">
            <span>Bachelor Degree - Computer Science with a specialism in data analytics | CGPA: 3.61</span>
          </div>
          <div className="flex justify-between items-start text-sm mt-1">
            <span>Foundation Program – Computer Technology | CGPA: 3.81</span>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between font-bold text-sm mb-1">
            <span>OXBURGH INTERNATIONAL SCHOOL</span>
            <span className="font-normal">September 2018 - June 2022</span>
          </div>
          <p className="text-sm">International General Certificate of Secondary Education (IGCSE) | Achieved 9 A's</p>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-center border-b border-black pb-1 mb-3">Technical Skills</h2>
         <ul className="list-disc pl-5 text-sm space-y-1.5 ">
           <li><strong>Languages:</strong> Python, SQL, R programming, Power BI, Tableau, Java, C++, C programming, Html/CSS, Javascript, React, SAS</li>
           <li><strong>Developer tools:</strong> VS code, Eclipse, Apache Netbeans, Git, React.js</li>
         </ul>
      </div>

      {/* Projects */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-center border-b border-black pb-1 mb-3">Projects</h2>
        
        <div className="mb-4">
          <div className="flex justify-between font-bold text-sm mb-2">
            <span>Google Data Analytics Capstone project | R Program</span>
            <span className="font-normal">July 2022</span>
          </div>
          <ul className="list-disc pl-5 text-sm space-y-1.5">
            <li>Analyze data trends to discover differences in Cyclistic bike usage between annual members and casual riders.</li>
            <li>Processed and cleaned <strong>10,000+</strong> rows of raw data using <strong>R</strong> , reducing inconsistencies by <strong>95%</strong></li>
          </ul>
        </div>

        <div className="mb-4">
          <div className="flex justify-between font-bold text-sm mb-2">
            <span>Credit risk classification | R Program</span>
            <span className="font-normal">September 2024 - December 2024</span>
          </div>
          <ul className="list-disc pl-5 text-sm space-y-1.5">
            <li>Identify patterns and relationships in the data to classify credit risk effectively and provide insights into key factors influencing creditworthiness.</li>
            <li>Conducted data preprocessing, including handling anomalies values (<strong>1026 duplicated</strong> rows and more than <strong>20% missing values</strong> imputed using <strong>MICE and KNN</strong>).</li>
            <li>Tested various hypotheses using <strong>machine learning models</strong> and <strong>statistical techniques</strong> to ensure robustness and reliability.</li>
          </ul>
        </div>

        <div className="mb-4">
          <div className="flex justify-between font-bold text-sm mb-2">
            <span>AI-Based Human Face Recognition & Attendance Tracker</span>
            <span className="font-normal">April 2025</span>
          </div>
          <ul className="list-disc pl-5 text-sm space-y-1.5">
            <li>Tools: Python · YOLOv8 · Streamlit · Google Colab · Roboflow · OpenCV · Pandas</li>
            <li>Developed and deployed a real-time face recognition and attendance tracking application using the YOLOv8 object detection model and Streamlit for the user interface.</li>
          </ul>
        </div>
      </div>

      {/* Hackathons */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-center border-b border-black pb-1 mb-3">Hackathons</h2>
        
        <div className="mb-3">
          <div className="flex justify-between font-bold text-sm mb-1">
            <span>UM Hackathon 2025 - Intelligent Business Assistant for Grab Merchant Partners</span>
            <span className="font-normal">April 2025</span>
          </div>
          <ul className="list-disc pl-5 text-sm">
            <li>Tools: Figma · Excel · Google Sheets · Tableau</li>
            <li>Developed a comprehensive AI-driven platform to empower Grab merchant partners with real-time business insights, intelligent decision support, and multilingual accessibility.</li>
          </ul>
        </div>

        <div className="mb-3">
          <div className="flex justify-between font-bold text-sm mb-1">
            <span>ETH Uprising Hackathon - Blockchain NFT market platform</span>
            <span className="font-normal">March 2025</span>
          </div>
          <ul className="list-disc pl-5 text-sm">
            <li>Tools: Solidity · Hardhat · Scaffold-ETH · Web3.js . MetaMask · Scroll · ERC-721</li>
            <li>Developed MetaMart, a secure and scalable NFT minting platform designed to empower digital artists and collectors to create, manage, and trade NFTs on the Ethereum blockchain.</li>
          </ul>
        </div>

        <div className="mb-3">
          <div className="flex justify-between font-bold text-sm mb-1">
            <span>Verasity Hackathon 2025 - Bestes Diabetes Management System</span>
            <span className="font-normal">March 2025</span>
          </div>
          <ul className="list-disc pl-5 text-sm">
            <li>Tools: OpenAI API · React · JavaScript · HTML · CSS</li>
            <li>Developed Bestes, a smart, accessible web-based platform designed to support individuals in managing diabetes through personalized insights...</li>
          </ul>
        </div>
      </div>
      
      {/* Leadership & Work */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-center border-b border-black pb-1 mb-3">Leadership & Work Experience</h2>
        
        <div className="mb-4">
          <div className="flex justify-between font-bold text-sm mb-2">
            <span>APU Artificial Intelligence Club - Head of Marketing and Design</span>
            <span className="font-normal">March 2025 - Present</span>
          </div>
          <ul className="list-disc pl-5 text-sm space-y-1.5">
            <li><strong>Creative Leadership:</strong> Directed a team of designers to create visually appealing posters, social media content, event branding...</li>
            <li><strong>Marketing Campaigns:</strong> Designed and executed promotional strategies...</li>
          </ul>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between font-bold text-sm mb-2">
            <span>Online video freelancer</span>
            <span className="font-normal">November 2024 - Present</span>
          </div>
          <ul className="list-disc pl-5 text-sm space-y-1.5">
            <li>Designed dynamic motion graphics and visual effects using Adobe After Effects and Blender...</li>
            <li>Edited, color-graded, and optimized videos in Premiere Pro and DaVinci Resolve...</li>
          </ul>
        </div>
      </div>
      
      {/* Certifications */}
      <div className="mb-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-center border-b border-black pb-1 mb-3">Certificates</h2>
         <ul className="list-disc pl-5 text-sm space-y-1.5">
           <li><strong>Google Data Analytics Professional Certificate</strong> (July 2024 - September 2024)</li>
           <li><strong>FreeCodeCamp’s Learn HTML & CSS</strong> (June 2024 - July 2024)</li>
           <li><strong>Microsoft Power BI Data Analyst</strong> (February 2025 - April 2025)</li>
         </ul>
      </div>

    </div>
  );
}

function FallbackResumeContent({ candidate }: { candidate: any }) {
  const isUnknown = candidate.name.split(' ')[0].toLowerCase() === 'unknown';
  const emailPrefix = isUnknown ? 'candidate.42' : candidate.name.split(' ')[0].toLowerCase();
  
  return (
    <>
      <div className="border-b-2 border-zinc-900 pb-4 mb-6">
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-2">{candidate.name}</h1>
        <p className="text-center text-xs md:text-sm font-sans text-zinc-600">
          San Francisco, CA • {emailPrefix}@example.com • (555) 123-4567
        </p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-md md:text-lg font-bold uppercase tracking-wider mb-2 text-zinc-800">Professional Summary</h2>
        <p className="text-xs md:text-sm leading-relaxed text-zinc-700">
          Results-driven {candidate.role} with 5+ years of experience in developing scalable architectures and leading cross-functional teams. Proven track record of improving system performance and delivering high-impact projects ahead of schedule.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-md md:text-lg font-bold uppercase tracking-wider mb-2 text-zinc-800">Experience</h2>
        <div className="mb-4">
          <div className="flex justify-between font-bold text-zinc-800 text-xs md:text-sm mb-1">
            <span>Senior {candidate.role} • TechFlow Inc.</span>
            <span>2022 - Present</span>
          </div>
          <ul className="list-disc pl-5 text-xs md:text-sm text-zinc-700 space-y-1">
            <li>Spearheaded the migration to a microservices architecture, reducing latency by 40%.</li>
            <li>Mentored a team of 4 junior developers, increasing sprint velocity by 25%.</li>
            <li>Designed and implemented the core RESTful APIs utilized by over 100k daily active users.</li>
          </ul>
        </div>
        <div className="mb-4">
          <div className="flex justify-between font-bold text-zinc-800 text-xs md:text-sm mb-1">
            <span>{candidate.role} • Digital Solutions</span>
            <span>2019 - 2022</span>
          </div>
          <ul className="list-disc pl-5 text-xs md:text-sm text-zinc-700 space-y-1">
            <li>Developed complex frontend features using React and Redux.</li>
            <li>Collaborated tightly with design teams to ensure pixel-perfect implementations.</li>
          </ul>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-md md:text-lg font-bold uppercase tracking-wider mb-2 text-zinc-800">Skills</h2>
        <p className="text-xs md:text-sm leading-relaxed text-zinc-700">
          <strong>Languages:</strong> JavaScript, TypeScript, Python, SQL<br/>
          <strong>Frameworks:</strong> React, Node.js, Express, Tailwind CSS<br/>
          <strong>Tools:</strong> Git, Docker, AWS, CI/CD Pipeline
        </p>
      </div>
    </>
  );
}
function CategoryAccordion({ category }: { category: any }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (score >= 60) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
  };

  const getLabelColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getLabelText = (score: number) => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Needs Work';
    return 'Critical';
  };

  return (
    <div className="bg-zinc-900/60 border border-white/5 rounded-xl overflow-hidden transition-colors hover:border-white/10">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 focus:outline-none"
      >
        <div className="flex items-center gap-4">
          <h4 className="text-base font-medium text-zinc-200">{category.title}</h4>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${getLabelColor(category.score)}`}>
            {getLabelText(category.score)}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
           <div className={`px-2 py-0.5 rounded text-xs font-mono font-medium border ${getScoreColor(category.score)}`}>
             {category.score}/100
           </div>
           {isOpen ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-zinc-950/30"
          >
            <div className="p-5 border-t border-white/5 text-sm leading-relaxed text-zinc-400">
               {category.feedback}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
