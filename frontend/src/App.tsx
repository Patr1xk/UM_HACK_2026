import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Terminal,
  Search,
  Activity,
  User,
  ChevronDown,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Menu,
  ChevronLeft,
  LogOut,
  UserPlus,
  ArrowLeftRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  PieChart, Pie, Cell
} from 'recharts';
import ResumeScreeningView from './components/ResumeScreeningView';
import ResumeAnalyzeView from './components/ResumeAnalyzeView';
import ResumeAnalyticalDashboardView from './components/ResumeAnalyticalDashboardView';
import ResumeDatabaseView from './components/ResumeDatabaseView';
import ResumeDetailView from './components/ResumeDetailView';
import InterviewSchedulingView from './components/InterviewSchedulingView';
import AutomatedRejectionView from './components/AutomatedRejectionView';
import InterviewHubView from './components/InterviewHubView';
import InterviewDetailView from './components/InterviewDetailView';
import OfferAndOnboardingView from './components/OfferAndOnboardingView';
import OrchestratorLogsView from './components/OrchestratorLogsView';

import OnboardingListView from './components/OnboardingListView';
import OnboardingDetailView from './components/OnboardingDetailView';

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
      staggerChildren: 0.08,
    }
  }
};

export default function App() {
  const [activeView, setActiveView] = useState('Dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [selectedOnboardingEmployee, setSelectedOnboardingEmployee] = useState<any>(null);
  const [previousView, setPreviousView] = useState('Resume Analytical Dashboard');

  const handleViewCandidate = (candidate: any) => {
    setSelectedCandidate(candidate);
    setPreviousView('Resume Database');
    setActiveView('Resume Detail');
  };

  const handleViewInterview = (interview: any) => {
    setSelectedCandidate(interview);
    setActiveView('Interview Detail');
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-zinc-50 overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* Sidebar (Internal Navigation) */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 256 }}
        className="flex-shrink-0 border-r border-white/5 bg-zinc-950/50 flex flex-col justify-between z-20 relative backdrop-blur-xl"
      >
        <div className="flex flex-col overflow-hidden">
          {/* Logo / Brand */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-zinc-950">
            <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'hidden' : 'flex'}`}>
              <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <polygon points="50,2 98,28 98,72 50,98 2,72 2,28" fill="white" />
                <text x="48" y="66" textAnchor="middle" fill="black" fontSize="48" fontFamily="sans-serif" fontStyle="italic" fontWeight="900" transform="skewX(-10)">HF</text>
              </svg>
              <div className="flex flex-col">
                 <span className="font-bold tracking-tight text-white leading-none text-xl">Hireflow</span>
              </div>
            </div>
            
            {/* When collapsed, show a centered minimalist logo or just the toggle */}
            {isSidebarCollapsed && (
              <div className="w-full flex items-center justify-center">
                 <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <polygon points="50,2 98,28 98,72 50,98 2,72 2,28" fill="white" />
                  <text x="48" y="66" textAnchor="middle" fill="black" fontSize="48" fontFamily="sans-serif" fontStyle="italic" fontWeight="900" transform="skewX(-10)">HF</text>
                </svg>
              </div>
            )}
            
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`text-zinc-400 hover:text-white transition-all duration-200 flex items-center justify-center border shadow-xl active:scale-95 ${
                isSidebarCollapsed 
                  ? 'absolute left-1/2 -translate-x-1/2 top-[80px] w-12 h-12 bg-zinc-800 border-white/20 rounded-2xl hover:bg-zinc-700 hover:border-purple-500/50 hover:text-purple-400 shadow-black/80 z-50' 
                  : 'w-9 h-9 bg-zinc-900/50 border-white/10 rounded-xl hover:bg-zinc-800 hover:border-white/30'
              }`}
              title={isSidebarCollapsed ? "Expand Menu" : "Collapse Menu"}
            >
              {isSidebarCollapsed ? <Menu size={22} className="shrink-0" /> : <ChevronLeft size={20} className="shrink-0" />}
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1 p-3 mt-2">
            <SidebarItem 
              icon={<LayoutDashboard size={18} />} 
              label="Dashboard" 
              active={activeView === 'Dashboard'} 
              onClick={() => setActiveView('Dashboard')}
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarItem 
              icon={<FileText size={18} />} 
              label="Resume Screening" 
              active={activeView === 'Resume Screening'} 
              onClick={() => setActiveView('Resume Screening')}
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarItem 
              icon={<Users size={18} />} 
              label="Resume Database" 
              active={activeView === 'Resume Database'} 
              onClick={() => setActiveView('Resume Database')}
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarItem 
              icon={<Calendar size={18} />} 
              label="Interview Hub" 
              active={activeView === 'Interview Hub'} 
              onClick={() => setActiveView('Interview Hub')}
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarItem 
              icon={<Settings size={18} />} 
              label="Employee Onboarding" 
              active={activeView === 'Employee Onboarding'} 
              onClick={() => setActiveView('Employee Onboarding')}
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarItem 
              icon={<Terminal size={18} />} 
              label="Orchestrator Logs" 
              active={activeView === 'Orchestrator Logs'} 
              onClick={() => setActiveView('Orchestrator Logs')}
              isCollapsed={isSidebarCollapsed}
            />
          </nav>
        </div>

        {/* User Profile Block */}
        <div className={`p-4 border-t border-white/5 bg-zinc-950/80 relative group`}>
          <div 
            className={`flex items-center gap-3 w-full p-2 rounded-lg transition-colors group cursor-pointer ${isSidebarCollapsed ? 'justify-center p-1' : ''}`}
          >
            <div className="w-9 h-9 shrink-0 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 group-hover:border-purple-500/30 transition-colors bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
              <User size={16} className="text-zinc-400 group-hover:text-purple-300 transition-colors shrink-0" />
            </div>
            {!isSidebarCollapsed && (
              <>
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-sm font-medium text-zinc-200 whitespace-nowrap">HR Admin</span>
                  <span className="text-xs text-zinc-500 whitespace-nowrap">System Operator</span>
                </div>
                <ChevronDown size={14} className="text-zinc-500 ml-auto shrink-0 group-hover:text-white transition-colors" />
              </>
            )}
          </div>

          {/* Hover Menu */}
          <div className="absolute bottom-full left-4 right-4 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-50">
            <div className="bg-zinc-900 border border-white/10 rounded-xl shadow-2xl shadow-black overflow-hidden backdrop-blur-xl">
              <div className="p-3 border-b border-white/5 bg-white/5">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Account Hub</p>
              </div>
              <div className="p-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                  <UserPlus size={14} className="text-zinc-500" />
                  <span>Log In</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                  <ArrowLeftRight size={14} className="text-zinc-500" />
                  <span>Switch Account</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Ambient Glow Background */}
        <div className="absolute top-[-20%] left-[20%] w-[800px] h-[600px] bg-purple-900/15 blur-[120px] rounded-full pointer-events-none" />

        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-zinc-950/30 backdrop-blur-md relative z-10 w-full shrink-0">
          <div className="relative w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search candidates, workflows..." 
              className="w-full bg-zinc-900/50 border border-white/10 rounded-md py-1.5 pl-9 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3 bg-zinc-900/40 px-3 py-1.5 rounded-full border border-white/5 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="text-xs font-medium text-emerald-400 tracking-wide">System Status: Hireflow Online</span>
          </div>
        </header>

        {/* Workspace Scroll Area */}
        <div className="flex-1 overflow-y-auto px-8 py-8 relative z-10 scrollbar-hide">
          {activeView === 'Dashboard' && <DashboardView />}
          {activeView === 'Resume Database' && <ResumeDatabaseView onViewCandidate={handleViewCandidate} />}
          {activeView === 'Resume Detail' && selectedCandidate && (
             <ResumeDetailView 
               candidate={selectedCandidate} 
               onBack={() => setActiveView('Resume Database')} 
               onAdvanceSchedule={() => {
                 setPreviousView('Resume Detail');
                 setActiveView('Interview Scheduling');
               }}
               onAdvanceReject={() => {
                 setPreviousView('Resume Detail');
                 setActiveView('Automated Rejection');
               }}
             />
          )}
          {activeView === 'HR Intervention' && selectedCandidate && (
             <ResumeDetailView candidate={selectedCandidate} onBack={() => setActiveView('Resume Analytical Dashboard')} />
          )}
          {activeView === 'Interview Scheduling' && selectedCandidate && (
             <InterviewSchedulingView candidate={selectedCandidate} onBack={() => setActiveView(previousView)} />
          )}
          {activeView === 'Automated Rejection' && selectedCandidate && (
             <AutomatedRejectionView candidate={selectedCandidate} onBack={() => setActiveView(previousView)} />
          )}
          {activeView === 'Resume Analytical Dashboard' && (
            <ResumeAnalyticalDashboardView 
              onViewDatabase={() => setActiveView('Resume Database')} 
              onViewSchedule={(candidate) => {
                setSelectedCandidate(candidate);
                setPreviousView('Resume Analytical Dashboard');
                setActiveView('Interview Scheduling');
              }}
              onViewIntervention={(candidate) => {
                setSelectedCandidate(candidate);
                setPreviousView('Resume Analytical Dashboard');
                setActiveView('HR Intervention');
              }}
              onViewArchive={(candidate) => {
                setSelectedCandidate(candidate);
                setPreviousView('Resume Analytical Dashboard');
                setActiveView('Automated Rejection');
              }}
            />
          )}
          {activeView === 'Resume Screening' && (
             <ResumeScreeningView onAnalysisComplete={() => setActiveView('Resume Analyze')} />
          )}
          {activeView === 'Resume Analyze' && (
             <ResumeAnalyzeView onTransitionComplete={() => setActiveView('Resume Analytical Dashboard')} />
          )}
          {activeView === 'Interview Hub' && (
             <InterviewHubView onViewInterview={handleViewInterview} />
          )}
          {activeView === 'Interview Detail' && selectedCandidate && (
             <InterviewDetailView 
               candidate={selectedCandidate} 
               onBack={() => setActiveView('Interview Hub')} 
               onIssueOffer={() => setActiveView('Offer And Onboarding')}
             />
          )}
          {activeView === 'Offer And Onboarding' && selectedCandidate && (
             <OfferAndOnboardingView 
               candidate={selectedCandidate} 
               onBack={() => setActiveView('Interview Hub')} 
             />
          )}
          {activeView === 'Employee Onboarding' && (
            <OnboardingListView onSelectEmployee={(emp) => {
              setSelectedOnboardingEmployee(emp);
              setActiveView('Onboarding Detail');
            }} />
          )}
          {activeView === 'Onboarding Detail' && selectedOnboardingEmployee && (
            <OnboardingDetailView 
              employee={selectedOnboardingEmployee} 
              onBack={() => setActiveView('Employee Onboarding')} 
            />
          )}
          {activeView === 'Orchestrator Logs' && (
            <OrchestratorLogsView />
          )}
        </div>
      </main>
    </div>
  );
}

// Subcomponents

function DashboardView() {
  const chartData = [
    { name: 'Mon', apps: 420, interviews: 12 },
    { name: 'Tue', apps: 510, interviews: 18 },
    { name: 'Wed', apps: 480, interviews: 22 },
    { name: 'Thu', apps: 620, interviews: 15 },
    { name: 'Fri', apps: 580, interviews: 25 },
    { name: 'Sat', apps: 320, interviews: 10 },
    { name: 'Sun', apps: 280, interviews: 5 },
  ];

  const radarData = [
    { subject: 'Python', A: 120, fullMark: 150 },
    { subject: 'React', A: 150, fullMark: 150 },
    { subject: 'UI Design', A: 86, fullMark: 150 },
    { subject: 'DevOps', A: 99, fullMark: 150 },
    { subject: 'Management', A: 85, fullMark: 150 },
    { subject: 'Communication', A: 130, fullMark: 150 },
  ];

  const pieData = [
    { name: 'Technical', value: 400 },
    { name: 'Culture', value: 300 },
    { name: 'Experience', value: 300 },
    { name: 'Other', value: 200 },
  ];

  const COLORS = ['#8b5cf6', '#a855f7', '#d946ef', '#6366f1'];

  return (
    <motion.div 
      className="max-w-7xl mx-auto flex flex-col gap-8 w-full pb-12"
      initial="hidden"
      animate="visible"
      variants={STAGGER_CONTAINER}
    >
      {/* Header */}
      <motion.div variants={FADE_UP_ANIMATION} className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-white tracking-tight">System Overview</h1>
        <p className="text-sm text-zinc-400">Tuesday, April 21, 2026 • 24 active pipelines processing</p>
      </motion.div>

      {/* Top Row: Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={FADE_UP_ANIMATION}>
          <MetricCard 
            title="Total Candidates" 
            value="14,292" 
            change="+12% this week" 
            icon={<Users size={18} />} 
            trend="up" 
          />
        </motion.div>
        <motion.div variants={FADE_UP_ANIMATION}>
          <MetricCard 
            title="Active Pipelines" 
            value="24" 
            change="3 new roles added" 
            icon={<LayoutDashboard size={18} />} 
            trend="neutral" 
          />
        </motion.div>
        <motion.div variants={FADE_UP_ANIMATION}>
          <MetricCard 
            title="Avg. Time to Hire" 
            value="18d" 
            change="-4d from target" 
            icon={<Clock size={18} />} 
            trend="up" 
          />
        </motion.div>
        <motion.div variants={FADE_UP_ANIMATION}>
          <MetricCard 
            title="Unresolved Alerts" 
            value="8" 
            change="Immediate action req." 
            icon={<AlertCircle size={18} className="text-rose-500" />} 
            trend="warning" 
          />
        </motion.div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <motion.div variants={FADE_UP_ANIMATION} className="lg:col-span-2 bg-zinc-900/40 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-medium text-zinc-300">Application vs Interview Trends</h3>
              <p className="text-xs text-zinc-500 mt-1">Comparing total intake vs scheduling conversion</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-[10px] text-zinc-400">Apps</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                <span className="text-[10px] text-zinc-400">Interviews</span>
              </div>
            </div>
          </div>
          
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#52525b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '8px' }}
                  itemStyle={{ color: '#e4e4e7' }}
                />
                <Area type="monotone" dataKey="apps" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                <Area type="monotone" dataKey="interviews" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorInterviews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Radar Chart for Skills Distribution */}
        <motion.div variants={FADE_UP_ANIMATION} className="bg-zinc-900/40 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-sm font-medium text-zinc-300 mb-6">Talent Distribution</h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#ffffff10" />
                <PolarAngleAxis dataKey="subject" stroke="#71717a" fontSize={11} />
                <Radar
                  name="Hireflow Avg"
                  dataKey="A"
                  stroke="#a855f7"
                  fill="#a855f7"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recruitment Pipeline Table-like Visualization */}
        <motion.div variants={FADE_UP_ANIMATION} className="bg-zinc-900/40 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-sm font-medium text-zinc-300 mb-6">Live Recruitment Pipeline</h3>
          <div className="space-y-4">
            {[
              { role: 'Senior Frontend Engineer', count: 124, progress: 85, color: 'bg-purple-500' },
              { role: 'Product Manager', count: 48, progress: 62, color: 'bg-indigo-500' },
              { role: 'UX Designer', count: 32, progress: 45, color: 'bg-pink-500' },
              { role: 'Backend Dev (Node.js)', count: 89, progress: 78, color: 'bg-emerald-500' },
            ].map((item, idx) => (
              <div key={idx} className="group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">{item.role}</span>
                  <span className="text-xs text-zinc-500">{item.count} active</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                    className={`h-full ${item.color} rounded-full`} 
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pie Chart / System Health */}
        <motion.div variants={FADE_UP_ANIMATION} className="bg-zinc-900/40 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-medium text-zinc-300">Decision Factors</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Sparkles size={10} />
              <span>AI Optimized</span>
            </div>
          </div>
          <div className="flex items-center h-48">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '8px' }}
                    itemStyle={{ color: '#e4e4e7' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 pl-6 space-y-3">
              {pieData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  <span className="text-[11px] text-zinc-400">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Feed */}
      <motion.div variants={FADE_UP_ANIMATION} className="bg-zinc-900/40 border border-white/5 rounded-xl backdrop-blur-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-200">Recent Orchestrator Activity</h3>
          <button className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded transition-colors">
            View Full Logs
          </button>
        </div>
        
        <div className="flex flex-col">
          <ActivityRow 
            time="10:04 AM"
            event="Sarah routed to Interview"
            detail="Algorithm determined 92% match for Sr. Frontend role"
            icon={<CheckCircle2 size={16} className="text-emerald-500" />}
          />
          <ActivityRow 
            time="09:12 AM"
            event="Auto-rejected 12 edge cases"
            detail="Applicants lacked mandatory security clearance requirements"
            icon={<AlertCircle size={16} className="text-zinc-500" />}
            isDim
          />
          <ActivityRow 
            time="08:45 AM"
            event="Extracted 45 skills from batch"
            detail="Processed 200 incoming resumes via OCR pipeline"
            icon={<FileText size={16} className="text-purple-400" />}
          />
          <ActivityRow 
            time="08:30 AM"
            event="System Daily Reset Completed"
            detail="Caches cleared, models synced with master definitions"
            icon={<Settings size={16} className="text-blue-400" />}
            isLast
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

function SidebarItem({ 
  icon, 
  label, 
  active = false, 
  onClick,
  isCollapsed = false
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  onClick: () => void;
  isCollapsed?: boolean;
}) {
  return (
    <button 
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={`flex items-center gap-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ease-out text-left relative group ${
        isCollapsed ? 'justify-center mx-1 px-0' : 'px-3'
      } ${
        active 
          ? 'bg-purple-500/10 text-purple-200' 
          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
      }`}
    >
      {active && (
        <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-purple-500 rounded-r-full shadow-[0_0_8px_rgba(168,85,247,0.8)] ${isCollapsed ? '-ml-1' : ''}`} />
      )}
      <span className={`${active ? 'text-purple-400' : 'text-zinc-500 group-hover:text-zinc-400 transition-colors'} shrink-0`}>
        {icon}
      </span>
      {!isCollapsed && (
        <span className="whitespace-nowrap overflow-hidden">
          {label}
        </span>
      )}
    </button>
  );
}

