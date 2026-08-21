// ui/controls.js — Controls: button bindings and keyboard shortcuts.
// Delegates all work to CameraController / NarrativeTour / SelectionManager.

const Controls = (() => {

  function bind() {
    // Toolbar buttons — gated on READY
    document.getElementById("btnFit").addEventListener("click", () => {
      if (!Lifecycle.isReady()) return;
      CameraController.request('fit');
    });
    document.getElementById("btnReset").addEventListener("click", () => {
      if (!Lifecycle.isReady()) return;
      CameraController.request('reset');
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", e => {
      // Ctrl+K / Cmd+K → focus search (allowed during simulation)
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("search").focus();
        return;
      }
      // All other shortcuts gated on READY
      if (!Lifecycle.isReady()) return;
      // Escape
      if (e.key === "Escape") {
        if (GraphState.narrativeActive) {
          NarrativeTour.exit();
        } else {
          SelectionManager.deselect();
        }
      }
      // Arrow keys in narrative mode
      if (GraphState.narrativeActive && e.key === "ArrowRight") NarrativeTour.next();
      if (GraphState.narrativeActive && e.key === "ArrowLeft") NarrativeTour.prev();
    });
  }

  return { bind };
})();
