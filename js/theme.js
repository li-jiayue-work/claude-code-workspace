// theme.js — centralized design tokens: colors, sizes, animation presets
// Every visual constant in the project references these values.
// No hardcoded colors/sizes/durations anywhere else.

const Theme = {
  // ── Node Colors ──
  nodeColor: {
    "上市公司": "#0f2340",
    "自然人":   "#3b82f6",
    "机构股东":  "#7ba5c9",
    "子公司":    "#94a3b8",
  },

  // ── Node Radii ──
  nodeRadius: {
    "上市公司": 20,
    "自然人":   13,
    "机构股东":  10,
    "子公司":    8,
  },

  // ── Edge Colors (by category) ──
  edgeControl:   "#1a365d",
  edgeHolding:   "#7ba5c9",
  edgeConcert:   "#d97706",
  edgePending:   "#ef4444",
  edgeOther:     "#94a3b8",

  // ── Edge Widths ──
  edgeWidth: {
    control: 2.8,
    concert: 1.8,
    holding: 1.5,
    other:   1.2,
  },

  // ── Hit area ──
  hitStrokeWidth: 14,

  // ── Opacities ──
  opacity: {
    edgeDefault:        0.45,
    edgeHover:          1,
    edgeDimmed:         0.06,
    edgeConnectedHover: 0.03,
    edgeSelected:       0.25,
    edgeNarrative:      0.6,
    nodeDefault:        1,
    nodeDimmed:         0.15,
    nodeSelected:       0.4,
    nodeNarrativeBg:    0.08,
    pendingRing:        0.6,
  },

  // ── Ring (pend) ──
  pendingRing: {
    stroke:    "#f97316",
    width:     1.5,
    dashArray: "3,2.5",
  },

  // ── Stroke ──
  stroke: {
    coWidth: 2,
    nodeWidth: 2,
    instWidth: 1.5,
  },

  // ── Glow Filter ──
  glow: {
    stdDeviation: 3.5,
    expand: { x: "-60%", y: "-60%", width: "220%", height: "220%" },
  },

  // ── Label ──
  label: {
    fontFamily: "var(--font)",
    fontSizeCo: 13,
    fontSizeNode: 11,
    fontWeightCo: 700,
    fontWeightNode: 500,
    colorCo: "#0f2340",
    colorNode: "#4a5568",
    offsetX: d => (Theme.nodeRadius[d.type] || 10) + 7,
    offsetY: 4,
    maxLength: 14,
    truncateLength: 18,
    truncateAt: 20,
  },

  // ── Animation Presets ──
  animation: {
    FAST:   { duration: 400, ease: "cubicOut" },
    NORMAL: { duration: 500, ease: "cubicOut" },
    SLOW:   { duration: 600, ease: "cubicOut" },
    ENTER:  { duration: 1000, ease: "cubicOut" },
  },

  // ── Layout ──
  layout: {
    // ── Link ──
    linkDistBase:   60,
    linkDistPerCat: 45,
    // ── Charge ──
    chargeBase:     -200,
    chargePerDeg:   12,
    companyCharge:  -350,  // moderate repulsion — grid anchor prevents extreme drift
    // ── Collide ──
    collidePadding:      6,
    companyCollideExtra: 20,
    // ── Cluster ──
    clusterStrength:     0.005,
    // ── Grid Anchor ──
    gridAnchorStrength:  0.004,  // anchor pull — prevents component drift during sim
    // ── Global ──
    alphaDecay:   0.015,
    alphaRestart: 0.3,
  },

  // ── Zoom ──
  zoom: {
    scaleExtent: [0.12, 5],
  },

  // ── Camera ──
  camera: {
    fitScaleButton: 0.85,   // "适应屏幕" button
    fitScaleInitial: 0.82,  // auto-fit on load
    narrativeScale: 1.4,
    narrativeDuration: 500,
  },
};

// Convenience function: get animation config by key
function animPreset(key) {
  const a = Theme.animation[key];
  if (!a) return Theme.animation.NORMAL;
  const map = { cubicOut: d3.easeCubicOut, linear: d3.easeLinear, cubicInOut: d3.easeCubicInOut };
  return { duration: a.duration, ease: map[a.ease] || d3.easeCubicOut };
}
