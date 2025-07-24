import { useContext } from "react";
import { LatexRefreshContext, LatexRefreshSetterContext } from "./LatexRefreshContext";

export const useLatexRefreshSignal = () => useContext(LatexRefreshContext);
export const useTriggerLatexRefresh = () => useContext(LatexRefreshSetterContext);
