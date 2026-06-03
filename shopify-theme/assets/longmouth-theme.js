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
        const exempt = event.target.closest(".dropdown-scroll, .scroll-exempt, .product-list, #longmouth-product-drawer-content");
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
  const modalIds = new Set(Array.from(modals).map((modal) => modal.id).filter(Boolean));
  const viewNames = new Set(Array.from(views).map((view) => view.getAttribute("data-view")).filter(Boolean));
  const productPanel = root.querySelector("#product__panel");
  const productDrawerContent = root.querySelector("#longmouth-product-drawer-content");
  const productCards = root.querySelectorAll(".product-list__item[data-id]");
  const policyTabButtons = root.querySelectorAll("[data-policy-tab]");
  const policyTabPanes = root.querySelectorAll("[data-policy-pane]");
  const policyTabIds = new Set(
    Array.from(policyTabPanes)
      .map((pane) => pane.getAttribute("data-policy-pane"))
      .filter(Boolean)
  );
  const menuWrap = root.querySelector(".menu__wrap");
  const menuBackWrap = root.querySelector(".menu-back__wrap");
  const homeButtonWrap = root.querySelector("#home__button");
  const cartCount = root.querySelector(".cart_count");
  let loadedProductCache = {};
  let navigationToken = 0;

  function formatMoney(cents) {
    const value = (Number(cents || 0) / 100) || 0;
    const fmt = (window.lmShop && window.lmShop.moneyFormat) || "${{amount}}";
    function withDelimiters(n, precision, thousands, decimal) {
      const str = Math.abs(n).toFixed(precision);
      const parts = str.split(".");
      parts[0] = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + thousands);
      return (n < 0 ? "-" : "") + parts.join(decimal);
    }
    return fmt
      .replace("{{amount}}", withDelimiters(value, 2, ",", "."))
      .replace("{{amount_no_decimals}}", withDelimiters(value, 0, ",", "."))
      .replace("{{amount_with_comma_separator}}", withDelimiters(value, 2, ".", ","))
      .replace("{{amount_no_decimals_with_comma_separator}}", withDelimiters(value, 0, ".", ","))
      .replace("{{amount_with_apostrophe_separator}}", withDelimiters(value, 2, "'", "."));
  }

  function showView(name) {
    views.forEach((view) => {
      const viewName = view.getAttribute("data-view");
      const isHomeView = viewName === "home";
      const isTarget = viewName === name;
      const shouldStayVisible = isHomeView || isTarget;

      view.hidden = !shouldStayVisible;
      view.classList.toggle("show", isTarget);
    });

    if (menuWrap) {
      menuWrap.hidden = name !== "home";
      menuWrap.style.display = name === "home" ? "flex" : "none";
    }

    if (menuBackWrap) {
      menuBackWrap.hidden = name === "home";
      menuBackWrap.style.display = name === "home" ? "none" : "flex";
    }

    if (name !== "shop") {
      closeProductDrawer();
    }

    const policyWrap = root.querySelector(".policy__wrap");
    if (policyWrap) {
      policyWrap.classList.toggle("show", name === "policy");
    }
  }

  function hideAllModals() {
    modals.forEach((modal) => {
      modal.hidden = true;
      modal.classList.remove("show");
    });
  }

  function showModal(id) {
    const modal = root.querySelector(`#${id}`);
    if (!modal) return;
    modal.hidden = false;
    modal.classList.add("show");
  }

  function closeProductDrawer() {
    if (!productPanel) return;
    productPanel.classList.remove("active");
    productPanel.setAttribute("aria-hidden", "true");
    hideProductDrawerLoader();
  }

  function closeOpenModules() {
    closeProductDrawer();
  }

  function getProductDrawerLoaderMarkup() {
    if (!productPanel) return "";
    const loaderUrl = productPanel.getAttribute("data-loader-url") || "";
    const loaderMedia = loaderUrl
      ? `<img src="${escapeHtml(loaderUrl)}" loading="eager" alt="Loading product" class="product-drawer-loader__image">`
      : '<div class="product-drawer-spinner" aria-hidden="true"></div>';

    return `
      <div class="product-drawer-loader" role="status" aria-live="polite" aria-label="Loading product details">
        ${loaderMedia}
      </div>
    `;
  }

  function showProductDrawerLoader() {
    if (!productPanel) return;
    const panelInner = productPanel.querySelector(".product__panel-inner");
    if (!panelInner) return;

    let loader = panelInner.querySelector(".product-drawer-loader");
    if (!loader) {
      panelInner.insertAdjacentHTML("beforeend", getProductDrawerLoaderMarkup());
      loader = panelInner.querySelector(".product-drawer-loader");
    }

    if (loader) {
      loader.hidden = false;
      loader.style.display = "flex";
    }

    if (productDrawerContent) {
      productDrawerContent.hidden = true;
    }
  }

  function hideProductDrawerLoader() {
    if (!productPanel) return;
    const loader = productPanel.querySelector(".product-drawer-loader");
    if (loader) {
      loader.hidden = true;
      loader.style.display = "none";
    }

    if (productDrawerContent) {
      productDrawerContent.hidden = false;
    }
  }

  function preloadImage(src) {
    return new Promise((resolve) => {
      const image = new Image();
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      image.onload = done;
      image.onerror = done;
      image.src = src;
      if (image.complete) done();
    });
  }

  async function preloadProductGalleryImages(product) {
    const imageSources = Array.from(new Set((product && product.images) || [])).filter(Boolean);
    if (!imageSources.length) return;
    await Promise.all(imageSources.map((source) => preloadImage(source)));
  }

  function waitForElementImageReady(image) {
    return new Promise((resolve) => {
      if (!image) {
        resolve();
        return;
      }

      const finalize = async () => {
        try {
          if (typeof image.decode === "function") {
            await image.decode();
          }
        } catch (error) {
          // Decoding failures should not block panel reveal.
        }
        resolve();
      };

      if (image.complete && image.naturalWidth > 0) {
        finalize();
        return;
      }

      image.addEventListener("load", finalize, { once: true });
      image.addEventListener("error", finalize, { once: true });
    });
  }

  async function waitForDrawerImagesReady() {
    if (!productDrawerContent) return;

    const drawerImages = Array.from(
      productDrawerContent.querySelectorAll(
        ".product-gallery-image, .product-lightbox-image, .product-gallery-thumb-image"
      )
    );

    if (!drawerImages.length) return;

    await Promise.all(drawerImages.map((image) => waitForElementImageReady(image)));

    // Ensure decoded images are ready for paint before revealing the panel content.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  function clampIndex(index, length) {
    if (!length) return 0;
    const normalized = Number(index) || 0;
    return ((normalized % length) + length) % length;
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

    return product.options
      .map((option, optionIndex) => {
        const optionName = typeof option === "string" ? option : (option?.name || String(option));
        const key = `option${optionIndex + 1}`;
        const values = Array.from(new Set(product.variants.map((v) => v[key]).filter(Boolean)));

        // Skip the Shopify default single-variant placeholder
        if (values.length === 1 && values[0] === "Default Title") return "";

        const selected = optionState[optionName] || values[0] || "";

        const unavailableValues = new Set(
          values.filter((value) => !product.variants.some((v) => v[key] === value && v.available))
        );

        const buttons = values
          .map((value) => {
            const activeClass = selected === value ? " active" : "";
            const disabledClass = unavailableValues.has(value) ? " is-disabled" : "";
            return `<button type="button" class="variant_option-button${activeClass}${disabledClass}" data-option-value="${escapeHtml(value)}"><div class="variant_option-label">${escapeHtml(value)}</div></button>`;
          })
          .join("");

        return `<div class="variant-swatches" data-option-name="${escapeHtml(optionName)}"><label class="variant-label is-hidden">${escapeHtml(optionName)}</label><div class="variant__options">${buttons}</div></div>`;
      })
      .join("");
  }

  function renderGalleryMarkup(product, optionState, closeIconUrl) {
    const images = product.images || [];
    const hasImages = images.length > 0;
    const activeIndex = clampIndex(optionState.__galleryIndex, images.length);
    const previousIndex = clampIndex(optionState.__previousGalleryIndex, images.length);
    const direction = optionState.__galleryDirection === "backward" ? "backward" : "forward";
    optionState.__galleryIndex = activeIndex;

    if (!hasImages) {
      return `
        <div class="product-gallery-shell product-gallery-shell--empty">
          <div class="product-gallery-stage product-gallery-stage--empty">No product images available.</div>
        </div>
      `;
    }

    const slides = images
      .map((src, index) => {
        const isActive = index === activeIndex ? " is-active" : "";
        return `
          <button type="button" class="product-gallery-slide${isActive}" data-gallery-index="${index}" data-gallery-open="${index}" aria-label="Open image ${index + 1} of ${images.length}">
            <img class="product-gallery-image" loading="eager" src="${escapeHtml(src)}" alt="${escapeHtml(product.title)} image ${index + 1}">
          </button>
        `;
      })
      .join("");

    const dots = images
      .map((_, index) => {
        const isActive = index === activeIndex ? " is-active" : "";
        return `<button type="button" class="product-gallery-dot${isActive}" data-gallery-thumb="${index}" aria-label="Show image ${index + 1}"></button>`;
      })
      .join("");

    const lightboxSlides = images
      .map((src, index) => {
        const isActive = index === activeIndex ? " is-active" : "";
        return `
          <div class="product-lightbox-slide${isActive}" data-lightbox-slide="${index}">
            <img class="product-lightbox-image" loading="eager" src="${escapeHtml(src)}" alt="${escapeHtml(product.title)} detail ${index + 1}">
          </div>
        `;
      })
      .join("");

    const lightboxThumbs = images
      .map((src, index) => {
        const isActive = index === activeIndex ? " is-active" : "";
        return `
          <button type="button" class="sm-image-gallery_thumbnail-image product-lightbox-thumb${isActive}" data-lightbox-thumb="${index}" aria-label="View detail image ${index + 1}">
            <img class="product-gallery-thumb-image" loading="eager" src="${escapeHtml(src)}" alt="${escapeHtml(product.title)} detail thumbnail ${index + 1}">
          </button>
        `;
      })
      .join("");

    const openClass = optionState.__lightboxOpen ? " show" : "";

    return `
      <div class="product-gallery-shell" data-gallery-length="${images.length}" data-gallery-direction="${direction}">
        <div class="product-gallery-stage">
          <button type="button" class="product-gallery-arrow product-gallery-arrow--prev" data-gallery-prev aria-label="Previous image">&#8249;</button>
          <div class="product-gallery-viewport">${slides}</div>
          <button type="button" class="product-gallery-arrow product-gallery-arrow--next" data-gallery-next aria-label="Next image">&#8250;</button>
        </div>
        <div class="product-gallery-dots">${dots}</div>
        <div class="sm-image-gallery_container product${openClass}" data-product-lightbox>
          <button type="button" class="close-btn__wrapper" data-lightbox-close aria-label="Close gallery">
            <img src="${escapeHtml(closeIconUrl)}" loading="eager" alt="close" class="close-btn__x">
          </button>
          <div class="product-lightbox-stage">
            <button type="button" class="sm-slider_arrow product-lightbox-arrow" data-lightbox-prev aria-label="Previous gallery image">&#8249;</button>
            <div class="product-lightbox-viewport">${lightboxSlides}</div>
            <button type="button" class="sm-slider_arrow product-lightbox-arrow" data-lightbox-next aria-label="Next gallery image">&#8250;</button>
          </div>
          <div class="sm-image-gallery_thumbnails">${lightboxThumbs}</div>
        </div>
      </div>
    `;
  }

  function renderProductDrawer(product, optionState) {
    if (!productDrawerContent) return;

    const selectedVariant = findVariant(product, optionState);
    const closeIconUrl = productPanel ? (productPanel.getAttribute('data-close-icon-url') || '') : '';
    const gallery = renderGalleryMarkup(product, optionState, closeIconUrl);
    const quantity = Math.max(1, Number(optionState.__quantity || 1));
    const priceMarkup = selectedVariant && selectedVariant.available
      ? `
        <div class="product__price-wrap">
          ${selectedVariant.compare_at_price > selectedVariant.price
            ? `<span class="price_compare-at-price-3">${formatMoney(selectedVariant.compare_at_price)}</span>`
            : ""}
          <span class="price_regular-price-3">${formatMoney(selectedVariant.price)}</span>
        </div>
      `
      : `
        <div class="product__sold-out-wrap">
          <span class="price_regular-price-3">sold out</span>
        </div>
      `;
    const submitLabel = selectedVariant && selectedVariant.available ? "add to cart" : "get notified";
    const sizeChartUrl = optionState.__sizeChartUrl || "";
    const sizeChartMarkup = sizeChartUrl
      ? `<div class="product__size-chart-link" data-size-chart-toggle>size chart</div>
         <div class="modal__size-chart product__modal" data-size-chart-modal>
           <img src="${escapeHtml(closeIconUrl)}" class="close" alt="close" data-size-chart-close>
           <img src="${escapeHtml(sizeChartUrl)}" class="size-chart__svg" alt="size chart">
         </div>`
      : "";

    productDrawerContent.innerHTML = `
      <div class="product-content-wrapper" data-product-handle="${escapeHtml(product.handle)}">
        <div class="product">
          <div class="product__gallery">${gallery}</div>
          <div class="product__content">
            <div class="product-details">
              <div class="product-details__title">${escapeHtml(product.title)}</div>
              ${priceMarkup}
              ${sizeChartMarkup}
              <div class="spacer__vertical40 mobile--hide"></div>
              <div class="product-details__description">${product.description || ""}</div>
            </div>
            <div class="product-options">
              <form id="drawer-product-form" class="form product-drawer-form" data-product-id="${product.id}">
                ${renderVariantControls(product, optionState)}
                <input type="hidden" name="id" value="${selectedVariant ? selectedVariant.id : ""}">
                <div class="atc_wrapper">
                  <div class="quantity-input">
                    <div class="add-to-cart_quantity-input">
                      <button type="button" class="add-to-cart_quantity-button left" data-quantity-change="-1" aria-label="Decrease quantity">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="product-slider_lightbox-icon"><path d="M0 0h24v24H0z" fill="white"></path><path d="M19 13H5v-2h14v2z" fill="currentColor"></path></svg>
                      </button>
                      <input class="atc__quantity-field add-to-cart-2" type="number" value="${quantity}" readonly aria-label="Quantity">
                      <button type="button" class="add-to-cart_quantity-button right" data-quantity-change="1" aria-label="Increase quantity">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="product-slider_lightbox-icon"><path d="M0 0h24v24H0z" fill="white"></path><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"></path></svg>
                      </button>
                    </div>
                  </div>
                  <button type="submit" class="button is-icon product-drawer-submit">
                    <div class="button_default-state"><span class="atc__btn-text">${submitLabel}</span></div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    bindDrawerForm(product, optionState);
    bindDrawerGallery(product, optionState);
    bindSizeChart(productDrawerContent);
  }

  function bindSizeChart(contentRoot) {
    const link = contentRoot.querySelector("[data-size-chart-toggle]");
    const modal = contentRoot.querySelector("[data-size-chart-modal]");
    const closeBtn = contentRoot.querySelector("[data-size-chart-close]");
    if (!link || !modal) return;
    link.addEventListener("click", () => modal.classList.toggle("show"));
    if (closeBtn) closeBtn.addEventListener("click", (e) => { e.stopPropagation(); modal.classList.remove("show"); });
  }

  function bindDrawerGallery(product, optionState) {
    const contentRoot = root.querySelector("#longmouth-product-drawer-content");
    if (!contentRoot) return;

    const images = product.images || [];
    if (!images.length) return;

    function slideEl(viewport, selector, clamped, nextDirection) {
      if (!viewport) return;
      const current = viewport.querySelector(".is-active");
      const next = viewport.querySelector(`[data-gallery-index="${clamped}"], [data-lightbox-slide="${clamped}"]`);
      if (!next || next === current) return;

      // Snap incoming slide to off-screen start (no transition)
      next.style.transition = "none";
      next.style.transform = nextDirection === "backward" ? "translateX(-100%)" : "translateX(100%)";
      next.getBoundingClientRect(); // force reflow

      // Animate both simultaneously
      next.style.transition = "";
      next.style.transform = "translateX(0)";
      next.classList.add("is-active");

      if (current) {
        current.style.transform = nextDirection === "backward" ? "translateX(100%)" : "translateX(-100%)";
        current.classList.remove("is-active");
        current.addEventListener("transitionend", () => {
          current.style.transform = "";
          current.style.transition = "";
        }, { once: true });
      }
    }

    function slideGallery(nextIndex, nextDirection, lightboxOpen) {
      const clamped = clampIndex(nextIndex, images.length);
      const prevIndex = optionState.__galleryIndex || 0;

      // Animate main gallery
      slideEl(contentRoot.querySelector(".product-gallery-viewport"), null, clamped, nextDirection);

      // Sync lightbox slides if open (or being opened)
      const lbOpen = lightboxOpen !== undefined ? Boolean(lightboxOpen) : optionState.__lightboxOpen;
      if (lbOpen) {
        slideEl(contentRoot.querySelector(".product-lightbox-viewport"), null, clamped, nextDirection);
        contentRoot.querySelectorAll("[data-lightbox-thumb]").forEach((t) => {
          t.classList.toggle("is-active", parseInt(t.getAttribute("data-lightbox-thumb") || "0") === clamped);
        });
      }

      // Lightbox visibility
      if (lightboxOpen !== undefined) {
        contentRoot.querySelector("[data-product-lightbox]")?.classList.toggle("show", Boolean(lightboxOpen));
      }

      // Update dots
      contentRoot.querySelectorAll(".product-gallery-dot").forEach((dot, i) => {
        dot.classList.toggle("is-active", i === clamped);
      });

      optionState.__previousGalleryIndex = prevIndex;
      optionState.__galleryIndex = clamped;
      optionState.__galleryDirection = nextDirection;
      if (lightboxOpen !== undefined) optionState.__lightboxOpen = Boolean(lightboxOpen);
    }

    contentRoot.querySelector("[data-gallery-prev]")?.addEventListener("click", () =>
      slideGallery((optionState.__galleryIndex || 0) - 1, "backward", undefined));

    contentRoot.querySelector("[data-gallery-next]")?.addEventListener("click", () =>
      slideGallery((optionState.__galleryIndex || 0) + 1, "forward", undefined));

    contentRoot.querySelectorAll("[data-gallery-thumb]").forEach((button) => {
      button.addEventListener("click", function () {
        const target = clampIndex(Number(button.getAttribute("data-gallery-thumb") || 0), images.length);
        if (target === (optionState.__galleryIndex || 0)) return;
        slideGallery(target, target < (optionState.__galleryIndex || 0) ? "backward" : "forward", undefined);
      });
    });

    contentRoot.querySelectorAll("[data-gallery-open]").forEach((button) => {
      button.addEventListener("click", function () {
        const target = clampIndex(Number(button.getAttribute("data-gallery-open") || 0), images.length);
        slideGallery(target, target < (optionState.__galleryIndex || 0) ? "backward" : "forward", true);
      });
    });

    contentRoot.querySelector("[data-lightbox-close]")?.addEventListener("click", function () {
      contentRoot.querySelector("[data-product-lightbox]")?.classList.remove("show");
      optionState.__lightboxOpen = false;
    });

    contentRoot.querySelector("[data-lightbox-prev]")?.addEventListener("click", () =>
      slideGallery((optionState.__galleryIndex || 0) - 1, "backward", true));

    contentRoot.querySelector("[data-lightbox-next]")?.addEventListener("click", () =>
      slideGallery((optionState.__galleryIndex || 0) + 1, "forward", true));

    contentRoot.querySelectorAll("[data-lightbox-thumb]").forEach((button) => {
      button.addEventListener("click", function () {
        const target = clampIndex(Number(button.getAttribute("data-lightbox-thumb") || 0), images.length);
        if (target === (optionState.__galleryIndex || 0)) return;
        slideGallery(target, target < (optionState.__galleryIndex || 0) ? "backward" : "forward", true);
      });
    });

  }

  function bindDrawerForm(product, optionState) {
    const form = root.querySelector("#drawer-product-form");
    if (!form) return;

    form.querySelectorAll(".variant_option-button").forEach((button) => {
      button.addEventListener("click", function () {
        const optionWrap = button.closest("[data-option-name]");
        if (!optionWrap) return;
        const optionName = optionWrap.getAttribute("data-option-name");
        const value = button.getAttribute("data-option-value");
        optionState[optionName] = value;
        renderProductDrawer(product, optionState);
      });
    });

    form.querySelectorAll("[data-quantity-change]").forEach((button) => {
      button.addEventListener("click", function () {
        const delta = Number(button.getAttribute("data-quantity-change")) || 0;
        optionState.__quantity = Math.max(1, Number(optionState.__quantity || 1) + delta);
        renderProductDrawer(product, optionState);
      });
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const variantId = form.querySelector('input[name="id"]')?.value;
      if (!variantId) return;

      const selectedVariant = findVariant(product, optionState);
      if (!selectedVariant || !selectedVariant.available) return;

      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;

      try {
        await fetch("/cart/add.js", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: Number(variantId),
            quantity: Math.max(1, Number(optionState.__quantity || 1)),
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

  async function openProductDrawerByHandle(productHandle, sizeChartUrl) {
    if (!productPanel || !productDrawerContent || !productHandle) return;

    try {
      productPanel.classList.add("active");
      productPanel.setAttribute("aria-hidden", "false");
      showProductDrawerLoader();

      let product = loadedProductCache[productHandle];
      if (!product) {
        const response = await fetch(`/products/${encodeURIComponent(productHandle)}.js`);
        if (!response.ok) throw new Error(`Unable to load product ${productHandle}`);
        product = await response.json();
        loadedProductCache[productHandle] = product;
      }

      await preloadProductGalleryImages(product);

      const optionState = { __quantity: 1, __galleryIndex: 0, __previousGalleryIndex: 0, __galleryDirection: "forward", __sizeChartUrl: sizeChartUrl || "" };
      renderProductDrawer(product, optionState);
      await waitForDrawerImagesReady();
      hideProductDrawerLoader();
    } catch (error) {
      console.error(error);
      productDrawerContent.innerHTML = "<p>Unable to load product details.</p>";
      hideProductDrawerLoader();
      productPanel.classList.add("active");
      productPanel.setAttribute("aria-hidden", "false");
    }
  }

  function getNormalizedViewName(value) {
    const fallback = "home";
    if (!value) return fallback;
    const normalized = String(value).toLowerCase();
    if (!viewNames.has(normalized)) return fallback;
    return normalized;
  }

  function getCurrentViewName() {
    const active = root.querySelector("[data-view].show");
    const activeName = active ? active.getAttribute("data-view") : "";
    return getNormalizedViewName(activeName || "home");
  }

  function normalizePolicyTab(value) {
    const fallback = policyTabPanes[0] ? (policyTabPanes[0].getAttribute("data-policy-pane") || "") : "";
    if (!value) return fallback;
    const normalized = String(value).trim().toLowerCase();
    if (!policyTabIds.has(normalized)) return fallback;
    return normalized;
  }

  function getCurrentPolicyTab() {
    const activeTab = root.querySelector("[data-policy-tab].is-active");
    const activeValue = activeTab ? activeTab.getAttribute("data-policy-tab") : "";
    return normalizePolicyTab(activeValue);
  }

  function setActivePolicyTab(value) {
    const selected = normalizePolicyTab(value);
    if (!selected) return;

    policyTabButtons.forEach((button) => {
      const tab = (button.getAttribute("data-policy-tab") || "").toLowerCase();
      button.classList.toggle("is-active", tab === selected);
    });

    policyTabPanes.forEach((pane) => {
      const paneName = (pane.getAttribute("data-policy-pane") || "").toLowerCase();
      pane.classList.toggle("is-active", paneName === selected);
    });
  }

  function normalizeModalIds(input) {
    const values = Array.isArray(input)
      ? input
      : typeof input === "string"
        ? input.split(",")
        : [];

    return Array.from(
      new Set(
        values
          .map((value) => String(value || "").trim())
          .filter((value) => modalIds.has(value))
      )
    );
  }

  function getCurrentModalIds() {
    return Array.from(modals)
      .filter((modal) => !modal.hidden)
      .map((modal) => modal.id)
      .filter(Boolean);
  }

  function getCurrentProductHandle() {
    if (!productPanel || !productPanel.classList.contains("active")) return "";
    const contentWrapper = productDrawerContent ? productDrawerContent.querySelector(".product-content-wrapper[data-product-handle]") : null;
    const handle = contentWrapper ? contentWrapper.getAttribute("data-product-handle") : "";
    return handle || "";
  }

  function getCurrentSizeChartUrl() {
    if (!productPanel || !productPanel.classList.contains("active")) return "";
    const chartImage = productDrawerContent ? productDrawerContent.querySelector("[data-size-chart-modal] .size-chart__svg") : null;
    if (!chartImage) return "";
    return chartImage.getAttribute("src") || "";
  }

  function getCurrentUiState() {
    const productHandle = getCurrentProductHandle();
    const currentModals = getCurrentModalIds();
    return {
      view: productHandle ? "shop" : getCurrentViewName(),
      modals: productHandle ? [] : currentModals,
      product: productHandle,
      sizeChart: productHandle ? getCurrentSizeChartUrl() : "",
      policyTab: getCurrentPolicyTab(),
    };
  }

  function readRouteStateFromUrl() {
    const url = new URL(window.location.href);
    const product = (url.searchParams.get("product") || "").trim();
    const legacyModal = (url.searchParams.get("modal") || "").trim();
    const modalsParam = (url.searchParams.get("modals") || "").trim();
    const sizeChart = (url.searchParams.get("sizeChart") || "").trim();
    const policyTab = (url.searchParams.get("policyTab") || "").trim();

    let view = getNormalizedViewName(url.searchParams.get("view") || "home");
    if (product) view = "shop";

    const modals = normalizeModalIds(modalsParam || legacyModal);

    return {
      view,
      modals,
      product,
      sizeChart,
      policyTab: normalizePolicyTab(policyTab),
    };
  }

  function buildUrlFromRouteState(state) {
    const url = new URL(window.location.href);
    url.searchParams.delete("view");
    url.searchParams.delete("modal");
    url.searchParams.delete("modals");
    url.searchParams.delete("product");
    url.searchParams.delete("sizeChart");
    url.searchParams.delete("policyTab");

    const normalizedView = getNormalizedViewName(state.view || "home");
    if (normalizedView !== "home") {
      url.searchParams.set("view", normalizedView);
    }

    if (state.product) {
      url.searchParams.set("product", state.product);
      if (state.sizeChart) {
        url.searchParams.set("sizeChart", state.sizeChart);
      }
      const productModals = normalizeModalIds(state.modals);
      if (productModals.length) {
        url.searchParams.set("modals", productModals.join(","));
      }
      return `${url.pathname}${url.search}${url.hash}`;
    }

    const routeModals = normalizeModalIds(state.modals);
    if (routeModals.length) {
      url.searchParams.set("modals", routeModals.join(","));
    }

    if (normalizedView === "policy") {
      const selectedPolicyTab = normalizePolicyTab(state.policyTab);
      if (selectedPolicyTab) {
        url.searchParams.set("policyTab", selectedPolicyTab);
      }
    }

    return `${url.pathname}${url.search}${url.hash}`;
  }

  function setBrowserUrlFromState(state, replace) {
    const nextUrl = buildUrlFromRouteState(state);
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl === currentUrl) return;

    const historyState = {
      view: state.view || "home",
      modals: normalizeModalIds(state.modals),
      product: state.product || "",
      sizeChart: state.sizeChart || "",
      policyTab: normalizePolicyTab(state.policyTab),
    };

    if (replace) {
      window.history.replaceState(historyState, "", nextUrl);
      return;
    }

    window.history.pushState(historyState, "", nextUrl);
  }

  async function applyRouteState(inputState, options = {}) {
    const token = ++navigationToken;
    const state = {
      view: getNormalizedViewName(inputState && inputState.view ? inputState.view : "home"),
      modals: normalizeModalIds(
        inputState && inputState.modals !== undefined
          ? inputState.modals
          : inputState && inputState.modal
            ? inputState.modal
            : []
      ),
      product: inputState && inputState.product ? String(inputState.product) : "",
      sizeChart: inputState && inputState.sizeChart ? String(inputState.sizeChart) : "",
      policyTab: normalizePolicyTab(
        inputState && inputState.policyTab !== undefined
          ? inputState.policyTab
          : getCurrentPolicyTab()
      ),
    };

    if (state.product) {
      state.view = "shop";
    }

    closeOpenModules();
    showView(state.view);
    setActivePolicyTab(state.policyTab);

    hideAllModals();
    state.modals.forEach((modalId) => showModal(modalId));

    if (state.product) {
      await openProductDrawerByHandle(state.product, state.sizeChart || "");
      if (token !== navigationToken) return;
    }

    if (!options.skipHistory) {
      setBrowserUrlFromState(state, Boolean(options.replaceHistory));
    }
  }

  function syncUrlToCurrentUiState(options = {}) {
    const state = getCurrentUiState();
    setBrowserUrlFromState(state, Boolean(options.replaceHistory));
  }

  function inferViewFromEditorSelection(node) {
    if (!node || !(node instanceof Element)) return "";

    if (node.matches("[data-view]")) {
      return getNormalizedViewName(node.getAttribute("data-view"));
    }

    const viewRoot = node.querySelector("[data-view]");
    if (viewRoot) {
      return getNormalizedViewName(viewRoot.getAttribute("data-view"));
    }

    return "";
  }

  function openEditorSelectedView(event) {
    const selectedNode = event && event.target ? event.target : null;
    const view = inferViewFromEditorSelection(selectedNode);
    if (!view) return;

    applyRouteState(
      {
        view,
        modals: getCurrentModalIds(),
        policyTab: getCurrentPolicyTab(),
      },
      { skipHistory: true }
    );
  }

  root.querySelectorAll("[data-open-view]").forEach((button) => {
    button.addEventListener("click", function () {
      const target = button.getAttribute("data-open-view");
      applyRouteState({ view: target || "home", modals: getCurrentModalIds() });
    });
  });

  if (homeButtonWrap) {
    homeButtonWrap.addEventListener("click", function () {
      applyRouteState({ view: "home", modals: getCurrentModalIds() });
    });
  }

  root.querySelectorAll("[data-open-modal]").forEach((button) => {
    button.addEventListener("click", function () {
      const target = button.getAttribute("data-open-modal");
      if (!target) return;
      const currentModals = getCurrentModalIds();
      const isOpen = currentModals.includes(target);
      const nextModals = isOpen
        ? normalizeModalIds(currentModals.filter((modalId) => modalId !== target))
        : normalizeModalIds([...currentModals, target]);
      applyRouteState({ view: getCurrentViewName(), modals: nextModals });
    });
  });

  root.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      const target = button.getAttribute("data-close-modal");
      if (!target) return;

      const nextModals = normalizeModalIds(
        getCurrentModalIds().filter((modalId) => modalId !== target)
      );
      applyRouteState({ view: getCurrentViewName(), modals: nextModals });
    });
  });

  root.querySelectorAll("#productDrawerClose").forEach((btn) => {
    btn.addEventListener("click", function () {
      closeProductDrawer();
      syncUrlToCurrentUiState();
    });
  });

  productCards.forEach((card) => {
    function openCard() {
      const handle = card.getAttribute("data-product-handle");
      if (!handle) return;
      const sizeChartUrl = card.getAttribute("data-size-chart-url") || "";
      applyRouteState({ view: "shop", modals: getCurrentModalIds(), product: handle, sizeChart: sizeChartUrl });
    }

    card.addEventListener("click", function () {
      openCard();
    });

    card.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openCard();
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

  policyTabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tab = button.getAttribute("data-policy-tab");
      applyRouteState({ view: "policy", modals: getCurrentModalIds(), policyTab: tab || "" });
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

  window.addEventListener("popstate", function () {
    applyRouteState(readRouteStateFromUrl(), { skipHistory: true });
  });

  if (window.Shopify && window.Shopify.designMode) {
    document.addEventListener("shopify:section:select", openEditorSelectedView);
    document.addEventListener("shopify:block:select", openEditorSelectedView);
  }

  applyRouteState(readRouteStateFromUrl(), { replaceHistory: true });
});
