// ===============================================
//  Static Loader for Cloudflare Pages (Final)
// ===============================================

const DEBUG = true;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Load allData.json for all pages
        const data = await loadAllData();
        window.allData = data;

        if (DEBUG) console.log("Loaded allData.json:", data);

        // Detect table pages (Events, Markets, Restaurants, Cooking)
        const isTablePage = document.querySelector("table[data-table]") !== null;

        if (isTablePage) {
            if (DEBUG) console.log("Loading main_script.js for table page");
            await loadScript("/js/main_script.js");
        }

        if (DEBUG) console.log("Loader finished.");
    } catch (err) {
        console.error("Loader failed:", err);
    }
});

// Load allData.json
async function loadAllData() {
    const response = await fetch("/data/allData.json");
    if (!response.ok) throw new Error("Failed to load allData.json");
    return await response.json();
}

// Dynamically load JS file
function loadScript(path) {
    return new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = path;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}
