import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'rare-events', label: '1. Rare Events' },
  { id: 'accuracy-trap', label: '2. Accuracy Trap' },
  { id: 'metrics', label: '3. Useful Metrics' },
  { id: 'resampling', label: '4. Resampling' },
  { id: 'undersampling', label: '5. Undersampling' },
  { id: 'smote', label: '6. Oversampling & SMOTE' },
  { id: 'costs', label: '7. Error Costs' },
  { id: 'weighted-loss', label: '8. Weighted Loss' },
  { id: 'workflow', label: '9. Safe Workflow' },
  { id: 'practice', label: '10. Decision Guide' },
  { id: 'references', label: 'References' },
];

export default function HandlingImbalancedDataTableOfContents() {
  const [active, setActive] = useState('rare-events');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const observers = SECTIONS.map(({ id }) => {
      const element = document.getElementById(id);
      if (!element) return null;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: '-20% 0px -70% 0px' },
      );
      observer.observe(element);
      return observer;
    }).filter(Boolean);
    return () => observers.forEach(observer => observer.disconnect());
  }, []);

  const goTo = (id) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <button className="toc-mobile-toggle" onClick={() => setMobileOpen(open => !open)} aria-label="Toggle table of contents">
        {mobileOpen ? '✕ Close' : '☰ Contents'}
      </button>
      <nav className={`ns-toc${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="toc-title">Contents</div>
        {SECTIONS.map(({ id, label }) => (
          <button key={id} className={`toc-link${active === id ? ' active' : ''}`} onClick={() => goTo(id)}>{label}</button>
        ))}
      </nav>
    </>
  );
}
