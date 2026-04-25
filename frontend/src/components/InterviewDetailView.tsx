import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Share, Download, MoreHorizontal, Play, Pause, Volume2, Search, RotateCcw, RotateCw, Video, MessageSquareHeart, GitMerge, Activity, Cpu, CheckCircle2 } from 'lucide-react';
import { Area, AreaChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

export default function InterviewDetailView({ candidate, onBack, onIssueOffer }: { candidate: any; onBack: () => void; onIssueOffer?: () => void }) {
  const [activeTab, setActiveTab] = useState<'Recap' | 'Transcript' | 'Ask GLM' | 'Evaluate'>('Recap');
  const [activeSpeakerSection, setActiveSpeakerSection] = useState<'Speakers' | 'AI Filters' | 'Topics'>('Speakers');
  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const [currentTime, setCurrentTime] = useState(0);

  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url: string | null) => {
    if (!url) return 'https://www.youtube.com/embed/V9bB0tBwtR4?enablejsapi=1&modestbranding=1&rel=0';

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : '';

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?start=1345&enablejsapi=1&modestbranding=1&rel=0`;
    }
    return 'https://www.youtube.com/embed/V9bB0tBwtR4?enablejsapi=1&modestbranding=1&rel=0';
  };

  const playVideo = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({ event: 'command', func: 'playVideo' }, '*');
      setIsPlaying(true);
    }
  };

  const pauseVideo = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({ event: 'command', func: 'pauseVideo' }, '*');
      setIsPlaying(false);
    }
  };

  const seekVideo = (seconds: number) => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({ event: 'command', func: 'seekTo', args: [seconds] }, '*');
    }
  };

  const skipBackward = () => {
    seekVideo(currentTime - 10);
    setCurrentTime(Math.max(0, currentTime - 10));
  };

  const skipForward = () => {
    seekVideo(currentTime + 10);
    setCurrentTime(currentTime + 10);
  };

  const handleTimelineClick = (percentage: number) => {
    const totalSeconds = 3588; // 59:48
    const seekTo = (percentage / 100) * totalSeconds;
    seekVideo(seekTo);
    setCurrentTime(seekTo);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col w-full max-w-7xl mx-auto"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6 shrink-0 bg-zinc-900/40 p-4 rounded-xl border border-white/5">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-zinc-100">{candidate.name || 'Candidate'} - Interview Sync</h1>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {candidate.role || 'Role'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 flex items-center gap-2 mt-1">
              <span>📅 {candidate.date || 'Oct 29, 2026'}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span>🕒 3:00 PM - 4:00 PM (60m)</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">
            <Share size={14} />
            Share
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors">
            <Download size={14} />
            Export
          </button>
          <button className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Column: Tabs Content */}
        <div className={`w-full ${activeTab === 'Evaluate' ? 'lg:w-full' : 'lg:w-[45%]'} flex flex-col bg-zinc-900/60 rounded-2xl border border-white/5 overflow-hidden transition-all duration-300`}>
          {/* Tabs */}
          <div className="bg-zinc-950/80 p-2 shrink-0 border-b border-white/5">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
              <button 
                onClick={() => setActiveTab('Recap')}
                className={`flex justify-center items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'Recap' ? 'bg-blue-600/20 text-blue-400' : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'}`}
              >
                <Video size={16} className="shrink-0" />
                <span className="truncate">Recap</span>
              </button>
              <button 
                onClick={() => setActiveTab('Transcript')}
                className={`flex justify-center items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'Transcript' ? 'bg-blue-600/20 text-blue-400' : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'}`}
              >
                <MessageSquareHeart size={16} className="shrink-0" />
                <span className="truncate">Transcript</span>
              </button>
              <button 
                onClick={() => setActiveTab('Ask GLM')}
                className={`flex justify-center items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'Ask GLM' ? 'bg-blue-600/20 text-blue-400' : 'bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'}`}
              >
                <span className="text-lg leading-none shrink-0">✨</span>
                <span className="truncate">Ask GLM</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('Evaluate')}
                className={`flex justify-center items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'Evaluate' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:border-emerald-500/30 border border-transparent'}`}
              >
                <GitMerge size={16} className="shrink-0" />
                <span className="truncate">Final Decision</span>
              </button>
            </div>
          </div>

          {/* Dynamic Content */}
          <div className="p-6 overflow-y-auto min-h-[500px]">
            {activeTab === 'Recap' && <RecapContent />}
            {activeTab === 'Transcript' && <TranscriptContent />}
            {activeTab === 'Ask GLM' && <AskGLMContent candidate={candidate} />}
            {activeTab === 'Evaluate' && <DecisionMergeContent onIssueOffer={onIssueOffer} />}
          </div>
        </div>

        {/* Right Column: Player & Stats */}
        {activeTab !== 'Evaluate' && (
          <div className="w-full lg:w-[55%] flex flex-col gap-4 sticky top-0 transition-all duration-300">
             {/* Video Player */}
           <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/5 relative shrink-0">
             <div className="aspect-video relative group">
                {/* Placeholder Video Source */}
                <iframe
                   ref={iframeRef}
                   className="w-full h-full"
                   src={getYouTubeEmbedUrl(candidate?.recordingUrl)}
                   title="Interview Playback"
                   frameBorder="0"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                   allowFullScreen
                />
             </div>
             {/* Custom Overlay Timeline (Decorative) */}
             <div className="bg-zinc-950 p-4 border-t border-white/10">
                <div
                  className="h-2 w-full bg-zinc-800 rounded-full mb-3 flex overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percentage = ((e.clientX - rect.left) / rect.width) * 100;
                    handleTimelineClick(percentage);
                  }}
                >
                   <div className="w-[10%] bg-blue-500 h-full border-r border-black hover:bg-blue-600 transition-colors" title="Intro: 0:00 - 5:58" />
                   <div className="w-[25%] bg-emerald-500 h-full border-r border-black hover:bg-emerald-600 transition-colors" title="Tech Screen: 5:58 - 20:48" />
                   <div className="w-[40%] bg-amber-500 h-full border-r border-black hover:bg-amber-600 transition-colors" title="System Design: 20:48 - 44:28" />
                   <div className="w-[15%] bg-purple-500 h-full border-r border-black hover:bg-purple-600 transition-colors" title="Behavioral: 44:28 - 53:28" />
                   <div className="w-[10%] bg-rose-500 h-full hover:bg-rose-600 transition-colors" title="Q&A: 53:28 - 59:48" />
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}</span>
                  <div className="flex items-center gap-4">
                     <button
                       onClick={skipBackward}
                       className="hover:text-white transition-colors hover:bg-white/5 p-2 rounded"
                       title="Skip backward 10s"
                     >
                       <RotateCcw size={16} />
                     </button>
                     <button
                       onClick={() => isPlaying ? pauseVideo() : playVideo()}
                       className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 transition-colors"
                       title={isPlaying ? "Pause" : "Play"}
                     >
                       {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-1" />}
                     </button>
                     <button
                       onClick={skipForward}
                       className="hover:text-white transition-colors hover:bg-white/5 p-2 rounded"
                       title="Skip forward 10s"
                     >
                       <RotateCw size={16} />
                     </button>
                  </div>
                  <span>59:48</span>
                </div>
             </div>
           </div>

           {/* Speakers & Stats */}
           <div className="bg-zinc-900/60 rounded-2xl p-6 border border-white/5">
             <div className="flex gap-6 border-b border-white/5 pb-4 mb-4">
               <button
                 onClick={() => setActiveSpeakerSection('Speakers')}
                 className={`text-sm font-semibold pb-2 -mb-[18px] border-b-2 transition-colors ${
                   activeSpeakerSection === 'Speakers'
                     ? 'text-blue-400 border-blue-500'
                     : 'text-zinc-400 border-transparent hover:text-zinc-200'
                 }`}
               >
                 Speakers
               </button>
               <button
                 onClick={() => setActiveSpeakerSection('AI Filters')}
                 className={`text-sm font-semibold pb-2 -mb-[18px] border-b-2 transition-colors ${
                   activeSpeakerSection === 'AI Filters'
                     ? 'text-blue-400 border-blue-500'
                     : 'text-zinc-400 border-transparent hover:text-zinc-200'
                 }`}
               >
                 AI Filters
               </button>
               <button
                 onClick={() => setActiveSpeakerSection('Topics')}
                 className={`text-sm font-semibold pb-2 -mb-[18px] border-b-2 transition-colors ${
                   activeSpeakerSection === 'Topics'
                     ? 'text-blue-400 border-blue-500'
                     : 'text-zinc-400 border-transparent hover:text-zinc-200'
                 }`}
               >
                 Topics
               </button>
             </div>

             <AnimatePresence mode="wait">
               {activeSpeakerSection === 'Speakers' && (
                 <motion.div
                   key="speakers"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.2 }}
                 >
                   <SpeakersContent candidate={candidate} />
                 </motion.div>
               )}
               {activeSpeakerSection === 'AI Filters' && (
                 <motion.div
                   key="filters"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.2 }}
                 >
                   <AIFiltersContent candidate={candidate} />
                 </motion.div>
               )}
               {activeSpeakerSection === 'Topics' && (
                 <motion.div
                   key="topics"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.2 }}
                 >
                   <TopicsContent candidate={candidate} onSeekVideo={seekVideo} />
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ----------------------------------------------------
// Sub-components
// ----------------------------------------------------

