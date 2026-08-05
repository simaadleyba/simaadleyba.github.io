import { useEffect, useState } from 'react';
const SECTIONS = [
  ['setup', '1. Clustering Setup'], ['kmeans', '2. K-Means'], ['initialization', '3. Initialization'],
  ['choose-k', '4. Choosing k'], ['limits', '5. K-Means Limits'], ['kernel', '6. Kernel K-Means'],
  ['hierarchical', '7. Hierarchical'], ['linkage', '8. Linkage & Cuts'], ['dbscan', '9. DBSCAN'],
  ['practice', '10. Decision Guide'], ['references', 'References'],
].map(([id, label]) => ({ id, label }));
export default function ClusteringTableOfContents() {
  const [active, setActive] = useState('setup'); const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { const observers = SECTIONS.map(({ id }) => { const element = document.getElementById(id); if (!element) return null; const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setActive(id); }, { rootMargin: '-20% 0px -70% 0px' }); observer.observe(element); return observer; }).filter(Boolean); return () => observers.forEach(observer => observer.disconnect()); }, []);
  const goTo = id => { setMobileOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };
  return <><button className="toc-mobile-toggle" onClick={() => setMobileOpen(open => !open)} aria-label="Toggle table of contents">{mobileOpen ? '✕ Close' : '☰ Contents'}</button><nav className={`ns-toc${mobileOpen ? ' mobile-open' : ''}`}><div className="toc-title">Contents</div>{SECTIONS.map(({ id, label }) => <button key={id} className={`toc-link${active === id ? ' active' : ''}`} onClick={() => goTo(id)}>{label}</button>)}</nav></>;
}
