// ui/narrative.js — Narrative Mode: auto-guided tour through company relationships.
// Builds step data, advances/rewinds, coordinates camera + highlights via renderers.

const NarrativeTour = (() => {

  /** Build narrative steps for a company */
  function buildSteps(coNode) {
    const cId = coNode.id, cName = coNode.name;
    const steps = [];
    const related = { ctrl: [], hold: [], concert: [], sub: [] };

    GraphState.links.forEach(l => {
      const s = l.source.id || l.source, t = l.target.id || l.target;
      if (s === cId || t === cId) {
        const other = s === cId ? t : s;
        const node = GraphState.nodes.find(n => n.id === other);
        if (!node) return;
        const cat = RelationUtils.category(l.relation);
        if (cat === "ctrl") related.ctrl.push({ node, link: l });
        else if (cat === "hold") related.hold.push({ node, link: l });
        else if (cat === "concert") related.concert.push({ node, link: l });
        else related.sub.push({ node, link: l });
      }
    });

    // Step 0: company intro
    steps.push({
      title: "公司简介",
      msg: `<strong>${cName}</strong>（${coNode.stock_code}），跨境电商上市公司。`,
      highlight: [cId],
      color: Theme.nodeColor["上市公司"],
    });

    // Step 1: controllers
    if (related.ctrl.length) {
      const seen = new Set();
      const unique = related.ctrl.filter(r => {
        if (seen.has(r.node.name)) return false;
        seen.add(r.node.name);
        return true;
      });
      const names = unique.map(r => r.node.name).join("、");
      const pcts = unique.filter(r => r.link.weight).map(r => `${r.node.name}持股${r.link.weight}`).join("，");
      const rel = unique[0].link.relation.includes("共同") ? "共同实际控制" : "实际控制";
      steps.push({
        title: "实际控制人",
        msg: `<strong>${names}</strong>为${cName}${rel}人${pcts ? "（" + pcts + "）" : ""}。`,
        highlight: [cId, ...unique.map(r => r.node.id)],
        color: Theme.edgeControl,
      });
    }

    // Step 2: controlling shareholder (skip if already shown as controller)
    const ctrlNames = new Set(related.ctrl.map(r => r.node.name));
    const ctrlSH = related.ctrl.filter(r => r.link.relation === "控股股东" && !ctrlNames.has(r.node.name));
    if (ctrlSH.length) {
      const names = ctrlSH.map(r => r.node.name).join("、");
      const pcts = ctrlSH.filter(r => r.link.weight).map(r => `${r.node.name}持股${r.link.weight}`).join("，");
      steps.push({
        title: "控股股东",
        msg: `<strong>${names}</strong>为${cName}控股股东${pcts ? "（" + pcts + "）" : ""}。`,
        highlight: [cId, ...ctrlSH.map(r => r.node.id)],
        color: "#1e4a7a",
      });
    }

    // Step 3: concert parties
    if (related.concert.length) {
      const names = related.concert.map(r => r.node.name).join("、");
      const pcts = related.concert.filter(r => r.link.weight).map(r => `${r.node.name}（${r.link.weight}）`).join("，");
      steps.push({
        title: "一致行动人",
        msg: `<strong>${names}</strong>为${cName}一致行动人${pcts ? "。" + pcts : ""}。`,
        highlight: [cId, ...related.concert.map(r => r.node.id)],
        color: Theme.edgeConcert,
      });
    }

    // Step 4: key shareholders
    const shNodes = related.hold.filter(r => !ctrlNames.has(r.node.name) && r.node.type === "自然人");
    const instNodes = related.hold.filter(r => r.node.type === "机构股东");
    if (shNodes.length || instNodes.length) {
      const allSH = [...shNodes, ...instNodes];
      const names = allSH.slice(0, 5).map(r => r.node.name + (r.link.weight ? "(" + r.link.weight + ")" : "")).join("、");
      const more = allSH.length > 5 ? `等${allSH.length}个持股主体` : "";
      steps.push({
        title: "主要股东",
        msg: `${cName}的主要股东包括：<strong>${names}</strong>${more}。`,
        highlight: [cId, ...allSH.map(r => r.node.id)],
        color: Theme.edgeHolding,
      });
    }

    // Step 5: subsidiaries
    const subNodes = related.sub.filter(r => r.link.relation === "控股");
    if (subNodes.length) {
      const names = subNodes.slice(0, 4).map(r => r.node.name).join("、");
      const more = subNodes.length > 4 ? `等${subNodes.length}家子公司` : "";
      steps.push({
        title: "控股子公司",
        msg: `${cName}控股<strong>${names}</strong>${more}。`,
        highlight: [cId, ...subNodes.map(r => r.node.id)],
        color: Theme.edgeOther,
      });
    }

    return steps;
  }

  /** Show current step */
  function showStep() {
    const step = GraphState.narrativeSteps[GraphState.narrativeStep];
    if (!step) return;
    UIRenderer.updateNarrativeUI();

    // Highlight via renderers
    const nGrp = NodeRenderer.nGrp;
    const lVis = EdgeRenderer.lVis;
    const nLab = NodeRenderer.nLab;

    if (nGrp) nGrp.attr("opacity", n => step.highlight.includes(n.id) ? 1 : Theme.opacity.nodeNarrativeBg);
    if (lVis) lVis.attr("opacity", l => {
      const s = l.source.id || l.source, t = l.target.id || l.target;
      return step.highlight.includes(s) && step.highlight.includes(t) ? Theme.opacity.edgeNarrative : 0.02;
    });
    if (nLab) nLab.attr("opacity", n => step.highlight.includes(n.id) ? 1 : 0);

    // Pan to narrative company (via Camera queue)
    const co = DataModel.getNode(GraphState.narrativeCo.id);
    if (co) CameraController.request('focus', { node: co });
  }

  /** Start narrative */
  function start() {
    const candidates = GraphState.coNodes.filter(n => {
      const rls = DataModel.getEdgesForNode(n.id);
      return rls.length >= 6;
    });
    const co = candidates[Math.floor(Math.random() * candidates.length)] || GraphState.coNodes[0];

    GraphState.narrativeActive = true;
    GraphState.narrativeStep = 0;
    GraphState.narrativeCo = co;
    GraphState.narrativeSteps = buildSteps(co);

    if (!GraphState.narrativeSteps.length) {
      GraphState.clearNarrative();
      return;
    }

    UIRenderer.showNarrativeOverlay();
    showStep();
  }

  /** Next step */
  function next() {
    if (GraphState.narrativeStep < GraphState.narrativeSteps.length - 1) {
      GraphState.narrativeStep++;
      showStep();
    } else {
      exit();
    }
  }

  /** Previous step */
  function prev() {
    if (GraphState.narrativeStep > 0) {
      GraphState.narrativeStep--;
      showStep();
    }
  }

  /** Exit narrative */
  function exit() {
    GraphState.clearNarrative();
    GraphState.clearSelection();
    UIRenderer.hideNarrativeOverlay();
    NodeRenderer.refresh();
    EdgeRenderer.refresh();
  }

  function bind() {
    document.getElementById("nr-next").addEventListener("click", next);
    document.getElementById("nr-prev").addEventListener("click", prev);
    document.getElementById("nr-exit").addEventListener("click", exit);
  }

  return { buildSteps, start, next, prev, exit, showStep, bind };
})();
