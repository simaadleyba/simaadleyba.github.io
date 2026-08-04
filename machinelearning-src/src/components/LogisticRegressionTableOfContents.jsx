import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'discriminative', label: '1. Discriminative Model' },
  { id: 'linear-score', label: '2. Linear Scores' },
  { id: 'sigmoid', label: '3. Sigmoid & Probability' },
  { id: 'boundary', label: '4. Decision Boundary' },
  { id: 'likelihood', label: '5. Likelihood & Loss' },
  { id: 'optimization', label: '6. Gradient Descent' },
  { id: 'regularization', label: '7. Regularization' },
  { id: 'l1-l2', label: '8. L1 vs L2' },
  { id: 'softmax', label: '9. Multiclass Softmax' },
  { id: 'practice', label: '10. Practice & Limits' },
  { id: 'references', label: 'References' },
];

export default function LogisticRegressionTableOfContents() {
  const [active, setActive] = useState('discriminative');
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
