// render/edges.js — EdgeRenderer: visible lines + invisible hit areas.
// Reads GraphState. Modifies SVG only via D3 selections.

const EdgeRenderer = (() => {

  let lG, lHit, lVis;

  function init(gContainer) {
    lG = gContainer;
  }

  /** Create / update edge elements */
  function create(allLinks) {
    // Invisible hit area
    lHit = lG.selectAll("line.hit").data(allLinks, d => d.source.id + d.target.id + d.relation).join(
      enter => enter.append("line").attr("class", "hit")
        .attr("stroke", "transparent")
        .attr("stroke-width", Theme.hitStrokeWidth),
      update => update,
      exit => exit.remove()
    );

    // Visible lines
    lVis = lG.selectAll("line.vis").data(allLinks, d => d.source.id + d.target.id + d.relation).join(
      enter => enter.append("line").attr("class", "vis")
        .attr("marker-end", d => "url(#a-" + RelationUtils.edgeStyle(d).c.replace("#", "") + ")"),
      update => update,
      exit => exit.remove()
    );

    lVis.attr("stroke", d => RelationUtils.edgeStyle(d).c)
      .attr("stroke-width", d => RelationUtils.edgeStyle(d).w)
      .attr("stroke-dasharray", d => RelationUtils.edgeStyle(d).d)
      .attr("opacity", Theme.opacity.edgeDefault);

    return { lHit, lVis };
  }

  /** Refresh from state */
  function refresh() {
    if (!lVis) return;

    const hasFilter = GraphState.hasFilters();
    const sel = GraphState.selectedNode;
    const hovered = GraphState.hoveredNode;
    const narrActive = GraphState.narrativeActive;

    if (narrActive) {
      const step = GraphState.narrativeSteps[GraphState.narrativeStep];
      if (step) {
        lVis.attr("opacity", l => {
          const s = l.source.id || l.source, t = l.target.id || l.target;
          return step.highlight.includes(s) && step.highlight.includes(t) ? Theme.opacity.edgeNarrative : 0.02;
        });
      }
      return;
    }

    if (hasFilter) {
      const { nodeIds } = DataModel.getFilteredView();
      lVis.attr("opacity", d => {
        const s = d.source.id || d.source, t = d.target.id || d.target;
        return nodeIds.has(s) && nodeIds.has(t) ? Theme.opacity.edgeDefault : 0.02;
      });
      return;
    }

    if (sel) {
      lVis.attr("opacity", Theme.opacity.edgeSelected);
      return;
    }

    lVis.attr("opacity", Theme.opacity.edgeDefault);
  }

  /** Highlight connected edges on node hover */
  function showConnected(nodeId) {
    lVis.attr("opacity", l => {
      const s = l.source.id || l.source, t = l.target.id || l.target;
      return (s === nodeId || t === nodeId) ? 1 : Theme.opacity.edgeConnectedHover;
    });
  }

  /** Highlight a single edge */
  function highlightEdge(edgeData) {
    lVis.attr("opacity", l => l === edgeData ? Theme.opacity.edgeHover : Theme.opacity.edgeDimmed);
  }

  /** Restore from edge hover */
  function restoreEdgeHover() {
    if (GraphState.selectedNode) {
      lVis.attr("opacity", Theme.opacity.edgeSelected);
    } else if (!GraphState.hasFilters()) {
      lVis.attr("opacity", Theme.opacity.edgeDefault);
    }
  }

  /** Restore from hover */
  function restoreHover() {
    if (GraphState.selectedNode) {
      lVis.attr("opacity", Theme.opacity.edgeSelected);
    } else if (!GraphState.hasFilters()) {
      lVis.attr("opacity", Theme.opacity.edgeDefault);
    } else {
      refresh();
    }
  }

  return { init, create, refresh, showConnected, highlightEdge, restoreEdgeHover, restoreHover, get lHit() { return lHit; }, get lVis() { return lVis; } };
})();
