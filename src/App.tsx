import { Contact } from './components/Contact/Contact.tsx';
import { GitLogTimeline } from './components/GitLogTimeline/GitLogTimeline.tsx';
import { Hero } from './components/Hero/Hero.tsx';
import { Neofetch } from './components/Neofetch/Neofetch.tsx';
import { Projects } from './components/Projects/Projects.tsx';
import { SiteFooter } from './components/SiteFooter/SiteFooter.tsx';
import { sectionIds } from './components/sections.ts';
import { SiteHeader } from './components/SiteHeader/SiteHeader.tsx';

import { ActiveSectionContext } from './hooks/ActiveSectionContext.ts';
import { useActiveSection } from './hooks/useActiveSection.ts';
import { TerminalLauncher } from './terminal/TerminalLauncher.tsx';
import styles from './App.module.css';

export default function App() {
  const active = useActiveSection(sectionIds);
  return (
    <TerminalLauncher>
      <a className="skip-link" href="#main">
        skip to content
      </a>
      <ActiveSectionContext value={active}>
        <SiteHeader />
        <main id="main" tabIndex={-1}>
          <Hero />
          <Projects />
          <div className={styles.split}>
            <GitLogTimeline />
            <Neofetch />
          </div>
          <Contact />
        </main>
      </ActiveSectionContext>
      <SiteFooter />
    </TerminalLauncher>
  );
}
