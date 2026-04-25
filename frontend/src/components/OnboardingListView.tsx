import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  Clock,
  CircleDashed,
  Mail,
  User,
  Loader2,
  AlertTriangle,
  FileAxis3D,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { listWorkflows, clarifyWorkflow } from '../api';
import type { WorkflowResponse } from '../types/api';

// Mock Data
export const PAGE_DATA: Record<number, any[]> = {
  1: [
    {
      id: 'EMP-7082',
      name: 'Sarah Jenkins',
      email: 'sarah.j@glm.com',
      department: 'Engineering',
      role: 'Senior Frontend Engineer',
      startDate: '2026-04-18',
      status: 'In Progress',
      progress: 65,
      manager: 'Alex Chen',
      agentActivity: 'Provisioning Laptop & Hardware...',
      agentIcon: 'spinner',
      agentColor: 'text-purple-400'
    },
    {
      id: 'EMP-7083',
      name: 'To Be Assigned',
      email: 'michael.c@glm.com',
      department: 'To Be Assigned',
      role: 'Product Manager',
      startDate: '2026-04-20',
      status: 'Pending',
      progress: 0,
      manager: 'Sarah Jenkins',
      agentActivity: 'Awaiting core profile data...',
      agentIcon: 'warning',
      agentColor: 'text-rose-400'
    },
    {
      id: 'EMP-7085',
      name: 'Priya Patel',
      email: 'To Be Assigned',
      department: 'Design',
      role: 'To Be Assigned',
      startDate: '2026-04-23',
      status: 'Pending',
      progress: 10,
      manager: 'To Be Assigned',
      agentActivity: 'Missing secondary info...',
      agentIcon: 'clock',
      agentColor: 'text-amber-500'
    },
    {
      id: 'EMP-7071',
      name: 'David Rodriguez',
      email: 'david.r@glm.com',
      department: 'Sales',
      role: 'Account Executive',
      startDate: '2026-04-01',
      status: 'Completed',
      progress: 100,
      manager: 'James Wilson',
      agentActivity: 'Employee Record finalized.',
      agentIcon: 'check',
      agentColor: 'text-emerald-500'
    },
    {
      id: 'EMP-7088',
      name: 'Aisha Johnson',
      email: 'To Be Assigned',
      department: 'Engineering',
      role: 'Data Scientist',
      startDate: '2026-04-24',
      status: 'Pending',
      progress: 5,
      manager: 'Alex Chen',
      agentActivity: 'Verifying email details...',
      agentIcon: 'clock',
      agentColor: 'text-emerald-500'
    }
  ],
  2: [
    {
      id: 'EMP-7090',
      name: 'Elena Rostova',
      email: 'e.rostova@glm.com',
      department: 'Marketing',
      role: 'Content Manager',
      startDate: '2026-04-28',
      status: 'In Progress',
      progress: 40,
      manager: 'Marcus Kim',
      agentActivity: 'Generating 30-60-90 day plan...',
      agentIcon: 'spinner',
      agentColor: 'text-purple-400'
    },
    {
      id: 'EMP-7091',
      name: 'Omar Farooq',
      email: 'o.farooq@glm.com',
      department: 'Finance',
      role: 'Financial Analyst',
      startDate: '2026-05-02',
      status: 'In Progress',
      progress: 15,
      manager: 'Linda Chen',
      agentActivity: 'Waiting for IT approval on CRM access...',
      agentIcon: 'warning',
      agentColor: 'text-amber-500'
    },
    {
      id: 'EMP-7092',
      name: 'Julia Santos',
      email: 'j.santos@glm.com',
      department: 'Engineering',
      role: 'Backend Engineer',
      startDate: '2026-05-05',
      status: 'Pending',
      progress: 10,
      manager: 'Alex Chen',
      agentActivity: 'Parsing previous employment documents...',
      agentIcon: 'spinner',
      agentColor: 'text-purple-400'
    },
    {
      id: 'EMP-7093',
      name: 'Kevin Zhao',
      email: 'k.zhao@glm.com',
      department: 'Design',
      role: 'UI Designer',
      startDate: '2026-05-08',
      status: 'Completed',
      progress: 100,
      manager: 'Emily Wong',
      agentActivity: 'Figma access granted automatically.',
      agentIcon: 'check',
      agentColor: 'text-emerald-500'
    },
    {
      id: 'EMP-7094',
      name: 'Sarah Connor',
      email: 's.connor@glm.com',
      department: 'Support',
      role: 'Customer Success Manager',
      startDate: '2026-05-10',
      status: 'In Progress',
      progress: 55,
      manager: 'Tom Hardy',
      agentActivity: 'Scheduling mandatory compliance training...',
      agentIcon: 'spinner',
      agentColor: 'text-purple-400'
    }
  ],
  3: [
    {
      id: 'EMP-7095',
      name: 'Hassan Ali',
      email: 'h.ali@glm.com',
      department: 'Legal',
      role: 'Compliance Officer',
      startDate: '2026-05-15',
      status: 'Pending',
      progress: 0,
      manager: 'Sarah Jenkins',
      agentActivity: 'Auto-sending pre-hire background check...',
      agentIcon: 'mail',
      agentColor: 'text-yellow-500'
    },
    {
      id: 'EMP-7096',
      name: 'Rachel Zane',
      email: 'r.zane@glm.com',
      department: 'Legal',
      role: 'Paralegal',
      startDate: '2026-05-16',
      status: 'In Progress',
      progress: 25,
      manager: 'Hassan Ali',
      agentActivity: 'Extracting clauses from initial offer letter...',
      agentIcon: 'spinner',
      agentColor: 'text-purple-400'
    },
    {
      id: 'EMP-7097',
      name: 'Mike Ross',
      email: 'm.ross@glm.com',
      department: 'Legal',
      role: 'Junior Associate',
      startDate: '2026-05-17',
      status: 'Pending',
      progress: 0,
      manager: 'Hassan Ali',
      agentActivity: 'Verification failed. Reviewing transcripts...',
      agentIcon: 'warning',
      agentColor: 'text-amber-500'
    },
    {
      id: 'EMP-7098',
      name: 'Jessica Pearson',
      email: 'j.pearson@glm.com',
      department: 'Executive',
      role: 'Managing Director',
      startDate: '2026-05-20',
      status: 'Completed',
      progress: 100,
      manager: 'Board',
      agentActivity: 'Executive onboarding workflow concluded.',
      agentIcon: 'check',
      agentColor: 'text-emerald-500'
    },
    {
      id: 'EMP-7099',
      name: 'Louis Litt',
      email: 'l.litt@glm.com',
      department: 'Finance',
      role: 'CFO',
      startDate: '2026-05-22',
      status: 'In Progress',
      progress: 80,
      manager: 'Board',
      agentActivity: 'Setting up financial dashboard access...',
      agentIcon: 'spinner',
      agentColor: 'text-purple-400'
    }
  ],
  10: [
    {
      id: 'EMP-7120',
      name: 'Maya Srinivasan',
      email: 'm.srinivasan@glm.com',
      department: '',
      role: 'Mobile Dev',
      startDate: '',
      status: 'Pending',
      progress: 0,
      manager: 'Alex Chen',
      agentActivity: 'Waiting for HR to provide department & start date...',
      agentIcon: 'warning',
      agentColor: 'text-amber-500'
    },
    {
      id: 'EMP-7121',
      name: 'Brian O\'Conner',
      email: 'b.oconner@glm.com',
      department: 'Logistics',
      role: 'Supply Chain Manager',
      startDate: '2026-06-05',
      status: 'In Progress',
      progress: 45,
      manager: 'Mia Toretto',
      agentActivity: 'Routing equipment order to fulfillment...',
      agentIcon: 'spinner',
      agentColor: 'text-purple-400'
    },
    {
      id: 'EMP-7122',
      name: 'Letty Ortiz',
      email: 'l.ortiz@glm.com',
      department: 'Engineering',
      role: 'DevOps',
      startDate: '2026-06-10',
      status: 'Pending',
      progress: 5,
      manager: 'Alex Chen',
      agentActivity: 'Generating SSH key pairs and AWS IAM roles...',
      agentIcon: 'spinner',
      agentColor: 'text-purple-400'
    },
    {
      id: 'EMP-7123',
      name: 'Roman Pearce',
      email: 'r.pearce@glm.com',
      department: 'Sales',
      role: 'Sales Executive',
      startDate: '2026-06-15',
      status: 'In Progress',
      progress: 60,
      manager: 'David Rodriguez',
      agentActivity: 'Drafting territory assignment email...',
      agentIcon: 'mail',
      agentColor: 'text-yellow-500'
    },
    {
      id: 'EMP-7124',
      name: 'Tej Parker',
      email: 't.parker@glm.com',
      department: 'IT',
      role: 'System Administrator',
      startDate: '2026-06-20',
      status: 'Completed',
      progress: 100,
      manager: 'Admin',
      agentActivity: 'IT Onboarding self-managed via script.',
      agentIcon: 'check',
      agentColor: 'text-emerald-500'
    }
  ]
};

export const MOCK_ONBOARDING_EMPLOYEES = PAGE_DATA[1];

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

const getMissingFields = (employee: any) => {
  const missing = [];
  if (!employee.name || employee.name === 'To Be Assigned') missing.push('name');
  if (!employee.department || employee.department === 'To Be Assigned') missing.push('department');
  if (!employee.startDate || employee.startDate === 'To Be Assigned') missing.push('startDate');
  return missing;
};

const getPriority = (employee: any) => {
  const missingCore = getMissingFields(employee);
  if (missingCore.length > 0) return 'High';
  
  // Checks for medium/low priority
  let missingOther = 0;
  if (!employee.email || employee.email === 'To Be Assigned') missingOther++;
  if (!employee.role || employee.role === 'To Be Assigned') missingOther++;
  if (!employee.manager || employee.manager === 'To Be Assigned') missingOther++;
  
  if (missingOther >= 2) return 'Medium';
  if (missingOther === 1) return 'Low';
  
  return 'Low';
};

export default function OnboardingListView({ onSelectEmployee }: { onSelectEmployee?: (employee: any) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [automatingTask, setAutomatingTask] = useState<any | null>(null);
  const [automationProgress, setAutomationProgress] = useState(0);
  const [isAutoPilotOn, setIsAutoPilotOn] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [employees, setEmployees] = useState(PAGE_DATA[1] || []);
  const [workflows, setWorkflows] = useState<WorkflowResponse[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);

  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [showOverrideConfirm, setShowOverrideConfirm] = useState<any>(null);
  const [showLogsModal, setShowLogsModal] = useState<any>(null);
  const [showAlreadyAutomatedWarning, setShowAlreadyAutomatedWarning] = useState<any>(null);

  // Missing details state
  const [fillingDetailsFor, setFillingDetailsFor] = useState<any | null>(null);
  const [missingDetailsForm, setMissingDetailsForm] = useState<Record<string, string>>({});
  const [isSubmittingDetails, setIsSubmittingDetails] = useState(false);
  const [setupStep, setSetupStep] = useState(0);
  const [showOnboardingSentFor, setShowOnboardingSentFor] = useState<any | null>(null);

  useEffect(() => {
    setEmployees(PAGE_DATA[currentPage] || []);
  }, [currentPage]);

  // Fetch real onboarding workflows from backend
  useEffect(() => {
    const fetchOnboardingWorkflows = async () => {
      setIsLoadingWorkflows(true);
      try {
        const result = await listWorkflows({ workflow_type: 'onboarding' });
        setWorkflows(result);
        if (result.length > 0) {
          const mapped = result.map(w => {
            const ent = w.entities || {};
            const totalSteps = w.steps?.length || 0;
            const completedCount = w.completed_steps?.length || 0;
            const progress = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
            const isAwaiting = w.status === 'awaiting_clarification';
            const missingFields = w.clarification?.missing_fields || w.missing_fields || [];
            return {
              id: w.workflow_id,
              name: ent.employee_name || 'To Be Assigned',
              email: w.runtime_data?.email_address || 'To Be Assigned',
              department: ent.department || 'To Be Assigned',
              role: ent.job_role || 'To Be Assigned',
              startDate: ent.start_date || 'To Be Assigned',
              status: w.status === 'completed' ? 'Completed' : isAwaiting ? 'Pending' : 'In Progress',
              progress: w.status === 'completed' ? 100 : progress,
              manager: 'To Be Assigned',
              agentActivity: isAwaiting
                ? `Missing: ${missingFields.join(', ')}`
                : w.status === 'completed'
                  ? 'Onboarding complete.'
                  : `${completedCount}/${totalSteps} steps done`,
              agentIcon: isAwaiting ? 'warning' : w.status === 'completed' ? 'check' : 'spinner',
              agentColor: isAwaiting ? 'text-amber-500' : w.status === 'completed' ? 'text-emerald-500' : 'text-purple-400',
              _workflow: w,
            };
          });
          setEmployees(mapped);
        }
      } catch (err) {
        // Keep mock data as fallback
      } finally {
        setIsLoadingWorkflows(false);
      }
    };
    fetchOnboardingWorkflows();
  }, []);

  const handleToggleClick = () => {
    if (isAutoPilotOn) {
       setShowToggleConfirm(true);
    } else {
       setIsAutoPilotOn(true);
    }
  };

  const confirmToggleOff = () => {
    setIsAutoPilotOn(false);
    setShowToggleConfirm(false);
  };

  const confirmManualOverride = () => {
    setEmployees(prev => prev.map(emp => 
        emp.id === showOverrideConfirm.id
            ? { ...emp, agentActivity: 'Manual Override Active', agentIcon: 'warning', agentColor: 'text-yellow-500', rowColor: 'bg-yellow-500/5' }
            : emp
    ));
    setShowOverrideConfirm(null);
  };

  const handleAutomateProcess = (employee: any, actionName: string) => {
    setOpenMenuId(null);
    
    if (actionName === 'View Agent Logs') {
       setShowLogsModal(employee);
       return;
    }
    
    if (actionName === 'Manual Override') {
       setShowOverrideConfirm(employee);
       return;
    }
    
    if (actionName === 'Pause Automation') {
       setEmployees(prev => prev.map(emp => 
           emp.id === employee.id 
               ? { ...emp, agentActivity: 'Automation Paused', agentIcon: 'warning', agentColor: 'text-amber-500' }
               : emp
       ));
       return;
    }

    if (actionName === 'AI Automation') {
       const isManualOrPaused = employee.agentActivity === 'Manual Override Active' || employee.agentActivity === 'Automation Paused';
       const isActive = !isManualOrPaused && isAutoPilotOn && employee.status !== 'Completed';
       if (isActive) {
          setShowAlreadyAutomatedWarning(employee);
          return;
       }
    }

    // Default processing for "Force AI Sync" and "AI Automation"
    setAutomatingTask({ employee, actionName, status: 'processing' });
    setAutomationProgress(0);
    
    const interval = setInterval(() => {
      setAutomationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setAutomatingTask((current: any) => current ? { ...current, status: 'success' } : null);
          setEmployees(empList => empList.map(emp => 
              emp.id === employee.id 
                  ? { 
                      ...emp, 
                      agentActivity: actionName === 'AI Automation' ? 'AI Automation Active' : 'AI Sync Successful', 
                      agentIcon: actionName === 'AI Automation' ? 'spinner' : 'check', 
                      agentColor: actionName === 'AI Automation' ? 'text-purple-400' : 'text-emerald-400',
                      rowColor: '' // Clear background highlighting
                    }
                  : emp
          ));
          setTimeout(() => {
            setAutomatingTask(null);
          }, 3000);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 200);
  };

  const handleRowClick = (employee: any) => {
    const priority = getPriority(employee);
    if (priority === 'High') {
      const missing = getMissingFields(employee);
      const initialForm: Record<string, string> = {};
      missing.forEach(field => {
        initialForm[field] = '';
      });
      setFillingDetailsFor(employee);
      setMissingDetailsForm(initialForm);
    } else {
      if (onSelectEmployee) onSelectEmployee(employee);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (priorityFilter === 'All') return matchesSearch;
    return matchesSearch && getPriority(emp) === priorityFilter;
  });

  return (
    <motion.div 
      className="max-w-7xl mx-auto flex flex-col gap-6 w-full pb-10"
      initial="hidden"
      animate="visible"
      variants={STAGGER_CONTAINER}
    >
      <motion.div variants={FADE_UP_ANIMATION} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Employee Onboarding</h1>
          <p className="text-sm text-zinc-400 mt-1">Track and manage new hire onboarding progress.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div 
            onClick={handleToggleClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all border ${
              isAutoPilotOn 
                ? 'bg-purple-500/10 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                : 'bg-zinc-900 border-white/10'
            }`}
          >
            <span className={`text-xs font-semibold tracking-wide uppercase transition-colors ${
              isAutoPilotOn ? 'text-purple-300' : 'text-zinc-500'
            }`}>Agentic Auto-Pilot</span>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${
              isAutoPilotOn ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]' : 'bg-zinc-700'
            }`}>
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                isAutoPilotOn ? 'left-[18px]' : 'left-0.5'
              }`}></div>
            </div>
          </div>
          <div className="h-6 w-px bg-white/10 hidden sm:block"></div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search employee or role..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 bg-zinc-900/50 border border-white/10 rounded-lg py-1.5 pl-9 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
              />
            </div>
            <div className="relative">
              <select 
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="pl-3 pr-8 py-1.5 bg-zinc-900/50 border border-white/10 rounded-lg text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-500/50 appearance-none transition-all cursor-pointer"
              >
                <option value="All">All Priorities</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                <Filter size={14} />
              </div>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border border-white/10 rounded-lg hover:bg-zinc-800 transition-colors text-sm text-zinc-300">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={FADE_UP_ANIMATION} className="bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-zinc-950/50">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Role & Dept</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Agent Activity</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEmployees.map((employee) => (
                <tr 
                  key={employee.id} 
                  className={`transition-colors group ${employee.rowColor ? employee.rowColor : ''} ${onSelectEmployee ? `cursor-pointer ${employee.rowColor ? '' : 'hover:bg-zinc-800/50'}` : 'hover:bg-zinc-800/30'}`}
                  onClick={() => handleRowClick(employee)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 flex items-center justify-center text-purple-300 font-medium text-xs">
                        {(!employee.name || employee.name === 'To Be Assigned') ? '?' : employee.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <div className={`text-sm font-medium transition-colors ${!employee.name || employee.name === 'To Be Assigned' ? 'text-zinc-500 italic' : 'text-zinc-200 group-hover:text-white'}`}>
                          {employee.name || 'To Be Assigned'}
                        </div>
                        <div className="text-xs text-zinc-500 mt-0.5">{employee.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={!employee.role || employee.role === 'To Be Assigned' ? 'text-sm text-zinc-500 italic' : 'text-sm text-zinc-300'}>
                      {employee.role || 'To Be Assigned'}
                    </div>
                    <div className={!employee.department || employee.department === 'To Be Assigned' ? 'text-xs text-zinc-600 mt-0.5 italic' : 'text-xs text-zinc-500 mt-0.5'}>
                      {employee.department || 'To Be Assigned'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      getPriority(employee) === 'High' 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                        : getPriority(employee) === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {getPriority(employee)}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm ${!employee.startDate || employee.startDate === 'To Be Assigned' ? 'text-zinc-500 italic' : 'text-zinc-400'}`}>
                    {employee.startDate && employee.startDate !== 'To Be Assigned' 
                      ? new Date(employee.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'To Be Assigned'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {!isAutoPilotOn && employee.status !== 'Completed' ? (
                        <>
                          <AlertTriangle size={14} className="text-zinc-500" />
                          <span className="text-xs font-medium text-zinc-500">Requires manual intervention</span>
                        </>
                      ) : (
                        <>
                          {employee.agentIcon === 'spinner' && <Loader2 size={14} className={`${employee.agentColor} animate-[spin_2s_linear_infinite]`} />}
                          {employee.agentIcon === 'check' && <CheckCircle2 size={14} className={employee.agentColor} />}
                          {employee.agentIcon === 'mail' && <Mail size={14} className={employee.agentColor} />}
                          {employee.agentIcon === 'warning' && <AlertTriangle size={14} className={employee.agentColor} />}
                          {!employee.agentIcon && employee.status === 'Completed' && <CheckCircle2 size={14} className="text-emerald-500" />}
                          {!employee.agentIcon && employee.status === 'In Progress' && <CircleDashed size={14} className="text-purple-400 animate-[spin_4s_linear_infinite]" />}
                          {!employee.agentIcon && employee.status === 'Pending' && <Clock size={14} className="text-yellow-500" />}
                          <span className={`text-xs font-medium ${employee.agentColor || ''}`}>
                            {employee.agentActivity || employee.status}
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 w-48">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            employee.status === 'Completed' ? 'bg-emerald-500' :
                            employee.status === 'Pending' ? 'bg-yellow-500' :
                            'bg-purple-500'
                          }`} 
                          style={{ width: `${employee.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-400 w-8">{employee.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === employee.id ? null : employee.id);
                      }}
                      className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenuId === employee.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                          }}
                        />
                        <div className="absolute right-8 top-8 w-48 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-20 py-1 overflow-hidden" onClick={e => e.stopPropagation()}>
                          <button 
                            className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:bg-white/5 transition-colors"
                            onClick={() => handleAutomateProcess(employee, 'View Agent Logs')}
                          >
                            View Agent Logs
                          </button>
                          <button 
                            className="w-full text-left px-4 py-2 text-xs text-purple-400 hover:bg-purple-500/10 transition-colors"
                            onClick={() => handleAutomateProcess(employee, 'AI Automation')}
                          >
                            AI Automation
                          </button>
                          <button 
                            className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:bg-white/5 transition-colors border-t border-white/5"
                            onClick={() => handleAutomateProcess(employee, 'Force AI Sync')}
                          >
                            Force AI Sync
                          </button>
                          <button 
                            className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:bg-white/5 transition-colors border-t border-white/5"
                            onClick={() => handleAutomateProcess(employee, 'Pause Automation')}
                          >
                            Pause Automation
                          </button>
                          <button 
                            className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                            onClick={() => handleAutomateProcess(employee, 'Manual Override')}
                          >
                            Manual Override
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 text-sm">
                    No employees found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex justify-start sm:justify-center mt-6 gap-2 px-6 pb-6 overflow-x-auto">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center bg-[#111113] border border-white/5 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setCurrentPage(1)} className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center font-medium transition-colors ${currentPage === 1 ? 'bg-[#1e293b]/40 border border-[#3b82f6]/30 text-blue-400' : 'bg-[#111113] border border-white/5 text-zinc-400 hover:bg-zinc-800'}`}>1</button>
            <button onClick={() => setCurrentPage(2)} className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center font-medium transition-colors ${currentPage === 2 ? 'bg-[#1e293b]/40 border border-[#3b82f6]/30 text-blue-400' : 'bg-[#111113] border border-white/5 text-zinc-400 hover:bg-zinc-800'}`}>2</button>
            <button onClick={() => setCurrentPage(3)} className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center font-medium transition-colors ${currentPage === 3 ? 'bg-[#1e293b]/40 border border-[#3b82f6]/30 text-blue-400' : 'bg-[#111113] border border-white/5 text-zinc-400 hover:bg-zinc-800'}`}>3</button>
            <div className="w-9 h-9 shrink-0 flex items-center justify-center text-zinc-500 font-medium tracking-widest">...</div>
            <button onClick={() => setCurrentPage(10)} className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center font-medium transition-colors ${currentPage === 10 ? 'bg-[#1e293b]/40 border border-[#3b82f6]/30 text-blue-400' : 'bg-[#111113] border border-white/5 text-zinc-400 hover:bg-zinc-800'}`}>10</button>
            <button 
              onClick={() => setCurrentPage(prev => prev < 10 ? prev + 1 : prev)}
              className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center bg-[#111113] border border-white/5 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
        </div>
      </motion.div>

      {/* Automation Progress Modal */}
      <AnimatePresence>
        {automatingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.1)] rounded-2xl w-full max-w-md p-8 flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
              
              <div className="w-20 h-20 relative mb-6">
                 {/* Spinning background */}
                 <motion.div 
                   animate={{ rotate: 360 }} 
                   transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-0 rounded-full border-t-2 border-r-2 border-purple-500"
                 />
                 <motion.div 
                   animate={{ rotate: -360 }} 
                   transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-2 rounded-full border-b-2 border-l-2 border-indigo-400 opacity-50"
                 />
                 {/* Center icon */}
                 <div className="absolute inset-0 flex items-center justify-center text-purple-400">
                   <FileAxis3D size={28} />
                 </div>
              </div>

              <h3 className="text-xl font-semibold text-white mb-2">
                {automatingTask.status === 'success' ? 'Task Complete' : automatingTask.actionName}
              </h3>
              <p className="text-sm text-zinc-400 mb-8 max-w-[280px]">
                {automatingTask.status === 'success' 
                  ? `${automatingTask.actionName} completed successfully for ${automatingTask.employee?.name}.`
                  : 'Initiating automated workflow. Please wait while systems sync.'}
              </p>

              {automatingTask.status === 'success' ? (
                 <div className="w-full flex justify-center mb-6">
                    <CheckCircle className="text-emerald-500 w-16 h-16" />
                 </div>
              ) : (
                <>
                  {/* Progress Bar */}
                  <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5 relative mb-3">
                     <motion.div 
                       className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-indigo-500 to-purple-500"
                       initial={{ width: 0 }}
                       animate={{ width: `${automationProgress}%` }}
                     />
                  </div>
                  <div className="w-full flex justify-between items-center text-xs font-mono">
                    <span className="text-purple-400">{automationProgress}%</span>
                    <span className="text-zinc-500">Processing APIs...</span>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modals */}
      <AnimatePresence>
        {showToggleConfirm && (
           <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 shadow-2xl rounded-2xl w-full max-w-sm p-6 relative"
            >
               <h3 className="text-lg font-semibold text-white mb-2">Disable Auto-Pilot?</h3>
               <p className="text-sm text-zinc-400 mb-6">
                 Are you sure you want to switch off Agentic Auto-Pilot? This will stop all background tasks and require manual intervention for onboarding processes.
               </p>
               <div className="flex gap-3 justify-end">
                 <button 
                   onClick={() => setShowToggleConfirm(false)}
                   className="px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={confirmToggleOff}
                   className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                 >
                   Disable Auto-Pilot
                 </button>
               </div>
            </motion.div>
          </motion.div>
        )}

        {showOverrideConfirm && (
           <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 shadow-2xl rounded-2xl w-full max-w-sm p-6 relative"
            >
               <h3 className="text-lg font-semibold text-white mb-2">Manual Override</h3>
               <p className="text-sm text-zinc-400 mb-6">
                 Are you sure you want to manually override automation for {showOverrideConfirm.name}? You will need to process their documents manually from now on.
               </p>
               <div className="flex gap-3 justify-end">
                 <button 
                   onClick={() => setShowOverrideConfirm(null)}
                   className="px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={confirmManualOverride}
                   className="px-4 py-2 text-sm font-medium text-zinc-900 bg-yellow-500 hover:bg-yellow-400 rounded-lg transition-colors"
                 >
                   Confirm Override
                 </button>
               </div>
            </motion.div>
          </motion.div>
        )}

        {showLogsModal && (
           <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 shadow-2xl rounded-2xl w-full max-w-lg p-6 relative"
            >
               <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                 <div>
                   <h3 className="text-lg font-semibold text-white">Agent Logs</h3>
                   <p className="text-xs text-zinc-400 mt-1">Audit trail for {showLogsModal.name}</p>
                 </div>
                 <button 
                   onClick={() => setShowLogsModal(null)}
                   className="text-zinc-500 hover:text-white"
                 >
                   ✕
                 </button>
               </div>

               <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                 <div className="flex gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                   <div>
                     <p className="text-sm text-zinc-200">System ping to Workday API initiated</p>
                     <p className="text-xs text-zinc-500">2 minutes ago</p>
                   </div>
                 </div>
                 <div className="flex gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                   <div>
                     <p className="text-sm text-zinc-200">Verified identity documents match required criteria</p>
                     <p className="text-xs text-zinc-500">45 minutes ago</p>
                   </div>
                 </div>
                 <div className="flex gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                   <div>
                     <p className="text-sm text-zinc-200">Soft timeout on Slack invite creation, queued retry</p>
                     <p className="text-xs text-zinc-500">1 hour ago</p>
                   </div>
                 </div>
                 <div className="flex gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                   <div>
                     <p className="text-sm text-zinc-200">Automatically generated contract PDF payload</p>
                     <p className="text-xs text-zinc-500">3 hours ago</p>
                   </div>
                 </div>
               </div>

               <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                 <button 
                   onClick={() => setShowLogsModal(null)}
                   className="px-4 py-2 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                 >
                   Close
                 </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Already Automated Warning Modal */}
      <AnimatePresence>
        {showAlreadyAutomatedWarning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 rounded-xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="text-blue-400" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Notice</h3>
                  <p className="text-sm text-zinc-400">
                    <strong className="text-zinc-200">{showAlreadyAutomatedWarning.name}</strong> is currently being handled by the AI Auto-Pilot.
                    The workflow is actively progressing.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => setShowAlreadyAutomatedWarning(null)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Missing Details Modal for High Priority */}
      <AnimatePresence>
        {fillingDetailsFor && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              {!isSubmittingDetails ? (
                <>
                  <div className="flex gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="text-rose-400" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">Missing Information Required</h3>
                      <p className="text-sm text-zinc-400">
                        Please provide the outstanding mandatory details for this employee before onboarding can commence.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {Object.keys(missingDetailsForm).map(field => (
                      <div key={field}>
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                          {field === 'startDate' ? 'Start Date' : field}
                        </label>
                        <input 
                          type={field === 'startDate' ? 'date' : 'text'}
                          value={missingDetailsForm[field]}
                          onChange={(e) => setMissingDetailsForm(prev => ({ ...prev, [field]: e.target.value }))}
                          placeholder={`Enter ${field}...`}
                          className="w-full bg-zinc-950/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 flex justify-end gap-3">
                    <button 
                      onClick={() => setFillingDetailsFor(null)}
                      className="px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={async () => {
                        setIsSubmittingDetails(true);
                        setSetupStep(0);

                        // If this employee has a real workflow, call the clarification API
                        const workflow = fillingDetailsFor?._workflow;
                        if (workflow?.workflow_id) {
                          try {
                            // Build a natural language response from the form
                            const parts: string[] = [];
                            if (missingDetailsForm.name) parts.push(`Name: ${missingDetailsForm.name}`);
                            if (missingDetailsForm.department) parts.push(`Department: ${missingDetailsForm.department}`);
                            if (missingDetailsForm.startDate) parts.push(`Start date: ${missingDetailsForm.startDate}`);
                            const clarificationText = parts.join(', ');

                            const result = await clarifyWorkflow(workflow.workflow_id, clarificationText);

                            const totalSteps = result.steps?.length || 0;
                            const completedCount = result.completed_steps?.length || 0;
                            const updatedEmployee = {
                              ...fillingDetailsFor,
                              name: result.entities?.employee_name || fillingDetailsFor.name,
                              department: result.entities?.department || fillingDetailsFor.department,
                              startDate: result.entities?.start_date || fillingDetailsFor.startDate,
                              status: result.status === 'completed' ? 'Completed' : 'In Progress',
                              progress: result.status === 'completed' ? 100 : (totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0),
                              agentActivity: result.status === 'completed'
                                ? 'Onboarding complete.'
                                : result.status === 'awaiting_clarification'
                                  ? `Still missing: ${(result.clarification?.missing_fields || []).join(', ')}`
                                  : `${completedCount}/${totalSteps} steps done`,
                              agentIcon: result.status === 'completed' ? 'check' : result.status === 'awaiting_clarification' ? 'warning' : 'mail',
                              agentColor: result.status === 'completed' ? 'text-emerald-500' : result.status === 'awaiting_clarification' ? 'text-amber-500' : 'text-yellow-500',
                              _workflow: result,
                            };
                            setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
                            setFillingDetailsFor(null);
                            if (result.status !== 'awaiting_clarification') {
                              setShowOnboardingSentFor(updatedEmployee);
                            }
                          } catch (err) {
                            // Fallback: just update local state
                            const updatedEmployee = {
                              ...fillingDetailsFor,
                              ...missingDetailsForm,
                              status: 'In Progress',
                              progress: 0,
                              agentActivity: 'Onboarding Email Sent. Awaiting Employee Action.',
                              agentIcon: 'mail',
                              agentColor: 'text-yellow-500',
                            };
                            setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
                            setFillingDetailsFor(null);
                            setShowOnboardingSentFor(updatedEmployee);
                          }
                          setIsSubmittingDetails(false);
                          return;
                        }

                        // Fallback for mock data (no real workflow)
                        const steps = [
                          "Generating Onboarding Roadmap...",
                          "Auto-configuring IT Permissions...",
                          "Syncing HR Records...",
                          "Finalizing Welcome Package..."
                        ];

                        let currentStep = 0;
                        const interval = setInterval(() => {
                          currentStep++;
                          if (currentStep < steps.length) {
                            setSetupStep(currentStep);
                          } else {
                            clearInterval(interval);
                            setIsSubmittingDetails(false);

                            const updatedEmployee = {
                              ...fillingDetailsFor,
                              ...missingDetailsForm,
                              status: 'In Progress',
                              progress: 0,
                              agentActivity: 'Onboarding Email Sent. Awaiting Employee Action.',
                              agentIcon: 'mail',
                              agentColor: 'text-yellow-500'
                            };
                            setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
                            setFillingDetailsFor(null);

                            setShowOnboardingSentFor(updatedEmployee);
                          }
                        }, 1200);
                      }}
                      disabled={Object.values(missingDetailsForm).some(v => !String(v).trim())}
                      className="px-4 py-2 text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed rounded-lg transition-colors shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]"
                    >
                      Submit Details
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 relative mb-8">
                    {/* Outer glow */}
                    <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                    
                    {/* Spinning container */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-t-2 border-r-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                    />
                    
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-3 rounded-full border-b-2 border-l-2 border-indigo-400 opacity-60"
                    />
                    
                    {/* Floating elements */}
                    <motion.div
                      animate={{ 
                        y: [0, -4, 0],
                        opacity: [0.3, 1, 0.3]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-2 left-1/2 -translate-x-1/2"
                    >
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_10px_rgba(168,85,247,1)]" />
                    </motion.div>

                    <div className="absolute inset-0 flex items-center justify-center text-purple-400">
                      <FileAxis3D size={36} className="animate-pulse" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-3">Automating Onboarding Setup</h3>
                  
                  <div className="space-y-2">
                    {[
                      "Generating Onboarding Roadmap...",
                      "Auto-configuring IT Permissions...",
                      "Syncing HR Records...",
                      "Finalizing Welcome Package..."
                    ].map((text, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0.1, x: -10 }}
                        animate={{ 
                          opacity: setupStep >= idx ? 1 : 0.1,
                          x: setupStep >= idx ? 0 : -10,
                          color: setupStep === idx ? "#a855f7" : setupStep > idx ? "#10b981" : "#a1a1aa"
                        }}
                        className="flex items-center gap-2 text-sm"
                      >
                        {setupStep > idx ? <CheckCircle size={14} /> : <div className={`w-3.5 h-3.5 rounded-full border border-current ${setupStep === idx ? 'animate-pulse' : ''}`} />}
                        <span>{text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Onboarding Sent Confirmation Modal */}
      <AnimatePresence>
        {showOnboardingSentFor && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-zinc-900 border border-emerald-500/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(16,185,129,0.15)] relative text-center"
            >
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="text-emerald-500" size={32} />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Onboarding Sent!</h3>
              <p className="text-zinc-400 text-base mb-8 leading-relaxed">
                An automated onboarding email has been sent to <span className="text-zinc-200 font-medium">{showOnboardingSentFor.name}</span>. 
                <br /><br />
                The candidate now has access to their personal portal to complete the required documents.
              </p>
              
              <button 
                onClick={() => {
                  const emp = showOnboardingSentFor;
                  setShowOnboardingSentFor(null);
                  if (onSelectEmployee) onSelectEmployee(emp);
                }}
                className="w-full py-3 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                View Onboarding Detail
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
