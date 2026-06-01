/*
  Core DOM helpers and Webflow environment flags extracted from the Webflow homepage export.
  Generated during the Webflow-to-Shopify cleanup pass so behavior can be reviewed by role.
*/

// Source: head
!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);

// Source: body embed
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
      const homeButton = document.getElementById("home__button");
      if (homeButton) {
        homeButton.click();
      } else {
        console.warn("Element with ID 'home-button' not found.");
      }
    }
  });

// Source: body embed
/// script for longmouth.world looooong interraction and animation
    const longtextElement = document.querySelector("#long-text");
    let baseText = "l"; // Start with 'l'
    let oCount = 1; // Initial count of 'o's
    let maxOCount = 100; // Maximum number of 'o's
    let speedFast = 100;
    let speedNormal = 350;
    let intervalSpeed = speedNormal; 
    let interval; 
    let isHovering = false; // Track hover state

    function updateText() {
    const container = longtextElement.parentElement;
    const availableWidth = container.clientWidth;
    const suffix = "ngmouth.world";

    // Create a test span to measure text width
    const tester = document.createElement("span");
    tester.style.visibility = "hidden";
    tester.style.position = "absolute";
    tester.style.whiteSpace = "nowrap";
    tester.style.font = getComputedStyle(longtextElement).font;
    document.body.appendChild(tester);

    const testText = baseText + "o".repeat(oCount) + suffix;
    tester.textContent = testText;

    // If too wide, block further growth
    if (tester.offsetWidth < availableWidth - 40) {
        longtextElement.textContent = testText;
    } else {
        oCount--; // step back to last valid
        longtextElement.textContent = baseText + "o".repeat(oCount) + suffix;
    }

    document.body.removeChild(tester);
}

    function expandText() {
        if (!isHovering && oCount < maxOCount) {
            oCount++; // Increase "o"s when not hovering

            updateText();
        }
    }

    function shrinkText() {
        if (isHovering && oCount > 1) {
            
            oCount--; // Decrease "o"s when hovering
            updateText();
        }
    }

    function startInterval() {
        clearInterval(interval); // Clear any existing interval
        interval = setInterval(() => {
            isHovering ? shrinkText() : expandText();
        }, intervalSpeed);
    }

    // Start the interval initially
    startInterval();

    // When hovering, start shrinking "o"s
    longtextElement.addEventListener("mouseenter", function () {
        isHovering = true;
        intervalSpeed = speedFast;
        startInterval(); // Restart interval to shrink "o"s
    });

    // When leaving, start expanding "o"s again
    longtextElement.addEventListener("mouseleave", function () {
        isHovering = false;
        intervalSpeed = speedNormal;
        startInterval(); // Restart interval to expand "o"s
    });


