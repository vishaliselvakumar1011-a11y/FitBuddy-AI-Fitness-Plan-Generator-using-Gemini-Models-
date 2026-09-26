import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Printer, 
  Download, 
  FileText 
} from 'lucide-react';
import { FitnessPlan, UserProfile } from '../types/fitness';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: FitnessPlan;
  userProfile: UserProfile;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  plan,
  userProfile,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdown = () => {
    let md = `# ${plan.planName}\n\n`;
    md += `*${plan.tagline}*\n\n`;
    md += `**Client**: ${userProfile.name} | **Goal**: ${userProfile.primaryGoal} | **Model**: ${plan.modelUsed}\n\n`;
    md += `## Overview\n${plan.overview}\n\n`;
    md += `## Weekly Architecture: ${plan.weeklySplitSummary}\n\n`;

    md += `## 7-Day Workout Schedule\n\n`;
    plan.schedule.forEach((day) => {
      md += `### ${day.dayName}: ${day.title} (${day.isRestDay ? 'Rest/Recovery' : `${day.durationMinutes} mins ~ ${day.estimatedCaloriesBurn} kcal`})\n`;
      md += `*Focus*: ${day.focus}\n\n`;

      if (day.warmup && day.warmup.routine.length > 0) {
        md += `**Warm-up (${day.warmup.durationMinutes}m)**: ${day.warmup.routine.join(', ')}\n\n`;
      }

      if (day.exercises.length > 0) {
        md += `| # | Exercise | Sets | Reps/Time | Rest | Form Cue |\n`;
        md += `|---|---|---|---|---|---|\n`;
        day.exercises.forEach((ex, idx) => {
          md += `| ${idx + 1} | **${ex.name}** (${ex.equipment || 'Bodyweight'}) | ${ex.sets} | ${ex.reps} | ${ex.restSeconds}s | ${ex.formCues[0] || ''} |\n`;
        });
        md += `\n`;
      }

      if (day.recoveryTips) {
        md += `*Recovery*: ${day.recoveryTips}\n\n`;
      }
    });

    md += `## Nutrition & Fueling Plan\n`;
    md += `- **Daily Calorie Target**: ${plan.nutrition.dailyCalorieTarget} kcal\n`;
    md += `- **Macros**: Protein ${plan.nutrition.macros.proteinGrams}g (${plan.nutrition.macros.proteinPercent}%) | Carbs ${plan.nutrition.macros.carbsGrams}g (${plan.nutrition.macros.carbsPercent}%) | Fats ${plan.nutrition.macros.fatsGrams}g (${plan.nutrition.macros.fatsPercent}%)\n`;
    md += `- **Hydration**: ${plan.nutrition.hydrationLiters} Liters/day\n\n`;

    md += `### Meal Framework:\n`;
    plan.nutrition.mealSuggestions.forEach((m) => {
      md += `- **${m.mealType}**: ${m.title} (${m.estimatedCalories} kcal - P:${m.proteinGrams}g, C:${m.carbsGrams}g, F:${m.fatsGrams}g)\n  ${m.description}\n`;
    });

    md += `\n## Lifestyle & Recovery Recommendations\n`;
    plan.lifestyle.dailyHabits.forEach((h) => {
      md += `- [ ] ${h}\n`;
    });

    return md;
  };

  const markdownText = generateMarkdown();

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(plan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `FitBuddy_Plan_${plan.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 sm:p-8 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 text-cyan-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Export & Print Plan</h3>
              <p className="text-xs text-zinc-400">Share, print, or export your Gemini fitness blueprint</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>
        </div>

        {/* Formatted Markdown Preview */}
        <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
          {markdownText}
        </div>
      </div>
    </div>
  );
};
