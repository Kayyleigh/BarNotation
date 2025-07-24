import { createContext } from "react";

export const LatexRefreshContext = createContext<number>(0);
export const LatexRefreshSetterContext = createContext<() => void>(() => {});
