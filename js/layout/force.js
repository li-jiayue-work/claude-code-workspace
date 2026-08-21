// layout/force.js — Cluster force simulation with grid pre-layout.
//
// Flow:
//   1. ComponentPacker.findComponents() → identify disconnected subgraphs
//   2. ComponentPacker.shelfPack()      → assign each component a grid cell
//   3. Set node positions to grid cells, store as anchor (_ax, _ay)
//   4. Run force simulation:
//      - link:     springs along edges
//      - charge:   moderate repulsion (companies: -350)
//      - collide:  prevent overlap
//      - cluster:  soft attraction to primary company
//      - gridAnchor: weak pull toward pre-layout position
//   5. Post-sim: ComponentPacker.pack() in app.js for final cleanup
//
// Result: components stay near their grid cells → initial view looks
// like the "fit screen" result without user action.

const ForceLayout = (() => {

  function buildNodeCompanyMap(nodes, links, coSet) {
    const nodeCo = {};
    links.forEach(l => {
      const s = l.source.id || l.source, t = l.target.id || l.target;
      if (coSet.has(s) && !coSet.has(t)) {
        if (!nodeCo[t]) nodeCo[t] = [];
        nodeCo[t].push(s);
      }
      if (coSet.has(t) && !coSet.has(s)) {
        if (!nodeCo[s]) nodeCo[s] = [];
        nodeCo[s].push(t);
      }
    });
    nodes.forEach(n => {
      if (coSet.has(n.id)) return;
      if (!nodeCo[n.id] || !nodeCo[n.id].length) {
        nodeCo[n.id] = [GraphState.coNodes[0].id];
      }
    });
    return nodeCo;
  }

  function primaryCo(n, nodeCo, coSet) {
    if (coSet.has(n.id)) return n.id;
    const parents = nodeCo[n.id] || [GraphState.coNodes[0].id];
    const cnt = {};
    parents.forEach(p => cnt[p] = (cnt[p] || 0) + 1);
    return Object.entries(cnt).sort((a, b) => b[1] - a[1])[0][0];
  }

  // ═══════════════════════════════════════════════════════════════
  // Pre-layout: grid-pack components into compact viewport region
  // ═══════════════════════════════════════════════════════════════
  function preLayout(nodes, links, W, H) {
    // Step 1: scatter nodes so ComponentPacker can find their bbox
    // (nodes have no x,y yet — give them minimal initial positions)
    const cx = W / 2, cy = H / 2;
    nodes.forEach((n, i) => {
      n.x = cx + (Math.random() - 0.5) * 200;
      n.y = cy + (Math.random() - 0.5) * 200;
    });

    // Step 2: find components and compute bbox
    const compsRaw = ComponentPacker.findComponents(nodes, links);
    if (compsRaw.length <= 1) return; // single component, no packing needed

    const components = compsRaw.map(compNodes => ({
      nodes: compNodes,
      bbox: ComponentPacker.bboxOf(compNodes),
    }));

    // Step 3: shelf-pack into viewport-sized rows
    const PAD = 40;
    const sorted = components
      .map(c => ({ ...c }))
      .sort((a, b) => (b.bbox.w * b.bbox.h) - (a.bbox.w * a.bbox.h));

    const maxCompW = Math.max(...sorted.map(c => c.bbox.w));
    const shelfW = Math.max(W, maxCompW + PAD * 2);

    let shelfX = 0, shelfY = 0, shelfBottom = 0;
    const packed = [];

    for (const comp of sorted) {
      if (shelfX > 0 && shelfX + comp.bbox.w > shelfW) {
        shelfX = 0;
        shelfY = shelfBottom + PAD;
        shelfBottom = 0;
      }
      const dx = shelfX - comp.bbox.x;
      const dy = shelfY - comp.bbox.y;
      packed.push({ ...comp, dx, dy });
      shelfX += comp.bbox.w + PAD;
      shelfBottom = Math.max(shelfBottom, shelfY + comp.bbox.h);
    }

    const totalW = shelfW;
    const totalH = shelfBottom + PAD;
    const shiftX = (W - totalW) / 2;
    const shiftY = (H - totalH) / 2;

    // Step 4: apply offsets → nodes are now grid-packed
    for (const comp of packed) {
      const offX = comp.dx + shiftX;
      const offY = comp.dy + shiftY;
      for (const n of comp.nodes) {
        n.x += offX;
        n.y += offY;
      }
    }

    // Step 5: store anchor positions (weak force will pull toward these)
    for (const n of nodes) {
      n._ax = n.x;
      n._ay = n.y;
    }

    console.log(
      `[ForceLayout] Pre-layout: ${components.length} components grid-packed`
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // Cluster Simulation
  // ═══════════════════════════════════════════════════════════════
  function createClusterSimulation() {
    const { nodes, links, coNodes, deg } = GraphState;
    const coSet = new Set(coNodes.map(n => n.id));
    const container = document.getElementById("graph");
    const W = container.clientWidth;
    const H = container.clientHeight;
    const Ly = Theme.layout;
    const nodeCo = buildNodeCompanyMap(nodes, links, coSet);

    // ── Phase 1: Grid pre-layout ──
    preLayout(nodes, links, W, H);

    // ── Phase 2: Force simulation ──
    const sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(d => {
        const cat = RelationUtils.sortOrder(d.relation);
        return Ly.linkDistBase + cat * Ly.linkDistPerCat;
      }))
      .force("charge", d3.forceManyBody().strength(d => {
        if (d.type === "上市公司") return Ly.companyCharge;
        const dg = deg[d.id] || 1;
        return Ly.chargeBase - dg * Ly.chargePerDeg;
      }))
      .force("collide", d3.forceCollide().radius(d => {
        const base = Theme.nodeRadius[d.type] + Ly.collidePadding;
        return d.type === "上市公司" ? base + Ly.companyCollideExtra : base;
      }))
      .force("cluster", () => {
        for (const n of nodes) {
          if (coSet.has(n.id)) continue;
          const pc = primaryCo(n, nodeCo, coSet);
          const co = coNodes.find(c => c.id === pc);
          if (!co) continue;
          n.vx += (co.x - n.x) * Ly.clusterStrength;
          n.vy += (co.y - n.y) * Ly.clusterStrength;
        }
      })
      // ── Grid anchor: weak pull back to pre-layout position ──
      .force("gridAnchor", () => {
        for (const n of nodes) {
          if (n._ax == null) continue;
          n.vx += (n._ax - n.x) * Ly.gridAnchorStrength;
          n.vy += (n._ay - n.y) * Ly.gridAnchorStrength;
        }
      })
      .alphaDecay(Ly.alphaDecay);

    return sim;
  }

  return { createClusterSimulation, buildNodeCompanyMap, primaryCo };
})();
