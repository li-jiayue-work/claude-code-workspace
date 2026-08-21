// interaction/filters.js — FilterManager + SearchManager.
// Binds DOM events for search, relation filter, verified filter, company filter.
// Updates GraphState then calls renderer refresh.

const FilterManager = (() => {

  function bind() {
    document.getElementById("relFilter").addEventListener("change", function () {
      if (!Lifecycle.isReady()) return;
      GraphState.filterRelation = this.value;
      applyFilters();
    });
    document.getElementById("verFilter").addEventListener("change", function () {
      if (!Lifecycle.isReady()) return;
      GraphState.filterVerified = this.value;
      applyFilters();
    });
    document.getElementById("compFilter").addEventListener("change", function () {
      if (!Lifecycle.isReady()) return;
      GraphState.filterCompany = this.value;
      applyFilters();
    });
    document.getElementById("search").addEventListener("input", function () {
      if (!Lifecycle.isReady()) return;
      GraphState.searchQuery = this.value.toLowerCase();
      applyFilters();
    });
  }

  function applyFilters() {
    if (GraphState.narrativeActive) return;

    const hasFilter = GraphState.hasFilters();
    const sel = GraphState.selectedNode;

    if (!hasFilter) {
      // Reset to defaults
      NodeRenderer.refresh();
      EdgeRenderer.refresh();
      return;
    }

    const { links: al, nodeIds } = DataModel.getFilteredView();

    const lVis = EdgeRenderer.lVis;
    if (lVis) {
      lVis.attr("opacity", d => {
        const s = d.source.id || d.source, t = d.target.id || d.target;
        return nodeIds.has(s) && nodeIds.has(t) ? Theme.opacity.edgeDefault : 0.02;
      });
    }

    const nGrp = NodeRenderer.nGrp;
    const nLab = NodeRenderer.nLab;
    if (nGrp) {
      nGrp.attr("opacity", d => !nodeIds.has(d.id) ? 0.1 : (sel && d.id !== sel ? Theme.opacity.nodeSelected : 1));
    }
    if (nLab) {
      nLab.attr("opacity", d => {
        if (d.type === "上市公司" && nodeIds.has(d.id)) return 1;
        return (sel === d.id || (d.type === "上市公司" && nodeIds.has(d.id))) ? 1 : 0;
      });
    }
  }

  return { bind, applyFilters };
})();
