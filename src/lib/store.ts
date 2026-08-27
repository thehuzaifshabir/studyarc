import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import { User as AppUser } from '../types';

interface AuthState {
  user: FirebaseUser | null;
  appUser: AppUser | null;
  isLoading: boolean;
  setUser: (user: FirebaseUser | null) => void;
  setAppUser: (appUser: AppUser | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  appUser: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setAppUser: (appUser) => set({ appUser }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
