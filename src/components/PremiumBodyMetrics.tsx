import React, { useState, useEffect } from 'react';
import { Scale, TrendingUp, Calendar, Plus, Activity, Heart, Droplets, Bone, Target, Zap, X, List, Eye, Trash2 } from 'lucide-react';
import { apiGet, apiPost, apiDelete } from '../utils/api';

interface BodyMetric {
  id: number;
  user_id: number;
  metric_date: string;
  weight?: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  water_percentage?: number;
  bone_mass?: number;
  visceral_fat?: number;
  bmr?: number;
  notes?: string;
  created_at: string;
}

// Simple line chart component
const SimpleChart: React.FC<{ data: { date: string; value: number }[]; color: string; label: string }> = ({ data, color, label }) => {
  if (data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
        No data yet - add your first measurement!
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="h-32 relative">
      <svg className="w-full h-full" viewBox="0 0 300 120">
        {/* Grid lines */}
        <defs>
          <pattern id={`grid-${color.replace('#', '')}`} width="30" height="24" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 24" fill="none" stroke="#374151" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${color.replace('#', '')})`} />
        
        {/* Chart line */}
        {data.length > 1 && (
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            points={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 280 + 10;
              const y = 100 - ((point.value - minValue) / range) * 80 + 10;
              return `${x},${y}`;
            }).join(' ')}
          />
        )}
        
        {/* Data points */}
        {data.map((point, index) => {
          const x = (index / Math.max(data.length - 1, 1)) * 280 + 10;
          const y = 100 - ((point.value - minValue) / range) * 80 + 10;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill={color}
              stroke="#1f2937"
              strokeWidth="1"
              className="cursor-pointer"
            >
              <title>{`${new Date(point.date).toLocaleDateString()}: ${point.value} ${label}`}</title>
            </circle>
          );
        })}
      </svg>
      
      {/* Latest value */}
      <div className="absolute top-2 right-2 text-xs text-gray-300 bg-gray-800/80 px-2 py-1 rounded shadow-sm">
        Latest: {data[data.length - 1]?.value} {label}
      </div>
    </div>
  );
};

