import React, { useState, type ReactNode } from "react";
import { LatexRefreshContext, LatexRefreshSetterContext } from "./LatexRefreshContext";

interface Props {
  children: ReactNode;
}

export const LatexRefreshProvider: React.FC<Props> = ({ children }) => {
  const [signal, setSignal] = useState(0);
  const trigger = () => setSignal(prev => prev + 1);

  return (
    <LatexRefreshContext.Provider value={signal}>
      <LatexRefreshSetterContext.Provider value={trigger}>
        {children}
      </LatexRefreshSetterContext.Provider>
    </LatexRefreshContext.Provider>
  );
};
