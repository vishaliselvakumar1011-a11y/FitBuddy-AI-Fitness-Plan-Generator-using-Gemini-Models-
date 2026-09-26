export type GoalType = 
  | 'fat_loss' 
  | 'muscle_gain' 
  | 'strength' 
  | 'endurance' 
  | 'mobility_flexibility' 
  | 'recomp' 
  | 'general_fitness';

export type ExperienceLevel = 'beginner' | 'novice' | 'intermediate' | 'advanced';

export type WorkoutLocation = 'home_no_gear' | 'home_minimal' | 'commercial_gym' | 'calisthenics_park';

export type DietaryStyle = 
  | 'omnivore' 
  | 'high_protein' 
  | 'vegetarian' 
  | 'vegan' 
  | 'keto' 
  | 'mediterranean' 
  | 'pescatarian' 
  | 'low_carb';

export interface UserProfile {
  name: string;
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  age: number;
  weight: number;
  height: number;
  unitSystem: 'metric' | 'imperial';
  primaryGoal: GoalType;
  secondaryGoals: string[];
  experienceLevel: ExperienceLevel;
  daysPerWeek: number;
  sessionDuration: number; // in minutes
  workoutLocation: WorkoutLocation;
  equipmentAvailable: string[];
  preferredActivities: string[];
  physicalLimitations: string;
  targetMuscles: string[];
  dietaryStyle: DietaryStyle;
  calorieGoalType: 'deficit' | 'maintenance' | 'surplus';
  sleepHours: number;
  dailyStressLevel: 'low' | 'moderate' | 'high';
  dailyStepTarget: number;
  geminiModel: 'gemini-3.8-flash' | 'gemini-3.1-flash-lite';
}

export interface Exercise {
  id: string;
  name: string;
  targetMuscles: string[];
  sets: number;
  reps: string; // e.g. "8-12 reps" or "45 sec hold"
  restSeconds: number;
  rpe?: string; // Rate of perceived exertion e.g. "RPE 8"
  tempo?: string;
  formCues: string[];
  alternativeExercise: string;
  equipment: string;
  completedSets?: boolean[];
  loggedWeights?: (number | string)[];
}

export interface WorkoutDay {
  dayNumber: number;
  dayName: string; // e.g. "Day 1 - Monday"
  title: string; // e.g. "Push Strength & Core Blast"
  isRestDay: boolean;
  focus: string; // e.g. "Chest, Shoulders, Triceps" or "Active Recovery & Mobility"
  durationMinutes: number;
  estimatedCaloriesBurn: number;
  warmup: {
    durationMinutes: number;
    routine: string[];
  };
  exercises: Exercise[];
  cooldown: {
    durationMinutes: number;
    routine: string[];
  };
  recoveryTips?: string;
  completed?: boolean;
}

export interface MealRecommendation {
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Pre/Post Workout';
  title: string;
  description: string;
  estimatedCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  keyIngredients: string[];
}

export interface NutritionPlan {
  dailyCalorieTarget: number;
  macros: {
    proteinGrams: number;
    carbsGrams: number;
    fatsGrams: number;
    proteinPercent: number;
    carbsPercent: number;
    fatsPercent: number;
  };
  hydrationLiters: number;
  supplementationTips: string[];
  mealSuggestions: MealRecommendation[];
  dietaryGuidance: string[];
}

export interface LifestylePlan {
  sleepRecommendations: string[];
  stressManagement: string[];
  dailyHabits: string[];
  weeklyMilestones: string[];
  coachMessage: string;
}

export interface FitnessPlan {
  id: string;
  createdAt: string;
  modelUsed: string;
  planName: string;
  tagline: string;
  overview: string;
  weeklySplitSummary: string;
  schedule: WorkoutDay[];
  nutrition: NutritionPlan;
  lifestyle: LifestylePlan;
}

export interface ActiveWorkoutSession {
  dayNumber: number;
  exerciseIndex: number;
  currentSet: number;
  timerSeconds: number;
  isResting: boolean;
  restTimerSeconds: number;
  sessionStartedAt: number;
  completedExercises: Record<string, boolean[]>;
}
