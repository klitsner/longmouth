/*
  Homepage-only visual effects extracted from the Webflow export.
  Generated during the Webflow-to-Shopify cleanup pass so behavior can be reviewed by role.
*/

// Source: body embed
fetch('https://api.scryfall.com/cards/named?exact=Sol Ring')
    .then(res => res.json())
    .then(data => {
     // console.log('📦 Full Card Data:', data);

      const usd = data.prices.usd;
      const usdFoil = data.prices.usd_foil;
      const usdEtched = data.prices.usd_etched;

      console.log(`💰 Sol Ring Prices:
        Normal: $${usd}
        Foil: $${usdFoil}
        Etched: $${usdEtched}
      `);

      // Optionally inject into the page
      document.getElementById('sol-ring-price').innerHTML = `
        <p><strong>Sol Ring</strong></p>
        <p>Normal: $${usd || 'N/A'}</p>
        <p>Foil: $${usdFoil || 'N/A'}</p>
        <p>Etched: $${usdEtched || 'N/A'}</p>
      `;
    })
    .catch(err => {
      console.error('Failed to fetch Sol Ring:', err);
    });

// Source: body embed
document.addEventListener("DOMContentLoaded", function () {

	//make sure to reset modules
  $(".shop__wrap").hide();

/// scroll setup
    const scrollContainer = document.querySelector(".horizontal-scroll-wrapper");

    if (!scrollContainer) {
        console.error("🚨 ERROR: .horizontal-scroll-wrapper not found!");
        return; // Stop execution if the element is missing
    }

    let scrollPosition = scrollContainer.scrollLeft; // Track target position
    let ease = 0.1; // Adjust for smoother scrolling
    let isScrolling = false;

    //console.log("✅ Scroll script initialized.");
   // console.log("📏 Initial scroll position:", scrollPosition);

    function smoothScroll() {
        if (!isScrolling) return;

        let prevScroll = scrollContainer.scrollLeft;
        scrollContainer.scrollLeft += (scrollPosition - scrollContainer.scrollLeft) * ease;

       // console.log("🌀 Scrolling... Target:", scrollPosition, "Current:", scrollContainer.scrollLeft);

        if (Math.abs(scrollPosition - scrollContainer.scrollLeft) > 0.5) {
            requestAnimationFrame(smoothScroll);
        } else {
            isScrolling = false; // Stop when close enough
           // console.log("✅ Scroll stopped at:", scrollContainer.scrollLeft);
        }
    }

window.addEventListener("wheel", function (event) {
    // Allow vertical scrolling inside dropdowns or other scrollable elements
    const isInsideScrollable = event.target.closest('.dropdown-scroll, .scroll-exempt');

    if (isInsideScrollable) {
        // Let normal vertical scrolling happen
        return;
    }

    // Custom horizontal scroll handling
    if (event.deltaY !== 0) {
        event.preventDefault();
        //console.log("🖱️ Mouse wheel event detected. deltaY:", event.deltaY);

        scrollPosition += event.deltaY;

        let maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        scrollPosition = Math.max(0, Math.min(scrollPosition, maxScroll));

        //console.log("📏 Updated scroll position:", scrollPosition, "Max allowed:", maxScroll);

        if (!isScrolling) {
            isScrolling = true;
            //console.log("▶️ Starting smooth scroll...");
            smoothScroll();
        }
    }
}, { passive: false });
});

