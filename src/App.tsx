import React from "react";
import MathEditor from "./components/MathEditor";
import "./styles/math.css";
import "./styles/styles.css";

const App: React.FC = () => (
  <div>
    <h1>Math Notation Editor</h1>
    <MathEditor />
  </div>
);

export default App;
