import { createContext, useContext } from "react";

export const AppContext = createContext(null);
export const ToastContext = createContext(null);
export const MealContext = createContext(null);
export const AuthContext = createContext(null);

export const useApp = () => useContext(AppContext);
export const useToastCtx = () => useContext(ToastContext);
export const useMealCtx = () => useContext(MealContext);
export const useAuth = () => useContext(AuthContext);
