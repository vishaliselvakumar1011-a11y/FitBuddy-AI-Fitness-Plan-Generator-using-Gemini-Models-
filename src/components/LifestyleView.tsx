import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Moon, 
  Smile, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Wind, 
  CalendarCheck, 
  Play, 
  Pause, 
  RotateCcw 
} from 'lucide-react';
import { LifestylePlan } from '../types/fitness';

interface LifestyleViewProps {
  lifestyle: LifestylePlan;
}

export const LifestyleView: React.FC<LifestyleViewProps> = ({ lifestyle }) => {
  const [completedHabits, setCompletedHabits] = useState<Record<number, boolean>>({});

  // Interactive Box Breathing state (4-4-4-4 technique)
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Hold (Empty)'>('Inhale');
  const [phaseSecondsRemaining, setPhaseSecondsRemaining] = useState(4);

  useEffect(() => {
    let timer: any = null;
    if (breathingActive) {
      timer = setInterval(() => {
        setPhaseSecondsRemaining((prev) => {
          if (prev <= 1) {
            setBreathPhase((current) => {
              if (current === 'Inhale') return 'Hold';
              if (current === 'Hold') return 'Exhale';
              if (current === 'Exhale') return 'Hold (Empty)';
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathPhase('Inhale');
      setPhaseSecondsRemaining(4);
    }
    return () => clearInterval(timer);
  }, [breathingActive]);

  const toggleHabit = (idx: number) => {
    setCompletedHabits((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: FitBuddy AI Coach Letter */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/20 p-6 sm:p-8">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            FitBuddy Coach's Personal Note
          </span>
        </div>
        <p className="text-sm sm:text-base text-zinc-200 italic leading-relaxed">
          "{lifestyle.coachMessage}"
        </p>
      </div>

      {/* Two Column Section: Box Breathing Widget + Daily Habits Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interactive Box Breathing Widget */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Box Breathing Regulator
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold">
                Parasympathetic Reset
              </span>
            </div>
            <p className="text-xs text-zinc-400 mb-6">
              Use this 4-4-4-4 protocol post-workout or before bedtime to lower cortisol, drop heart rate, and accelerate cellular recovery.
            </p>

            {/* Breathing Circle Visualizer */}
            <div className="flex flex-col items-center justify-center my-4">
              <div
                className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-1000 ${
                  breathingActive
                    ? breathPhase === 'Inhale'
                      ? 'scale-110 border-emerald-400 bg-emerald-500/10'
                      : breathPhase === 'Exhale'
                      ? 'scale-90 border-cyan-400 bg-cyan-500/10'
                      : 'scale-100 border-teal-400 bg-teal-500/10'
                    : 'border-zinc-800 bg-zinc-950'
                }`}
              >
                <span className="text-xs font-bold uppercase text-zinc-400 mb-1">
                  {breathingActive ? breathPhase : 'Ready'}
                </span>
                <span className="text-3xl font-black font-mono text-white">
                  {breathingActive ? phaseSecondsRemaining : '4s'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-center gap-3">
            <button
              onClick={() => setBreathingActive(!breathingActive)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                breathingActive
                  ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  : 'bg-gradient-to-r from-cyan-500 to-teal-500 text-zinc-950 shadow-md shadow-cyan-500/20'
              }`}
            >
              {breathingActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-zinc-950" />}
              <span>{breathingActive ? 'Pause Exercise' : 'Start 2-Min Reset'}</span>
            </button>
            {breathingActive && (
              <button
                onClick={() => setBreathingActive(false)}
                className="p-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
                title="Reset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Daily Habits Checklist */}
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Foundational Daily Habits
                </h3>
              </div>
              <span className="text-xs text-zinc-400">
                {Object.values(completedHabits).filter(Boolean).length} / {lifestyle.dailyHabits.length} Done
              </span>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Small atomic wins compound into lifelong transformation. Check them off as you go through your day.
            </p>

            <div className="space-y-2.5">
              {lifestyle.dailyHabits.map((habit, idx) => {
                const isChecked = !!completedHabits[idx];
                return (
                  <button
                    key={idx}
                    onClick={() => toggleHabit(idx)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                      isChecked
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={`text-xs ${isChecked ? 'line-through text-zinc-400' : ''}`}>
                      {habit}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sleep Architecture & Stress Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sleep Architecture */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-4 flex items-center gap-2">
            <Moon className="w-4 h-4" />
            Sleep Architecture & Circadian Alignment
          </h4>
          <ul className="space-y-2.5 text-xs text-zinc-300">
            {lifestyle.sleepRecommendations.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stress & Nervous System Management */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <h4 className="text-sm font-bold uppercase tracking-wider text-teal-400 mb-4 flex items-center gap-2">
            <Smile className="w-4 h-4" />
            Autonomic Nervous System Recovery
          </h4>
          <ul className="space-y-2.5 text-xs text-zinc-300">
            {lifestyle.stressManagement.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4-Week Milestone Roadmap */}
      {lifestyle.weeklyMilestones && lifestyle.weeklyMilestones.length > 0 && (
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-6 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
            Periodization Roadmap & Progression Targets
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {lifestyle.weeklyMilestones.map((milestone, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2 inline-block">
                    Phase {idx + 1}
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {milestone}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