function DecisionMergeContent({ onIssueOffer }: { onIssueOffer?: () => void }) {
  const [phase, setPhase] = useState<'input' | 'processing' | 'result' | 'action_offer' | 'action_schedule' | 'action_reject'>('input');
  const [confidenceScore, setConfidenceScore] = useState<number>(8);
  const [bodyLanguageScore, setBodyLanguageScore] = useState<number>(7);

  if (phase === 'processing') {
    return <DecisionProcessingAnimation onComplete={() => setPhase('result')} />;
  }

  if (phase === 'result') {
    return <FinalDecisionResult 
      onBack={() => setPhase('input')} 
      onAction={(action) => {
        if (action === 'offer' && onIssueOffer) {
          onIssueOffer();
        } else {
          setPhase(`action_${action}` as any);
        }
      }} 
    />;
  }

  if (phase === 'action_offer') return <ActionOffer onBack={() => setPhase('result')} />;
  if (phase === 'action_schedule') return <ActionSchedule onBack={() => setPhase('result')} />;
  if (phase === 'action_reject') return <ActionReject onBack={() => setPhase('result')} />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col h-full relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-24">
         {/* LEFT SIDE - AI ANALYSIS */}
         <div className="bg-zinc-950/80 rounded-2xl border border-purple-500/20 p-6 flex flex-col shadow-[0_0_30px_rgba(168,85,247,0.05)] relative overflow-hidden h-fit">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-blue-600" />
            <h3 className="flex items-center gap-2 text-sm font-semibold text-purple-400 mb-6">
               <span className="text-lg">🤖</span> AI Transcript Analysis
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                 <span className="text-zinc-400">Technical Indicators</span>
                 <span className="font-mono font-semibold text-zinc-100">8.5 / 10</span>
              </div>
              <div className="flex justify-between items-center text-sm bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                 <span className="text-zinc-400">Communication Indicators</span>
                 <span className="font-mono font-semibold text-zinc-100">7.0 / 10</span>
              </div>
              <div className="flex justify-between items-center text-sm bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                 <span className="text-zinc-400">Behavioral Signals</span>
                 <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold tracking-wide text-xs">Positive Outlook</span>
              </div>
              <div className="flex justify-between items-center text-sm bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                 <span className="text-zinc-400">Inconsistencies</span>
                 <span className="text-amber-400 font-semibold text-xs bg-amber-500/10 px-3 py-1 rounded border border-amber-500/20">Minor Resume Gap</span>
              </div>
              <div className="flex justify-between items-center text-sm bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                 <span className="text-zinc-400">Confidence Level</span>
                 <span className="px-3 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold tracking-wide text-xs">High (0.88)</span>
              </div>
            </div>

            <div className="bg-zinc-900/50 rounded-xl p-5 border border-white/5 mt-auto">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">AI Summary</h4>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Candidate shows strong problem-solving ability and effectively communicated trade-offs during system design. Minor inconsistencies in explaining optimal database choices, but overall solid technical grounding.
              </p>
            </div>
         </div>

         {/* RIGHT SIDE - HUMAN JUDGE PANEL */}
         <div className="bg-zinc-950/80 rounded-2xl border border-blue-500/20 p-6 flex flex-col shadow-[0_0_30px_rgba(59,130,246,0.05)] relative overflow-hidden h-fit">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-cyan-600" />
            <h3 className="flex items-center gap-2 text-sm font-semibold text-blue-400 mb-6">
               <span className="text-lg">👤</span> Human Evaluation
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex flex-col gap-2">
                 <div className="flex justify-between items-center">
                   <span className="text-xs text-zinc-400 font-medium">Confidence Score</span>
                   <span className="text-xs font-mono text-blue-400 font-semibold">{confidenceScore} / 10</span>
                 </div>
                 <input 
                   type="range" 
                   min="1" 
                   max="10" 
                   value={confidenceScore} 
                   onChange={(e) => setConfidenceScore(Number(e.target.value))}
                   className="w-full accent-blue-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer" 
                 />
                 <div className="flex justify-between text-[10px] text-zinc-500 font-mono"><span>1</span><span>10</span></div>
              </div>
              
              <div className="flex flex-col gap-2">
                 <div className="flex justify-between items-center">
                   <span className="text-xs text-zinc-400 font-medium">Body Language Score</span>
                   <span className="text-xs font-mono text-blue-400 font-semibold">{bodyLanguageScore} / 10</span>
                 </div>
                 <input 
                   type="range" 
                   min="1" 
                   max="10" 
                   value={bodyLanguageScore} 
                   onChange={(e) => setBodyLanguageScore(Number(e.target.value))}
                   className="w-full accent-blue-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer" 
                 />
                 <div className="flex justify-between text-[10px] text-zinc-500 font-mono"><span>1</span><span>10</span></div>
              </div>

              <div className="flex flex-col gap-2">
                 <span className="text-xs text-zinc-400 font-medium">Communication Perception</span>
                 <select className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2.5 text-zinc-200 text-sm outline-none focus:border-blue-500 transition-colors">
                   <option>Clear and Articulate</option>
                   <option>Somewhat Clear</option>
                   <option>Rambling / Unclear</option>
                 </select>
              </div>

              <div className="flex flex-col gap-2">
                 <span className="text-xs text-zinc-400 font-medium">Cultural Fit</span>
                 <select className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2.5 text-zinc-200 text-sm outline-none focus:border-blue-500 transition-colors">
                   <option>Strong Fit</option>
                   <option>Moderate Fit</option>
                   <option>Weak Fit</option>
                 </select>
              </div>
            </div>

            <div className="mt-auto">
              <span className="text-xs text-zinc-400 font-medium mb-2 block">Summary Notes</span>
              <textarea 
                placeholder="Add your overall impression and notes here..."
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-sm text-zinc-200 outline-none focus:border-blue-500/50 transition-colors resize-none min-h-[100px] scrollbar-thin"
              />
            </div>
         </div>
      </div>
      
      {/* Absolute floating action area */}
      <div className="sticky bottom-0 mt-auto left-0 w-full flex justify-end items-center bg-zinc-950 px-2 py-4 border-t border-white/5 z-10 shadow-[0_-20px_40px_rgba(0,0,0,0.8)]">
         <button 
           onClick={() => setPhase('processing')}
           className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.3)] shadow-blue-500/20"
         >
           <span>Run Synthesis & Finalize Evaluation</span>
           <GitMerge size={18} />
         </button>
      </div>
    </div>
  )
}

