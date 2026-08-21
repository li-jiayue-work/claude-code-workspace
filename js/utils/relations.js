// utils/relations.js — pure functions for relation classification and visual encoding.
// No side effects. No DOM access. References Theme for all visual values.

const RelationUtils = (() => {
  const CTRL = new Set(["实际控制人", "控股股东", "共同实际控制人", "实际控制状态", "控股状态", "控制"]);
  const HOLD = new Set(["持股", "法定代表人"]);
  const CNCRT = new Set(["一致行动人"]);

  function isControl(rel)   { return CTRL.has(rel); }
  function isHolding(rel)   { return HOLD.has(rel); }
  function isConcert(rel)   { return CNCRT.has(rel); }

  /** "ctrl" | "hold" | "concert" | "other" */
  function category(rel) {
    if (CTRL.has(rel))   return "ctrl";
    if (HOLD.has(rel))   return "hold";
    if (CNCRT.has(rel))  return "concert";
    return "other";
  }

  /** Sort order 0–3 for importance */
  function sortOrder(rel) {
    if (CTRL.has(rel))   return 0;
    if (HOLD.has(rel))   return 1;
    if (CNCRT.has(rel))  return 2;
    return 3;
  }

  /** Visual style for an edge: { c, w, d } */
  function edgeStyle(d) {
    const v = d.verified;
    if (CTRL.has(d.relation))   return { c: Theme.edgeControl,  w: Theme.edgeWidth.control, d: v ? "" : "6,3" };
    if (CNCRT.has(d.relation))  return { c: Theme.edgeConcert,  w: Theme.edgeWidth.concert, d: "5,3" };
    if (HOLD.has(d.relation))   return { c: v ? Theme.edgeHolding : Theme.edgePending, w: Theme.edgeWidth.holding, d: v ? "" : "5,3" };
    return { c: Theme.edgeOther, w: Theme.edgeWidth.other, d: "" };
  }

  return { CTRL, HOLD, CNCRT, isControl, isHolding, isConcert, category, sortOrder, edgeStyle };
})();
