/**
 * longmouth-slider-redraw.js
 * Triggers a resize after opening a product drawer so Webflow sliders
 * recalculate their dimensions.
 */

window.Webflow = window.Webflow || [];
window.Webflow.push(function () {
  function redrawSliders() {
    window.dispatchEvent(new Event("resize"));
  }

  const productTriggers = document.querySelectorAll(".product-list__item");

  productTriggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      setTimeout(redrawSliders, 50);
    });
  });
});
