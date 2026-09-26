import React, { useState } from 'react';
import { 
  Utensils, 
  Droplets, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Apple, 
  Coffee, 
  Sun, 
  Moon, 
  Zap,
  Loader2,
  Clock,
  Lightbulb
} from 'lucide-react';
import { NutritionPlan } from '../types/fitness';

interface NutritionViewProps {
  nutrition: NutritionPlan;
  onAskCoachAboutMeal: (mealTitle: string) => void;
}

interface FlashTipData {
  title: string;
  category: string;
  keyAdvice: string;
  timing: string;
  macroFocus: string;
  proTip: string;
}

export const NutritionView: React.FC<NutritionViewProps> = ({
  nutrition,
  onAskCoachAboutMeal,
}) => {
  const [glassesDrank, setGlassesDrank] = useState(4); // 250ml each glass
  const [activeFlashCategory, setActiveFlashCategory] = useState<string>('post-workout');
  const [flashTip, setFlashTip] = useState<FlashTipData | null>({
    title: 'Rapid Leucine Spike & Glycogen Replenish',
    category: 'post-workout',
    keyAdvice: 'Consume 25-35g of rapid-digesting protein within 60 minutes of training to maximize muscle protein synthesis. Pair with easily digestible carbs like white rice, banana, or maltodextrin.',
    timing: 'Within 45-60 minutes post-training',
    macroFocus: '30g Protein + 45g Fast-Acting Carbs (< 5g Fat)',
    proTip: 'Keep post-workout fats low to speed gastric emptying and nutrient delivery to recovering muscle tissue.'
  });
  const [flashLoading, setFlashLoading] = useState(false);

  const fetchFlashTip = async (category: string) => {
    setActiveFlashCategory(category);
    setFlashLoading(true);
    try {
      const res = await fetch('/api/flash-tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      });
      const data = await res.json();
      if (data.success && data.tip) {
        setFlashTip(data.tip);
      }
    } catch (e) {
      console.error('Failed to get flash tip:', e);
    } finally {
      setFlashLoading(false);
    }
  };
  const totalGlassesTarget = Math.round((nutrition.hydrationLiters * 1000) / 250);

  const getMealIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breakfast':
        return <Coffee className="w-4 h-4 text-amber-400" />;
      case 'lunch':
        return <Sun className="w-4 h-4 text-yellow-400" />;
      case 'dinner':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      case 'snack':
        return <Apple className="w-4 h-4 text-emerald-400" />;
      default:
        return <Zap className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Daily Calorie & Macro Target */}
      <div className="rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Nutritional Blueprint
              </span>
              <span className="text-xs text-zinc-400">Scientifically calibrated to your metabolic rate</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Daily Target: <span className="text-emerald-400">{nutrition.dailyCalorieTarget}</span> kcal
            </h2>
          </div>

          {/* Hydration Interactive Counter */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-zinc-400 mb-0.5">Hydration Tracker</div>
              <div className="text-sm font-bold text-white">
                {(glassesDrank * 0.25).toFixed(1)} / {nutrition.hydrationLiters} L
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <button
                  onClick={() => setGlassesDrank((g) => Math.max(0, g - 1))}
                  className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 flex items-center justify-center text-xs font-bold"
                  title="Minus 1 glass"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-mono text-cyan-400 font-semibold">{glassesDrank} glasses</span>
                <button
                  onClick={() => setGlassesDrank((g) => g + 1)}
                  className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 flex items-center justify-center text-xs font-bold"
                  title="Plus 1 glass"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Macro Nutrient Breakdown Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {/* Protein */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-emerald-400">Protein</span>
              <span className="text-xs font-semibold text-zinc-400">{nutrition.macros.proteinPercent}%</span>
            </div>
            <div className="text-2xl font-black text-white mb-2">
              {nutrition.macros.proteinGrams} <span className="text-sm font-normal text-zinc-400">grams</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div 
                className="h-full bg-emerald-400 rounded-full"
                style={{ width: `${nutrition.macros.proteinPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">Essential for muscle repair & satiety</p>
          </div>

          {/* Carbs */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-cyan-400">Carbohydrates</span>
              <span className="text-xs font-semibold text-zinc-400">{nutrition.macros.carbsPercent}%</span>
            </div>
            <div className="text-2xl font-black text-white mb-2">
              {nutrition.macros.carbsGrams} <span className="text-sm font-normal text-zinc-400">grams</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div 
                className="h-full bg-cyan-400 rounded-full"
                style={{ width: `${nutrition.macros.carbsPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">Primary glycogen fuel for intense training</p>
          </div>

          {/* Healthy Fats */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-amber-400">Healthy Fats</span>
              <span className="text-xs font-semibold text-zinc-400">{nutrition.macros.fatsPercent}%</span>
            </div>
            <div className="text-2xl font-black text-white mb-2">
              {nutrition.macros.fatsGrams} <span className="text-sm font-normal text-zinc-400">grams</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div 
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${nutrition.macros.fatsPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">Hormonal balance and cellular health</p>
          </div>
        </div>
      </div>

      {/* Gemini Flash Nutrition & Recovery Tips Widget */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Gemini Flash Nutrition & Recovery Tips
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                  Fast Response
                </span>
              </h3>
              <p className="text-xs text-zinc-400">Instant science-backed recommendations powered by Gemini Flash</p>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
            {[
              { id: 'pre-workout', label: 'Pre-Workout' },
              { id: 'post-workout', label: 'Post-Workout' },
              { id: 'hydration', label: 'Hydration' },
              { id: 'sleep', label: 'Overnight Recovery' },
              { id: 'soreness', label: 'DOMS & Soreness' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => fetchFlashTip(cat.id)}
                className={`flex-shrink-0 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  activeFlashCategory === cat.id
                    ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tip Content */}
        {flashLoading ? (
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center gap-2 text-xs text-zinc-400">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Generating tailored tip with Gemini Flash...</span>
          </div>
        ) : flashTip ? (
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
                {flashTip.title}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {flashTip.timing}
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {flashTip.keyAdvice}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-900 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 font-bold block mb-0.5 text-[10px] uppercase">Macro / Target Focus</span>
                <span className="text-emerald-400 font-semibold">{flashTip.macroFocus}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 font-bold block mb-0.5 text-[10px] uppercase">Coach Pro-Tip</span>
                <span className="text-zinc-200">{flashTip.proTip}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Recommended Meal Ideas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-400" />
            Curated Meal Architecture
          </h3>
          <span className="text-xs text-zinc-400">Balanced macronutrient distribution</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nutrition.mealSuggestions.map((meal, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-200">
                      {getMealIcon(meal.mealType)}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      {meal.mealType}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-white bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span>{meal.estimatedCalories} kcal</span>
                  </div>
                </div>

                <h4 className="text-base font-bold text-white mb-1.5">
                  {meal.title}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                  {meal.description}
                </p>

                {/* Key Ingredients */}
                {meal.keyIngredients && meal.keyIngredients.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {meal.keyIngredients.map((item, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-800/80 text-zinc-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Meal Macros Bar & Coach Swap */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px] text-zinc-300 font-semibold">
                  <span className="text-emerald-400">P: {meal.proteinGrams}g</span>
                  <span className="text-cyan-400">C: {meal.carbsGrams}g</span>
                  <span className="text-amber-400">F: {meal.fatsGrams}g</span>
                </div>

                <button
                  onClick={() => onAskCoachAboutMeal(meal.title)}
                  className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  Ask Coach Alternative
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supplementation & Dietary Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supplementation */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Evidence-Based Supplement Stack
          </h4>
          <ul className="space-y-2.5 text-xs text-zinc-300">
            {nutrition.supplementationTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dietary Rules of Thumb */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
            <Utensils className="w-4 h-4" />
            Nutritional Guidelines & Timing
          </h4>
          <ul className="space-y-2.5 text-xs text-zinc-300">
            {nutrition.dietaryGuidance.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
