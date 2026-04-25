import React from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  AlertCircle, 
  Calendar, 
  Users,
  User, 
  Clock, 
  BrainCircuit, 
  CheckCircle2, 
  XOctagon, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Code2,
  Briefcase
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

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

const scoreData = [
  { range: '0-20', count: 12 },
  { range: '21-40', count: 45 },
  { range: '41-60', count: 130 },
  { range: '61-80', count: 284 },
  { range: '81-90', count: 145 },
  { range: '91-100', count: 87 },
];

const departmentData = [
  { subject: 'Engineering', count: 120, fullMark: 150 },
  { subject: 'Product', count: 98, fullMark: 150 },
  { subject: 'Design', count: 86, fullMark: 150 },
  { subject: 'Marketing', count: 50, fullMark: 150 },
  { subject: 'Sales', count: 85, fullMark: 150 },
  { subject: 'Data Science', count: 110, fullMark: 150 },
];

const skillsData = [
  { name: 'React', count: 245 },
  { name: 'TypeScript', count: 190 },
  { name: 'Python', count: 152 },
  { name: 'Node.js', count: 120 },
  { name: 'AWS', count: 98 },
  { name: 'Figma', count: 85 },
];

const geoData = [
  { name: 'California (CA)', value: 340, percentage: 85 },
  { name: 'New York (NY)', value: 210, percentage: 65 },
  { name: 'Texas (TX)', value: 180, percentage: 50 },
  { name: 'Washington (WA)', value: 145, percentage: 40 },
  { name: 'Remote (Globally)', value: 450, percentage: 100 },
];

const mockKanbanCards = {
  screening: [
    { id: 1, name: 'Alice Chen', role: 'Frontend Engineer', score: 88, time: '2m ago' },
    { id: 2, name: 'Marcus Johnson', role: 'Product Manager', score: 92, time: '5m ago' },
  ],
  intervention: [
    { id: 3, name: 'David Smith', role: 'Backend Engineer', reason: 'Unverified degree', time: '12m ago' },
    { id: 4, name: 'Priya Patel', role: 'Data Scientist', reason: 'Gap in employment', time: '1h ago' },
  ],
  rejected: [
    { id: 5, name: 'O. Thompson', role: 'UX Designer', reason: 'Below threshold (42%)', time: '5m ago' },
    { id: 6, name: 'E. Rodriguez', role: 'DevOps', reason: 'Missing clearance', time: '18m ago' },
  ]
};

const recentResumes: any[] = [
  ...mockKanbanCards.screening.map(c => ({ ...c, status: 'screening' })),
  ...mockKanbanCards.intervention.map(c => ({ ...c, status: 'intervention' })),
  ...mockKanbanCards.rejected.map(c => ({ ...c, status: 'rejected' })),
];

