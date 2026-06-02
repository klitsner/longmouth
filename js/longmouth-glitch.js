/**
 * longmouth-glitch.js
 * Glitch log animation — renders a terminal-style MTG error log
 * into #glitch-log with randomised character corruption every 100ms.
 */

(function glitchLog() {
  const TARGET_ID = "glitch-log";
  const container = document.getElementById(TARGET_ID);
  if (!container) {
    console.warn("⚠️ Glitch container not found:", TARGET_ID);
    return;
  }

  const GLYPHS =
    "アイウエオカキクケコ☯∆#@$%^&*()_+{}<>?/|~abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789∅∞⇌⬒⊗";

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
`
    .trim()
    .split("\n");

  function randomChar(c) {
    return Math.random() < 0.25
      ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      : c;
  }

  function glitchLine(line) {
    return [...line]
      .map((char) => (Math.random() < 0.08 ? randomChar(char) : char))
      .join("");
  }

  function updateDisplay() {
    const glitchedLines = originalLines.map(glitchLine).join("\n");
    container.textContent = glitchedLines;
  }

  container.style.fontFamily = "monospace";
  container.style.whiteSpace = "pre";
  container.style.padding = "1em";

  setInterval(updateDisplay, 100);
})();
