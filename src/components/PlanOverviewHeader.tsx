import React from 'react';
import { 
  Play, 
  Sparkles, 
  SlidersHorizontal, 
  Share2, 
  Volume2, 
  Flame, 
  Target, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Droplets, 
  Footprints 
} from 'lucide-react';
import { FitnessPlan, UserProfile } from '../types/fitness';

interface PlanOverviewHeaderProps {
  plan: FitnessPlan;
  userProfile: UserProfile;
  onStartTodayWorkout: () => void;
  onOpenCoachChat: () => void;
  onOpenModify: () => void;
  onOpenBriefing: () => void;
  onOpenExport: () => void;
  onApplyFeedback?: (feedback: string) => void;
  completedDaysCount: number;
}

export const PlanOverviewHeader: React.FC<PlanOverviewHeaderProps> = ({
  plan,
  userProfile,
  onStartTodayWorkout,
  onOpenCoachChat,
  onOpenModify,
  onOpenBriefing,
  onOpenExport,
  onApplyFeedback,
  completedDaysCount,
}) => {
  const workoutDays = plan.schedule.filter((d) => !d.isRestDay).length;
  const restDays = plan.schedule.length - workoutDays;
  const progressPercent = Math.round((completedDaysCount / Math.max(workoutDays, 1)) * 100);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 p-6 sm:p-8 shadow-2xl mb-8">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top Badges & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-3.5 h-3.5" />
              Engine: {plan.modelUsed || 'Gemini 3.8 Flash'}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              Goal: {userProfile.primaryGoal.replace('_', ' ').toUpperCase()}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              {userProfile.sessionDuration} min / session
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenBriefing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 border border-zinc-700 transition-colors shadow-sm"
              title="Listen to AI workout briefing"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              Audio Briefing
            </button>
            <button
              onClick={onOpenExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 border border-zinc-700 transition-colors shadow-sm"
              title="Export or print plan"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              Export
            </button>
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="max-w-3xl mb-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
            {plan.planName}
          </h1>
          <p className="text-sm sm:text-base font-medium text-emerald-400/90 mb-3">
            {plan.tagline}
          </p>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {plan.overview}
          </p>
        </div>

        {/* Weekly Split Summary Ribbon */}
        {plan.weeklySplitSummary && (
          <div className="mb-4 px-4 py-2.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/90 flex items-center gap-2 text-xs text-zinc-300">
            <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">7-Day Architecture:</span>
            <span className="text-emerald-300 font-medium truncate">{plan.weeklySplitSummary}</span>
          </div>
        )}

        {/* 1-Click Feedback-Based Updating Pills */}
        <div className="mb-6 p-3 rounded-2xl bg-zinc-950/50 border border-zinc-800/60 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px] flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            1-Click Feedback Adaptations:
          </span>
          {[
            'Add more cardio',
            'Include more rest days',
            'Knee-friendly movements',
            'Shorten to 30 mins',
            'Focus on posture & mobility',
          ].map((promptText) => (
            <button
              key={promptText}
              type="button"
              onClick={() => onApplyFeedback ? onApplyFeedback(promptText) : onOpenModify()}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-cyan-300 border border-zinc-800 hover:border-cyan-500/40 text-[11px] font-medium transition-all"
            >
              + {promptText}
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Workouts</span>
              <Flame className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-white">
              {workoutDays} <span className="text-xs font-normal text-zinc-400">days/wk ({restDays} rest)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Daily Fuel</span>
              <Target className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-white">
              {plan.nutrition.dailyCalorieTarget} <span className="text-xs font-normal text-zinc-400">kcal/day</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Daily Hydration</span>
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-white">
              {plan.nutrition.hydrationLiters} <span className="text-xs font-normal text-zinc-400">Liters</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
              <span>Step Target</span>
              <Footprints className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-white">
              {userProfile.dailyStepTarget.toLocaleString()} <span className="text-xs font-normal text-zinc-400">steps</span>
            </div>
          </div>
        </div>

        {/* Progress & Quick Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-zinc-800">
          {/* Adherence progress */}
          <div className="flex-1 max-w-sm">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-400 mb-1.5">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Weekly Adherence
              </span>
              <span className="text-emerald-400 font-bold">{completedDaysCount} / {workoutDays} Done ({progressPercent}%)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenModify}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              Modify with AI
            </button>

            <button
              onClick={onOpenCoachChat}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Ask Coach
            </button>

            <button
              onClick={onStartTodayWorkout}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 text-xs font-extrabold shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-zinc-950" />
              Start Workout Player
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
