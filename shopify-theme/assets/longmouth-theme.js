document.addEventListener("DOMContentLoaded", function () {
  const root = document.querySelector(".longmouth-theme");
  if (!root) return;

  function initSiteSettingsBridge() {
    const settingsNode = root.querySelector("#longmouth-site-settings");
    if (!settingsNode) return;

    const data = settingsNode.dataset;
    const siteTitle = data.siteTitle || "";

    const titleNode = root.querySelector("#long-text");
    if (titleNode && siteTitle) {
      titleNode.textContent = siteTitle;
    }

    const setMenuLabel = (selector, value) => {
      const button = root.querySelector(selector);
      if (!button || !value) return;

      const labelNodes = button.querySelectorAll(".menu__item-text, .menu__item-text-hvr");
      labelNodes.forEach((node) => {
        node.textContent = value;
      });
    };

    setMenuLabel("#shop__button", data.menuLabelShop);
    setMenuLabel('[data-open-modal="waitlist-modal"]', data.menuLabelWaitlist);
    setMenuLabel('[data-open-modal="contact-modal"]', data.menuLabelContact);
    setMenuLabel("#otherstuff__button", data.menuLabelPolicy);
    setMenuLabel("#home__button-footer", data.menuLabelBackHome);

    const contactHeading = root.querySelector("#contact-modal h1");
    if (contactHeading && data.contactHeading) contactHeading.textContent = data.contactHeading;

    const contactLink = root.querySelector("#contact-modal .goth-link");
    if (contactLink && data.contactEmail) {
      contactLink.textContent = data.contactEmail;
      contactLink.href = `mailto:${data.contactEmail}`;
    }

    const socialLinks = root.querySelectorAll("#contact-modal .socials__container a");
    const socialValues = [data.youtubeUrl, data.tiktokUrl, data.instagramUrl];
    socialLinks.forEach((link, index) => {
      const value = socialValues[index];
      if (value) link.href = value;
    });

    const waitlistHeading = root.querySelector("#waitlist-modal h1");
    if (waitlistHeading && data.waitlistHeading) waitlistHeading.textContent = data.waitlistHeading;

    const policyLabel = root.querySelector("#waitlist-modal .readpolicy");
    if (policyLabel) {
      const policyText = data.waitlistPolicyPrefix || "here's our";
      const policyLinkText = data.waitlistPolicyLinkText || "privacy policy";
      const policyLink = policyLabel.querySelector("a");
      policyLabel.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          node.textContent = `${policyText} `;
        }
      });
      if (policyLink) {
        policyLink.textContent = policyLinkText;
      }
    }

    const cookieNotice = root.querySelector("#cookieNotice");
    if (cookieNotice) {
      const cookieText = cookieNotice.querySelector("[data-cookie-notice-text]");
      if (cookieText && data.cookieNoticeText) cookieText.textContent = data.cookieNoticeText;

      const cookieLink = cookieNotice.querySelector("[data-cookie-notice-link]");
      if (cookieLink) {
        if (data.cookiePolicyUrl) {
          cookieLink.href = data.cookiePolicyUrl;
          cookieLink.hidden = false;
        } else {
          cookieLink.hidden = true;
        }
      }
    }
  }

  initSiteSettingsBridge();

  function initHorizontalGalleryScroll() {
    const scroller = root.querySelector(".horizontal-scroll-wrapper");
    if (!scroller) return;

    let targetScrollLeft = scroller.scrollLeft;
    const ease = 0.1;
    let isScrolling = false;

    function smoothScroll() {
      if (!isScrolling) return;

      const delta = targetScrollLeft - scroller.scrollLeft;
      scroller.scrollLeft += delta * ease;

      if (Math.abs(delta) > 0.5) {
        requestAnimationFrame(smoothScroll);
      } else {
        scroller.scrollLeft = targetScrollLeft;
        isScrolling = false;
      }
    }

    window.addEventListener(
      "wheel",
      function (event) {
        const exempt = event.target.closest(".dropdown-scroll, .scroll-exempt");
        if (exempt) return;

        if (event.deltaY === 0) return;

        event.preventDefault();

        targetScrollLeft += event.deltaY;

        const maxScroll = scroller.scrollWidth - scroller.clientWidth;
        targetScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScroll));

        if (isScrolling) return;

        isScrolling = true;
        smoothScroll();
      },
      { passive: false }
    );
  }

  initHorizontalGalleryScroll();

    const menuCover = root.querySelector("#menu__loader-overlay");
    if (menuCover) {
    const menuCoverMode = menuCover.getAttribute("data-menu-loader-mode") || "hide_on_load";

    if (menuCoverMode === "hide") {
      menuCover.hidden = true;
      menuCover.style.display = "none";
    } else if (menuCoverMode === "hide_on_load") {
      menuCover.style.transition = "opacity 0.3s cubic-bezier(0.33, 1, 0.68, 1)";
      menuCover.style.opacity = "0";
      setTimeout(() => {
        menuCover.hidden = true;
        menuCover.style.display = "none";
      }, 300);
    } else {
      menuCover.hidden = false;
      menuCover.style.display = "flex";
    }
  }

  const views = root.querySelectorAll("[data-view]");
  const modals = root.querySelectorAll(".modals__wrapper > [id]");
  const productPanel = root.querySelector("#product__panel");
  const productDrawerContent = root.querySelector("#longmouth-product-drawer-content");
  const productCards = root.querySelectorAll(".product-list__item[data-id]");
  const cartCount = root.querySelector(".cart_count");
  const moneyFormatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  });
  let loadedProductCache = {};

  function showView(name) {
    views.forEach((view) => {
      const isTarget = view.getAttribute("data-view") === name;
      view.hidden = !isTarget;
    });

    if (name !== "shop") {
      closeProductDrawer();
    }
  }

  function hideAllModals() {
    modals.forEach((modal) => {
      modal.hidden = true;
    });
  }

  function showModal(id) {
    hideAllModals();
    const modal = root.querySelector(`#${id}`);
    if (modal) modal.hidden = false;
  }

  function closeProductDrawer() {
    if (!productPanel) return;
    productPanel.classList.remove("active");
    productPanel.setAttribute("aria-hidden", "true");
  }

  function formatMoney(cents) {
    return moneyFormatter.format((Number(cents || 0) / 100) || 0);
  }

  function escapeHtml(input) {
    return String(input || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getSelectedOptions(product, optionState) {
    return (product.options || []).map((name, index) => {
      return optionState[name] || (product.variants[0] && product.variants[0][`option${index + 1}`]) || "";
    });
  }

  function findVariant(product, optionState) {
    const selected = getSelectedOptions(product, optionState);
    return product.variants.find((variant) => {
      return selected.every((value, index) => variant[`option${index + 1}`] === value);
    }) || product.variants[0];
  }

  function renderVariantControls(product, optionState) {
    if (!product.options || !product.options.length) return "";

    const isApparel = String(product.type || "").toLowerCase() === "apparel";

    return product.options
      .map((optionName, optionIndex) => {
        const key = `option${optionIndex + 1}`;
        const values = Array.from(new Set(product.variants.map((v) => v[key]).filter(Boolean)));
        const selected = optionState[optionName] || values[0] || "";
        const isSizeOption = /size/i.test(optionName);

        if (isApparel && isSizeOption) {
          return `
            <div class="product-option product-option--size" data-option-name="${escapeHtml(optionName)}">
              <div class="product-option__label">${escapeHtml(optionName)}</div>
              <div class="product-option__size-buttons">
                ${values
                  .map((value) => {
                    const active = selected === value ? " is-active" : "";
                    return `<button type="button" class="size-option${active}" data-option-value="${escapeHtml(value)}">${escapeHtml(value)}</button>`;
                  })
                  .join("")}
              </div>
            </div>
          `;
        }

        return `
          <div class="product-option" data-option-name="${escapeHtml(optionName)}">
            <label>${escapeHtml(optionName)}</label>
            <select data-option-select="${escapeHtml(optionName)}">
              ${values
                .map((value) => {
                  const selectedAttr = selected === value ? " selected" : "";
                  return `<option value="${escapeHtml(value)}"${selectedAttr}>${escapeHtml(value)}</option>`;
                })
                .join("")}
            </select>
          </div>
        `;
      })
      .join("");
  }

  function renderProductDrawer(product, optionState) {
    if (!productDrawerContent) return;

    const selectedVariant = findVariant(product, optionState);
    const gallery = (product.images || [])
      .map(
        (src) =>
          `<img loading="lazy" src="${escapeHtml(src)}" alt="${escapeHtml(product.title)}">`
      )
      .join("");

    productDrawerContent.innerHTML = `
      <div class="product-content-wrapper" data-product-handle="${escapeHtml(product.handle)}">
        <div class="product">
          <div class="product__gallery">${gallery}</div>
          <div class="product__content">
            <h2>${escapeHtml(product.title)}</h2>
            <div class="product-details__description">${product.description || ""}</div>

            <form id="drawer-product-form" class="form" data-product-id="${product.id}">
              ${renderVariantControls(product, optionState)}
              <input type="hidden" name="id" value="${selectedVariant ? selectedVariant.id : ""}">
              <button type="submit" class="button" ${selectedVariant && !selectedVariant.available ? "disabled" : ""}>
                ${selectedVariant && !selectedVariant.available ? "sold out" : `add to cart - ${formatMoney(selectedVariant ? selectedVariant.price : 0)}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    bindDrawerForm(product, optionState);
  }

  function bindDrawerForm(product, optionState) {
    const form = root.querySelector("#drawer-product-form");
    if (!form) return;

    form.querySelectorAll("[data-option-select]").forEach((select) => {
      select.addEventListener("change", function (event) {
        const optionName = event.target.getAttribute("data-option-select");
        optionState[optionName] = event.target.value;
        renderProductDrawer(product, optionState);
      });
    });

    form.querySelectorAll(".size-option").forEach((button) => {
      button.addEventListener("click", function () {
        const optionWrap = button.closest("[data-option-name]");
        if (!optionWrap) return;
        const optionName = optionWrap.getAttribute("data-option-name");
        const value = button.getAttribute("data-option-value");
        optionState[optionName] = value;
        renderProductDrawer(product, optionState);
      });
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const variantId = form.querySelector('input[name="id"]')?.value;
      if (!variantId) return;

      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;

      try {
        await fetch("/cart/add.js", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: Number(variantId),
            quantity: 1,
          }),
        });

        const cartRes = await fetch("/cart.js");
        const cartData = await cartRes.json();
        if (cartCount) cartCount.textContent = String(cartData.item_count || 0);
      } catch (error) {
        console.error("Failed to add to cart", error);
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });
  }

  async function openProductDrawerByHandle(productHandle) {
    if (!productPanel || !productDrawerContent || !productHandle) return;

    productPanel.classList.add("active");
    productPanel.setAttribute("aria-hidden", "false");
    productDrawerContent.innerHTML = "<p>Loading product...</p>";

    try {
      let product = loadedProductCache[productHandle];
      if (!product) {
        const response = await fetch(`/products/${encodeURIComponent(productHandle)}.js`);
        if (!response.ok) throw new Error(`Unable to load product ${productHandle}`);
        product = await response.json();
        loadedProductCache[productHandle] = product;
      }

      const optionState = {};
      renderProductDrawer(product, optionState);
    } catch (error) {
      console.error(error);
      productDrawerContent.innerHTML = "<p>Unable to load product details.</p>";
    }
  }

  root.querySelectorAll("[data-open-view]").forEach((button) => {
    button.addEventListener("click", function () {
      const target = button.getAttribute("data-open-view");
      hideAllModals();
      showView(target);
    });
  });

  root.querySelectorAll("[data-open-modal]").forEach((button) => {
    button.addEventListener("click", function () {
      const target = button.getAttribute("data-open-modal");
      showModal(target);
    });
  });

  root.querySelectorAll("#productDrawerClose").forEach((btn) => {
    btn.addEventListener("click", function () {
      closeProductDrawer();
    });
  });

  productCards.forEach((card) => {
    const link = card.querySelector("[data-open-product-drawer]");
    if (!link) return;

    link.addEventListener("click", function (event) {
      event.preventDefault();
      const handle = card.getAttribute("data-product-handle");
      showView("shop");
      hideAllModals();
      openProductDrawerByHandle(handle);
    });
  });

  const dropdown = root.querySelector("#tagFilter");
  if (dropdown) {
    dropdown.addEventListener("change", function (event) {
      const selected = String(event.target.value || "all").toLowerCase();

      productCards.forEach((card) => {
        const tags = String(card.getAttribute("data-product-tags") || "").toLowerCase();
        const matches = selected === "all" || tags.split(",").includes(selected);
        card.style.display = matches ? "" : "none";
      });
    });
  }

  const tabButtons = root.querySelectorAll("[data-policy-tab]");
  const tabPanes = root.querySelectorAll("[data-policy-pane]");
  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tab = button.getAttribute("data-policy-tab");

      tabButtons.forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");

      tabPanes.forEach((pane) => {
        const match = pane.getAttribute("data-policy-pane") === tab;
        pane.classList.toggle("is-active", match);
      });
    });
  });

  const cookieNotice = document.getElementById("cookieNotice");
  const cookieClose = document.getElementById("closeCookieNotice");
  if (cookieNotice && cookieClose) {
    if (!localStorage.getItem("cookiesAccepted")) {
      cookieNotice.style.display = "block";
    }

    cookieClose.addEventListener("click", function () {
      localStorage.setItem("cookiesAccepted", "true");
      cookieNotice.style.display = "none";
    });
  }

  showView("home");
});
