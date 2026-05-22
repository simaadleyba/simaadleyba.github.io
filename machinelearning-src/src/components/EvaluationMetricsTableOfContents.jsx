import { useState, useEffect } from 'react';

const SECTIONS = [
  { id: 'setup', label: '1. Binary Classification Setup' },
  { id: 'confusion-matrix', label: '2. Confusion Matrix' },
  { id: 'point-metrics', label: '3. Point Metrics' },
  { id: 'threshold-tradeoff', label: '4. Threshold & PR Tradeoff' },
  { id: 'roc-curve', label: '5. ROC Curve & AUC' },
  { id: 'pr-curve', label: '6. Precision-Recall Curve' },
  { id: 'multiclass', label: '7. Multi-Class Averaging' },
  { id: 'regression-metrics', label: '8. Regression Metrics' },
  { id: 'domain-metrics', label: '9. Domain-Specific Metrics' },
  { id: 'metrics-practice', label: '10. Metrics in Practice' },
  { id: 'references', label: 'References' },
];

export default function EvaluationMetricsTableOfContents() {
  const [active, setActive] = useState('setup');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const observers = [];
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: '-20% 0px -70% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const handleClick = (id) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <button
        className="toc-mobile-toggle"
        onClick={() => setMobileOpen(v => !v)}
        aria-label="Toggle table of contents"
      >
        {mobileOpen ? '✕ Close' : '☰ Contents'}
      </button>
      <nav className={`ns-toc ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="toc-title">Contents</div>
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            className={`toc-link ${active === id ? 'active' : ''}`}
            onClick={() => handleClick(id)}
          >
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}
