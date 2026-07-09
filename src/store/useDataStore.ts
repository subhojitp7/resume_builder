import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  duration: string;
  description: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string[];
  link?: string;
}

export interface ProfileState {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
  };
  education: Education[];
  skills: string[];
  experience: Experience[];
  projects: Project[];
  achievements: string[];
  latexCode: string;
  setPersonalInfo: (info: any) => void;
  addEducation: (edu: Education) => void;
  removeEducation: (id: string) => void;
  updateEducation: (id: string, edu: Education) => void;
  setSkills: (skills: string[]) => void;
  addExperience: (exp: Experience) => void;
  removeExperience: (id: string) => void;
  updateExperience: (id: string, exp: Experience) => void;
  addProject: (proj: Project) => void;
  removeProject: (id: string) => void;
  updateProject: (id: string, proj: Project) => void;
  setAchievements: (ach: string[]) => void;
  atsScores: number[];
  addAtsScore: (score: number) => void;
  setLatexCode: (code: string) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      personalInfo: { name: '', email: '', phone: '' },
      education: [],
      skills: [],
      experience: [],
      projects: [],
      achievements: [],
      latexCode: '\\documentclass{article}\\n\\begin{document}\\nHello World\\n\\end{document}',
      setPersonalInfo: (info) => set((state) => ({ personalInfo: { ...state.personalInfo, ...info } })),
      addEducation: (edu) => set((state) => ({ education: [...state.education, edu] })),
      removeEducation: (id) => set((state) => ({ education: state.education.filter(e => e.id !== id) })),
      updateEducation: (id, edu) => set((state) => ({ education: state.education.map(e => e.id === id ? edu : e) })),
      setSkills: (skills) => set({ skills }),
      addExperience: (exp) => set((state) => ({ experience: [...state.experience, exp] })),
      removeExperience: (id) => set((state) => ({ experience: state.experience.filter(e => e.id !== id) })),
      updateExperience: (id, exp) => set((state) => ({ experience: state.experience.map(e => e.id === id ? exp : e) })),
      addProject: (proj) => set((state) => ({ projects: [...state.projects, proj] })),
      removeProject: (id) => set((state) => ({ projects: state.projects.filter(p => p.id !== id) })),
      updateProject: (id, proj) => set((state) => ({ projects: state.projects.map(p => p.id === id ? proj : p) })),
      setAchievements: (achievements) => set({ achievements }),
      atsScores: [],
      addAtsScore: (score) => set((state) => ({ atsScores: [...state.atsScores, score] })),
      setLatexCode: (code) => set({ latexCode: code }),
    }),
    {
      name: 'resume-ai-profile',
    }
  )
);

export interface JournalState {
  logs: { id: string; date: string; content: string }[];
  addLog: (content: string) => void;
  removeLog: (id: string) => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      logs: [],
      addLog: (content) => set((state) => ({
        logs: [{ id: Date.now().toString(), date: new Date().toISOString(), content }, ...state.logs]
      })),
      removeLog: (id) => set((state) => ({
        logs: state.logs.filter(l => l.id !== id)
      })),
    }),
    {
      name: 'resume-ai-journal',
    }
  )
);

export interface JobMatchState {
  jobInput: string;
  atsResult: {score: number, missingKeywords: string[], feedback: string[]} | null;
  recommendations: {generalAdvice: string, recommendedBullets: {section: string, role: string, bullet: string}[], skillsToAdd: string[]} | null;
  setJobInput: (input: string) => void;
  setAtsResult: (result: any) => void;
  setRecommendations: (recs: any) => void;
  clearResults: () => void;
}

export const useJobMatchStore = create<JobMatchState>()(
  persist(
    (set) => ({
      jobInput: '',
      atsResult: null,
      recommendations: null,
      setJobInput: (input) => set({ jobInput: input }),
      setAtsResult: (result) => set({ atsResult: result }),
      setRecommendations: (recs) => set({ recommendations: recs }),
      clearResults: () => set({ atsResult: null, recommendations: null }),
    }),
    {
      name: 'resume-ai-jobmatch',
    }
  )
);
