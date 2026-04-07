import { useState } from 'react';
import './styles/global.css';

const TOPICS = [
  { num: '01', name: 'k-Nearest Neighbors', href: '/machinelearning/knn/', ready: true },
  { num: '02', name: 'Decision Trees', href: null },
  { num: '03', name: 'Evaluation Metrics', href: null },
  { num: '04', name: 'Model Evaluation', href: null },
  { num: '05', name: 'MLE & MAP', href: null },
  { num: '06', name: 'Naive Bayes', href: null },
  { num: '07', name: 'Logistic Regression', href: null },
  { num: '08', name: 'Linear Regression', href: null },
  { num: '09', name: 'Handling Imbalanced Data', href: null },
  { num: '10', name: 'Handling Missing Data', href: null },
  { num: '11', name: 'Ensemble Learning', href: null },
  { num: '12', name: 'SVM', href: null },
  { num: '13', name: 'Clustering', href: null },
  { num: '14', name: 'Spectral Clustering', href: null },
  { num: '15', name: 'PCA', href: null },
  { num: '16', name: 'Neural Networks', href: null },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="ns-nav">
      <button className="ns-nav-burger" aria-label="Toggle menu" onClick={() => setMenuOpen(o => !o)}>
        ☰
      </button>
      <div className={`ns-nav-links${menuOpen ? ' mobile-open' : ''}`}>
        <a href="/" onClick={() => setMenuOpen(false)}>about</a>
        <a href="/#research" onClick={() => setMenuOpen(false)}>research</a>
        <a href="/#experience" onClick={() => setMenuOpen(false)}>experience</a>
        <a href="/#education" onClick={() => setMenuOpen(false)}>education</a>
        <a href="/#beyond" onClick={() => setMenuOpen(false)}>beyond</a>
        <a href="/#" onClick={() => setMenuOpen(false)}>cv</a>
      </div>
    </nav>
  );
}

export default function HubApp() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      <header className="ns-header">
        <div className="container">
          <div className="ns-title">Machine Learning</div>
          <div className="ns-subtitle">
            Interactive study guide with visualizations, formulas, and interactive demos.
          </div>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          Each topic is a self-contained page with derivations, formula cards, and interactive visualizations.
          Topics marked <span style={{ background: 'var(--accent-bg)', color: 'var(--accent)', borderRadius: 4, padding: '0.05rem 0.4rem', fontSize: '0.75rem', fontWeight: 600 }}>available</span> are ready to read.
        </p>

        <div className="ml-topic-grid">
          {TOPICS.map(({ num, name, href, ready }) => {
            const inner = (
              <>
                <div className="ml-topic-num">{num}</div>
                <div className="ml-topic-name">{name}</div>
                <div className={`ml-topic-badge${ready ? '' : ' soon'}`}>
                  {ready ? 'available' : 'coming soon'}
                </div>
              </>
            );
            return ready ? (
              <a key={num} href={href} className="ml-topic-card">
                {inner}
              </a>
            ) : (
              <div key={num} className="ml-topic-card coming-soon">
                {inner}
              </div>
            );
          })}
        </div>
      </div>

      <footer style={{ padding: '1.8rem 0', textAlign: 'center' }}>
        <div className="container">
          <p style={{ color: '#7B6FD6', fontWeight: 500, fontSize: '0.88rem', letterSpacing: '0.02em', margin: '0 0 0.3rem' }}>
            adleyba [at] sabanciuniv [dot] edu
          </p>
          <p style={{ color: '#a0a0a0', fontSize: '0.78rem', margin: '0 0 0.5rem' }}>
            Machine Learning Study Guide · Built with React + KaTeX
          </p>
          <a href="/" style={{ color: 'var(--accent)', fontSize: '0.78rem', fontFamily: 'monospace', textDecoration: 'none', opacity: 0.8 }}>
            back to portfolio
          </a>
        </div>
      </footer>
    </div>
  );
}
