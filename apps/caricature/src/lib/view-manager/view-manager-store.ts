import { create } from "zustand";
import { getInitialAppId, type AppId } from "../apps";

export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  acceptsCommunications: boolean;
}

interface ViewState {
  currentView: string | null;
  viewHistory: string[];
  activeApp: AppId;
  setView: (viewId: string) => void;
  setActiveApp: (appId: AppId) => void;
  goBack: () => void;
  capturedImage: string | null;
  generatedImages: string[];
  selectedImage: string | null;
  contactFormData: ContactFormData | null;
  setCapturedImage: (img: string) => void;
  setGeneratedImages: (images: string[]) => void;
  setSelectedImage: (img: string) => void;
  setContactFormData: (data: ContactFormData) => void;
  clearContactFormData: () => void;
  clearCapturedImage: () => void;
  clearExperience: () => void;
}

const useViewStore = create<ViewState>((set) => ({
  currentView: null,
  viewHistory: [],
  activeApp: getInitialAppId(),
  capturedImage: null,
  generatedImages: [],
  selectedImage: null,
  contactFormData: null,

  setView: (viewId) =>
    set((state) => {
      const newViewHistory = [...state.viewHistory, viewId];

      return {
        currentView: viewId,
        viewHistory: newViewHistory,
      };
    }),

  setActiveApp: (appId) => set({ activeApp: appId }),

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

  setContactFormData: (data) => set({ contactFormData: data }),

  clearContactFormData: () => set({ contactFormData: null }),

  clearCapturedImage: () => set({ capturedImage: null }),

  clearExperience: () =>
    set({
      capturedImage: null,
      generatedImages: [],
      selectedImage: null,
      contactFormData: null,
    }),
}));

export default useViewStore;
