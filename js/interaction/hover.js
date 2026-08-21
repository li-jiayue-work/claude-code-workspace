// interaction/hover.js — HoverManager: node and edge mouseenter/mouseleave.
// Only updates GraphState and calls Renderer methods. Never touches SVG directly.

const HoverManager = (() => {

  function bind(lHit, lVis, nGrp, nLab) {
    // ── Edge hover ──
    lHit.on("mouseenter", function (e, d) {
      if (!Lifecycle.isReady()) return;
      GraphState.hoveredEdge = d;
      const s = d.source.id || d.source, t = d.target.id || d.target;
      const vLabel = d.verified ? "已核实" : "待核实";
      UIRenderer.showTooltip(e, `<div class="tt-title">${s} → ${t}</div><div class="tt-meta">${d.relation}${d.weight ? " · " + d.weight : ""} · ${vLabel}</div>`);
      EdgeRenderer.highlightEdge(d);
    }).on("mousemove", function (e) {
      if (!Lifecycle.isReady()) return;
      UIRenderer.moveTooltip(e);
    }).on("mouseleave", function () {
      if (!Lifecycle.isReady()) return;
      GraphState.hoveredEdge = null;
      UIRenderer.hideTooltip();
      if (!GraphState.selectedNode) EdgeRenderer.restoreEdgeHover();
    });

    // ── Node hover ──
    nGrp.on("mouseenter", function (e, d) {
      if (!Lifecycle.isReady()) return;
      GraphState.hoveredNode = d.id;
      d3.select(this).style("filter", "url(#glow)");

      UIRenderer.showTooltip(e, UIRenderer.nodeTooltipHTML(d, GraphState.deg[d.id] || 0));

      // Show connected
      NodeRenderer.showConnected(d.id);
      EdgeRenderer.showConnected(d.id);

      // Show hovered node's label
      nLab.filter(n => n.id === d.id).attr("opacity", 1);
    }).on("mousemove", function (e) {
      if (!Lifecycle.isReady()) return;
      UIRenderer.moveTooltip(e);
    }).on("mouseleave", function (e, d) {
      if (!Lifecycle.isReady()) return;
      GraphState.hoveredNode = null;
      d3.select(this).style("filter", null);
      UIRenderer.hideTooltip();

      if (!GraphState.selectedNode) {
        // Full restore
        if (!GraphState.hasFilters()) {
          NodeRenderer.refresh();
          EdgeRenderer.refresh();
        } else {
          // Restore filters
          FilterManager.applyFilters();
        }
      } else {
        // Restore selection state
        NodeRenderer.refresh();
        EdgeRenderer.restoreHover();
      }
    });
  }

  return { bind };
})();
