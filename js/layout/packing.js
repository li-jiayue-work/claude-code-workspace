// layout/packing.js — Connected Component Packing.
//
// Runs BETWEEN simulation end and camera fit.
//   SIMULATING → LAYOUT_STABLE → COMPONENT_PACK → FITTING → READY
//
// Strategy:
//   1. BFS on the link graph to find connected components.
//   2. Compute bounding box for each component.
//   3. Sort by area (largest first).
//   4. Shelf-pack components into rows (left-to-right, wrap when needed).
//      Row height = tallest component in that row.
//   5. Translate every node in each component by its computed offset.
//      Internal relative positions are preserved exactly.
//   6. After packing, all components sit within a compact rectangle
//      → Camera.fitScreen produces a natural, readable zoom level.
//
// Pure layout operation. Touches no UI, no Camera, no Interaction.

const ComponentPacker = (() => {

  const PADDING = 40; // px between components

  // ── BFS: find all connected components ──
  function findComponents(nodes, links) {
    const adj = {};
    nodes.forEach(n => adj[n.id] = []);
    links.forEach(l => {
      const s = l.source.id || l.source;
      const t = l.target.id || l.target;
      if (adj[s]) adj[s].push(t);
      if (adj[t]) adj[t].push(s);
    });

    const visited = new Set();
    const components = [];

    for (const n of nodes) {
      if (visited.has(n.id)) continue;
      // BFS
      const comp = [];
      const queue = [n.id];
      visited.add(n.id);
      while (queue.length) {
        const cur = queue.shift();
        const node = nodes.find(nd => nd.id === cur);
        if (node) comp.push(node);
        for (const nb of (adj[cur] || [])) {
          if (!visited.has(nb)) {
            visited.add(nb);
            queue.push(nb);
          }
        }
      }
      if (comp.length) components.push(comp);
    }
    return components;
  }

  // ── Bounding box of a set of nodes ──
  function bboxOf(compNodes) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of compNodes) {
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x > maxX) maxX = n.x;
      if (n.y > maxY) maxY = n.y;
    }
    const w = maxX - minX;
    const h = maxY - minY;
    // Include node radius in bbox
    const r = Theme.nodeRadius[compNodes[0]?.type] || 10;
    return { x: minX - r, y: minY - r, w: w + r * 2, h: h + r * 2 };
  }

  // ── Shelf packing: arrange components in rows ──
  function shelfPack(components, viewportW, viewportH) {
    // Sort by bbox area descending
    const sorted = components
      .map(c => ({ ...c }))
      .sort((a, b) => (b.bbox.w * b.bbox.h) - (a.bbox.w * a.bbox.h));

    // Shelf width: viewport width, or wider if needed by the largest component
    const maxCompW = Math.max(...sorted.map(c => c.bbox.w));
    const shelfW = Math.max(viewportW, maxCompW + PADDING * 2);

    let shelfX = 0;
    let shelfY = 0;
    let shelfBottom = 0;
    const result = [];

    for (const comp of sorted) {
      // Does this component fit on the current shelf?
      if (shelfX > 0 && shelfX + comp.bbox.w > shelfW) {
        // Start new shelf
        shelfX = 0;
        shelfY = shelfBottom + PADDING;
        shelfBottom = 0;
      }

      // Offset: move component's bbox top-left to (shelfX, shelfY)
      const dx = shelfX - comp.bbox.x;
      const dy = shelfY - comp.bbox.y;
      result.push({ ...comp, dx, dy, shelfX, shelfY });

      // Advance on shelf
      shelfX += comp.bbox.w + PADDING;
      shelfBottom = Math.max(shelfBottom, shelfY + comp.bbox.h);
    }

    // ── Center the entire packed layout ──
    const totalW = shelfW;
    const totalH = shelfBottom + PADDING;
    const shiftX = (viewportW - totalW) / 2;
    const shiftY = (viewportH - totalH) / 2;

    for (const r of result) {
      r.dx += shiftX;
      r.dy += shiftY;
    }

    return result;
  }

  // ── Translate nodes ──
  function applyOffsets(packed) {
    for (const comp of packed) {
      for (const n of comp.nodes) {
        n.x += comp.dx;
        n.y += comp.dy;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Public API
  // ═══════════════════════════════════════════════════════════════

  /**
   * Pack connected components into the viewport.
   * Called once, after simulation ends, before camera fit.
   *
   * @param {Array} nodes  — simulation nodes (mutated: x,y updated)
   * @param {Array} links  — simulation links
   * @param {number} viewportW
   * @param {number} viewportH
   */
  function pack(nodes, links, viewportW, viewportH) {
    const componentsRaw = findComponents(nodes, links);
    if (componentsRaw.length <= 1) return; // nothing to pack

    const components = componentsRaw.map(compNodes => ({
      nodes: compNodes,
      bbox: bboxOf(compNodes),
    }));

    const packed = shelfPack(components, viewportW, viewportH);

    applyOffsets(packed);

    console.log(
      `[ComponentPacker] ${components.length} components packed into ` +
      `${viewportW}x${viewportH} viewport`
    );
  }

  return { pack, findComponents, bboxOf };
})();
