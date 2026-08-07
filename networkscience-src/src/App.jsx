import { useState, lazy } from 'react';
import TableOfContents from './components/TableOfContents';
import FormulaCard from './components/FormulaCard';
import { K, KB } from './components/Katex';
import ArtifactWrapper from './components/ArtifactWrapper';
import DegreeCorrelationsSection from './sections/DegreeCorrelationsSection';
import ScaleFreePropertySection from './sections/ScaleFreePropertySection';
import MeasuringPowerLawsSection from './sections/MeasuringPowerLawsSection';
import FitnessModelSection from './sections/FitnessModelSection';
import RobustnessSection from './sections/RobustnessSection';
import CriticalExponentsSection from './sections/CriticalExponentsSection';
import CommunityDetectionSection from './sections/CommunityDetectionSection';
import EpidemicModelsSection from './sections/EpidemicModelsSection';
import SocialContagionSection from './sections/SocialContagionSection';
import SpectralGraphTheorySection from './sections/SpectralGraphTheorySection';
import TopologicalDataAnalysisSection from './sections/TopologicalDataAnalysisSection';
import './styles/global.css';

// Lazy-load artifacts
const CentralityExplorer = lazy(() => import('./artifacts/CentralityExplorer'));
const PathExplorer = lazy(() => import('./artifacts/PathExplorer'));
const ErdosRenyiPlayground = lazy(() => import('./artifacts/ErdosRenyiPlayground'));
const DegreeDistribution = lazy(() => import('./artifacts/DegreeDistribution'));
const BetheLattice = lazy(() => import('./artifacts/BetheLattice'));
const PowerLawExplorer = lazy(() => import('./artifacts/PowerLawExplorer'));
const BAGrowthSimulator = lazy(() => import('./artifacts/BAGrowthSimulator'));

// Navbar — matches main site design
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

