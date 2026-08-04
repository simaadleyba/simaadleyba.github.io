import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'models', label: '1. Models & Hyperparameters' },
  { id: 'generalization', label: '2. Generalization' },
  { id: 'complexity', label: '3. Model Complexity' },
  { id: 'holdout', label: '4. Three-Way Holdout' },
  { id: 'cross-validation', label: '5. Cross-Validation' },
  { id: 'special-splits', label: '6. Special Splitting' },
  { id: 'final-model', label: '7. Final Model & Baselines' },
  { id: 'leakage', label: '8. Leakage & Shortcuts' },
  { id: 'checklist', label: '9. Evaluation Checklist' },
  { id: 'references', label: 'References' },
];

export default function ModelEvaluationTableOfContents() {
  const [active, setActive] = useState('models');
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
      <button
        className="toc-mobile-toggle"
        onClick={() => setMobileOpen(open => !open)}
        aria-label="Toggle table of contents"
      >
        {mobileOpen ? '✕ Close' : '☰ Contents'}
      </button>
      <nav className={`ns-toc${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="toc-title">Contents</div>
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            className={`toc-link${active === id ? ' active' : ''}`}
            onClick={() => goTo(id)}
          >
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}
