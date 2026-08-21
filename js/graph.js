// graph.js — D3 rendering, radial layout, interaction
const Graph = {
  svg: null, g: null, zoom: null, sim: null,
  nGrp: null, lVis: null, lHit: null, nLab: null,
  W: 0, H: 0, sel: null, focusNode: null, showAll: false,
  currentCo: null,

  init(data) {
    this.nodes = data.nodes;
    this.links = data.links;
    this.coNodes = this.nodes.filter(n => n.type === "上市公司");
    this.coSet = new Set(this.coNodes.map(n => n.id));
    this.deg = {}; this.nodes.forEach(n => this.deg[n.id] = 0);
    this.links.forEach(l => { this.deg[l.source.id||l.source] = (this.deg[l.source.id||l.source]||0)+1; this.deg[l.target.id||l.target] = (this.deg[l.target.id||l.target]||0)+1; });

    // SVG
    const C = document.getElementById("graph");
    this.W = C.clientWidth; this.H = C.clientHeight;
    this.svg = d3.select("#graph svg").attr("width", this.W).attr("height", this.H);
    this.g = this.svg.append("g");

    // Defs
    const df = this.svg.append("defs");
    ["#1a365d","#7ba5c9","#d97706","#ef4444","#94a3b8"].forEach(c => {
      const id = "a-"+c.replace("#","");
      df.append("marker").attr("id",id).attr("viewBox","0 -3 6 6").attr("refX",16).attr("refY",0).attr("markerWidth",5).attr("markerHeight",5).attr("orient","auto").append("path").attr("d","M0,-3L6,0L0,3").attr("fill",c);
    });
    // Glow
    const gf = df.append("filter").attr("id","glow").attr("x","-60%").attr("y","-60%").attr("width","220%").attr("height","220%");
    gf.append("feGaussianBlur").attr("stdDeviation","3.5").attr("result","b");
    gf.append("feMerge").selectAll("feMergeNode").data(["b","SourceGraphic"]).join("feMergeNode").attr("in",d=>d);
    // Shadow
    const sf = df.append("filter").attr("id","shadow").attr("x","-30%").attr("y","-30%").attr("width","160%").attr("height","160%");
    sf.append("feDropShadow").attr("dx",0).attr("dy",2).attr("stdDeviation",3).attr("flood-color","#000").attr("flood-opacity",0.15);

    // Zoom
    this.zoom = d3.zoom().scaleExtent([0.1,6]).on("zoom", e => this.g.attr("transform", e.transform));
    this.svg.call(this.zoom);

    // Layers
    this.lG = this.g.append("g").attr("class","edges");
    this.nG = this.g.append("g").attr("class","nodes");

    // Select first company
    this.selectCompany(this.coNodes[0]);

    // Click background → deselect
    this.svg.on("click", () => { this.sel = null; this.focusNode = null; Panel.close(); this.resetHighlights(); });
  },

  selectCompany(coNode) {
    this.currentCo = coNode;
    this.sel = null;
    this.focusNode = null;
    Panel.close();

    const cId = coNode.id;
    // Get all related nodes
    const relatedIds = new Set([cId]);
    const relLinks = [];
    this.links.forEach(l => {
      const s = l.source.id||l.source, t = l.target.id||l.target;
      if (s === cId || t === cId) { relLinks.push(l); relatedIds.add(s); relatedIds.add(t); }
    });
    const relNodes = this.nodes.filter(n => relatedIds.has(n.id));

    if (this.showAll) {
      // Multi-focal layout for all companies
      this.renderAllCompanies();
      return;
    }

    // Radial layout
    const cx = this.W/2, cy = this.H/2;
    coNode.fx = cx; coNode.fy = cy; coNode.x = cx; coNode.y = cy;

    // Group non-company nodes by ring
    const rings = {1:[], 2:[], 3:[]};
    relNodes.forEach(n => {
      if (n.id === cId) return;
      let bestRing = 3;
      relLinks.forEach(l => {
        const s = l.source.id||l.source, t = l.target.id||l.target;
        if ((s===n.id&&t===cId) || (t===n.id&&s===cId)) {
          const r = ringOf(l.relation);
          if (r < bestRing) bestRing = r;
        }
      });
      rings[bestRing].push(n);
    });

    // Position nodes in rings
    for (const [ring, rnodes] of Object.entries(rings)) {
      const dist = RING_DIST[ring];
      rnodes.forEach((n, i) => {
        const angle = (i / rnodes.length) * 2*Math.PI - Math.PI/2;
        n.x = cx + dist * Math.cos(angle);
        n.y = cy + dist * Math.sin(angle);
        // Very light fix to keep ring structure
        n._tx = n.x; n._ty = n.y;
      });
    }

    const allNodes = [coNode, ...rings[1], ...rings[2], ...rings[3]];

    // Gentle force simulation
    if (this.sim) this.sim.stop();
    this.sim = d3.forceSimulation(allNodes)
      .force("link", d3.forceLink(relLinks).id(d=>d.id).distance(d => 50 + ringOf(d.relation)*30))
      .force("charge", d3.forceManyBody().strength(-120))
      .force("collide", d3.forceCollide().radius(d => NR[d.type]+8))
      .force("radial", () => {
        for (const n of allNodes) {
          if (n.id === cId) continue;
          if (!n._tx) continue;
          const dx = n._tx - n.x, dy = n._ty - n.y;
          n.vx += dx * 0.008; n.vy += dy * 0.008;
        }
      })
      .alpha(0.3).alphaDecay(0.02);

    this._render(allNodes, relLinks, cId);
  },

  renderAllCompanies() {
    // Position all companies in a grid
    const cols = 4;
    this.coNodes.forEach((n, i) => {
      const row = Math.floor(i/cols), col = i%cols;
      n.fx = this.W/(cols+1)*(col+1); n.fy = 100 + row*180;
      n.x = n.fx; n.y = n.fy;
    });
    // Simple force for all
    if (this.sim) this.sim.stop();
    this.sim = d3.forceSimulation(this.nodes)
      .force("link", d3.forceLink(this.links).id(d=>d.id).distance(80))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("collide", d3.forceCollide().radius(d=>NR[d.type]+6))
      .alpha(0.5).alphaDecay(0.015);
    this._render(this.nodes, this.links, null);
  },

  _render(allNodes, allLinks, centerId) {
    const self = this;

    // Edges
    this.lHit = this.lG.selectAll("line.h").data(allLinks, d => d.source.id+d.target.id+d.relation).join(
      enter => enter.append("line").attr("class","h").attr("stroke","transparent").attr("stroke-width",14),
      update => update,
      exit => exit.remove()
    );
    this.lVis = this.lG.selectAll("line.v").data(allLinks, d => d.source.id+d.target.id+d.relation).join(
      enter => enter.append("line").attr("class","v").attr("marker-end",d=>"url(#a-"+eStyle(d).c.replace("#","")+")"),
      update => update,
      exit => exit.remove()
    );
    this.lVis.attr("stroke", d => eStyle(d).c).attr("stroke-width", d => eStyle(d).w)
      .attr("stroke-dasharray", d => eStyle(d).d).attr("opacity", 0.45);

    // Nodes
    this.nGrp = this.nG.selectAll("g.node").data(allNodes, d => d.id).join(
      enter => {
        const g = enter.append("g").attr("class","node").attr("cursor","pointer")
          .attr("opacity", 0).call(g => g.transition().duration(400).attr("opacity",1));
        // Pending ring
        g.append("circle").attr("class","pending").attr("fill","none")
          .attr("stroke","#f97316").attr("stroke-width",1.5).attr("stroke-dasharray","3,2.5")
          .attr("r", d => NR[d.type]+3).attr("opacity", d => d.verified?0:0.6);
        // Shape
        g.each(function(d) {
          const el = d3.select(this);
          if (d.type === "机构股东") {
            const r = NR[d.type];
            el.append("rect").attr("x",-r-3).attr("y",-r+3).attr("width",(r+3)*2).attr("height",(r-3)*2)
              .attr("rx",r-3).attr("fill",NC[d.type]).attr("stroke","#fff").attr("stroke-width",1.5);
          } else {
            el.append("circle").attr("r",NR[d.type]).attr("fill",NC[d.type])
              .attr("stroke","#fff").attr("stroke-width",d.type==="上市公司"?3:2)
              .attr("filter",d.type==="上市公司"?"url(#shadow)":"");
          }
        });
        // Label
        g.append("text").attr("font-family","var(--font)").attr("font-size",d=>d.type==="上市公司"?13:11)
          .attr("font-weight",d=>d.type==="上市公司"?700:500)
          .attr("fill",d=>d.type==="上市公司"?"#0f2340":"#4a5568")
          .attr("dx",d=>NR[d.type]+7).attr("dy",4).attr("pointer-events","none")
          .attr("opacity",d=>d.type==="上市公司"?1:0);
        return g;
      },
      update => update,
      exit => exit.remove()
    );
    // Attach interactions
    this.nGrp.each(function(d) {
      const g = d3.select(this);
      g.on("mouseenter", function(e,d) { self._onNodeEnter(e,d,g); });
      g.on("mouseleave", function(e,d) { self._onNodeLeave(e,d,g); });
      g.on("click", function(e,d) { self._onNodeClick(e,d); });
      g.call(d3.drag()
        .on("start", (e,d) => { if(!e.active)self.sim.alphaTarget(0.3).restart(); d.fx=d.x; d.fy=d.y; })
        .on("drag", (e,d) => { d.fx=e.x; d.fy=e.y; d._tx=e.x; d._ty=e.y; })
        .on("end", (e,d) => { if(!e.active)self.sim.alphaTarget(0); if(d.type!=="上市公司"){d.fx=null;d.fy=null;} })
      );
    });

    // Tick
    this.sim.on("tick", () => {
      self.lHit.attr("x1",d=>d.source.x).attr("y1",d=>d.source.y).attr("x2",d=>d.target.x).attr("y2",d=>d.target.y);
      self.lVis.attr("x1",d=>d.source.x).attr("y1",d=>d.source.y).attr("x2",d=>d.target.x).attr("y2",d=>d.target.y);
      self.nGrp.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Edge hover
    this.lHit.on("mouseenter", function(e,d) {
      const s=d.source.id||d.source, t=d.target.id||d.target;
      const v=d.verified?"已核实":"待核实";
      d3.select("#tooltip").style("opacity",1).html(`<div class="tt-title">${s} → ${t}</div><div class="tt-meta">${d.relation}${d.weight?" · "+d.weight:""} · ${v}</div>`)
        .style("left",(e.pageX+14)+"px").style("top",(e.pageY-14)+"px");
      self.lVis.attr("opacity", l => l===d?1:0.06);
    }).on("mousemove", function(e) {
      d3.select("#tooltip").style("left",(e.pageX+14)+"px").style("top",(e.pageY-14)+"px");
    }).on("mouseleave", function() {
      d3.select("#tooltip").style("opacity",0);
      if (!self.sel) self.lVis.attr("opacity",0.45);
    });

    // Fit after layout settles
    setTimeout(() => {
      const b = self.g.node().getBBox();
      if (b.width === 0) return;
      const s = Math.min(self.W/b.width, self.H/b.height, 1)*0.85;
      const tx = (self.W - b.width*s)/2 - b.x*s;
      const ty = (self.H - b.height*s)/2 - b.y*s;
      self.svg.transition().duration(600).ease(d3.easeCubicOut)
        .call(self.zoom.transform, d3.zoomIdentity.translate(tx,ty).scale(s));
    }, 1500);
  },

  _onNodeEnter(e, d, g) {
    g.style("filter", "url(#glow)");
    // Show label
    g.select("text").attr("opacity", 1);
    // Tooltip
    d3.select("#tooltip").style("opacity",1).html(`<div class="tt-title">${d.name}</div><div class="tt-meta">${d.type}${d.stock_code?" · "+d.stock_code:""} · ${this.deg[d.id]||0}条关系</div>`)
      .style("left",(e.pageX+14)+"px").style("top",(e.pageY-14)+"px");
    // Highlight connected
    const cn = new Set([d.id]);
    (this.sim?this.sim.force("link").links():this.links).forEach(l => {
      const s=l.source.id||l.source, t=l.target.id||l.target;
      if (s===d.id) cn.add(t); if (t===d.id) cn.add(s);
    });
    this.nGrp.attr("opacity", n => cn.has(n.id)?1:0.12);
    this.lVis.attr("opacity", l => { const s=l.source.id||l.source, t=l.target.id||l.target; return (s===d.id||t===d.id)?1:0.03; });
    g.selectAll("text").attr("opacity", 1);
  },

  _onNodeLeave(e, d, g) {
    g.style("filter", null);
    d3.select("#tooltip").style("opacity", 0);
    if (!this.sel && !this.focusNode) {
      this.nGrp.attr("opacity", 1);
      this.lVis.attr("opacity", 0.45);
      this.nGrp.selectAll("text").attr("opacity", n => n.type==="上市公司"?1:0);
    } else if (this.sel) {
      this._restoreSelection();
    }
  },

  _onNodeClick(e, d) {
    e.stopPropagation();
    if (this.sel === d.id) { this.sel = null; this.focusNode = null; Panel.close(); this.resetHighlights(); return; }
    this.sel = d.id;
    // Focus: show only 1-hop
    const cn = new Set([d.id]);
    const curLinks = this.sim?this.sim.force("link").links():this.links;
    curLinks.forEach(l => { const s=l.source.id||l.source, t=l.target.id||l.target; if(s===d.id)cn.add(t); if(t===d.id)cn.add(s); });
    this.nGrp.attr("opacity", n => cn.has(n.id)?1:0.05);
    this.lVis.attr("opacity", l => { const s=l.source.id||l.source, t=l.target.id||l.target; return (s===d.id||t===d.id)?0.8:0.02; });
    this.nGrp.selectAll("text").attr("opacity", n => cn.has(n.id)?1:0);
    Panel.open(d, curLinks, this.deg[d.id]||0);
  },

  resetHighlights() {
    this.nGrp.attr("opacity", 1);
    this.lVis.attr("opacity", 0.45);
    this.nGrp.selectAll("text").attr("opacity", n => n.type==="上市公司"?1:0);
  },

  _restoreSelection() {
    if (!this.sel) return;
    const d = this.nodes.find(n => n.id === this.sel);
    if (!d) return;
    const cn = new Set([d.id]);
    const curLinks = this.sim?this.sim.force("link").links():this.links;
    curLinks.forEach(l => { const s=l.source.id||l.source, t=l.target.id||l.target; if(s===d.id)cn.add(t); if(t===d.id)cn.add(s); });
    this.nGrp.attr("opacity", n => cn.has(n.id)?1:0.05);
    this.lVis.attr("opacity", l => { const s=l.source.id||l.source, t=l.target.id||l.target; return (s===d.id||t===d.id)?0.8:0.02; });
    this.nGrp.selectAll("text").attr("opacity", n => cn.has(n.id)?1:0);
  },

  fitScreen() {
    const b = this.g.node().getBBox();
    if (b.width === 0) return;
    const s = Math.min(this.W/b.width, this.H/b.height, 1)*0.85;
    const tx = (this.W - b.width*s)/2 - b.x*s;
    const ty = (this.H - b.height*s)/2 - b.y*s;
    this.svg.transition().duration(600).ease(d3.easeCubicOut).call(this.zoom.transform, d3.zoomIdentity.translate(tx,ty).scale(s));
  }
};
