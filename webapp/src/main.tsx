import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Required for the Routes in App.tsx to work
import App from './App';
import './index.css'; // Importing global base styles
import { I18nProvider } from './i18n/Provider'; // Importing the I18nProvider

// Finding the root element in your index.html
const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter> {/* Wrapping the app in a Router for navigation */}
        <I18nProvider> {/* Wrapping the app with I18nProvider for internationalization */}
          <App />
        </I18nProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  // Helpful error if the 'root' div is missing in index.html
  console.error("Could not find root element.");
}