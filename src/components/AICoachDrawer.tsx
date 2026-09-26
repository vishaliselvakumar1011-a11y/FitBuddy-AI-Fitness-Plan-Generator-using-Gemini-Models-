import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  SlidersHorizontal, 
  Loader2, 
  Dumbbell, 
  Flame 
} from 'lucide-react';
import { FitnessPlan, UserProfile } from '../types/fitness';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AICoachDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plan: FitnessPlan;
  userProfile: UserProfile;
  initialPrompt?: string;
  onPlanUpdated: (newPlan: FitnessPlan) => void;
}

export const AICoachDrawer: React.FC<AICoachDrawerProps> = ({
  isOpen,
  onClose,
  plan,
  userProfile,
  initialPrompt,
  onPlanUpdated,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hey ${userProfile.name || 'there'}! I'm your FitBuddy AI Coach. I have your complete "${plan.planName}" loaded into memory. Ask me anything about exercise technique, exercise swaps for joint discomfort, meal ideas, or ask me to modify your active routine!`,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModifyingPlan, setIsModifyingPlan] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          currentPlanSummary: `${plan.planName} (${plan.weeklySplitSummary})`,
          userProfile,
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Apologies, I encountered a temporary hiccup communicating with Gemini. Please try again.' },
        ]);
      }
    } catch (e: any) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Connection error. Please check your network or try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPlanModification = async (instruction: string) => {
    if (!instruction.trim() || isModifyingPlan) return;
    setIsModifyingPlan(true);

    const userNotice: Message = {
      role: 'user',
      content: `Requesting plan modification: "${instruction}"`,
    };
    setMessages((prev) => [...prev, userNotice]);

    try {
      const response = await fetch('/api/modify-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPlan: plan,
          modificationPrompt: instruction,
          model: userProfile.geminiModel,
          userId: userProfile.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'user-default',
        }),
      });

      const data = await response.json();
      if (data.success && data.plan) {
        onPlanUpdated(data.plan);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Done! I've updated your workout and lifestyle schedule based on "${instruction}". You'll see the adjustments reflected immediately on your dashboard.`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Could not update plan: ${data.error || 'Unknown error'}` },
        ]);
      }
    } catch (e: any) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Failed to update plan. Please try again.' },
      ]);
    } finally {
      setIsModifyingPlan(false);
    }
  };

  if (!isOpen) return null;

  const quickPrompts = [
    'I have sensitive knees today, substitute squat exercises',
    'How do I compress today\'s session into 25 minutes?',
    'Give me a post-workout high-protein smoothie idea',
    'Explain proper breathing tempo during Romanian Deadlifts',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              FitBuddy Coach
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-zinc-400">Powered by Gemini 3.8</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 border-b border-zinc-900 bg-zinc-950/80 flex items-center gap-2 overflow-x-auto scrollbar-thin">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-emerald-400 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-zinc-800 text-zinc-200'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-emerald-500 text-zinc-950 font-medium rounded-tr-none'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none'
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 p-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>FitBuddy is thinking...</span>
          </div>
        )}

        {isModifyingPlan && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 p-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Adjusting your workout architecture with Gemini...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action: Feedback-Based Plan Update */}
      <div className="px-4 py-2.5 bg-zinc-900 border-t border-zinc-800 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-zinc-300 font-semibold flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            Feedback-Based Workout Update
          </span>
          <span className="text-[10px] text-zinc-500">Auto-saved to DB</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="e.g. 'Swap squats due to knee pain' or 'Make Day 3 shorter'..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value;
                if (val.trim()) {
                  handleApplyPlanModification(val.trim());
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
            className="flex-1 py-1.5 px-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={(e) => {
              const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
              if (input && input.value.trim()) {
                handleApplyPlanModification(input.value.trim());
                input.value = '';
              }
            }}
            disabled={isModifyingPlan}
            className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold transition-all disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask FitBuddy about exercises, nutrition, recovery..."
            className="flex-1 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
