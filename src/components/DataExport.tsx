import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ExportOptions {
  journal: boolean;
  ideas: boolean;
  reminders: boolean;
  events: boolean;
  mood: boolean;
  poetry: boolean;
  workouts: boolean;
  meals: boolean;
  format: 'json' | 'csv' | 'txt';
}

const DataExport: React.FC = () => {
  const { user } = useAuth();
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    journal: true,
    ideas: true,
    reminders: true,
    events: true,
    mood: true,
    poetry: true,
    workouts: true,
    meals: true,
    format: 'json'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');

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
      const endpoints = [];
      
      if (exportOptions.journal) endpoints.push({ name: 'journal', endpoint: '/journal' });
      if (exportOptions.ideas) endpoints.push({ name: 'ideas', endpoint: '/ideas' });
      if (exportOptions.reminders) endpoints.push({ name: 'reminders', endpoint: '/reminders' });
      if (exportOptions.events) endpoints.push({ name: 'events', endpoint: '/events' });
      if (exportOptions.mood) endpoints.push({ name: 'mood', endpoint: '/mood-entries' });
      if (exportOptions.poetry) endpoints.push({ name: 'poetry', endpoint: '/poetry' });
      if (exportOptions.workouts) endpoints.push({ name: 'workouts', endpoint: '/workouts' });
      if (exportOptions.meals) endpoints.push({ name: 'meals', endpoint: '/meals' });

      const exportData: { [key: string]: any } = {
        exportDate: new Date().toISOString(),
        user: user?.username || 'unknown',
        format: exportOptions.format
      };

      setExportStatus('Fetching data...');

      for (const { name, endpoint } of endpoints) {
        const response = await fetch(`http://localhost:5001${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          exportData[name] = await response.json();
        } else {
          console.warn(`Failed to fetch ${name} data`);
          exportData[name] = [];
        }
      }

      setExportStatus('Generating file...');

      let fileContent = '';
      let fileName = '';
      let mimeType = '';

      const timestamp = new Date().toISOString().split('T')[0];

      if (exportOptions.format === 'json') {
        fileContent = JSON.stringify(exportData, null, 2);
        fileName = `personal-journal-export-${timestamp}.json`;
        mimeType = 'application/json';
      } else if (exportOptions.format === 'csv') {
        fileContent = convertToCSV(exportData);
        fileName = `personal-journal-export-${timestamp}.csv`;
        mimeType = 'text/csv';
      } else if (exportOptions.format === 'txt') {
        fileContent = convertToText(exportData);
        fileName = `personal-journal-export-${timestamp}.txt`;
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
    let csv = '';
    
    Object.keys(data).forEach(section => {
      if (section === 'exportDate' || section === 'user' || section === 'format') return;
      
      const items = data[section];
      if (Array.isArray(items) && items.length > 0) {
        csv += `\n${section.toUpperCase()}\n`;
        
        const headers = Object.keys(items[0]);
        csv += headers.join(',') + '\n';
        
        items.forEach(item => {
          const row = headers.map(header => {
            let value = item[header] || '';
            if (typeof value === 'string' && value.includes(',')) {
              value = `"${value.replace(/"/g, '""')}"`;
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
    let text = `Personal Journal Export\n`;
    text += `Generated on: ${data.exportDate}\n`;
    text += `User: ${data.user}\n`;
    text += `\n${'='.repeat(50)}\n\n`;

    Object.keys(data).forEach(section => {
      if (section === 'exportDate' || section === 'user' || section === 'format') return;
      
      const items = data[section];
      if (Array.isArray(items) && items.length > 0) {
        text += `${section.toUpperCase()}\n`;
        text += `${'-'.repeat(section.length)}\n\n`;
        
        items.forEach((item, index) => {
          text += `${index + 1}. `;
          if (item.title) text += `${item.title}\n`;
          if (item.content) text += `${item.content}\n`;
          if (item.created_at) text += `Date: ${new Date(item.created_at).toLocaleString()}\n`;
          text += '\n';
        });
        text += '\n';
      }
    });
    
    return text;
  };

  const createBackup = async () => {
    setExportOptions({
      journal: true,
      ideas: true,
      reminders: true,
      events: true,
      mood: true,
      poetry: true,
      workouts: true,
      meals: true,
      format: 'json'
    });
    
    setTimeout(() => {
      exportData();
    }, 100);
  };

  return (
    <div className="container-fluid p-4" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow-lg border-0" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px'
          }}>
            <div className="card-header border-0 bg-transparent p-4">
              <h2 className="card-title mb-0 text-center" style={{ color: '#2c3e50', fontWeight: '600' }}>
                📤 Data Export & Backup
              </h2>
              <p className="text-muted text-center mb-0 mt-2">
                Export your personal journal data in various formats
              </p>
            </div>

            <div className="card-body p-4">
              <div className="row">
                <div className="col-md-6">
                  <h5 className="mb-3" style={{ color: '#34495e' }}>Select Data to Export</h5>
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="journal"
                          checked={exportOptions.journal}
                          onChange={(e) => handleOptionChange('journal', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="journal">
                          📝 Journal Entries
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="ideas"
                          checked={exportOptions.ideas}
                          onChange={(e) => handleOptionChange('ideas', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="ideas">
                          💡 Ideas & Notes
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="reminders"
                          checked={exportOptions.reminders}
                          onChange={(e) => handleOptionChange('reminders', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="reminders">
                          ⏰ Reminders
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="events"
                          checked={exportOptions.events}
                          onChange={(e) => handleOptionChange('events', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="events">
                          📅 Calendar Events
                        </label>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="mood"
                          checked={exportOptions.mood}
                          onChange={(e) => handleOptionChange('mood', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="mood">
                          😊 Mood Tracking
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="poetry"
                          checked={exportOptions.poetry}
                          onChange={(e) => handleOptionChange('poetry', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="poetry">
                          🎭 Poetry & Writing
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="workouts"
                          checked={exportOptions.workouts}
                          onChange={(e) => handleOptionChange('workouts', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="workouts">
                          💪 Workouts
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="meals"
                          checked={exportOptions.meals}
                          onChange={(e) => handleOptionChange('meals', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="meals">
                          🍽️ Meals
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <h5 className="mb-3" style={{ color: '#34495e' }}>Export Format</h5>
                  <div className="mb-3">
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="format"
                        id="json"
                        value="json"
                        checked={exportOptions.format === 'json'}
                        onChange={(e) => handleOptionChange('format', e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="json">
                        <strong>JSON</strong> - Complete data with structure (recommended)
                      </label>
                    </div>
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="format"
                        id="csv"
                        value="csv"
                        checked={exportOptions.format === 'csv'}
                        onChange={(e) => handleOptionChange('format', e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="csv">
                        <strong>CSV</strong> - Spreadsheet compatible format
                      </label>
                    </div>
                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="format"
                        id="txt"
                        value="txt"
                        checked={exportOptions.format === 'txt'}
                        onChange={(e) => handleOptionChange('format', e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="txt">
                        <strong>Text</strong> - Human readable format
                      </label>
                    </div>
                  </div>

                  <div className="alert alert-info" style={{ fontSize: '0.9rem' }}>
                    <strong>Privacy Note:</strong> All data is exported locally to your device. 
                    Your personal information never leaves your computer.
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <button
                  className="btn btn-lg me-3"
                  onClick={exportData}
                  disabled={isExporting}
                  style={{
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    border: 'none',
                    color: 'white',
                    borderRadius: '25px',
                    padding: '12px 30px',
                    fontWeight: '600',
                    minWidth: '150px'
                  }}
                >
                  {isExporting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Exporting...
                    </>
                  ) : (
                    '📤 Export Selected Data'
                  )}
                </button>

                <button
                  className="btn btn-outline-secondary btn-lg"
                  onClick={createBackup}
                  disabled={isExporting}
                  style={{
                    borderRadius: '25px',
                    padding: '12px 30px',
                    fontWeight: '600',
                    minWidth: '150px'
                  }}
                >
                  💾 Full Backup
                </button>
              </div>

              {exportStatus && (
                <div className="mt-3 text-center">
                  <div className={`alert ${exportStatus.includes('failed') ? 'alert-danger' : 
                    exportStatus.includes('completed') ? 'alert-success' : 'alert-info'}`}>
                    {exportStatus}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card mt-4 shadow border-0" style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px'
          }}>
            <div className="card-body p-4">
              <h5 className="card-title" style={{ color: '#34495e' }}>💡 Export Tips</h5>
              <div className="row">
                <div className="col-md-4">
                  <h6 className="text-primary">JSON Format</h6>
                  <ul className="small text-muted">
                    <li>Best for complete data backup</li>
                    <li>Preserves all data relationships</li>
                    <li>Can be imported back into apps</li>
                  </ul>
                </div>
                <div className="col-md-4">
                  <h6 className="text-success">CSV Format</h6>
                  <ul className="small text-muted">
                    <li>Open in Excel or Google Sheets</li>
                    <li>Great for data analysis</li>
                    <li>Each data type in separate section</li>
                  </ul>
                </div>
                <div className="col-md-4">
                  <h6 className="text-info">Text Format</h6>
                  <ul className="small text-muted">
                    <li>Easy to read and share</li>
                    <li>Perfect for printing</li>
                    <li>Works on any device</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExport;