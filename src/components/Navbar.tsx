import React from 'react';
import { 
  Dumbbell, 
  Sparkles, 
  Calendar, 
  Utensils, 
  HeartPulse, 
  PlayCircle, 
  MessageSquare, 
  Flame, 
  RefreshCw,
  ShieldCheck,
  Terminal
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'schedule' | 'nutrition' | 'lifestyle' | 'workout-player' | 'admin' | 'docs';
  setActiveTab: (tab: 'schedule' | 'nutrition' | 'lifestyle' | 'workout-player' | 'admin' | 'docs') => void;
  onOpenIntake: () => void;
  onOpenCoachChat: () => void;
  onOpenBriefing: () => void;
  geminiModel: string;
  onSelectModel: (model: 'gemini-3.8-flash' | 'gemini-3.1-flash-lite') => void;
  streakCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenIntake,
  onOpenCoachChat,
  onOpenBriefing,
  geminiModel,
  onSelectModel,
  streakCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('schedule')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                  FitBuddy
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  AI Gemini
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">Smart Fitness & Lifestyle Plan Generator</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'schedule'
                  ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              7-Day Workouts
            </button>

            <button
              onClick={() => setActiveTab('workout-player')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'workout-player'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
              Live Workout Player
            </button>

            <button
              onClick={() => setActiveTab('nutrition')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'nutrition'
                  ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              Nutrition & Macros
            </button>

            <button
              onClick={() => setActiveTab('lifestyle')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'lifestyle'
                  ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              Recovery & Lifestyle
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800/50'
              }`}
              title="Admin Dashboard (View users, plans & feedback storage)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Admin
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'docs'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-emerald-300 hover:bg-zinc-800/50'
              }`}
              title="FastAPI-style Interactive API Documentation & Testing"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              API Docs
            </button>
          </nav>

          {/* Action Tools & Gemini Model Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Counter */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold" title="Workout Streak">
              <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
              <span>{streakCount} {streakCount === 1 ? 'day' : 'days'}</span>
            </div>

            {/* Model Badge Toggle */}
            <div className="hidden lg:flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-[11px] font-medium text-zinc-300">
              <button
                onClick={() => onSelectModel('gemini-3.8-flash')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  geminiModel === 'gemini-3.8-flash'
                    ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Default Flagship Model for balanced reasoning & depth"
              >
                Gemini 3.8 Flash
              </button>
              <button
                onClick={() => onSelectModel('gemini-3.1-flash-lite')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  geminiModel === 'gemini-3.1-flash-lite'
                    ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Ultra-low latency model"
              >
                3.1 Flash-Lite
              </button>
            </div>

            {/* Voice Briefing Button */}
            <button
              onClick={onOpenBriefing}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors relative group"
              title="Voice Briefing (Gemini TTS)"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="sr-only">Audio Briefing</span>
            </button>

            {/* Coach Chat Button */}
            <button
              onClick={onOpenCoachChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">AI Coach</span>
            </button>

            {/* Generate / Custom Plan Button */}
            <button
              onClick={onOpenIntake}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Plan</span>
            </button>
          </div>
        </div>

        {/* Mobile Subnav */}
        <div className="flex md:hidden items-center justify-between border-t border-zinc-900 py-2 text-xs font-medium text-zinc-400">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-1 px-2 py-1 rounded ${activeTab === 'schedule' ? 'text-emerald-400 font-semibold' : ''}`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Workouts
          </button>
          <button
            onClick={() => setActiveTab('workout-player')}
            className={`flex items-center gap-1 px-2 py-1 rounded ${activeTab === 'workout-player' ? 'text-emerald-400 font-semibold' : ''}`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Live Player
          </button>
          <button
            onClick={() => setActiveTab('nutrition')}
            className={`flex items-center gap-1 px-2 py-1 rounded ${activeTab === 'nutrition' ? 'text-emerald-400 font-semibold' : ''}`}
          >
            <Utensils className="w-3.5 h-3.5" />
            Nutrition
          </button>
          <button
            onClick={() => setActiveTab('lifestyle')}
            className={`flex items-center gap-1 px-2 py-1 rounded ${activeTab === 'lifestyle' ? 'text-emerald-400 font-semibold' : ''}`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            Lifestyle
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1 px-2 py-1 rounded ${activeTab === 'admin' ? 'text-cyan-400 font-semibold' : ''}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-1 px-2 py-1 rounded ${activeTab === 'docs' ? 'text-emerald-400 font-semibold' : ''}`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Docs
          </button>
        </div>
      </div>
    </header>
  );
};
