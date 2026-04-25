import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  Mail, 
  CheckCircle2, 
  ArrowLeft, 
  Users,
  MapPin,
  ChevronDown,
  BarChart2,
  Settings,
  Bold,
  Italic,
  Underline,
  Heading,
  Type,
  Sparkles,
  Loader2,
  Bot,
  Send,
  Plus
} from 'lucide-react';

// --- MOCK DATA ---
const TIME_SLOTS = [
  ['19:00 - 20:30', '09:00 - 10:30'],
  ['20:30 - 21:00', '10:30 - 12:00']
];

const hrDatabase: Record<string, { id: number, name: string, img: string }[]> = {
  'empty': [],
  '09:00 - 10:30': [
     { id: 1, name: 'Sarah Jenkins', img: 'https://i.pravatar.cc/150?u=sarah' },
     { id: 2, name: 'Michael Chen', img: 'https://i.pravatar.cc/150?u=michael' }
  ],
  '10:30 - 12:00': [
     { id: 3, name: 'Emma Watson', img: 'https://i.pravatar.cc/150?u=emma' },
     { id: 1, name: 'Sarah Jenkins', img: 'https://i.pravatar.cc/150?u=sarah' }
  ],
  '19:00 - 20:30': [
     { id: 4, name: 'David Kim', img: 'https://i.pravatar.cc/150?u=david' }
  ],
  '20:30 - 21:00': [
     { id: 2, name: 'Michael Chen', img: 'https://i.pravatar.cc/150?u=michael' },
     { id: 4, name: 'David Kim', img: 'https://i.pravatar.cc/150?u=david' }
  ]
};

const ROOMS = [
  'Google Meet (Virtual)',
  'Huddle Room A (2nd Floor)',
  'Conference Room 4B',
  'Executive Boardroom'
];

