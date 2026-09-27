// =========================================================
// VARIABEL
// =========================================================

let editingEventId = null;


// =========================================================
// FORMAT TANGGAL
// =========================================================

function formatTanggal(tanggal) {

    if (!tanggal) {
        return "-";
    }

    const date = new Date(tanggal + "T00:00:00");

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
// FORMAT STATUS
// =========================================================

function getStatusClass(status) {

    if (status === "selesai") {
        return "status-aman";
    }

    if (status === "berjalan") {
        return "status-warning";
    }

    if (status === "dibatalkan") {
        return "status-over";
    }

    return "status-badge";
}


function getStatusText(status) {

    const statusMap = {
        perencanaan: "Perencanaan",
        berjalan: "Berjalan",
        selesai: "Selesai",
        dibatalkan: "Dibatalkan"
    };

    return statusMap[status] || status;

}


// =========================================================
// LOAD EVENT
// =========================================================

async function loadEvents() {

    const table =
        document.getElementById("event-table");

    table.innerHTML = `
        <tr>
            <td colspan="6" class="empty-state">
                Memuat data...
            </td>
        </tr>
    `;


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
                tanggal_selesai,
                lokasi,
                deskripsi,
                status,
                created_at
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


        displayEvents(data);


    } catch (error) {

        console.error(
            "Load event error:",
            error
        );


        table.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="empty-state"
                >
                    Gagal mengambil data event.
                </td>
            </tr>
        `;

    }

}


// =========================================================
// DISPLAY EVENT
// =========================================================

function displayEvents(events) {

    const table =
        document.getElementById("event-table");


    table.innerHTML = "";


    if (!events || events.length === 0) {

        table.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="empty-state"
                >
                    Belum ada event.
                </td>

            </tr>
        `;

        return;
    }


    events.forEach(function (event, index) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>
                <strong>
                    ${escapeHtml(event.nama_event)}
                </strong>
            </td>

            <td>
                ${formatTanggal(event.tanggal_mulai)}
                -
                ${formatTanggal(event.tanggal_selesai)}
            </td>

            <td>
                ${escapeHtml(event.lokasi || "-")}
            </td>

            <td>

                <span
                    class="status-badge ${getStatusClass(event.status)}"
                >
                    ${getStatusText(event.status)}
                </span>

            </td>

            <td>

                <button
                    class="btn-edit"
                    onclick="editEvent('${event.id}')"
                >
                    Edit
                </button>

                <button
                    class="btn-delete"
                    onclick="deleteEvent('${event.id}')"
                >
                    Hapus
                </button>

            </td>
        `;


        table.appendChild(row);

    });

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
// SIMPAN EVENT
// =========================================================

document
    .getElementById("event-form")
    .addEventListener("submit", async function (event) {

        event.preventDefault();


        const namaEvent =
            document.getElementById(
                "nama-event"
            ).value.trim();


        const tanggalMulai =
            document.getElementById(
                "tanggal-mulai"
            ).value;


        const tanggalSelesai =
            document.getElementById(
                "tanggal-selesai"
            ).value;


        const lokasi =
            document.getElementById(
                "lokasi"
            ).value.trim();


        const deskripsi =
            document.getElementById(
                "deskripsi"
            ).value.trim();


        const status =
            document.getElementById(
                "status"
            ).value;


        const message =
            document.getElementById(
                "event-message"
            );


        message.textContent = "";


        // =================================================
        // VALIDASI TANGGAL
        // =================================================

        if (tanggalSelesai < tanggalMulai) {

            message.textContent =
                "Tanggal selesai tidak boleh lebih awal dari tanggal mulai.";

            message.style.color = "red";

            return;
        }


        try {

            const eventData = {

                nama_event:
                    namaEvent,

                tanggal_mulai:
                    tanggalMulai,

                tanggal_selesai:
                    tanggalSelesai,

                lokasi:
                    lokasi || null,

                deskripsi:
                    deskripsi || null,

                status:
                    status

            };


            // =================================================
            // UPDATE
            // =================================================

            if (editingEventId) {

                const {
                    error
                } = await supabaseClient

                    .from("events")

                    .update(eventData)

                    .eq(
                        "id",
                        editingEventId
                    );


                if (error) {
                    throw error;
                }


                message.textContent =
                    "Event berhasil diperbarui.";

            }


            // =================================================
            // INSERT
            // =================================================

            else {

                const {
                    error
                } = await supabaseClient

                    .from("events")

                    .insert([
                        eventData
                    ]);


                if (error) {
                    throw error;
                }


                message.textContent =
                    "Event berhasil ditambahkan.";

            }


            message.style.color =
                "green";


            resetForm();


            await loadEvents();


        } catch (error) {

            console.error(
                "Save event error:",
                error
            );


            message.textContent =
                "Gagal menyimpan event: " +
                error.message;


            message.style.color =
                "red";

        }

    });


// =========================================================
// EDIT EVENT
// =========================================================

async function editEvent(id) {

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
                tanggal_selesai,
                lokasi,
                deskripsi,
                status
            `)

            .eq(
                "id",
                id
            )

            .single();


        if (error) {
            throw error;
        }


        editingEventId =
            data.id;


        document.getElementById(
            "form-title"
        ).textContent =
            "Edit Event";


        document.getElementById(
            "nama-event"
        ).value =
            data.nama_event;


        document.getElementById(
            "tanggal-mulai"
        ).value =
            data.tanggal_mulai;


        document.getElementById(
            "tanggal-selesai"
        ).value =
            data.tanggal_selesai;


        document.getElementById(
            "lokasi"
        ).value =
            data.lokasi || "";


        document.getElementById(
            "deskripsi"
        ).value =
            data.deskripsi || "";


        document.getElementById(
            "status"
        ).value =
            data.status;


        document.getElementById(
            "cancel-edit"
        ).style.display =
            "inline-block";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


    } catch (error) {

        console.error(
            "Edit event error:",
            error
        );

        alert(
            "Gagal mengambil data event."
        );

    }

}


// =========================================================
// DELETE EVENT
// =========================================================

async function deleteEvent(id) {

    const confirmed =
        confirm(
            "Apakah kamu yakin ingin menghapus event ini?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } = await supabaseClient

            .from("events")

            .delete()

            .eq(
                "id",
                id
            );


        if (error) {
            throw error;
        }


        alert(
            "Event berhasil dihapus."
        );


        await loadEvents();


    } catch (error) {

        console.error(
            "Delete event error:",
            error
        );


        alert(
            "Gagal menghapus event: " +
            error.message
        );

    }

}


// =========================================================
// RESET FORM
// =========================================================

function resetForm() {

    editingEventId = null;


    document
        .getElementById("event-form")
        .reset();


    document.getElementById(
        "form-title"
    ).textContent =
        "Tambah Event";


    document.getElementById(
        "cancel-edit"
    ).style.display =
        "none";

}


// =========================================================
// BATAL EDIT
// =========================================================

document
    .getElementById("cancel-edit")
    .addEventListener(
        "click",
        function () {

            resetForm();

            document.getElementById(
                "event-message"
            ).textContent = "";

        }
    );


// =========================================================
// LOAD AWAL
// =========================================================

loadEvents();