import { useState, useEffect } from 'react';

const SECTIONS = [
  { id: 'nn-1', label: '1. 1-NN Classifier' },
  { id: 'knn-classification', label: '2. k-NN Classification' },
  { id: 'knn-regression', label: '3. k-NN Regression' },
  { id: 'probabilistic-view', label: '4. Probabilistic View' },
  { id: 'effect-of-k', label: '5. Effect of k' },
  { id: 'distance-measures', label: '6. Distance Measures' },
  { id: 'feature-scaling', label: '7. Feature Scaling' },
  { id: 'voting-mechanisms', label: '8. Voting Mechanisms' },
  { id: 'curse-of-dimensionality', label: '9. Curse of Dimensionality' },
  { id: 'practical-considerations', label: '10. Practical Considerations' },
  { id: 'references', label: 'References' },
];

export default function KnnTableOfContents() {
  const [active, setActive] = useState('nn-1');
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
