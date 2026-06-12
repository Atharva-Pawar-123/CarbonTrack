import { useEffect, useState } from 'react';
import { 
  Flame, 
  Trophy, 
  Leaf, 
  Bus, 
  Salad, 
  ShoppingBag, 
  Recycle, 
  Lightbulb,
  CheckCircle2,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api';

const ECO_ACTIONS = [
  { id: "public_transit", label: "Used Public Transit", impact_kg: 2.5, icon: <Bus className="w-8 h-8 text-blue-500" /> },
  { id: "plant_based_meal", label: "Ate a Plant-based Meal", impact_kg: 1.2, icon: <Salad className="w-8 h-8 text-green-500" /> },
  { id: "reusable_bag", label: "Used Reusable Shopping Bags", impact_kg: 0.5, icon: <ShoppingBag className="w-8 h-8 text-amber-500" /> },
  { id: "zero_waste_day", label: "Zero Waste Day", impact_kg: 3.0, icon: <Recycle className="w-8 h-8 text-teal-500" /> },
  { id: "energy_saving", label: "Turned off AC/Lights", impact_kg: 0.8, icon: <Lightbulb className="w-8 h-8 text-yellow-500" /> },
];

interface ActionLog {
  action_id: string;
  logged_date: string;
}

interface ActionSummary {
  current_streak: number;
  longest_streak: number;
  total_saved_kg: number;
  logs_this_month: ActionLog[];
}

export default function Actions() {
  const [summary, setSummary] = useState<ActionSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loggingId, setLoggingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSummary = async () => {
    try {
      const res = await api.get('/actions/summary');
      setSummary(res.data);
    } catch (err) {
      console.error('Error fetching action summary', err);
      setError('Failed to load action summary.');
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleLogAction = async (actionId: string) => {
    setLoggingId(actionId);
    setError('');
    setSuccess('');
    
    // Log for today in YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    
    try {
      await api.post('/actions/', {
        action_id: actionId,
        logged_date: today
      });
      setSuccess('Action logged successfully!');
      fetchSummary(); // Refresh summary to update streak and total impact
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('You have already logged this action today.');
      } else {
        setError('Failed to log action. Please try again.');
      }
    } finally {
      setLoggingId(null);
      // Auto-hide success after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Daily Actions</h1>
        <p className="text-neutral-600">Build eco-friendly habits and track your impact streaks.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 flex items-center border border-red-100">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6 flex items-center border border-green-100">
          <CheckCircle2 className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      {loadingSummary ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-6 rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-800 uppercase tracking-wide">Current Streak</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-bold text-orange-600">{summary?.current_streak || 0}</span>
                <span className="text-orange-700 font-medium">days</span>
              </div>
            </div>
            <div className="bg-orange-200 p-4 rounded-full text-orange-600">
              <Flame className="w-8 h-8" />
            </div>
          </div>

          {/* Max Streak Card */}
          <div className="bg-white border border-neutral-200 p-6 rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Longest Streak</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-bold text-neutral-900">{summary?.longest_streak || 0}</span>
                <span className="text-neutral-600 font-medium">days</span>
              </div>
            </div>
            <div className="bg-neutral-100 p-4 rounded-full text-neutral-400">
              <Trophy className="w-8 h-8" />
            </div>
          </div>

          {/* Total Impact Card */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 p-6 rounded-xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-800 uppercase tracking-wide">Total Impact</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-bold text-primary-600">{summary?.total_saved_kg.toFixed(1) || "0.0"}</span>
                <span className="text-primary-700 font-medium">kg CO₂e saved</span>
              </div>
            </div>
            <div className="bg-primary-200 p-4 rounded-full text-primary-600">
              <Leaf className="w-8 h-8" />
            </div>
          </div>

        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-900">Log an Action</h2>
          <p className="text-sm text-neutral-500 mt-1">Select the eco-actions you performed today.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-neutral-50">
          {ECO_ACTIONS.map(action => {
            const todayStr = new Date().toISOString().split('T')[0];
            const isLoggedToday = summary?.logs_this_month?.some(log => log.logged_date === todayStr && log.action_id === action.id) || false;
            const isLoggingThis = loggingId === action.id;

            return (
              <button
                key={action.id}
                disabled={isLoggedToday || isLoggingThis}
                onClick={() => handleLogAction(action.id)}
                className={`relative flex flex-col items-center justify-center p-6 bg-white rounded-xl border text-center transition-all duration-200
                  ${isLoggedToday 
                    ? 'border-green-300 ring-1 ring-green-300 opacity-80 cursor-default' 
                    : 'border-neutral-200 hover:border-primary hover:shadow-md hover:-translate-y-1'
                  }
                `}
              >
                {isLoggedToday && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                )}
                
                <div className={`p-4 rounded-full mb-4 ${isLoggedToday ? 'bg-green-50' : 'bg-neutral-50'}`}>
                  {action.icon}
                </div>
                <h3 className="font-semibold text-neutral-900 mb-1">{action.label}</h3>
                <p className="text-sm text-secondary font-medium">Saves {action.impact_kg} kg CO₂e</p>

                {isLoggingThis && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
