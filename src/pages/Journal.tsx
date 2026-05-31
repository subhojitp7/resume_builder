import React, { useState } from 'react';
import { useJournalStore } from '../store/useDataStore';
import { enhanceJournalLog } from '../services/resumeAgents';

const Journal: React.FC = () => {
  const { logs, addLog, removeLog } = useJournalStore();
  const [newLog, setNewLog] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleAddLog = () => {
    if (newLog.trim()) {
      addLog(newLog.trim());
      setNewLog('');
    }
  };

  const handleEnhance = async () => {
    if (!newLog.trim()) return;
    setIsEnhancing(true);
    try {
      const enhancedText = await enhanceJournalLog(newLog, 'gemini');
      setNewLog(enhancedText);
    } catch (err: any) {
      alert("Error enhancing log: " + err.message);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <h1 className="text-gradient" style={{ marginBottom: '1.5rem' }}>Learning Journal</h1>
      
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Log Your Daily Work</h3>
        <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
          Document your accomplishments, challenges, and new skills learned today. The AI Synthesizer will automatically extract value from these logs to optimize your resume bullet points.
        </p>
        <textarea 
          className="input-field" 
          placeholder="E.g., Today I refactored the database schema to use indexed fields, which improved query latency by 40%..."
          value={newLog}
          onChange={(e) => setNewLog(e.target.value)}
          style={{ width: '100%', height: '120px', resize: 'vertical', marginBottom: '1rem' }}
        />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleEnhance}
            disabled={isEnhancing || !newLog.trim()}
          >
            {isEnhancing ? 'Enhancing...' : 'Enhance with Gemini ✦'}
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleAddLog}
            disabled={!newLog.trim()}
          >
            Save Log
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Recent Logs</h3>
        {logs.length === 0 ? (
          <p className="text-muted">No logs recorded yet. Start journaling!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {logs.map((log) => (
              <div key={log.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', position: 'relative' }}>
                <button onClick={() => removeLog(log.id)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>&times;</button>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                  {new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <p style={{ margin: 0, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{log.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;
