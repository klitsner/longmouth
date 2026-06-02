/**
 * longmouth-sol-ring-price.js
 * Fetches the current Sol Ring prices from Scryfall and injects them into
 * #sol-ring-price.
 */

document.addEventListener("DOMContentLoaded", function () {
  fetch("https://api.scryfall.com/cards/named?exact=Sol Ring")
    .then((res) => res.json())
    .then((data) => {
      const usd = data.prices.usd;
      const usdFoil = data.prices.usd_foil;
      const usdEtched = data.prices.usd_etched;

      console.log(`💰 Sol Ring Prices:
      Normal: $${usd}
      Foil: $${usdFoil}
      Etched: $${usdEtched}
    `);

      const el = document.getElementById("sol-ring-price");
      if (!el) return;

      el.innerHTML = `
        <p><strong>Sol Ring</strong></p>
        <p>Normal: $${usd || "N/A"}</p>
        <p>Foil: $${usdFoil || "N/A"}</p>
        <p>Etched: $${usdEtched || "N/A"}</p>
      `;
    })
    .catch((err) => {
      console.error("Failed to fetch Sol Ring:", err);
    });
});
