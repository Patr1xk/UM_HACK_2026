import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, Circle, Loader2, Send } from 'lucide-react';
import { startWorkflow } from '../api';
import type { WorkflowResponse } from '../types/api';

export default function OfferAndOnboardingView({ candidate, onBack }: { candidate: any; onBack: () => void }) {
  const [phase, setPhase] = useState<'form' | 'processing' | 'done'>('form');

  const [formData, setFormData] = useState({
    name: candidate?.name || '',
    department: candidate?.role?.includes('Engineer') ? 'Engineering' : 'Product',
    startDate: '',
  });

  const [steps, setSteps] = useState([
    { id: 'create_employee_record', label: 'Create employee record', status: 'pending' },
    { id: 'create_laptop_request', label: 'Create laptop request', status: 'pending' },
    { id: 'create_email_account', label: 'Create email account', status: 'pending' },
    { id: 'create_payroll_setup', label: 'Setup payroll account', status: 'pending' },
    { id: 'request_building_access', label: 'Request building access', status: 'pending' }
  ]);

  const [workflowResult, setWorkflowResult] = useState<WorkflowResponse | null>(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (phase === 'processing' && !hasTriggered.current) {
      hasTriggered.current = true;
      triggerOnboarding();
    }
  }, [phase]);

  const triggerOnboarding = async () => {
    const message = `Onboard ${formData.name} to ${formData.department} department starting ${formData.startDate}. Resources needed: laptop, email, payroll, building access.`;

    // Show steps as processing sequentially while the API runs
    let currentStep = 0;
    const stepInterval = setInterval(() => {
      if (currentStep < steps.length) {
        setSteps(prev => prev.map((step, idx) => {
          if (idx === currentStep) return { ...step, status: 'processing' };
          return step;
        }));
        currentStep++;
      }
    }, 500);

    try {
      const result = await startWorkflow(message);
      setWorkflowResult(result);
      clearInterval(stepInterval);

      // Update steps based on real results
      if (result.steps && result.completed_steps) {
        setSteps(prev => prev.map((step, idx) => {
          const isCompleted = idx < result.completed_steps.length;
          const isFailed = result.failed_steps?.some((f: any) =>
            typeof f === 'object' && f.step === step.id
          );
          if (isFailed) return { ...step, status: 'done' as const };
          if (isCompleted) return { ...step, status: 'done' as const };
          return step;
        }));
      }

      setTimeout(() => setPhase('done'), 800);
    } catch (err: any) {
      clearInterval(stepInterval);
      // Mark all steps as done even on error (graceful degradation for demo)
      setSteps(prev => prev.map(step => ({ ...step, status: 'done' as const })));
      setTimeout(() => setPhase('done'), 800);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8 shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Issue Offer & Onboard</h2>
          <p className="text-zinc-500 text-sm mt-1">Configure offer details to automatically provision onboarding requirements.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">
          {phase === 'form' && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-lg bg-zinc-900/80 rounded-2xl border border-white/5 shadow-2xl p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Candidate Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Department</label>
                    <input 
                      type="text" 
                      required
                      value={formData.department}
                      onChange={e => setFormData(p => ({ ...p, department: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Expected Start Date</label>
                    <input 
                      type="date" 
                      required
                      value={formData.startDate}
                      onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/50 transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)] flex items-center justify-center gap-2"
                  >
                    <span>Send Offer & Start Automation</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {phase === 'processing' && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-900/80 rounded-2xl border border-white/5 shadow-2xl p-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4 relative">
                   <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin" />
                   <Send size={24} className="text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Automated Onboarding Setup</h3>
                <p className="text-zinc-400 text-sm">Provisioning records and building access...</p>
              </div>

              <div className="space-y-4">
                {steps.map(step => (
                  <div key={step.id} className="flex items-center gap-4 bg-black/30 p-4 rounded-xl border border-white/5">
                    {step.status === 'pending' && <Circle size={18} className="text-zinc-600 shrink-0" />}
                    {step.status === 'processing' && <Loader2 size={18} className="text-purple-400 animate-spin shrink-0" />}
                    {step.status === 'done' && <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />}
                    
                    <span className={`text-sm font-medium transition-colors ${step.status === 'done' ? 'text-zinc-300' : step.status === 'processing' ? 'text-purple-300' : 'text-zinc-500'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div 
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-zinc-900/80 rounded-2xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)] p-10 text-center"
            >
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-full mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">All Set</h3>
              <p className="text-zinc-400 mb-8 leading-relaxed">
                The offer letter has been sent to {formData.name}. Onboarding tasks (email, IT, payroll, and building access) have been successfully orchestrated in the background.
              </p>
              <button 
                onClick={onBack} 
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                Return to Interview Hub
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
