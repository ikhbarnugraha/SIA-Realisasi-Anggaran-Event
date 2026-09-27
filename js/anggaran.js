// =========================================================
// GLOBAL VARIABLE
// =========================================================

let selectedBudgetId = null;


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
// LOAD EVENTS
// =========================================================

async function loadEventsForBudget() {

    const select =
        document.getElementById(
            "budget-event"
        );

    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("events")

            .select(`
                id,
                nama_event,
                tanggal_mulai,
                tanggal_selesai
            `)

            .order(
                "tanggal_mulai",
                {
                    ascending: true
                }
            );


        if (error) {
            throw error;
        }


        select.innerHTML = `
            <option value="">
                Pilih Event
            </option>
        `;


        if (!data || data.length === 0) {

            select.innerHTML = `
                <option value="">
                    Belum ada event
                </option>
            `;

            return;
        }


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
            "Load events error:",
            error
        );


        select.innerHTML = `
            <option value="">
                Gagal memuat event
            </option>
        `;

    }

}


// =========================================================
// LOAD CATEGORIES
// =========================================================

async function loadCategories() {

    const select =
        document.getElementById(
            "detail-category"
        );


    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("categories")

            .select(`
                id,
                nama_kategori
            `)

            .order(
                "nama_kategori",
                {
                    ascending: true
                }
            );


        if (error) {
            throw error;
        }


        select.innerHTML = `
            <option value="">
                Pilih kategori
            </option>
        `;


        data.forEach(function (category) {

            const option =
                document.createElement("option");


            option.value =
                category.id;


            option.textContent =
                category.nama_kategori;


            select.appendChild(option);

        });


    } catch (error) {

        console.error(
            "Load categories error:",
            error
        );

        select.innerHTML = `
            <option value="">
                Gagal memuat kategori
            </option>
        `;

    }

}


// =========================================================
// LOAD BUDGETS
// =========================================================

async function loadBudgets() {

    const table =
        document.getElementById(
            "budget-table"
        );


    table.innerHTML = `
        <tr>

            <td
                colspan="4"
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

            .from("budgets")

            .select(`
                id,
                event_id,
                nama_anggaran,
                created_at,
                events (
                    nama_event
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


        displayBudgets(data);


    } catch (error) {

        console.error(
            "Load budgets error:",
            error
        );


        table.innerHTML = `
            <tr>

                <td
                    colspan="4"
                    class="empty-state"
                >
                    Gagal memuat data anggaran.
                </td>

            </tr>
        `;

    }

}


// =========================================================
// DISPLAY BUDGETS
// =========================================================

