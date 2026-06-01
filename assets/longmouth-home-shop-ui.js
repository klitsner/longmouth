/*
  Shop panel, product drawer, and cart shell behaviors extracted from the Webflow export.
  Generated during the Webflow-to-Shopify cleanup pass so behavior can be reviewed by role.
*/

// Source: body embed
function simulateHumanClick(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  ['pointerdown','mousedown','mouseup','click'].forEach(type => {
    el.dispatchEvent(new MouseEvent(type, { bubbles:true, cancelable:true, view:window }));
  });
}

document.querySelector('.btn-continue-shopping')?.addEventListener('click', e=> {
e.preventDefault();
simulateHumanClick('#w-dropdown-toggle-0');

});

// Source: body embed
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
  let hasWebflowRestarted = false;
  let queuedQuery = null;

  // Menu cover cleanup
  document.addEventListener('wf.restart', () => {
    const menuCover = document.querySelector('#menu__cover');
    if (menuCover) {
      menuCover.style.transition = 'opacity 0.3s cubic-bezier(0.33, 1, 0.68, 1)';
      menuCover.style.opacity = '0';
      setTimeout(() => {
        menuCover.remove();
        console.log("🧹 Menu cover faded out and removed after Webflow restart");
         showCookieBanner(); // 👈 THIS is the key line
      }, 300);
    }

    hasWebflowRestarted = true;

    if (queuedQuery !== null) {
      console.log(`🔁 Webflow restarted — resuming queued query: ${queuedQuery}`);
      handleQueryChange();
      queuedQuery = null;
    }
  });

  // === SECTION BUTTONS
  document.querySelectorAll("[id$='__button']").forEach(button => {
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
      setTimeout(() => { isUpdatingFromURL = false; }, 50);
    });
  });

  // === PRODUCT CLICK
  document.querySelectorAll(".product-list__item").forEach(item => {
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
      setTimeout(() => { isUpdatingFromURL = false; }, 50);
    });
  });

  // === OPEN PRODUCT
  function openProductDrawer(productId) {
    const productEl = document.getElementById(productId);
    if (productEl && productEl.classList.contains("product-list__item")) {
      console.log(`📂 Opening product drawer for: ${productId}`);
      isUpdatingFromURL = true;
      productEl.click();
      setTimeout(() => { isUpdatingFromURL = false; }, 50);
    } else {
      console.warn(`❌ Product '${productId}' not found or missing class`);
    }
  }
  

  // === OPEN SHOP SECTION

function openShopSection(callback) {
  //console.log("📍 openShopSection CALLED");

  // 🔥 Always clear any previous poll before starting a new one
  if (window._shopSectionInterval) {
    //console.log("🧹 Clearing PREVIOUS _shopSectionInterval");
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

  // ⏳ start polling for section readiness
  window._shopSectionInterval = setInterval(() => {
    const productList = document.querySelector(".product-list__item");

    // Only finish when shop list is réellement visible & rendered
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
      setTimeout(() => { isUpdatingFromURL = false; }, 300);
    } else {
      console.warn(`❓ Section button '${viewName}__button' not found`);
    }
  }

// === HANDLE QUERY
function handleQueryChange() {
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");
  const productId = params.get("product");

  console.log(`📎 Query changed: view=${view}, product=${productId}`);

  const backDefault = document.querySelector(".menu-back__wrap");
  const backShop = document.querySelector(".menu-back-shop__wrap");

  // Reset both first
  if (backDefault) backDefault.style.display = "none";
  if (backShop) backShop.style.display = "none";

  if (!hasWebflowRestarted) {
    console.log(`⏳ Webflow not restarted yet — queuing query`);
    queuedQuery = window.location.search;
    return;
  }

  // 🏠 HOME VIEW
  if (!view || view === "home") {
    document.getElementById("home__button")?.click();
    document.querySelector(".close-btn__wrapper")?.click();

    // HOME → show default back button
    if (backDefault) backDefault.style.display = "block";

    return;
  }

  // 🛍️ SHOP VIEW
  if (view === "shop") {

    // PRODUCT OPEN → show shop back button
    if (productId) {
      if (backShop) backShop.style.display = "block";
      openShopSection(() => openProductDrawer(productId));
    }

    // SHOP LIST ONLY → show default back button
    else {
      if (backDefault) backDefault.style.display = "block";
      openShopSection();
    }

    return;
  }

  // OTHER SECTIONS
  // Show default back button
  if (backDefault) backDefault.style.display = "block";

  openSection(view);
}

  
    // === PRODUCT DRAWER CLOSE (Remove product query)
  document.addEventListener("click", function (event) {
    const closeBtn = event.target.closest("#productDrawerClose");
    if (!closeBtn) return;

    console.log("❎ Product drawer closed — removing product from URL");

    if (isUpdatingFromURL) return;

    const url = new URL(window.location.href);
    url.searchParams.delete("product");

    isUpdatingFromURL = true;
    history.pushState(
      { view: url.searchParams.get("view") },
      document.title,
      url
    );

    handleQueryChange();
    setTimeout(() => { isUpdatingFromURL = false; }, 50);
  });

  // === BACK/FORWARD
  window.addEventListener("popstate", () => {
    console.log("⬅️ Back/forward detected");
    handleQueryChange();
  });

  // === INITIAL LOAD
  setTimeout(() => handleQueryChange(), 50);

  console.log("✅ Query-based navigation initialized");
});

// Source: body embed
window.Webflow = window.Webflow || [];
  window.Webflow.push(function () {
    function redrawSliders() {
    window.dispatchEvent(new Event('resize'));
      
    }

    // 🔹 Replace '.product-card-trigger' with the class/attribute
    // of the element that opens your product drawer / product view.
    const productTriggers = document.querySelectorAll('.product-list__item');

    productTriggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        // wait for Webflow interaction to finish opening the drawer
        setTimeout(redrawSliders, 50);
      });
    });

    // Optional: if you auto-open a product from the URL (?product=...)
    // call this once after that logic runs too.
    // setTimeout(redrawSliders, 300);
  });
