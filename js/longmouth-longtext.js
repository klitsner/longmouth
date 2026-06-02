/**
 * longmouth-longtext.js
 * Animates the #long-text title element, expanding/shrinking
 * the number of 'o's in "loooongmouth.world" based on hover state
 * and available container width.
 */

const longtextElement = document.querySelector("#long-text");
let baseText = "l";
let oCount = 1;
let maxOCount = 100;
let speedFast = 100;
let speedNormal = 350;
let intervalSpeed = speedNormal;
let interval;
let isHovering = false;

function updateText() {
  const container = longtextElement.parentElement;
  const availableWidth = container.clientWidth;
  const suffix = "ngmouth.world";

  const tester = document.createElement("span");
  tester.style.visibility = "hidden";
  tester.style.position = "absolute";
  tester.style.whiteSpace = "nowrap";
  tester.style.font = getComputedStyle(longtextElement).font;
  document.body.appendChild(tester);

  const testText = baseText + "o".repeat(oCount) + suffix;
  tester.textContent = testText;

  if (tester.offsetWidth < availableWidth - 40) {
    longtextElement.textContent = testText;
  } else {
    oCount--;
    longtextElement.textContent = baseText + "o".repeat(oCount) + suffix;
  }

  document.body.removeChild(tester);
}

function expandText() {
  if (!isHovering && oCount < maxOCount) {
    oCount++;
    updateText();
  }
}

function shrinkText() {
  if (isHovering && oCount > 1) {
    oCount--;
    updateText();
  }
}

function startInterval() {
  clearInterval(interval);
  interval = setInterval(() => {
    isHovering ? shrinkText() : expandText();
  }, intervalSpeed);
}

startInterval();

longtextElement.addEventListener("mouseenter", function () {
  isHovering = true;
  intervalSpeed = speedFast;
  startInterval();
});

longtextElement.addEventListener("mouseleave", function () {
  isHovering = false;
  intervalSpeed = speedNormal;
  startInterval();
});
