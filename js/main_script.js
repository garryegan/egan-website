// ============================================================
//  main_script.js — D1-Compatible Table Engine
// ============================================================

// Run immediately when the script is loaded.
// The loader has already set window.allData and the DOM is ready.
(function initTablePage() {
    if (!window.allData) {
        console.error("❌ window.allData is not set");
        return;
    }

    const table = document.querySelector("table[data-table]");
    if (!table) return;

    const tableName = table.dataset.table;
    const rows = window.allData[tableName];

    if (!Array.isArray(rows) || rows.length === 0) {
        console.error("❌ No D1 data found for:", tableName);
        return;
    }

    // Build a synthetic "section" object to match the old structure
    const section = {
        columns: buildColumnsFromRows(rows),
        data: rows
    };

    // Add table‑type class so CSS rules apply
    table.classList.add(tableName.toLowerCase());

    buildTable(table, tableName, section);
})();

// ============================================================
//  Build Columns Dynamically (D1 version)
// ============================================================
function buildColumnsFromRows(rows) {
    const first = rows[0];

    return Object.keys(first).map(key => ({
        original: key,
        readable: toReadableLabel(key)
    }));
}

function toReadableLabel(key) {
    return key
        .replace(/_/g, " ")
        .replace(/([A-Z])/g, " $1")
        .replace(/\s+/g, " ")
        .replace(/^./, c => c.toUpperCase())
        .trim();
}

// ============================================================
//  Build Table
// ============================================================
function buildTable(table, tableName, section) {
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    // ------------------------------------------------------------
    // 1. Build visible column list (hide auto_id)
    // ------------------------------------------------------------
    const visibleColumns = section.columns.filter(col => col.original !== "auto_id");

    // ------------------------------------------------------------
    // 2. Build header row (sortable)
    // ------------------------------------------------------------
    const headerRow = document.createElement("tr");

    visibleColumns.forEach(col => {
        const th = document.createElement("th");

        // Rename "url" → "Website" for Cooking
        let label = col.readable;
        if (tableName === "Cooking" && col.original === "url") {
            label = "Website";
        }

        th.textContent = label;
        th.dataset.col = col.original;
        th.classList.add("sortable-header");
        th.style.cursor = "pointer";

        th.addEventListener("click", () => sortByColumn(col.original));

        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    // ------------------------------------------------------------
    // 3. Prepare data (copy so we can sort)
    // ------------------------------------------------------------
    let currentData = [...section.data];

    // ------------------------------------------------------------
    // 4. Initial sort rules
    // ------------------------------------------------------------
    if (tableName === "Cooking") {
        currentData.sort((a, b) => Number(a.rank) - Number(b.rank));
    }

    if (tableName === "Events") {
        currentData.sort((a, b) => new Date(b.EventDate) - new Date(a.EventDate));
    }

    // ------------------------------------------------------------
    // 5. Render table body
    // ------------------------------------------------------------
    function renderBody() {
        tbody.innerHTML = "";

        currentData.forEach(row => {
            const tr = document.createElement("tr");

            // --------------------------------------------------------
            // Row colouring — Events
            // --------------------------------------------------------
            if (tableName === "Events") {
                const eventDate = new Date(row.EventDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const status = (row.Status || "").toLowerCase();

                if (status.includes("cancelled")) {
                    tr.classList.add(eventDate < today ? "cancelled-past" : "cancelled-future");
                } else if (eventDate >= today) {
                    tr.classList.add("confirmed-future");
                } else {
                    tr.classList.add("default-style");
                }
            }

            // --------------------------------------------------------
            // Row colouring — Cooking
            // --------------------------------------------------------
            if (tableName === "Cooking") {
                const rank = Number(row.rank);
                if (!isNaN(rank)) {
                    tr.classList.add("rank-" + (rank > 20 ? "21-99" : rank));
                }
            }

            // --------------------------------------------------------
            // Build cells
            // --------------------------------------------------------
            visibleColumns.forEach(col => {
                const td = document.createElement("td");
                const key = col.original;
                const value = row[key] ?? "";

                td.dataset.col = col.original;

                // Cooking: hyperlink on NAME column using URL column
                if (tableName === "Cooking" && key === "name") {
                    const url = row["url"];
                    if (url) {
                        const a = document.createElement("a");
                        a.href = url;
                        a.target = "_blank";
                        a.rel = "noopener";
                        a.textContent = value;
                        td.appendChild(a);
                    } else {
                        td.textContent = value;
                    }
                }

                // Markets: hyperlink on Market column using Website column
                else if (tableName === "Markets" && key === "Market") {
                    const url = row["Website"];
                    if (url) {
                        const a = document.createElement("a");
                        a.href = url;
                        a.target = "_blank";
                        a.rel = "noopener";
                        a.textContent = value;
                        td.appendChild(a);
                    } else {
                        td.textContent = value;
                    }
                }

                // Default behaviour
                else {
                    td.textContent = value;
                }

                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });
    }

    renderBody();

    // ------------------------------------------------------------
    // 6. Sorting logic
    // ------------------------------------------------------------
    let sortState = { col: null, dir: 1 };

    function sortByColumn(colName) {
        if (sortState.col === colName) {
            sortState.dir *= -1;
        } else {
            sortState.col = colName;
            sortState.dir = 1;
        }

        currentData.sort((a, b) => {
            const va = a[colName];
            const vb = b[colName];

            // Numeric sort
            if (!isNaN(Number(va)) && !isNaN(Number(vb))) {
                return (Number(va) - Number(vb)) * sortState.dir;
            }

            // Date sort
            if (!isNaN(Date.parse(va)) && !isNaN(Date.parse(vb))) {
                return (new Date(va) - new Date(vb)) * sortState.dir;
            }

            // String sort
            return String(va).localeCompare(String(vb)) * sortState.dir;
        });

        renderBody();
    }
}
