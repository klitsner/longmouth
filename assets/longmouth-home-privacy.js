/*
  Cookie/privacy banner and policy modal helpers extracted from the Webflow export.
  Generated during the Webflow-to-Shopify cleanup pass so behavior can be reviewed by role.
*/

// Source: body embed
document.addEventListener('wf.restart', () => {
    // Delay ensures Shopify has injected the banner first
    setTimeout(() => {
        const cookieLink = document.getElementById("shopify-pc__banner__body-policy-link");

        if (cookieLink) {
            cookieLink.href = "/?view=otherstuff";  // your desired link
            console.log("🔗 Cookie banner Privacy Policy link corrected on wf.restart.");
        } else {
            console.log("⚠️ Cookie banner link not found at wf.restart.");
        }
    }, 50);
});

// Source: body embed
document.addEventListener('DOMContentLoaded', function() {
    // Check if user has already accepted cookies
    if (!localStorage.getItem('cookiesAccepted')) {
        // If not accepted yet, show the banner
        document.getElementById('cookieNotice').style.display = 'block';
        
        // Add click event to close button
        document.getElementById('closeCookieNotice').addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent click from bubbling to document
            acceptCookies();
        });
    }
});

function acceptCookies() {
    // Save to localStorage
    localStorage.setItem('cookiesAccepted', 'true');
    // Hide the banner
    document.getElementById('cookieNotice').style.display = 'none';
}

