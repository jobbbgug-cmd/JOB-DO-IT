'use client';

import { create } from 'zustand';

interface UIStore {
  settingsOpen: boolean;
  feedbackOpen: boolean;
  shortcutsOpen: boolean;
  zoom: number;
  openSettings: () => void;
  closeSettings: () => void;
  openFeedback: () => void;
  closeFeedback: () => void;
  openShortcuts: () => void;
  closeShortcuts: () => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  settingsOpen: false,
  feedbackOpen: false,
  shortcutsOpen: false,
  zoom: 150,
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
  openFeedback: () => set({ feedbackOpen: true }),
  closeFeedback: () => set({ feedbackOpen: false }),
  openShortcuts: () => set({ shortcutsOpen: true }),
  closeShortcuts: () => set({ shortcutsOpen: false }),
  setZoom: (zoom: number) => set({ zoom: Math.max(100, Math.min(200, zoom)) }),
  zoomIn: () => set((state) => ({ zoom: Math.min(200, state.zoom + 10) })),
  zoomOut: () => set((state) => ({ zoom: Math.max(100, state.zoom - 10) })),
}));
