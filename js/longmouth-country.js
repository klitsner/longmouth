/**
 * longmouth-country.js
 * Detects the visitor's country via IP geolocation and syncs it
 * with Smootify's currency/market switcher.
 *
 * TODO (Shopify — Markets):
 *   Replace this entire script with Shopify Markets + Geolocation app/API.
 *   Shopify natively handles currency and market detection via:
 *     - Shopify.country (set server-side in Liquid)
 *     - the Markets feature with automatic redirects
 *     - the Geolocation app for a manual switcher
 *   The window.Smootify.changeCountry() call would be replaced with:
 *     fetch('/localization', { method: 'POST', body: new URLSearchParams({ country_code: countryCode }) })
 *   or simply rely on Shopify's built-in browser locale detection.
 */

const VERIFICATION_TIMEOUT = 5000;
const FALLBACK_COUNTRY = { code: "US", name: "United States" };

const waitForSmootify = () => {
  return new Promise((resolve, reject) => {
    if (window.Smootify && typeof window.Smootify.changeCountry === "function") {
      console.log("✅ Smootify already ready");
      resolve(window.Smootify);
    } else {
      const onSmootifyLoaded = () => {
        console.log("✅ Smootify loaded event received");
        document.removeEventListener("smootify:loaded", onSmootifyLoaded);
        resolve(window.Smootify);
      };

      document.addEventListener("smootify:loaded", onSmootifyLoaded);

      setTimeout(() => {
        document.removeEventListener("smootify:loaded", onSmootifyLoaded);
        if (window.Smootify) {
          console.log("✅ Smootify found via timeout fallback");
          resolve(window.Smootify);
        } else {
          reject(new Error("Smootify not loaded within timeout"));
        }
      }, 10000);
    }
  });
};

const fetchWithTimeout = async (url, timeout = VERIFICATION_TIMEOUT) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

const getCountryFromIP = async () => {
  try {
    console.log("🌍 Verifying country from IP...");
    const res = await fetchWithTimeout("https://ipapi.co/json/");
    const geo = await res.json();

    if (!geo.country_code || geo.error) {
      throw new Error(`Invalid geo response: ${geo.reason || "Unknown error"}`);
    }

    return {
      code: geo.country_code.toUpperCase(),
      name: geo.country_name || geo.country_code,
    };
  } catch (error) {
    console.warn("⚠️ Primary IP geolocation failed:", error.message);

    try {
      const res = await fetchWithTimeout("https://api.country.is/");
      const fallbackGeo = await res.json();
      return {
        code: fallbackGeo.country.toUpperCase(),
        name: fallbackGeo.country,
      };
    } catch (fallbackError) {
      console.warn("⚠️ Fallback IP geolocation failed:", fallbackError.message);
      throw new Error("All IP geolocation services failed");
    }
  }
};

const getCountryFromBrowser = () => {
  try {
    const locale = navigator.language || navigator.languages?.[0];
    if (locale && locale.includes("-")) {
      const countryCode = locale.split("-")[1].toUpperCase();
      console.log(`🌐 Browser locale detected: ${locale} → ${countryCode}`);
      return { code: countryCode, name: countryCode };
    }
  } catch (error) {
    console.warn("⚠️ Browser locale detection failed:", error);
  }
  return FALLBACK_COUNTRY;
};

const getCurrentCountry = () => {
  const localStorageCountry = localStorage.getItem("country");
  const smootifyCountry = window.Smootify?.getCountry?.();

  return {
    localStorage: localStorageCountry,
    smootify: smootifyCountry,
    current: localStorageCountry || smootifyCountry || FALLBACK_COUNTRY.code,
  };
};

const updateCountryViaSmootify = async (countryCode, countryName) => {
  try {
    console.log(`🔄 Updating country via Smootify: ${countryCode}`);

    if (typeof window.Smootify.changeCountry === "function") {
      await window.Smootify.changeCountry(countryCode);
      console.log(`✅ Country updated via Smootify to: ${countryCode}`);
    } else {
      console.warn("⚠️ Smootify.changeCountry function not available");
      localStorage.setItem("country", countryCode);
      localStorage.setItem("countryName", countryName);
      console.log(`✅ Country updated via localStorage to: ${countryCode}`);
    }

    return true;
  } catch (error) {
    console.error("❌ Failed to update country via Smootify:", error);
    return false;
  }
};

const verifyAndCorrectCountry = async () => {
  try {
    console.log("🔍 Starting country verification...");

    await waitForSmootify();

    const currentCountry = getCurrentCountry();
    console.log("📍 Current country settings:", currentCountry);

    let detectedCountry;

    try {
      detectedCountry = await getCountryFromIP();
      console.log(`✅ IP-based country detected: ${detectedCountry.code}`);
    } catch (ipError) {
      console.warn("⚠️ IP detection failed, using browser locale");
      detectedCountry = getCountryFromBrowser();
      console.log(`✅ Browser-based country detected: ${detectedCountry.code}`);
    }

    if (detectedCountry.code !== currentCountry.current) {
      console.log(
        `🔄 Country mismatch detected: ${currentCountry.current} → ${detectedCountry.code}`
      );

      const success = await updateCountryViaSmootify(detectedCountry.code, detectedCountry.name);

      if (success) {
        console.log("✅ Country verification completed successfully");
        return {
          success: true,
          changed: true,
          from: currentCountry.current,
          to: detectedCountry.code,
        };
      } else {
        throw new Error("Failed to update country via Smootify");
      }
    } else {
      console.log("✅ Country verification: No change needed");
      return { success: true, changed: false, country: currentCountry.current };
    }
  } catch (error) {
    console.error("❌ Country verification failed:", error);
    return { success: false, error: error.message };
  }
};

(async () => {
  try {
    const result = await verifyAndCorrectCountry();

    if (result.success && result.changed) {
      console.log(`🎉 Country successfully updated from ${result.from} to ${result.to}`);
      window.dispatchEvent(new CustomEvent("countryVerified", { detail: result }));
    } else if (result.success) {
      console.log("✅ Country verification completed - no changes needed");
    } else {
      console.error("❌ Country verification failed:", result.error);
    }
  } catch (error) {
    console.error("❌ Verification script error:", error);
  }
})();

window.verifyCountry = verifyAndCorrectCountry;