// Source: body embed
document.addEventListener("DOMContentLoaded", function () {
    console.log("Script loaded: Initializing...");

    const cardButton = document.querySelector(".card-button");
    const canvas = document.getElementById("cardCanvas");
    const ctx = canvas.getContext("2d");
        const isMobile = window.innerWidth <= 768;

    let cards = [];
    let draggingCard = null;
    let offsetX = 0, offsetY = 0;
    let lastClickTime = 0;
    const doubleClickThreshold = 300;
    let touchMoved = false;

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const logicalWidth = window.innerWidth;
  const logicalHeight = window.innerHeight;

  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;

  canvas.style.width = logicalWidth + "px";
  canvas.style.height = logicalHeight + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawCards();
}

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    async function fetchRandomCard(event) {
        event.preventDefault();
        console.log("Button clicked: Fetching card...");
        cardButton.style.pointerEvents = "none";

        try {
            const response = await fetch("https://api.scryfall.com/cards/random");
            const card = await response.json();

            if (card.image_uris?.png) {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = card.image_uris.png;
                img.onload = () => {
                console.log(img.src);
                    addCard(img, card.name);
                };
            } else {
                console.warn("No valid image found for this card.");
            }
        } catch (error) {
            console.error("Error fetching card:", error);
        } finally {
            cardButton.style.pointerEvents = "auto";
        }
    }

function addCard(image, name) {

    const baseWidth = 200;
    const baseHeight = 279;
    const scale = isMobile ? 0.72 : 1;

    const cardObj = {
        img: image,
x: isMobile
  ? 15
  : Math.random() * (window.innerWidth - baseWidth * scale),
y: isMobile
  ? 60
  : Math.random() * (window.innerHeight - baseHeight * scale),
        width: baseWidth * scale,
        height: baseHeight * scale,
        name: name,
        dissolveProgress: 0,
        dissolvePixels: generateDissolvePixels(baseWidth, baseHeight)
    };

    cards.push(cardObj);
    animateDissolve(cardObj);
}

    function generateDissolvePixels(width, height) {
        const totalPixels = width * height;
        let pixelIndices = [...Array(totalPixels).keys()];
        return pixelIndices.sort(() => Math.random() - 0.5);
    }

    function animateDissolve(card) {
        let dissolveSpeed = 5000;
        function dissolveStep() {
            if (card.dissolveProgress < card.dissolvePixels.length) {
                card.dissolveProgress += dissolveSpeed;
                drawCards();
                requestAnimationFrame(dissolveStep);
            }
        }
        dissolveStep();
    }

    function drawCards() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cards.forEach(card => {
            if (card.dissolveProgress >= card.dissolvePixels.length) {
                ctx.drawImage(card.img, card.x, card.y, card.width, card.height);
            } else {
                const tempCanvas = document.createElement("canvas");
                tempCanvas.width = card.width;
                tempCanvas.height = card.height;
                const tempCtx = tempCanvas.getContext("2d");

                tempCtx.drawImage(card.img, 0, 0, card.width, card.height);
                const imageData = tempCtx.getImageData(0, 0, card.width, card.height);
                const data = imageData.data;

                for (let i = card.dissolveProgress; i < card.dissolvePixels.length; i++) {
                    let pixelIndex = card.dissolvePixels[i] * 4;
                    data[pixelIndex + 3] = 0;
                }

                tempCtx.putImageData(imageData, 0, 0);
                ctx.drawImage(tempCanvas, card.x, card.y);
            }
        });
    }

    function findCardAt(x, y) {
        return cards
            .slice()
            .reverse()
            .find(card => x >= card.x && x <= card.x + card.width && y >= card.y && y <= card.y + card.height);
    }

    function startDragging(event) {
        const { clientX, clientY } = event.touches ? event.touches[0] : event;
        const foundCard = findCardAt(clientX, clientY);

        if (foundCard) {
            canvas.style.pointerEvents = "auto";
            draggingCard = foundCard;
            offsetX = clientX - draggingCard.x;
            offsetY = clientY - draggingCard.y;
        } else {
            draggingCard = null;
        }
    }

    function drag(event) {
        if (!draggingCard) return;
        const { clientX, clientY } = event.touches ? event.touches[0] : event;
        draggingCard.x = clientX - offsetX;
        draggingCard.y = clientY - offsetY;
        drawCards();
    }

