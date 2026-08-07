# Network Science Expansion — Handoff

Last updated: 2026-08-07

## Current state

The guide now renders sections 12–22 before References, with matching TOC entries, shared KaTeX/fullscreen helpers, deterministic graph/math utilities, lazy-loaded artifacts, and the regenerated `networkscience/` production build.

The latest `npm run build` from `networkscience-src/` succeeds. The built page contains 23 sections total (1–22 plus References), 23 TOC buttons, and 32 artifact cards. A desktop browser pass found no horizontal overflow and no stuck lazy-loading fallbacks.

No commit or push was made.

## Files changed

Allowed existing files changed:

- `src/App.jsx`: extracted helpers, imported/rendered sections 12–22, updated subtitle.
- `src/components/TableOfContents.jsx`: added sections 12–22 before References.
- `src/data/notes.js`: synchronized section IDs, including previously missing 10–11.
- `src/styles/global.css`: appended the TOC overflow block at EOF.

New source:

- `src/components/Katex.jsx`
- `src/components/ArtifactWrapper.jsx`
- 11 files under `src/sections/`
- 25 files under `src/artifacts/`
- 7 files under `src/utils/`
- `src/data/karate.js`
- `src/data/icGraph.js`

The generated `networkscience/` directory was rebuilt by Vite and should not be hand-edited.

## Verification completed

- Baseline before edits: sections 1–11 plus References, no console errors.
- `git diff --check`: clean.
- Production `npm run build`: passes (887 modules transformed).
- Browser after expansion:
  - 23 section elements and 23 TOC entries.
  - 32 artifact cards.
  - no `Loading interactive component...` fallbacks left after load.
  - desktop `scrollWidth === clientWidth` at 1280 px.
- Browser initially found 15 KaTeX colour-substitution errors and duplicate table keys. These were mechanically corrected.
- A subsequent pass found one remaining KaTeX error in the robustness FormulaCard because the term `k` also matched `\kappa`. The term was changed to the exact `\langle k\rangle`, and the production build passed again.

## Final browser recheck — completed 2026-08-07

All items below were run against a fresh dev server tab and confirmed:

