/**
 * longmouth-product-filter.js
 * Tag-based product filtering using Smootify's GraphQL API.
 *
 * TODO (Shopify — Native Collections):
 *   Replace the Smootify GraphQL approach entirely with one of:
 *
 *   OPTION A — Server-side Liquid (recommended):
 *     Use collection.products filtered with predictive search or tags:
 *       {% for product in collection.products %}
 *         {% if product.tags contains selected_tag %}...{% endif %}
 *       {% endfor %}
 *     Or use Shopify's native collection filtering:
 *       /collections/all?filter.p.tag=your-tag
 *
 *   OPTION B — Storefront API (client-side):
 *     Replace window.Smootify.query() with a fetch() to:
 *       /api/2024-01/graphql.json
 *     with the public Storefront API token and a matching ProductConnection query.
 *
 *   Either way, smootify-product custom elements would be replaced with
 *   standard <div class="product-card">...</div> rendered via Liquid snippets.
 */

document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.querySelector("#tagFilter");

  // TODO (Shopify): Replace smootify-product with your Liquid product card selector,
  //   e.g. document.querySelectorAll(".product-card[data-tags]")
  const productEls = [...document.querySelectorAll("smootify-product")];

  async function filterByTag(tag) {
    window.isFiltering = true;
    console.log("set window filtering to true");

    // TODO (Shopify): Replace Smootify.query() with Storefront API fetch or
    //   use server-rendered data-tags attributes on each product card.
    const fetches = productEls.map(async (el) => {
      const gid = el.dataset.id;
      if (!gid) return { el, tags: [] };

      try {
        const res = await window.Smootify.query(`
          { product(id: "${gid}") { tags } }
        `);
        return {
          el,
          tags: (res?.product?.tags || []).map((t) => t.toLowerCase()),
        };
      } catch (err) {
        console.warn("Query failed for", gid, err);
        return { el, tags: [] };
      }
    });

    const results = await Promise.all(fetches);

    results.forEach(({ el, tags }) => {
      const match = tag === "all" || tags.includes(tag);
      // TODO (Shopify): Replace .w-dyn-item with your Liquid product wrapper class
      const wrapper = el.closest(".w-dyn-item");
      if (wrapper) wrapper.style.display = match ? "" : "none";
    });

    console.log(`✅ Filtered by tag: ${tag}`);
    setTimeout(() => (window.isFiltering = false), 50);
  }

  if (dropdown) {
    dropdown.addEventListener("change", (e) => filterByTag(e.target.value));
    filterByTag("all");
  }
});
