import { create } from 'zustand';

interface CommandPaletteState {
  isOpen: boolean;
  searchQuery: string;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setSearchQuery: (query: string) => void;
  reset: () => void;
}

export const useCommandPaletteStore = create<CommandPaletteState>((set) => ({
  isOpen: false,
  searchQuery: '',
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, searchQuery: '' }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen, searchQuery: state.isOpen ? '' : state.searchQuery })),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  reset: () => set({ isOpen: false, searchQuery: '' }),
}));