function displayBudgets(budgets) {

    const table =
        document.getElementById(
            "budget-table"
        );


    table.innerHTML = "";


    if (!budgets || budgets.length === 0) {

        table.innerHTML = `
            <tr>

                <td
                    colspan="4"
                    class="empty-state"
                >
                    Belum ada anggaran.
                </td>

            </tr>
        `;

        return;
    }


    budgets.forEach(function (budget, index) {

        const row =
            document.createElement("tr");


        const eventName =
            budget.events?.nama_event ||
            "-";


        row.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>
                ${escapeHtml(eventName)}
            </td>

            <td>
                <strong>
                    ${escapeHtml(
                        budget.nama_anggaran
                    )}
                </strong>
            </td>

            <td>

                <button
                    class="btn-edit"
                    onclick="manageBudget('${budget.id}')"
                >
                    Kelola Detail
                </button>


                <button
                    class="btn-delete"
                    onclick="deleteBudget('${budget.id}')"
                >
                    Hapus
                </button>

            </td>

        `;


        table.appendChild(row);

    });

}


// =========================================================
// CREATE BUDGET
// =========================================================

document
    .getElementById("budget-form")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const eventId =
                document.getElementById(
                    "budget-event"
                ).value;


            const namaAnggaran =
                document.getElementById(
                    "nama-anggaran"
                ).value.trim();


            const message =
                document.getElementById(
                    "budget-message"
                );


            message.textContent = "";


            if (!eventId) {

                message.textContent =
                    "Silakan pilih event.";

                message.style.color =
                    "red";

                return;
            }


            try {

                const {
                    error
                } = await supabaseClient

                    .from("budgets")

                    .insert([
                        {
                            event_id:
                                eventId,

                            nama_anggaran:
                                namaAnggaran
                        }
                    ]);


                if (error) {
                    throw error;
                }


                message.textContent =
                    "Anggaran berhasil dibuat.";

                message.style.color =
                    "green";


                document
                    .getElementById("budget-form")
                    .reset();


                await loadBudgets();


            } catch (error) {

                console.error(
                    "Create budget error:",
                    error
                );


                message.textContent =
                    "Gagal membuat anggaran: " +
                    error.message;

                message.style.color =
                    "red";

            }

        }
    );


// =========================================================
// MANAGE BUDGET DETAIL
// =========================================================

async function manageBudget(budgetId) {

    selectedBudgetId =
        budgetId;


    const section =
        document.getElementById(
            "detail-section"
        );


    section.classList.remove(
        "detail-section-hidden"
    );


    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("budgets")

            .select(`
                id,
                nama_anggaran,
                events (
                    nama_event
                )
            `)

            .eq(
                "id",
                budgetId
            )

            .single();


        if (error) {
            throw error;
        }


        document.getElementById(
            "selected-budget-title"
        ).textContent =
            data.nama_anggaran;


        document.getElementById(
            "selected-budget-event"
        ).textContent =
            "Event: " +
            (
                data.events?.nama_event ||
                "-"
            );


        loadBudgetDetails();


        section.scrollIntoView({
            behavior: "smooth"
        });


    } catch (error) {

        console.error(
            "Manage budget error:",
            error
        );

    }

}


// =========================================================
// LOAD BUDGET DETAILS
// =========================================================

async function loadBudgetDetails() {

    if (!selectedBudgetId) {
        return;
    }


    const table =
        document.getElementById(
            "detail-table"
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
                deskripsi,
                jumlah,
                satuan,
                harga_satuan,
                total_anggaran,
                category_id,
                categories (
                    nama_kategori
                )
            `)

            .eq(
                "budget_id",
                selectedBudgetId
            )

            .order(
                "created_at",
                {
                    ascending: true
                }
            );


        if (error) {
            throw error;
        }


        displayBudgetDetails(data);


    } catch (error) {

        console.error(
            "Load details error:",
            error
        );


        table.innerHTML = `
            <tr>

                <td
                    colspan="8"
                    class="empty-state"
                >
                    Gagal memuat detail anggaran.
                </td>

            </tr>
        `;

    }

}


// =========================================================
// DISPLAY BUDGET DETAILS
// =========================================================

