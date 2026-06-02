/**
 * longmouth-cookie-banner-link-fix.js
 * Rewrites the Shopify privacy link inside the cookie banner.
 * Replaces the previous wf.restart dependency with DOMContentLoaded.
 */

function fixCookieBannerLink() {
  const cookieLink = document.getElementById("shopify-pc__banner__body-policy-link");
  if (!cookieLink) {
    console.log("⚠️ Cookie banner link not found.");
    return;
  }

  cookieLink.href = "/?view=otherstuff";
  console.log("🔗 Cookie banner Privacy Policy link corrected.");
}

document.addEventListener("DOMContentLoaded", function () {
  fixCookieBannerLink();

  // Shopify may inject the banner late, so we retry briefly after load.
  setTimeout(fixCookieBannerLink, 50);
  setTimeout(fixCookieBannerLink, 250);
});
