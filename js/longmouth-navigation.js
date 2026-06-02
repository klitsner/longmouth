/**
 * longmouth-navigation.js
 * URL query-based SPA navigation for the longmouth.world SPA.
 *
 * Views are driven by ?view=<name> and ?product=<id> query params.
 * Section buttons follow the naming convention: <name>__button (id).
 *
 * TODO (Shopify): If this is moved into a sectioned theme template,
 *   switch the DOMContentLoaded entrypoint to a theme section load event.
 */

document.addEventListener("DOMContentLoaded", function () {
  console.log("🔁 DOM loaded");

  function showCookieBanner() {
    const el = document.querySelector("#shopify-pc-banner");
    if (!el) return;

    el.style.transition = "opacity 0.3s cubic-bezier(0.33, 1, 0.68, 1)";
    el.style.visibility = "visible";
    el.style.opacity = "1";
    el.style.pointerEvents = "auto";
  }

  let isUpdatingFromURL = false;
  let currentState = null;

  function cleanupMenuCover() {
    const menuCover = document.querySelector("#menu__cover");
    if (menuCover) {
      menuCover.style.transition = "opacity 0.3s cubic-bezier(0.33, 1, 0.68, 1)";
      menuCover.style.opacity = "0";
      setTimeout(() => {
        menuCover.remove();
        console.log("🧹 Menu cover faded out and removed after DOMContentLoaded");
        showCookieBanner();
      }, 300);
    }
  }

  // === SECTION BUTTONS
  document.querySelectorAll("[id$='__button']").forEach((button) => {
    button.addEventListener("click", function () {
      if (isUpdatingFromURL) return;

      const id = this.id;
      const targetView = id.replace(/__button$/, "");
      console.log(`📦 Clicked: ${id} → view=${targetView}`);

      const url = new URL(window.location.href);
      if (targetView === "home") {
        url.searchParams.delete("view");
        url.searchParams.delete("product");
      } else {
        url.searchParams.set("view", targetView);
        url.searchParams.delete("product");
      }

      isUpdatingFromURL = true;
      history.pushState({ view: targetView }, document.title, url);
      handleQueryChange();
      setTimeout(() => {
        isUpdatingFromURL = false;
      }, 50);
    });
  });

  // === PRODUCT CLICK
  document.querySelectorAll(".product-list__item").forEach((item) => {
    item.addEventListener("click", function () {
      if (isUpdatingFromURL) return;

      const productId = item.id;
      console.log(`🛒 Clicked product: ${productId}`);

      const url = new URL(window.location.href);
      url.searchParams.set("view", "shop");
      url.searchParams.set("product", productId);

      isUpdatingFromURL = true;
      history.pushState({ view: "shop", product: productId }, document.title, url);
      handleQueryChange();
      setTimeout(() => {
        isUpdatingFromURL = false;
      }, 50);
    });
  });

  // === OPEN PRODUCT DRAWER
  function openProductDrawer(productId) {
    const productEl = document.getElementById(productId);
    if (productEl && productEl.classList.contains("product-list__item")) {
      console.log(`📂 Opening product drawer for: ${productId}`);
      isUpdatingFromURL = true;
      productEl.click();
      setTimeout(() => {
        isUpdatingFromURL = false;
      }, 50);
    } else {
      console.warn(`❌ Product '${productId}' not found or missing class`);
    }
  }

  // === OPEN SHOP SECTION
  function openShopSection(callback) {
    if (window._shopSectionInterval) {
      clearInterval(window._shopSectionInterval);
      window._shopSectionInterval = null;
    }

    const shopBtn = document.getElementById("shop__button");
    if (!shopBtn) {
      console.warn("⚠️ shop__button not found");
      if (callback) callback();
      return;
    }

    console.log("🛍️ Opening Shop section");
    isUpdatingFromURL = true;
    shopBtn.click();

    window._shopSectionInterval = setInterval(() => {
      const productList = document.querySelector(".product-list__item");

      if (productList && productList.offsetParent !== null) {
        clearInterval(window._shopSectionInterval);
        window._shopSectionInterval = null;

        if (callback) callback();
        setTimeout(() => {
          isUpdatingFromURL = false;
        }, 300);
      }
    }, 50);
  }

  // === OPEN SECTION BY ID
  function openSection(viewName) {
    const sectionBtn = document.getElementById(`${viewName}__button`);
    if (sectionBtn) {
      console.log(`📌 Opening section: ${viewName}`);
      isUpdatingFromURL = true;
      sectionBtn.click();
      setTimeout(() => {
        isUpdatingFromURL = false;
      }, 300);
    } else {
      console.warn(`❓ Section button '${viewName}__button' not found`);
    }
  }

  // === HANDLE QUERY CHANGE
  function handleQueryChange() {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");
    const productId = params.get("product");

    console.log(`📎 Query changed: view=${view}, product=${productId}`);

    const backDefault = document.querySelector(".menu-back__wrap");
    const backShop = document.querySelector(".menu-back-shop__wrap");

    if (backDefault) backDefault.style.display = "none";
    if (backShop) backShop.style.display = "none";

    // 🏠 HOME VIEW
    if (!view || view === "home") {
      document.getElementById("home__button")?.click();
      document.querySelector(".close-btn__wrapper")?.click();
      if (backDefault) backDefault.style.display = "block";
      return;
    }

    // 🛍️ SHOP VIEW
    if (view === "shop") {
      if (productId) {
        if (backShop) backShop.style.display = "block";
        openShopSection(() => openProductDrawer(productId));
      } else {
        if (backDefault) backDefault.style.display = "block";
        openShopSection();
      }
      return;
    }

    // OTHER SECTIONS
    if (backDefault) backDefault.style.display = "block";
    openSection(view);
  }

  // === PRODUCT DRAWER CLOSE (remove product from URL)
  document.addEventListener("click", function (event) {
    const closeBtn = event.target.closest("#productDrawerClose");
    if (!closeBtn) return;

    console.log("❎ Product drawer closed — removing product from URL");

    if (isUpdatingFromURL) return;

    const url = new URL(window.location.href);
    url.searchParams.delete("product");

    isUpdatingFromURL = true;
    history.pushState({ view: url.searchParams.get("view") }, document.title, url);

    handleQueryChange();
    setTimeout(() => {
      isUpdatingFromURL = false;
    }, 50);
  });

  // === BACK/FORWARD NAVIGATION
  window.addEventListener("popstate", () => {
    console.log("⬅️ Back/forward detected");
    handleQueryChange();
  });

  // === INITIAL LOAD
  cleanupMenuCover();
  setTimeout(() => handleQueryChange(), 50);

  console.log("✅ Query-based navigation initialized");
});
