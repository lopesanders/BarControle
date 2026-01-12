import React from 'https://esm.sh/react@19.0.0';
import ReactDOM from 'https://esm.sh/react-dom@19.0.0/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  const loader = document.getElementById('loading-screen');
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }, 300);
  }
} catch (error) {
  console.error("Erro fatal ao renderizar App:", error);
  const rootDiv = document.getElementById('root');
  if (rootDiv) {
    rootDiv.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;">
      <h2>Erro ao carregar o App</h2>
      <p>${error instanceof Error ? error.message : 'Erro desconhecido'}</p>
      <button onclick="window.location.reload()" style="padding: 10px; background: #0066ff; color: white; border: none; border-radius: 8px;">Tentar Novamente</button>
    </div>`;
  }
}