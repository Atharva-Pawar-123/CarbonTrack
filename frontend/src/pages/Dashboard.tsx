import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Loader2, Plus, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import api from '../services/api';

interface FootprintEntry {
  id: string;
  month: string;
  total_kg: number;
  eco_score: number;
  transport_kg: number;
  energy_kg: number;
  diet_kg: number;
  consumption_kg: number;
  ai_insight: string | null;
}

export default function Dashboard() {
  const [entries, setEntries] = useState<FootprintEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshingInsight, setRefreshingInsight] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/footprint/history');
      // API returns entries ordered descending (latest first) by default? 
      // Actually our backend get_last_n_months sorts by month DESC.
      // For charts, we usually want chronological (oldest to newest), so we reverse it.
      const reversed = [...res.data.entries].reverse();
      setEntries(reversed);
    } catch (err) {
      setError('Failed to load footprint history.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshInsight = async (entryId: string) => {
    try {
      setRefreshingInsight(true);
      const res = await api.post(`/footprint/${entryId}/insight`);
      
      // Update the local state with the new insight
      setEntries(prev => prev.map(entry => 
        entry.id === entryId ? { ...entry, ai_insight: res.data.ai_insight } : entry
      ));
    } catch (err) {
      console.error('Failed to refresh insight', err);
    } finally {
      setRefreshingInsight(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }

  const hasData = entries.length > 0;
  const latestEntry = hasData ? entries[entries.length - 1] : null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Your Dashboard</h1>
          <p className="text-neutral-600 mt-1">Track and reduce your environmental impact.</p>
        </div>
        <Link 
          to="/calculator" 
          className="mt-4 sm:mt-0 flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5 mr-1" />
          Log New Month
        </Link>
      </div>

      {!hasData ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-xl font-medium text-neutral-900 mb-2">No Data Yet</h3>
          <p className="text-neutral-500 mb-6 max-w-md mx-auto">
            You haven't logged any footprint data yet. Use the calculator to establish your baseline.
          </p>
          <Link to="/calculator" className="bg-primary text-white px-6 py-2 rounded-md font-medium hover:bg-primary-600 transition-colors inline-block">
            Start Calculator
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
                <p className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Latest Footprint</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-neutral-900">{latestEntry?.total_kg.toFixed(1)}</span>
                  <span className="text-neutral-500">kg CO₂e</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">For {latestEntry?.month}</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
                <p className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Eco Score</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-secondary">{latestEntry?.eco_score}</span>
                  <span className="text-neutral-500">/ 100</span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">Higher is better</p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
              <h3 className="text-lg font-bold text-neutral-900 mb-6">Emissions Trend (Last 6 Months)</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={entries} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip 
                      cursor={{fill: '#F3F4F6'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="transport_kg" name="Transport" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="energy_kg" name="Energy" stackId="a" fill="#F59E0B" />
                    <Bar dataKey="diet_kg" name="Diet" stackId="a" fill="#10B981" />
                    <Bar dataKey="consumption_kg" name="Consumption" stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Insight Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-xl border border-primary-100 shadow-sm h-full flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-primary-100">
                <div className="flex items-center text-primary-700">
                  <Sparkles className="w-5 h-5 mr-2" />
                  <h3 className="font-bold">AI Insight</h3>
                </div>
                {latestEntry && (
                  <button 
                    onClick={() => handleRefreshInsight(latestEntry.id)}
                    disabled={refreshingInsight}
                    className="p-1.5 text-primary-600 hover:bg-primary-100 rounded-md transition-colors disabled:opacity-50"
                    title="Generate new insight"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshingInsight ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {latestEntry?.ai_insight ? (
                  <div className="prose prose-sm prose-p:text-neutral-700 prose-p:leading-relaxed">
                    {/* Simple formatting for markdown-like text returned by Gemini */}
                    {latestEntry.ai_insight.split('\n').map((paragraph, i) => {
                      if (!paragraph.trim()) return <br key={i} />;
                      // Bold text handling **text**
                      const formattedText = paragraph.split(/(\*\*.*?\*\*)/g).map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={j} className="text-neutral-900 font-semibold">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      });

                      if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                        return <li key={i} className="ml-4 mb-1 text-neutral-700">{formattedText.slice(1)}</li>;
                      }

                      return <p key={i} className="mb-2">{formattedText}</p>;
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <p className="text-neutral-500 mb-4">No AI insight available for this month.</p>
                    {latestEntry && (
                      <button 
                        onClick={() => handleRefreshInsight(latestEntry.id)}
                        disabled={refreshingInsight}
                        className="bg-white border border-primary-200 text-primary-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-50 transition-colors flex items-center"
                      >
                        {refreshingInsight ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Generate Insight
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
