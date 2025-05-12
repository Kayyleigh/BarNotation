import React from "react";
import { MathCanvas } from "./components/MathCanvas";

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Actuarial Math Editor</h1>
      <MathCanvas />
    </div>
  );
};

export default App;
