import { create } from "zustand";

interface ViewState {
  currentView: string | null;
  viewHistory: string[];
  setView: (viewId: string) => void;
  goBack: () => void;
  capturedImage: string | null;
  generatedImages: string[];
  selectedImage: string | null;
  setCapturedImage: (img: string) => void;
  setGeneratedImages: (images: string[]) => void;
  setSelectedImage: (img: string) => void;
  clearCapturedImage: () => void;
}

const useViewStore = create<ViewState>((set) => ({
  currentView: null,
  viewHistory: [],
  capturedImage: null,
  generatedImages: [],
  selectedImage: null,

  setView: (viewId) =>
    set((state) => {
      const newViewHistory = [...state.viewHistory, viewId];

      return {
        currentView: viewId,
        viewHistory: newViewHistory,
      };
    }),

  goBack: () =>
    set((state) => {
      if (state.viewHistory.length < 2) {
        return { currentView: null };
      }

      const newViewHistory = state.viewHistory.slice(0, -1);
      const previousView = newViewHistory[newViewHistory.length - 1];

      return {
        currentView: previousView,
        viewHistory: newViewHistory,
      };
    }),

  setCapturedImage: (img) => set({ capturedImage: img }),

  setGeneratedImages: (images) => set({ generatedImages: images }),

  setSelectedImage: (img) => set({ selectedImage: img }),

  clearCapturedImage: () => set({ capturedImage: null }),
}));

export default useViewStore;
