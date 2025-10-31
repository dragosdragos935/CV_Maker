"use client";
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

const emptyResume = () => ({
  id: uuidv4(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  company: "",
  recipients: [],
  jobTitle: "",
  jobDescription: "",
  jobUrl: "",
  cvLanguage: "ro",
  name: "",
  role: "",
  professionalSummary: "",
  contact: { email: "", phone: "", location: "", linkedin: "", website: "", github: "" },
  workExperience: [],
  academicHistory: [],
  certifications: [],
  skills: [],
  driverLicense: "",
  languages: [],
  other: "",
});

export const useResumeStore = create((set) => ({
  resume: emptyResume(),
  setField: (key, value) =>
    set((state) => ({
      resume: { ...state.resume, [key]: value, updatedAt: new Date().toISOString() },
    })),
  setResume: (resumeData) =>
    set(() => ({
      resume: { ...resumeData, updatedAt: new Date().toISOString() },
    })),
  updateTimestamp: () =>
    set((state) => ({
      resume: { ...state.resume, updatedAt: new Date().toISOString() },
    })),
  reset: () => set(() => ({ resume: emptyResume() })),
}));