export default function InterviewSchedulingView({ candidate, onBack, isPopup, onSuccess }: { candidate: any, onBack: () => void, isPopup?: boolean, onSuccess?: () => void }) {
  const [scheduled, setScheduled] = useState(false);
  const [selectedDate, setSelectedDate] = useState(25);
  
  // Dynamic Time Slots State
  const [timeSlots, setTimeSlots] = useState([
    '09:00 - 10:30', 
    '10:30 - 12:00',
    '19:00 - 20:30',
    '20:30 - 21:00'
  ]);
  const [selectedSlot, setSelectedSlot] = useState(timeSlots[0]);
  const [newSlotInput, setNewSlotInput] = useState('');
  const [slotError, setSlotError] = useState<string | null>(null);

  const handleAddSlot = () => {
    const trimmed = newSlotInput.trim();
    setSlotError(null);

    if (!trimmed) return;
    
    // Explicitly validate logic
    const regex = /^([01]?\d|2[0-3]):([0-5]\d)\s*-\s*([01]?\d|2[0-3]):([0-5]\d)$/;
    const match = trimmed.match(regex);

    if (!match) {
        setSlotError("Invalid format. Use HH:MM - HH:MM (e.g. 14:00 - 15:00)");
        return;
    }

    const startH = parseInt(match[1], 10);
    const startM = parseInt(match[2], 10);
    const endH = parseInt(match[3], 10);
    const endM = parseInt(match[4], 10);

    const startTotal = startH * 60 + startM;
    let endTotal = endH * 60 + endM;

    if (endTotal <= startTotal) {
        endTotal += 24 * 60; // Assume crossed midnight or same time -> next day
    }

    const diff = endTotal - startTotal;
    
    // Validate duration: exactly 30min, 1h, 1.5h, 2h 
    const allowedDurations = [30, 60, 90, 120];
    if (!allowedDurations.includes(diff)) {
        setSlotError("Duration must be strictly 30m, 1h, 1.5h, or 2h.");
        return;
    }

    if (timeSlots.includes(trimmed)) {
        setSlotError("Time block already exists.");
        return;
    }

    setTimeSlots([...timeSlots, trimmed]);
    setSelectedSlot(trimmed); // Automatically select newly added slot
    setNewSlotInput('');
  };
  
  const [showHRDropdown, setShowHRDropdown] = useState(false);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('Google Meet (Virtual)');

  const [emailSubject, setEmailSubject] = useState(`Interview Invitation: ${candidate?.role || 'Role'} at GLM`);
  const [emailBody, setEmailBody] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isManuallyEdited, setIsManuallyEdited] = useState(false);
  
  // New States for AI Copilot Chatbot
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isManuallyEdited) {
      setEmailBody(`Hi ${candidate?.name?.split(' ')[0] || 'there'},\n\nWe are excited to move forward! Please find the attached calendar invite for our screening call on April ${selectedDate}, 2026 at ${selectedSlot}.\n\nLooking forward to chatting!\n\nBest,\nGLM Talent Team`);
    }
  }, [selectedSlot, selectedDate, candidate, isManuallyEdited]);

  // ==========================================
  // BACKEND INTEGRATION POINT: AI COPILOT
  // Replace this mock logic with your API call.
  // Example: const response = await fetch('/api/schedule-copilot', { body: { prompt, currentContext } });
  // ==========================================
  const handleAiCopilotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    
    setIsEnhancing(true);
    setAiFeedback(null);
    const lowerPrompt = aiPrompt.toLowerCase();

    // Simulate backend network latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (lowerPrompt.includes('time') || lowerPrompt.includes('david') || lowerPrompt.includes('sarah')) {
       // Mock AI Action: Scheduling focus
       setSelectedDate(26);
       setSelectedSlot('19:00 - 20:30');
       setAiFeedback('AI Action: Adjusted schedule to April 26 at 19:00 based on David/Sarah\'s availability.');
    } else if (lowerPrompt.includes('spanish') || lowerPrompt.includes('translate')) {
       // Mock AI Action: Translation focus
       setEmailBody(`Hola ${candidate?.name?.split(' ')[0] || 'Candidato'},\n\n¡Estamos emocionados de avanzar! Adjuntamos la invitación de calendario para nuestra entrevista técnica el 26 de abril de 2026 a las ${selectedSlot}.\n\n¡Esperamos conversar pronto!\n\nSaludos,\nEquipo de Talento GLM`);
       setAiFeedback('AI Action: Translated email template to Spanish.');
       setIsManuallyEdited(true);
    } else {
       // Mock AI Action: General rewrite focus
       setEmailBody(`Hey ${candidate?.name?.split(' ')[0] || 'there'}!\n\nJust reaching out to say we absolutely loved your profile. We'd love to grab ${selectedSlot} to chat further and see if there's a strong fit.\n\nTalk soon!`);
       setAiFeedback('AI Action: Adjusted email tone and phrasing.');
       setIsManuallyEdited(true);
    }

    setIsEnhancing(false);
    setAiPrompt('');
    
    // Clear the transient feedback toast after 5s
    setTimeout(() => setAiFeedback(null), 5000);
  };
  
  // Legacy Enhance Button Logic
  const handleEnhanceEmail = () => {
    setIsEnhancing(true);
    setTimeout(() => {
      setEmailBody(`Dear ${candidate?.name?.split(' ')[0] || 'Candidate'},\n\nThank you for your interest in the ${candidate?.role || 'open'} position at GLM. We were highly impressed by your background and would be delighted to invite you for a screening interview to discuss your experience and mutual fit.\n\nI have attached a calendar invitation with an auto-generated Google Meet link for April ${selectedDate}, 2026 at ${selectedSlot}. Please let us know if you require any accommodations or if this time does not work for you.\n\nWarm regards,\n\nThe GLM Talent Acquisition Team`);
      setIsManuallyEdited(true);
      setIsEnhancing(false);
    }, 1500);
  };

  const availableHR = hrDatabase[selectedSlot] || hrDatabase['empty'];

  // Mock Calendar Generation (April 2026 starts on Wed)
  const daysInMonth = 30;
  const startOffset = 3; 

  const renderCalendarDays = () => {
    let cells = [];
    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    
    weekdays.forEach(day => {
      cells.push(<div key={`header-${day}`} className="h-8 flex items-center justify-center text-xs font-medium text-zinc-500">{day}</div>);
    });

    for (let i = 0; i < startOffset; i++) {
       cells.push(<div key={`empty-${i}`} className="h-8 w-8 m-auto" />);
    }

    const availableDays = [5, 11, 12, 16, 17, 18, 19, 23, 24, 25, 26];

    for (let day = 1; day <= daysInMonth; day++) {
      const isAvailable = availableDays.includes(day);
      const isSelected = selectedDate === day;

      cells.push(
        <button
          key={`day-${day}`}
          onClick={() => {
            if (isAvailable) setSelectedDate(day);
          }}
          className={`h-8 w-8 m-auto flex items-center justify-center rounded-full text-xs transition-all duration-200 ${
            isSelected 
              ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)] font-bold' 
              : isAvailable
                ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 font-medium'
                : 'text-zinc-600 cursor-not-allowed hover:bg-zinc-800/30'
          }`}
        >
          {day}
        </button>
      );
    }
    return cells;
  };

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

      <div className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-zinc-950 p-6 border-b border-white/5 flex items-center justify-between">
           <div>
             <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
               <CalendarIcon size={20} className="text-blue-500" /> 
               Schedule Screening Interview
             </h2>
             <p className="text-sm text-zinc-400 mt-1">Select an optimal time slot and configure attendees.</p>
           </div>
        </div>

        {/* Content */}
        {!scheduled ? (
          <div className="p-8 flex flex-col gap-10">
            
            {/* Interactive Grid (Calendar + Time Slots) */}
            <div className="flex flex-col md:flex-row gap-6">
               {/* Left: Calendar Month View */}
               <div className="w-full md:w-80 shrink-0 bg-zinc-900/60 border border-white/5 rounded-2xl p-6 shadow-inner relative flex flex-col justify-center min-h-[320px]">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent rounded-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-4 relative z-10">
                     <span className="text-sm font-bold text-white tracking-wide uppercase">April 2026</span>
                     <div className="flex gap-1 bg-zinc-950/50 p-1 rounded-md border border-white/5">
                       <button className="text-zinc-500 hover:text-white transition-colors p-0.5"><ChevronDown size={14} className="rotate-90"/></button>
                       <button className="text-zinc-500 hover:text-white transition-colors p-0.5"><ChevronDown size={14} className="-rotate-90"/></button>
                     </div>
                  </div>
                  <div className="grid grid-cols-7 gap-y-2 gap-x-1 relative z-10 flex-1 content-start">
                    {renderCalendarDays()}
                  </div>
               </div>

               {/* Right: Time Slots View */}
               <div className="flex-1 flex flex-col bg-zinc-900/40 border border-white/5 p-6 rounded-2xl relative min-h-[320px]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-blue-500-[0.02] rounded-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-2">
                       <Clock size={16} className="text-blue-400" />
                       <h3 className="text-sm font-semibold text-white tracking-tight">Available Time Blocks</h3>
                    </div>
                  </div>

                  {/* Grid of Dynamic Time Slots */}
                  <div className="grid grid-cols-2 gap-3 mb-6 relative z-10 content-start">
                     {timeSlots.map((slot) => {
                       const active = selectedSlot === slot;
                       
                       return (
                         <button
                           key={slot}
                           onClick={() => setSelectedSlot(slot)}
                           className={`group flex items-center justify-center py-4 px-4 border text-sm transition-all duration-300 rounded-xl font-medium relative overflow-hidden ${
                             active
                               ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.15)] scale-[1.02]'
                               : 'bg-zinc-950/50 border-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                           }`}
                         >
                           {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />}
                           <span>{slot}</span>
                         </button>
                       );
                     })}
                  </div>

                  {/* Input form to add a new slot */}
                  <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-2 relative z-10">
                     <label className="text-xs text-zinc-500 font-medium flex items-center justify-between">
                       <span>Add custom availability</span>
                       {slotError && <span className="text-red-400 text-[10px] bg-red-400/10 px-1.5 py-0.5 rounded animate-pulse">{slotError}</span>}
                     </label>
                     <div className="flex items-center gap-2">
                       <input
                         value={newSlotInput}
                         onChange={(e) => {
                            setNewSlotInput(e.target.value);
                            if (slotError) setSlotError(null);
                         }}
                         onKeyDown={(e) => e.key === 'Enter' && handleAddSlot()}
                         placeholder="e.g. 14:00 - 15:00"
                         className={`bg-zinc-950/50 border ${slotError ? 'border-red-500/50' : 'border-white/10'} rounded-lg px-3 py-2.5 text-sm text-zinc-200 flex-1 outline-none ${slotError ? 'focus:border-red-500/50' : 'focus:border-blue-500/50'} transition-colors`}
                       />
                       <button
                         onClick={handleAddSlot}
                         disabled={!newSlotInput.trim()}
                         title="Add Time Block"
                         className="p-2.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 disabled:opacity-50 transition-colors shrink-0"
                       >
                         <Plus size={16} />
                       </button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Config Inputs Rows (Dark Mode Format) */}
            <div className="flex flex-col border-y border-white/5 py-2">
               
               {/* Row 1: Attendees */}
               <div className="flex items-center gap-6 py-4 border-b border-zinc-800/80 relative">
                  <Users size={20} className="text-zinc-400 shrink-0 mx-2" />
                  <div className="flex-1 flex items-center justify-between">
                     {availableHR.length > 0 ? (
                       <div className="flex -space-x-2">
                         {availableHR.map(hr => (
                           <img key={hr.id} src={hr.img} alt={hr.name} className="w-8 h-8 flex-shrink-0 rounded-full border-2 border-[#121212]" title={hr.name} />
                         ))}
                       </div>
                     ) : (
                       <span className="text-zinc-500 text-sm">No internal interviewers available at this time.</span>
                     )}
                     
                     <div className="relative">
                        <button 
                          onClick={() => setShowHRDropdown(!showHRDropdown)}
                          className="flex items-center gap-2 text-zinc-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors"
                        >
                          <Settings size={16} />
                          <ChevronDown size={14} className="text-zinc-500" />
                        </button>
                        {showHRDropdown && (
                          <div className="absolute right-0 top-10 mt-1 w-56 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                             <div className="flex flex-col p-1.5">
                               {availableHR.length === 0 && (
                                 <span className="text-xs text-zinc-500 p-3 italic">Cannot add team members.</span>
                               )}
                               {availableHR.map(hr => (
                                 <button key={hr.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded text-left" onClick={() => setShowHRDropdown(false)}>
                                    <img src={hr.img} alt={hr.name} className="w-6 h-6 rounded-full" />
                                    <span className="text-sm text-zinc-300">{hr.name}</span>
                                 </button>
                               ))}
                             </div>
                          </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Row 2: Date & Time Summary */}
               <div className="flex items-center gap-6 py-4 border-b border-zinc-800/80">
                  <Clock size={20} className="text-zinc-400 shrink-0 mx-2" />
                  <div className="flex-1 flex items-center justify-between">
                     <span className="text-zinc-200 text-sm">Thu 4/{selectedDate}/2026 {selectedSlot}</span>
                     <div className="flex items-center gap-4 text-zinc-400">
                        <button className="hover:text-white transition-colors" title="Insights"><BarChart2 size={18} /></button>
                        <button className="flex items-center gap-2 hover:text-white transition-colors font-medium text-sm">
                           <CalendarIcon size={18} /> Scheduler
                        </button>
                     </div>
                  </div>
               </div>

               {/* Row 3: Location */}
               <div className="flex items-center gap-6 py-4 relative">
                  <MapPin size={20} className="text-zinc-400 shrink-0 mx-2" />
                  <div className="flex-1">
                     <button 
                       className="w-full flex items-center justify-between text-left focus:outline-none"
                       onClick={() => setShowRoomDropdown(!showRoomDropdown)}
                     >
                       <span className={selectedRoom ? 'text-zinc-200 text-sm' : 'text-zinc-500 text-sm'}>
                         {selectedRoom || 'Add a room or location'}
                       </span>
                       <ChevronDown size={16} className="text-zinc-500" />
                     </button>
                     
                     {showRoomDropdown && (
                        <div className="absolute left-14 right-4 top-14 mt-1 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden text-sm">
                           <div className="flex flex-col">
                             {ROOMS.map(room => (
                               <button 
                                 key={room} 
                                 className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 text-left text-zinc-300 hover:text-white transition-colors"
                                 onClick={() => {
                                   setSelectedRoom(room);
                                   setShowRoomDropdown(false);
                                 }}
                               >
                                 {room.includes('Virtual') ? <Video size={16} className="text-blue-400"/> : <MapPin size={16} className="text-zinc-500" />}
                                 {room}
                               </button>
                             ))}
                           </div>
                        </div>
                     )}
                  </div>
               </div>

            </div>

             <div className="flex flex-col gap-2 relative z-0">
               <div className="flex flex-col gap-2 relative z-0">
                 <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                   <span>Email Composer</span>
                 </label>
                 <div className="bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden flex flex-col focus-within:border-blue-500/50 transition-colors">
                   {/* Toolbar */}
                   <div className="flex items-center justify-between p-2 border-b border-white/5 bg-zinc-900">
                     <div className="flex items-center gap-1">
                        <button className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors"><Bold size={14} /></button>
                        <button className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors"><Italic size={14} /></button>
                        <button className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors"><Underline size={14} /></button>
                        <div className="w-px h-4 bg-white/10 mx-1" />
                        <button className="px-2 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/10 rounded flex items-center gap-1 transition-colors"><Heading size={13} /> <ChevronDown size={10}/></button>
                        <button className="px-2 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/10 rounded flex items-center gap-1 transition-colors"><Type size={13} /> <span className="ml-1">Inter</span> <ChevronDown size={10}/></button>
                     </div>
                     <button 
                       onClick={handleEnhanceEmail}
                       disabled={isEnhancing}
                       className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 px-2.5 py-1.5 rounded transition-colors mr-1"
                     >
                       {isEnhancing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                       {isEnhancing ? 'Writing with GLM...' : 'GLM Rewrite'}
                     </button>
                   </div>
                   {/* Subject Line */}
                   <div className="px-4 py-3 border-b border-white/5 bg-zinc-950/50 flex items-center text-sm">
                      <span className="text-zinc-500 mr-2 font-medium">Subject:</span>
                      <input 
                        type="text" 
                        value={emailSubject} 
                        onChange={(e) => setEmailSubject(e.target.value)} 
                        className="bg-transparent border-none text-zinc-200 outline-none flex-1 font-semibold placeholder:text-zinc-600"
                      />
                   </div>
                   {/* Body */}
                   <textarea
                      value={emailBody}
                      onChange={(e) => {
                         setEmailBody(e.target.value);
                         setIsManuallyEdited(true);
                      }}
                      className="w-full bg-transparent px-4 py-5 text-sm text-zinc-300 font-sans leading-relaxed min-h-[160px] resize-none outline-none focus:ring-0 placeholder:text-zinc-600 border-b border-white/5"
                      placeholder="Draft your email here..."
                   />
                   
                   {/* AI Contextual Chat Bar */}
                   <form onSubmit={handleAiCopilotSubmit} className="flex flex-col bg-purple-950/10 relative">
                     <AnimatePresence>
                       {aiFeedback && (
                         <motion.div 
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, scale: 0.95 }}
                           className="absolute -top-10 right-4 bg-purple-500 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-[0_0_15px_rgba(168,85,247,0.4)] z-10 flex items-center gap-2"
                         >
                           <CheckCircle2 size={12} />
                           {aiFeedback}
                         </motion.div>
                       )}
                     </AnimatePresence>
                     <div className="flex items-center gap-2 px-3 py-2">
                        <Bot size={16} className="text-purple-400 shrink-0 ml-1" />
                        <input 
                          value={aiPrompt}
                          onChange={e => setAiPrompt(e.target.value)}
                          placeholder="Ask GLM Copilot to check schedules, rewrite email, translate..." 
                          className="bg-transparent text-sm text-zinc-200 placeholder:text-zinc-500/70 flex-1 outline-none px-2 py-1.5"
                        />
                        <button 
                          type="submit" 
                          disabled={isEnhancing || !aiPrompt.trim()} 
                          className="p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(168,85,247,0.3)] shrink-0"
                        >
                           {isEnhancing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        </button>
                     </div>
                   </form>
                 </div>
               </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 relative z-0">
               <button onClick={onBack} className="px-5 py-2.5 rounded-lg font-medium text-sm text-zinc-400 hover:text-white transition-colors">
                 Cancel
               </button>
               <button 
                 onClick={() => setScheduled(true)}
                 className="px-5 py-2.5 rounded-lg font-medium text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-[0_0_15px_rgba(37,99,235,0.2)] flex items-center gap-2"
               >
                 <Mail size={16} />
                 Send Invite & Sync Calendar
               </button>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-16 flex flex-col items-center justify-center text-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
               <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white">Interview Scheduled!</h3>
            <p className="text-zinc-400 max-w-md">
              The Google Calendar event has been created for {selectedSlot} on April {selectedDate}, 2026. An invite has been dispatched via Gmail to {candidate?.name}.
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
