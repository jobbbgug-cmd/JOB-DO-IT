'use client';

import { create } from 'zustand';

interface UIStore {
  settingsOpen: boolean;
  feedbackOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  openFeedback: () => void;
  closeFeedback: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  settingsOpen: false,
  feedbackOpen: false,
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
  openFeedback: () => set({ feedbackOpen: true }),
  closeFeedback: () => set({ feedbackOpen: false }),
}));
