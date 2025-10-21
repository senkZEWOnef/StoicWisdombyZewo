import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Download, FileJson, FileSpreadsheet, FileText, 
  Shield, CheckCircle, AlertCircle, Database,
  Archive, Settings, HardDrive, Sparkles
} from 'lucide-react';

interface ExportOptions {
  journal: boolean;
  ideas: boolean;
  events: boolean;
  mood: boolean;
  workouts: boolean;
  meals: boolean;
  format: 'json' | 'csv' | 'txt';
}

const PremiumDataExport: React.FC = () => {
  const { user } = useAuth();
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    journal: true,
    ideas: true,
    events: true,
    mood: true,
    workouts: true,
    meals: true,
    format: 'json'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');

  const dataTypes = [
    { 
      key: 'journal' as keyof ExportOptions, 
      label: 'Journal Entries', 
      icon: '📖', 
      description: 'Your personal thoughts and reflections',
      endpoint: '/journal'
    },
    { 
      key: 'ideas' as keyof ExportOptions, 
      label: 'Ideas & Notes', 
      icon: '💡', 
      description: 'Creative ideas and important notes',
      endpoint: '/ideas'
    },
    { 
      key: 'events' as keyof ExportOptions, 
      label: 'Calendar Events', 
      icon: '📅', 
      description: 'Scheduled events and appointments',
      endpoint: '/events'
    },
    { 
      key: 'mood' as keyof ExportOptions, 
      label: 'Mood Tracking', 
      icon: '😊', 
      description: 'Emotional wellness and Stoic wisdom',
      endpoint: '/mood-entries'
    },
    { 
      key: 'workouts' as keyof ExportOptions, 
      label: 'Fitness Data', 
      icon: '💪', 
      description: 'Workout plans and progress tracking',
      endpoint: '/workouts'
    },
    { 
      key: 'meals' as keyof ExportOptions, 
      label: 'Nutrition Log', 
      icon: '🍽️', 
      description: 'Meal tracking and nutrition data',
      endpoint: '/meals'
    }
  ];

  const formatOptions = [
    {
      value: 'json' as const,
      label: 'JSON',
      icon: FileJson,
      description: 'Complete structured data',
      features: ['Full data preservation', 'Re-importable', 'Developer friendly'],
      color: 'from-blue-500 to-cyan-600'
    },
    {
      value: 'csv' as const,
      label: 'CSV',
      icon: FileSpreadsheet,
      description: 'Spreadsheet compatible',
      features: ['Excel/Sheets ready', 'Data analysis', 'Tabular format'],
      color: 'from-green-500 to-emerald-600'
    },
    {
      value: 'txt' as const,
      label: 'Text',
      icon: FileText,
      description: 'Human readable format',
      features: ['Easy to read', 'Printable', 'Universal compatibility'],
      color: 'from-purple-500 to-indigo-600'
    }
  ];

  const handleOptionChange = (option: keyof ExportOptions, value: boolean | string) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  const exportData = async () => {
    setIsExporting(true);
    setExportStatus('Preparing export...');

    try {
      const token = localStorage.getItem('token');
      const selectedDataTypes = dataTypes.filter(type => exportOptions[type.key] as boolean);
      
      const exportData: { [key: string]: any } = {
        exportDate: new Date().toISOString(),
        user: user?.username || 'unknown',
        format: exportOptions.format,
        version: '1.0'
      };

      setExportStatus('Fetching your data...');

      for (const dataType of selectedDataTypes) {
        try {
          const response = await fetch(`http://localhost:5001${dataType.endpoint}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            exportData[dataType.key] = await response.json();
          } else {
            console.warn(`Failed to fetch ${dataType.label} data`);
            exportData[dataType.key] = [];
          }
        } catch (error) {
          console.warn(`Error fetching ${dataType.label}:`, error);
          exportData[dataType.key] = [];
        }
      }

      setExportStatus('Generating file...');

      let fileContent = '';
      let fileName = '';
      let mimeType = '';

      const timestamp = new Date().toISOString().split('T')[0];

      if (exportOptions.format === 'json') {
        fileContent = JSON.stringify(exportData, null, 2);
        fileName = `stoic-wisdom-backup-${timestamp}.json`;
        mimeType = 'application/json';
      } else if (exportOptions.format === 'csv') {
        fileContent = convertToCSV(exportData);
        fileName = `stoic-wisdom-export-${timestamp}.csv`;
        mimeType = 'text/csv';
      } else if (exportOptions.format === 'txt') {
        fileContent = convertToText(exportData);
        fileName = `stoic-wisdom-export-${timestamp}.txt`;
        mimeType = 'text/plain';
      }

      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportStatus('Export completed successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  const convertToCSV = (data: any) => {
    let csv = `# Eudaimon Data Export\n# Generated: ${data.exportDate}\n# User: ${data.user}\n\n`;
    
    Object.keys(data).forEach(section => {
      if (['exportDate', 'user', 'format', 'version'].includes(section)) return;
      
      const items = data[section];
      if (Array.isArray(items) && items.length > 0) {
        csv += `\n## ${section.toUpperCase()}\n`;
        
        const headers = Object.keys(items[0]);
        csv += headers.join(',') + '\n';
        
        items.forEach(item => {
          const row = headers.map(header => {
            let value = item[header] || '';
            if (typeof value === 'string') {
              value = value.replace(/"/g, '""');
              if (value.includes(',') || value.includes('\n')) {
                value = `"${value}"`;
              }
            }
            return value;
          });
          csv += row.join(',') + '\n';
        });
        csv += '\n';
      }
    });
    
    return csv;
  };

  const convertToText = (data: any) => {
    let text = `🧘 STOIC WISDOM - PERSONAL DATA EXPORT\n`;
    text += `${'='.repeat(50)}\n`;
    text += `Generated: ${new Date(data.exportDate).toLocaleString()}\n`;
    text += `User: ${data.user}\n`;
    text += `Format: ${data.format.toUpperCase()}\n`;
    text += `${'='.repeat(50)}\n\n`;

    Object.keys(data).forEach(section => {
      if (['exportDate', 'user', 'format', 'version'].includes(section)) return;
      
      const items = data[section];
      if (Array.isArray(items) && items.length > 0) {
        const sectionTitle = section.charAt(0).toUpperCase() + section.slice(1);
        text += `${sectionTitle.toUpperCase()}\n`;
        text += `${'-'.repeat(sectionTitle.length)}\n\n`;
        
        items.forEach((item, index) => {
          text += `Entry ${index + 1}:\n`;
          
          if (item.title) text += `  Title: ${item.title}\n`;
          if (item.content) text += `  Content: ${item.content}\n`;
          if (item.mood) text += `  Mood: ${item.mood}\n`;
          if (item.energy_level) text += `  Energy: ${item.energy_level}/10\n`;
          if (item.meal_name) text += `  Meal: ${item.meal_name}\n`;
          if (item.calories) text += `  Calories: ${item.calories}\n`;
          if (item.name) text += `  Name: ${item.name}\n`;
          if (item.description) text += `  Description: ${item.description}\n`;
          if (item.created_at) {
            text += `  Date: ${new Date(item.created_at).toLocaleString()}\n`;
          }
          if (item.stoic_quote) text += `  Wisdom: "${item.stoic_quote}"\n`;
          
          text += '\n';
        });
        text += '\n';
      }
    });
    
    return text;
  };

  const createFullBackup = async () => {
    setExportOptions({
      journal: true,
      ideas: true,
      events: true,
      mood: true,
      workouts: true,
      meals: true,
      format: 'json'
    });
    
    setTimeout(() => {
      exportData();
    }, 100);
  };

  const getSelectedCount = () => {
    return dataTypes.filter(type => exportOptions[type.key] as boolean).length;
  };

  const selectedFormat = formatOptions.find(f => f.value === exportOptions.format)!;
  const SelectedFormatIcon = selectedFormat.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
              <Download className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Data Export</h1>
              <p className="text-white/70">Backup and export your personal data</p>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-6 h-6 text-white" />
            <h3 className="text-xl font-bold text-white">Privacy & Security</h3>
          </div>
          <p className="text-white/90 leading-relaxed">
            Your data is exported directly to your device. Nothing is sent to external servers. 
            All processing happens locally in your browser for maximum privacy and security.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Data Selection */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 hover-lift">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Select Data Types</h2>
                  <p className="text-white/60 text-sm">Choose what to include in your export</p>
                </div>
              </div>

              <div className="space-y-3">
                {dataTypes.map((dataType) => (
                  <label
                    key={dataType.key}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      exportOptions[dataType.key]
                        ? 'border-violet-500 bg-violet-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={exportOptions[dataType.key] as boolean}
                      onChange={(e) => handleOptionChange(dataType.key, e.target.checked)}
                      className="w-5 h-5 rounded border-white/20 bg-white/10 text-violet-500 focus:ring-violet-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{dataType.icon}</span>
                        <h3 className="font-semibold text-white">{dataType.label}</h3>
                      </div>
                      <p className="text-white/60 text-sm">{dataType.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-6 p-4 bg-white/10 rounded-xl">
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm">{getSelectedCount()} data types selected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Format Selection & Actions */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 hover-lift">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Export Format</h2>
                  <p className="text-white/60 text-sm">Choose your preferred file format</p>
                </div>
              </div>

              <div className="space-y-3">
                {formatOptions.map((format) => {
                  const FormatIcon = format.icon;
                  return (
                    <label
                      key={format.value}
                      className={`block p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        exportOptions.format === format.value
                          ? 'border-violet-500 bg-violet-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <input
                        type="radio"
                        name="format"
                        value={format.value}
                        checked={exportOptions.format === format.value}
                        onChange={(e) => handleOptionChange('format', e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${format.color} flex items-center justify-center flex-shrink-0`}>
                          <FormatIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-white">{format.label}</h3>
                            <span className="text-white/60 text-sm">- {format.description}</span>
                          </div>
                          <ul className="space-y-1">
                            {format.features.map((feature, index) => (
                              <li key={index} className="text-white/70 text-sm flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-emerald-400" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={exportData}
                disabled={isExporting || getSelectedCount() === 0}
                className="w-full px-6 py-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 hover-lift"
              >
                {isExporting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <SelectedFormatIcon className="w-5 h-5" />
                    Export Selected Data
                  </>
                )}
              </button>

              <button
                onClick={createFullBackup}
                disabled={isExporting}
                className="w-full px-6 py-4 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 hover-lift"
              >
                <Archive className="w-5 h-5" />
                Create Full Backup
              </button>
            </div>

            {/* Status */}
            {exportStatus && (
              <div className={`p-4 rounded-xl flex items-center gap-3 ${
                exportStatus.includes('failed') 
                  ? 'bg-red-500/20 border border-red-500/30 text-red-200'
                  : exportStatus.includes('completed')
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-200'
                    : 'bg-blue-500/20 border border-blue-500/30 text-blue-200'
              }`}>
                {exportStatus.includes('failed') ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                <span>{exportStatus}</span>
              </div>
            )}
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 text-center hover-lift">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
              <HardDrive className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-white mb-2">Local Processing</h3>
            <p className="text-white/60 text-sm">All data processing happens on your device for maximum privacy</p>
          </div>

          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 text-center hover-lift">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-white mb-2">Secure Export</h3>
            <p className="text-white/60 text-sm">Your data never leaves your computer during the export process</p>
          </div>

          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 text-center hover-lift">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-white mb-2">Multiple Formats</h3>
            <p className="text-white/60 text-sm">Choose the format that best suits your needs and workflow</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumDataExport;