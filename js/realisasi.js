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
// STATUS APPROVAL
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


function getApprovalText(status) {

    const statusMap = {

        pending: "Pending",

        approved: "Approved",

        rejected: "Rejected"

    };

    return statusMap[status] || "Pending";

}


// =========================================================
// SET DEFAULT DATE
// =========================================================

function setDefaultDate() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    document.getElementById(
        "transaction-date"
    ).value =
        `${year}-${month}-${day}`;

}


// =========================================================
// LOAD BUDGET DETAILS
// =========================================================

async function loadBudgetDetailsForTransaction() {

    const select =
        document.getElementById(
            "budget-detail"
        );


    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("budget_details")

            .select(`
                id,
                nama_item,
                jumlah,
                satuan,
                harga_satuan,
                total_anggaran,

                budgets (
                    nama_anggaran,

                    events (
                        nama_event
                    )
                )
            `)

            .order(
                "created_at",
                {
                    ascending: true
                }
            );


        if (error) {
            throw error;
        }


        select.innerHTML = `
            <option value="">
                Pilih Item Anggaran
            </option>
        `;


        if (!data || data.length === 0) {

            select.innerHTML = `
                <option value="">
                    Belum ada item anggaran
                </option>
            `;

            return;
        }


        for (const detail of data) {

            const eventName =
                detail.budgets?.events?.nama_event ||
                "-";


            const budgetName =
                detail.budgets?.nama_anggaran ||
                "-";


            // ---------------------------------------------
            // Ambil transaksi untuk item tersebut
            // ---------------------------------------------

            const {
                data: transactions,
                error: transactionError
            } = await supabaseClient

                .from("transactions")

                .select(`
                    jumlah_realisasi,
                    approvals (
                        status
                    )
                `)

                .eq(
                    "budget_detail_id",
                    detail.id
                );


            if (transactionError) {
                throw transactionError;
            }


            let usedAmount = 0;


            (transactions || []).forEach(
                function (transaction) {

                    const approval =
                        Array.isArray(
                            transaction.approvals
                        )
                            ? transaction.approvals[0]
                            : transaction.approvals;


                    const status =
                        approval?.status;


                    if (
                        !status ||
                        status === "pending" ||
                        status === "approved"
                    ) {

                        usedAmount +=
                            Number(
                                transaction.jumlah_realisasi
                            ) || 0;

                    }

                }
            );


            const budgetAmount =
                Number(
                    detail.total_anggaran
                ) || 0;


            const remainingAmount =
                budgetAmount -
                usedAmount;


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                detail.id;


            option.textContent =
                `${eventName} | ${budgetName} | ${detail.nama_item} | Anggaran ${formatRupiah(budgetAmount)} | Sisa ${formatRupiah(remainingAmount)}`;


            if (remainingAmount <= 0) {

                option.disabled = true;

            }


            select.appendChild(option);

        }


    } catch (error) {

        console.error(
            "Load budget details error:",
            error
        );


        select.innerHTML = `
            <option value="">
                Gagal memuat item anggaran
            </option>
        `;

    }

}


// =========================================================
// LOAD TRANSACTIONS
// =========================================================

async function loadTransactions() {

    const table =
        document.getElementById(
            "transaction-table"
        );


    table.innerHTML = `
        <tr>

            <td
                colspan="8"
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

            .from("transactions")

            .select(`
                id,
                budget_detail_id,
                tanggal_transaksi,
                nomor_bukti,
                keterangan,
                jenis_transaksi,
                jumlah_realisasi,
                bukti_url,
                created_at,

                budget_details (
                    nama_item,

                    budgets (
                        nama_anggaran,

                        events (
                            nama_event
                        )
                    )
                ),

                approvals (
                    status,
                    catatan,
                    approved_at
                )
            `)

            .order(
                "tanggal_transaksi",
                {
                    ascending: false
                }
            );


        if (error) {
            throw error;
        }


        displayTransactions(data);


    } catch (error) {

        console.error(
            "Load transactions error:",
            error
        );


        table.innerHTML = `
            <tr>

                <td
                    colspan="8"
                    class="empty-state"
                >
                    Gagal memuat transaksi.
                </td>

            </tr>
        `;

    }

}


// =========================================================
// DISPLAY TRANSACTIONS
// =========================================================

function displayTransactions(transactions) {

    const table =
        document.getElementById(
            "transaction-table"
        );


    table.innerHTML = "";


    if (!transactions || transactions.length === 0) {

        table.innerHTML = `
            <tr>

                <td
                    colspan="8"
                    class="empty-state"
                >
                    Belum ada transaksi realisasi.
                </td>

            </tr>
        `;

        return;
    }


    transactions.forEach(function (transaction, index) {

        const eventName =
            transaction
                .budget_details
                ?.budgets
                ?.events
                ?.nama_event ||
            "-";


        const itemName =
            transaction
                .budget_details
                ?.nama_item ||
            "-";


        const approval =
            Array.isArray(
                transaction.approvals
            )
                ? transaction.approvals[0]
                : transaction.approvals;


        const approvalStatus =
            approval?.status ||
            "pending";


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>
                ${escapeHtml(eventName)}
            </td>

            <td>
                <strong>
                    ${escapeHtml(itemName)}
                </strong>
            </td>

            <td>
                ${formatTanggal(
                    transaction.tanggal_transaksi
                )}
            </td>

            <td>
                ${escapeHtml(
                    transaction.nomor_bukti || "-"
                )}
            </td>

            <td>
                ${formatRupiah(
                    transaction.jumlah_realisasi
                )}
            </td>

            <td>

                <span
                    class="status-badge ${getApprovalClass(approvalStatus)}"
                >
                    ${getApprovalText(approvalStatus)}
                </span>

            </td>

            <td>

                ${
                    transaction.bukti_url
                        ? `
                            <a
                                href="${escapeHtml(transaction.bukti_url)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="btn-link"
                            >
                                Bukti
                            </a>
                          `
                        : ""
                }

                <button
                    class="btn-delete"
                    onclick="deleteTransaction('${transaction.id}')"
                >
                    Hapus
                </button>

            </td>

        `;


        table.appendChild(row);

    });

}


