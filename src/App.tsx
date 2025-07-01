import React from "react";
import './styles/themes.css'
import MainLayout from "./components/layout/MainLayout";
import { ToastProvider } from "./components/common/ToastProvider";

const App: React.FC = () => (
  <ToastProvider>
    <MainLayout />
  </ToastProvider>
);

export default App;
