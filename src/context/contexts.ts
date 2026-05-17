import { createContext, useContext } from "react";
import type { User } from "firebase/auth";

export interface AppContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
}

export interface ToastContextType {
  show: (message: string, duration?: number) => void;
}

export interface MealContextType {
  context: {
    mealType: string | null;
    madeByType: string;
    orderType: string;
  };
  setContext: (partial: Record<string, unknown>) => void;
  resetContext: () => void;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
}

export const AppContext = createContext<AppContextType | null>(null);
export const ToastContext = createContext<ToastContextType | null>(null);
export const MealContext = createContext<MealContextType | null>(null);
export const AuthContext = createContext<AuthContextType | null>(null);

export const useApp = () => useContext(AppContext);
export const useToastCtx = () => useContext(ToastContext);
export const useMealCtx = () => useContext(MealContext);
export const useAuth = () => useContext(AuthContext);