export default function ResumeAnalyticalDashboardView({ 
  onViewDatabase, 
  onViewSchedule,
  onViewIntervention,
  onViewArchive
}: { 
  onViewDatabase?: () => void,
  onViewSchedule?: (candidate: any) => void,
  onViewIntervention?: (candidate: any) => void,
  onViewArchive?: (candidate: any) => void
}) {
  return (
    <motion.div 
      className="max-w-6xl mx-auto flex flex-col gap-6 w-full pb-12"
      initial="hidden"
      animate="visible"
      variants={STAGGER_CONTAINER}
    >
      {/* Header */}
      <motion.div variants={FADE_UP_ANIMATION} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-white tracking-tight">Resume Analytical Dashboard</h1>
          <p className="text-sm text-zinc-400">Holistic view of recruitment velocity and agentic workflow health.</p>
        </div>
        <button 
          onClick={onViewDatabase}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-lg shadow-purple-500/20"
        >
          <Users size={16} />
          View Full Database
        </button>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={FADE_UP_ANIMATION}>
          <MetricCard 
            title="Total Candidates Processed" 
            value="2,492" 
            change="+315 this week" 
            icon={<Users size={18} className="text-blue-400" />} 
            trend="up" 
          />
        </motion.div>
        <motion.div variants={FADE_UP_ANIMATION}>
          <MetricCard 
            title="Time Saved by AI" 
            value="142 hrs" 
            change="Based on 5m per resume" 
            icon={<Clock size={18} className="text-purple-400" />} 
            trend="up" 
          />
        </motion.div>
        <motion.div variants={FADE_UP_ANIMATION}>
          <MetricCard 
            title="Auto-Shortlist Rate" 
            value="24.8%" 
            change="Optimal threshold (20-30%)" 
            icon={<BrainCircuit size={18} className="text-emerald-400" />} 
            trend="neutral" 
          />
        </motion.div>
        <motion.div variants={FADE_UP_ANIMATION}>
          <MetricCard 
            title="Active Pipelines" 
            value="12" 
            change="2 require attention" 
            icon={<Activity size={18} className="text-amber-400" />} 
            trend="warning" 
          />
        </motion.div>
      </div>

      {/* Middle Row: Charts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quality Insights */}
        <motion.div variants={FADE_UP_ANIMATION} className="lg:col-span-2 bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm relative group overflow-hidden flex flex-col h-[380px]">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h3 className="text-base font-medium text-white">Candidate Quality Insights</h3>
              <p className="text-xs text-zinc-400 mt-1">Distribution of AI-generated matching scores</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp size={14}/>
              <span>Avg Score: 68</span>
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-0 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="range" 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={11} 
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#c084fc' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={50}>
                  {scoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index > 3 ? '#a855f7' : '#52525b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right: AI Alerts */}
        <motion.div variants={FADE_UP_ANIMATION} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm flex flex-col h-[380px]">
          <div className="flex items-center gap-2 mb-6 text-amber-400">
            <AlertCircle size={18} />
            <h3 className="text-base font-medium text-white">AI Recommendations</h3>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-3">
            <AlertBlock 
              type="warning"
              title="Pipeline Depleted"
              desc="Senior Backend Role has < 5 qualified candidates remaining."
              action="Expand Sourcing"
            />
            <AlertBlock 
              type="action"
              title="Review Required"
              desc="GLM flagged an experience discrepancy for candidate Jane Doe."
              action="Review Profile"
            />
            <AlertBlock 
              type="info"
              title="Emails Pending"
              desc="12 rejection drafts are awaiting your final approval to send."
              action="View Drafts"
            />
            <AlertBlock 
              type="info"
              title="Skill Gap Noticed"
              desc="70% of rejected candidates lack 'Kubernetes' experience. Consider updating JD."
              action="View Insight"
            />
          </div>
        </motion.div>
      </div>

      {/* Analytics Deep Dive Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radar Chart for Departments */}
        <motion.div variants={FADE_UP_ANIMATION} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm flex flex-col h-[340px]">
          <div className="flex items-center gap-2 mb-2 text-purple-400">
            <Briefcase size={18} />
            <h3 className="text-base font-medium text-white">Department Applications</h3>
          </div>
          <p className="text-xs text-zinc-400 mb-4">Volume distribution across roles</p>
          <div className="flex-1 w-full min-h-0 relative z-10 -mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={departmentData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#c084fc' }}
                />
                <Radar name="Applications" dataKey="count" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} dot={{ r: 3, fill: '#d8b4fe' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Horizontal Bar Chart for Skills */}
        <motion.div variants={FADE_UP_ANIMATION} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm flex flex-col h-[340px]">
          <div className="flex items-center gap-2 mb-2 text-blue-400">
            <Code2 size={18} />
            <h3 className="text-base font-medium text-white">Dominating Skills</h3>
          </div>
          <p className="text-xs text-zinc-400 mb-4">Top extracted text terms in resumes</p>
          <div className="flex-1 w-full min-h-0 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={skillsData} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} width={70} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                  {skillsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index < 2 ? '#3b82f6' : '#1e3a8a'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Geo Distribution */}
        <motion.div variants={FADE_UP_ANIMATION} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm flex flex-col h-[340px]">
          <div className="flex items-center gap-2 mb-2 text-emerald-400">
            <MapPin size={18} />
            <h3 className="text-base font-medium text-white">Top Geographies</h3>
          </div>
          <p className="text-xs text-zinc-400 mb-4">Applicant location hotspots</p>
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-4 pt-2">
            {geoData.map((geo, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">{geo.name}</span>
                  <span className="text-zinc-500 font-mono">{geo.value}</span>
                </div>
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${geo.percentage}%` }}
                    transition={{ duration: 1, delay: 0.2 + (i * 0.1) }}
                    className={`h-full rounded-full ${i === 4 ? 'bg-zinc-500' : 'bg-emerald-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Recent Processed Resumes Overview */}
      <motion.div variants={FADE_UP_ANIMATION} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm flex flex-col mt-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-medium text-white">Recent Workflow Outcomes</h3>
            <p className="text-xs text-zinc-400 mt-1">Overview of recently processed candidates</p>
          </div>
          <button className="text-xs flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
            View all records <ArrowRight size={14} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs text-zinc-400">
                <th className="pb-3 font-medium px-4">Candidate</th>
                <th className="pb-3 font-medium px-4">Role</th>
                <th className="pb-3 font-medium px-4">Workflow Status</th>
                <th className="pb-3 font-medium px-4">Match Score</th>
                <th className="pb-3 font-medium px-4">Notes</th>
                <th className="pb-3 font-medium px-4 text-right">Processed At</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentResumes.map((resume) => (
                <tr key={`${resume.status}-${resume.id}`} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-4 font-medium text-zinc-200">{resume.name}</td>
                  <td className="py-4 px-4 text-zinc-400 text-xs">{resume.role}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 flex w-fit items-center gap-1.5 text-xs font-medium rounded-full ${
                      resume.status === 'screening' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      resume.status === 'intervention' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {resume.status === 'screening' && <CheckCircle2 size={12} />}
                      {resume.status === 'intervention' && <AlertCircle size={12} />}
                      {resume.status === 'rejected' && <XOctagon size={12} />}
                      {resume.status === 'screening' ? 'Screening' : resume.status === 'intervention' ? 'HR Intervention' : 'Rejected'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                     {resume.score ? (
                       <span className="text-zinc-300 font-mono text-xs font-semibold">{resume.score}%</span>
                     ) : (
                       <span className="text-zinc-500 text-xs">-</span>
                     )}
                  </td>
                  <td className="py-4 px-4 text-zinc-400 text-xs max-w-[200px] truncate">
                     {resume.reason || "Auto-routed by LLM"}
                  </td>
                  <td className="py-4 px-4 text-right text-zinc-500 text-xs group-hover:text-zinc-300 transition-colors">
                    <div className="flex items-center justify-end gap-1.5 w-full">
                       <Clock size={12} />
                       {resume.time}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

    </motion.div>
  );
}

// Subcomponents
function MetricCard({ title, value, change, icon, trend }: any) {
  return (
    <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-5 flex flex-col justify-between h-full backdrop-blur-sm group hover:bg-zinc-800/60 hover:border-white/10 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xs font-medium text-zinc-400">{title}</h3>
        <div className="p-1.5 bg-zinc-800/50 rounded flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl font-semibold text-white tracking-tight">{value}</div>
        <div className="mt-2 text-xs flex items-center gap-1">
          <span className={`font-medium ${
            trend === 'up' ? 'text-emerald-400' : 
            trend === 'warning' ? 'text-amber-400' : 
            'text-zinc-500'
          }`}>
            {change}
          </span>
        </div>
      </div>
    </div>
  );
}

function AlertBlock({ type, title, desc, action }: any) {
  const isWarning = type === 'warning';
  const isAction = type === 'action';
  
  return (
    <div className={`p-4 rounded-lg border flex flex-col gap-2 ${
      isWarning ? 'bg-amber-500/5 border-amber-500/10' : 
      isAction ? 'bg-purple-500/5 border-purple-500/10' : 
      'bg-zinc-800/20 border-white/5'
    }`}>
      <div className="flex items-center justify-between">
        <h4 className={`text-sm font-medium ${isWarning ? 'text-amber-300' : isAction ? 'text-purple-300' : 'text-zinc-200'}`}>
          {title}
        </h4>
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
      <button className={`mt-1 text-xs font-medium w-max px-3 py-1.5 rounded transition-colors ${
        isWarning ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 
        isAction ? 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20' : 
        'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
      }`}>
        {action}
      </button>
    </div>
  );
}

function KanbanItem({ name, role, score, reason, time, accent, primaryActionLabel, onPrimaryAction, secondaryIcons }: any) {
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
      case 'check': return <CheckCircle2 key={idx} size={13} className="text-zinc-500 hover:text-amber-400 transition-colors cursor-pointer" />;
      case 'x': return <XOctagon key={idx} size={13} className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer" />;
      default: return null;
    }
  }

  return (
    <div className={`kanban-card p-3 rounded-lg border ${accentColors[accent]} flex flex-col gap-1.5 relative overflow-hidden group hover:border-opacity-40 transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-100">{name}</span>
        {score && (
          <span className={`text-xs font-mono font-bold ${textColors[accent]} bg-black/40 px-1.5 py-0.5 rounded border border-white/5`}>
            {score}%
          </span>
        )}
      </div>
      <span className="text-[11px] text-zinc-400">{role}</span>
      {(reason || time) && (
        <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/5 mb-2">
           {reason && <span className={`text-[10px] font-medium ${textColors[accent]} truncate max-w-[120px]`}>{reason}</span>}
           {time && <span className="text-[10px] text-zinc-500 flex items-center gap-1 ml-auto"><Clock size={10}/> {time}</span>}
        </div>
      )}
      
      {/* ACTION ROW */}
      <div className="mt-auto pt-1 flex items-center justify-between gap-2">
         {primaryActionLabel && (
           <button 
             onClick={onPrimaryAction} 
             className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors flex-1 text-center ${buttonColors[accent]}`}
           >
             {primaryActionLabel}
           </button>
         )}
         {secondaryIcons && (
           <div className="flex items-center gap-2 px-1">
             {secondaryIcons.map((icon: string, idx: number) => renderSecondaryIcon(icon, idx))}
           </div>
         )}
      </div>
    </div>
  );
}
