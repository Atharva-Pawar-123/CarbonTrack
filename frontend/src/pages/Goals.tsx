import { useEffect, useState } from 'react';
import { Target, Plus, CheckCircle2, Loader2, ListTodo, AlertTriangle, X } from 'lucide-react';
import api from '../services/api';

interface Goal {
  id: string;
  target_month: string;
  target_kg: number;
  description: string | null;
  current_kg: number;
  progress_pct: number;
  is_achieved: boolean;
  ai_plan: string | null;
  created_at: string;
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newMonth, setNewMonth] = useState(() => {
    const d = new Date();
    // Default to next month
    d.setMonth(d.getMonth() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [newTarget, setNewTarget] = useState(100);
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/goals/');
      // Sort goals descending by month
      const sorted = res.data.sort((a: Goal, b: Goal) => b.target_month.localeCompare(a.target_month));
      setGoals(sorted);
    } catch (err) {
      console.error('Error fetching goals', err);
      setError('Failed to load goals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    
    try {
      await api.post('/goals/', {
        target_month: newMonth,
        target_kg: newTarget,
        description: newDesc || undefined
      });
      setShowModal(false);
      setNewDesc('');
      fetchGoals();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('A goal for this month already exists.');
      } else {
        setError('Failed to create goal. Please try again.');
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Reduction Goals</h1>
          <p className="text-neutral-600">Set targets and get personalized AI plans to hit them.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="mt-4 sm:mt-0 flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-1" />
          Set New Goal
        </button>
      </div>

      {error && !showModal && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 flex items-center border border-red-100">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-xl font-medium text-neutral-900 mb-2">No Goals Set</h3>
          <p className="text-neutral-500 mb-6 max-w-md mx-auto">
            You haven't set any carbon reduction goals yet. Setting a goal is the first step towards a sustainable future.
          </p>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-6 py-2 rounded-md font-medium hover:bg-primary-600 transition-colors inline-block"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {goals.map(goal => (
            <div key={goal.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${goal.is_achieved ? 'border-green-300' : 'border-neutral-200'}`}>
              
              {/* Goal Header & Progress */}
              <div className={`p-6 border-b ${goal.is_achieved ? 'bg-green-50/50' : 'bg-white'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-xl font-bold text-neutral-900 mr-3">{goal.target_month} Goal</h3>
                      {goal.is_achieved && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Achieved
                        </span>
                      )}
                    </div>
                    {goal.description && <p className="text-neutral-600 mt-1">{goal.description}</p>}
                  </div>
                  
                  <div className="mt-4 sm:mt-0 text-right">
                    <p className="text-sm font-medium text-neutral-500">Target</p>
                    <p className="text-2xl font-bold text-neutral-900">{goal.target_kg} <span className="text-sm font-normal text-neutral-500">kg CO₂e</span></p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-neutral-700">Current Progress</span>
                    <span className="font-medium text-neutral-700">{goal.current_kg.toFixed(1)} kg ({goal.progress_pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        goal.is_achieved ? 'bg-green-500' : 
                        goal.progress_pct > 100 ? 'bg-red-500' : 
                        goal.progress_pct > 80 ? 'bg-orange-500' : 'bg-primary'
                      }`} 
                      style={{ width: `${Math.min(goal.progress_pct, 100)}%` }}
                    />
                  </div>
                  {goal.progress_pct > 100 && (
                    <p className="text-xs text-red-600 mt-1 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      You have exceeded your target for this month.
                    </p>
                  )}
                </div>
              </div>

              {/* AI Plan Section */}
              <div className="p-6 bg-neutral-50">
                <div className="flex items-center text-secondary-700 mb-4">
                  <ListTodo className="w-5 h-5 mr-2" />
                  <h4 className="font-bold">AI Action Plan</h4>
                </div>
                
                {goal.ai_plan ? (
                  <div className="prose prose-sm max-w-none text-neutral-700 bg-white p-5 rounded-lg border border-neutral-200">
                    {goal.ai_plan.split('\n').map((paragraph, i) => {
                      if (!paragraph.trim()) return null;
                      
                      // Check if it's a list item and remove the prefix (- , * , 1. )
                      let isListItem = false;
                      let contentStr = paragraph;
                      
                      const listMatch = paragraph.match(/^(-\s|\*\s|\d+\.\s)/);
                      if (listMatch) {
                        isListItem = true;
                        contentStr = paragraph.substring(listMatch[0].length);
                      }
                      
                      const formattedText = contentStr.split(/(\*\*.*?\*\*)/g).map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={j} className="text-neutral-900">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      });

                      if (isListItem) {
                        return (
                          <div key={i} className="flex items-start mb-2 ml-2">
                            <span className="mr-2 text-secondary">•</span>
                            <span className="text-neutral-800">{formattedText}</span>
                          </div>
                        );
                      }
                      return <p key={i} className="mb-3 font-medium text-neutral-800">{formattedText}</p>;
                    })}
                  </div>
                ) : (
                  <div className="bg-white p-5 rounded-lg border border-neutral-200 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-neutral-500">Your AI action plan is being generated. Check back in a few moments.</p>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-neutral-100">
              <h2 className="text-xl font-bold text-neutral-900">Set a New Goal</h2>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-600 transition-colors" aria-label="Close modal">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm border border-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Target Month</label>
                  <input 
                    type="month" 
                    required
                    value={newMonth}
                    onChange={(e) => setNewMonth(e.target.value)}
                    className="block w-full border border-neutral-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary bg-neutral-50" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Target Footprint (kg CO₂e)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={newTarget}
                    onChange={(e) => setNewTarget(Number(e.target.value))}
                    className="block w-full border border-neutral-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary bg-neutral-50" 
                  />
                  <p className="text-xs text-neutral-500 mt-1">Lower is better. Aim for 10-20% below your baseline.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Description (Optional)</label>
                  <textarea 
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="e.g. Stop eating beef and take the metro twice a week."
                    className="block w-full border border-neutral-300 rounded-md py-2 px-3 focus:ring-primary focus:border-primary bg-neutral-50 resize-none" 
                  />
                </div>

                <div className="pt-4 flex space-x-3">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-white border border-neutral-300 text-neutral-700 px-4 py-2 rounded-md font-medium hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={creating}
                    className="flex-1 flex justify-center items-center bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-600 focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 transition-colors"
                  >
                    {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Set Goal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