function DecisionProcessingAnimation({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: <Cpu className="text-purple-400" size={32} />, text: "Extracting structured AI signals..." },
    { icon: <GitMerge className="text-blue-400" size={32} />, text: "Aligning human evaluator feedback..." },
    { icon: <Activity className="text-emerald-400" size={32} />, text: "Computing consensus metrics..." },
    { icon: <CheckCircle2 className="text-emerald-300" size={32} />, text: "Finalizing recommendation array..." }
  ];

  useEffect(() => {
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setStep(currentStep);
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-[500px] animate-in fade-in zoom-in-95 duration-500 relative">
      <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="relative w-40 h-40 flex items-center justify-center mb-8">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute inset-0 rounded-full border-t-2 border-purple-500/50 border-r-2 border-transparent"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
          className="absolute inset-2 rounded-full border-b-2 border-blue-500/50 border-l-2 border-transparent"
        />
        <motion.div 
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="bg-zinc-900/80 p-5 rounded-full border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.2)]"
        >
           <AnimatePresence mode="wait">
             <motion.div
               key={step}
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.8 }}
               transition={{ duration: 0.3 }}
             >
               {steps[Math.min(step, steps.length - 1)].icon}
             </motion.div>
           </AnimatePresence>
        </motion.div>
      </div>

      <div className="h-8 relative w-full max-w-sm text-center overflow-hidden">
         <AnimatePresence mode="wait">
            <motion.div
               key={step}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.3 }}
               className="absolute inset-0 text-zinc-300 font-mono text-sm tracking-wide"
            >
               {steps[Math.min(step, steps.length - 1)].text}
            </motion.div>
         </AnimatePresence>
      </div>
      
      <div className="mt-8 w-64 h-1 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
          initial={{ width: "0%" }}
          animate={{ width: `${(Math.min(step + 1, steps.length) / steps.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

function FinalDecisionResult({ onBack, onAction }: { onBack: () => void, onAction: (action: string) => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col h-full py-8">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-zinc-500 font-mono text-sm tracking-widest uppercase mb-2 flex items-center gap-2">
            <GitMerge size={16} /> Final Consolidation Complete
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Evaluate & Proceed</h2>
        </div>
        <button 
          onClick={onBack}
          className="text-zinc-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg"
        >
          <RotateCcw size={14} /> Re-evaluate
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Summary & Reasoning */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
             <div className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Synthesis Reasoning</div>
             <p className="text-zinc-300 leading-relaxed bg-black/20 p-5 rounded-xl border border-white/5">
               Strong technical performance and exceptional cultural fit. Both AI structurer and Human Evaluator align on the candidate's clear communication proficiency and deep comprehension of system design trade-offs. Minor resume gaps fully mitigated by technical screening.
             </p>

             <div className="grid grid-cols-2 gap-4 mt-6">
               <div className="bg-emerald-500/10 rounded-xl p-5 border border-emerald-500/20">
                  <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                    <Cpu size={14} className="text-purple-400" /> AI Recommendation
                  </div>
                  <div className="text-emerald-400 font-bold text-lg">Strong Hire</div>
               </div>
               <div className="bg-blue-500/10 rounded-xl p-5 border border-blue-500/20">
                  <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                    <Activity size={14} className="text-blue-400" /> Human Recommendation
                  </div>
                  <div className="text-blue-400 font-bold text-lg">Hire</div>
               </div>
             </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="space-y-6">
          <div className="bg-zinc-950/80 rounded-2xl p-6 border border-emerald-500/30 relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.05)]">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
            
            <div className="text-center mb-8 mt-2">
              <div className="text-sm text-zinc-500 uppercase tracking-wider font-semibold mb-2">Consensus Outcome</div>
              <div className="text-3xl font-black text-white px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 inline-block">
                Offer Stage
              </div>
            </div>
            
            <div className="space-y-3 mb-8">
               <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
                 <span className="text-sm text-zinc-400">Target Level</span>
                 <span className="text-sm font-semibold text-zinc-200">L4</span>
               </div>
               <div className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
                 <span className="text-sm text-zinc-400">Confidence Match</span>
                 <span className="text-sm font-mono text-blue-400">0.78</span>
               </div>
            </div>

            <div className="flex flex-col gap-3">
               <button 
                 onClick={() => onAction('offer')}
                 className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                 Issue Offer Letter
               </button>
               <button 
                 onClick={() => onAction('schedule')}
                 className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-3 rounded-xl transition-colors border border-white/5">
                 Schedule Additional Round
               </button>
               <button 
                 onClick={() => onAction('reject')}
                 className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold py-3 rounded-xl transition-colors border border-rose-500/20 mt-4">
                 Reject Candidate
               </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function ActionOffer({ onBack }: { onBack: () => void }) {
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="animate-in fade-in zoom-in h-[400px] flex flex-col items-center justify-center">
         <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-full mb-6">
           <CheckCircle2 size={32} />
         </div>
         <h3 className="text-2xl font-bold text-white mb-2">Offer Generated & Sent</h3>
         <p className="text-zinc-400">The candidate will receive the offer letter via email shortly.</p>
         <button onClick={onBack} className="mt-8 text-blue-400 hover:text-blue-300">Return to Summary</button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 py-8 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="text-zinc-400 hover:text-white transition-colors bg-white/5 p-2 rounded-lg">
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-2xl font-bold text-white">Issue Offer Letter</h2>
      </div>

      <div className="bg-zinc-900/80 rounded-2xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)] p-6 mb-6">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-6">Offer Details</h3>
        <div className="space-y-5">
           <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-2">
               <label className="text-xs text-zinc-500 font-medium">Base Salary (USD)</label>
               <input type="text" defaultValue="$145,000" className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 outline-none focus:border-emerald-500/50" />
             </div>
             <div className="flex flex-col gap-2">
               <label className="text-xs text-zinc-500 font-medium">Equity (Options / RSUs)</label>
               <input type="text" defaultValue="2,500 RSUs" className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 outline-none focus:border-emerald-500/50" />
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-2">
               <label className="text-xs text-zinc-500 font-medium">Expected Start Date</label>
               <input type="date" className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 outline-none focus:border-emerald-500/50 [color-scheme:dark]" />
             </div>
             <div className="flex flex-col gap-2">
               <label className="text-xs text-zinc-500 font-medium">Offer Expiration Date</label>
               <input type="date" className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 outline-none focus:border-emerald-500/50 [color-scheme:dark]" />
             </div>
           </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onBack} className="px-6 py-3 rounded-xl font-semibold text-zinc-400 hover:text-white transition-colors">Cancel</button>
        <button 
          onClick={() => {
            setGenerating(true);
            setTimeout(() => { setGenerating(false); setDone(true); }, 2000);
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          disabled={generating}
        >
          {generating ? <RotateCw className="animate-spin" size={18} /> : <Download size={18} />}
          {generating ? "Generating PDF & Sending..." : "Generate PDF & Send Email"}
        </button>
      </div>
    </div>
  );
}

function ActionSchedule({ onBack }: { onBack: () => void }) {
  const [scheduled, setScheduled] = useState(false);

  if (scheduled) {
    return (
      <div className="animate-in fade-in zoom-in h-[400px] flex flex-col items-center justify-center">
         <div className="w-16 h-16 bg-blue-500/20 text-blue-400 flex items-center justify-center rounded-full mb-6">
           <CheckCircle2 size={32} />
         </div>
         <h3 className="text-2xl font-bold text-white mb-2">Round Scheduled</h3>
         <p className="text-zinc-400">The candidate has been notified of the next steps.</p>
         <button onClick={onBack} className="mt-8 text-blue-400 hover:text-blue-300">Return to Summary</button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 py-8 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="text-zinc-400 hover:text-white transition-colors bg-white/5 p-2 rounded-lg">
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-2xl font-bold text-white">Schedule Additional Round</h2>
      </div>

      <div className="bg-zinc-900/80 rounded-2xl border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.05)] p-6 mb-6">
        <div className="space-y-5">
           <div className="flex flex-col gap-2">
             <label className="text-xs text-zinc-500 font-medium">Interview Type</label>
             <select className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 outline-none focus:border-blue-500/50">
               <option>System Design Deep Dive</option>
               <option>Behavioral & Culture Fit</option>
               <option>Cross-functional Pair Programming</option>
             </select>
           </div>
           
           <div className="flex flex-col gap-2">
             <label className="text-xs text-zinc-500 font-medium">Interviewer</label>
             <select className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 outline-none focus:border-blue-500/50">
               <option>Sarah Chen (VP Engineering)</option>
               <option>Marcus Dubois (Principal Architect)</option>
               <option>Jessica Lin (Product Manager)</option>
             </select>
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-2">
               <label className="text-xs text-zinc-500 font-medium">Date</label>
               <input type="date" className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 outline-none focus:border-blue-500/50 [color-scheme:dark]" />
             </div>
             <div className="flex flex-col gap-2">
               <label className="text-xs text-zinc-500 font-medium">Time Slot (Duration)</label>
               <select className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-200 outline-none focus:border-blue-500/50">
                 <option>10:00 AM - 11:00 AM (1 Hr)</option>
                 <option>1:00 PM - 2:00 PM (1 Hr)</option>
                 <option>3:30 PM - 4:15 PM (45 Mins)</option>
               </select>
             </div>
           </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onBack} className="px-6 py-3 rounded-xl font-semibold text-zinc-400 hover:text-white transition-colors">Cancel</button>
        <button 
          onClick={() => setScheduled(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        >
          Send Invite
        </button>
      </div>
    </div>
  );
}

function ActionReject({ onBack }: { onBack: () => void }) {
  const [template, setTemplate] = useState('generic');
  const [sent, setSent] = useState(false);

  const templates = {
    generic: "Hi [Candidate Name],\n\nThank you for taking the time to interview with us for the AI Engineer role. We were impressed by your background, but we have decided to move forward with other candidates whose experience better aligns with our current needs.\n\nWe wish you the best in your job search.\n\nBest,\nThe Recruiting Team",
    technical: "Hi [Candidate Name],\n\nThank you for interviewing with us for the AI Engineer position. While we appreciated learning about your experience, our team is looking for someone with deeper hands-on expertise in distributed systems right now.\n\nWe encourage you to apply again in the future as you continue to build your skillset.\n\nBest,\nThe Recruiting Team",
    culture: "Hi [Candidate Name],\n\nThank you for taking the time to speak with our team. We enjoyed our conversation, but after careful consideration, we feel there isn't a mutual alignment with the specific dynamic our team is building right now.\n\nThank you again for your time, and we wish you success in your future endeavors.\n\nBest,\nThe Recruiting Team",
  };

  if (sent) {
    return (
      <div className="animate-in fade-in zoom-in h-[400px] flex flex-col items-center justify-center">
         <div className="w-16 h-16 bg-rose-500/20 text-rose-400 flex items-center justify-center rounded-full mb-6">
           <CheckCircle2 size={32} />
         </div>
         <h3 className="text-2xl font-bold text-white mb-2">Rejection Sent</h3>
         <p className="text-zinc-400">The candidate has been notified.</p>
         <button onClick={onBack} className="mt-8 text-blue-400 hover:text-blue-300">Return to Summary</button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 py-8 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="text-zinc-400 hover:text-white transition-colors bg-white/5 p-2 rounded-lg">
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-2xl font-bold text-white">Disqualify Candidate</h2>
      </div>

      <div className="bg-zinc-900/80 rounded-2xl border border-rose-500/20 shadow-[0_0_30px_rgba(225,29,72,0.05)] p-6 mb-6">
        <div className="flex flex-col gap-4">
           <div className="flex flex-col gap-2">
             <label className="text-xs text-zinc-500 font-medium">Rejection Reason / Email Template</label>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
               <button onClick={() => setTemplate('generic')} className={`py-2 px-3 text-sm rounded-lg border transition-colors ${template === 'generic' ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' : 'bg-black/50 border-white/10 text-zinc-400 hover:bg-white/5'}`}>Generic</button>
               <button onClick={() => setTemplate('technical')} className={`py-2 px-3 text-sm rounded-lg border transition-colors ${template === 'technical' ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' : 'bg-black/50 border-white/10 text-zinc-400 hover:bg-white/5'}`}>Technical Shortfall</button>
               <button onClick={() => setTemplate('culture')} className={`py-2 px-3 text-sm rounded-lg border transition-colors ${template === 'culture' ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' : 'bg-black/50 border-white/10 text-zinc-400 hover:bg-white/5'}`}>Culture Mismatch</button>
             </div>
           </div>

           <div className="flex flex-col gap-2 mt-2">
             <label className="text-xs text-zinc-500 font-medium">Email Preview</label>
             <textarea 
               value={templates[template as keyof typeof templates]} 
               readOnly
               className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-sm text-zinc-300 outline-none focus:border-rose-500/50 min-h-[220px] resize-none"
             />
           </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onBack} className="px-6 py-3 rounded-xl font-semibold text-zinc-400 hover:text-white transition-colors">Cancel</button>
        <button 
          onClick={() => setSent(true)}
          className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(225,29,72,0.2)]"
        >
          Send Rejection Email
        </button>
      </div>
    </div>
  );
}

