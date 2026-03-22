import { useEffect, useRef, Suspense, lazy } from 'react';
import katex from 'katex';
import TableOfContents from './components/TableOfContents';
import FormulaCard from './components/FormulaCard';
import './styles/global.css';

// Lazy-load artifacts
const CentralityExplorer = lazy(() => import('./artifacts/CentralityExplorer'));
const PathExplorer = lazy(() => import('./artifacts/PathExplorer'));
const ErdosRenyiPlayground = lazy(() => import('./artifacts/ErdosRenyiPlayground'));
const DegreeDistribution = lazy(() => import('./artifacts/DegreeDistribution'));
const BetheLattice = lazy(() => import('./artifacts/BetheLattice'));

// Inline KaTeX helper
function K({ l }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      katex.render(l, ref.current, { throwOnError: false, displayMode: false });
    }
  }, [l]);
  return <span ref={ref} />;
}

// Display KaTeX helper
function KB({ l }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      katex.render(l, ref.current, { throwOnError: false, displayMode: true });
    }
  }, [l]);
  return <div ref={ref} style={{ overflowX: 'auto', margin: '0.8rem 0' }} />;
}

// Artifact wrapper
function ArtifactWrapper({ title, children }) {
  return (
    <div className="artifact-card">
      <h4>{title}</h4>
      <Suspense
        fallback={
          <div style={{ color: '#8b9bd4', fontSize: '0.9rem', padding: '1rem 0' }}>
            Loading interactive component...
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* ── Header ── */}
      <header className="ns-header">
        <div className="container">
          <div className="ns-title">Network Science</div>
          <div className="ns-subtitle">
            Interactive Study Guide · Network Analysis Course Notes
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
                Average degree: <K l="\langle k \rangle = p(N-1) \approx 2\langle L \rangle / N" />
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

              <p>
                <strong>Katz Centrality</strong> counts all paths with exponentially decaying
                weights by length: <K l="C_K(v) = \sum_{k=1}^{\infty} \sum_j \alpha^k (A^k)_{ji}" />.
                The attenuation factor <K l="\alpha < 1/\lambda_{\max}" /> ensures convergence.
                Katz works for directed and disconnected graphs where eigenvector centrality fails.
              </p>

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

            {/* ── Footer ── */}
            <footer style={{ padding: '1.8rem 0', textAlign: 'center' }}>
              <p style={{ color: '#7B6FD6', fontWeight: 500, fontSize: '0.88rem', letterSpacing: '0.02em', margin: '0 0 0.3rem' }}>
                adleyba [at] sabanciuniv [dot] edu
              </p>
              <p style={{ color: '#a0a0a0', fontSize: '0.78rem', margin: 0 }}>
                Network Science Study Guide · Built with React + KaTeX
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
