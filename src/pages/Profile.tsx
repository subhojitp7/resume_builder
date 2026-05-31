import React, { useState } from 'react';
import { useProfileStore } from '../store/useDataStore';
import { parseResumeText } from '../services/resumeAgents';

const Profile: React.FC = () => {
  const { 
    personalInfo, setPersonalInfo, 
    skills, setSkills, 
    experience, addExperience, removeExperience,
    education, addEducation, removeEducation,
    projects, addProject, removeProject,
    achievements, setAchievements
  } = useProfileStore();
  
  const [newSkill, setNewSkill] = useState('');
  
  const [newExp, setNewExp] = useState({ title: '', company: '', duration: '', description: '' });
  const [editingExpId, setEditingExpId] = useState<string | null>(null);

  const [newEdu, setNewEdu] = useState({ degree: '', institution: '', year: '' });
  const [editingEduId, setEditingEduId] = useState<string | null>(null);

  const [newProj, setNewProj] = useState({ title: '', link: '', description: '' });
  const [editingProjId, setEditingProjId] = useState<string | null>(null);
  
  const [rawResume, setRawResume] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleParseResume = async () => {
    if (!rawResume.trim() && !resumeFile) return;
    setIsParsing(true);
    try {
      let fileData;
      if (resumeFile) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(resumeFile);
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // strip 'data:application/pdf;base64,'
          };
          reader.onerror = (error) => reject(error);
        });
        fileData = { mimeType: resumeFile.type, data: base64 };
      }

      // Parse using gemini for best context length and native PDF support
      const promptText = rawResume.trim() ? rawResume : "Please extract my details from this attached PDF resume.";
      const response = await parseResumeText(promptText, 'gemini', fileData);
      
      console.log("AI Response:", response.content);

      if (response.error) {
        throw new Error("AI Service returned an error: " + response.error);
      }

      // Robust JSON extraction
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON object found in the AI response. Response was: " + response.content.substring(0, 100) + "...");
      }

      const parsedData = JSON.parse(jsonMatch[0]);
      
      if (parsedData.personalInfo) setPersonalInfo(parsedData.personalInfo);
      if (parsedData.skills) setSkills(parsedData.skills);
      if (parsedData.achievements) setAchievements(parsedData.achievements);
      
      if (parsedData.education) {
        parsedData.education.forEach((edu: any) => {
          addEducation({ ...edu, id: Date.now().toString() + Math.random() });
        });
      }
      
      if (parsedData.experience) {
        parsedData.experience.forEach((exp: any) => {
          // ensure description is an array
          const desc = Array.isArray(exp.description) ? exp.description : [exp.description];
          addExperience({ ...exp, description: desc, id: Date.now().toString() + Math.random() });
        });
      }

      if (parsedData.projects) {
        parsedData.projects.forEach((proj: any) => {
          const desc = Array.isArray(proj.description) ? proj.description : [proj.description];
          addProject({ ...proj, description: desc, id: Date.now().toString() + Math.random() });
        });
      }
      alert('Resume parsed successfully! Check your fields below.');
      setRawResume('');
      setResumeFile(null);
    } catch (err: any) {
      alert("Failed to parse resume. Error: " + err.message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleAddExp = () => {
    if (newExp.title && newExp.company) {
      const descArray = newExp.description.split('\n').filter(s => s.trim());
      if (editingExpId) {
        useProfileStore.getState().updateExperience(editingExpId, { ...newExp, description: descArray as any, id: editingExpId });
        setEditingExpId(null);
      } else {
        addExperience({ ...newExp, description: descArray as any, id: Date.now().toString() });
      }
      setNewExp({ title: '', company: '', duration: '', description: '' });
    }
  };

  const handleEditExp = (exp: any) => {
    setEditingExpId(exp.id);
    const desc = Array.isArray(exp.description) ? exp.description.join('\n') : exp.description;
    setNewExp({ title: exp.title, company: exp.company, duration: exp.duration, description: desc });
  };

  const handleAddEdu = () => {
    if (newEdu.degree && newEdu.institution) {
      if (editingEduId) {
        useProfileStore.getState().updateEducation(editingEduId, { ...newEdu, id: editingEduId });
        setEditingEduId(null);
      } else {
        addEducation({ ...newEdu, id: Date.now().toString() });
      }
      setNewEdu({ degree: '', institution: '', year: '' });
    }
  };

  const handleEditEdu = (edu: any) => {
    setEditingEduId(edu.id);
    setNewEdu({ degree: edu.degree, institution: edu.institution, year: edu.year });
  };

  const handleAddProj = () => {
    if (newProj.title) {
      const descArray = newProj.description.split('\n').filter(s => s.trim());
      if (editingProjId) {
        useProfileStore.getState().updateProject(editingProjId, { ...newProj, description: descArray as any, id: editingProjId });
        setEditingProjId(null);
      } else {
        addProject({ ...newProj, description: descArray as any, id: Date.now().toString() });
      }
      setNewProj({ title: '', link: '', description: '' });
    }
  };

  const handleEditProj = (proj: any) => {
    setEditingProjId(proj.id);
    const desc = Array.isArray(proj.description) ? proj.description.join('\n') : proj.description;
    setNewProj({ title: proj.title, link: proj.link || '', description: desc });
  };

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <h1 className="text-gradient" style={{ marginBottom: '1.5rem' }}>Master Profile</h1>
      
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>AI Parsing: Import Existing Resume</h3>
        <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
          Paste your existing resume (plain text, LaTeX, or Markdown) OR upload your PDF resume below. The AI will automatically extract and populate your profile fields.
        </p>
        
        <input 
          type="file" 
          accept="application/pdf"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setResumeFile(e.target.files[0]);
            }
          }}
          style={{ marginBottom: '1rem', display: 'block', color: 'var(--text-light)' }}
        />
        {resumeFile && <p style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>File selected: {resumeFile.name}</p>}

        <textarea 
          className="input-field" 
          placeholder="Or paste your full resume text here..."
          value={rawResume}
          onChange={(e) => setRawResume(e.target.value)}
          style={{ width: '100%', height: '120px', resize: 'vertical', marginBottom: '1rem' }}
        />
        
        <button 
          className="btn btn-secondary" 
          onClick={handleParseResume}
          disabled={isParsing || (!rawResume.trim() && !resumeFile)}
        >
          {isParsing ? 'Parsing...' : 'Parse with Gemini ✦'}
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Personal Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input className="input-field" value={personalInfo.name} onChange={(e) => setPersonalInfo({ name: e.target.value })} />
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input className="input-field" value={personalInfo.email} onChange={(e) => setPersonalInfo({ email: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Skills</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {skills.map((skill, idx) => (
            <span key={idx} style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem' }}>
              {skill} <button onClick={() => setSkills(skills.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', marginLeft: '0.2rem' }}>&times;</button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input className="input-field" placeholder="Add a skill (e.g. React.js)" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()} />
          <button className="btn btn-secondary" onClick={handleAddSkill}>Add</button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Education</h3>
        {education.map(edu => (
          <div key={edu.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid var(--border-light)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => handleEditEdu(edu)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>Edit</button>
              <button onClick={() => removeEducation(edu.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>&times; Remove</button>
            </div>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>{edu.degree}</h4>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>{edu.institution} | {edu.year}</p>
          </div>
        ))}
        
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
          <h4 style={{ marginBottom: '1rem' }}>{editingEduId ? 'Edit Education' : 'Add Education'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input className="input-field" placeholder="Degree (e.g. BS Computer Science)" value={newEdu.degree} onChange={e => setNewEdu({...newEdu, degree: e.target.value})} style={{ gridColumn: 'span 2' }} />
            <input className="input-field" placeholder="Institution" value={newEdu.institution} onChange={e => setNewEdu({...newEdu, institution: e.target.value})} />
            <input className="input-field" placeholder="Year (e.g. 2024)" value={newEdu.year} onChange={e => setNewEdu({...newEdu, year: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={handleAddEdu}>{editingEduId ? 'Save Changes' : 'Add Education'}</button>
            {editingEduId && <button className="btn btn-secondary" onClick={() => { setEditingEduId(null); setNewEdu({ degree: '', institution: '', year: '' }); }}>Cancel</button>}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Experience</h3>
        {experience.map(exp => (
          <div key={exp.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid var(--border-light)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => handleEditExp(exp)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>Edit</button>
              <button onClick={() => removeExperience(exp.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>&times; Remove</button>
            </div>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>{exp.title} at {exp.company}</h4>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>{exp.duration}</p>
            <ul style={{ fontSize: '0.9rem', margin: 0, paddingLeft: '1.2rem', color: 'var(--text-light)' }}>
              {(Array.isArray(exp.description) ? exp.description : [exp.description]).map((bullet, i) => (
                <li key={i} style={{ marginBottom: '0.25rem' }}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}

        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
          <h4 style={{ marginBottom: '1rem' }}>{editingExpId ? 'Edit Experience' : 'Add Experience'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input className="input-field" placeholder="Job Title" value={newExp.title} onChange={e => setNewExp({...newExp, title: e.target.value})} />
            <input className="input-field" placeholder="Company" value={newExp.company} onChange={e => setNewExp({...newExp, company: e.target.value})} />
            <input className="input-field" placeholder="Duration (e.g. Jan 2020 - Present)" value={newExp.duration} onChange={e => setNewExp({...newExp, duration: e.target.value})} style={{ gridColumn: 'span 2' }} />
            <textarea className="input-field" placeholder="Brief description of role (each new line is a bullet point)..." value={newExp.description} onChange={e => setNewExp({...newExp, description: e.target.value})} style={{ gridColumn: 'span 2', resize: 'none', height: '100px' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={handleAddExp}>{editingExpId ? 'Save Changes' : 'Add Experience'}</button>
            {editingExpId && <button className="btn btn-secondary" onClick={() => { setEditingExpId(null); setNewExp({ title: '', company: '', duration: '', description: '' }); }}>Cancel</button>}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Projects & Achievements</h3>
        {projects.map(proj => (
          <div key={proj.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid var(--border-light)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => handleEditProj(proj)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>Edit</button>
              <button onClick={() => removeProject(proj.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>&times; Remove</button>
            </div>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>{proj.title} {proj.link && <a href={proj.link} target="_blank" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>[Link]</a>}</h4>
            <ul style={{ fontSize: '0.9rem', margin: 0, paddingLeft: '1.2rem', color: 'var(--text-light)' }}>
              {(Array.isArray(proj.description) ? proj.description : [proj.description]).map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}

        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
          <h4 style={{ marginBottom: '1rem' }}>{editingProjId ? 'Edit Project' : 'Add Project'}</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <input className="input-field" placeholder="Project Title" value={newProj.title} onChange={e => setNewProj({...newProj, title: e.target.value})} />
            <input className="input-field" placeholder="Link (Optional)" value={newProj.link} onChange={e => setNewProj({...newProj, link: e.target.value})} />
            <textarea className="input-field" placeholder="Project details (each new line is a bullet point)..." value={newProj.description} onChange={e => setNewProj({...newProj, description: e.target.value})} style={{ resize: 'none', height: '100px' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={handleAddProj}>{editingProjId ? 'Save Changes' : 'Add Project'}</button>
            {editingProjId && <button className="btn btn-secondary" onClick={() => { setEditingProjId(null); setNewProj({ title: '', link: '', description: '' }); }}>Cancel</button>}
          </div>
        </div>
        {achievements.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Achievements</h4>
            <ul style={{ fontSize: '0.9rem', margin: 0, paddingLeft: '1.2rem', color: 'var(--text-light)' }}>
              {achievements.map((ach, i) => <li key={i}>{ach}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
