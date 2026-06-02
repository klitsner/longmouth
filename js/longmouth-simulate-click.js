/**
 * longmouth-simulate-click.js
 * Simulates a human click sequence on an element.
 * Used for the continue-shopping button.
 */

function simulateHumanClick(selector) {
  const el = document.querySelector(selector);
  if (!el) return;

  ["pointerdown", "mousedown", "mouseup", "click"].forEach((type) => {
    el.dispatchEvent(
      new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        view: window,
      })
    );
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector(".btn-continue-shopping")?.addEventListener("click", (e) => {
    e.preventDefault();
    simulateHumanClick("#w-dropdown-toggle-0");
  });
});
