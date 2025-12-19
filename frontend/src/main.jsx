import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import { AppProvider } from "./Context/Context.jsx";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary.jsx";

// GLOBAL 404 ERROR HANDLER - Catches ALL failed resource loads
window.addEventListener('error', (event) => {
  const target = event.target;
  const isResourceError = target && (target.tagName === 'IMG' || target.tagName === 'LINK' || target.tagName === 'SCRIPT' || target.tagName === 'IFRAME');
  
  if (isResourceError || event.message.includes('404') || event.message.includes('Failed to load')) {
    console.error('🚨 ========== 404 RESOURCE ERROR DETECTED ==========');
    console.error('🚨 Timestamp:', new Date().toISOString());
    console.error('🚨 Error Message:', event.message);
    console.error('🚨 Failed URL:', target?.src || target?.href || event.filename || 'UNKNOWN');
    console.error('🚨 Resource Type:', target?.tagName || 'UNKNOWN');
    console.error('🚨 Current Page:', window.location.href);
    console.error('🚨 Element:', target);
    console.error('🚨 Element ID:', target?.id || 'NO_ID');
    console.error('🚨 Element Class:', target?.className || 'NO_CLASS');
    console.error('🚨 Full Error Event:', event);
    console.error('🚨 Error Object:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      type: event.type,
      target: target
    });
    console.error('🚨 ================================================');
  }
}, true);

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 ========== UNHANDLED PROMISE REJECTION ==========');
  console.error('🚨 Reason:', event.reason);
  console.error('🚨 Promise:', event.promise);
  console.error('🚨 ================================================');
});

createRoot(document.getElementById('root')).render(
   <BrowserRouter>
      <ErrorBoundary>
        <AppProvider><App /></AppProvider>
      </ErrorBoundary>
   </BrowserRouter>
)