function stopDragging() {
    draggingCard = null;

    if (window.innerWidth <= 768) {
        canvas.style.pointerEvents = "none"; // only disable on mobile for scroll to work
    }
}

    // Desktop events
    canvas.addEventListener("mousedown", startDragging);
    canvas.addEventListener("mousemove", drag);
    canvas.addEventListener("mouseup", stopDragging);

if (window.innerWidth <= 768) {
    canvas.addEventListener("touchstart", function (event) {
        touchMoved = false;

        const { clientX, clientY } = event.touches[0];
        const foundCard = findCardAt(clientX, clientY);

        if (foundCard) {
            draggingCard = foundCard;
            offsetX = clientX - draggingCard.x;
            offsetY = clientY - draggingCard.y;
        }
    });

    canvas.addEventListener("touchmove", function (event) {
        if (!draggingCard) return;

        touchMoved = true;

        const { clientX, clientY } = event.touches[0];
        draggingCard.x = clientX - offsetX;
        draggingCard.y = clientY - offsetY;
        drawCards();
    });

    canvas.addEventListener("touchend", function () {
        draggingCard = null;
    });
}

    // Draw button behavior
    cardButton.addEventListener("click", (e) => {
        fetchRandomCard(e);
    });

    // Double-tap delete
    canvas.addEventListener("click", function (event) {
        const { clientX, clientY } = event;
        const clickedCard = findCardAt(clientX, clientY);
        const now = Date.now();

        if (clickedCard && now - lastClickTime < doubleClickThreshold) {
            const index = cards.indexOf(clickedCard);
            if (index !== -1) {
                cards.splice(index, 1);
                drawCards();
            }
        }

        lastClickTime = now;
    });
});

// Source: body embed
(function glitchLogWebflow() {
  const TARGET_ID = 'glitch-log'; // <-- Update if you use a class instead
  const container = document.getElementById(TARGET_ID);
  if (!container) {
    console.warn("⚠️ Glitch container not found:", TARGET_ID);
    return;
  }

  const GLYPHS = "アイウエオカキクケコ☯∆#@$%^&*()_+{}<>?/|~abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789∅∞⇌⬒⊗";

  const originalLines = `
corrupted stack trace:    at lich::reanimate(Hand[3])
    at dark_ritual.js:0x666
    at unsealSigil(slot[⅃])
    at lotus.bloom() → ERR_UNHANDLED_LEGENDARY
    at lib/p9/moxBind.js:0x9::BLACKLOTUS
    at summonLoop::cast(ancestralRecall[∞]) → stackOverflow
    at timetwister.js → loop detected [rewinding 3 turns]
    ...
Warning: Unhandled enchantment at stack level 6
Summon failed: dragon token overflow. Attempted: 8, Limit: 3
SIGILLUM_BROKEN: Runes not bound. Activating fail-safe...
CAST spell('Cool Shirt') → NULL_ITEM_REF at index 0xDEAD
Error 422: Invalid planeswalker loyalty state (expected: ∞, received: -3)
Archive access denied: Phyrexian root signature mismatch
cacheSoulboundApparel() — cold storage timeout
fetchManaStream() → ERR_NULL_MOX
Warning: Detected time walk loop. Skipping 3 turns...
Notice: Unsleeved transmission detected. Apply top-loader protection
thread "main-dweeb" panicked at 'unidentified foil layer', lib/style.rs:999
Debug: attempted to resolve prophecy() — returned null future
log: echo($manaPool) => { black: 999, blue: NaN, green: undefined }
Fatal: PowerNine.core() not found — legacy artifacts missing
assert(Mox[5]) failed: multiple zero-cast sources in play
REFERENCE ERROR: 'blackLotus' is not defined
trace: ritual.cast(blood) → void
reflection@target[0] = { …self, …shame, …foilDamage }
dev_note: reality torn at mana seam
`.trim().split("\n");

  function randomChar(c) {
    return Math.random() < 0.25 ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : c;
  }

  function glitchLine(line) {
    return [...line].map(char => (Math.random() < 0.08 ? randomChar(char) : char)).join('');
  }

  function updateDisplay() {
    const glitchedLines = originalLines.map(glitchLine).join("\n");
    container.textContent = glitchedLines;
  }

  // Initial style for green terminal look (optional)
  container.style.fontFamily = "monospace";
  container.style.whiteSpace = "pre";
  container.style.padding = "1em";

  // Start glitch loop
  setInterval(updateDisplay, 100);
})();

