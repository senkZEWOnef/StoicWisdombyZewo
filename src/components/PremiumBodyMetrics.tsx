import React, { useState, useEffect } from 'react';
import { Scale, TrendingUp, Calendar, Plus, Activity, Heart, Droplets, Bone, Target, Zap, X, List, Eye, Trash2, ArrowLeft, BarChart3, Info, Award, AlertCircle } from 'lucide-react';
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

// Enhanced detailed chart component
const DetailedChart: React.FC<{ data: { date: string; value: number }[]; color: string; label: string }> = ({ data, color, label }) => {
  if (data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-600" />
          <p className="text-lg">No data yet</p>
          <p className="text-sm">Add your first measurement to see trends!</p>
        </div>
      </div>
    );
  }

  // Calculate value range with padding
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  const padding = range * 0.1;
  const adjustedMax = maxValue + padding;
  const adjustedMin = Math.max(0, minValue - padding);
  const adjustedRange = adjustedMax - adjustedMin;

  // Calculate time range
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstDate = new Date(sortedData[0].date);
  const lastDate = new Date(sortedData[sortedData.length - 1].date);
  const timeRange = lastDate.getTime() - firstDate.getTime();
  
  // Chart dimensions
  const chartWidth = 700;
  const chartHeight = 350;
  const leftMargin = 80;
  const rightMargin = 40;
  const topMargin = 20;
  const bottomMargin = 80;
  const plotWidth = chartWidth - leftMargin - rightMargin;
  const plotHeight = chartHeight - topMargin - bottomMargin;

  // Generate Y-axis ticks
  const yTicks = 6;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => {
    return adjustedMin + (adjustedRange / (yTicks - 1)) * i;
  });

  // Generate X-axis ticks (show up to 8 dates)
  const maxXTicks = Math.min(8, sortedData.length);
  const xTickIndices = Array.from({ length: maxXTicks }, (_, i) => {
    return Math.floor((sortedData.length - 1) * i / (maxXTicks - 1));
  });

  return (
    <div className="h-96 relative bg-gray-900/50 rounded-lg p-4">
      <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.05"/>
          </linearGradient>
        </defs>
        
        {/* Chart background */}
        <rect 
          x={leftMargin} 
          y={topMargin} 
          width={plotWidth} 
          height={plotHeight} 
          fill="#111827" 
          stroke="#374151" 
          strokeWidth="1"
        />
        
        {/* Y-axis grid lines and labels */}
        {yTickValues.map((value, index) => {
          const y = topMargin + plotHeight - ((value - adjustedMin) / adjustedRange) * plotHeight;
          return (
            <g key={`y-${index}`}>
              {/* Grid line */}
              <line 
                x1={leftMargin} 
                y1={y} 
                x2={leftMargin + plotWidth} 
                y2={y} 
                stroke="#374151" 
                strokeWidth="0.5" 
                strokeDasharray="2,2"
              />
              {/* Y-axis label */}
              <text 
                x={leftMargin - 10} 
                y={y + 4} 
                fill="#9CA3AF" 
                fontSize="12" 
                textAnchor="end"
              >
                {value.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* X-axis grid lines and labels */}
        {xTickIndices.map((dataIndex, tickIndex) => {
          const point = sortedData[dataIndex];
          const x = leftMargin + (dataIndex / (sortedData.length - 1)) * plotWidth;
          const date = new Date(point.date);
          
          return (
            <g key={`x-${tickIndex}`}>
              {/* Grid line */}
              <line 
                x1={x} 
                y1={topMargin} 
                x2={x} 
                y2={topMargin + plotHeight} 
                stroke="#374151" 
                strokeWidth="0.5" 
                strokeDasharray="2,2"
              />
              {/* X-axis label */}
              <text 
                x={x} 
                y={topMargin + plotHeight + 20} 
                fill="#9CA3AF" 
                fontSize="11" 
                textAnchor="middle"
              >
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
              <text 
                x={x} 
                y={topMargin + plotHeight + 35} 
                fill="#6B7280" 
                fontSize="10" 
                textAnchor="middle"
              >
                {date.getFullYear()}
              </text>
            </g>
          );
        })}

        {/* Y-axis title */}
        <text 
          x="20" 
          y={topMargin + plotHeight / 2} 
          fill="#E5E7EB" 
          fontSize="14" 
          textAnchor="middle"
          transform={`rotate(-90, 20, ${topMargin + plotHeight / 2})`}
          fontWeight="600"
        >
          {label}
        </text>

        {/* X-axis title */}
        <text 
          x={leftMargin + plotWidth / 2} 
          y={chartHeight - 10} 
          fill="#E5E7EB" 
          fontSize="14" 
          textAnchor="middle"
          fontWeight="600"
        >
          Time
        </text>

        {/* Chart area with gradient fill */}
        {sortedData.length > 1 && (
          <polygon
            fill={`url(#gradient-${color.replace('#', '')})`}
            points={[
              ...sortedData.map((point, index) => {
                const x = leftMargin + (index / (sortedData.length - 1)) * plotWidth;
                const y = topMargin + plotHeight - ((point.value - adjustedMin) / adjustedRange) * plotHeight;
                return `${x},${y}`;
              }),
              `${leftMargin + plotWidth},${topMargin + plotHeight}`,
              `${leftMargin},${topMargin + plotHeight}`
            ].join(' ')}
          />
        )}
        
        {/* Chart line */}
        {sortedData.length > 1 && (
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            points={sortedData.map((point, index) => {
              const x = leftMargin + (index / (sortedData.length - 1)) * plotWidth;
              const y = topMargin + plotHeight - ((point.value - adjustedMin) / adjustedRange) * plotHeight;
              return `${x},${y}`;
            }).join(' ')}
          />
        )}
        
        {/* Data points */}
        {sortedData.map((point, index) => {
          const x = leftMargin + (index / Math.max(sortedData.length - 1, 1)) * plotWidth;
          const y = topMargin + plotHeight - ((point.value - adjustedMin) / adjustedRange) * plotHeight;
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="5"
                fill={color}
                stroke="#1f2937"
                strokeWidth="2"
                className="cursor-pointer"
              />
              <circle
                cx={x}
                cy={y}
                r="12"
                fill="transparent"
                className="cursor-pointer"
              >
                <title>{`${new Date(point.date).toLocaleDateString()}: ${point.value} ${label}`}</title>
              </circle>
            </g>
          );
        })}

        {/* Latest value indicator */}
        {sortedData.length > 0 && (
          <g>
            {(() => {
              const lastPoint = sortedData[sortedData.length - 1];
              const x = leftMargin + ((sortedData.length - 1) / Math.max(sortedData.length - 1, 1)) * plotWidth;
              const y = topMargin + plotHeight - ((lastPoint.value - adjustedMin) / adjustedRange) * plotHeight;
              return (
                <>
                  <circle cx={x} cy={y} r="8" fill={color} stroke="#fff" strokeWidth="3" />
                  <rect 
                    x={x + 15} 
                    y={y - 15} 
                    width="80" 
                    height="30" 
                    fill="#1f2937" 
                    stroke={color} 
                    strokeWidth="1" 
                    rx="4"
                  />
                  <text 
                    x={x + 55} 
                    y={y - 5} 
                    fill="#fff" 
                    fontSize="12" 
                    textAnchor="middle" 
                    fontWeight="600"
                  >
                    {lastPoint.value} {label}
                  </text>
                  <text 
                    x={x + 55} 
                    y={y + 8} 
                    fill="#9CA3AF" 
                    fontSize="10" 
                    textAnchor="middle"
                  >
                    Latest
                  </text>
                </>
              );
            })()}
          </g>
        )}
      </svg>
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
        <DetailedChart data={data} color={color} label={unit} />
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
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

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
      unit: 'lbs',
      description: 'Track your total body weight over time',
      healthyRange: 'Varies by height and body type',
      tips: 'Best measured in the morning after using the bathroom, before eating or drinking'
    },
    {
      key: 'body_fat_percentage',
      title: 'Body Fat',
      icon: Activity,
      color: '#f59e0b',
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-orange-600',
      unit: '%',
      description: 'Percentage of your body weight that comes from fat tissue',
      healthyRange: 'Men: 10-20%, Women: 16-25%',
      tips: 'Lower isn\'t always better - essential fat is needed for health'
    },
    {
      key: 'muscle_mass',
      title: 'Muscle Mass',
      icon: Heart,
      color: '#ef4444',
      gradientFrom: 'from-red-500',
      gradientTo: 'to-red-600',
      unit: 'lbs',
      description: 'Total weight of muscle tissue in your body',
      healthyRange: 'Higher muscle mass improves metabolism and strength',
      tips: 'Resistance training and adequate protein help maintain muscle mass'
    },
    {
      key: 'water_percentage',
      title: 'Water',
      icon: Droplets,
      color: '#06b6d4',
      gradientFrom: 'from-cyan-500',
      gradientTo: 'to-blue-500',
      unit: '%',
      description: 'Percentage of your body weight that is water',
      healthyRange: 'Men: 50-65%, Women: 45-60%',
      tips: 'Hydration levels affect this measurement - best taken at consistent times'
    },
    {
      key: 'bone_mass',
      title: 'Bone Mass',
      icon: Bone,
      color: '#8b5cf6',
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-purple-600',
      unit: 'lbs',
      description: 'Estimated weight of your skeletal system',
      healthyRange: 'Typically 15% of total body weight',
      tips: 'Weight-bearing exercises and adequate calcium support bone health'
    },
    {
      key: 'visceral_fat',
      title: 'Visceral Fat',
      icon: Target,
      color: '#ec4899',
      gradientFrom: 'from-pink-500',
      gradientTo: 'to-rose-600',
      unit: 'rating',
      description: 'Fat around internal organs (health risk indicator)',
      healthyRange: 'Rating 1-12 (lower is better)',
      tips: 'Cardio exercise and healthy diet are key to reducing visceral fat'
    },
    {
      key: 'bmr',
      title: 'BMR',
      icon: Zap,
      color: '#10b981',
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-green-600',
      unit: 'cal',
      description: 'Basal Metabolic Rate - calories burned at rest',
      healthyRange: 'Higher BMR indicates more active metabolism',
      tips: 'Muscle mass and age are primary factors affecting BMR'
    }
  ];

  // Calculate statistics for selected metric
  const getMetricStats = (data: { date: string; value: number }[]) => {
    if (data.length === 0) return null;
    
    const values = data.map(d => d.value);
    const latest = values[values.length - 1];
    const previous = values.length > 1 ? values[values.length - 2] : latest;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const trend = latest - previous;
    const totalChange = latest - values[0];
    
    return { latest, max, min, avg, trend, totalChange, count: data.length };
  };

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

  // Render metric selection view
  if (!selectedMetric) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Scale className="h-10 w-10 text-blue-400 mr-4" />
              <h1 className="text-4xl font-bold text-white">Body Metrics</h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Select a metric to view detailed tracking, insights, and add new measurements.
            </p>
          </div>

          {/* Metric Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {metricConfigs.map((config) => {
              const data = getMetricData(config.key);
              const Icon = config.icon;
              return (
                <div
                  key={config.key}
                  onClick={() => setSelectedMetric(config.key)}
                  className="cursor-pointer group transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                >
                  <div className="bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden group-hover:border-gray-600">
                    <div className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} p-6 text-white`}>
                      <div className="flex items-center justify-between mb-4">
                        <Icon className="h-8 w-8" />
                        <div className="text-right">
                          <div className="text-2xl font-bold">{data.length}</div>
                          <div className="text-white/80 text-sm">entries</div>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{config.title}</h3>
                      <p className="text-white/80 text-sm">{config.description}</p>
                    </div>
                    
                    <div className="p-4">
                      {data.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Latest:</span>
                            <span className="text-white font-medium">
                              {data[data.length - 1]?.value} {config.unit}
                            </span>
                          </div>
                          <div className="h-12 relative">
                            <svg className="w-full h-full" viewBox="0 0 200 40">
                              {data.length > 1 && (
                                <polyline
                                  fill="none"
                                  stroke={config.color}
                                  strokeWidth="2"
                                  points={data.slice(-10).map((point, index) => {
                                    const x = (index / (data.slice(-10).length - 1)) * 180 + 10;
                                    const maxVal = Math.max(...data.slice(-10).map(d => d.value));
                                    const minVal = Math.min(...data.slice(-10).map(d => d.value));
                                    const range = maxVal - minVal || 1;
                                    const y = 30 - ((point.value - minVal) / range) * 20 + 5;
                                    return `${x},${y}`;
                                  }).join(' ')}
                                />
                              )}
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Plus className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">No data yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Getting Started */}
          {metrics.length === 0 && (
            <div className="text-center py-16 mt-12">
              <Scale className="h-20 w-20 text-gray-600 mx-auto mb-6" />
              <h3 className="text-2xl font-medium text-gray-300 mb-4">Start Your Health Journey</h3>
              <p className="text-gray-400 text-lg mb-6">Choose a metric above to begin tracking your body composition and health indicators.</p>
              <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <BarChart3 className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                  <h4 className="text-white font-medium mb-2">Visual Tracking</h4>
                  <p className="text-gray-400 text-sm">See your progress with detailed charts and trend analysis</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <Target className="h-8 w-8 text-green-400 mx-auto mb-3" />
                  <h4 className="text-white font-medium mb-2">Health Insights</h4>
                  <p className="text-gray-400 text-sm">Learn about healthy ranges and improvement tips</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                  <h4 className="text-white font-medium mb-2">Progress Analysis</h4>
                  <p className="text-gray-400 text-sm">Track changes over time with detailed statistics</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render detailed metric view
  const selectedConfig = metricConfigs.find(c => c.key === selectedMetric)!;
  const selectedData = getMetricData(selectedMetric);
  const stats = getMetricStats(selectedData);
  const Icon = selectedConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => setSelectedMetric(null)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors mr-6 bg-gray-800/50 rounded-lg px-4 py-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Metrics</span>
          </button>
          <div className="flex items-center">
            <Icon className={`h-8 w-8 mr-3`} style={{ color: selectedConfig.color }} />
            <div>
              <h1 className="text-3xl font-bold text-white">{selectedConfig.title}</h1>
              <p className="text-gray-300">{selectedConfig.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart and Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart */}
            <div className="bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Trend Analysis</h2>
                {stats && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{stats.latest} {selectedConfig.unit}</div>
                    <div className={`text-sm flex items-center justify-end ${
                      stats.trend > 0 ? 'text-green-400' : stats.trend < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      <TrendingUp className={`h-3 w-3 mr-1 ${stats.trend < 0 ? 'rotate-180' : ''}`} />
                      {stats.trend > 0 ? '+' : ''}{stats.trend.toFixed(1)} from last
                    </div>
                  </div>
                )}
              </div>
              <DetailedChart data={selectedData} color={selectedConfig.color} label={selectedConfig.unit} />
            </div>

            {/* Statistics */}
            {stats && (
              <div className="bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{stats.max.toFixed(1)}</div>
                    <div className="text-gray-300 text-sm">Highest</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{stats.avg.toFixed(1)}</div>
                    <div className="text-gray-300 text-sm">Average</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400">{stats.min.toFixed(1)}</div>
                    <div className="text-gray-300 text-sm">Lowest</div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <div className={`text-2xl font-bold ${
                      stats.totalChange > 0 ? 'text-green-400' : stats.totalChange < 0 ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {stats.totalChange > 0 ? '+' : ''}{stats.totalChange.toFixed(1)}
                    </div>
                    <div className="text-gray-300 text-sm">Total Change</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Add New Entry */}
            <div className="bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 p-6">
              <button
                onClick={() => {
                  // Create a temporary form state for this metric
                  const form = document.createElement('div');
                  form.innerHTML = `
                    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                      <div class="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
                        <div class="p-6">
                          <h3 class="text-xl font-semibold text-white mb-6">Add ${selectedConfig.title}</h3>
                          <form id="metric-form" class="space-y-4">
                            <div>
                              <label class="block text-sm font-medium text-gray-300 mb-2">Date</label>
                              <input type="date" id="date-input" value="${new Date().toISOString().split('T')[0]}" class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                            </div>
                            <div>
                              <label class="block text-sm font-medium text-gray-300 mb-2">${selectedConfig.title} (${selectedConfig.unit})</label>
                              <input type="number" id="value-input" step="${selectedConfig.unit.includes('%') ? '0.1' : selectedConfig.unit === 'cal' ? '1' : '0.1'}" placeholder="Enter ${selectedConfig.title.toLowerCase()}" class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                            </div>
                            <div class="flex justify-end space-x-3 pt-4">
                              <button type="button" id="cancel-btn" class="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors">Cancel</button>
                              <button type="submit" class="px-6 py-2 bg-gradient-to-r ${selectedConfig.gradientFrom} ${selectedConfig.gradientTo} text-white rounded-lg hover:opacity-90 transition-opacity font-medium">Save</button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  `;
                  document.body.appendChild(form);
                  
                  const formElement = form.querySelector('#metric-form') as HTMLFormElement;
                  const cancelBtn = form.querySelector('#cancel-btn') as HTMLButtonElement;
                  const dateInput = form.querySelector('#date-input') as HTMLInputElement;
                  const valueInput = form.querySelector('#value-input') as HTMLInputElement;
                  
                  cancelBtn.onclick = () => document.body.removeChild(form);
                  
                  formElement.onsubmit = async (e) => {
                    e.preventDefault();
                    try {
                      await handleAddMetric(selectedConfig.key, parseFloat(valueInput.value), dateInput.value);
                      document.body.removeChild(form);
                    } catch (error) {
                      console.error('Error saving:', error);
                    }
                  };
                  
                  valueInput.focus();
                }}
                className={`w-full flex items-center justify-center space-x-3 bg-gradient-to-r ${selectedConfig.gradientFrom} ${selectedConfig.gradientTo} text-white py-4 px-6 rounded-lg hover:opacity-90 transition-opacity font-medium text-lg`}
              >
                <Plus className="h-5 w-5" />
                <span>Add New Entry</span>
              </button>
            </div>

            {/* Health Information */}
            <div className="bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 p-6">
              <div className="flex items-center mb-4">
                <Info className="h-5 w-5 text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Health Info</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">Healthy Range</h4>
                  <p className="text-white text-sm">{selectedConfig.healthyRange}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">Tips</h4>
                  <p className="text-gray-400 text-sm">{selectedConfig.tips}</p>
                </div>
              </div>
            </div>

            {/* Recent Entries */}
            <div className="bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <List className="h-5 w-5 text-green-400 mr-2" />
                  <h3 className="text-lg font-semibold text-white">Recent Entries</h3>
                </div>
                <span className="text-gray-400 text-sm">{selectedData.length} total</span>
              </div>
              <DataHistory 
                data={selectedData} 
                unit={selectedConfig.unit} 
                onDelete={handleDeleteMetric} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumBodyMetrics;