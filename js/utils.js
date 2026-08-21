// utils.js — shared constants and helpers for equity-graph
const NC = { "上市公司":"#0f2340", "自然人":"#2563eb", "机构股东":"#60a5fa", "子公司":"#94a3b8" };
const NR = { "上市公司":22, "自然人":12, "机构股东":12, "子公司":9 };
const CTRL = new Set(["实际控制人","控股股东","共同实际控制人","实际控制状态","控股状态","控制"]);
const HOLD = new Set(["持股","法定代表人"]);
const CONCERT = new Set(["一致行动人"]);
const RING = { ctrl:1, hold:2, concert:2, sub:3, other:3 };
const RING_DIST = { 1:140, 2:260, 3:400 };
const RING_COLOR = { 1:"#1a365d", 2:"#7ba5c9", 3:"#cbd5e1" };

function eStyle(d) {
  const v = d.verified;
  if (CTRL.has(d.relation)) return { c:"#1a365d", w:2.8, d:v?"":"6,3" };
  if (CONCERT.has(d.relation)) return { c:"#d97706", w:1.8, d:"5,3" };
  if (HOLD.has(d.relation)) return { c:v?"#7ba5c9":"#ef4444", w:1.5, d:v?"":"5,3" };
  return { c:"#94a3b8", w:1, d:"" };
}

function rCat(r) { return CTRL.has(r)?"ctrl":HOLD.has(r)?"hold":CONCERT.has(r)?"concert":"other"; }
function rSort(r) { return CTRL.has(r)?0:HOLD.has(r)?1:CONCERT.has(r)?2:3; }
function ringOf(r) { return RING[rCat(r)] || 3; }
