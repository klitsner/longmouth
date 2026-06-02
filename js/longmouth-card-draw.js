/**
 * longmouth-card-draw.js
 * MTG card draw canvas interaction.
 * Fetches a random Magic: The Gathering card from Scryfall,
 * renders it on a canvas with a dissolve-in effect,
 * and allows dragging + double-click to remove.
 */

document.addEventListener("DOMContentLoaded", function () {
  console.log("Script loaded: Initializing...");

  const cardButton = document.querySelector(".card-button");
  const canvas = document.getElementById("cardCanvas");
  const ctx = canvas.getContext("2d");
  const isMobile = window.innerWidth <= 768;

  let cards = [];
  let draggingCard = null;
  let offsetX = 0,
    offsetY = 0;
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
      dissolvePixels: generateDissolvePixels(baseWidth, baseHeight),
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
    cards.forEach((card) => {
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
      .find(
        (card) =>
          x >= card.x &&
          x <= card.x + card.width &&
          y >= card.y &&
          y <= card.y + card.height
      );
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
      canvas.style.pointerEvents = "none";
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

  cardButton.addEventListener("click", (e) => {
    fetchRandomCard(e);
  });

  // Double-click/tap to remove a card
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
