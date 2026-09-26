import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Dumbbell, 
  Clock, 
  Calendar, 
  Target, 
  Check, 
  Flame, 
  Zap, 
  Activity, 
  Heart, 
  ShieldAlert, 
  Loader2 
} from 'lucide-react';
import { 
  UserProfile, 
  GoalType, 
  ExperienceLevel, 
  WorkoutLocation, 
  DietaryStyle 
} from '../types/fitness';
import { PRESET_PROFILES } from '../data/presetPlans';

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePlan: (profile: UserProfile) => Promise<void>;
  currentProfile: UserProfile;
  isGenerating: boolean;
}

export const IntakeModal: React.FC<IntakeModalProps> = ({
  isOpen,
  onClose,
  onGeneratePlan,
  currentProfile,
  isGenerating,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [profile, setProfile] = useState<UserProfile>(currentProfile);

  if (!isOpen) return null;

  const handleApplyPreset = (presetProfile: UserProfile) => {
    setProfile(presetProfile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGeneratePlan(profile);
  };

  const goalOptions: { value: GoalType; label: string; desc: string; icon: string }[] = [
    { value: 'fat_loss', label: 'Fat Loss & Shred', desc: 'Metabolic conditioning & caloric burn', icon: '🔥' },
    { value: 'muscle_gain', label: 'Muscle Hypertrophy', desc: 'Lean mass, size & progressive overload', icon: '💪' },
    { value: 'strength', label: 'Raw Strength & Power', desc: 'Compound movements & neuromuscular force', icon: '🏋️' },
    { value: 'endurance', label: 'Endurance & Cardio', desc: 'Aerobic threshold & stamina building', icon: '🏃' },
    { value: 'mobility_flexibility', label: 'Mobility & Joint Health', desc: 'Posture, active range & fascial release', icon: '🧘' },
    { value: 'general_fitness', label: 'General Health & Vitality', desc: 'Sustainable functional fitness & longevity', icon: '⚡' },
  ];

  const experienceOptions: { value: ExperienceLevel; label: string; sub: string }[] = [
    { value: 'beginner', label: 'Beginner', sub: '0-6 months experience, mastering basics' },
    { value: 'novice', label: 'Novice', sub: '6-12 months consistent training' },
    { value: 'intermediate', label: 'Intermediate', sub: '1-3 years progressive training' },
    { value: 'advanced', label: 'Advanced / Athlete', sub: '3+ years structured training' },
  ];

  const locationOptions: { value: WorkoutLocation; label: string; desc: string }[] = [
    { value: 'home_minimal', label: 'Home with Dumbbells & Bands', desc: 'Adjustable dumbbells, bands, yoga mat' },
    { value: 'home_no_gear', label: 'Home Zero Equipment', desc: '100% bodyweight & calisthenics' },
    { value: 'commercial_gym', label: 'Commercial Gym', desc: 'Barbells, cables, machines, squat racks' },
    { value: 'calisthenics_park', label: 'Outdoor / Park', desc: 'Pull-up bars, parallel bars, open space' },
  ];

  const activityOptions = [
    'Strength Training',
    'HIIT & MetCon',
    'Bodyweight Calisthenics',
    'Running / Jogging',
    'Pilates & Yoga Flow',
    'Cycling',
    'Mobility & Stretching',
    'Kettlebells',
  ];

  const dietaryOptions: { value: DietaryStyle; label: string }[] = [
    { value: 'omnivore', label: 'Omnivore (Balanced)' },
    { value: 'high_protein', label: 'High Protein Athlete' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: '100% Plant-Based / Vegan' },
    { value: 'keto', label: 'Ketogenic / Low-Carb' },
    { value: 'pescatarian', label: 'Pescatarian' },
  ];

  const toggleActivity = (activity: string) => {
    const exists = profile.preferredActivities.includes(activity);
    if (exists) {
      setProfile((p) => ({
        ...p,
        preferredActivities: p.preferredActivities.filter((a) => a !== activity),
      }));
    } else {
      setProfile((p) => ({
        ...p,
        preferredActivities: [...p.preferredActivities, activity],
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Personalized Plan Generator
              </h2>
              <p className="text-xs text-zinc-400">
                FitBuddy uses Gemini models to synthesize your bespoke blueprint
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Popular Preset Pills */}
        <div className="px-6 py-3 bg-zinc-950/70 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex-shrink-0">
            1-Click Presets:
          </span>
          {PRESET_PROFILES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset.profile)}
              className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-emerald-400 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Step Indicator Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/50">
          {[
            { step: 1, label: 'Goals & Level' },
            { step: 2, label: 'Schedule & Time' },
            { step: 3, label: 'Gear & Limitations' },
            { step: 4, label: 'Nutrition & AI' },
          ].map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => setActiveStep(item.step as any)}
              className={`flex-1 py-3 text-xs font-bold border-b-2 transition-all ${
                activeStep === item.step
                  ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {item.step}. {item.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: GOALS & EXPERIENCE */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Client Name / Profile
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Your Name"
                    className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={profile.age}
                      onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                      placeholder="Age"
                      className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs text-zinc-400">yrs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={profile.weight}
                      onChange={(e) => setProfile({ ...profile, weight: Number(e.target.value) })}
                      placeholder="Weight"
                      className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                    <select
                      value={profile.unitSystem}
                      onChange={(e) => setProfile({ ...profile, unitSystem: e.target.value as any })}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none"
                    >
                      <option value="metric">kg</option>
                      <option value="imperial">lbs</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                  Primary Fitness Objective
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {goalOptions.map((opt) => {
                    const isSelected = profile.primaryGoal === opt.value;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => setProfile({ ...profile, primaryGoal: opt.value })}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                        }`}
                      >
                        <span className="text-2xl">{opt.icon}</span>
                        <div>
                          <div className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-zinc-200'}`}>
                            {opt.label}
                          </div>
                          <div className="text-[11px] text-zinc-400">{opt.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                  Experience Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {experienceOptions.map((opt) => {
                    const isSelected = profile.experienceLevel === opt.value;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => setProfile({ ...profile, experienceLevel: opt.value })}
                        className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                        }`}
                      >
                        <div className="text-xs font-bold text-white mb-1">{opt.label}</div>
                        <div className="text-[10px] text-zinc-400 leading-tight">{opt.sub}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SCHEDULE & TIME */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Workout Days Per Week
                </label>
                <div className="flex items-center gap-2">
                  {[2, 3, 4, 5, 6].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setProfile({ ...profile, daysPerWeek: days })}
                      className={`flex-1 py-3 rounded-xl border text-center font-bold text-sm transition-all ${
                        profile.daysPerWeek === days
                          ? 'bg-emerald-500 text-zinc-950 border-emerald-500 shadow-md'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-400 mt-2">
                  FitBuddy will program {profile.daysPerWeek} training days and {7 - profile.daysPerWeek} active recovery/rest days.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Session Duration
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[20, 30, 45, 60, 75, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setProfile({ ...profile, sessionDuration: mins })}
                      className={`py-2.5 rounded-xl border text-center font-semibold text-xs transition-all ${
                        profile.sessionDuration === mins
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Daily Step Target
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5000"
                    max="16000"
                    step="500"
                    value={profile.dailyStepTarget}
                    onChange={(e) => setProfile({ ...profile, dailyStepTarget: Number(e.target.value) })}
                    className="flex-1 accent-emerald-500"
                  />
                  <span className="font-mono text-sm font-bold text-emerald-400 min-w-[90px] text-right">
                    {profile.dailyStepTarget.toLocaleString()} steps
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: GEAR, ACTIVITIES & LIMITATIONS */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Training Venue & Available Equipment
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {locationOptions.map((loc) => {
                    const isSelected = profile.workoutLocation === loc.value;
                    return (
                      <div
                        key={loc.value}
                        onClick={() => setProfile({ ...profile, workoutLocation: loc.value })}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 text-white'
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                        }`}
                      >
                        <div className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-zinc-200'}`}>
                          {loc.label}
                        </div>
                        <div className="text-[11px] text-zinc-400">{loc.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Preferred Activities & Styles
                </label>
                <div className="flex flex-wrap gap-2">
                  {activityOptions.map((act) => {
                    const isSelected = profile.preferredActivities.includes(act);
                    return (
                      <button
                        key={act}
                        type="button"
                        onClick={() => toggleActivity(act)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {act}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Injuries, Joint Cautions, or Physical Limitations
                </label>
                <input
                  type="text"
                  value={profile.physicalLimitations}
                  onChange={(e) => setProfile({ ...profile, physicalLimitations: e.target.value })}
                  placeholder="e.g. Sensitive lower back, mild knee clicking, wrist pain on floor push-ups, or None"
                  className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  FitBuddy will automatically substitute safer biomechanical angles and provide joint-friendly alternatives.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: NUTRITION, LIFESTYLE & GEMINI ENGINE */}
          {activeStep === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Dietary Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {dietaryOptions.map((diet) => (
                    <button
                      key={diet.value}
                      type="button"
                      onClick={() => setProfile({ ...profile, dietaryStyle: diet.value })}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                        profile.dietaryStyle === diet.value
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {diet.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Caloric Strategy
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'deficit', label: 'Caloric Deficit', sub: 'Fat loss & lean definition' },
                    { value: 'maintenance', label: 'Maintenance', sub: 'Recomposition & energy balance' },
                    { value: 'surplus', label: 'Lean Surplus', sub: 'Hypertrophy & muscle gain' },
                  ].map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setProfile({ ...profile, calorieGoalType: c.value as any })}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        profile.calorieGoalType === c.value
                          ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-white mb-0.5">{c.label}</div>
                      <div className="text-[10px] text-zinc-400">{c.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gemini Model Selector */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Gemini Generation Engine
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setProfile({ ...profile, geminiModel: 'gemini-3.8-flash' })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      profile.geminiModel === 'gemini-3.8-flash'
                        ? 'bg-emerald-500/10 border-emerald-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                      <span>Gemini 3.8 Flash</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Recommended</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Flagship multimodal speed & deep reasoning for sports science.
                    </p>
                  </div>

                  <div
                    onClick={() => setProfile({ ...profile, geminiModel: 'gemini-3.1-flash-lite' })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      profile.geminiModel === 'gemini-3.1-flash-lite'
                        ? 'bg-emerald-500/10 border-emerald-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>Gemini 3.1 Flash-Lite</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">Fastest</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Ultra-low latency generation for fast plan synthesis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Footer */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-3">
            {activeStep > 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep((s) => (s - 1) as any)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {activeStep < 4 ? (
              <button
                type="button"
                onClick={() => setActiveStep((s) => (s + 1) as any)}
                className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold"
              >
                Continue to Step {activeStep + 1}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isGenerating}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Plan with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-zinc-950" />
                    <span>Generate AI Fitness Plan</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
