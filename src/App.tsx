import { Contact } from './components/Contact/Contact.tsx';
import { GitLogTimeline } from './components/GitLogTimeline/GitLogTimeline.tsx';
import { Hero } from './components/Hero/Hero.tsx';
import { Neofetch } from './components/Neofetch/Neofetch.tsx';
import { ProcessList } from './components/ProcessList/ProcessList.tsx';
import { SiteFooter } from './components/SiteFooter/SiteFooter.tsx';
import { SiteHeader } from './components/SiteHeader/SiteHeader.tsx';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <Hero />
        <ProcessList />
        <GitLogTimeline />
        <Neofetch />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
