import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'idea', label: '1. Why Ensembles?' },
  { id: 'voting', label: '2. Voting' },
  { id: 'bagging', label: '3. Bagging' },
  { id: 'variance', label: '4. Variance Reduction' },
  { id: 'forests', label: '5. Random Forests' },
  { id: 'oob', label: '6. Out-of-Bag' },
  { id: 'adaboost', label: '7. AdaBoost' },
  { id: 'gradient-boosting', label: '8. Gradient Boosting' },
  { id: 'stacking', label: '9. Stacking' },
  { id: 'practice', label: '10. Decision Guide' },
  { id: 'references', label: 'References' },
];

export default function EnsembleLearningTableOfContents() {
  const [active, setActive] = useState('idea');
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const observers = SECTIONS.map(({ id }) => {
      const element = document.getElementById(id);
      if (!element) return null;
      const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setActive(id); }, { rootMargin: '-20% 0px -70% 0px' });
      observer.observe(element);
      return observer;
    }).filter(Boolean);
    return () => observers.forEach(observer => observer.disconnect());
  }, []);
  const goTo = id => { setMobileOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };
  return <><button className="toc-mobile-toggle" onClick={() => setMobileOpen(open => !open)} aria-label="Toggle table of contents">{mobileOpen ? '✕ Close' : '☰ Contents'}</button><nav className={`ns-toc${mobileOpen ? ' mobile-open' : ''}`}><div className="toc-title">Contents</div>{SECTIONS.map(({ id, label }) => <button key={id} className={`toc-link${active === id ? ' active' : ''}`} onClick={() => goTo(id)}>{label}</button>)}</nav></>;
}