1. `.katex-error` count is zero (desktop and mobile).
2. Browser console clean in a fresh tab — no errors, no stale duplicate-key logs.
3. All 101 FormulaCard legend dots render with a real background colour (none uncoloured).
4. Mobile at 375 px: TOC toggle opens/closes correctly (`mobile-open` class, button label swaps). One real bug was found and fixed — see below. The residual 13px `documentElement.scrollWidth` vs `clientWidth` delta traces to the fixed navbar reading `window.innerWidth` (which includes this browser tool's own scrollbar gutter); `document.body.scrollWidth` is exactly 375 and a full-page screenshot shows no clipped or cut-off content, so this is a test-harness artifact, not a real device issue.
5. Expand/close verified individually for one artifact each in sections 12 (degree-correlations), 16 (robustness), 18 (community-detection), 19 (epidemic-models), 21 (spectral-graph), 22 (tda). `document.body.style.overflow` correctly goes `hidden` → `""` across expand/close.
6. `npm run build` passes (887 modules). `npm run preview` smoke test repeats the same 23-section/23-TOC/32-artifact/0-katex-error checks against the built output successfully.

### Bug found and fixed during this recheck

Wide tables (e.g. the §12 real-networks table, §13 empirical tables) were invisibly clipped on narrow viewports: `.ns-section { overflow-x: clip; }` (pre-existing, line ~693 of `global.css`) hid any table content wider than the section instead of making it scrollable, silently cutting off right-hand columns on mobile with no visual indication. Fixed with an append-only CSS rule at the end of `global.css`:

```css
@media (max-width: 768px) {
  .ns-section table {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
```

This applies to all tables in all sections (1–22), consistent with the plan's append-only CSS rule (§2.4). No markup was touched.

## Acceptance-critical gaps closed — 2026-08-07 (second pass)

All items HANDOFF previously flagged as incomplete artifact gaps are now implemented and individually verified against the plan's own stated acceptance tests:

- **Modularity playground**: was silently displaying hardcoded preset values instead of computing Q live. Rebuilt with a real 11-edge graph and live modularity computation; all four presets now compute exactly 0.41 / 0.22 / 0.00 / −0.12 as clicked, plus a term-by-term (`L_C`, `k_C`, contribution) breakdown table.
- **Fitness race**: added the Fenwick-tree weighted sampler (O(log N)), the missing exponential fitness option, the final-`P(k)` vs BA-`k⁻³` panel, and the β(η)/C readout. Switched to ensemble-averaged growth (adaptive `RUNS`, 6–24 depending on N·m) since a single stochastic run was too noisy to reliably show β≈1/2 — confirmed early tracked nodes land within 5% of the target, mean β=0.447, and the fit-get-rich crossover (η=0.99 late entrant, fitted β=0.82) is clearly visible.
- **Percolation**: added the chunked, rAF-driven sweep (p: 0.30→0.80, R-realisation averaging, abortable, progress bar), plotting P∞(p) and S(p) against p_c=0.5927.
- **Attack/failure**: added the "recompute degrees after each removal" toggle. Found and fixed a readout bug that quoted the *predicted* Molloy–Reed threshold as the *measured* attack-collapse point; now reports the actual measured collapse (BA: f≈0.23, well below the 0.88 prediction).
- **Watts cascade**: added the 500-trial cascade-size histogram (log-log, S⁻¹·⁵ reference) and the (φ, ⟨k⟩) phase diagram heatmap, gated behind an explicit compute button with a progress bar.
- **Finite-size collapse**: replaced the fully synthetic curves with a real chunked Monte Carlo percolation simulation for L∈{16,32,64}; added the missing P∞(p) tab (β slider, snap=5/36); rewrote "collapse quality" to actually measure mean pairwise deviation between curves. Tuned realisation counts (40/20/12) and added light p-axis smoothing after finding the raw MC noise at the plan's stated R (20/10/5) was too high to reliably rank parameter choices — confirmed bad parameters still score clearly worse than the snap values.
- **Karate club explorer**: replaced entirely-fake greedy/GN "algorithms" (arbitrary formulas keyed to a slider, hardcoded fake Q-history bell curve) with real implementations — Newman's greedy modularity merging and genuine Girvan–Newman edge-betweenness removal (reusing the existing Brandes betweenness). Found and fixed two bugs: (1) agreement score compared raw community labels instead of pairwise co-membership (labels are only meaningful up to permutation); (2) GN's Q history was scored against the shrinking remaining-edge set instead of the original graph. After both fixes, GN's max Q lands exactly at the textbook value (Q=0.401, 5 communities) for Zachary's karate club.
- **Independent Cascade**: added explicit per-edge step outcomes (fired/failed/spent colouring), a 10,000-run Monte Carlo with a per-node activation-probability bar chart, and a greedy influence-maximisation panel (k=1..3) — confirmed monotonically increasing, diminishing-returns spread as expected for submodular greedy selection.
- **Exposure lab**: added the full Centola replication (clustered-lattice vs random-regular, matched N/Z, R-trial averaging). Verified both directions of the finding: threshold response gives lattice 87.6% final adoption vs random's 17.3% (complex contagion favours clustering); diminishing-returns response has random reaching half-adoption faster (4 vs 6 rounds) despite both saturating (simple contagion favours random shortcuts).
- **Spectral clustering**: added the random-walk Laplacian variant (via eigenvector rescaling of the symmetric-normalised solution, since the Jacobi solver only handles symmetric matrices), the three synced panels (eigenvector strip, graph, 2-D embedding), and an agreement table across all three variants. Confirmed normalisation is not cosmetic: unnormalised 70.1% agreement vs symmetric/random-walk both at 94.1%.
- **Persistent homology**: added the barcode panel (exact H₀ birth/death via union-find, honest H₁(ε) interval summary), click-to-add/remove points, the missing `annulus`/`figure eight` presets, and the ε-radius hover disc. The `two circles` mid-ε acceptance test (β₀=1, β₁=2) now holds at the new default ε=60.

Also filled the previously-truncated empirical tables against the actual source markdown (not just the plan's row-name list): §13's network table was both incomplete (11 of 20 rows) and inaccurate (some K_max values didn't match source) — rebuilt from `netsci-W5b.md` lines 275–295 verbatim. Added §14's missing network degree-exponent table, §16's cascade-exponent table (was prose, not a `<table>`), §18's Infomap five-step breakdown table (was prose), and §20's four-protocol table. Added §17's reference-exponent table (was missing entirely). Fixed a duplicate-React-key console warning introduced by the new §13 table (row name used as key; switched to index).

Ran the accessibility audit: all range/checkbox inputs in the new artifacts use wrapping `<label>` (valid implicit association); no icon-only buttons without text; all bare `<svg>` diagrams in newly-added (non-baseline) artifacts now have `role="img"` + `<title>` — added the three that were missing (WattsCascade's phase-diagram heatmap, PersistentHomologyExplorer's barcode panel, SpectralClusteringDemo's eigenvector strip and embedding scatter). The five SVGs still missing this in `BAGrowthSimulator.jsx`, `BetheLattice.jsx`, `CentralityExplorer.jsx`, `ErdosRenyiPlayground.jsx`, `PathExplorer.jsx` were deliberately left untouched — they are baseline (pre-plan) artifacts the implementation plan explicitly forbids modifying.

## Known gaps against the full implementation plan

- A few small optional items remain unimplemented by design, per the plan's own "optional" framing: the standalone `EjkMatrixExplainer` (§12, explicitly optional), cutoff rejection-sampling/non-power-law-head toggles in the power-law lab (§14).

## Formula audit — completed 2026-08-07 (third pass)

Went section-by-section comparing each of the 11 sections against the implementation plan's detailed content spec (itself a careful distillation of the 8 source markdowns), rather than a raw line-by-line diff against the corrupted/inconsistently-formatted source `.md` files — an automated diff was tried first (`extract_formulas.py`-style regex extraction + normalized substring matching) and produced too many false positives from LaTeX-corruption differences (e.g. `k_{\max}` in the JSX vs plain `k_{max}` in source both meaning the same subscript text, but normalizing differently) to be trustworthy on its own; it was used as a lead-generator, then every flagged item was checked by hand against the actual JSX.

§12, §13, §15, §16, §17, §19 (after fixes), §21, §22 were read in full and confirmed to match the plan's content spec, including specific worked-example numbers (e.g. §12's k_nn=2.75 micro-example, §16's blackout figures, §21's 4-node digraph and its A⁶, §17's spanning-cluster exclusion caveat). Spot-checked specific hard-to-recall numeric facts across all sections via targeted search (Hill estimator 2.503, Broido & Clauset's 927/4%, John Snow/Broad Street, Milgram/flocking's three rules) — all present.

Three real content gaps were found and fixed:
- **§18 (Community Detection)**: the Physics E-print Archive worked example for greedy modularity (56,276 vertices → four communities with specific node counts/percentages, and the 9,350-node community's power-law subgroup decomposition down to a 134-vertex and 28-vertex group) was missing entirely — added.
- **§19 (Epidemic Models)**: the severity-stratified COVID-style compartmental model (S→E/E→mild/severe/critical/D transition structure) and the Alison Hill COVID-19 SEIR app reference (R₀=3.2, r=0.14/day, T₂=5 days) were missing entirely — added as a new subsection.
- **§20 (Social Contagion)**: the mixture-likelihood formula was present but its surrounding context — Weng et al.'s five link-formation strategies (random, triadic closure, grandparent, origin, traffic shortcuts), the EM fitting method, and the ternary-simplex region labels (information-oriented/friendship/casual-friendship/mixture/random-browsing) — was missing. Added.

All three fixes verified with a clean production build and zero KaTeX errors in a fresh tab (both dev and `npm run preview`).

**Not done as part of this pass**: a literal line-by-line diff ticking off every one of the ~938 `$…$`/`$$…$$` occurrences in the 8 raw source markdown files. Given the source's own LaTeX corruption and the fact many raw occurrences are chart-axis tick labels or single-symbol prose mentions rather than distinct "formulas," this was judged lower-value than the targeted content-spec comparison actually performed. If a stricter audit is wanted later, the source files are at `/Users/simaadleyba/Desktop/personal/netsci_markdowns/*.md` and the plan's own file-to-section mapping is in `implementation_plan.md` §4.

## Recommended next order

1. ~~Run the final browser/preview checks above and fix only concrete regressions.~~ Done 2026-08-07.
2. ~~Complete the acceptance-critical artifact gaps.~~ Done 2026-08-07 (second pass) — see above.
3. ~~Fill empirical tables.~~ Done 2026-08-07 for §13/§14/§16/§17/§18/§20 (second pass).
4. ~~Accessibility audit.~~ Done 2026-08-07 (second pass) — see above.
5. ~~Formula-by-formula audit against the plan's content spec.~~ Done 2026-08-07 (third pass) — three real gaps found and fixed, see above.
6. ~~Confirm `git status` includes changes only under `networkscience-src/src/` and generated `networkscience/`.~~ Confirmed 2026-08-07.
7. **Optional remaining work**: a literal raw-markdown line diff (see caveat above) if stricter verification is wanted; the two explicitly-optional artifact subpanels noted above.

## Commands

```bash
cd /Users/simaadleyba/Desktop/personal/simaadleyba.github.io/networkscience-src
npm run dev -- --host 127.0.0.1
npm run build
npm run preview -- --host 127.0.0.1
```
