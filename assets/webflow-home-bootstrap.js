(() => {
  const ROOT_ID = 'longmouth-webflow-home-root';

  function getRoot() {
    return document.getElementById(ROOT_ID);
  }

  function updateCartShell(root) {
    fetch('/cart.js', { credentials: 'same-origin' })
      .then((response) => (response.ok ? response.json() : null))
      .then((cart) => {
        if (!cart) return;
        root.querySelectorAll('[cart="count"]').forEach((node) => {
          node.textContent = String(cart.item_count || 0);
        });
        root.querySelectorAll('[cart="total"]').forEach((node) => {
          const cents = cart.total_price || 0;
          node.textContent = new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency: cart.currency || 'USD',
          }).format(cents / 100);
        });
      })
      .catch(() => {
        // Cart shell is cosmetic until the native Shopify cart pass is implemented.
      });
  }

  function cloneScript(original) {
    const next = document.createElement('script');
    for (const attribute of original.attributes) {
      next.setAttribute(attribute.name, attribute.value);
    }
    next.textContent = original.textContent;
    // Dynamic scripts default to async=true; keep Webflow chunk order deterministic.
    next.async = false;
    return next;
  }

  async function executeScripts(root) {
    const scripts = Array.from(root.querySelectorAll('script'));
    for (const original of scripts) {
      await new Promise((resolve) => {
        const next = cloneScript(original);
        if (next.src) {
          next.addEventListener('load', resolve, { once: true });
          next.addEventListener('error', resolve, { once: true });
          original.replaceWith(next);
        } else {
          original.replaceWith(next);
          resolve();
        }
      });
    }
  }

  async function mountWebflowHome() {
    const root = getRoot();
    const parts = window.LongmouthWebflowMarkupParts || [];
    if (!root || !parts.length) return;

    root.innerHTML = parts.join('');
    updateCartShell(root);
    await executeScripts(root);
    document.dispatchEvent(new CustomEvent('longmouth:webflow-home-ready'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountWebflowHome, { once: true });
  } else {
    mountWebflowHome();
  }
})();
