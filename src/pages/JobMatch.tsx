import React, { useState } from 'react';
import { useProfileStore, useJournalStore } from '../store/useDataStore';
import { scoreATS, recommendChanges } from '../services/resumeAgents';

const JobMatch: React.FC = () => {
  const [jobInput, setJobInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { latexCode } = useProfileStore();
  const profileData = useProfileStore();
  const { logs } = useJournalStore();
  
  const [atsResult, setAtsResult] = useState<{score: number, missingKeywords: string[], feedback: string[]} | null>(null);
  const [recommendations, setRecommendations] = useState<{generalAdvice: string, recommendedBullets: {section: string, role: string, bullet: string}[], skillsToAdd: string[]} | null>(null);

  const handleExtractFromLink = async () => {
    if (!jobInput.trim() || !jobInput.startsWith('http')) {
      alert("Please paste a valid URL starting with http:// or https://");
      return;
    }
    
    setIsProcessing(true);
    try {
      // Note: Direct client-side fetching often fails due to CORS on job boards (LinkedIn, Indeed).
      // For a robust production app, this would route through a backend proxy.
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(jobInput)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      
      // Strip HTML tags for a clean text representation
      const cleanText = data.contents.replace(/<[^>]*>?/gm, '');
      setJobInput(cleanText.substring(0, 15000)); // limit length
      alert("Successfully extracted text from link!");
    } catch (err: any) {
      alert("Could not extract from link due to CORS or network errors. Please paste the job description text manually.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!jobInput.trim()) {
      alert("Please paste a Job Description or extract from a link first.");
      return;
    }
    
    setIsProcessing(true);
    setAtsResult(null);
    setRecommendations(null);
    
    try {
      // 1. Get ATS Score
      const atsResponse = await scoreATS(latexCode, jobInput, 'gemini');
      if (!atsResponse.error) {
        const jsonMatch = atsResponse.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setAtsResult(parsed);
          useProfileStore.getState().addAtsScore(parsed.score);
        }
      }

      // 2. Get AI Recommendations
      const dailyLogs = logs.map(l => l.content);
      const { latexCode: _, setLatexCode: __, setPersonalInfo, addEducation, removeEducation, setSkills, addExperience, removeExperience, addProject, removeProject, setAchievements, ...cleanProfile } = profileData;
      
      const recResponse = await recommendChanges(cleanProfile, dailyLogs, jobInput, 'gemini');
      if (!recResponse.error) {
        const jsonMatch = recResponse.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) setRecommendations(JSON.parse(jsonMatch[0]));
      }

    } catch (err: any) {
      alert("Analysis failed: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ paddingBottom: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 className="text-gradient" style={{ marginBottom: '1.5rem' }}>Job Match Analyzer</h1>
      
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Target Role</h3>
        <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
          Paste the job description or a URL to the job posting. The AI will analyze your profile and resume against this role.
        </p>
        
        <textarea 
          className="input-field" 
          placeholder="Paste Job Description or URL here..."
          value={jobInput}
          onChange={(e) => setJobInput(e.target.value)}
          style={{ width: '100%', height: '150px', resize: 'vertical', marginBottom: '1rem' }}
        />
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={handleExtractFromLink}
            disabled={isProcessing || !jobInput.startsWith('http')}
          >
            Extract from Link
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleAnalyze}
            disabled={isProcessing || !jobInput.trim()}
          >
            {isProcessing ? 'Analyzing...' : 'Evaluate ATS & Recommend Changes ✦'}
          </button>
        </div>
      </div>

      {atsResult && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: `4px solid ${atsResult.score > 80 ? 'var(--success)' : atsResult.score > 60 ? 'orange' : 'var(--danger)'}` }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ATS Match Score: 
            <span style={{ color: atsResult.score > 80 ? 'var(--success)' : atsResult.score > 60 ? 'orange' : 'var(--danger)' }}>
              {atsResult.score}/100
            </span> 
          </h3>
          
          {atsResult.missingKeywords?.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Missing Keywords</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {atsResult.missingKeywords.map((kw, i) => (
                  <span key={i} style={{ background: 'rgba(255,100,100,0.1)', color: '#ff8888', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem' }}>{kw}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {recommendations && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>AI Recommendations</h3>
          
          <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>General Advice</h4>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-light)' }}>{recommendations.generalAdvice}</p>
          </div>

          {recommendations.skillsToAdd?.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Skills to Add</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {recommendations.skillsToAdd.map((skill, i) => (
                  <span key={i} style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem' }}>+ {skill}</span>
                ))}
              </div>
            </div>
          )}

          {recommendations.recommendedBullets?.length > 0 && (
            <div>
              <h4 style={{ marginBottom: '1rem' }}>High-Impact Bullet Points to Add</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recommendations.recommendedBullets.map((item, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderLeft: '3px solid var(--primary)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {item.section} &bull; {item.role}
                    </div>
                    <div style={{ fontSize: '0.95rem' }}>{item.bullet}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobMatch;
