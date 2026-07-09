import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  openAiKey: string;
  geminiKey: string;
  claudeKey: string;
  geminiModel: string;
  setOpenAiKey: (key: string) => void;
  setGeminiKey: (key: string) => void;
  setClaudeKey: (key: string) => void;
  setGeminiModel: (model: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      openAiKey: '',
      geminiKey: '',
      claudeKey: '',
      geminiModel: 'gemini-3.5-flash',
      setOpenAiKey: (key) => set({ openAiKey: key }),
      setGeminiKey: (key) => set({ geminiKey: key }),
      setClaudeKey: (key) => set({ claudeKey: key }),
      setGeminiModel: (model) => set({ geminiModel: model }),
    }),
    {
      name: 'resume-ai-settings', // unique name for localStorage
    }
  )
);
