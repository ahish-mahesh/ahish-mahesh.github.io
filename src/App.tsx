import { Contact } from './components/Contact/Contact.tsx';
import { GitLogTimeline } from './components/GitLogTimeline/GitLogTimeline.tsx';
import { Hero } from './components/Hero/Hero.tsx';
import { Neofetch } from './components/Neofetch/Neofetch.tsx';
import { ProcessList } from './components/ProcessList/ProcessList.tsx';
import { SiteFooter } from './components/SiteFooter/SiteFooter.tsx';
import { sectionIds } from './components/sections.ts';
import { SiteHeader } from './components/SiteHeader/SiteHeader.tsx';

import { ActiveSectionContext } from './hooks/ActiveSectionContext.ts';
import { useActiveSection } from './hooks/useActiveSection.ts';

export default function App() {
  const active = useActiveSection(sectionIds);
  return (
    <>
      <a className="skip-link" href="#main">
        skip to content
      </a>
      <ActiveSectionContext value={active}>
        <SiteHeader />
        <main id="main" tabIndex={-1}>
          <Hero />
          <ProcessList />
          <GitLogTimeline />
          <Neofetch />
          <Contact />
        </main>
      </ActiveSectionContext>
      <SiteFooter />
    </>
  );
}
