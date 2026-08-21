// model/data.js — unified data access layer.
// All graph data reads must go through this module.
// When the data source changes (CSV / API / DB), only this file changes.

const DataModel = (() => {

  let _companyIndex = {}; // name → metadata

  /** Initialize from raw data.json { nodes, links } + companies metadata */
  function init(raw, companiesJson) {
    const nodes = raw.nodes.map(n => ({ ...n }));
    const links = raw.links.map(l => {
      const v = l.verified;
      const normalized = v === true || v === "true";
      return { ...l, verified: normalized };
    });

    if (links.length) {
      const types = [...new Set(links.map(l => typeof l.verified))];
      const trueCount = links.filter(l => l.verified).length;
      console.log(
        `[DataModel] verified typeof: ${types.join(', ')} | ` +
        `${trueCount}/${links.length} verified`
      );
    }

    // ── Company metadata index (by name) ──
    if (companiesJson) {
      for (const [code, info] of Object.entries(companiesJson)) {
        if (info.name) _companyIndex[info.name] = info;
      }
      console.log(`[DataModel] companies.json: ${Object.keys(_companyIndex).length} indexed`);
    }

    // Compute degree
    const deg = {};
    nodes.forEach(n => deg[n.id] = 0);
    links.forEach(l => {
      const s = l.source.id || l.source, t = l.target.id || l.target;
      deg[s] = (deg[s] || 0) + 1;
      deg[t] = (deg[t] || 0) + 1;
    });

    // Identify companies
    const coNodes = nodes.filter(n => n.type === "上市公司");
    coNodes.sort((a, b) => a.stock_code.localeCompare(b.stock_code));

    // Populate GraphState
    GraphState.nodes = nodes;
    GraphState.links = links;
    GraphState.deg = deg;
    GraphState.coNodes = coNodes;

    // Populate company filter dropdown
    const cf = document.getElementById("compFilter");
    coNodes.forEach(n => {
      const opt = document.createElement("option");
      opt.value = n.stock_code;
      opt.textContent = `${n.stock_code} ${n.name}`;
      cf.appendChild(opt);
    });

    return { nodes, links, deg, coNodes };
  }

  /** Get company metadata by name. Returns null for non-company nodes. */
  function getCompanyMeta(name) {
    return _companyIndex[name] || null;
  }

  /** Get a single node by id */
  function getNode(id) {
    return GraphState.nodes.find(n => n.id === id) || null;
  }

  /** Get all edges connected to a node */
  function getEdgesForNode(nodeId) {
    return GraphState.links.filter(l => {
      const s = l.source.id || l.source, t = l.target.id || l.target;
      return s === nodeId || t === nodeId;
    });
  }

  /** Get neighbor node ids (1-hop) for a node */
  function getNeighbors(nodeId) {
    const s = new Set();
    GraphState.links.forEach(l => {
      const src = l.source.id || l.source, tgt = l.target.id || l.target;
      if (src === nodeId) s.add(tgt);
      if (tgt === nodeId) s.add(src);
    });
    return [...s];
  }

  /** Get all company node ids */
  function getCompanyIds() {
    return new Set(GraphState.coNodes.map(n => n.id));
  }

  /** Search nodes by keyword (case-insensitive, matches name or stock_code) */
  function search(keyword) {
    if (!keyword) return GraphState.nodes;
    const q = keyword.toLowerCase();
    return GraphState.nodes.filter(n =>
      n.name.toLowerCase().includes(q) ||
      (n.stock_code && n.stock_code.includes(q))
    );
  }

  /** Apply filters to get the currently visible set of links. */
  function getFilteredView() {
    let al = GraphState.links;
    const { filterRelation, filterVerified, filterCompany, searchQuery } = GraphState;

    if (filterCompany)   al = al.filter(l => l.stock_code === filterCompany);
    if (filterRelation === "control")     al = al.filter(l => RelationUtils.isControl(l.relation));
    if (filterRelation === "holding")     al = al.filter(l => RelationUtils.isHolding(l.relation));
    if (filterRelation === "subsidiary")  al = al.filter(l => l.relation === "控股");
    if (filterVerified === "true")        al = al.filter(l => l.verified);
    if (filterVerified === "false")       al = al.filter(l => !l.verified);
    if (searchQuery) {
      const q = searchQuery;
      al = al.filter(l => {
        const s = (l.source.id || l.source).toLowerCase();
        const t = (l.target.id || l.target).toLowerCase();
        return s.includes(q) || t.includes(q);
      });
    }

    const nodeIds = new Set();
    if (GraphState.hasFilters()) al.forEach(l => {
      nodeIds.add(l.source.id || l.source);
      nodeIds.add(l.target.id || l.target);
    });

    return { links: al, nodeIds };
  }

  return { init, getNode, getEdgesForNode, getNeighbors, getCompanyIds, getCompanyMeta, search, getFilteredView };
})();
