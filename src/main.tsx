// Apply theme before React renders to avoid flash
const savedTheme = localStorage.getItem("mathEditorTheme");
if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { I18nProvider } from './i18n/I18nProvider.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
);
