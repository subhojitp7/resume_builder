import React from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

const Settings: React.FC = () => {
  const { 
    openAiKey, geminiKey, claudeKey, geminiModel,
    setOpenAiKey, setGeminiKey, setClaudeKey, setGeminiModel
  } = useSettingsStore();

  return (
    <div>
      <h1 className="text-gradient" style={{ marginBottom: '1.5rem' }}>Settings</h1>
      
      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>AI Model Configurations</h3>
        <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Provide your API keys to enable the Multi-Model AI Engine. Keys are stored safely in your browser's local storage.
        </p>

        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label className="input-label" style={{ margin: 0 }}>OpenAI API Key</label>
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>Get Key ↗</a>
          </div>
          <input 
            type="password" 
            className="input-field" 
            placeholder="sk-..." 
            value={openAiKey}
            onChange={(e) => setOpenAiKey(e.target.value)}
          />
        </div>

        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label className="input-label" style={{ margin: 0 }}>Google Gemini API Key</label>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>Get Key ↗</a>
          </div>
          <input 
            type="password" 
            className="input-field" 
            placeholder="AIza..." 
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label className="input-label" style={{ marginBottom: '0.5rem' }}>Google Gemini Active Model</label>
          <select 
            className="input-field" 
            value={geminiModel} 
            onChange={(e) => setGeminiModel(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}
          >
            <option value="gemini-3.5-flash">Gemini 3.5 Flash (Recommended)</option>
            <option value="antigravity-preview-05-2026">Antigravity Agent Preview (Specialized)</option>
            <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview</option>
            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
          </select>
        </div>

        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label className="input-label" style={{ margin: 0 }}>Anthropic Claude API Key</label>
            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>Get Key ↗</a>
          </div>
          <input 
            type="password" 
            className="input-field" 
            placeholder="sk-ant-..." 
            value={claudeKey}
            onChange={(e) => setClaudeKey(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
