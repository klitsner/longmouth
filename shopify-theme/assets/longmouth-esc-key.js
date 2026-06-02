/**
 * longmouth-esc-key.js
 * Escape key shortcut that returns to the home view.
 */

document.addEventListener("keydown", function (event) {
  if (event.key !== "Escape") return;

  const homeButton = document.getElementById("home__button");
  if (homeButton) {
    homeButton.click();
    return;
  }

  console.warn("Element with ID 'home__button' not found.");
});
