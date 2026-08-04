import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'setup', label: '1. Regression Setup' },
  { id: 'residuals', label: '2. Models & Residuals' },
  { id: 'ols', label: '3. Least Squares' },
  { id: 'normal-equation', label: '4. Normal Equation' },
  { id: 'gradient-descent', label: '5. Gradient Descent' },
  { id: 'mle', label: '6. Gaussian MLE' },
  { id: 'collinearity', label: '7. Collinearity' },
  { id: 'basis', label: '8. Basis Functions' },
  { id: 'regularization', label: '9. Regularization' },
  { id: 'practice', label: '10. Practice & Limits' },
  { id: 'references', label: 'References' },
];

export default function LinearRegressionTableOfContents() {
  const [active, setActive] = useState('setup');
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
