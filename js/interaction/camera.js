// interaction/camera.js — CameraController: the sole owner of viewport transforms.
//
// Lifecycle contract:
//   - During INIT→FITTING: zoom is DISABLED, all camera ops are queued
//   - On READY: zoom is enabled, queued ops are drained
//   - fitScreen() is called exactly once, by the lifecycle, during FITTING
//
// No other module calls zoom.transform() / focusNode() directly.
// All camera requests go through CameraController.request().

const CameraController = (() => {

  let zoom, svg, g;
  let _enabled = false;           // true only after READY
  let _queue = [];                 // pending camera ops
  let _initialFitDone = false;     // fitScreen() called at most once

  function init(_svg, _g) {
    svg = _svg;
    g = _g;

    zoom = d3.zoom()
      .scaleExtent(Theme.zoom.scaleExtent)
      .on("zoom", e => {
        if (!_enabled) return;     // block all zoom until READY
        g.attr("transform", e.transform);
      });

    // Attach zoom to SVG but gate all events on _enabled
    svg.call(zoom);

    // Disable zoom interactions until READY
    // We do this by removing the wheel/dblclick listeners that d3 adds
    // and re-enabling them on READY
    svg.on("wheel.zoom", null);
    svg.on("dblclick.zoom", null);
  }

  /**
   * Enable user zoom interactions. Called once on READY.
   */
  function enable() {
    if (_enabled) return;
    _enabled = true;
    // Re-attach zoom gesture listeners
    svg.call(zoom);
    // Drain pending queue
    if (_queue.length) {
      console.log(`[Camera] Draining ${_queue.length} queued operation(s)`);
      for (const op of _queue) {
        try { op(); } catch (e) { console.error('[Camera] Queued op error:', e); }
      }
      _queue = [];
    }
  }

  /**
   * Submit a camera operation.
   * Before READY: queued, executed on enable().
   * After READY: executed immediately.
   *
   * @param {string} type — 'fit' | 'reset' | 'focus'
   * @param {object} [params] — depends on type
   */
  function request(type, params) {
    const op = () => _executeOp(type, params);
    if (_enabled) {
      op();
    } else {
      _queue.push(op);
    }
  }

  function _executeOp(type, params) {
    switch (type) {
      case 'fit': _doFitScreen(params && params.duration, params && params.scaleFactor); break;
      case 'reset': _doReset(); break;
      case 'focus': _doFocusNode(params && params.node, params && params.scale); break;
    }
  }

  // ── Internal (always runs, even before READY — used by lifecycle) ──

  /**
   * Perform the one-and-only initial fit. Called by lifecycle during LAYOUT_STABLE→FITTING.
   * This is the ONLY path that bypasses the queue — it's a lifecycle contract.
   */
  function initialFit() {
    if (_initialFitDone) {
      console.warn('[Camera] initialFit() already executed — ignoring');
      return;
    }
    _initialFitDone = true;
    _doFitScreen('ENTER', Theme.camera.fitScaleInitial);
  }

  // ── Core operations ──

  function _doFitScreen(duration, scaleFactor) {
    const container = document.getElementById("graph");
    const W = container.clientWidth;
    const H = container.clientHeight;

    svg.attr("width", W).attr("height", H);

    // Reset to identity — single clean state
    svg.call(zoom.transform, d3.zoomIdentity);
    g.attr("transform", null);

    // BBox: compute from GraphState node positions (always correct).
    // SVG getBBox may return stale values during early-fit before DOM layout.
    let b;
    const nodes = GraphState.nodes;
    if (nodes && nodes.length) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const n of nodes) {
        if (n.x < minX) minX = n.x;
        if (n.y < minY) minY = n.y;
        if (n.x > maxX) maxX = n.x;
        if (n.y > maxY) maxY = n.y;
      }
      const pad = 30;
      b = { x: minX - pad, y: minY - pad, width: maxX - minX + pad * 2, height: maxY - minY + pad * 2 };
    } else {
      b = g.node().getBBox();
      if (b.width === 0 || b.height === 0) return;
    }

    const sf = scaleFactor != null ? scaleFactor : Theme.camera.fitScaleButton;
    const rawScale = Math.min(W / b.width, H / b.height, 0.9);
    const s = rawScale * sf;
    const tx = (W - b.width * s) / 2 - b.x * s;
    const ty = (H - b.height * s) / 2 - b.y * s;
    const transform = d3.zoomIdentity.translate(tx, ty).scale(s);

    // Apply transform directly to g element, then sync zoom state
    g.attr("transform", transform);
    svg.call(zoom.transform, transform);
  }

  function _doReset() {
    const a = animPreset('FAST');
    svg.transition()
      .duration(a.duration)
      .ease(a.ease)
      .call(zoom.transform, d3.zoomIdentity);
  }

  function _doFocusNode(node, scale) {
    const container = document.getElementById("graph");
    const W = container.clientWidth;
    const H = container.clientHeight;
    const s = scale || Theme.camera.narrativeScale;
    const tx = W / 2 - node.x * s;
    const ty = H / 2 - node.y * s;
    const a = animPreset('NORMAL');
    svg.transition()
      .duration(a.duration)
      .ease(a.ease)
      .call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(s));
  }

  // ── Public API ──

  return {
    init,        // called once during GRAPH_CREATED
    enable,      // called once on READY (by lifecycle listener)
    initialFit,  // called once during LAYOUT_STABLE→FITTING (by lifecycle)
    request,     // all other camera ops go through here
  };
})();
