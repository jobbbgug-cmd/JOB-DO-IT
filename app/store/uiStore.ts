'use client';

import { create } from 'zustand';

interface UIStore {
  settingsOpen: boolean;
  feedbackOpen: boolean;
  shortcutsOpen: boolean;
  zoom: number;
  companyCode: string;
  openSettings: () => void;
  closeSettings: () => void;
  openFeedback: () => void;
  closeFeedback: () => void;
  openShortcuts: () => void;
  closeShortcuts: () => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setCompanyCode: (code: string) => void;
  initializeFromStorage: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  settingsOpen: false,
  feedbackOpen: false,
  shortcutsOpen: false,
  zoom: 100,
  companyCode: typeof window !== 'undefined' ? localStorage.getItem('companyCode') || '' : '',
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
  openFeedback: () => set({ feedbackOpen: true }),
  closeFeedback: () => set({ feedbackOpen: false }),
  openShortcuts: () => set({ shortcutsOpen: true }),
  closeShortcuts: () => set({ shortcutsOpen: false }),
  setZoom: (zoom: number) => set({ zoom: Math.max(50, Math.min(160, zoom)) }),
  zoomIn: () => set((state) => ({ zoom: Math.min(160, state.zoom + 10) })),
  zoomOut: () => set((state) => ({ zoom: Math.max(50, state.zoom - 10) })),
  setCompanyCode: (code: string) => set({ companyCode: code }),
  initializeFromStorage: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('companyCode') || '';
      set({ companyCode: stored });
    }
  },
}));
