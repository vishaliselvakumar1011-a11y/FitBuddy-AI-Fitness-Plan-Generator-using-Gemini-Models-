import React, { useState } from 'react';
import { 
  User, 
  Server, 
  Sparkles, 
  Calendar, 
  MessageSquare, 
  RefreshCw, 
  Database,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Info
} from 'lucide-react';

interface PipelineVisualizerProps {
  currentStep?: 'idle' | 'intake' | 'backend' | 'generating' | 'active-plan' | 'feedback' | 'updating' | 'stored';
  hasActivePlan: boolean;
  hasFeedbackHistory: boolean;
  feedbackCount: number;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  currentStep = 'active-plan',
  hasActivePlan,
  hasFeedbackHistory,
  feedbackCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const steps = [
    {
      id: 1,
      icon: User,
      title: 'User Details',
      subtitle: 'Age, weight, goals, intensity',
      color: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
      badge: 'Step 1'
    },
    {
      id: 2,
      icon: Server,
      title: 'FastAPI / API',
      subtitle: 'Request routing & validation',
      color: 'text-blue-400',
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10',
      badge: 'Step 2'
    },
    {
      id: 3,
      icon: Sparkles,
      title: 'Gemini AI',
      subtitle: 'Sports reasoning & generation',
      color: 'text-purple-400',
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/10',
      badge: 'Step 3'
    },
    {
      id: 4,
      icon: Calendar,
      title: '7-Day Plan + Nutrition',
      subtitle: 'Workouts, macros & recovery',
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      badge: 'Step 4',
      active: hasActivePlan
    },
    {
      id: 5,
      icon: MessageSquare,
      title: 'User Feedback',
      subtitle: 'Cardio, rest, knee tweaks',
      color: 'text-cyan-400',
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-500/10',
      badge: 'Step 5',
      active: hasFeedbackHistory
    },
    {
      id: 6,
      icon: RefreshCw,
      title: 'Updated Workout Plan',
      subtitle: 'Gemini adapts routine',
      color: 'text-teal-400',
      border: 'border-teal-500/30',
      bg: 'bg-teal-500/10',
      badge: 'Step 6',
      active: hasFeedbackHistory
    },
    {
      id: 7,
      icon: Database,
      title: 'Database (SQLite)',
      subtitle: 'Users, original & updated plans',
      color: 'text-indigo-400',
      border: 'border-indigo-500/30',
      bg: 'bg-indigo-500/10',
      badge: 'Step 7',
      active: hasActivePlan
    }
  ];

  return (
    <div className="mb-6 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 overflow-hidden shadow-lg transition-all">
      {/* Header Bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-800/40 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                FitBuddy Architecture Pipeline
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                End-to-End Flow Active
              </span>
              {feedbackCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/20">
                  {feedbackCount} Feedback Cycles Applied
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400">
              User Details → FastAPI → Gemini AI → 7-Day Workout + Nutrition → User Feedback → Updated Plan → Database
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-zinc-400">
          <span className="text-[11px] hidden sm:inline text-zinc-400">
            {isExpanded ? 'Hide Pipeline Flow' : 'View Pipeline Flow'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </div>
      </button>

      {/* Expanded Pipeline Stages */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-zinc-800/60 bg-zinc-950/40">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2.5 items-stretch relative">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={s.id} className="relative flex flex-col">
                  <div className={`flex-1 p-3 rounded-xl border ${s.border} ${s.bg} flex flex-col justify-between transition-all hover:scale-[1.02]`}>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                          {s.badge}
                        </span>
                        {s.active ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white mb-0.5 leading-tight">
                        {s.title}
                      </h4>
                      <p className="text-[10px] text-zinc-400 leading-tight">
                        {s.subtitle}
                      </p>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[9px] text-zinc-400">
                      <span className="font-mono">Stage 0{s.id}</span>
                      <span className={s.active ? "text-emerald-400 font-semibold" : "text-zinc-500"}>
                        {s.active ? "Synced" : "Ready"}
                      </span>
                    </div>
                  </div>

                  {/* Flow Arrow for desktop */}
                  {idx < steps.length - 1 && (
                    <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-zinc-900 border border-zinc-700 items-center justify-center pointer-events-none">
                      <ArrowRight className="w-2.5 h-2.5 text-zinc-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-3 px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>
                <strong>Persistent Lifecycle:</strong> When you submit feedback (e.g. &ldquo;Add more cardio&rdquo;), the existing plan baseline is preserved, Gemini adjusts set/rep volume, and both versions are updated in the SQLite/database store.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
