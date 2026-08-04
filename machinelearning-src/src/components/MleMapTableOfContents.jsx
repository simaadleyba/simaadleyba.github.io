import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'density', label: '1. Density Estimation' },
  { id: 'bernoulli-mle', label: '2. Bernoulli MLE' },
  { id: 'log-likelihood', label: '3. Log-Likelihood' },
  { id: 'sample-complexity', label: '4. How Much Data?' },
  { id: 'gaussian', label: '5. Gaussian MLE' },
  { id: 'bayes', label: '6. Bayesian Updating' },
  { id: 'map', label: '7. MAP Estimation' },
  { id: 'beta', label: '8. Beta Conjugate Prior' },
  { id: 'comparison', label: '9. MLE vs MAP' },
  { id: 'references', label: 'References' },
];

export default function MleMapTableOfContents() {
  const [active, setActive] = useState('density');
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