// =========================================================
// ADD TRANSACTION
// =========================================================

document
    .getElementById("transaction-form")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const budgetDetailId =
                document.getElementById(
                    "budget-detail"
                ).value;


            const tanggalTransaksi =
                document.getElementById(
                    "transaction-date"
                ).value;


            const nomorBukti =
                document.getElementById(
                    "transaction-number"
                ).value.trim();


            const keterangan =
                document.getElementById(
                    "transaction-description"
                ).value.trim();


            const jumlahRealisasi =
                Number(
                    document.getElementById(
                        "transaction-amount"
                    ).value
                );


            const buktiUrl =
                document.getElementById(
                    "evidence-url"
                ).value.trim();


            const message =
                document.getElementById(
                    "transaction-message"
                );


            message.textContent = "";


            // =================================================
            // VALIDATION
            // =================================================

            if (!budgetDetailId) {

                message.textContent =
                    "Silakan pilih item anggaran.";

                message.style.color =
                    "red";

                return;
            }


            if (!tanggalTransaksi) {

                message.textContent =
                    "Tanggal transaksi wajib diisi.";

                message.style.color =
                    "red";

                return;
            }


            if (!keterangan) {

                message.textContent =
                    "Keterangan wajib diisi.";

                message.style.color =
                    "red";

                return;
            }


            if (jumlahRealisasi <= 0) {

                message.textContent =
                    "Jumlah realisasi harus lebih dari 0.";

                message.style.color =
                    "red";

                return;
            }


            try {

                // =================================================
                // INSERT TRANSACTION
                // =================================================

                const {
                    data: transaction,
                    error: transactionError
                } = await supabaseClient

                    .from("transactions")

                    .insert([
                        {
                            budget_detail_id:
                                budgetDetailId,

                            tanggal_transaksi:
                                tanggalTransaksi,

                            nomor_bukti:
                                nomorBukti || null,

                            keterangan:
                                keterangan,

                            jenis_transaksi:
                                "pengeluaran",

                            jumlah_realisasi:
                                jumlahRealisasi,

                            bukti_url:
                                buktiUrl || null
                        }
                    ])

                    .select("id")

                    .single();


                if (transactionError) {
                    throw transactionError;
                }


                // =================================================
                // CREATE APPROVAL
                // =================================================

                const {
                    error: approvalError
                } = await supabaseClient

                    .from("approvals")

                    .insert([
                        {
                            transaction_id:
                                transaction.id,

                            status:
                                "pending"
                        }
                    ]);


                if (approvalError) {

                    // Jika approval gagal dibuat,
                    // hapus transaction yang baru dibuat
                    await supabaseClient
                        .from("transactions")
                        .delete()
                        .eq(
                            "id",
                            transaction.id
                        );

                    throw approvalError;
                }


                message.textContent =
                    "Realisasi berhasil dicatat dan menunggu approval.";

                message.style.color =
                    "green";


                document
                    .getElementById(
                        "transaction-form"
                    )
                    .reset();


                setDefaultDate();


                await loadTransactions();

            } catch (error) {

                console.error(
                    "Add transaction error:",
                    error
                );


                message.textContent =
                    "Gagal menyimpan realisasi: " +
                    error.message;

                message.style.color =
                    "red";

            }

        }
    );


// =========================================================
// DELETE TRANSACTION
// =========================================================

async function deleteTransaction(id) {

    const confirmed =
        confirm(
            "Apakah kamu yakin ingin menghapus transaksi ini?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } = await supabaseClient

            .from("transactions")

            .delete()

            .eq(
                "id",
                id
            );


        if (error) {
            throw error;
        }


        await loadTransactions();


    } catch (error) {

        console.error(
            "Delete transaction error:",
            error
        );


        alert(
            "Gagal menghapus transaksi: " +
            error.message
        );

    }

}


// =========================================================
// INITIALIZATION
// =========================================================

async function initializeRealizationPage() {

    setDefaultDate();

    await loadBudgetDetailsForTransaction();

    await loadTransactions();

}


initializeRealizationPage();