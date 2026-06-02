/**
 * longmouth-shop.js
 * Product panel open/close and marquee pause interaction.
 *
 * Matches .s__product-item clicks to .product__detail-item via data-id.
 *
 * TODO (Shopify): Replace data-id="gid://shopify/Product/..." with Shopify
 *   product handles or numeric IDs rendered via Liquid:
 *     data-id="{{ product.id }}" or data-handle="{{ product.handle }}"
 *   The product detail panel (.product__detail-item) would become a Liquid
 *   snippet rendered per product: snippets/product-detail.liquid
 */

document.addEventListener("DOMContentLoaded", function () {
  console.log("🔧 DOM fully loaded");

  const items = document.querySelectorAll(".s__product-item");
  const panel = document.getElementById("product__panel");
  const detailItems = document.querySelectorAll(".product__detail-item");
  const closeBtn = document.querySelector(".close-btn__wrapper");
  const productDetails = document.querySelectorAll(".product-details");

  let panelOpenedAt = 0;

  const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  console.log("Product items found:", items.length);
  console.log("Panel found:", !!panel);
  console.log("Detail items found:", detailItems.length);
  console.log("Close button found:", !!closeBtn);
  console.log("productDetails found:", productDetails.length);
  console.log("Hover supported:", supportsHover);

  /* ------------------------------------
     PRODUCT CLICK → OPEN PANEL
  ------------------------------------ */

  items.forEach((item) => {
    item.addEventListener("click", () => {
      const id = item.getAttribute("data-id");
      console.log("Product clicked with data-id:", id);

      if (!id) {
        console.warn("No data-id on clicked item");
        return;
      }

      let matchFound = false;

      detailItems.forEach((detail) => {
        const detailId = detail.getAttribute("data-id");

        if (detailId === id) {
          detail.style.display = "block";
          matchFound = true;
          console.log("Showing detail with data-id:", detailId);
        } else {
          detail.style.display = "none";
        }
      });

      if (!matchFound) {
        console.warn("No matching detail found for data-id:", id);
      }

      panel.classList.add("active");
      panelOpenedAt = Date.now();
      console.log("Panel opened at", panelOpenedAt);
    });
  });

  /* ------------------------------------
     CLOSE PANEL
  ------------------------------------ */

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      panel.classList.remove("active");
      console.log("Panel closed");
    });
  }

  /* ------------------------------------
     MARQUEE INTERACTION (desktop hover + mobile touch)
  ------------------------------------ */

  productDetails.forEach((container, i) => {
    const description = container.querySelector(".product-details__description");
    if (!description) return;

    /* ---------- DESKTOP HOVER ---------- */
    if (supportsHover) {
      container.addEventListener("mouseenter", () => {
        console.log("mouseenter", i);
        description.classList.add("marquee-paused");
      });

      container.addEventListener("mouseleave", () => {
        console.log("mouseleave", i);
        description.classList.remove("marquee-paused");
      });
    }

    /* ---------- MOBILE TOUCH ---------- */
    container.addEventListener(
      "touchstart",
      (e) => {
        const msSinceOpen = Date.now() - panelOpenedAt;
        console.log("touchstart fired — ms since panel open:", msSinceOpen);

        if (msSinceOpen < 500) {
          console.log("Ignoring touch (panel just opened)");
          return;
        }

        if (e.target.closest("a, button, .product__size-chart-link")) {
          console.log("Tap on exempt element");
          return;
        }

        description.classList.add("marquee-paused");
        console.log("Marquee paused");
      },
      { passive: true }
    );

    container.addEventListener(
      "touchend",
      () => {
        description.classList.remove("marquee-paused");
        console.log("Marquee resumed");
      },
      { passive: true }
    );

    container.addEventListener(
      "touchcancel",
      () => {
        description.classList.remove("marquee-paused");
      },
      { passive: true }
    );
  });
});
