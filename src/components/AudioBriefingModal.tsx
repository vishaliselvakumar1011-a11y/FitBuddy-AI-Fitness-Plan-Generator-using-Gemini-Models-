import React, { useState } from 'react';
import { 
  X, 
  Volume2, 
  Play, 
  Pause, 
  Sparkles, 
  RotateCcw, 
  Loader2, 
  Mic 
} from 'lucide-react';
import { FitnessPlan, WorkoutDay } from '../types/fitness';
import { playBase64Audio } from '../utils/audio';

interface AudioBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: FitnessPlan;
  activeDay: WorkoutDay;
}

export const AudioBriefingModal: React.FC<AudioBriefingModalProps> = ({
  isOpen,
  onClose,
  plan,
  activeDay,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<'Fenrir' | 'Puck' | 'Kore' | 'Zephyr'>('Fenrir');
  const [briefingType, setBriefingType] = useState<'workout' | 'mindset' | 'recovery'>('workout');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const voices: { id: 'Fenrir' | 'Puck' | 'Kore' | 'Zephyr'; name: string; style: string }[] = [
    { id: 'Fenrir', name: 'Fenrir', style: 'Intense, authoritative athletic coach' },
    { id: 'Puck', name: 'Puck', style: 'High-energy, upbeat workout partner' },
    { id: 'Kore', name: 'Kore', style: 'Mindful, encouraging & supportive' },
    { id: 'Zephyr', name: 'Zephyr', style: 'Calm, focused, technical specialist' },
  ];

  const handleGenerateAudio = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    // Stop existing audio if playing
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }

    let textPrompt = '';
    if (briefingType === 'workout') {
      textPrompt = `Welcome to ${activeDay.dayName}! Today's focus is ${activeDay.title}. You have ${activeDay.exercises.length} key exercises programmed. Maintain strict tempo on every rep, embrace the burn, and keep that core braced. Let's attack this session with purpose!`;
    } else if (briefingType === 'mindset') {
      textPrompt = `Listen closely: Consistency beats raw talent every single day. The sweat you invest today sets the foundation for who you will be three months from now. Lock in, silence the excuses, and make today count!`;
    } else {
      textPrompt = `Your recovery protocol is just as vital as your heaviest lifts. Today prioritize your hydration goal of ${plan.nutrition.hydrationLiters} liters, hit your protein target, and get 8 hours of restorative sleep to let muscle protein synthesis work its magic.`;
    }

    setTranscript(textPrompt);

    try {
      const response = await fetch('/api/voice-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textPrompt,
          voiceName: selectedVoice,
        }),
      });

      const data = await response.json();
      if (data.success && data.audio) {
        const audio = await playBase64Audio(data.audio, data.mimeType);
        setAudioElement(audio);
        setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
      } else {
        setErrorMsg(data.error || 'Failed to generate voice audio.');
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Failed to connect to Gemini TTS service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePlayback = () => {
    if (!audioElement) return;
    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
    } else {
      audioElement.play();
      setIsPlaying(true);
    }
  };

  const handleStopAndClose = () => {
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Decorative blur */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Gemini Audio Coach Briefing
              </h3>
              <p className="text-xs text-zinc-400">Powered by gemini-3.8-flash-lite-tts</p>
            </div>
          </div>

          <button
            onClick={handleStopAndClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Briefing Category Selector */}
        <div className="mb-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Select Briefing Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'workout', label: 'Workout Brief' },
              { id: 'mindset', label: 'Mindset Boost' },
              { id: 'recovery', label: 'Recovery Check' },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBriefingType(b.id as any)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  briefingType === b.id
                    ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Coach Voice Picker */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Choose Coach Voice Persona
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {voices.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVoice(v.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedVoice === v.id
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="font-bold text-xs text-white">{v.name}</div>
                <div className="text-[10px] text-zinc-400 leading-tight mt-0.5">{v.style}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Transcript / Text Preview */}
        {transcript && (
          <div className="mb-6 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 block">
              Audio Script
            </span>
            <p className="text-xs text-zinc-300 italic">
              "{transcript}"
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateAudio}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-zinc-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Voice...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Generate Voice Briefing</span>
              </>
            )}
          </button>

          {audioElement && (
            <button
              onClick={handleTogglePlayback}
              className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
