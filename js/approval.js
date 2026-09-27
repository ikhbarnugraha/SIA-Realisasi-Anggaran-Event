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
// FORMAT TANGGAL
// =========================================================

function formatTanggal(tanggal) {

    if (!tanggal) {
        return "-";
    }

    const date =
        new Date(tanggal + "T00:00:00");

    return new Intl.DateTimeFormat(
        "id-ID",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    ).format(date);

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
// STATUS CLASS
// =========================================================

function getApprovalClass(status) {

    if (status === "approved") {
        return "status-aman";
    }

    if (status === "rejected") {
        return "status-over";
    }

    return "status-warning";

}


// =========================================================
// STATUS TEXT
// =========================================================

function getApprovalText(status) {

    const statusMap = {

        pending: "Pending",

        approved: "Approved",

        rejected: "Rejected"

    };

    return statusMap[status] || "Pending";

}


// =========================================================
// LOAD APPROVAL DATA
// =========================================================

async function loadApprovals() {

    const table =
        document.getElementById(
            "approval-table"
        );


    const message =
        document.getElementById(
            "approval-message"
        );


    table.innerHTML = `
        <tr>

            <td
                colspan="9"
                class="empty-state"
            >
                Memuat data...
            </td>

        </tr>
    `;


    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("approvals")

            .select(`
                id,
                transaction_id,
                status,
                catatan,
                approved_at,
                created_at,

                transactions (
                    id,
                    tanggal_transaksi,
                    nomor_bukti,
                    keterangan,
                    jumlah_realisasi,

                    budget_details (
                        nama_item,

                        budgets (
                            nama_anggaran,

                            events (
                                nama_event
                            )
                        )
                    )
                )
            `)

            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {
            throw error;
        }


        displayApprovals(data);

        updateApprovalSummary(data);


        message.textContent =
            "Data approval berhasil dimuat.";

        message.style.backgroundColor =
            "#e8f5e9";

        message.style.color =
            "#2e7d32";


    } catch (error) {

        console.error(
            "Load approvals error:",
            error
        );


        table.innerHTML = `
            <tr>

                <td
                    colspan="9"
                    class="empty-state"
                >
                    Gagal mengambil data approval.
                </td>

            </tr>
        `;


        message.textContent =
            "Gagal mengambil data approval.";

        message.style.backgroundColor =
            "#ffebee";

        message.style.color =
            "#c62828";

    }

}


// =========================================================
// DISPLAY APPROVAL
// =========================================================

function displayApprovals(data) {

    const table =
        document.getElementById(
            "approval-table"
        );


    table.innerHTML = "";


    if (!data || data.length === 0) {

        table.innerHTML = `
            <tr>

                <td
                    colspan="9"
                    class="empty-state"
                >
                    Belum ada transaksi untuk diproses.
                </td>

            </tr>
        `;

        return;
    }


    data.forEach(function (approval, index) {

        const transaction =
            approval.transactions;


        const eventName =
            transaction
                ?.budget_details
                ?.budgets
                ?.events
                ?.nama_event ||
            "-";


        const itemName =
            transaction
                ?.budget_details
                ?.nama_item ||
            "-";


        const row =
            document.createElement("tr");


        let actionButtons = "";


        if (approval.status === "pending") {

            actionButtons = `

                <button
                    class="btn-approve"
                    onclick="approveTransaction('${approval.id}')"
                >
                    Approve
                </button>


                <button
                    class="btn-reject"
                    onclick="rejectTransaction('${approval.id}')"
                >
                    Reject
                </button>

            `;

        } else {

            actionButtons = `
                <span class="action-done">
                    Sudah diproses
                </span>
            `;

        }


        row.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>
                ${escapeHtml(eventName)}
            </td>

            <td>
                ${escapeHtml(itemName)}
            </td>

            <td>
                ${formatTanggal(
                    transaction?.tanggal_transaksi
                )}
            </td>

            <td>
                ${escapeHtml(
                    transaction?.nomor_bukti || "-"
                )}
            </td>

            <td>
                ${escapeHtml(
                    transaction?.keterangan || "-"
                )}
            </td>

            <td>
                <strong>
                    ${formatRupiah(
                        transaction?.jumlah_realisasi
                    )}
                </strong>
            </td>

            <td>

                <span
                    class="status-badge ${getApprovalClass(approval.status)}"
                >
                    ${getApprovalText(approval.status)}
                </span>

            </td>

            <td>

                ${actionButtons}

            </td>

        `;


        table.appendChild(row);

    });

}


// =========================================================
// SUMMARY
// =========================================================

function updateApprovalSummary(data) {

    let pending = 0;

    let approved = 0;

    let rejected = 0;


    data.forEach(function (item) {

        if (item.status === "pending") {

            pending++;

        } else if (item.status === "approved") {

            approved++;

        } else if (item.status === "rejected") {

            rejected++;

        }

    });


    document.getElementById(
        "total-pending"
    ).textContent =
        pending;


    document.getElementById(
        "total-approved"
    ).textContent =
        approved;


    document.getElementById(
        "total-rejected"
    ).textContent =
        rejected;

}


// =========================================================
// APPROVE
// =========================================================

async function approveTransaction(approvalId) {

    const confirmed =
        confirm(
            "Apakah transaksi ini ingin di-approve?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } = await supabaseClient

            .from("approvals")

            .update({
                status: "approved",

                approved_at:
                    new Date().toISOString(),

                catatan:
                    "Transaksi disetujui."
            })

            .eq(
                "id",
                approvalId
            );


        if (error) {
            throw error;
        }


        alert(
            "Transaksi berhasil di-approve."
        );


        await loadApprovals();


    } catch (error) {

        console.error(
            "Approve error:",
            error
        );


        alert(
            "Gagal melakukan approval: " +
            error.message
        );

    }

}


// =========================================================
// REJECT
// =========================================================

async function rejectTransaction(approvalId) {

    const catatan =
        prompt(
            "Masukkan alasan penolakan:"
        );


    if (catatan === null) {
        return;
    }


    if (!catatan.trim()) {

        alert(
            "Alasan penolakan wajib diisi."
        );

        return;
    }


    try {

        const {
            error
        } = await supabaseClient

            .from("approvals")

            .update({
                status: "rejected",

                approved_at:
                    null,

                catatan:
                    catatan.trim()
            })

            .eq(
                "id",
                approvalId
            );


        if (error) {
            throw error;
        }


        alert(
            "Transaksi berhasil ditolak."
        );


        await loadApprovals();


    } catch (error) {

        console.error(
            "Reject error:",
            error
        );


        alert(
            "Gagal menolak transaksi: " +
            error.message
        );

    }

}


// =========================================================
// INITIALIZE
// =========================================================

loadApprovals();