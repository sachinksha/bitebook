import { createContext, useContext } from "react";

export const AppCtx = createContext(null);
export const ToastCtx = createContext(null);
export const useApp = () => useContext(AppCtx);
export const useToastCtx = () => useContext(ToastCtx);
