import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

try {
  const desc = Object.getOwnPropertyDescriptor(window, 'fetch');
  if (desc && desc.configurable && !desc.writable && !desc.set) {
    let currentFetch = desc.get ? desc.get.call(window) : window.fetch;
    Object.defineProperty(window, 'fetch', {
      configurable: true,
      enumerable: true,
      get() {
        return currentFetch;
      },
      set(fn) {
        if (typeof fn === 'function') {
          currentFetch = fn;
        }
      },
    });
  }
} catch {
  // Ignore if descriptor is non-configurable
}

createRoot(document.getElementById('root')!).render(<App />);

