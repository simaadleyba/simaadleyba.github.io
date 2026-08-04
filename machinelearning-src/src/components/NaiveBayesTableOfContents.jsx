import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'bayes-optimal', label: '1. Bayes Classifier' },
  { id: 'parameter-problem', label: '2. Parameter Explosion' },
  { id: 'assumption', label: '3. Naive Assumption' },
  { id: 'categorical', label: '4. Categorical NB' },
  { id: 'underflow', label: '5. Log-Space Scores' },
  { id: 'text', label: '6. Text Classification' },
  { id: 'smoothing', label: '7. Laplace Smoothing' },
  { id: 'gaussian', label: '8. Gaussian NB' },
  { id: 'missing', label: '9. Missing Values' },
  { id: 'practice', label: '10. Practice & Limits' },
  { id: 'references', label: 'References' },
];

export default function NaiveBayesTableOfContents() {
  const [active, setActive] = useState('bayes-optimal');
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
