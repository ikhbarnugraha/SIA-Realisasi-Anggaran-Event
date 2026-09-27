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
    ).format(value || 0);

}


// =========================================================
// LOAD DASHBOARD
// =========================================================

async function loadDashboard() {

    const statusElement =
        document.getElementById("status-koneksi");

    try {

        // =================================================
        // 1. TOTAL EVENT
        // =================================================

        const {
            count: totalEvent,
            error: eventError
        } = await supabaseClient
            .from("events")
            .select("*", {
                count: "exact",
                head: true
            });


        if (eventError) {
            throw eventError;
        }


        // =================================================
        // 2. DATA REALISASI ANGGARAN
        // =================================================

        const {
            data: realisasiData,
            error: realisasiError
        } = await supabaseClient
            .from("v_realisasi_anggaran")
            .select("*");


        if (realisasiError) {
            throw realisasiError;
        }


        // =================================================
        // 3. HITUNG TOTAL ANGGARAN
        // =================================================

        let totalAnggaran = 0;

        let totalRealisasi = 0;


        realisasiData.forEach(function (item) {

            totalAnggaran +=
                Number(item.total_anggaran) || 0;

            totalRealisasi +=
                Number(item.total_realisasi) || 0;

        });


        // =================================================
        // 4. HITUNG SISA ANGGARAN
        // =================================================

        const sisaAnggaran =
            totalAnggaran - totalRealisasi;


        // =================================================
        // 5. TAMPILKAN STATISTIK
        // =================================================

        document.getElementById(
            "total-event"
        ).textContent =
            totalEvent || 0;


        document.getElementById(
            "total-anggaran"
        ).textContent =
            formatRupiah(totalAnggaran);


        document.getElementById(
            "total-realisasi"
        ).textContent =
            formatRupiah(totalRealisasi);


        document.getElementById(
            "sisa-anggaran"
        ).textContent =
            formatRupiah(sisaAnggaran);


        // =================================================
        // 6. TAMPILKAN TABEL
        // =================================================

        displayRealisasiTable(
            realisasiData
        );


        // =================================================
        // 7. STATUS KONEKSI
        // =================================================

        statusElement.textContent =
            "Database Supabase berhasil terhubung.";

        statusElement.style.color =
            "#2e7d32";


        console.log(
            "Dashboard berhasil dimuat."
        );

        console.log(
            "Total event:",
            totalEvent
        );

        console.log(
            "Total anggaran:",
            totalAnggaran
        );

        console.log(
            "Total realisasi:",
            totalRealisasi
        );

    } catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );


        statusElement.textContent =
            "Gagal mengambil data dari database.";


        statusElement.style.backgroundColor =
            "#ffebee";


        statusElement.style.color =
            "#c62828";

    }

}


// =========================================================
// TABEL REALISASI
// =========================================================

function displayRealisasiTable(data) {

    const table =
        document.getElementById(
            "realisasi-table"
        );


    table.innerHTML = "";


    if (!data || data.length === 0) {

        table.innerHTML = `
            <tr>

                <td
                    colspan="7"
                    class="empty-state"
                >
                    Belum ada data anggaran.
                </td>

            </tr>
        `;

        return;
    }


    data.forEach(function (item) {

        const anggaran =
            Number(item.total_anggaran) || 0;


        const realisasi =
            Number(item.total_realisasi) || 0;


        const sisa =
            Number(item.sisa_anggaran) || 0;


        let statusClass =
            "status-aman";


        let statusText =
            "Aman";


        if (realisasi > anggaran) {

            statusClass =
                "status-over";

            statusText =
                "Melebihi Anggaran";

        } else if (
            anggaran > 0 &&
            realisasi / anggaran >= 0.8
        ) {

            statusClass =
                "status-warning";

            statusText =
                "Mendekati Batas";

        }


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                ${item.nama_event || "-"}
            </td>

            <td>
                ${item.nama_kategori || "-"}
            </td>

            <td>
                ${item.nama_item || "-"}
            </td>

            <td>
                ${formatRupiah(anggaran)}
            </td>

            <td>
                ${formatRupiah(realisasi)}
            </td>

            <td>
                ${formatRupiah(sisa)}
            </td>

            <td>

                <span
                    class="status-badge ${statusClass}"
                >
                    ${statusText}
                </span>

            </td>

        `;


        table.appendChild(row);

    });

}


// =========================================================
// JALANKAN DASHBOARD
// =========================================================

loadDashboard();