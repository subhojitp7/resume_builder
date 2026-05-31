import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  openAiKey: string;
  geminiKey: string;
  claudeKey: string;
  setOpenAiKey: (key: string) => void;
  setGeminiKey: (key: string) => void;
  setClaudeKey: (key: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      openAiKey: '',
      geminiKey: '',
      claudeKey: '',
      setOpenAiKey: (key) => set({ openAiKey: key }),
      setGeminiKey: (key) => set({ geminiKey: key }),
      setClaudeKey: (key) => set({ claudeKey: key }),
    }),
    {
      name: 'resume-ai-settings', // unique name for localStorage
    }
  )
);
