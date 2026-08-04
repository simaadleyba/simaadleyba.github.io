import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'incomplete', label: '1. Incomplete Data' },
  { id: 'mechanisms', label: '2. Missingness' },
  { id: 'encoding', label: '3. Detect & Encode' },
  { id: 'deletion', label: '4. Deletion' },
  { id: 'simple-imputation', label: '5. Simple Imputation' },
  { id: 'knn-imputation', label: '6. KNN Imputation' },
  { id: 'native', label: '7. Native Handling' },
  { id: 'pipeline', label: '8. Train & Predict' },
  { id: 'pitfalls', label: '9. Pitfalls' },
  { id: 'practice', label: '10. Decision Guide' },
  { id: 'references', label: 'References' },
];

export default function HandlingMissingDataTableOfContents() {
  const [active, setActive] = useState('incomplete');
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