// Data history component
const DataHistory: React.FC<{ 
  data: { date: string; value: number; id?: number }[]; 
  unit: string; 
  onDelete: (id: number) => void;
}> = ({ data, unit, onDelete }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400">
        No entries yet
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-40 overflow-y-auto">
      {data.slice(-10).reverse().map((entry, index) => (
        <div key={index} className="flex items-center justify-between bg-gray-700/50 rounded p-2 text-sm">
          <div className="flex items-center space-x-3">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span className="text-gray-300">{new Date(entry.date).toLocaleDateString()}</span>
            <span className="text-white font-medium">{entry.value} {unit}</span>
          </div>
          {entry.id && (
            <button
              onClick={() => onDelete(entry.id!)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

// Individual metric card component
const MetricCard: React.FC<{
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  data: { date: string; value: number; id?: number }[];
  unit: string;
  onAddData: (value: number, date: string) => void;
  onDeleteData: (id: number) => void;
}> = ({ title, icon: Icon, color, gradientFrom, gradientTo, data, unit, onAddData, onDeleteData }) => {
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (value && date && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onAddData(parseFloat(value), date);
        setValue('');
        setDate(new Date().toISOString().split('T')[0]);
        setShowForm(false);
      } catch (error) {
        console.error('Error adding data:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const trend = data.length >= 2 
    ? data[data.length - 1].value - data[data.length - 2].value 
    : 0;

  const latestValue = data.length > 0 ? data[data.length - 1].value : null;

  return (
    <div className="bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className="h-6 w-6" />
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-white/80 text-sm">{data.length} entries</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {data.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="View data history"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
            
            {latestValue && (
              <div className="text-right">
                <div className="text-2xl font-bold">{latestValue}</div>
                <div className="text-white/80 text-sm">{unit}</div>
                {trend !== 0 && (
                  <div className={`text-sm flex items-center ${trend > 0 ? 'text-green-200' : 'text-red-200'}`}>
                    <TrendingUp className={`h-3 w-3 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
                    {trend > 0 ? '+' : ''}{trend.toFixed(1)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4 bg-gray-900/50">
        <SimpleChart data={data} color={color} label={unit} />
      </div>

      {/* Data History */}
      {showHistory && (
        <div className="p-4 bg-gray-800/50 border-t border-gray-700">
          <div className="flex items-center space-x-2 mb-3">
            <List className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-300 font-medium">Recent Entries</span>
          </div>
          <DataHistory data={data} unit={unit} onDelete={onDeleteData} />
        </div>
      )}

      {/* Add Data Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => setShowForm(true)}
          className={`w-full flex items-center justify-center space-x-2 bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white py-3 px-4 rounded-lg hover:opacity-90 transition-opacity font-medium`}
        >
          <Plus className="h-4 w-4" />
          <span>Add {title}</span>
        </button>

        {/* Add Data Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white">Add {title}</h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {title} ({unit})
                    </label>
                    <input
                      type="number"
                      step={unit.includes('%') ? '0.1' : unit === 'cal' ? '1' : '0.1'}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder={`Enter ${title.toLowerCase()}`}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-2 bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white rounded-lg hover:opacity-90 transition-opacity font-medium ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PremiumBodyMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await apiGet('/body-metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      } else {
        console.error('Failed to fetch metrics:', response.status);
      }
    } catch (error) {
      console.error('Error fetching body metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMetric = async (metricType: string, value: number, date: string) => {
    try {
      const payload = {
        metric_date: date,
        [metricType]: value
      };

      console.log('Sending metric data:', payload);
      const response = await apiPost('/body-metrics', payload);
      
      if (response.ok) {
        console.log('Metric saved successfully');
        await fetchMetrics();
        alert('Metric saved successfully!');
      } else {
        const errorData = await response.text();
        console.error('Failed to save metric:', response.status, errorData);
        alert(`Failed to save metric: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving metric:', error);
      alert('Error saving metric. Check console for details.');
    }
  };

  const handleDeleteMetric = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const response = await apiDelete(`/body-metrics/${id}`);
        if (response.ok) {
          await fetchMetrics();
          alert('Entry deleted successfully!');
        } else {
          alert('Failed to delete entry');
        }
      } catch (error) {
        console.error('Error deleting metric:', error);
        alert('Error deleting entry');
      }
    }
  };

  // Transform data for each metric
  const getMetricData = (metricKey: string) => {
    return metrics
      .filter(m => m[metricKey as keyof BodyMetric] != null)
      .map(m => ({
        date: m.metric_date,
        value: m[metricKey as keyof BodyMetric] as number,
        id: m.id
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const metricConfigs = [
    {
      key: 'weight',
      title: 'Weight',
      icon: Scale,
      color: '#3b82f6',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-blue-600',
      unit: 'lbs'
    },
    {
      key: 'body_fat_percentage',
      title: 'Body Fat',
      icon: Activity,
      color: '#f59e0b',
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-orange-600',
      unit: '%'
    },
    {
      key: 'muscle_mass',
      title: 'Muscle Mass',
      icon: Heart,
      color: '#ef4444',
      gradientFrom: 'from-red-500',
      gradientTo: 'to-red-600',
      unit: 'lbs'
    },
    {
      key: 'water_percentage',
      title: 'Water',
      icon: Droplets,
      color: '#06b6d4',
      gradientFrom: 'from-cyan-500',
      gradientTo: 'to-blue-500',
      unit: '%'
    },
    {
      key: 'bone_mass',
      title: 'Bone Mass',
      icon: Bone,
      color: '#8b5cf6',
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-purple-600',
      unit: 'lbs'
    },
    {
      key: 'visceral_fat',
      title: 'Visceral Fat',
      icon: Target,
      color: '#ec4899',
      gradientFrom: 'from-pink-500',
      gradientTo: 'to-rose-600',
      unit: 'rating'
    },
    {
      key: 'bmr',
      title: 'BMR',
      icon: Zap,
      color: '#10b981',
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-green-600',
      unit: 'cal'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading body metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Scale className="h-8 w-8 text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">Body Metrics</h1>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Track individual health metrics with visual charts that update as you add new data.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metricConfigs.map((config) => (
            <MetricCard
              key={config.key}
              title={config.title}
              icon={config.icon}
              color={config.color}
              gradientFrom={config.gradientFrom}
              gradientTo={config.gradientTo}
              data={getMetricData(config.key)}
              unit={config.unit}
              onAddData={(value, date) => handleAddMetric(config.key, value, date)}
              onDeleteData={handleDeleteMetric}
            />
          ))}
        </div>

        {/* Summary */}
        {metrics.length === 0 && (
          <div className="text-center py-16">
            <Scale className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">Start tracking your body metrics</h3>
            <p className="text-gray-400">Click on any metric card above to add your first measurement.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumBodyMetrics;