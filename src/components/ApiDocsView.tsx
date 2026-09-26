import React, { useState } from 'react';
import { 
  Terminal, 
  Send, 
  Code, 
  Layers, 
  Copy, 
  Check, 
  Play, 
  Loader2, 
  ExternalLink, 
  FileJson,
  Sparkles,
  Server
} from 'lucide-react';

interface EndpointDoc {
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  geminiModel?: string;
  sampleBody?: any;
}

const ENDPOINTS: EndpointDoc[] = [
  {
    method: 'POST',
    path: '/api/generate-plan',
    summary: 'Generate 7-Day Workout & Nutrition Plan',
    description: 'Generates a full science-backed 7-day workout routine, macro targets, and recovery guidelines using Gemini 1.5 Pro / Gemini 3.8 Flash based on user details.',
    geminiModel: 'gemini-3.8-flash',
    sampleBody: {
      name: 'Alex',
      age: 28,
      weight: 72,
      height: 175,
      unitSystem: 'metric',
      primaryGoal: 'fat_loss',
      experienceLevel: 'intermediate',
      daysPerWeek: 4,
      sessionDuration: 45,
      workoutLocation: 'home_minimal',
      equipmentAvailable: ['Dumbbells', 'Resistance Bands'],
      dietaryStyle: 'high_protein',
      calorieGoalType: 'deficit',
      geminiModel: 'gemini-3.8-flash'
    }
  },
  {
    method: 'POST',
    path: '/api/modify-plan',
    summary: 'Update Existing Plan via User Feedback',
    description: 'Takes user feedback (e.g. "Add more cardio", "Include more rest days") and updates the workout plan with version history stored in the SQLite/JSON database.',
    geminiModel: 'gemini-3.8-flash',
    sampleBody: {
      modificationPrompt: 'Add more cardio on Day 2 and make leg exercises joint-friendly',
      model: 'gemini-3.8-flash',
      currentPlan: {
        id: 'sample-plan-1',
        planName: 'Sample Hypertrophy Program',
        schedule: [
          { dayNumber: 1, dayName: 'Day 1 - Monday', title: 'Upper Body Power', isRestDay: false, exercises: [] }
        ]
      }
    }
  },
  {
    method: 'POST',
    path: '/api/flash-tip',
    summary: 'Quick Nutrition & Recovery Tip (Gemini Flash)',
    description: 'Ultra-low latency instant nutrition or recovery tip powered by Gemini Flash for rapid fueling, hydration, and soreness relief.',
    geminiModel: 'gemini-3.1-flash-lite',
    sampleBody: {
      category: 'post-workout',
      goal: 'muscle_gain',
      dietStyle: 'high_protein'
    }
  },
  {
    method: 'POST',
    path: '/api/coach-chat',
    summary: 'FitBuddy AI Coach Assistant',
    description: 'Conversational assistant providing form cues, biomechanics tips, and lifestyle guidance.',
    geminiModel: 'gemini-3.8-flash',
    sampleBody: {
      messages: [
        { role: 'user', content: 'What is the best tempo for barbell or dumbbell Romanian deadlifts?' }
      ],
      currentPlanSummary: 'Kinetic Hypertrophy (4 days/week)',
      userProfile: { name: 'Alex', primaryGoal: 'muscle_gain' }
    }
  },
  {
    method: 'GET',
    path: '/api/admin/overview',
    summary: 'Admin Dashboard Telemetry & Plan Storage',
    description: 'Retrieves aggregated statistics of registered users, plan history, and feedback iteration metrics from the database.',
  },
  {
    method: 'GET',
    path: '/api/openapi.json',
    summary: 'OpenAPI 3.0 Documentation Schema',
    description: 'Returns the machine-readable OpenAPI schema for API integration and client generation.',
  }
];