export default function App() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      {/* ── Header ── */}
      <header className="ns-header">
        <div className="container">
          <div className="ns-title">Network Science</div>
          <div className="ns-subtitle">
            Interactive study guide with visualizations, formulas, and simulations — network properties, random graphs, scale-free networks, robustness and percolation, community detection, spreading phenomena, spectral graph theory, and topological data analysis.
          </div>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className="container">
        <div className="ns-layout">
          {/* Sidebar */}
          <aside className="ns-sidebar">
            <TableOfContents />
          </aside>

          {/* Content */}
          <main className="ns-content">

            {/* ── Section 1: Network Properties ── */}
            <section id="network-properties" className="ns-section">
              <h2>1. Network Properties</h2>

              <p>
                <strong>Degree</strong>: The number of connections (edges) incident to a node.
                For undirected graphs this is a single integer; for directed graphs we
                distinguish in-degree and out-degree.
              </p>
              <KB l="C_D(v) = \deg(v)" />

              <p>
                <strong>Strength</strong>: In weighted networks, the strength of a node is the
                sum of edge weights attached to it.
              </p>
              <KB l="s_i = \sum_j w_{ij}" />

              <p>
                <strong>Density</strong>: The fraction of existing ties over all possible edges,
                measuring how tightly knit a network is.
              </p>
              <KB l="\rho = \frac{L}{L_{\max}}" />

              <p>
                where <K l="L" /> is the number of edges and <K l="L_{\max}" /> depends on
                graph type:
              </p>
              <ul>
                <li>
                  Undirected: <K l="L_{\max} = \binom{N}{2} = \dfrac{N(N-1)}{2}" />
                </li>
                <li>
                  Directed: <K l="L_{\max} = N(N-1)" />
                </li>
              </ul>
            </section>

            {/* ── Section 2: Degree Distribution ── */}
            <section id="degree-distribution" className="ns-section">
              <h2>2. Degree Distribution</h2>

              <p>
                The degree distribution <K l="P(k)" /> gives the probability that a randomly
                chosen node has exactly <K l="k" /> edges. It is a fundamental fingerprint of
                a network's structure.
              </p>

              <h3>Power Law (Scale-Free Networks)</h3>
              <p>
                Many real-world networks (WWW, citation networks, metabolic networks) follow a
                power law: <K l="P(k) \sim k^{-\alpha}" /> with exponent <K l="2 < \alpha < 3" />.
              </p>
              <KB l="y = a \cdot x^{-\alpha}" />
              <p>Taking logarithms gives a linear relationship in log-log space:</p>
              <KB l="\log(y) = \log(a) - \alpha \cdot \log(x)" />
              <p>
                This linearity in log-log coordinates is the key empirical signature of a
                scale-free network. A straight line fit to the log-log degree histogram
                estimates <K l="\alpha" />.
              </p>
            </section>

            {/* ── Section 3: Paths ── */}
            <section id="paths" className="ns-section">
              <h2>3. Paths</h2>

              <p>
                A <strong>walk</strong> of length <K l="n" /> is a sequence of nodes where
                each consecutive pair is connected by an edge. A <strong>path</strong> is a
                walk with no repeated nodes.
              </p>
              <KB l="P_n = \{i_0, i_1, \dots, i_n\}" />

              <h3>Counting Paths via Adjacency Matrix</h3>
              <p>
                The adjacency matrix <K l="A" /> encodes connectivity. Powers of <K l="A" />{' '}
                count paths:
              </p>
              <ul>
                <li>
                  Length 1: <K l="A_{ij} = 1" /> iff <K l="i" /> and <K l="j" /> are adjacent
                </li>
                <li>
                  Length 2: <K l="(A^2)_{ij} = \sum_{k=1}^{N} A_{ik} A_{kj}" />
                </li>
                <li>
                  Length <K l="n" />: <K l="(A^n)_{ij}" /> counts all walks of length <K l="n" /> from <K l="i" /> to <K l="j" />
                </li>
              </ul>
              <p>Eigenvalue decomposition makes matrix powers efficient:</p>
              <KB l="A = D\Lambda D^{-1} \implies A^n = D\Lambda^n D^{-1}" />

              <h3>Path Types</h3>
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Definition</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Shortest path (geodesic)', 'Path with minimum length between two nodes'],
                    ['Diameter', 'Longest shortest path in the entire graph'],
                    ['Average path length', 'Mean of all pairwise shortest paths'],
                    ['Cycle', 'Closed path — same start and end node, no repeated edges'],
                    ['Eulerian path', 'Traverses each edge exactly once'],
                    ['Hamiltonian path', 'Visits each node exactly once'],
                  ].map(([type, def]) => (
                    <tr key={type}>
                      <td style={{ fontWeight: 600 }}>{type}</td>
                      <td>{def}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Path Explorer Artifact */}
              <ArtifactWrapper title="Interactive: Path Explorer">
                <PathExplorer />
              </ArtifactWrapper>
            </section>

            {/* ── Section 4: Connectivity ── */}
            <section id="connectivity" className="ns-section">
              <h2>4. Connectivity</h2>

              <p>
                A graph is <strong>connected</strong> if there is a path between every pair of
                nodes. For disconnected graphs, the adjacency matrix can be arranged in block
                diagonal form — each block corresponds to a connected component.
              </p>

              <h3>Directed Graphs</h3>
              <ul>
                <li>
                  <strong>Strongly connected</strong>: there is a directed path from every node
                  to every other node.
                </li>
                <li>
                  <strong>Weakly connected</strong>: the graph is connected when edge directions
                  are ignored.
                </li>
                <li>
                  <strong>Strongly Connected Component (SCC)</strong>: maximal subgraph that is
                  strongly connected.
                </li>
                <li>
                  <strong>In-component</strong>: set of nodes that can reach the SCC via directed
                  paths.
                </li>
                <li>
                  <strong>Out-component</strong>: set of nodes reachable from the SCC.
                </li>
              </ul>

              <p>
                Large directed networks (e.g., the WWW) typically have a "bow-tie" structure:
                a giant SCC flanked by in- and out-components, plus tendrils.
              </p>
            </section>

            {/* ── Section 5: Random Networks ── */}
            <section id="random-networks" className="ns-section">
              <h2>5. Random Network Models</h2>

              <p>
                <strong>Erdős–Rényi G(N, L)</strong>: start with <K l="N" /> nodes and place{' '}
                <K l="L" /> edges uniformly at random among all <K l="\binom{N}{2}" /> possible
                pairs.
              </p>
              <p>
                <strong>Gilbert G(N, p)</strong>: each potential edge exists independently with
                probability <K l="p" />. Equivalent to G(N, L) in expectation.
              </p>

              <h3>Number of Links</h3>
              <FormulaCard
                title="Link count distribution"
                latex="P(L) = \binom{\binom{N}{2}}{L} \cdot p^L \cdot (1-p)^{\binom{N}{2} - L}"
                terms={[
                  { symbol: 'p^L', color: '#e85d04', label: 'p^L — probability those L links exist' },
                  { symbol: '(1-p)', color: '#c1121f', label: '(1-p) — probability a non-edge is absent' },
                ]}
              />
              <p>
                Average number of links: <K l="\langle L \rangle = p \cdot N(N-1)/2" />
              </p>
              <p>
                Average degree: <K l="\langle k \rangle = p \cdot (N-1) \approx 2\langle L \rangle / N" />
              </p>

              <h3>Degree Distribution (Binomial)</h3>
              <FormulaCard
                title="Degree distribution"
                latex="P(k) = \binom{N-1}{k} \cdot p^k \cdot (1-p)^{N-1-k}"
                terms={[
                  { symbol: 'p^k', color: '#e85d04', label: 'p^k — probability of k connections existing' },
                  { symbol: '(1-p)^{N-1-k}', color: '#c1121f', label: '(1-p)^{N-1-k} — probability of remaining connections absent' },
                  { symbol: '\\binom{N-1}{k}', color: '#2d6a4f', label: 'C(N-1,k) — ways to choose k neighbors from N-1' },
                ]}
              />

              <p>
                Standard deviation: <K l="\sigma_k = \sqrt{p(1-p)(N-1)}" />
              </p>
              <p>
                Relative width vanishes as network grows:{' '}
                <K l="\sigma_k / \langle k \rangle \propto 1/\sqrt{N-1} \to 0" />
              </p>

              <h3>Poisson Approximation (large N, small p)</h3>
              <p>
                When <K l="N \to \infty" /> with <K l="\langle k \rangle" /> fixed, the
                binomial converges to a Poisson distribution:
              </p>
              <KB l="P(k) \approx e^{-\langle k \rangle} \frac{\langle k \rangle^k}{k!}" />

              {/* Degree Distribution Artifact */}
              <ArtifactWrapper title="Interactive: Degree Distribution Visualizer">
                <DegreeDistribution />
              </ArtifactWrapper>

              {/* Erdos-Renyi Artifact */}
              <ArtifactWrapper title="Interactive: Erdős–Rényi Playground">
                <ErdosRenyiPlayground />
              </ArtifactWrapper>
            </section>

            {/* ── Section 6: Distances ── */}
            <section id="distances" className="ns-section">
              <h2>6. Distances in Random Graphs</h2>

              <p>
                Starting from any node, the number of reachable nodes grows exponentially with
                distance — at hop distance <K l="d" />, roughly <K l="\langle k \rangle^d" />{' '}
                nodes are reachable.
              </p>
              <p>
                The network diameter (maximum shortest path) is therefore bounded by:
              </p>
              <KB l="d_{\max} \approx \frac{\log N}{\log \langle k \rangle}" />

              <h3>Small World Property</h3>
              <p>
                The average path length in random networks scales logarithmically with network
                size:
              </p>
              <KB l="\langle d \rangle \approx \frac{\ln N}{\ln \langle k \rangle}" />
              <p>
                A network is called <em>small-world</em> if{' '}
                <K l="\langle d \rangle \propto \log N" /> (not <K l="\propto N" />
                ). Consequences:
              </p>
              <ul>
                <li>Six degrees of separation: even with billions of users, social networks have short paths.</li>
                <li>Denser networks (higher <K l="\langle k \rangle" />) have shorter average distances.</li>
                <li>The logarithm grows slowly — doubling <K l="N" /> barely increases <K l="\langle d \rangle" />.</li>
              </ul>
            </section>

            {/* ── Section 7: Centrality ── */}
            <section id="centrality" className="ns-section">
              <h2>7. Centrality Measures</h2>

              <p>
                Centrality quantifies how "important" a node is within a network. Different
                definitions capture different notions of importance.
              </p>

              <h3>Degree Centrality</h3>
              <p>Simplest measure: normalized number of direct connections.</p>
              <KB l="C_D(v) = \frac{\deg(v)}{N-1}" />

              <h3>Graph Centralization</h3>
              <p>
                Measures how unequal the centrality distribution is — 1 for a star, 0 for a
                complete graph or cycle.
              </p>
              <FormulaCard
                title="Graph centralization"
                latex="C = \frac{\sum_{i=1}^{|V|} [C_D(v^*) - C_D(v_i)]}{|V|^2 - 3|V| + 2}"
                terms={[
                  { symbol: 'C_D(v^*)', color: '#4a90d9', label: 'C_D(v*) — maximum centrality in the graph' },
                  { symbol: 'C_D(v_i)', color: '#2d6a4f', label: 'C_D(v_i) — centrality of node i' },
                ]}
              />

              <h3>Closeness Centrality</h3>
              <p>
                Nodes that are close to all others can spread information quickly.
              </p>
              <FormulaCard
                title="Closeness centrality"
                latex="C_C(v) = \frac{N-1}{\sum_{u \neq v} d(v,u)}"
                terms={[
                  { symbol: 'N-1', color: '#4a90d9', label: 'N-1 — normalization (number of other nodes)' },
                  { symbol: 'd(v,u)', color: '#e85d04', label: 'd(v,u) — shortest path distance from v to u' },
                ]}
              />

              <h3>Betweenness Centrality</h3>
              <p>
                Captures how often a node lies on the shortest path between other node pairs —
                important for identifying bridges and brokers.
              </p>
              <FormulaCard
                title="Betweenness centrality"
                latex="C_B(v) = \sum_{s \neq v \neq t} \frac{\sigma_{st}(v)}{\sigma_{st}}"
                terms={[
                  { symbol: '\\sigma_{st}', color: '#4a90d9', label: 'σ_st — total number of shortest paths from s to t' },
                  { symbol: '\\sigma_{st}(v)', color: '#e85d04', label: 'σ_st(v) — shortest paths from s to t through v' },
                ]}
              />
              <p>
                Normalized version divides by <K l="(N-1)(N-2)/2" /> (undirected) or{' '}
                <K l="(N-1)(N-2)" /> (directed).
              </p>

              <h3>Eigenvector Centrality</h3>
              <p>
                A node is important if it is connected to other important nodes. This recursive
                definition leads to the leading eigenvector of the adjacency matrix.
              </p>
              <FormulaCard
                title="Eigenvector centrality"
                latex="x_v = \frac{1}{\lambda} \sum_{t \in N(v)} x_t"
                terms={[
                  { symbol: 'x_v', color: '#4a90d9', label: 'x_v — centrality score of node v' },
                  { symbol: '\\lambda', color: '#2d6a4f', label: 'λ — leading eigenvalue of the adjacency matrix' },
                  { symbol: 'x_t', color: '#e85d04', label: 'x_t — centrality of neighbor t' },
                  { symbol: 'N(v)', color: '#c1121f', label: 'N(v) — set of neighbors of v' },
                ]}
              />

              <h3>PageRank</h3>
              <p>
                Google's algorithm models a random web surfer who follows links with probability{' '}
                <K l="d" /> and teleports randomly with probability <K l="1-d" />.
              </p>
              <FormulaCard
                title="PageRank"
                latex="PR(p_i) = \frac{1-d}{N} + d \sum_{p_j \in M(p_i)} \frac{PR(p_j)}{L(p_j)}"
                terms={[
                  { symbol: '\\frac{1-d}{N}', color: '#4a90d9', label: '(1-d)/N — uniform teleportation probability' },
                  { symbol: 'd', color: '#2d6a4f', label: 'd — damping factor (typically 0.85)' },
                  { symbol: 'M(p_i)', color: '#e85d04', label: 'M(p_i) — pages with links pointing to p_i' },
                  { symbol: 'L(p_j)', color: '#c1121f', label: 'L(p_j) — number of outbound links from p_j' },
                ]}
              />

              {/* Centrality Explorer Artifact */}
              <ArtifactWrapper title="Interactive: Centrality Explorer">
                <CentralityExplorer />
              </ArtifactWrapper>
            </section>

            {/* ── Section 8: Assortativity ── */}
            <section id="assortativity" className="ns-section">
              <h2>8. Network Assortativity</h2>

              <p>
                Assortativity describes the tendency of nodes to connect to similar nodes.
                In networks it most often refers to <em>degree assortativity</em>.
              </p>

              <h3>Mixing Patterns</h3>
              <ul>
                <li>
                  <strong>Assortative</strong>: high-degree hubs preferentially link to other
                  hubs. Common in social networks.
                </li>
                <li>
                  <strong>Neutral</strong>: no degree–degree correlation. Resembles a random
                  graph.
                </li>
                <li>
                  <strong>Disassortative</strong>: hubs connect to low-degree nodes. Common in
                  biological and technological networks.
                </li>
              </ul>

              <h3>Rewiring to Tune Assortativity</h3>
              <ol>
                <li>Select 2 random edges → 4 endpoints, sort by degree: <K l="a \leq b \leq c \leq d" /></li>
                <li>For assortative rewiring: pair <K l="(a,b)" /> and <K l="(c,d)" /></li>
                <li>For disassortative rewiring: pair <K l="(a,d)" /> and <K l="(b,c)" /></li>
              </ol>

              <h3>Statistical Description</h3>
              <p>
                Let <K l="e_{jk}" /> be the probability that a randomly chosen edge connects a
                degree-<K l="j" /> node to a degree-<K l="k" /> node. The excess degree
                distribution:
              </p>
              <KB l="q_k = \frac{k \cdot p_k}{\langle k \rangle}" />
              <p>
                If there are no degree correlations: <K l="e_{jk} = q_j \cdot q_k" /> (product
                form, statistical independence).
              </p>

              <h3>Average Nearest-Neighbor Degree</h3>
              <FormulaCard
                title="Average nearest-neighbor degree"
                latex="k_{nn}(k_i) = \frac{1}{k_i} \sum_{j=1}^{N} A_{ij} k_j"
                terms={[
                  { symbol: 'k_i', color: '#4a90d9', label: 'k_i — degree of node i' },
                  { symbol: 'A_{ij}', color: '#2d6a4f', label: 'A_ij — adjacency matrix entry (1 if edge exists)' },
                  { symbol: 'k_j', color: '#e85d04', label: 'k_j — degree of neighbor j' },
                ]}
              />
              <p>
                If <K l="k_{nn}(k)" /> increases with <K l="k" /> → assortative network.
                Decreases → disassortative network.
              </p>

              <h3>Degree Correlation Coefficient</h3>
              <FormulaCard
                title="Degree correlation coefficient (Newman)"
                latex="r = \frac{\sum_{jk} jk(e_{jk} - q_j q_k)}{\sigma_r^2}, \quad -1 \leq r \leq 1"
                terms={[
                  { symbol: 'e_{jk}', color: '#4a90d9', label: 'e_jk — observed joint degree probability' },
                  { symbol: 'q_j q_k', color: '#2d6a4f', label: 'q_j·q_k — expected value under no correlation' },
                  { symbol: '\\sigma_r^2', color: '#e85d04', label: 'σ_r² — variance normalization factor' },
                ]}
              />
              <ul>
                <li><K l="r > 0" />: assortative (social networks, collaboration networks)</li>
                <li><K l="r = 0" />: no correlation</li>
                <li><K l="r < 0" />: disassortative (internet, protein interaction networks)</li>
              </ul>
            </section>

            {/* ── Section 9: Bethe Lattice ── */}
            <section id="bethe-lattice" className="ns-section">
              <h2>9. Bethe Lattice</h2>

              <p>
                A <strong>Bethe lattice</strong> (also called a Cayley tree) is an infinite
                regular tree where every node has exactly <K l="k" /> neighbors. It has no
                loops, making it analytically tractable for many models in statistical physics
                and network theory.
              </p>

              <h3>Node Count by Level</h3>
              <ul>
                <li>
                  Level 0 (root): <K l="1" /> node
                </li>
                <li>
                  Level 1: <K l="k" /> nodes (all from root)
                </li>
                <li>
                  Level 2: <K l="k(k-1)" /> nodes
                </li>
                <li>
                  Level <K l="l \geq 1" />: <K l="k(k-1)^{l-1}" /> nodes
                </li>
              </ul>

              <FormulaCard
                title="Total node count (k > 2)"
                latex="N(d) = 1 + \frac{k\bigl[(k-1)^d - 1\bigr]}{k-2}"
                terms={[
                  { symbol: 'k', color: '#4a90d9', label: 'k — coordination number (branching factor)' },
                  { symbol: 'd', color: '#e85d04', label: 'd — depth of the lattice from the root' },
                  { symbol: 'N(d)', color: '#2d6a4f', label: 'N(d) — total number of nodes at depth ≤ d' },
                ]}
              />

              <p>
                For <K l="k = 2" /> (a chain): <K l="N(d) = 1 + 2d" />. The exponential
                growth for <K l="k > 2" /> reflects the tree's branching structure — the
                number of nodes at depth <K l="d" /> grows as <K l="(k-1)^d" />.
              </p>

              <p>
                The Bethe lattice is used as a mean-field approximation for lattice models
                (Ising model, percolation, epidemic spreading) because its tree structure
                eliminates correlation loops, making exact solutions possible.
              </p>

              {/* Bethe Lattice Artifact */}
              <ArtifactWrapper title="Interactive: Bethe Lattice Explorer">
                <BetheLattice />
              </ArtifactWrapper>
            </section>

            {/* ── Section 10: Power Law Distribution ── */}
            <section id="power-law" className="ns-section">
              <h2>10. Power Law Distribution</h2>

              <p>
                Many real networks — the web, citations, proteins — have degree distributions
                that follow a <strong>power law</strong>: <K l="P(k) \sim k^{-\alpha}" />.
                Unlike the rapidly decaying Poisson distribution of random graphs, power laws
                have heavy tails: extremely high-degree nodes (hubs) are rare but present.
              </p>

              <FormulaCard
                title="Power law degree distribution"
                latex="P(k) = C \cdot k^{-\alpha}, \quad k \geq k_{\min}"
                terms={[
                  { symbol: 'C', color: '#2d6a4f', label: 'C — normalization constant' },
                  { symbol: 'k_{\\min}', color: '#e85d04', label: 'k_min — minimum degree (lower cutoff)' },
                  { symbol: '\\alpha', color: '#4a90d9', label: 'α — power law exponent (typically 2 < α < 3)' },
                ]}
              />

              <h3>Statistical Moments</h3>
              <p>
                The moments of the power law distribution depend critically on <K l="\alpha" />:
              </p>
              <ul>
                <li>
                  <K l="\langle k \rangle" /> finite iff <K l="\alpha > 2" />. For <K l="2 < \alpha \leq 3" />:{' '}
                  <K l="\langle k \rangle = \frac{\alpha - 1}{\alpha - 2}\,k_{\min}" />
                </li>
                <li>
                  <K l="\langle k^2 \rangle" /> diverges if <K l="\alpha \leq 3" />, leading to
                  anomalous fluctuations and extreme hubs.
                </li>
                <li>
                  Most real-world scale-free networks have <K l="2 < \alpha < 3" />, placing
                  them in the "anomalous" regime.
                </li>
              </ul>

              <h3>Log-Log Linearity</h3>
              <p>
                Taking logs: <K l="\log P(k) = \log C - \alpha \log k" />. A straight
                line in a log-log plot is the empirical signature of a power law. The slope
                estimates <K l="-\alpha" />.
              </p>

              <h3>Robustness and Fragility</h3>
              <p>
                Scale-free networks are robust to random failures (most nodes have low degree)
                but fragile to targeted attacks on hubs. Removing the small fraction of
                highest-degree nodes can rapidly disintegrate the network.
              </p>

              <ArtifactWrapper title="Interactive: Power Law Explorer">
                <PowerLawExplorer />
              </ArtifactWrapper>
            </section>

            {/* ── Section 11: Barabási–Albert Model ── */}
            <section id="ba-model" className="ns-section">
              <h2>11. Barabási–Albert Model</h2>

              <p>
                The <strong>Barabási–Albert (BA) model</strong> explains how power laws
                emerge naturally from two simple mechanisms: <em>growth</em> (nodes are added
                one at a time) and <em>preferential attachment</em> (new nodes prefer to
                connect to already well-connected nodes).
              </p>

              <h3>Algorithm</h3>
              <ol>
                <li>Start with a small seed graph of <K l="m_0 \geq m" /> nodes.</li>
                <li>At each time step, add one new node with <K l="m" /> edges.</li>
                <li>
                  Each edge connects to existing node <K l="i" /> with probability proportional
                  to its current degree:
                </li>
              </ol>

              <FormulaCard
                title="Preferential attachment probability"
                latex="\Pi(i) = \frac{k_i}{\sum_j k_j}"
                terms={[
                  { symbol: 'k_i', color: '#4a90d9', label: 'k_i — current degree of node i' },
                  { symbol: '\\sum_j k_j', color: '#e85d04', label: 'Σ k_j — total degree (= 2L at step t)' },
                ]}
              />

              <h3>Resulting Degree Distribution</h3>
              <p>
                After <K l="t" /> steps the network has <K l="N = m_0 + t" /> nodes and{' '}
                <K l="\langle L \rangle = mt" /> edges. The degree distribution converges to
                a power law with exponent exactly <K l="\alpha = 3" />:
              </p>
              <KB l="P(k) \sim 2m^2 k^{-3}" />
              <p>
                This result is independent of <K l="m" /> and <K l="m_0" />. The exponent{' '}
                <K l="\alpha = 3" /> falls in the <K l="2 < \alpha \leq 3" /> regime — finite
                mean but divergent variance.
              </p>

              <h3>Continuum Theory (Mean-Field)</h3>
              <p>
                Since each new node brings <K l="m" /> edges and there are <K l="t" /> nodes,
                the total degree is <K l="\sum_j k_j = 2mt" />. The rate of change of
                node <K l="i" />'s degree is therefore:
              </p>
              <KB l="\frac{\partial k_i}{\partial t} = m \cdot \frac{k_i}{\sum_j k_j} = \frac{k_i}{2t}" />
              <p>
                Separating variables and integrating from the initial condition{' '}
                <K l="k_i(t_i) = m" />:
              </p>
              <KB l="\int_m^{k_i} \frac{dk_i}{k_i} = \int_{t_i}^{t} \frac{dt}{2t}" />
              <KB l="\ln\!\left(\frac{k_i}{m}\right) = \frac{1}{2}\ln\!\left(\frac{t}{t_i}\right)" />
              <p>Exponentiating both sides yields the growth law:</p>

              <h3>Mean Degree Growth</h3>
              <p>
                Each node's degree grows as a power of time. A node added at time <K l="t_i" />{' '}
                has expected degree at time <K l="t" />:
              </p>
              <KB l="\langle k_i(t) \rangle = m \left(\frac{t}{t_i}\right)^{1/2}" />
              <p>
                Early nodes become hubs because they had more time to accumulate edges — the
                <em> first-mover advantage</em> in network growth.
              </p>

              <h3>Rate Equation Approach</h3>
              <p>
                A more rigorous derivation counts how the number of degree-<K l="k" /> nodes
                changes per timestep. The preferential attachment probability for a
                degree-<K l="k" /> node is:
              </p>
              <KB l="\Pi(k) = \frac{k}{2mt}" />
              <p>
                (In time <K l="t" /> we have added <K l="m" /> links per step, each
                contributing to 2 endpoints, so <K l="\sum_j k_j = 2mt" />.) The number of
                links added to degree-<K l="k" /> nodes after one new node arrives is:
              </p>
              <FormulaCard
                title="Links added to degree-k nodes per step"
                latex="\frac{k}{2mt} \cdot N \cdot P(k,t) \cdot m = \frac{k}{2} P(k,t)"
                terms={[
                  { symbol: '\\frac{k}{2mt}', color: '#7b2cbf', label: 'k/2mt — preferential attachment probability for a degree-k node' },
                  { symbol: 'N \\cdot P(k,t)', color: '#4a90d9', label: 'N·P(k,t) — total number of degree-k nodes in the network' },
                  { symbol: 'm', color: '#2d6a4f', label: 'm — number of links the new node adds' },
                  { symbol: '\\frac{k}{2} P(k,t)', color: '#e85d04', label: '(k/2)P(k,t) — simplified result: rate of links going to degree-k nodes' },
                ]}
              />
              <p>The number of degree-<K l="k" /> nodes changes each step due to:</p>
              <ul>
                <li>
                  <strong>Gain</strong>: degree-<K l="(k{-}1)" /> nodes that acquire a link
                  and become degree <K l="k" />:{' '}
                  <K l="\tfrac{k-1}{2} P(k-1, t)" />
                </li>
                <li>
                  <strong>Loss</strong>: degree-<K l="k" /> nodes that acquire a link and
                  become degree <K l="(k{+}1)" />:{' '}
                  <K l="\tfrac{k}{2} P(k, t)" />
                </li>
              </ul>
              <KB l="(N+1)P(k,t+1) = N P(k,t) + \frac{k-1}{2} P(k-1,t) - \frac{k}{2} P(k,t)" />
              <p>
                Boundary condition at <K l="k = m" /> (new nodes start with degree <K l="m" />):
              </p>
              <KB l="(N+1)P(m,t+1) = N P(m,t) + 1 - \frac{m}{2} P(m,t)" />

              <h4>Stationary Solution</h4>
              <p>
                As <K l="N = t \to \infty" />, <K l="P(k,t) \to P(k)" /> (time-independent).
                The left-hand side becomes:
              </p>
              <KB l="(N+1)P(k,t+1) - N P(k,t) \;\longrightarrow\; P(k)" />
              <p>So the stationary equation for <K l="k > m" /> is:</p>
              <KB l="P(k) = \frac{k-1}{2} P(k-1) - \frac{k}{2} P(k)" />
              <p>
                Moving <K l="\tfrac{k}{2}P(k)" /> to the left:
              </p>
              <KB l="P(k)\!\left(1 + \frac{k}{2}\right) = \frac{k-1}{2} P(k-1)" />
              <FormulaCard
                title="Recursion relation"
                latex="P(k) = \frac{k-1}{k+2}\,P(k-1)"
                terms={[
                  { symbol: 'P(k)', color: '#4a90d9', label: 'P(k) — probability of degree k' },
                  { symbol: 'k-1', color: '#2d6a4f', label: 'k−1 — degree of the "source" state (gaining a link)' },
                  { symbol: 'k+2', color: '#c1121f', label: 'k+2 — denominator from 1 + k/2 = (k+2)/2' },
                  { symbol: 'P(k-1)', color: '#e85d04', label: 'P(k−1) — probability of degree k−1 (feeds into P(k))' },
                ]}
              />
              <p>Boundary condition at <K l="k = m" />:</p>
              <KB l="P(m)\!\left(1 + \frac{m}{2}\right) = 1 \implies P(m) = \frac{2}{m+2}" />

              <h4>Unrolling the Recursion</h4>
              <p>
                Starting from <K l="P(m) = \tfrac{2}{m+2}" /> and applying{' '}
                <K l="P(k+1) = \tfrac{k}{k+3} P(k)" /> repeatedly:
              </p>
              <KB l="P(m+1) = \frac{m}{m+3} \cdot \frac{2}{m+2} = \frac{2m}{(m+2)(m+3)}" />
              <KB l="P(m+2) = \frac{m+1}{m+4} \cdot \frac{2m}{(m+2)(m+3)} = \frac{2m(m+1)}{(m+2)(m+3)(m+4)}" />
              <KB l="P(m+3) = \frac{m+2}{m+5} \cdot \frac{2m(m+1)}{(m+2)(m+3)(m+4)} = \frac{2m(m+1)}{(m+3)(m+4)(m+5)}" />
              <p>
                The numerator accumulates a rising factorial starting at <K l="m" />; the
                denominator is three consecutive integers ending at <K l="k+2" />. For
                general <K l="k \geq m" /> the numerator stabilizes at <K l="2m(m+1)" /> and
                the denominator is <K l="k(k+1)(k+2)" />:
              </p>
              <FormulaCard
                title="General degree distribution (exact)"
                latex="P(k) = \frac{2m(m+1)}{k(k+1)(k+2)}"
                terms={[
                  { symbol: '2m(m+1)', color: '#2d6a4f', label: '2m(m+1) — numerator, depends only on m' },
                  { symbol: 'k(k+1)(k+2)', color: '#4a90d9', label: 'k(k+1)(k+2) — three consecutive integers ≈ k³ for large k' },
                ]}
              />
              <p>For large <K l="k" /> the numerator is a constant, so:</p>
              <KB l="P(k) \approx \frac{2m(m+1)}{k^3} \sim k^{-3}" />
              <p>
                The exponent <K l="\gamma = 3" /> is <strong>universal</strong> — it holds
                regardless of <K l="m" />. This is a signature prediction of the BA model.
              </p>

              <h3>Uniform Attachment</h3>
              <p>
                If instead each new node picks targets <em>uniformly at random</em>, the
                growth rate is equal for all nodes:
              </p>
              <KB l="\frac{\partial k_i}{\partial t} = \frac{m}{m_0 + t - 1}" />
              <p>Integrating:</p>
              <KB l="k_i(t) = m \ln\!\left(\frac{m_0 + t - 1}{m_0 + t_i - 1}\right) + m" />
              <p>
                This is <em>logarithmic</em> growth — far slower than the{' '}
                <K l="\sqrt{t}" /> power-law growth of the BA model. Inverting to find{' '}
                <K l="t_i(k)" /> and using a uniform arrival rate:
              </p>
              <KB l="P(k) = \frac{e}{m} \exp\!\left(-\frac{k}{m}\right) \sim e^{-k}" />
              <p>
                Exponential, not power-law. No hubs form. Preferential attachment is necessary
                for scale-free structure.
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Attachment</th>
                    <th>Growth</th>
                    <th><K l="k_i(t)" /> scaling</th>
                    <th><K l="P(k)" /></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>BA model</td>
                    <td>Preferential</td>
                    <td>Yes</td>
                    <td><K l="\sim t^{1/2}" /></td>
                    <td><K l="\sim k^{-3}" /></td>
                  </tr>
                  <tr>
                    <td>Uniform attachment</td>
                    <td>Uniform</td>
                    <td>Yes</td>
                    <td><K l="\sim \ln t" /></td>
                    <td><K l="\sim e^{-k}" /></td>
                  </tr>
                  <tr>
                    <td>Model B</td>
                    <td>Preferential</td>
                    <td>No</td>
                    <td><K l="\sim t" /></td>
                    <td>Gaussian</td>
                  </tr>
                </tbody>
              </table>

              <h3>Without Growth (Model B)</h3>
              <p>
                Fix <K l="N" /> nodes (no growth) and rewire edges preferentially. The
                degree growth rate becomes:
              </p>
              <FormulaCard
                title="Degree growth — fixed population"
                latex="\frac{\partial k_i}{\partial t} = \frac{N}{N-1}\frac{k_i}{2t} + \frac{1}{N}"
                terms={[
                  { symbol: '\\frac{N}{N-1}', color: '#7b2cbf', label: 'N/(N−1) — correction factor for fixed population' },
                  { symbol: '\\frac{k_i}{2t}', color: '#e85d04', label: 'k_i/2t — preferential attachment term' },
                  { symbol: '\\frac{1}{N}', color: '#2d6a4f', label: '1/N — uniform baseline (each node has equal chance of receiving a rewired link)' },
                ]}
              />
              <p>
                The <K l="k_i" /> growth becomes <em>linear in <K l="t" /></em> (not{' '}
                <K l="\sqrt{t}" />), because every timestep all <K l="N" /> nodes compete.
                The degree distribution evolves in three stages:
              </p>
              <ol>
                <li>Initially power-law–like</li>
                <li>Degrees homogenize → Gaussian</li>
                <li>Eventually → fully connected</li>
              </ol>
              <p>
                <strong>Conclusion:</strong> Growth is necessary alongside preferential
                attachment for a persistent scale-free structure.
              </p>

              <h3>Measuring <K l="\Pi(k)" /> Empirically</h3>
              <p>
                You cannot directly observe <K l="\Pi(k)" />, but since{' '}
                <K l="\partial k_i / \partial t \propto \Pi(k_i)" />, you can measure{' '}
                <K l="\Delta k / \Delta t" /> for nodes of degree <K l="k" />. To reduce
                noise, plot the <strong>cumulative preference function</strong>:
              </p>
              <KB l="\kappa(k) = \sum_{K < k} \Pi(K)" />
              <ul>
                <li>
                  <K l="\kappa(k) \sim k" /> → uniform attachment (no preferential attachment)
                </li>
                <li>
                  <K l="\kappa(k) \sim k^2" /> → linear preferential attachment{' '}
                  (<K l="\Pi(k) \propto k" />, since the derivative of <K l="k^2" /> is{' '}
                  <K l="2k" />)
                </li>
              </ul>
              <FormulaCard
                title="General empirical finding"
                latex="\Pi(k) \approx A + k^{\alpha}, \quad \alpha \leq 1"
                terms={[
                  { symbol: 'A', color: '#4a90d9', label: 'A — constant offset (baseline attractiveness)' },
                  { symbol: 'k^{\\alpha}', color: '#e85d04', label: 'k^α — degree-dependent term' },
                  { symbol: '\\alpha', color: '#c1121f', label: 'α — attachment exponent (α = 1 recovers BA)' },
                ]}
              />
              <ul>
                <li>
                  <K l="\alpha = 1" />: linear preferential attachment →{' '}
                  <K l="P(k) \sim k^{-3}" /> (BA model)
                </li>
                <li>
                  <K l="\alpha < 1" />: sublinear → stretched exponential, not a pure power law
                </li>
                <li>
                  <K l="\alpha > 1" />: superlinear → winner-takes-all (single hub dominates)
                </li>
              </ul>
              <p>
                Real networks show <K l="\alpha \approx 1" /> but not exactly — approximately
                linear preferential attachment.
              </p>

              <ArtifactWrapper title="Interactive: Barabási–Albert Growth Simulator">
                <BAGrowthSimulator />
              </ArtifactWrapper>
            </section>

            <DegreeCorrelationsSection />
            <ScaleFreePropertySection />
            <MeasuringPowerLawsSection />
            <FitnessModelSection />
            <RobustnessSection />
            <CriticalExponentsSection />
            <CommunityDetectionSection />
            <EpidemicModelsSection />
            <SocialContagionSection />
            <SpectralGraphTheorySection />
            <TopologicalDataAnalysisSection />

            {/* ── References ── */}
            <section id="references" className="ns-section">
              <h2>References &amp; Resources</h2>
              <p>Lecture notes: CS514 Network Science, Dr. Onur Varol (Sabancı University)</p>
            </section>

          </main>
        </div>
      </div>

      {/* ── Footer — full width, outside grid ── */}
      <footer className="footer">
        <div className="footer-bg" aria-hidden="true"></div>
        <div className="footer-inner">
          <div className="footer-left">
            <p className="footer-email">adleyba [at] sabanciuniv [dot] edu</p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.78rem", opacity: 0.6, fontFamily: "var(--ff-mono)" }}>
              Network Science Study Guide · Built with React + KaTeX
            </p>
          </div>
          <p className="footer-copy">© 2026 — SIMA ADLEYBA</p>
        </div>
      </footer>
    </div>
  );
}
