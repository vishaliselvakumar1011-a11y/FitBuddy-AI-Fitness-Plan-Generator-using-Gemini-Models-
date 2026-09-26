import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Dumbbell, 
  MessageSquare, 
  Activity, 
  Trash2, 
  Eye, 
  RefreshCw, 
  X, 
  Calendar, 
  Flame, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';
import { FitnessPlan } from '../types/fitness';

interface UserRecord {
  id: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  unitSystem: string;
  primaryGoal: string;
  experienceLevel: string;
  createdAt: string;
  planCount: number;
  lastActive: string;
}

interface PlanOverviewRecord {
  id: string;
  userId: string;
  userName: string;
  planName: string;
  modelUsed: string;
  createdAt: string;
  daysPerWeek: number;
  targetCalories: number;
  feedbackCount: number;
}

interface AdminDashboardProps {
  onLoadPlanIntoApp: (plan: FitnessPlan) => void;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLoadPlanIntoApp,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [recentPlans, setRecentPlans] = useState<PlanOverviewRecord[]>([]);
  const [selectedPlanDetail, setSelectedPlanDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [planVersionView, setPlanVersionView] = useState<'updated' | 'original' | 'compare'>('updated');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'plans'>('overview');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/overview');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setUsers(data.users || []);
        setRecentPlans(data.recentPlans || []);
      }
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleInspectPlan = async (planId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/plans/${planId}`);
      const data = await res.json();
      if (data.success && data.plan) {
        setSelectedPlanDetail(data.plan);
      }
    } catch (e) {
      console.error('Failed to load plan detail:', e);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan record from database?')) return;
    try {
      await fetch(`/api/admin/plans/${planId}`, { method: 'DELETE' });
      setRecentPlans(prev => prev.filter(p => p.id !== planId));
      if (selectedPlanDetail?.id === planId) setSelectedPlanDetail(null);
    } catch (e) {
      console.error('Error deleting plan:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Administrative Control Center
            </span>
            <span className="text-xs text-zinc-500">Live SQLite/JSON Storage Monitoring</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            FitBuddy Admin Dashboard
          </h1>
          <p className="text-xs text-zinc-400">
            Monitor client profiles, AI generation workloads, feedback history, and stored fitness plans.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAdminData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-md transition-colors"
          >
            Exit Admin View
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Total Registered Users</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats?.totalUsers ?? users.length}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Active client profiles</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Generated Workout Plans</span>
            <Dumbbell className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats?.totalPlans ?? recentPlans.length}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Personalized 7-day splits</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>Feedback & Iterations</span>
            <MessageSquare className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats?.totalFeedbackCount ?? 0}</div>
          <div className="text-[11px] text-zinc-500 mt-1">Refinements made by Gemini</div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span>AI Architecture</span>
            <Sparkles className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-base font-bold text-emerald-400 mt-1">Gemini 3.8 & Flash</div>
          <div className="text-[11px] text-zinc-500 mt-1">Dual-tier fast generation</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-zinc-800 text-emerald-400 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Overview & Activity
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'plans'
              ? 'bg-zinc-800 text-emerald-400 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          All Workout Plans ({recentPlans.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-zinc-800 text-emerald-400 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          User Profiles ({users.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Plans Table */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-zinc-900 border border-zinc-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-emerald-400" />
              Recent AI Generated Plans
            </h3>

            {recentPlans.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No plans stored in database yet. Generate your first plan to populate.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] uppercase font-bold">
                      <th className="py-2.5">User</th>
                      <th className="py-2.5">Plan Name</th>
                      <th className="py-2.5">Schedule</th>
                      <th className="py-2.5">Model</th>
                      <th className="py-2.5">Feedback</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {recentPlans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3 font-semibold text-white">{plan.userName}</td>
                        <td className="py-3 text-zinc-300 font-medium truncate max-w-[180px]">{plan.planName}</td>
                        <td className="py-3 text-zinc-400">{plan.daysPerWeek} days/wk</td>
                        <td className="py-3">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-emerald-400 font-mono">
                            {plan.modelUsed}
                          </span>
                        </td>
                        <td className="py-3">
                          {plan.feedbackCount > 0 ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-500/10 text-orange-400 font-bold">
                              {plan.feedbackCount} updates
                            </span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleInspectPlan(plan.id)}
                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white mr-1.5"
                            title="Inspect full plan"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePlan(plan.id)}
                            className="p-1 rounded bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400"
                            title="Delete plan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Goal Distribution & Quick Stats */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Fitness Goals Distribution
              </h3>
              <div className="space-y-3">
                {Object.entries(stats?.goalsBreakdown || {}).length === 0 ? (
                  <p className="text-xs text-zinc-500">No profile data recorded yet.</p>
                ) : (
                  Object.entries(stats?.goalsBreakdown || {}).map(([goal, count]: any) => (
                    <div key={goal}>
                      <div className="flex justify-between text-xs text-zinc-300 mb-1">
                        <span className="capitalize">{goal.replace('_', ' ')}</span>
                        <span className="font-bold text-white">{count} clients</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full"
                          style={{ width: `${Math.min(100, (count / Math.max(users.length, 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Architecture Card */}
            <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Server Architecture & Pipeline
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                FitBuddy orchestrates prompt engineering across Gemini models with persistent JSON database caching, automated nutrition calculation, and interactive audio feedback loops.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL WORKOUT PLANS */}
      {activeTab === 'plans' && (
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Database Plan Registry ({recentPlans.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                    <span className="font-semibold text-emerald-400">{plan.userName}</span>
                    <span className="font-mono text-[10px] text-zinc-500">{new Date(plan.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-base font-bold text-white mb-2 leading-snug">
                    {plan.planName}
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {plan.daysPerWeek} days/week
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-orange-400 border border-zinc-800">
                      {plan.targetCalories} kcal
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {plan.modelUsed}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-900 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleInspectPlan(plan.id)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 border border-zinc-800 flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect Details
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-zinc-800"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: USER PROFILES */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Registered Users ({users.length})
          </h3>

          {users.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">No users logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] uppercase font-bold">
                    <th className="py-2.5">Client Name</th>
                    <th className="py-2.5">Age / Body</th>
                    <th className="py-2.5">Goal</th>
                    <th className="py-2.5">Level</th>
                    <th className="py-2.5">Plans Created</th>
                    <th className="py-2.5 text-right">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 font-bold text-white">{user.name}</td>
                      <td className="py-3 text-zinc-300">
                        {user.age} yrs • {user.weight} {user.unitSystem === 'imperial' ? 'lbs' : 'kg'}
                      </td>
                      <td className="py-3">
                        <span className="capitalize text-emerald-400 font-medium">
                          {user.primaryGoal.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 capitalize text-zinc-400">{user.experienceLevel}</td>
                      <td className="py-3 font-semibold text-white">{user.planCount}</td>
                      <td className="py-3 text-right text-zinc-500 font-mono text-[11px]">
                        {new Date(user.lastActive).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PLAN DETAIL MODAL INSPECTION */}
      {selectedPlanDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 sm:p-8 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Database Record: {selectedPlanDetail.id}
                </span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">
                  {selectedPlanDetail.planName}
                </h2>
                <p className="text-xs text-zinc-400">Client: {selectedPlanDetail.userName} | Engine: {selectedPlanDetail.modelUsed}</p>
              </div>

              <button
                onClick={() => setSelectedPlanDetail(null)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plan Version Selector (Original vs Updated) */}
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Version View:</span>
              <button
                type="button"
                onClick={() => setPlanVersionView('updated')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  planVersionView === 'updated'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Current / Updated Plan
              </button>
              <button
                type="button"
                onClick={() => setPlanVersionView('original')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  planVersionView === 'original'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Original Baseline Plan
              </button>
              <button
                type="button"
                onClick={() => setPlanVersionView('compare')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  planVersionView === 'compare'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Side-by-Side Comparison
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {/* Feedback History If Any */}
              {selectedPlanDetail.feedbackHistory && selectedPlanDetail.feedbackHistory.length > 0 && (
                <div className="p-4 rounded-2xl bg-orange-950/20 border border-orange-500/20">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Feedback & Iteration Log ({selectedPlanDetail.feedbackHistory.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedPlanDetail.feedbackHistory.map((fb: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300">
                        <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                          <span>Feedback Entry #{idx + 1}</span>
                          <span>{new Date(fb.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-white italic">"{fb.userFeedback}"</p>
                        {fb.appliedChangesSummary && (
                          <p className="text-[11px] text-emerald-400 mt-1">✓ {fb.appliedChangesSummary}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Side-by-Side Comparison Mode */}
              {planVersionView === 'compare' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-300 font-bold text-center">
                      Original Plan (Pre-Feedback)
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 font-bold text-center">
                      Updated Plan (Post-Feedback)
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(selectedPlanDetail.fullPlan?.schedule || []).map((updatedDay: any, dIdx: number) => {
                      const origDay = (selectedPlanDetail.originalPlan || selectedPlanDetail.fullPlan)?.schedule?.[dIdx] || updatedDay;
                      return (
                        <div key={updatedDay.dayNumber} className="grid grid-cols-2 gap-4 p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs">
                          {/* Original column */}
                          <div className="space-y-1 border-r border-zinc-800/80 pr-3">
                            <div className="font-bold text-cyan-400">{origDay.dayName}: {origDay.title}</div>
                            <div className="text-[11px] text-zinc-400">Focus: {origDay.focus}</div>
                            <div className="text-[11px] text-zinc-500">
                              {origDay.isRestDay ? 'Rest / Recovery' : `${origDay.durationMinutes}m • ${origDay.exercises?.length || 0} exercises`}
                            </div>
                          </div>

                          {/* Updated column */}
                          <div className="space-y-1 pl-1">
                            <div className="font-bold text-emerald-400">{updatedDay.dayName}: {updatedDay.title}</div>
                            <div className="text-[11px] text-zinc-300">Focus: {updatedDay.focus}</div>
                            <div className="text-[11px] text-zinc-400">
                              {updatedDay.isRestDay ? 'Rest / Recovery' : `${updatedDay.durationMinutes}m • ${updatedDay.exercises?.length || 0} exercises`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Single View: Updated or Original */}
              {planVersionView !== 'compare' && (
                <>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2 flex items-center justify-between">
                      <span>7-Day Schedule ({planVersionView === 'original' ? 'Original Baseline' : 'Current Active'})</span>
                      <span className="text-[10px] text-zinc-500 font-normal">
                        {planVersionView === 'original' ? 'As first generated' : 'Refined with client feedback'}
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {(
                        (planVersionView === 'original' && selectedPlanDetail.originalPlan
                          ? selectedPlanDetail.originalPlan
                          : selectedPlanDetail.fullPlan
                        )?.schedule || []
                      ).map((d: any) => (
                        <div key={d.dayNumber} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-emerald-400 mr-2">{d.dayName}:</span>
                            <span className="text-white font-medium">{d.title}</span>
                          </div>
                          <span className="text-zinc-500 text-[11px]">
                            {d.isRestDay ? 'Recovery' : `${d.durationMinutes}m • ${d.exercises?.length || 0} exercises`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nutrition Summary */}
                  {selectedPlanDetail.fullPlan?.nutrition && (
                    <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs">
                      <div className="font-bold text-white mb-2">Nutrition Plan:</div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="p-2 rounded bg-zinc-900">
                          <div className="text-zinc-400 text-[10px]">Calories</div>
                          <div className="font-bold text-white">{selectedPlanDetail.fullPlan.nutrition.dailyCalorieTarget} kcal</div>
                        </div>
                        <div className="p-2 rounded bg-zinc-900">
                          <div className="text-emerald-400 text-[10px]">Protein</div>
                          <div className="font-bold text-white">{selectedPlanDetail.fullPlan.nutrition.macros?.proteinGrams}g</div>
                        </div>
                        <div className="p-2 rounded bg-zinc-900">
                          <div className="text-cyan-400 text-[10px]">Carbs</div>
                          <div className="font-bold text-white">{selectedPlanDetail.fullPlan.nutrition.macros?.carbsGrams}g</div>
                        </div>
                        <div className="p-2 rounded bg-zinc-900">
                          <div className="text-amber-400 text-[10px]">Fats</div>
                          <div className="font-bold text-white">{selectedPlanDetail.fullPlan.nutrition.macros?.fatsGrams}g</div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer Action */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedPlanDetail(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                Close
              </button>

              <button
                onClick={() => {
                  if (selectedPlanDetail.fullPlan) {
                    onLoadPlanIntoApp(selectedPlanDetail.fullPlan);
                    setSelectedPlanDetail(null);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <span>Load This Plan Into Active Session</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
