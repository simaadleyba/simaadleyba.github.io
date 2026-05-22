import { useState, useEffect } from 'react';

const SECTIONS = [
  { id: 'what-is', label: '1. What is a Decision Tree?' },
  { id: 'decision-boundaries', label: '2. Decision Boundaries' },
  { id: 'learning-algorithm', label: '3. The Learning Algorithm' },
  { id: 'impurity-measures', label: '4. Impurity Measures' },
  { id: 'split-structure', label: '5. Split Structure' },
  { id: 'overfitting-pruning', label: '6. Overfitting & Pruning' },
  { id: 'regression', label: '7. Regression Trees' },
  { id: 'advantages-disadvantages', label: '8. Advantages & Disadvantages' },
  { id: 'references', label: 'References' },
];

export default function DecisionTreesTableOfContents() {
  const [active, setActive] = useState('what-is');
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
