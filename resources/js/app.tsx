import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance'; // Optional

const appName = import.meta.env.VITE_APP_NAME || 'CodeXP AI';

createInertiaApp({
  title: (title) => (title ? `${title} · ${appName}` : appName),
  resolve: (name) =>
    resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
  setup({ el, App, props }) {
    document.documentElement.classList.add('dark');

    createRoot(el).render(<App {...props} />);
  },
  progress: {
    color: '#29d',
  },
});

// Optional if using theme hooks
initializeTheme?.();
