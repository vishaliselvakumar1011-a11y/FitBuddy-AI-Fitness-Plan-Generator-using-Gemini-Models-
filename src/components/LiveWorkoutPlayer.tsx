import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  CheckCircle, 
  Timer, 
  Dumbbell, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Flame, 
  Trophy, 
  Plus, 
  Minus, 
  Volume2, 
  ArrowLeft 
} from 'lucide-react';
import { FitnessPlan, WorkoutDay, Exercise } from '../types/fitness';
import { playCountdownBeep, playCompletionChime } from '../utils/audio';

interface LiveWorkoutPlayerProps {
  plan: FitnessPlan;
  dayNumber: number;
  onClose: () => void;
  onFinishWorkout: (dayNumber: number, durationMinutes: number) => void;
  onOpenBriefing: () => void;
  onAskCoach: (query: string) => void;
}

export const LiveWorkoutPlayer: React.FC<LiveWorkoutPlayerProps> = ({
  plan,
  dayNumber,
  onClose,
  onFinishWorkout,
  onOpenBriefing,
  onAskCoach,
}) => {
  const day = plan.schedule.find((d) => d.dayNumber === dayNumber) || plan.schedule[0];
  const exercises = day.exercises || [];

  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restSecondsRemaining, setRestSecondsRemaining] = useState(60);
  const [restDurationTotal, setRestDurationTotal] = useState(60);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [loggedWeights, setLoggedWeights] = useState<Record<string, string[]>>({});
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>({});
  const [sessionStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);

  // Active exercise
  const currentExercise: Exercise | undefined = exercises[currentExIndex];

  // Track session total elapsed time
  useEffect(() => {
    if (isSessionCompleted) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartTime, isSessionCompleted]);

  // Rest countdown timer
  useEffect(() => {
    let timer: any = null;
    if (isResting && isRestTimerActive && restSecondsRemaining > 0) {
      timer = setInterval(() => {
        setRestSecondsRemaining((prev) => {
          if (prev <= 4 && prev > 1) {
            playCountdownBeep(false);
          } else if (prev === 1) {
            playCountdownBeep(true);
            playCompletionChime();
            setIsResting(false);
            setIsRestTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isResting, isRestTimerActive, restSecondsRemaining]);

  const startRestTimer = (seconds: number) => {
    setRestDurationTotal(seconds);
    setRestSecondsRemaining(seconds);
    setIsResting(true);
    setIsRestTimerActive(true);
  };

  const handleCompleteCurrentSet = () => {
    if (!currentExercise) return;
    playCompletionChime();

    const exId = currentExercise.id;
    const prevDone = completedSets[exId] || Array(currentExercise.sets).fill(false);
    const updated = [...prevDone];
    updated[currentSetIndex] = true;
    setCompletedSets((prev) => ({ ...prev, [exId]: updated }));

    // Start rest timer
    const rest = currentExercise.restSeconds || 60;
    startRestTimer(rest);

    // Advance set if possible
    if (currentSetIndex < currentExercise.sets - 1) {
      setCurrentSetIndex((prev) => prev + 1);
    } else if (currentExIndex < exercises.length - 1) {
      // Advance to next exercise after rest
      setTimeout(() => {
        setCurrentExIndex((prev) => prev + 1);
        setCurrentSetIndex(0);
      }, 500);
    }
  };

  const handleAdjustRest = (delta: number) => {
    setRestSecondsRemaining((prev) => Math.max(5, prev + delta));
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const handleFinish = () => {
    playCompletionChime();
    setIsSessionCompleted(true);
    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    onFinishWorkout(day.dayNumber, durationMinutes);
  };

  if (isSessionCompleted) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-10 h-10 animate-bounce" />
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3 inline-block">
          Workout Crushed!
        </span>
        <h2 className="text-3xl font-extrabold text-white mb-2">Incredible Session, Champion</h2>
        <p className="text-sm text-zinc-400 max-w-md mx-auto mb-8">
          You conquered <span className="text-white font-semibold">{day.title}</span>. Your muscles received optimal progressive overload, and your recovery starts right now.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div className="text-xs text-zinc-400 mb-1">Time Invested</div>
            <div className="text-xl font-bold text-white">{formatTime(elapsedSeconds)}</div>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div className="text-xs text-zinc-400 mb-1">Est. Cal Burn</div>
            <div className="text-xl font-bold text-orange-400">{day.estimatedCaloriesBurn} kcal</div>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div className="text-xs text-zinc-400 mb-1">Exercises Done</div>
            <div className="text-xl font-bold text-emerald-400">{exercises.length}</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-bold text-sm shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="p-8 text-center text-zinc-400">
        <p>No exercises scheduled for this day.</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 rounded-xl bg-zinc-800 text-white">Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header & Session Elapsed Clock */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Player</span>
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Timer className="w-4 h-4 text-emerald-400" />
            <span>Session: <strong className="text-white font-mono">{formatTime(elapsedSeconds)}</strong></span>
          </div>

          <button
            onClick={onOpenBriefing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-cyan-400 text-xs font-semibold border border-zinc-700"
            title="Listen to audio briefing"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Coach Audio</span>
          </button>
        </div>
      </div>

      {/* Main Exercise & Stage Card */}
      <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Progress bar across exercises */}
        <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
            style={{ width: `${((currentExIndex + 1) / exercises.length) * 100}%` }}
          />
        </div>

        {/* Exercise Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Exercise {currentExIndex + 1} of {exercises.length}
              </span>
              {currentExercise.equipment && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-800 text-zinc-300">
                  {currentExercise.equipment}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              {currentExercise.name}
            </h1>
            <div className="flex flex-wrap gap-1.5">
              {currentExercise.targetMuscles.map((muscle, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-emerald-300">
                  {muscle}
                </span>
              ))}
            </div>
          </div>

          {/* Target Stats Box */}
          <div className="flex items-center gap-4 bg-zinc-950/80 px-4 py-3 rounded-2xl border border-zinc-800">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{currentExercise.sets}</div>
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">Total Sets</div>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div className="text-center">
              <div className="text-xl font-bold text-emerald-400">{currentExercise.reps}</div>
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">Target Reps</div>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div className="text-center">
              <div className="text-xl font-bold text-cyan-400">{currentExercise.restSeconds}s</div>
              <div className="text-[10px] text-zinc-400 uppercase font-semibold">Rest</div>
            </div>
          </div>
        </div>

        {/* Set Tracker & Interactive Rest Timer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Sets Status Box */}
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              <span>Current Progress: Set {currentSetIndex + 1} of {currentExercise.sets}</span>
              {currentExercise.rpe && <span className="text-emerald-400">{currentExercise.rpe}</span>}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
              {Array.from({ length: currentExercise.sets }).map((_, idx) => {
                const isCurrent = idx === currentSetIndex;
                const isDone = !!completedSets[currentExercise.id]?.[idx];

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentSetIndex(idx)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : isCurrent
                        ? 'bg-zinc-800 border-white text-white shadow-lg'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold">Set</span>
                    <span className="text-lg font-extrabold">{idx + 1}</span>
                    {isDone ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-1" />
                    ) : (
                      <span className="text-[10px] text-zinc-400 mt-1">{currentExercise.reps}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Set completion button */}
            <div className="pt-2">
              <button
                onClick={handleCompleteCurrentSet}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 text-base font-extrabold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Complete Set {currentSetIndex + 1} & Start Rest</span>
              </button>
            </div>
          </div>

          {/* Rest Interval Timer Display */}
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              {isResting ? 'Active Rest Interval' : 'Rest Timer Ready'}
            </span>

            {/* Circular / Big Timer Display */}
            <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white mb-3">
              {formatTime(isResting ? restSecondsRemaining : currentExercise.restSeconds || 60)}
            </div>

            {/* Rest Timer Controls */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => handleAdjustRest(-15)}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:bg-zinc-800"
              >
                -15s
              </button>
              {isResting ? (
                <button
                  onClick={() => setIsRestTimerActive(!isRestTimerActive)}
                  className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white flex items-center gap-1.5"
                >
                  {isRestTimerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isRestTimerActive ? 'Pause' : 'Resume'}
                </button>
              ) : (
                <button
                  onClick={() => startRestTimer(currentExercise.restSeconds || 60)}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500/30"
                >
                  <Play className="w-3.5 h-3.5" />
                  Start Rest
                </button>
              )}
              <button
                onClick={() => handleAdjustRest(30)}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 hover:bg-zinc-800"
              >
                +30s
              </button>
            </div>

            {isResting && (
              <button
                onClick={() => {
                  setIsResting(false);
                  setIsRestTimerActive(false);
                }}
                className="text-xs text-zinc-400 hover:text-white underline decoration-zinc-700"
              >
                Skip Rest & Start Next Set
              </button>
            )}
          </div>
        </div>

        {/* Technique Cues & Coaching Notes */}
        <div className="mt-8 pt-6 border-t border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Technique & Form Mastery:
            </h4>
            <button
              onClick={() => onAskCoach(`How do I perform ${currentExercise.name} with perfect form?`)}
              className="text-xs text-cyan-400 hover:underline"
            >
              Ask Coach Form Advice
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentExercise.formCues.map((cue, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-300 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <span>{cue}</span>
              </div>
            ))}
          </div>

          {currentExercise.alternativeExercise && (
            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-300">
              <span className="font-bold">Need a substitution? </span>
              {currentExercise.alternativeExercise}
            </div>
          )}
        </div>

        {/* Navigation Between Exercises */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-800">
          <button
            onClick={() => {
              if (currentExIndex > 0) {
                setCurrentExIndex((prev) => prev - 1);
                setCurrentSetIndex(0);
                setIsResting(false);
              }
            }}
            disabled={currentExIndex === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border ${
              currentExIndex === 0
                ? 'opacity-40 cursor-not-allowed border-zinc-800 text-zinc-600'
                : 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Exercise
          </button>

          {currentExIndex < exercises.length - 1 ? (
            <button
              onClick={() => {
                setCurrentExIndex((prev) => prev + 1);
                setCurrentSetIndex(0);
                setIsResting(false);
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold border border-zinc-700 transition-colors"
            >
              <span>Next Exercise</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 text-xs font-black shadow-lg shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-400 transition-all hover:scale-105"
            >
              <Trophy className="w-4 h-4" />
              Finish & Log Workout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
