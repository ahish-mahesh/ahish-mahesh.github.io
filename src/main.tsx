import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import './theme/tokens.css';
import './styles/global.css';
import './theme/crt.css';
import App from './App.tsx';
import { ThemeProvider } from './theme/ThemeProvider.tsx';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing #root element');
}

// LazyMotion + `m.*` keeps Motion's initial cost small; `strict` throws on a stray `motion.*`.
createRoot(root).render(
  <StrictMode>
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </MotionConfig>
    </LazyMotion>
  </StrictMode>,
);
