import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Mail,
  CheckCircle2,
  CircleDashed,
  AlertCircle,
  FileText,
  Shield,
  CreditCard,
  Building,
  BellRing,
  X,
  FileAxis3D
} from 'lucide-react';
import { OnboardingEmployee, OnboardingTask } from '../types/onboarding';
import { getWorkflow } from '../api';
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
      staggerChildren: 0.08,
    }
  }
};

interface TaskWithIcon extends OnboardingTask {
  icon: React.ReactNode;
  isInternal?: boolean;
  targetEmail?: string;
  targetName?: string;
}

export default function OnboardingDetailView({ employee, onBack }: { employee: any; onBack: () => void }) {
  // Mock detailed data
  const completedCountTarget = Math.floor((employee.progress || 0) / 20);

  // If this employee has a real workflow, load and update task statuses
  const workflowId = employee._workflow?.workflow_id || employee.id;

  useEffect(() => {
    const loadWorkflow = async () => {
      if (!employee._workflow?.workflow_id) return;
      try {
        const w = await getWorkflow(employee._workflow.workflow_id);
        if (w.completed_steps) {
          const completedStepNames = w.completed_steps.map((s: any) =>
            typeof s === 'string' ? s : s.step
          );
          setHrTasks(prev => prev.map(task => {
            const stepMap: Record<string, string> = {
              'hr1': 'create_employee_record',
              'hr2': 'create_laptop_request',
              'hr3': 'create_email_account',
              'hr4': 'create_payroll_setup',
              'hr5': 'request_building_access',
            };
            const mappedStep = stepMap[task.id];
            if (mappedStep && completedStepNames.includes(mappedStep)) {
              return { ...task, status: 'Completed' };
            }
            return task;
          }));
        }
      } catch {}
    };
    loadWorkflow();
  }, [employee._workflow?.workflow_id]);

  const [tasks, setTasks] = useState<TaskWithIcon[]>([
    {
      id: 't1',
      title: 'Signed Offer Letter',
      description: 'Counter-signed digital offer letter',
      status: 'Completed',
      dueDate: '2026-04-15',
      icon: <FileText size={18} />
    },
    {
      id: 't2',
      title: 'Non-Disclosure Agreement',
      description: 'Standard company NDA',
      status: 'Completed',
      dueDate: '2026-04-16',
      icon: <Shield size={18} />
    },
    {
      id: 't3',
      title: 'Government ID',
      description: 'Passport or Driver License for I-9 verification',
      status: employee.progress && employee.progress >= 20 ? 'Completed' : 'Pending',
      dueDate: '2026-04-25', 
      icon: <FileText size={18} />
    },
    {
      id: 't4',
      title: 'Direct Deposit Form',
      description: 'Bank details for payload routing',
      status: employee.progress && employee.progress >= 40 ? 'Completed' : 'Pending',
      dueDate: '2026-04-26',
      icon: <CreditCard size={18} />
    },
    {
      id: 't5',
      title: 'Benefits Enrollment',
      description: 'Health, Dental, and Vision selection',
      status: employee.progress && employee.progress >= 60 ? 'Completed' : 'Pending',
      dueDate: '2026-05-02',
      icon: <Building size={18} />
    }
  ]);

  const [hrTasks, setHrTasks] = useState<TaskWithIcon[]>([
    {
      id: 'hr1',
      title: 'Create Employee Record',
      description: 'Setup core HR profile and personal information.',
      status: 'Completed',
      dueDate: '2026-04-10',
      icon: <FileText size={18} />,
      isInternal: true,
      targetEmail: 'hr@glm.com',
      targetName: 'Human Resources'
    },
    {
      id: 'hr2',
      title: 'Laptop & Hardware Request',
      description: 'Provisioning device and shipping to employee.',
      status: 'Pending',
      dueDate: '2026-04-26', 
      icon: <CheckCircle2 size={18} />,
      isInternal: true,
      targetEmail: 'it@glm.com',
      targetName: 'IT Operations'
    },
    {
      id: 'hr3',
      title: 'Email Account Creation',
      description: 'Generate corporate email and active directory sync.',
      status: 'Completed',
      dueDate: '2026-04-12',
      icon: <Mail size={18} />,
      isInternal: true,
      targetEmail: 'it@glm.com',
      targetName: 'IT Operations'
    },
    {
      id: 'hr4',
      title: 'Payroll & Benefits Setup',
      description: 'Configure W-4, direct deposit, and benefit class.',
      status: 'Pending',
      dueDate: '2026-04-25', 
      icon: <CreditCard size={18} />,
      isInternal: true,
      targetEmail: 'payroll@glm.com',
      targetName: 'Payroll Department'
    },
    {
      id: 'hr5',
      title: 'Building Access Request',
      description: 'Physical security badge provisioning.',
      status: 'Completed',
      dueDate: '2026-04-20', 
      icon: <Building size={18} />,
      isInternal: true,
      targetEmail: 'facilities@glm.com',
      targetName: 'Facilities'
    }
  ]);

  const [reminderSent, setReminderSent] = useState<Record<string, boolean>>({});
  const [isSending, setIsSending] = useState<Record<string, boolean>>({});
  const [viewTaskDetails, setViewTaskDetails] = useState<TaskWithIcon | null>(null);
  const [automatingTask, setAutomatingTask] = useState<TaskWithIcon | null>(null);
  const [automationProgress, setAutomationProgress] = useState(0);

  const handleAutomateProcess = (task: TaskWithIcon) => {
    setAutomatingTask(task);
    setAutomationProgress(0);
    
    const interval = setInterval(() => {
      setAutomationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setAutomatingTask(null);
            setReminderSent(prev => ({ ...prev, [task.id]: true }));
          }, 800);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 200);
  };

  const handleSendReminder = async (task: TaskWithIcon) => {
    if (task.isInternal) {
      handleAutomateProcess(task);
      return;
    }
    
    setIsSending(prev => ({ ...prev, [task.id]: true }));
    try {
      const response = await fetch('/api/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail: task.isInternal ? task.targetEmail : employee.email,
          targetName: task.isInternal ? task.targetName : employee.name,
          employeeName: employee.name,
          taskTitle: task.title,
          dueDate: task.dueDate,
          isInternal: task.isInternal || false
        })
      });
      
      if (response.ok) {
        setReminderSent(prev => ({ ...prev, [task.id]: true }));
        setTimeout(() => {
          setReminderSent(prev => ({ ...prev, [task.id]: false }));
        }, 5000); // Reset after 5 seconds to simulate it sent
      } else {
        alert('Failed to send reminder via backend. Please check server logs.');
      }
    } catch (error) {
      console.error(error);
      alert('Error sending reminder');
    } finally {
      setIsSending(prev => ({ ...prev, [task.id]: false }));
    }
  };

  const renderDocumentMockup = (taskId: string) => {
    switch (taskId) {
      case 't1': // Offer Letter
        return (
          <div className="w-full text-black font-sans text-[10px] sm:text-xs text-left p-4">
             <div className="flex justify-end mb-8 items-center gap-2 text-blue-800">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <span className="text-blue-900 font-bold text-2xl">🦁</span>
                </div>
                <span className="font-serif italic font-bold text-2xl">Safari Aviation</span>
             </div>
             <div className="mb-6 space-y-1">
               <p>REF: LJO2409071</p>
               <p>Saturday, 07 September 2024</p>
               <p className="font-bold underline text-center mt-4">SUBJECT: JOB OFFER - PART TIME</p>
             </div>
             <p className="font-bold mb-4">Dear Ahmad Mussa Abdallah Albloushi,</p>
             <p className="mb-4 text-justify">
               Safari Aviation Services is pleased to offer you the position of "Operations Assistant" as per terms and benefits listed hereunder. A summary of the main duties and responsibilities which will be assigned to you are listed in Annex A. This is a part-time position, you are required to be present for a minimum of 3 days a week and atleast for 6 hours during the working days.
             </p>
             <ul className="mb-6 space-y-2 list-none">
               <li><strong>Salary:</strong><span className="ml-8">AED 1,600.00 Per Calendar Month</span></li>
               <li><strong>Transportation:</strong><span className="ml-4">AED 400.00 Per Calendar Month</span></li>
               <li><strong>Vacation:</strong><span className="ml-8">30 calendar days paid vacation per each year of service.</span></li>
               <li><strong>Probation Period:</strong><span className="ml-2">03 months from starting date.</span></li>
               <li><strong>Contract Period:</strong><span className="ml-4">Period of this contract shall be 1 years from starting date...</span></li>
             </ul>
             <div className="border border-black p-6 mt-12 bg-white">
                <p className="font-bold mb-6">Acceptance of the Offer:</p>
                <p className="mb-12">By signing and dating this letter, I, the undersigned accept this job offer...</p>
                <div className="flex justify-between items-end">
                  <div className="flex-1 mr-4 border-b border-black border-dashed pb-2">Name: Ahmad Mussa</div>
                  <div className="flex-1 ml-4 border-b border-black border-dashed pb-2">Date: 08 Sep 2024</div>
                </div>
                <div className="mt-8 border-b border-black border-dashed w-1/2 pb-2 relative">
                  Signature:
                  <div className="absolute right-8 bottom-0 -rotate-12 italic text-2xl text-blue-700">Ahmad</div>
                </div>
             </div>
          </div>
        );
      case 't2': // NDA
        return (
          <div className="w-full text-black font-sans text-xs text-left p-4">
            <div className="font-bold underline text-center mb-8 text-sm">Employer-Employee Non-Disclosure Agreement Template</div>
            <p className="mb-6 text-justify leading-relaxed">
              This Non-Disclosure Agreement (the "Agreement") is made and entered into as of [Effective Date], by and between [Name of Employer], with a principal place of business at [Employer's Address], and [Name of Employee], with a principal place of residence at [Employee's Address]. Collectively referred to as the "Parties."
            </p>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold mb-2">1. CONFIDENTIAL INFORMATION</h3>
                <p className="text-justify leading-relaxed">For the purposes of this Agreement, "Confidential Information" shall include any and all non-public information, data, trade secrets, proprietary information...</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">2. OBLIGATIONS OF CONFIDENTIALITY</h3>
                <p className="text-justify leading-relaxed">The Employee agrees to maintain the confidentiality of all Confidential Information received during the term of employment...</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">3. SCOPE</h3>
                <p className="text-justify leading-relaxed">The obligations of confidentiality apply to all Confidential Information disclosed to the Employee during the term of employment...</p>
              </div>
            </div>
          </div>
        );
      case 't3': // Government ID
        return (
          <div className="w-full flex items-center justify-center p-8">
             <div className="w-[400px] h-[250px] bg-gradient-to-br from-cyan-200 to-blue-300 rounded-2xl shadow-xl p-4 relative overflow-hidden flex flex-col border border-blue-400">
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==')]"></div>
                
                <div className="flex justify-between items-start z-10 relative">
                   <div className="flex font-bold text-indigo-900 tracking-tighter leading-tight drop-shadow-sm">
                     <div>
                       <span className="text-[10px]">KAD PENGENALAN</span><br/>
                       <span className="text-lg leading-none">MALAYSIA</span><br/>
                       <span className="text-[8px] tracking-widest leading-none">IDENTITY CARD</span>
                     </div>
                   </div>
                   <div className="flex gap-2 items-center">
                      <span className="text-blue-800 font-bold italic text-sm">MyKad</span>
                      <div className="w-8 h-5 bg-red-500 relative flex border border-white">
                        <div className="w-4 h-3 bg-blue-900 absolute top-0 left-0"></div>
                        <div className="w-full flex flex-col justify-between">
                          <div className="h-0.5 bg-white"></div>
                          <div className="h-0.5 bg-white"></div>
                          <div className="h-0.5 bg-white"></div>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="mt-2 text-indigo-950 font-mono font-bold text-lg tracking-wider z-10 relative">
                  050905-10-2913
                </div>

                <div className="flex mt-2 z-10 relative border-t border-blue-300 pt-2">
                  <div className="flex-1 flex flex-col gap-2">
                     <div className="w-12 h-10 bg-yellow-400/80 rounded-md border border-yellow-600 grid grid-cols-3 grid-rows-3 gap-[1px] p-[2px]">
                        <div className="bg-yellow-200 col-span-2"></div>
                        <div className="bg-yellow-200"></div>
                        <div className="bg-yellow-200"></div>
                        <div className="bg-yellow-200 col-span-2"></div>
                     </div>
                     
                     <div className="mt-4 font-bold text-indigo-950 text-sm">
                       ONG KAI JIN
                     </div>

                     <div className="mt-4 text-[9px] font-bold text-indigo-950 leading-tight">
                       19A JALAN KP 21<br/>
                       TAMAN KRUBONG PERDANA<br/>
                       75260 MELAKA<br/>
                       MELAKA
                     </div>
                  </div>

                  <div className="w-28 flex flex-col items-center">
                     <div className="w-16 h-20 bg-blue-100/30 border border-blue-300/50 absolute top-[40px] right-[110px] opacity-40"></div>
                     
                     <div className="w-24 h-32 bg-gray-200 border-2 border-white shadow-sm overflow-hidden flex items-end justify-center">
                       <div className="w-16 h-16 bg-gray-400 rounded-t-full mt-4 flex items-center justify-center text-white overflow-hidden">
                         👦
                       </div>
                     </div>
                     <div className="text-[8px] font-bold text-center mt-1 text-indigo-950 leading-tight">
                       WARGANEGARA<br/>LELAKI
                     </div>
                  </div>
                </div>
             </div>
          </div>
        );
      case 't4': // Direct Deposit
        return (
           <div className="w-full text-black font-sans text-[10px] text-left p-4">
              <div className="flex justify-between font-bold mb-4 border-b-2 border-black pb-2 text-sm items-center">
                <div className="italic text-xl tracking-tighter w-full">DIRECT DEPOSIT <span className="text-base text-gray-500 font-normal">SIGN-UP FORM</span></div>
                <div className="text-[8px] font-normal w-32 text-right">OMB No. 1205-0001</div>
              </div>
              
              <div className="bg-gray-100 text-center font-bold py-1 border border-black mb-2 uppercase tracking-wide">
                Section 1 (To be completed by payee)
              </div>
              
              <div className="grid grid-cols-2 gap-2 border border-black p-2 mb-4">
                 <div className="border-r border-black pr-2">
                   <p className="font-bold mb-1">A NAME OF PAYEE (last, first, middle initial)</p>
                   <p className="p-1 border border-gray-300 bg-gray-50 uppercase text-blue-800">Smith, John A.</p>
                   
                   <p className="font-bold mt-2 mb-1">ADDRESS (street, route, P.O. Box)</p>
                   <p className="p-1 border border-gray-300 bg-gray-50 uppercase text-blue-800">123 Main St, Apt 4B</p>
                 </div>
                 <div>
                   <p className="font-bold mb-1">D TYPE OF DEPOSITOR ACCOUNT</p>
                   <div className="flex gap-4 p-1">
                     <label className="flex items-center gap-1"><input type="radio" checked readOnly/> Checking</label>
                     <label className="flex items-center gap-1"><input type="radio" disabled/> Savings</label>
                   </div>
                   
                   <p className="font-bold mt-2 mb-1">E DEPOSITOR ACCOUNT NUMBER</p>
                   <p className="p-1 border border-gray-300 bg-gray-50 font-mono tracking-widest text-blue-800">000123456789</p>
                 </div>
              </div>

              <div className="bg-gray-100 text-center font-bold py-1 border border-black mb-2 uppercase tracking-wide mt-8">
                Section 3 (To be completed by financial institution)
              </div>
              
              <div className="border border-black p-2 mb-4">
                 <p className="font-bold mb-1">ROUTING NUMBER</p>
                 <div className="flex">
                   {'987654321'.split('').map((num, i) => (
                     <div key={i} className="w-6 h-8 border border-black flex items-center justify-center font-mono font-bold text-blue-800 bg-gray-50">{num}</div>
                   ))}
                 </div>
              </div>
           </div>
        );
      case 't5': // Benefits
        return (
           <div className="w-full text-black font-sans text-[10px] text-left p-4">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg italic tracking-tighter">B</div>
                  <span className="font-bold text-lg tracking-tight">BenefitMall</span>
                </div>
                <div className="text-center font-bold text-base leading-tight uppercase relative left-4">Employee<br/>Election Form</div>
                <div className="flex flex-col items-end gap-1">
                  <div className="w-32 border-b border-black text-[9px] text-right">BMLL Billing #</div>
                  <div className="w-32 border-b border-black text-[9px] text-right">Effective Date</div>
                </div>
              </div>

              <div className="border-2 border-black flex uppercase font-bold text-[9px] bg-gray-100 items-center justify-center py-1">
                 This is not an application for insurance
              </div>

              <div className="border-x-2 border-black flex">
                <div className="flex-1 border-r-2 border-black p-1">
                  <div className="text-[10px] font-bold">Last Name</div>
                  <div className="font-medium text-blue-800 uppercase pl-1">Smith</div>
                </div>
                <div className="flex-[2] border-r-2 border-black p-1">
                  <div className="text-[10px] font-bold">First Name</div>
                  <div className="font-medium text-blue-800 uppercase pl-1">John</div>
                </div>
                <div className="flex-[2] p-1">
                  <div className="text-[10px] font-bold">Employer</div>
                  <div className="font-medium text-blue-800 uppercase pl-1">Acme Corp</div>
                </div>
              </div>

              <div className="border-x-2 border-y-2 border-black flex bg-gray-200">
                 <div className="p-1 font-bold">MEDICAL PLAN (if offered)</div>
              </div>
              
              <div className="border-x-2 border-b-2 border-black p-2">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1"><input type="radio" disabled/> Employee Only</div>
                      <div className="flex items-center gap-2 mb-1"><input type="radio" checked readOnly/> Employee & Spouse</div>
                      <div className="flex items-center gap-2 mb-1"><input type="radio" disabled/> Employee / Child(ren)</div>
                      <div className="flex items-center gap-2"><input type="radio" disabled/> Family</div>
                    </div>
                    <div>
                      <div className="border border-black p-2">
                         <span className="text-[10px] font-bold">Carrier:</span> <span className="font-mono text-blue-800">BlueCross</span><br/><br/>
                         <span className="text-[10px] font-bold">Plan Type:</span> <span className="font-mono text-blue-800">PPO</span>
                      </div>
                    </div>
                 </div>
              </div>
           </div>
        );
      default:
        return (
          <div className="w-full flex-1 flex items-center justify-center text-gray-400">
             <FileText size={48} className="mb-4 opacity-50" />
             <p>Document preview placeholder for {taskId}</p>
          </div>
        );
    }
  };

  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <motion.div 
      className="max-w-4xl mx-auto flex flex-col gap-6 w-full pb-10"
      initial="hidden"
      animate="visible"
      variants={STAGGER_CONTAINER}
    >
      <motion.button 
        variants={FADE_UP_ANIMATION}
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Onboarding List
      </motion.button>

      <motion.div variants={FADE_UP_ANIMATION} className="bg-zinc-900/40 border border-white/5 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 flex items-center justify-center text-purple-300 font-medium text-2xl shrink-0">
              {employee.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white tracking-tight">{employee.name}</h1>
              <div className="flex items-center gap-3 text-sm text-zinc-400 mt-1">
                <span>{employee.role}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                <span>{employee.department}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-500 mt-2">
                <Mail size={14} />
                {employee.email}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-6 border-t border-white/5 overflow-x-auto scrollbar-hide">
            <div className="flex items-start min-w-[700px]">
              
              <div className="flex-1 flex w-full">
                {tasks.map((task, index) => {
                  const isCompleted = task.status === 'Completed';
                  const firstPendingIndex = tasks.findIndex((t: TaskWithIcon) => t.status !== 'Completed');
                  const isCurrent = index === firstPendingIndex;
                  const isLast = index === tasks.length - 1;

                  return (
                     <div key={task.id} className={`flex flex-col relative ${isLast ? 'flex-none w-32' : 'flex-1 pr-2'}`}>
                        <div className="flex items-center w-full mb-4">
                           {/* The Circle */}
                           <div className="shrink-0 relative z-10 w-7 h-7 flex justify-center items-center">
                               {isCompleted ? (
                                 <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center">
                                   <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                     <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                   </svg>
                                 </div>
                               ) : isCurrent ? (
                                 <div className="w-7 h-7 rounded-full border-2 border-purple-500 flex items-center justify-center bg-zinc-900 border-opacity-80">
                                   <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                                 </div>
                               ) : (
                                 <div className="w-7 h-7 rounded-full bg-purple-500/20" />
                               )}
                           </div>

                           {/* The connecting line! */}
                           {!isLast && (
                              <div className={`h-[2px] w-full ml-3 lg:mr-2 ${isCompleted ? 'bg-purple-600' : 'bg-white/10'}`} />
                           )}
                        </div>
                        
                        <div className="flex flex-col pr-4">
                          <span className="text-[11px] text-zinc-500 font-semibold mb-1 uppercase tracking-widest text-opacity-80">Step {index + 1}</span>
                          <span className="text-sm font-semibold text-zinc-200 leading-tight mb-1.5">{task.title}</span>
                          {isCompleted ? (
                             <span className="text-[12px] text-emerald-500 font-medium tracking-wide">Completed</span>
                          ) : isCurrent ? (
                             <span className="text-[12px] text-purple-400 font-medium tracking-wide">In Progress</span>
                          ) : (
                             <span className="text-[12px] text-zinc-500 font-medium tracking-wide">Pending</span>
                          )}
                        </div>
                     </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={FADE_UP_ANIMATION}>
        <h2 className="text-lg font-medium text-zinc-200 mb-4 px-1">Required Documents & Tasks (Employee)</h2>
        
        <div className="space-y-3">
          {tasks.map(task => renderTask(task, false))}
        </div>
      </motion.div>

      <motion.div variants={FADE_UP_ANIMATION}>
        <h2 className="text-lg font-medium text-zinc-200 mb-4 px-1">Internal HR & IT Tasks</h2>
        
        <div className="space-y-3">
          {hrTasks.map(task => renderTask(task, true))}
        </div>
      </motion.div>

      {/* Task Details Modal */}
      <AnimatePresence>
        {viewTaskDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-zinc-800 text-zinc-400">
                    {viewTaskDetails.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{viewTaskDetails.title}</h3>
                    <p className="text-sm text-zinc-400">{viewTaskDetails.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewTaskDetails(null)}
                  className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 bg-zinc-950/50 flex-1 overflow-y-auto flex flex-col items-center justify-start relative">
                {viewTaskDetails.isInternal ? (
                  <div className="w-full max-w-2xl bg-zinc-900/80 border border-white/5 rounded-lg shadow-xl p-8 min-h-[350px]">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                         {viewTaskDetails.icon}
                      </div>
                      <div>
                        <h4 className="text-xl font-medium text-zinc-200">Internal Process Details</h4>
                        <p className="text-sm text-zinc-500">System specifications & routing details</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 text-sm mt-8">
                       <div className="flex justify-between border-b border-white/5 pb-2">
                         <span className="text-zinc-500">Assigned To</span>
                         <span className="text-zinc-300 font-mono tracking-wide">{viewTaskDetails.targetName || 'IT Support / Systems'}</span>
                       </div>
                       <div className="flex justify-between border-b border-white/5 pb-2">
                         <span className="text-zinc-500">Contact Email</span>
                         <span className="text-zinc-300 font-mono tracking-wide">{viewTaskDetails.targetEmail || 'ops@company.com'}</span>
                       </div>
                       <div className="flex justify-between border-b border-white/5 pb-2">
                         <span className="text-zinc-500">Priority Level</span>
                         <span className="text-red-400 font-mono tracking-wide px-2 bg-red-400/10 rounded">HIGH</span>
                       </div>
                    </div>
                  </div>
                ) : viewTaskDetails.status === 'Pending' ? (
                  <div className="w-full max-w-2xl bg-zinc-900/50 rounded-lg border border-dashed border-white/10 flex flex-col items-center justify-center p-12 min-h-[350px]">
                    <FileText size={48} className="text-zinc-600 mb-4" />
                    <p className="text-lg font-medium text-zinc-300">Document Pending</p>
                    <p className="text-sm text-zinc-500 max-w-md mt-2 text-center">Employee has not submitted this document yet.</p>
                  </div>
                ) : (
                  <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col items-center justify-start p-8 min-h-[450px]">
                    {renderDocumentMockup(viewTaskDetails.id)}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/5 bg-black/20 flex items-center justify-end gap-3 shrink-0">
                <button
                  onClick={() => setViewTaskDetails(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-colors border border-white/5 bg-black/20"
                >
                  Close
                </button>
                
                {!viewTaskDetails.isInternal ? (
                  viewTaskDetails.status !== 'Pending' && (
                    <>
                      <div className="h-6 w-px bg-white/10 mx-2" />
                      <button
                        onClick={() => setViewTaskDetails(null)}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors border border-red-500/20"
                      >
                        Reject & Request Edit
                      </button>
                      <button
                        onClick={() => {
                           setReminderSent(prev => ({ ...prev, [viewTaskDetails.id]: true }));
                           setViewTaskDetails(null);
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-emerald-950 bg-emerald-500 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                      >
                        Approve Document
                      </button>
                    </>
                  )
                ) : (
                  viewTaskDetails.status !== 'Completed' && (
                    <>
                      <div className="h-6 w-px bg-white/10 mx-2" />
                      <button
                        onClick={() => {
                          setViewTaskDetails(null);
                          handleAutomateProcess(viewTaskDetails);
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                      >
                        <BellRing size={16} />
                        Automate Process
                      </button>
                    </>
                  )
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

              <h3 className="text-xl font-semibold text-white mb-2">Automating Process</h3>
              <p className="text-sm text-zinc-400 mb-8 max-w-[280px]">
                Initiating automated workflow for <span className="text-zinc-200 font-medium">"{automatingTask.title}"</span>. Please wait while systems sync.
              </p>

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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  function renderTask(task: TaskWithIcon, isHrTask: boolean) {
    const isCompleted = task.status === 'Completed';
    const dueDateObj = new Date(task.dueDate);
    const today = new Date('2026-04-24'); // Mock today's date based on context
    const diffTime = dueDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Within next 2 days warning (0-2 days)
    const isCloseToDeadline = !isCompleted && diffDays <= 2 && diffDays >= 0;
    const isOverdue = !isCompleted && diffDays < 0;

    return (
      <div 
        key={task.id}
        className={`bg-zinc-900/40 border border-white/5 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${
          isCloseToDeadline ? 'border-yellow-500/30 bg-yellow-500/5' : ''
        } ${
          isOverdue ? 'border-red-500/30 bg-red-500/5' : ''
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-lg ${
            isCompleted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
          }`}>
            {task.icon}
          </div>
          <div>
            <h3 className={`font-medium ${isCompleted ? 'text-zinc-300' : 'text-zinc-200'}`}>
              {task.title}
            </h3>
            <p className="text-sm text-zinc-500 mt-0.5">{task.description}</p>
            
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5">
                {isCompleted ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                    <CheckCircle2 size={12} />
                    Submitted
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-xs font-medium border border-zinc-700">
                    <CircleDashed size={12} />
                    Pending
                  </span>
                )}
              </div>
              
              {!isCompleted && (
                <div className={`text-xs font-medium flex items-center gap-1 ${
                  isOverdue ? 'text-red-400' : 
                  isCloseToDeadline ? 'text-yellow-400' : 
                  'text-zinc-500'
                }`}>
                  {(isOverdue || isCloseToDeadline) && <AlertCircle size={12} />}
                  Due: {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {isOverdue && ' (Overdue)'}
                  {isCloseToDeadline && ' (Expiring soon)'}
                </div>
              )}
              
              <button 
                onClick={() => setViewTaskDetails(task)}
                className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors">
                View Details
              </button>
            </div>
          </div>
        </div>

        {!isCompleted && (isCloseToDeadline || isOverdue) && (
          <div className="md:w-auto w-full pt-3 md:pt-0 border-t border-white/5 md:border-none flex justify-end">
            <button 
              onClick={() => {
                handleSendReminder(task)
              }}
              disabled={reminderSent[task.id] || isSending[task.id]}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                reminderSent[task.id] 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 cursor-not-allowed'
                  : isSending[task.id] ? 'bg-indigo-500/50 text-white/50 cursor-wait'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              }`}
            >
              {reminderSent[task.id] ? (
                <>
                  <CheckCircle2 size={16} />
                  {task.isInternal ? 'Process Automated' : 'Automated Mail Sent'}
                </>
              ) : (
                <>
                  <BellRing size={16} />
                  {task.isInternal ? 'Automate Process' : 'Automate Reminder'}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }
}
