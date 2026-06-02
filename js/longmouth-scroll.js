/**
 * longmouth-scroll.js
 * Smooth horizontal scroll for .horizontal-scroll-wrapper.
 * Converts vertical mouse wheel input into smooth horizontal scrolling.
 * Skips elements marked .dropdown-scroll or .scroll-exempt.
 */

document.addEventListener("DOMContentLoaded", function () {
  $(".shop__wrap").hide();

  const scrollContainer = document.querySelector(".horizontal-scroll-wrapper");

  if (!scrollContainer) {
    console.error("🚨 ERROR: .horizontal-scroll-wrapper not found!");
    return;
  }

  let scrollPosition = scrollContainer.scrollLeft;
  let ease = 0.1;
  let isScrolling = false;

  function smoothScroll() {
    if (!isScrolling) return;

    scrollContainer.scrollLeft += (scrollPosition - scrollContainer.scrollLeft) * ease;

    if (Math.abs(scrollPosition - scrollContainer.scrollLeft) > 0.5) {
      requestAnimationFrame(smoothScroll);
    } else {
      isScrolling = false;
    }
  }

  window.addEventListener(
    "wheel",
    function (event) {
      const isInsideScrollable = event.target.closest(".dropdown-scroll, .scroll-exempt");
      if (isInsideScrollable) return;

      if (event.deltaY !== 0) {
        event.preventDefault();

        scrollPosition += event.deltaY;

        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        scrollPosition = Math.max(0, Math.min(scrollPosition, maxScroll));

        if (!isScrolling) {
          isScrolling = true;
          smoothScroll();
        }
      }
    },
    { passive: false }
  );
});
