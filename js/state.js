// state.js — centralized GraphState singleton.
// All modules read from and write to this single state object.
// No module maintains its own private state.

const GraphState = {
  // ── Raw data ──
  nodes: [],
  links: [],
  deg: {},         // node id → connection count
  coNodes: [],     // company-type nodes (sorted by stock_code)

  // ── UI selection state ──
  selectedNode: null,      // node id currently selected (panel open)
  hoveredNode: null,       // node id currently hovered
  hoveredEdge: null,       // { source, target, relation } currently hovered

  // ── Filter state ──
  filterRelation: "",      // "" | "control" | "holding" | "subsidiary"
  filterVerified: "",      // "" | "true" | "false"
  filterCompany:  "",      // "" | stock_code
  searchQuery:    "",      // raw search string

  // ── Narrative mode ──
  narrativeActive: false,
  narrativeStep:   0,
  narrativeSteps:  [],
  narrativeCo:     null,

  // ── Convenience helpers ──

  /** All nodes currently relevant (after company filter) */
  activeNodes() {
    if (!this.filterCompany) return this.nodes;
    const code = this.filterCompany;
    const ids = new Set([code]);
    this.links.forEach(l => {
      const s = l.source.id || l.source, t = l.target.id || l.target;
      if (s === code) ids.add(t);
      if (t === code) ids.add(s);
    });
    return this.nodes.filter(n => ids.has(n.id));
  },

  /** Is a relation-filter active? */
  hasFilters() {
    return !!(this.filterRelation || this.filterVerified || this.filterCompany || this.searchQuery);
  },

  /** Reset all selections */
  clearSelection() {
    this.selectedNode = null;
  },

  /** Reset narrative state */
  clearNarrative() {
    this.narrativeActive = false;
    this.narrativeStep = 0;
    this.narrativeSteps = [];
    this.narrativeCo = null;
  },
};
