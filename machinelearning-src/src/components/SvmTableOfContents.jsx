import { useEffect, useState } from 'react';
const SECTIONS = [
  ['margin', '1. Max-Margin Idea'], ['geometry', '2. Hyperplane Geometry'], ['hard-margin', '3. Hard Margin'],
  ['soft-margin', '4. Soft Margin'], ['hinge', '5. Hinge Loss'], ['dual', '6. Dual & Support Vectors'],
  ['kernels', '7. Kernel Trick'], ['rbf', '8. RBF Kernel'], ['multiclass', '9. Multiclass & Practice'],
  ['tuning', '10. Tuning & Limits'], ['references', 'References'],
].map(([id, label]) => ({ id, label }));
export default function SvmTableOfContents() {
  const [active, setActive] = useState('margin'); const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { const observers = SECTIONS.map(({ id }) => { const element = document.getElementById(id); if (!element) return null; const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setActive(id); }, { rootMargin: '-20% 0px -70% 0px' }); observer.observe(element); return observer; }).filter(Boolean); return () => observers.forEach(observer => observer.disconnect()); }, []);
  const goTo = id => { setMobileOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); };
  return <><button className="toc-mobile-toggle" onClick={() => setMobileOpen(open => !open)} aria-label="Toggle table of contents">{mobileOpen ? '✕ Close' : '☰ Contents'}</button><nav className={`ns-toc${mobileOpen ? ' mobile-open' : ''}`}><div className="toc-title">Contents</div>{SECTIONS.map(({ id, label }) => <button key={id} className={`toc-link${active === id ? ' active' : ''}`} onClick={() => goTo(id)}>{label}</button>)}</nav></>;
}
