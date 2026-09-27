// =========================================================
// GLOBAL DATA
// =========================================================

let reportData = [];


// =========================================================
// FORMAT RUPIAH
// =========================================================

function formatRupiah(value) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(Number(value) || 0);

}


// =========================================================
// FORMAT PERSENTASE
// =========================================================

function formatPercentage(value) {

    return (
        Number(value) || 0
    ).toLocaleString(
        "id-ID",
        {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }
    ) + "%";

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


// =========================================================
// STATUS LAPORAN
// =========================================================

function getReportStatus(
    budget,
    realization
) {

    budget =
        Number(budget) || 0;

    realization =
        Number(realization) || 0;


    if (realization > budget) {

        return {
            className: "status-over",
            text: "Melebihi Anggaran"
        };

    }


    if (
        budget > 0 &&
        (realization / budget) >= 0.8
    ) {

        return {
            className: "status-warning",
            text: "Mendekati Batas"
        };

    }


    return {
        className: "status-aman",
        text: "Aman"
    };

}


// =========================================================
// LOAD EVENT FILTER
// =========================================================

async function loadEventFilter() {

    const select =
        document.getElementById(
            "report-event"
        );


    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("events")

            .select(`
                id,
                nama_event
            `)

            .order(
                "nama_event",
                {
                    ascending: true
                }
            );


        if (error) {
            throw error;
        }


        select.innerHTML = `
            <option value="all">
                Semua Event
            </option>
        `;


        data.forEach(function (event) {

            const option =
                document.createElement("option");


            option.value =
                event.id;


            option.textContent =
                event.nama_event;


            select.appendChild(option);

        });


    } catch (error) {

        console.error(
            "Load event filter error:",
            error
        );

    }

}


// =========================================================
// LOAD REPORT
// =========================================================

async function loadReport() {

    const message =
        document.getElementById(
            "report-message"
        );


    const selectedEvent =
        document.getElementById(
            "report-event"
        ).value;


    try {

        let query =
            supabaseClient
                .from("v_realisasi_anggaran")
                .select("*");


        if (selectedEvent !== "all") {

            query =
                query.eq(
                    "event_id",
                    selectedEvent
                );

        }


        const {
            data,
            error
        } = await query;


        if (error) {
            throw error;
        }


        reportData =
            data || [];


        updateReportSummary(
            reportData
        );


        displayEventSummary(
            reportData
        );


        displayReportDetail(
            reportData
        );


        message.textContent =
            "Laporan berhasil diperbarui.";

        message.style.backgroundColor =
            "#e8f5e9";

        message.style.color =
            "#2e7d32";


    } catch (error) {

        console.error(
            "Load report error:",
            error
        );


        message.textContent =
            "Gagal mengambil data laporan: " +
            error.message;

        message.style.backgroundColor =
            "#ffebee";

        message.style.color =
            "#c62828";


        document.getElementById(
            "event-summary-table"
        ).innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="empty-state"
                >
                    Gagal memuat laporan.
                </td>
            </tr>
        `;


        document.getElementById(
            "report-detail-table"
        ).innerHTML = `
            <tr>
                <td
                    colspan="9"
                    class="empty-state"
                >
                    Gagal memuat laporan.
                </td>
            </tr>
        `;

    }

}


// =========================================================
// UPDATE SUMMARY
// =========================================================

function updateReportSummary(data) {

    let totalBudget =
        0;

    let totalRealization =
        0;


    data.forEach(function (item) {

        totalBudget +=
            Number(
                item.total_anggaran
            ) || 0;


        totalRealization +=
            Number(
                item.total_realisasi
            ) || 0;

    });


    const difference =
        totalBudget -
        totalRealization;


    const percentage =
        totalBudget > 0
            ? (
                totalRealization /
                totalBudget
            ) * 100
            : 0;


    document.getElementById(
        "report-total-budget"
    ).textContent =
        formatRupiah(
            totalBudget
        );


    document.getElementById(
        "report-total-realization"
    ).textContent =
        formatRupiah(
            totalRealization
        );


    document.getElementById(
        "report-total-difference"
    ).textContent =
        formatRupiah(
            difference
        );


    document.getElementById(
        "report-percentage"
    ).textContent =
        formatPercentage(
            percentage
        );

}


// =========================================================
// RINGKASAN PER EVENT
// =========================================================

function displayEventSummary(data) {

    const table =
        document.getElementById(
            "event-summary-table"
        );


    table.innerHTML = "";


    if (
        !data ||
        data.length === 0
    ) {

        table.innerHTML = `
            <tr>

                <td
                    colspan="7"
                    class="empty-state"
                >
                    Belum ada data laporan.
                </td>

            </tr>
        `;

        return;

    }


    const eventMap =
        new Map();


    data.forEach(function (item) {

        const eventId =
            item.event_id;


        if (!eventMap.has(eventId)) {

            eventMap.set(
                eventId,
                {
                    eventName:
                        item.nama_event,

                    budget:
                        0,

                    realization:
                        0
                }
            );

        }


        const current =
            eventMap.get(eventId);


        current.budget +=
            Number(
                item.total_anggaran
            ) || 0;


        current.realization +=
            Number(
                item.total_realisasi
            ) || 0;

    });


    let index = 1;


    eventMap.forEach(function (event) {

        const difference =
            event.budget -
            event.realization;


        const percentage =
            event.budget > 0
                ? (
                    event.realization /
                    event.budget
                ) * 100
                : 0;


        const status =
            getReportStatus(
                event.budget,
                event.realization
            );


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${index}
            </td>

            <td>
                <strong>
                    ${escapeHtml(
                        event.eventName
                    )}
                </strong>
            </td>

            <td>
                ${formatRupiah(
                    event.budget
                )}
            </td>

            <td>
                ${formatRupiah(
                    event.realization
                )}
            </td>

            <td>
                ${formatRupiah(
                    difference
                )}
            </td>

            <td>
                ${formatPercentage(
                    percentage
                )}
            </td>

            <td>

                <span
                    class="status-badge ${status.className}"
                >
                    ${status.text}
                </span>

            </td>

        `;


        table.appendChild(row);


        index++;

    });

}


