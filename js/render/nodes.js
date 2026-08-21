// render/nodes.js — NodeRenderer: SVG shape, pending ring, label.
// Reads GraphState. Modifies SVG only via D3 selections held in RenderContext.

const NodeRenderer = (() => {

  let nG, nGrp, nLab; // D3 selections set during init

  function init(gContainer) {
    nG = gContainer;
    return nG;
  }

  /** Create node groups with enter/update/exit. Returns D3 selection of node groups. */
  function create(allNodes) {
    nGrp = nG.selectAll("g.node").data(allNodes, d => d.id).join(
      enter => {
        const g = enter.append("g").attr("class", "node").attr("cursor", "pointer");
        return g.call(d3.drag()
          .on("start", onDragStart)
          .on("drag", onDragMove)
          .on("end", onDragEnd)
        );
      },
      update => update,
      exit => exit.remove()
    );

    // Pending ring
    nGrp.selectAll("circle.pend").data(d => [d]).join("circle")
      .attr("class", "pend")
      .attr("r", d => Theme.nodeRadius[d.type] + 3)
      .attr("fill", "none")
      .attr("stroke", d => d.verified ? "none" : Theme.pendingRing.stroke)
      .attr("stroke-width", Theme.pendingRing.width)
      .attr("stroke-dasharray", Theme.pendingRing.dashArray)
      .attr("opacity", d => d.verified ? 0 : Theme.opacity.pendingRing);

    // Main shape
    nGrp.each(function (d) {
      const el = d3.select(this);
      const existingCircle = el.select("circle.shape").node();
      const existingRect = el.select("rect.shape").node();
      const r = Theme.nodeRadius[d.type];

      if (d.type === "机构股东") {
        if (existingCircle) el.select("circle.shape").remove();
        const sel = existingRect ? el.select("rect.shape") : el.append("rect").attr("class", "shape");
        sel.attr("x", -r - 3).attr("y", -r + 3)
          .attr("width", (r + 3) * 2).attr("height", (r - 3) * 2)
          .attr("rx", r - 3)
          .attr("fill", Theme.nodeColor[d.type])
          .attr("stroke", "#fff")
          .attr("stroke-width", Theme.stroke.instWidth);
      } else {
        if (existingRect) el.select("rect.shape").remove();
        const sel = existingCircle ? el.select("circle.shape") : el.append("circle").attr("class", "shape");
        sel.attr("r", r)
          .attr("fill", Theme.nodeColor[d.type])
          .attr("stroke", "#fff")
          .attr("stroke-width", d.type === "上市公司" ? Theme.stroke.coWidth : Theme.stroke.nodeWidth);
      }
    });

    return nGrp;
  }

  /** Create / update labels */
  function createLabels() {
    nLab = nGrp.selectAll("text.label").data(d => [d]).join("text")
      .attr("class", "label")
      .text(d => {
        const nm = d.name;
        if (nm.length <= Theme.label.maxLength) return nm;
        if (nm.length > Theme.label.truncateAt) return nm.slice(0, Theme.label.truncateLength) + "…";
        return nm;
      })
      .attr("font-family", Theme.label.fontFamily)
      .attr("font-size", d => d.type === "上市公司" ? Theme.label.fontSizeCo : Theme.label.fontSizeNode)
      .attr("font-weight", d => d.type === "上市公司" ? Theme.label.fontWeightCo : Theme.label.fontWeightNode)
      .attr("fill", d => d.type === "上市公司" ? Theme.label.colorCo : Theme.label.colorNode)
      .attr("dx", Theme.label.offsetX)
      .attr("dy", Theme.label.offsetY)
      .attr("pointer-events", "none")
      .attr("opacity", d => d.type === "上市公司" ? 1 : 0);

    return nLab;
  }

  /** Update visibility based on current state */
  function refresh() {
    if (!nGrp) return;

    const hasFilter = GraphState.hasFilters();
    const sel = GraphState.selectedNode;
    const hovered = GraphState.hoveredNode;
    const narrActive = GraphState.narrativeActive;

    // Narrative mode takes precedence
    if (narrActive) {
      const step = GraphState.narrativeSteps[GraphState.narrativeStep];
      if (step) {
        nGrp.attr("opacity", n => step.highlight.includes(n.id) ? 1 : Theme.opacity.nodeNarrativeBg);
        nLab.attr("opacity", n => step.highlight.includes(n.id) ? 1 : 0);
      }
      return;
    }

    // Filtered state
    if (hasFilter) {
      const { nodeIds } = DataModel.getFilteredView();
      nGrp.attr("opacity", d => !nodeIds.has(d.id) ? 0.1 : (sel && d.id !== sel ? Theme.opacity.nodeSelected : 1));
      nLab.attr("opacity", d => {
        if (d.type === "上市公司" && nodeIds.has(d.id)) return 1;
        return (sel === d.id || (d.type === "上市公司" && nodeIds.has(d.id))) ? 1 : 0;
      });
      return;
    }

    // Selection active
    if (sel) {
      nGrp.attr("opacity", n => n.id === sel ? 1 : Theme.opacity.nodeSelected);
      nLab.attr("opacity", n => n.id === sel ? 1 : 0);
      return;
    }

    // Default
    nGrp.attr("opacity", 1);
    nLab.attr("opacity", n => n.type === "上市公司" ? 1 : 0);
  }

  /** Highlight connected nodes on hover */
  function showConnected(id) {
    const neighbors = DataModel.getNeighbors(id);
    const cn = new Set([id, ...neighbors]);
    nGrp.attr("opacity", n => cn.has(n.id) ? 1 : Theme.opacity.nodeDimmed);
  }

  /** Restore from hover */
  function restoreHover() {
    if (GraphState.selectedNode) {
      nGrp.attr("opacity", n => n.id === GraphState.selectedNode ? 1 : Theme.opacity.nodeSelected);
    } else if (!GraphState.hasFilters()) {
      nGrp.attr("opacity", 1);
    }
  }

  // ── Drag handlers (pass-through to simulation) ──
  function setSim(sim) { NodeRenderer._sim = sim; }

  function onDragStart(e, d) {
    if (!e.active) NodeRenderer._sim.alphaTarget(Theme.layout.alphaRestart).restart();
    d.fx = d.x; d.fy = d.y;
  }
  function onDragMove(e, d) { d.fx = e.x; d.fy = e.y; }
  function onDragEnd(e, d) {
    if (!e.active) NodeRenderer._sim.alphaTarget(0);
    if (d.type !== "上市公司") { d.fx = null; d.fy = null; }
  }

  return { init, create, createLabels, refresh, showConnected, restoreHover, setSim, get nGrp() { return nGrp; }, get nLab() { return nLab; } };
})();
