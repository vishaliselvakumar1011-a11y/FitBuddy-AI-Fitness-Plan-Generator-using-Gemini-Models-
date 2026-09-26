import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  Clock, 
  ShieldAlert, 
  Timer, 
  Sparkles, 
  RotateCcw, 
  Repeat, 
  Dumbbell, 
  Layers 
} from 'lucide-react';
import { FitnessPlan, WorkoutDay, Exercise } from '../types/fitness';
import { playCompletionChime } from '../utils/audio';

interface WorkoutScheduleViewProps {
  plan: FitnessPlan;
  selectedDayNumber: number;
  onSelectDay: (dayNumber: number) => void;
  onLaunchWorkoutPlayer: (dayNumber: number) => void;
  onToggleDayCompleted: (dayNumber: number) => void;
  onToggleSetCompleted: (dayNumber: number, exerciseId: string, setIndex: number) => void;
  onUpdateExerciseWeight: (dayNumber: number, exerciseId: string, setIndex: number, weight: string) => void;
  onAskCoachAboutExercise: (exerciseName: string) => void;
}

export const WorkoutScheduleView: React.FC<WorkoutScheduleViewProps> = ({
  plan,
  selectedDayNumber,
  onSelectDay,
  onLaunchWorkoutPlayer,
  onToggleDayCompleted,
  onToggleSetCompleted,
  onUpdateExerciseWeight,
  onAskCoachAboutExercise,
}) => {
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  const activeDay: WorkoutDay = plan.schedule.find((d) => d.dayNumber === selectedDayNumber) || plan.schedule[0];

  const toggleExpand = (id: string) => {
    setExpandedExerciseId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* 7-Day Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800">
        {plan.schedule.map((day) => {
          const isSelected = day.dayNumber === selectedDayNumber;
          const isCompleted = !!day.completed;

          return (
            <button
              key={day.dayNumber}
              onClick={() => onSelectDay(day.dayNumber)}
              className={`flex-shrink-0 flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all min-w-[145px] ${
                isSelected
                  ? 'bg-zinc-800 border-emerald-500/80 shadow-lg shadow-emerald-500/10'
                  : 'bg-zinc-900/80 hover:bg-zinc-800/60 border-zinc-800/80 text-zinc-400'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-emerald-400' : 'text-zinc-400'}`}>
                  {day.dayName.split('-')[0] || `Day ${day.dayNumber}`}
                </span>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                ) : day.isRestDay ? (
                  <span className="w-2 h-2 rounded-full bg-cyan-400/50" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-zinc-600" />
                )}
              </div>

              <div className={`text-xs font-semibold truncate w-full ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                {day.title}
              </div>

              <div className="flex items-center gap-2 mt-2 text-[10px] text-zinc-400">
                {day.isRestDay ? (
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-medium">Recovery</span>
                ) : (
                  <>
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      {day.durationMinutes}m
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Flame className="w-3 h-3 text-orange-400" />
                      {day.estimatedCaloriesBurn} kcal
                    </span>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Day Detail Card */}
      <div className="rounded-3xl bg-zinc-900/90 border border-zinc-800 p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {activeDay.dayName}
              </span>
              {activeDay.isRestDay ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Active Recovery & Mobility
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Workout Session
                </span>
              )}
              {activeDay.completed && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Completed
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              {activeDay.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Focus: <span className="text-zinc-200 font-medium">{activeDay.focus}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onToggleDayCompleted(activeDay.dayNumber)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                activeDay.completed
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              {activeDay.completed ? 'Mark as Incomplete' : 'Mark Day Completed'}
            </button>

            {!activeDay.isRestDay && (
              <button
                onClick={() => onLaunchWorkoutPlayer(activeDay.dayNumber)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-zinc-950" />
                Start Live Workout
              </button>
            )}
          </div>
        </div>

        {/* Warmup & Cooldown Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {activeDay.warmup && (
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Dynamic Warm-up ({activeDay.warmup.durationMinutes} Mins)
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {activeDay.warmup.routine.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeDay.cooldown && (
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Cool-down & Downregulation ({activeDay.cooldown.durationMinutes} Mins)
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {activeDay.cooldown.routine.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Exercises List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-emerald-400" />
              {activeDay.isRestDay ? 'Recovery Activities' : `Circuit & Resistance Exercises (${activeDay.exercises.length})`}
            </h3>
            <span className="text-xs text-zinc-400">Click set to log completion</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {activeDay.exercises.map((exercise, index) => {
              const isExpanded = expandedExerciseId === exercise.id;
              const completedCount = (exercise.completedSets || []).filter(Boolean).length;
              const allSetsDone = exercise.sets > 0 && completedCount === exercise.sets;

              return (
                <div
                  key={exercise.id}
                  className={`rounded-2xl border transition-all ${
                    allSetsDone
                      ? 'bg-zinc-950/60 border-emerald-500/40'
                      : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="p-4 sm:p-5">
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-zinc-800 text-xs font-bold text-zinc-300 flex-shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm sm:text-base font-bold text-white">
                              {exercise.name}
                            </h4>
                            {exercise.equipment && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300">
                                {exercise.equipment}
                              </span>
                            )}
                          </div>
                          {/* Target muscles */}
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {exercise.targetMuscles.map((muscle, mIdx) => (
                              <span
                                key={mIdx}
                                className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400"
                              >
                                {muscle}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Primary Parameters */}
                      <div className="flex items-center gap-3 text-xs text-zinc-300 bg-zinc-900/90 px-3.5 py-2 rounded-xl border border-zinc-800 self-start sm:self-center">
                        <div className="text-center">
                          <div className="font-extrabold text-white text-sm">{exercise.sets}</div>
                          <div className="text-[10px] text-zinc-400 uppercase font-medium">Sets</div>
                        </div>
                        <div className="h-6 w-px bg-zinc-800" />
                        <div className="text-center">
                          <div className="font-extrabold text-white text-sm">{exercise.reps}</div>
                          <div className="text-[10px] text-zinc-400 uppercase font-medium">Reps / Time</div>
                        </div>
                        <div className="h-6 w-px bg-zinc-800" />
                        <div className="text-center">
                          <div className="font-extrabold text-emerald-400 text-sm">{exercise.restSeconds}s</div>
                          <div className="text-[10px] text-zinc-400 uppercase font-medium">Rest</div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Sets Checklist & Logging */}
                    <div className="mt-4 pt-3 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1 mr-1">
                          <Layers className="w-3.5 h-3.5 text-zinc-400" />
                          Sets:
                        </span>
                        {Array.from({ length: exercise.sets }).map((_, setIdx) => {
                          const isDone = !!exercise.completedSets?.[setIdx];
                          return (
                            <button
                              key={setIdx}
                              onClick={() => {
                                onToggleSetCompleted(activeDay.dayNumber, exercise.id, setIdx);
                                if (!isDone) playCompletionChime();
                              }}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                isDone
                                  ? 'bg-emerald-500 text-zinc-950 shadow-sm shadow-emerald-500/30'
                                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                              }`}
                              title={`Click to mark Set ${setIdx + 1} done`}
                            >
                              {isDone ? <CheckCircle className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                              <span>Set {setIdx + 1}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Coach Form Check & Details Accordion Toggle */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onAskCoachAboutExercise(exercise.name)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-cyan-400 text-xs font-medium border border-zinc-800 transition-colors"
                          title="Ask FitBuddy AI Coach for exercise tips"
                        >
                          <Sparkles className="w-3 h-3" />
                          Form Tips
                        </button>
                        <button
                          onClick={() => toggleExpand(exercise.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors"
                        >
                          <span>{isExpanded ? 'Hide Cues' : 'Form Cues'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Form Cues & Alternative Exercise */}
                    {isExpanded && (
                      <div className="mt-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 space-y-3">
                        {exercise.rpe && (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-400">Target Intensity:</span>
                            <span className="text-emerald-400 font-semibold">{exercise.rpe}</span>
                            {exercise.tempo && (
                              <>
                                <span className="text-zinc-600">•</span>
                                <span className="text-zinc-400">Tempo:</span>
                                <span className="text-zinc-200 font-medium">{exercise.tempo}</span>
                              </>
                            )}
                          </div>
                        )}

                        <div>
                          <div className="font-bold text-zinc-200 mb-1 flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                            Key Form Cues & Technique:
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-zinc-300 pl-1">
                            {exercise.formCues.map((cue, cIdx) => (
                              <li key={cIdx}>{cue}</li>
                            ))}
                          </ul>
                        </div>

                        {exercise.alternativeExercise && (
                          <div className="pt-2 border-t border-zinc-800/80 flex items-start gap-2">
                            <Repeat className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-bold text-cyan-300">Alternative Movement: </span>
                              <span className="text-zinc-300">{exercise.alternativeExercise}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Recovery Tips Footer */}
        {activeDay.recoveryTips && (
          <div className="mt-6 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex items-start gap-3 text-xs text-zinc-400">
            <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-zinc-300">Coach Recovery Protocol: </span>
              {activeDay.recoveryTips}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
