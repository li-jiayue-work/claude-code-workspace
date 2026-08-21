// render/ui.js — UIRenderer: detail panel, tooltip, legend, stats.
// All DOM reads/modifications for HTML UI elements go through here.

const UIRenderer = (() => {

  // ── Panel ──

  function openPanel(d) {
    const deg = GraphState.deg[d.id] || 0;
    document.getElementById("panel").classList.remove("hidden");
    document.getElementById("ptitle").textContent = d.name;
    document.getElementById("pmeta").innerHTML = `${d.type}${d.stock_code ? " · " + d.stock_code : ""} · ${deg}条关系`;

    let panelHTML = "";

    // ── Company overview card (上市公司 only) ──
    if (d.type === "上市公司") {
      const meta = DataModel.getCompanyMeta(d.name);
      if (meta) {
        panelHTML += `<div class="co-card">
          <div class="co-card-head">
            <span class="co-card-badge">${meta.board || ""}</span>
            <span class="co-card-badge co-badge-sector">${meta.sector || ""}</span>
            <span class="co-card-code">${meta.stock_code || ""}</span>
          </div>
          <div class="co-card-business">${meta.business || ""}</div>
          <div class="co-card-highlight">${meta.highlight || ""}</div>
        </div>`;
      }
    }

    // ── Relationship list ──
    const nl = DataModel.getEdgesForNode(d.id);
    nl.sort((a, b) => RelationUtils.sortOrder(a.relation) - RelationUtils.sortOrder(b.relation));

    const grp = { ctrl: [], hold: [], concert: [], other: [] };
    nl.forEach(l => grp[RelationUtils.category(l.relation)].push(l));
    const gl = { ctrl: "控制关系", hold: "持股关系", concert: "一致行动人", other: "其他" };

    let hasRelations = false;
    for (const [cat, label] of Object.entries(gl)) {
      if (!grp[cat].length) continue;
      hasRelations = true;
      panelHTML += `<div class="psec-title">${label}</div>`;
      grp[cat].forEach(l => {
        const s = l.source.id || l.source, t = l.target.id || l.target;
        const isS = s === d.id, other = isS ? t : s, dir = isS ? "→" : "←";
        const ic = RelationUtils.category(l.relation);
        panelHTML += `<div class="pcard">
          <div class="pc-row">
            <div class="pc-icon ${ic}">${other.charAt(0)}</div>
            <span class="pc-name">${isS ? d.name : other}</span><span class="pc-arrow">${dir}</span><span class="pc-name">${isS ? other : d.name}</span>
            <span class="pc-weight">${l.weight || ""}</span>
          </div>
          <div class="pc-foot">
            <span class="pc-rel">${l.relation}</span>
            <span class="pc-badge ${l.verified ? 'ok' : 'pend'}">${l.verified ? '已核实' : '待核实'}</span>
            ${l.source_url ? `<a class="pc-src" href="${l.source_url}" target="_blank">原文↗</a>` : ""}
          </div>
        </div>`;
      });
    }
    if (!hasRelations) panelHTML += `<div id="panel-empty">暂无关系数据</div>`;

    document.getElementById("panel-body").innerHTML = panelHTML;
  }

  function closePanel() {
    document.getElementById("panel").classList.add("hidden");
  }

  function isPanelOpen() {
    return !document.getElementById("panel").classList.contains("hidden");
  }

  // ── Tooltip ──

  function showTooltip(e, html) {
    const tt = document.getElementById("tooltip");
    tt.style.opacity = "1";
    tt.innerHTML = html;
    tt.style.left = (e.pageX + 14) + "px";
    tt.style.top = (e.pageY - 14) + "px";
  }

  function moveTooltip(e) {
    const tt = document.getElementById("tooltip");
    tt.style.left = (e.pageX + 14) + "px";
    tt.style.top = (e.pageY - 14) + "px";
  }

  function hideTooltip() {
    document.getElementById("tooltip").style.opacity = "0";
  }

  function nodeTooltipHTML(d, deg) {
    const tLabel = deg > 0 ? ` · ${deg}条关系` : "";
    const meta = DataModel.getCompanyMeta(d.name);
    const sectorLine = (d.type === "上市公司" && meta && meta.sector)
      ? `<div class="tt-sector">${meta.sector}</div>` : "";
    return `<div class="tt-title">${d.name}</div><div class="tt-meta">${d.type}${d.stock_code ? " · " + d.stock_code : ""}${tLabel}</div>${sectorLine}`;
  }

  function edgeTooltipHTML(d) {
    const s = d.source.id || d.source, t = d.target.id || d.target;
    const vLabel = d.verified ? "已核实" : "待核实";
    return `<div class="tt-title">${s} → ${t}</div><div class="tt-meta">${d.relation}${d.weight ? " · " + d.weight : ""} · ${vLabel}</div>`;
  }

  // ── Stats ──

  function updateStats() {
    const { nodes, links } = GraphState;
    document.getElementById("sn").textContent = nodes.length;
    document.getElementById("se").textContent = links.length;
    document.getElementById("sv").textContent = links.filter(l => l.verified).length;
  }

  // ── Narrative UI ──

  function showNarrativeOverlay() {
    document.getElementById("narrative").classList.remove("hidden");
  }

  function hideNarrativeOverlay() {
    document.getElementById("narrative").classList.add("hidden");
  }

  function updateNarrativeUI() {
    const step = GraphState.narrativeSteps[GraphState.narrativeStep];
    if (!step) return;
    const co = GraphState.narrativeCo;
    const total = GraphState.narrativeSteps.length;
    const idx = GraphState.narrativeStep;

    document.getElementById("nr-step").textContent = `第${idx + 1}步 / 共${total}步 · ${step.title}`;
    document.getElementById("nr-msg").innerHTML = step.msg;
    document.getElementById("nr-avatar").style.background = step.color;
    document.getElementById("nr-avatar").textContent = co.name.charAt(0);

    // Progress dots
    const container = document.getElementById("nr-progress");
    container.innerHTML = "";
    for (let i = 0; i < total; i++) {
      const dot = document.createElement("span");
      dot.className = i === idx ? "nr-dot active" : "nr-dot";
      container.appendChild(dot);
    }

    document.getElementById("nr-prev").style.display = idx > 0 ? "inline-block" : "none";
    document.getElementById("nr-next").textContent = idx === total - 1 ? "完成" : "下一步 →";
  }

  return {
    openPanel, closePanel, isPanelOpen,
    showTooltip, moveTooltip, hideTooltip, nodeTooltipHTML, edgeTooltipHTML,
    updateStats,
    showNarrativeOverlay, hideNarrativeOverlay, updateNarrativeUI,
  };
})();
