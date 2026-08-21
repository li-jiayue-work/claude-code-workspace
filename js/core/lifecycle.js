// core/lifecycle.js — Event-driven initialization state machine.
//
// Valid transitions (strict ordering):
//   INIT → LOADING → GRAPH_CREATED → SIMULATING → LAYOUT_STABLE → FITTING → READY
//
// No setTimeout(), no tick counting, no sim.stop() — purely event-driven.
//
// Modules subscribe with:  Lifecycle.on('READY', callback)
// Modules emit with:      Lifecycle.transition('SIMULATING')
//
// Before READY, all Camera operations are queued and executed in order on READY.

const Lifecycle = (() => {
  const ORDER = ['INIT', 'LOADING', 'GRAPH_CREATED', 'SIMULATING', 'LAYOUT_STABLE', 'COMPONENT_PACK', 'FITTING', 'READY'];
  const _listeners = {};  // state → [callback]
  let _state = 'INIT';

  // Initialize event buckets
  ORDER.forEach(s => _listeners[s] = []);

  /** Current lifecycle state */
  function state() { return _state; }

  /** Is the graph ready for user interaction? */
  function isReady() { return _state === 'READY'; }

  /** Is the lifecycle at or past a given phase? */
  function atLeast(phase) {
    return ORDER.indexOf(_state) >= ORDER.indexOf(phase);
  }

  /**
   * Transition to the next state.
   * Only forward transitions are allowed. Emits event to all subscribers.
   */
  function transition(next) {
    const curIdx = ORDER.indexOf(_state);
    const nextIdx = ORDER.indexOf(next);
    if (nextIdx <= curIdx) {
      console.warn(`[Lifecycle] Ignored backward transition: ${_state} → ${next}`);
      return;
    }
    // Walk through intermediate states (handles skipping)
    for (let i = curIdx + 1; i <= nextIdx; i++) {
      const s = ORDER[i];
      _state = s;
      const cbs = _listeners[s];
      if (cbs.length) {
        console.log(`%c[Lifecycle] ${s} %c(${cbs.length} listener${cbs.length>1?'s':''})`,
          'color:#0d9488;font-weight:bold', 'color:#a0aec0');
      }
      for (const cb of cbs) {
        try { cb(); } catch (e) { console.error(`[Lifecycle] ${s} handler error:`, e); }
      }
    }
  }

  /**
   * Subscribe to a lifecycle event.
   * If the state has already passed, the callback fires immediately.
   */
  function on(event, cb) {
    if (!_listeners[event]) {
      console.warn(`[Lifecycle] Unknown event: ${event}`);
      return;
    }
    if (ORDER.indexOf(_state) >= ORDER.indexOf(event)) {
      // Already past this state — fire immediately
      setTimeout(cb, 0);
    } else {
      _listeners[event].push(cb);
    }
  }

  return { state, isReady, atLeast, transition, on, ORDER };
})();
