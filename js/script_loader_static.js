// ===============================================
//  Static Loader for Cloudflare Pages (D1 Version)
// ===============================================

const DEBUG = true;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Detect table pages (Events, Markets, Restaurants, Cooking)
        const tableEl = document.querySelector("table[data-table]");
        const isTablePage = tableEl !== null;

        if (isTablePage) {
            const tableName = tableEl.dataset.table;

            if (DEBUG) console.log(`Detected table page: ${tableName}`);

            // Load D1 data for this table
            const tableData = await loadTableData(tableName);
			
			console.log("DEBUG Markets loader output:", tableData);

            window.allData = { [tableName]: tableData };

            if (DEBUG) console.log(`Loaded D1 data for ${tableName}:`, tableData);

            // Load main_script.js to build the table
            await loadScript("/js/main_script.js");
        }

        if (DEBUG) console.log("Loader finished.");
    } catch (err) {
        console.error("Loader failed:", err);
    }
});

// Load data for a specific table from D1
async function loadTableData(tableName) {
    let endpoint = null;

    switch (tableName) {
        case "Cooking":
            endpoint = "/api/cooking";
            break;
        case "Events":
            endpoint = "/api/events";
            break;
        case "Markets":
            endpoint = "/api/markets";
            break;
        case "Restaurants":
            endpoint = "/api/restaurants";
            break;
        default:
            throw new Error(`Unknown table: ${tableName}`);
    }

    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`Failed to load ${endpoint}`);

    const json = await response.json();

    // ============================================================
    //  NEW MARKETS SCHEMA HANDLING
    // ============================================================
    if (tableName === "Markets") {
        const raw = json.Markets;

        // Flatten hours array into weekday columns
        const items = raw.map(m => {
            const row = {
                Market: m.name,
                Website: m.website
            };

            m.hours.forEach(h => {
                row[h.day] = h.hours;
            });

            return row;
        });

        return items;   // main_script.js expects an array of rows
    }

    // ============================================================
    //  DEFAULT FOR ALL OTHER TABLES
    // ============================================================
    return json[tableName].items;
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