export const ApiDocsView: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDoc>(ENDPOINTS[0]);
  const [requestPayload, setRequestPayload] = useState<string>(
    JSON.stringify(ENDPOINTS[0].sampleBody || {}, null, 2)
  );
  const [responseOutput, setResponseOutput] = useState<string>('');
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSelect = (ep: EndpointDoc) => {
    setSelectedEndpoint(ep);
    setRequestPayload(JSON.stringify(ep.sampleBody || {}, null, 2));
    setResponseOutput('');
    setResponseStatus(null);
  };

  const handleExecute = async () => {
    setLoading(true);
    setResponseOutput('');
    setResponseStatus(null);

    const startTime = performance.now();
    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (selectedEndpoint.method === 'POST') {
        options.body = requestPayload;
      }

      const res = await fetch(selectedEndpoint.path, options);
      const elapsed = Math.round(performance.now() - startTime);
      setResponseStatus(res.status);

      const data = await res.json();
      setResponseOutput(JSON.stringify({ _timing_ms: elapsed, ...data }, null, 2));
    } catch (err: any) {
      setResponseOutput(JSON.stringify({ error: err.message }, null, 2));
      setResponseStatus(500);
    } finally {
      setLoading(false);
    }
  };

  const copyCurl = () => {
    let curl = `curl -X ${selectedEndpoint.method} "https://ais-dev-xgvtsj3n42lgukwm3fje6z-388275463808.asia-southeast1.run.app${selectedEndpoint.path}"`;
    if (selectedEndpoint.method === 'POST') {
      curl += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${requestPayload.replace(/\n/g, '')}'`;
    }
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Interactive OpenAPI / FastAPI Docs
            </span>
            <span className="text-xs text-zinc-500">Live API Endpoint Sandbox</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Server className="w-6 h-6 text-emerald-400" />
            FitBuddy API Interactive Documentation
          </h1>
          <p className="text-xs text-zinc-400">
            Test backend routes, view request schemas, inspect Gemini model latency, and run live workout & nutrition plan generations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/openapi.json"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-colors"
          >
            <FileJson className="w-4 h-4 text-cyan-400" />
            <span>Raw OpenAPI Schema</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </a>
        </div>
      </div>

      {/* Main Grid: Endpoint List + Interactive Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigation: Endpoints List */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 px-1">
            Available API Endpoints
          </div>
          {ENDPOINTS.map((ep, idx) => {
            const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(ep)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-zinc-800 border-emerald-500 text-white shadow-md'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        ep.method === 'POST'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-cyan-500/20 text-cyan-400'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs font-bold text-white">{ep.path}</span>
                  </div>
                  {ep.geminiModel && (
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                      {ep.geminiModel.replace('gemini-', '')}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-1">{ep.summary}</p>
              </button>
            );
          })}
        </div>

        {/* Right Console: Request, Headers & Live Response */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl">
            {/* Endpoint Summary Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase ${
                    selectedEndpoint.method === 'POST'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-base font-bold text-white">
                  {selectedEndpoint.path}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyCurl}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700"
                  title="Copy cURL Command"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'cURL'}</span>
                </button>
                <button
                  onClick={handleExecute}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 text-xs font-extrabold shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-zinc-950" />}
                  <span>{loading ? 'Executing...' : 'Send Request'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-zinc-300 mb-4">{selectedEndpoint.description}</p>

            {/* Request Body Editor */}
            {selectedEndpoint.method === 'POST' && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  <span>Request JSON Body</span>
                  <span className="text-[10px] text-zinc-500">application/json</span>
                </div>
                <textarea
                  rows={8}
                  value={requestPayload}
                  onChange={(e) => setRequestPayload(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {/* Response Section */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                <span>Response Console</span>
                {responseStatus && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      responseStatus === 200
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    Status: {responseStatus} OK
                  </span>
                )}
              </div>

              <div className="min-h-[160px] max-h-[360px] overflow-y-auto p-4 rounded-2xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-200 whitespace-pre-wrap">
                {loading ? (
                  <div className="flex items-center gap-2 text-zinc-500 py-8 justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Communicating with FitBuddy backend & Gemini models...</span>
                  </div>
                ) : responseOutput ? (
                  responseOutput
                ) : (
                  <span className="text-zinc-600 italic">Click "Send Request" to test this endpoint live and inspect output.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