// =========================================================
// DETAIL REPORT
// =========================================================

function displayReportDetail(data) {

    const table =
        document.getElementById(
            "report-detail-table"
        );


    table.innerHTML = "";


    if (
        !data ||
        data.length === 0
    ) {

        table.innerHTML = `
            <tr>

                <td
                    colspan="9"
                    class="empty-state"
                >
                    Belum ada data laporan.
                </td>

            </tr>
        `;

        return;

    }


    data.forEach(function (item, index) {

        const budget =
            Number(
                item.total_anggaran
            ) || 0;


        const realization =
            Number(
                item.total_realisasi
            ) || 0;


        const difference =
            budget -
            realization;


        const percentage =
            budget > 0
                ? (
                    realization /
                    budget
                ) * 100
                : 0;


        const status =
            getReportStatus(
                budget,
                realization
            );


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>
                ${escapeHtml(
                    item.nama_event
                )}
            </td>

            <td>
                ${escapeHtml(
                    item.nama_kategori
                )}
            </td>

            <td>
                <strong>
                    ${escapeHtml(
                        item.nama_item
                    )}
                </strong>
            </td>

            <td>
                ${formatRupiah(
                    budget
                )}
            </td>

            <td>
                ${formatRupiah(
                    realization
                )}
            </td>

            <td>
                ${formatRupiah(
                    difference
                )}
            </td>

            <td>
                ${formatPercentage(
                    percentage
                )}
            </td>

            <td>

                <span
                    class="status-badge ${status.className}"
                >
                    ${status.text}
                </span>

            </td>

        `;


        table.appendChild(row);

    });

}


// =========================================================
// EXPORT CSV
// =========================================================

function exportCSV() {

    if (
        !reportData ||
        reportData.length === 0
    ) {

        alert(
            "Tidak ada data laporan untuk diexport."
        );

        return;

    }


    const rows = [

        [
            "Event",
            "Kategori",
            "Item",
            "Anggaran",
            "Realisasi",
            "Selisih",
            "Persentase",
            "Status"
        ]

    ];


    reportData.forEach(function (item) {

        const budget =
            Number(
                item.total_anggaran
            ) || 0;


        const realization =
            Number(
                item.total_realisasi
            ) || 0;


        const difference =
            budget -
            realization;


        const percentage =
            budget > 0
                ? (
                    realization /
                    budget
                ) * 100
                : 0;


        const status =
            getReportStatus(
                budget,
                realization
            );


        rows.push([

            item.nama_event || "",

            item.nama_kategori || "",

            item.nama_item || "",

            budget,

            realization,

            difference,

            percentage.toFixed(1) + "%",

            status.text

        ]);

    });


    const csvContent =
        rows
            .map(function (row) {

                return row
                    .map(function (value) {

                        const text =
                            String(
                                value ?? ""
                            );


                        return `"${text.replace(
                            /"/g,
                            '""'
                        )}"`;

                    })
                    .join(",");

            })
            .join("\n");


    const blob =
        new Blob(
            [
                "\ufeff" +
                csvContent
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "laporan-realisasi-anggaran.csv";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


// =========================================================
// BUTTON EVENTS
// =========================================================

document
    .getElementById(
        "report-event"
    )
    .addEventListener(
        "change",
        loadReport
    );


document
    .getElementById(
        "btn-refresh"
    )
    .addEventListener(
        "click",
        loadReport
    );


document
    .getElementById(
        "btn-print"
    )
    .addEventListener(
        "click",
        function () {

            window.print();

        }
    );


document
    .getElementById(
        "btn-export"
    )
    .addEventListener(
        "click",
        exportCSV
    );


// =========================================================
// INITIALIZATION
// =========================================================

async function initializeReportPage() {

    await loadEventFilter();

    await loadReport();

}


initializeReportPage();