function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  trend 
}: { 
  title: string; 
  value: string; 
  change: string; 
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'warning' | 'neutral';
}) {
  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-5 flex flex-col justify-between h-full backdrop-blur-sm group hover:bg-zinc-800/40 transition-colors duration-300">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
        <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400 border border-white/5 group-hover:border-white/10 transition-colors">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl font-semibold text-white tracking-tight">{value}</div>
        <div className="mt-2 text-xs flex items-center gap-1">
          <span className={`font-medium ${
            trend === 'up' ? 'text-emerald-400' : 
            trend === 'warning' ? 'text-yellow-500' : 
            'text-zinc-500'
          }`}>
            {change}
          </span>
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ 
  time, 
  event, 
  detail,
  icon,
  isDim = false,
  isLast = false
}: { 
  time: string; 
  event: string; 
  detail: string;
  icon: React.ReactNode;
  isDim?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className={`p-4 flex items-start gap-4 hover:bg-zinc-800/30 transition-colors duration-200 group ${!isLast ? 'border-b border-white/5' : ''}`}>
      <div className="mt-0.5">
        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:border-white/10 transition-colors">
          {icon}
        </div>
      </div>
      <div className="flex-1 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
        <div>
          <p className={`text-sm font-medium transition-colors ${isDim ? 'text-zinc-400' : 'text-zinc-200 group-hover:text-white'}`}>
            {event}
          </p>
          <p className="text-xs text-zinc-500 mt-1 max-w-xl leading-relaxed">
            {detail}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-600 bg-zinc-900 px-2 py-1 rounded text-xs font-mono border border-white/5">
          <Clock size={12} />
          {time}
        </div>
      </div>
    </div>
  );
}

