// app.js — Application entry point. Pure event-driven lifecycle.
//
// Lifecycle (no setTimeout, no tick-counter, no sim.stop):
//
//   DOMContentLoaded
//     → Lifecycle.transition('LOADING')
//     → d3.json("data.json")
//     → DataModel.init()
//     → Create SVG, defs, layers
//     → Lifecycle.transition('GRAPH_CREATED')
//     → ForceLayout.createFullSimulation()
//     → Create renderers (nodes/edges/labels)
//     → Register sim.on("tick")  — updates SVG positions
//     → Register sim.on("end")   — 🛎 the ONLY layout-stable signal
//     → CameraController.init()  — zoom attached but DISABLED
//     → Lifecycle.transition('SIMULATING')
//
//   sim.on("end") fires (alpha < 0.001):
//     → Lifecycle.transition('LAYOUT_STABLE')
//     → Lifecycle.transition('FITTING')
//     → CameraController.initialFit()
//     → On fit transition end → Lifecycle.transition('READY')
//
//   READY:
//     → CameraController.enable()  — zoom enabled, queue drained
//     → All interactions activated
//     → Narrative auto-start

const App = (() => {

  async function init() {
    // ═══════════════════════════════════════════════════════════
    // PHASE: LOADING
    // ═══════════════════════════════════════════════════════════
    Lifecycle.transition('LOADING');
    const [raw, companies] = await Promise.all([
      d3.json("data.json"),
      d3.json("data/companies.json"),
    ]);
    DataModel.init(raw, companies);

    // ═══════════════════════════════════════════════════════════
    // PHASE: GRAPH_CREATED
    // ═══════════════════════════════════════════════════════════
    const container = document.getElementById("graph");
    const W = container.clientWidth;
    const H = container.clientHeight;

    const svg = d3.select("#graph svg")
      .attr("width", W).attr("height", H);
    const g = svg.append("g");

    // Defs: arrow markers
    const defs = svg.append("defs");
    [Theme.edgeControl, Theme.edgeHolding, Theme.edgeConcert, Theme.edgePending, Theme.edgeOther].forEach(c => {
      const id = "a-" + c.replace("#", "");
      defs.append("marker")
        .attr("id", id).attr("viewBox", "0 -3 6 6")
        .attr("refX", 15).attr("refY", 0)
        .attr("markerWidth", 5).attr("markerHeight", 5)
        .attr("orient", "auto")
        .append("path").attr("d", "M0,-3L6,0L0,3").attr("fill", c);
    });

    // Glow filter
    const gf = defs.append("filter").attr("id", "glow")
      .attr("x", Theme.glow.expand.x).attr("y", Theme.glow.expand.y)
      .attr("width", Theme.glow.expand.width).attr("height", Theme.glow.expand.height);
    gf.append("feGaussianBlur").attr("stdDeviation", Theme.glow.stdDeviation).attr("result", "b");
    gf.append("feMerge").selectAll("feMergeNode").data(["b", "SourceGraphic"]).join("feMergeNode").attr("in", d => d);

    // Renderer layers
    const lG = g.append("g").attr("class", "edges");
    const nG = g.append("g").attr("class", "nodes");

    Lifecycle.transition('GRAPH_CREATED');

    // ═══════════════════════════════════════════════════════════
    // PHASE: SIMULATING
    // ═══════════════════════════════════════════════════════════
    // Create simulation — pre-layout has already grid-packed components
    const sim = ForceLayout.createClusterSimulation();

    // Create renderers
    EdgeRenderer.init(lG);
    NodeRenderer.init(nG);
    const { lHit, lVis } = EdgeRenderer.create(GraphState.links);
    const nGrp = NodeRenderer.create(GraphState.nodes);
    const nLab = NodeRenderer.createLabels();
    NodeRenderer.setSim(sim);

    // ── Silent convergence: 200 ticks without rendering ──
    // After 200 ticks alpha ≈ 0.05, nodes are ~95% converged.
    // The user never sees the scatter → converge process.
    sim.stop();
    sim.tick(200);

    // One-time SVG flush: show post-tick positions immediately
    nGrp.attr("transform", d => `translate(${d.x},${d.y})`);
    if (lHit) {
      lHit.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
    }
    if (lVis) {
      lVis.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
    }

    // Camera: zoom attached but DISABLED (no wheel/dblclick until READY)
    CameraController.init(svg, g);

    // ── Early fit: user sees centered graph immediately ──
    // initialFit() is idempotent — the FITTING-phase call will be a no-op.
    CameraController.initialFit();

    // Now attach tick handler — user sees only the final ~5% of convergence
    sim.on("tick", () => {
      if (lHit) {
        lHit.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
      }
      if (lVis) {
        lVis.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
      }
      if (nGrp) nGrp.attr("transform", d => `translate(${d.x},${d.y})`);
    });
    sim.restart(); // continue from alpha ≈ 0.05

    // End: the one true signal that layout is stable
    sim.on("end", () => {
      if (!Lifecycle.atLeast('LAYOUT_STABLE')) {
        Lifecycle.transition('LAYOUT_STABLE');
      }
    });

    // Stats (visible immediately, non-interactive)
    UIRenderer.updateStats();

    // Bind interaction event handlers now, but they check lifecycle before acting
    HoverManager.bind(EdgeRenderer.lHit, EdgeRenderer.lVis, NodeRenderer.nGrp, NodeRenderer.nLab);
    SelectionManager.bind(NodeRenderer.nGrp);
    SelectionManager.bindBackground(svg);
    SelectionManager.closePanelButton();
    FilterManager.bind();
    Controls.bind();
    NarrativeTour.bind();

    Lifecycle.transition('SIMULATING');

    // ═══════════════════════════════════════════════════════════
    // LAYOUT_STABLE → COMPONENT_PACK → FITTING → READY
    // ═══════════════════════════════════════════════════════════
    Lifecycle.on('LAYOUT_STABLE', () => {
      // ── 1. Pack connected components ──
      const container = document.getElementById("graph");
      const W = container.clientWidth;
      const H = container.clientHeight;
      ComponentPacker.pack(GraphState.nodes, GraphState.links, W, H);

      // ── 2. Update SVG positions after packing (one tick to flush) ──
      // Tick handler will pick up new x,y on next frame
      // Force one tick to update all node transforms before reading bbox
      sim.tick(1);

      Lifecycle.transition('COMPONENT_PACK');
    });

    Lifecycle.on('COMPONENT_PACK', () => {
      Lifecycle.transition('FITTING');
      CameraController.initialFit();

      // When the fit animation completes, signal READY
      const fitDuration = animPreset('ENTER').duration;
      svg.transition().on("end", () => {
        if (!Lifecycle.isReady()) {
          Lifecycle.transition('READY');
        }
      });
      // Safety net — only setTimeout in the flow
      setTimeout(() => {
        if (!Lifecycle.isReady()) {
          Lifecycle.transition('READY');
        }
      }, fitDuration + 200);
    });

    // ═══════════════════════════════════════════════════════════
    // READY
    // ═══════════════════════════════════════════════════════════
    Lifecycle.on('READY', () => {
      CameraController.enable();

      // Auto-start narrative
      if (!GraphState.narrativeActive && !GraphState.selectedNode) {
        NarrativeTour.start();
      }
    });

    console.log(
      `Equity Graph · ${GraphState.nodes.length} nodes · ` +
      `${GraphState.links.length} edges · ${GraphState.coNodes.length} companies`
    );
  }

  return { init };
})();

// Boot
document.addEventListener("DOMContentLoaded", App.init);