// Source: body embed
document.addEventListener('DOMContentLoaded', function () {

  console.log('🔧 DOM fully loaded');

  const items = document.querySelectorAll('.s__product-item');
  const panel = document.getElementById('product__panel');
  const detailItems = document.querySelectorAll('.product__detail-item');
  const closeBtn = document.querySelector('.close-btn__wrapper');
  const productDetails = document.querySelectorAll('.product-details');

  let panelOpenedAt = 0;

  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  console.log('Product items found:', items.length);
  console.log('Panel found:', !!panel);
  console.log('Detail items found:', detailItems.length);
  console.log('Close button found:', !!closeBtn);
  console.log('productDetails found:', productDetails.length);
  console.log('Hover supported:', supportsHover);


  /* ------------------------------------
     PRODUCT CLICK → OPEN PANEL
  ------------------------------------ */

  items.forEach(item => {

    item.addEventListener('click', () => {

      const id = item.getAttribute('data-id');
      console.log('Product clicked with data-id:', id);

      if (!id) {
        console.warn('No data-id on clicked item');
        return;
      }

      let matchFound = false;

      detailItems.forEach(detail => {

        const detailId = detail.getAttribute('data-id');

        if (detailId === id) {

          detail.style.display = 'block';
          matchFound = true;

          console.log('Showing detail with data-id:', detailId);

        } else {

          detail.style.display = 'none';

        }

      });

      if (!matchFound) {
        console.warn('No matching detail found for data-id:', id);
      }

      panel.classList.add('active');

      /* timestamp for mobile touch guard */
      panelOpenedAt = Date.now();

      console.log('Panel opened at', panelOpenedAt);

    });

  });


  /* ------------------------------------
     CLOSE PANEL
  ------------------------------------ */

  if (closeBtn) {

    closeBtn.addEventListener('click', () => {

      panel.classList.remove('active');
      console.log('Panel closed');

    });

  }


  /* ------------------------------------
     MARQUEE INTERACTION
  ------------------------------------ */

  productDetails.forEach((container, i) => {

    const description = container.querySelector('.product-details__description');
    if (!description) return;


    /* ---------- DESKTOP HOVER ---------- */

    if (supportsHover) {

      container.addEventListener('mouseenter', () => {

        console.log('mouseenter', i);
        description.classList.add('marquee-paused');

      });

      container.addEventListener('mouseleave', () => {

        console.log('mouseleave', i);
        description.classList.remove('marquee-paused');

      });

    }


    /* ---------- MOBILE TOUCH ---------- */

    container.addEventListener(
      'touchstart',
      (e) => {

        const msSinceOpen = Date.now() - panelOpenedAt;
        console.log('touchstart fired — ms since panel open:', msSinceOpen);

        /* ignore ghost touch from original tap */
        if (msSinceOpen < 500) {

          console.log('Ignoring touch (panel just opened)');
          return;

        }

        /* ignore taps on links/buttons */
        if (e.target.closest('a, button, .product__size-chart-link')) {

          console.log('Tap on exempt element');
          return;

        }

        description.classList.add('marquee-paused');
        console.log('Marquee paused');

      },
      { passive: true }
    );


    container.addEventListener(
      'touchend',
      () => {

        description.classList.remove('marquee-paused');
        console.log('Marquee resumed');

      },
      { passive: true }
    );


    container.addEventListener(
      'touchcancel',
      () => {

        description.classList.remove('marquee-paused');

      },
      { passive: true }
    );

  });

});