function SpeakersContent({ candidate }: { candidate: any }) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
      <div className="grid grid-cols-12 text-xs font-semibold text-zinc-500 mb-3 px-2">
        <div className="col-span-5">Participants (3)</div>
        <div className="col-span-2 text-right">WPM</div>
        <div className="col-span-2 text-right">Talk time</div>
        <div className="col-span-3 text-right">Talk %</div>
      </div>

      <div className="space-y-3">
        <SpeakerRow name="Sarah Jenkins" role="Lead Recruiter" wpm={182} time="28m" percent={47} color="bg-blue-500" />
        <SpeakerRow name="Michael Chen" role="Engineering Manager" wpm={194} time="15m" percent={25} color="bg-emerald-500" />
        <SpeakerRow name={candidate?.name || "Candidate"} role="Interviewee" wpm={172} time="16m" percent={28} color="bg-purple-500" />
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
        <div className="bg-zinc-950/50 rounded-lg p-4 border border-white/5">
          <div className="text-xs font-semibold text-zinc-400 mb-3">Engagement Summary</div>
          <div className="space-y-2 text-sm text-zinc-300">
            <div>✓ Lead Recruiter: Positive sentiment, excellent communication</div>
            <div>✓ Engineering Manager: Clear explanations, 2 interruptions for clarification</div>
            <div>✓ Candidate: Strong engagement, minor hesitation on system design</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIFiltersContent({ candidate }: { candidate: any }) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
      {/* Technical Proficiency */}
      <div className="bg-zinc-950/50 rounded-lg p-5 border border-blue-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-blue-400">Technical Proficiency</h3>
          <span className="text-lg font-bold text-blue-400">8.5 / 10</span>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400">System Design</span>
            <span className="text-zinc-300 font-mono">8.0</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: '80%' }} />
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400">Backend Architecture</span>
            <span className="text-zinc-300 font-mono">9.0</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: '90%' }} />
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400">API Design</span>
            <span className="text-zinc-300 font-mono">8.0</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: '80%' }} />
          </div>
        </div>
      </div>

      {/* Communication Quality */}
      <div className="bg-zinc-950/50 rounded-lg p-5 border border-emerald-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-emerald-400">Communication Quality</h3>
          <span className="text-lg font-bold text-emerald-400">7.0 / 10</span>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400">Clarity & Articulation</span>
            <span className="text-zinc-300 font-mono">7.5</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: '75%' }} />
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400">Example Explanation</span>
            <span className="text-zinc-300 font-mono">6.5</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: '65%' }} />
          </div>
        </div>
      </div>

      {/* Risk & Sentiment Analysis */}
      <div className="bg-zinc-950/50 rounded-lg p-5 border border-amber-500/20">
        <h3 className="text-sm font-semibold text-amber-400 mb-4">Risk & Sentiment Analysis</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Overall Confidence</span>
            <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">High (0.88)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Consistency</span>
            <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">Good</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Red Flags</span>
            <span className="px-3 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">Minor Resume Gap</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Interview Sentiment</span>
            <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">Positive</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopicsContent({ candidate, onSeekVideo }: { candidate: any; onSeekVideo: (time: number) => void }) {
  const topics = [
    {
      topic: "Intro",
      timeStart: 0,
      timeEnd: 358,
      timeDisplay: "0:00 - 5:58",
      sentiment: "Positive",
      performanceScore: 9,
      keyPoints: ["Warm introduction", "Clear expectations set", "Candidate comfortable"]
    },
    {
      topic: "Tech Screen",
      timeStart: 358,
      timeEnd: 1248,
      timeDisplay: "5:58 - 20:48",
      sentiment: "Positive",
      performanceScore: 8,
      keyPoints: ["Solid coding fundamentals", "Good problem-solving approach", "Minor edge case handling"]
    },
    {
      topic: "System Design",
      timeStart: 1248,
      timeEnd: 2668,
      timeDisplay: "20:48 - 44:28",
      sentiment: "Positive",
      performanceScore: 8,
      keyPoints: ["Correctly identified caching layer", "Good understanding of trade-offs", "Database optimization discussion"]
    },
    {
      topic: "Behavioral",
      timeStart: 2668,
      timeEnd: 3208,
      timeDisplay: "44:28 - 53:28",
      sentiment: "Positive",
      performanceScore: 7,
      keyPoints: ["Strong teamwork experience", "Leadership qualities evident", "Slight hesitation on conflict resolution"]
    },
    {
      topic: "Q&A",
      timeStart: 3208,
      timeEnd: 3588,
      timeDisplay: "53:28 - 59:48",
      sentiment: "Positive",
      performanceScore: 8,
      keyPoints: ["Thoughtful questions about role", "Interested in growth opportunities", "Good cultural fit signals"]
    }
  ];

  const sentimentColor = (sentiment: string) => {
    if (sentiment === "Positive") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (sentiment === "Neutral") return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  };

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
      {topics.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onSeekVideo(item.timeStart)}
          className="w-full text-left p-4 bg-zinc-950/50 rounded-lg border border-white/5 hover:border-blue-500/50 hover:bg-zinc-900/70 transition-all group cursor-pointer"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{item.topic}</h4>
              <p className="text-xs text-zinc-500 mt-1">{item.timeDisplay}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-semibold border ${sentimentColor(item.sentiment)}`}>
                {item.sentiment}
              </span>
              <span className="text-sm font-bold text-zinc-300">{item.performanceScore}/10</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${(item.performanceScore / 10) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-3 space-y-1">
            {item.keyPoints.map((point, pidx) => (
              <div key={pidx} className="text-xs text-zinc-400 flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>{point}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 text-xs text-blue-400 group-hover:text-blue-300 flex items-center gap-1 transition-colors">
            <Play size={12} />
            Click to seek to this section
          </div>
        </button>
      ))}
    </div>
  );
}

function SpeakerRow({ name, role, wpm, time, percent, color }: { name: string, role: string, wpm: number, time: string, percent: number, color: string }) {
  return (
    <div className="grid grid-cols-12 items-center bg-zinc-950/50 p-2 rounded-xl text-sm border border-white/5">
       <div className="col-span-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold shrink-0">{name.charAt(0)}</div>
          <div>
            <div className="font-semibold text-zinc-200">{name}</div>
            <div className="text-[10px] text-zinc-500">{role}</div>
          </div>
       </div>
       <div className="col-span-2 text-right text-zinc-400 font-mono">{wpm}</div>
       <div className="col-span-2 text-right text-zinc-400 font-mono">{time}</div>
       <div className="col-span-3 flex items-center gap-2 justify-end">
          <div className="text-zinc-300 font-mono w-8 text-right">{percent}%</div>
          <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
          </div>
       </div>
    </div>
  )
}

function RecapContent() {
  const radarData = [
    { subject: 'Professionalism', A: 90, fullMark: 100 },
    { subject: 'Attitude', A: 85, fullMark: 100 },
    { subject: 'Creativity', A: 70, fullMark: 100 },
    { subject: 'Communication', A: 90, fullMark: 100 },
    { subject: 'Leadership', A: 75, fullMark: 100 },
    { subject: 'Teamwork', A: 88, fullMark: 100 },
    { subject: 'Sociability', A: 82, fullMark: 100 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 block">
       {/* Overview Box */}
       <div className="bg-zinc-950/80 rounded-xl p-5 border border-white/5">
         <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-100 mb-3">
            <FileTextIcon /> Overview
         </h3>
         <p className="text-sm text-zinc-400 leading-relaxed">
           The candidate demonstrated strong backend development skills, highlighting near-completion of major projects in previous roles. 
           They addressed challenges in integrating third-party APIs effectively. Action items include reviewing their system design 
           submission and testing their coding style in the next round.
         </p>
       </div>

       {/* Key Points Grid */}
       <div className="bg-zinc-950/80 rounded-xl p-5 border border-white/5">
         <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-100 mb-4">
            <KeyIcon /> Key points
         </h3>
         <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-semibold text-blue-400 mb-2">Project progress</h4>
              <ul className="text-sm text-zinc-400 space-y-2 list-disc pl-4">
                <li>Backend logic effectively explained.</li>
                <li>Familiar with standard frontend frameworks.</li>
                <li>Positive feedback on code review workflows.</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-purple-400 mb-2">Challenges faced</h4>
              <ul className="text-sm text-zinc-400 space-y-2 list-disc pl-4">
                <li>Difficulty answering geo-location scaling question.</li>
                <li>Needed hints for optimal database choices.</li>
              </ul>
            </div>
         </div>
       </div>

       {/* Scores */}
       <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-950/80 rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-zinc-100 mb-1">AI Video Score</h3>
            <p className="text-[10px] text-zinc-500 mb-4">See the AI Video score result</p>
            <div className="h-40 w-full flex items-center justify-center mix-blend-screen opacity-90">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#3f3f46" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 9 }} />
                  <Radar name="Candidate" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-zinc-950/80 rounded-xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-zinc-100 mb-1">Workmap Score</h3>
            <p className="text-[10px] text-zinc-500 mb-4">See the workmap in one sheet</p>
            <div className="space-y-4">
               <ScoreBar label="Presentation" score={90} color="bg-purple-500" />
               <ScoreBar label="Opportunistic" score={60} color="bg-amber-500" />
               <ScoreBar label="Business Acumen" score={85} color="bg-blue-500" />
               <ScoreBar label="Closing Technique" score={40} color="bg-rose-500" />
            </div>
          </div>
       </div>
    </div>
  )
}

function ScoreBar({ label, score, color }: { label: string, score: number, color: string }) {
  return (
     <div>
       <div className="flex justify-between text-xs font-medium text-zinc-400 mb-1">
         <span>{label}</span>
         <span>{score}%</span>
       </div>
       <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
         <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
       </div>
     </div>
  )
}

function TranscriptContent() {
  const MOCK_TRANSCRIPT = [
    { id: 1, speaker: "HR", name: "Sarah Jenkins", time: "0:14", text: "Can you see my screen guys?" },
    { id: 2, speaker: "Candidate", name: "Candidate", time: "0:16", text: "Yeah." },
    { id: 3, speaker: "HR", name: "Sarah Jenkins", time: "0:18", text: "OK, so we are moving on to the text vectorization. So what was the last task session? What did we do last time? Do you remember?" },
    { id: 4, speaker: "HR", name: "Sarah Jenkins", time: "0:30", text: "So we have introduced this system design, you know, caching mechanism, caching nodes, you know the pre-trained models and everything right? So now I told you that when we are dealing with machine learning algorithms... It will not accept raw text data." },
    { id: 5, speaker: "Candidate", name: "Candidate", time: "0:52", text: "After you do the pre-processing, after the data set is cleaned, we have to pass the data set into the machine learning algorithm as a numerical format." },
    { id: 6, speaker: "HR", name: "Michael Chen", time: "1:15", text: "Exactly. The text data need to be converted into a numerical format. That's what we call it as a text vector." },
    { id: 7, speaker: "Candidate", name: "Candidate", time: "1:28", text: "Machine learning algorithms expect the data to be a two-dimensional array with rows as instances and columns as features. So for every row, every row is a sample of for example document number one, then the columns will be your features." },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
         <div className="flex items-center gap-3">
           <button className="text-zinc-400 hover:text-white flex items-center gap-1.5 text-xs font-medium bg-zinc-800 pl-2 pr-3 py-1.5 rounded-lg border border-white/5 transition-colors">
              <Download size={14} /> Download Transcript
           </button>
         </div>
         <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-zinc-800/50 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-sm text-zinc-200 outline-none focus:border-blue-500/50"
            />
         </div>
      </div>
      
      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500/80 text-xs px-3 py-2 rounded-lg mb-4 flex items-center gap-2">
        <span className="shrink-0 font-bold">(!)</span> AI-generated content may be incorrect
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
         {MOCK_TRANSCRIPT.map(msg => (
           <div key={msg.id} className="flex gap-4">
             <div className="w-8 h-8 rounded-full bg-zinc-800 shrink-0 flex flex-col items-center justify-center font-bold text-xs border border-white/10 overflow-hidden">
               {msg.name === "Sarah Jenkins" ? (
                 <img src="https://i.pravatar.cc/150?u=sarah" alt={msg.name} className="w-full h-full object-cover" />
               ) : msg.name === "Michael Chen" ? (
                  <img src="https://i.pravatar.cc/150?u=michael" alt={msg.name} className="w-full h-full object-cover" />
               ) : (
                  <span className="text-blue-400">C</span>
               )}
             </div>
             <div className="flex-1">
               <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-semibold text-zinc-200">{msg.name}</span>
                  <span className="text-[10px] text-blue-400/80 font-mono bg-blue-500/10 px-1.5 py-0.5 rounded">{msg.time}</span>
               </div>
               <p className="text-sm text-zinc-400 leading-relaxed">
                 {msg.text}
               </p>
             </div>
           </div>
         ))}
      </div>
    </div>
  )
}

function AskGLMContent({ candidate }: { candidate: any }) {
  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2">
       <div className="flex-1 min-h-0 overflow-y-auto mb-4 space-y-4">
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">✨</div>
             <div>
               <div className="bg-zinc-800 rounded-2xl rounded-tl-sm p-4 text-sm text-zinc-300">
                 Hi! I'm GLM. I've analyzed the interview with <strong>{candidate.name || 'this candidate'}</strong>. What would you like to know? You can ask me about:
                 <ul className="list-disc pl-5 mt-2 space-y-1 text-zinc-400">
                   <li>Their technical proficiency</li>
                   <li>Behavioral red flags</li>
                   <li>Summary of their system design</li>
                 </ul>
               </div>
             </div>
          </div>
       </div>

       <div className="relative mt-auto shrink-0">
          <input 
            type="text" 
            placeholder="Ask GLM a question about this interview..."
            className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-zinc-200 outline-none focus:border-blue-500/50 shadow-inner"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
             <ArrowLeft size={16} className="rotate-180" />
          </button>
       </div>
    </div>
  )
}


// SVG Icons for Recap
function FileTextIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
  );
}

function KeyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/></svg>
  );
}
