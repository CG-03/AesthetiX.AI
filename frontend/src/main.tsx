import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// import App from './App.tsx'; // Original Vastu AI app — preserved for reference
import AuraApp from './ProjectAura/AuraApp';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuraApp />
  </StrictMode>,
);
