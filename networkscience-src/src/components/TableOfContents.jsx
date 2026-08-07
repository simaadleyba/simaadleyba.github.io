import { useState, useEffect } from 'react';

const SECTIONS = [
  { id: 'network-properties', label: '1. Network Properties' },
  { id: 'degree-distribution', label: '2. Degree Distribution' },
  { id: 'paths', label: '3. Paths' },
  { id: 'connectivity', label: '4. Connectivity' },
  { id: 'random-networks', label: '5. Random Networks' },
  { id: 'distances', label: '6. Distances' },
  { id: 'centrality', label: '7. Centrality Measures' },
  { id: 'assortativity', label: '8. Assortativity' },
  { id: 'bethe-lattice', label: '9. Bethe Lattice' },
  { id: 'power-law', label: '10. Power Law Distribution' },
  { id: 'ba-model', label: '11. Barabási–Albert Model' },
  { id: 'degree-correlations', label: '12. Degree Correlations' },
  { id: 'scale-free-property', label: '13. Scale-Free Property' },
  { id: 'measuring-power-laws', label: '14. Measuring Power Laws' },
  { id: 'fitness-model', label: '15. Fitness & BB Model' },
  { id: 'robustness', label: '16. Robustness & Percolation' },
  { id: 'critical-exponents', label: '17. Critical Exponents & FSS' },
  { id: 'community-detection', label: '18. Community Detection' },
  { id: 'epidemic-models', label: '19. Epidemic Models' },
  { id: 'social-contagion', label: '20. Social Contagion' },
  { id: 'spectral-graph', label: '21. Spectral Graph Theory' },
  { id: 'tda', label: '22. Topological Data Analysis' },
  { id: 'references', label: 'References' },
];

export default function TableOfContents() {
  const [active, setActive] = useState('network-properties');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const observers = [];
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
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
      {/* Mobile toggle */}
      <button
        className="toc-mobile-toggle"
        onClick={() => setMobileOpen(v => !v)}
        aria-label="Toggle table of contents"
      >
        {mobileOpen ? '✕ Close' : '☰ Contents'}
      </button>

      {/* TOC list */}
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
