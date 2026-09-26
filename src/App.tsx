import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PlanOverviewHeader } from './components/PlanOverviewHeader';
import { WorkoutScheduleView } from './components/WorkoutScheduleView';
import { LiveWorkoutPlayer } from './components/LiveWorkoutPlayer';
import { NutritionView } from './components/NutritionView';
import { LifestyleView } from './components/LifestyleView';
import { IntakeModal } from './components/IntakeModal';
import { AICoachDrawer } from './components/AICoachDrawer';
import { AudioBriefingModal } from './components/AudioBriefingModal';
import { ExportModal } from './components/ExportModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ApiDocsView } from './components/ApiDocsView';
import { PipelineVisualizer } from './components/PipelineVisualizer';

import { FitnessPlan, UserProfile } from './types/fitness';
import { DEFAULT_USER_PROFILE, SAMPLE_INITIAL_PLAN } from './data/presetPlans';
import { Sparkles, Dumbbell, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Load saved plan and profile from localStorage if present
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('fitbuddy_profile');
      return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  });

  const [currentPlan, setCurrentPlan] = useState<FitnessPlan>(() => {
    try {
      const saved = localStorage.getItem('fitbuddy_active_plan');
      return saved ? JSON.parse(saved) : SAMPLE_INITIAL_PLAN;
    } catch {
      return SAMPLE_INITIAL_PLAN;
    }
  });

  const [streakCount, setStreakCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('fitbuddy_streak');
      return saved ? Number(saved) : 3;
    } catch {
      return 3;
    }
  });

  const [activeTab, setActiveTab] = useState<'schedule' | 'nutrition' | 'lifestyle' | 'workout-player' | 'admin' | 'docs'>('schedule');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isCoachChatOpen, setIsCoachChatOpen] = useState(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [coachChatInitialPrompt, setCoachChatInitialPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fitbuddy_profile', JSON.stringify(userProfile));
      localStorage.setItem('fitbuddy_active_plan', JSON.stringify(currentPlan));
      localStorage.setItem('fitbuddy_streak', streakCount.toString());
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [userProfile, currentPlan, streakCount]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Direct 1-click feedback plan updater
  const handleApplyDirectFeedback = async (feedbackText: string) => {
    showToast(`Updating plan with feedback: "${feedbackText}"...`, 'info');
    try {
      const response = await fetch('/api/modify-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPlan,
          modificationPrompt: feedbackText,
          model: userProfile.geminiModel,
          userId: userProfile.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'user-default',
        }),
      });
      const data = await response.json();
      if (data.success && data.plan) {
        setCurrentPlan(data.plan);
        showToast(`Plan updated based on "${feedbackText}"! Stored in DB.`, 'success');
      } else {
        showToast(data.error || 'Failed to update plan', 'error');
      }
    } catch (e: any) {
      showToast('Error communicating with Gemini model', 'error');
    }
  };

  // Generate new plan using server-side Gemini endpoint
  const handleGeneratePlan = async (newProfile: UserProfile) => {
    setIsGenerating(true);
    setUserProfile(newProfile);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile),
      });

      const data = await response.json();
      if (data.success && data.plan) {
        setCurrentPlan(data.plan);
        setSelectedDayNumber(1);
        setIsIntakeOpen(false);
        setActiveTab('schedule');
        showToast(`Bespoke plan generated successfully using ${data.plan.modelUsed || newProfile.geminiModel}!`, 'success');
      } else {
        throw new Error(data.error || 'Failed to generate plan');
      }
    } catch (error: any) {
      console.error(error);
      showToast(`Error: ${error.message}. Please verify your network and Gemini API connection.`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleDayCompleted = (dayNumber: number) => {
    setCurrentPlan((prev) => {
      const updatedSchedule = prev.schedule.map((d) => {
        if (d.dayNumber === dayNumber) {
          const nextCompleted = !d.completed;
          if (nextCompleted) {
            setStreakCount((s) => s + 1);
            showToast(`Day ${dayNumber} completed! Workout streak updated to ${streakCount + 1} days. 🔥`, 'success');
          }
          return { ...d, completed: nextCompleted };
        }
        return d;
      });
      return { ...prev, schedule: updatedSchedule };
    });
  };

  const handleToggleSetCompleted = (dayNumber: number, exerciseId: string, setIndex: number) => {
    setCurrentPlan((prev) => {
      const updatedSchedule = prev.schedule.map((d) => {
        if (d.dayNumber === dayNumber) {
          const updatedExercises = d.exercises.map((ex) => {
            if (ex.id === exerciseId) {
              const currentSets = ex.completedSets || Array(ex.sets).fill(false);
              const nextSets = [...currentSets];
              nextSets[setIndex] = !nextSets[setIndex];
              return { ...ex, completedSets: nextSets };
            }
            return ex;
          });
          return { ...d, exercises: updatedExercises };
        }
        return d;
      });
      return { ...prev, schedule: updatedSchedule };
    });
  };

  const handleUpdateExerciseWeight = (dayNumber: number, exerciseId: string, setIndex: number, weight: string) => {
    setCurrentPlan((prev) => {
      const updatedSchedule = prev.schedule.map((d) => {
        if (d.dayNumber === dayNumber) {
          const updatedExercises = d.exercises.map((ex) => {
            if (ex.id === exerciseId) {
              const weights = ex.loggedWeights || Array(ex.sets).fill('');
              const nextWeights = [...weights];
              nextWeights[setIndex] = weight;
              return { ...ex, loggedWeights: nextWeights };
            }
            return ex;
          });
          return { ...d, exercises: updatedExercises };
        }
        return d;
      });
      return { ...prev, schedule: updatedSchedule };
    });
  };

  const handleAskCoachAboutExercise = (exerciseName: string) => {
    setCoachChatInitialPrompt(`How do I perform ${exerciseName} with optimal biomechanical form, and what are safe modifications?`);
    setIsCoachChatOpen(true);
  };

  const handleAskCoachAboutMeal = (mealTitle: string) => {
    setCoachChatInitialPrompt(`Can you give me an alternative recipe or variation for the "${mealTitle}" meal in my nutrition plan?`);
    setIsCoachChatOpen(true);
  };

  const handleLaunchWorkoutPlayer = (dayNumber: number) => {
    setSelectedDayNumber(dayNumber);
    setActiveTab('workout-player');
  };

  const handleFinishWorkout = (dayNumber: number, durationMinutes: number) => {
    handleToggleDayCompleted(dayNumber);
    showToast(`Workout logged! ${durationMinutes} minutes crushed. Great job!`, 'success');
  };

  const completedDaysCount = currentPlan.schedule.filter((d) => !d.isRestDay && d.completed).length;
  const activeDay = currentPlan.schedule.find((d) => d.dayNumber === selectedDayNumber) || currentPlan.schedule[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl text-xs font-semibold animate-slide-up">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400" />
          ) : (
            <Sparkles className="w-4 h-4 text-cyan-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenIntake={() => setIsIntakeOpen(true)}
        onOpenCoachChat={() => {
          setCoachChatInitialPrompt('');
          setIsCoachChatOpen(true);
        }}
        onOpenBriefing={() => setIsBriefingOpen(true)}
        geminiModel={userProfile.geminiModel}
        onSelectModel={(model) => {
          setUserProfile((p) => ({ ...p, geminiModel: model }));
          showToast(`Gemini model set to ${model}`, 'info');
        }}
        streakCount={streakCount}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* End-to-End Pipeline Visualizer */}
        {activeTab !== 'workout-player' && (
          <PipelineVisualizer
            hasActivePlan={!!currentPlan}
            hasFeedbackHistory={Array.isArray((currentPlan as any).feedbackHistory) && (currentPlan as any).feedbackHistory.length > 0}
            feedbackCount={(currentPlan as any).feedbackHistory?.length || 0}
          />
        )}

        {/* Plan Overview Hero Header (shown on schedule, nutrition, and lifestyle tabs) */}
        {activeTab !== 'workout-player' && activeTab !== 'admin' && activeTab !== 'docs' && (
          <PlanOverviewHeader
            plan={currentPlan}
            userProfile={userProfile}
            onStartTodayWorkout={() => handleLaunchWorkoutPlayer(selectedDayNumber)}
            onOpenCoachChat={() => {
              setCoachChatInitialPrompt('');
              setIsCoachChatOpen(true);
            }}
            onOpenModify={() => {
              setCoachChatInitialPrompt('I would like to modify my current fitness plan. What options can we tweak?');
              setIsCoachChatOpen(true);
            }}
            onOpenBriefing={() => setIsBriefingOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            onApplyFeedback={handleApplyDirectFeedback}
            completedDaysCount={completedDaysCount}
          />
        )}

        {/* Tab Views */}
        {activeTab === 'schedule' && (
          <WorkoutScheduleView
            plan={currentPlan}
            selectedDayNumber={selectedDayNumber}
            onSelectDay={setSelectedDayNumber}
            onLaunchWorkoutPlayer={handleLaunchWorkoutPlayer}
            onToggleDayCompleted={handleToggleDayCompleted}
            onToggleSetCompleted={handleToggleSetCompleted}
            onUpdateExerciseWeight={handleUpdateExerciseWeight}
            onAskCoachAboutExercise={handleAskCoachAboutExercise}
          />
        )}

        {activeTab === 'workout-player' && (
          <LiveWorkoutPlayer
            plan={currentPlan}
            dayNumber={selectedDayNumber}
            onClose={() => setActiveTab('schedule')}
            onFinishWorkout={handleFinishWorkout}
            onOpenBriefing={() => setIsBriefingOpen(true)}
            onAskCoach={(query) => {
              setCoachChatInitialPrompt(query);
              setIsCoachChatOpen(true);
            }}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionView
            nutrition={currentPlan.nutrition}
            onAskCoachAboutMeal={handleAskCoachAboutMeal}
          />
        )}

        {activeTab === 'lifestyle' && (
          <LifestyleView lifestyle={currentPlan.lifestyle} />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            onLoadPlanIntoApp={(loadedPlan) => {
              setCurrentPlan(loadedPlan);
              setActiveTab('schedule');
              showToast(`Loaded "${loadedPlan.planName}" into active session!`, 'success');
            }}
            onClose={() => setActiveTab('schedule')}
          />
        )}

        {activeTab === 'docs' && (
          <ApiDocsView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Dumbbell className="w-3 h-3" />
            </div>
            <span className="font-bold text-zinc-300">FitBuddy</span>
            <span className="text-zinc-600">—</span>
            <span>Personalized AI Fitness & Lifestyle Architecture</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Powered by Google Gemini Models</span>
            <span>•</span>
            <button onClick={() => setIsIntakeOpen(true)} className="hover:text-emerald-400 underline">
              Re-generate Plan
            </button>
            <span>•</span>
            <button onClick={() => setIsExportOpen(true)} className="hover:text-cyan-400 underline">
              Export Plan
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-overs */}
      <IntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        onGeneratePlan={handleGeneratePlan}
        currentProfile={userProfile}
        isGenerating={isGenerating}
      />

      <AICoachDrawer
        isOpen={isCoachChatOpen}
        onClose={() => setIsCoachChatOpen(false)}
        plan={currentPlan}
        userProfile={userProfile}
        initialPrompt={coachChatInitialPrompt}
        onPlanUpdated={(newPlan) => {
          setCurrentPlan(newPlan);
          showToast('FitBuddy has updated your plan successfully!', 'success');
        }}
      />

      <AudioBriefingModal
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
        plan={currentPlan}
        activeDay={activeDay}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        plan={currentPlan}
        userProfile={userProfile}
      />
    </div>
  );
}
