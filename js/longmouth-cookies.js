/**
 * longmouth-cookies.js
 * Custom cookie acceptance notice (#cookieNotice).
 * Uses localStorage to remember acceptance.
 *
 * TODO (Shopify): Shopify's built-in cookie consent banner (shopify-pc-banner)
 *   is already wired up separately. Evaluate whether this custom notice is still
 *   needed alongside it, or if Shopify's native consent covers requirements.
 */

document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("cookiesAccepted")) {
    const notice = document.getElementById("cookieNotice");
    if (notice) {
      notice.style.display = "block";
    }

    document
      .getElementById("closeCookieNotice")
      ?.addEventListener("click", function (e) {
        e.stopPropagation();
        acceptCookies();
      });
  }
});

function acceptCookies() {
  localStorage.setItem("cookiesAccepted", "true");
  const notice = document.getElementById("cookieNotice");
  if (notice) notice.style.display = "none";
}
