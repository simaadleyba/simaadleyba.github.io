import { useState } from 'react';
import './styles/global.css';

const TOPICS = [
  { num: '01', name: 'k-Nearest Neighbors', href: '/machinelearning/knn/' },
  { num: '02', name: 'Decision Trees', href: '/machinelearning/decisiontrees/' },
  { num: '03', name: 'Evaluation Metrics', href: '/machinelearning/evaluationmetrics/' },
  { num: '04', name: 'Model Evaluation', href: '/machinelearning/modelevaluation/' },
  { num: '05', name: 'MLE & MAP', href: '/machinelearning/mlemap/' },
  { num: '06', name: 'Naive Bayes', href: '/machinelearning/naivebayes/' },
  { num: '07', name: 'Logistic Regression', href: '/machinelearning/logisticregression/' },
  { num: '08', name: 'Linear Regression', href: '/machinelearning/linearregression/' },
  { num: '09', name: 'Handling Imbalanced Data', href: '/machinelearning/handlingimbalanceddata/' },
  { num: '10', name: 'Handling Missing Data', href: '/machinelearning/handlingmissingdata/' },
  { num: '11', name: 'Ensemble Learning', href: '/machinelearning/ensemblelearning/' },
  { num: '12', name: 'SVM', href: '/machinelearning/svm/' },
  { num: '13', name: 'Clustering', href: '/machinelearning/clustering/' },
  { num: '14', name: 'Spectral Clustering', href: '/machinelearning/spectralclustering/' },
  { num: '15', name: 'PCA', href: '/machinelearning/pca/' },
  { num: '16', name: 'Neural Networks', href: '/machinelearning/neuralnetworks/' },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="ns-nav">
      <a className="nav-mark" href="/"><span className="dot"></span></a>
      <button
        className="ns-nav-burger"
        aria-label="Toggle menu"
        onClick={() => setMenuOpen(o => !o)}
      >
        ☰
      </button>
      <div className={`ns-nav-links${menuOpen ? ' mobile-open' : ''}`}>
        <a href="/#about" onClick={() => setMenuOpen(false)}>about</a>
        <a href="/#research" onClick={() => setMenuOpen(false)}>research</a>
        <a href="/#experience" onClick={() => setMenuOpen(false)}>experience</a>
        <a href="/#education" onClick={() => setMenuOpen(false)}>education</a>
        <a href="/#studyguides" onClick={() => setMenuOpen(false)}>study guides</a>
        <a href="/#beyond" onClick={() => setMenuOpen(false)}>beyond</a>
        <a href="/" target="_blank" rel="noopener" onClick={() => setMenuOpen(false)}>cv</a>
        <span className="nav-pipe">|</span>
        <a href="https://kimchikorelileriniskembesidir.com" className="field-notes" target="_blank" rel="noopener" onClick={() => setMenuOpen(false)}>personal blog</a>
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
        </p>

        <div className="ml-topic-grid">
          {TOPICS.map(({ num, name, href }) => (
              <a key={num} href={href} className="ml-topic-card">
                <div className="ml-topic-num">{num}</div>
                <div className="ml-topic-name">{name}</div>
              </a>
          ))}
        </div>
      </div>

      <footer className="footer">
        <div className="footer-bg" aria-hidden="true"></div>
        <div className="footer-inner">
          <div className="footer-left">
            <p className="footer-email">adleyba [at] sabanciuniv [dot] edu</p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.78rem", opacity: 0.6, fontFamily: "var(--ff-mono)" }}>
              Machine Learning Study Guide · Built with React + KaTeX
            </p>
          </div>
          <p className="footer-copy">© 2026 — SIMA ADLEYBA</p>
        </div>
      </footer>
    </div>
  );
}
