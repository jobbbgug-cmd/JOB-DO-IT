'use client';

import { create } from 'zustand';

interface UIStore {
  settingsOpen: boolean;
  feedbackOpen: boolean;
  shortcutsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  openFeedback: () => void;
  closeFeedback: () => void;
  openShortcuts: () => void;
  closeShortcuts: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  settingsOpen: false,
  feedbackOpen: false,
  shortcutsOpen: false,
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
  openFeedback: () => set({ feedbackOpen: true }),
  closeFeedback: () => set({ feedbackOpen: false }),
  openShortcuts: () => set({ shortcutsOpen: true }),
  closeShortcuts: () => set({ shortcutsOpen: false }),
}));
