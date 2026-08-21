// interaction/select.js — SelectionManager: node click → open/close panel.
// Only updates GraphState and calls Renderer methods. Never touches SVG directly.

const SelectionManager = (() => {

  function bind(nGrp) {
    // Node click
    nGrp.on("click", function (e, d) {
      if (!Lifecycle.isReady()) return;
      e.stopPropagation();
      if (GraphState.selectedNode === d.id) {
        deselect();
        return;
      }
      select(d);
    });

    // Background click → deselect
    // (bound in app.js on svg)
  }

  function select(d) {
    GraphState.selectedNode = d.id;
    NodeRenderer.refresh();
    EdgeRenderer.refresh();
    UIRenderer.openPanel(d);
  }

  function deselect() {
    GraphState.clearSelection();
    UIRenderer.closePanel();
    NodeRenderer.refresh();
    EdgeRenderer.refresh();
  }

  function bindBackground(svg) {
    svg.on("click", () => {
      if (!Lifecycle.isReady()) return;
      if (GraphState.narrativeActive) return;
      deselect();
    });
  }

  function closePanelButton() {
    document.getElementById("panel-close").addEventListener("click", deselect);
  }

  return { bind, select, deselect, bindBackground, closePanelButton };
})();