function displayBudgetDetails(details) {

    const table =
        document.getElementById(
            "detail-table"
        );


    table.innerHTML = "";


    let totalBudget = 0;


    if (!details || details.length === 0) {

        table.innerHTML = `
            <tr>

                <td
                    colspan="8"
                    class="empty-state"
                >
                    Belum ada detail anggaran.
                </td>

            </tr>
        `;


        document.getElementById(
            "detail-total"
        ).textContent =
            "Rp0";


        return;
    }


    details.forEach(function (detail, index) {

        const total =
            Number(detail.total_anggaran) ||
            (
                Number(detail.jumlah) *
                Number(detail.harga_satuan)
            );


        totalBudget += total;


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>
                ${escapeHtml(
                    detail.categories?.nama_kategori ||
                    "-"
                )}
            </td>

            <td>
                <strong>
                    ${escapeHtml(
                        detail.nama_item
                    )}
                </strong>
            </td>

            <td>
                ${Number(detail.jumlah)}
            </td>

            <td>
                ${escapeHtml(
                    detail.satuan
                )}
            </td>

            <td>
                ${formatRupiah(
                    detail.harga_satuan
                )}
            </td>

            <td>
                ${formatRupiah(total)}
            </td>

            <td>

                <button
                    class="btn-delete"
                    onclick="deleteBudgetDetail('${detail.id}')"
                >
                    Hapus
                </button>

            </td>

        `;


        table.appendChild(row);

    });


    document.getElementById(
        "detail-total"
    ).textContent =
        formatRupiah(totalBudget);

}


// =========================================================
// ADD BUDGET DETAIL
// =========================================================

document
    .getElementById("detail-form")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!selectedBudgetId) {

                alert(
                    "Pilih anggaran terlebih dahulu."
                );

                return;
            }


            const categoryId =
                document.getElementById(
                    "detail-category"
                ).value;


            const namaItem =
                document.getElementById(
                    "detail-item"
                ).value.trim();


            const deskripsi =
                document.getElementById(
                    "detail-description"
                ).value.trim();


            const jumlah =
                Number(
                    document.getElementById(
                        "detail-quantity"
                    ).value
                );


            const satuan =
                document.getElementById(
                    "detail-unit"
                ).value.trim();


            const hargaSatuan =
                Number(
                    document.getElementById(
                        "detail-price"
                    ).value
                );


            const message =
                document.getElementById(
                    "detail-message"
                );


            message.textContent = "";


            if (!categoryId) {

                message.textContent =
                    "Silakan pilih kategori.";

                message.style.color =
                    "red";

                return;
            }


            if (jumlah <= 0) {

                message.textContent =
                    "Jumlah harus lebih dari 0.";

                message.style.color =
                    "red";

                return;
            }


            if (hargaSatuan < 0) {

                message.textContent =
                    "Harga satuan tidak valid.";

                message.style.color =
                    "red";

                return;
            }


            try {

                const {
                    error
                } = await supabaseClient

                    .from("budget_details")

                    .insert([
                        {
                            budget_id:
                                selectedBudgetId,

                            category_id:
                                categoryId,

                            nama_item:
                                namaItem,

                            deskripsi:
                                deskripsi || null,

                            jumlah:
                                jumlah,

                            satuan:
                                satuan,

                            harga_satuan:
                                hargaSatuan
                        }
                    ]);


                if (error) {
                    throw error;
                }


                message.textContent =
                    "Detail anggaran berhasil ditambahkan.";

                message.style.color =
                    "green";


                document
                    .getElementById(
                        "detail-form"
                    )
                    .reset();


                document.getElementById(
                    "detail-quantity"
                ).value =
                    "1";


                document.getElementById(
                    "detail-unit"
                ).value =
                    "unit";


                await loadBudgetDetails();


            } catch (error) {

                console.error(
                    "Add detail error:",
                    error
                );


                message.textContent =
                    "Gagal menambahkan detail: " +
                    error.message;

                message.style.color =
                    "red";

            }

        }
    );


// =========================================================
// DELETE DETAIL
// =========================================================

async function deleteBudgetDetail(id) {

    const confirmed =
        confirm(
            "Apakah kamu yakin ingin menghapus detail anggaran ini?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } = await supabaseClient

            .from("budget_details")

            .delete()

            .eq(
                "id",
                id
            );


        if (error) {
            throw error;
        }


        await loadBudgetDetails();


    } catch (error) {

        console.error(
            "Delete detail error:",
            error
        );


        alert(
            "Gagal menghapus detail anggaran: " +
            error.message
        );

    }

}


// =========================================================
// DELETE BUDGET
// =========================================================

async function deleteBudget(id) {

    const confirmed =
        confirm(
            "Menghapus anggaran akan menghapus seluruh detail anggarannya. Lanjutkan?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } = await supabaseClient

            .from("budgets")

            .delete()

            .eq(
                "id",
                id
            );


        if (error) {
            throw error;
        }


        if (selectedBudgetId === id) {

            selectedBudgetId =
                null;


            document
                .getElementById(
                    "detail-section"
                )
                .classList.add(
                    "detail-section-hidden"
                );

        }


        await loadBudgets();


    } catch (error) {

        console.error(
            "Delete budget error:",
            error
        );


        alert(
            "Gagal menghapus anggaran: " +
            error.message
        );

    }

}


// =========================================================
// INITIALIZATION
// =========================================================

async function initializeBudgetPage() {

    await loadEventsForBudget();

    await loadCategories();

    await loadBudgets();

}


initializeBudgetPage();