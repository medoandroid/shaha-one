import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initFirebaseConfig } from './lib/firebase';

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('PWA ServiceWorker registration notice:', err);
    });
  });
}

void initFirebaseConfig()
  .catch((err) => {
    console.warn('Firebase runtime config notice:', err);
  })
  .finally(() => {
    createRoot(document.getElementById('root')!).render(<App />);
  });
