// Pendataan Barang - Form input & daftar barang (frontend)
// Penyimpanan data menggunakan localStorage browser.

(function () {
  "use strict";

  var STORAGE_KEY = "pendataan-barang.items";

  /** @type {Array<Object>} */
  var items = loadItems();
  var editingId = null;

  // Elemen DOM
  var form = document.getElementById("barang-form");
  var formTitle = document.getElementById("form-title");
  var submitBtn = document.getElementById("submit-btn");
  var resetBtn = document.getElementById("reset-btn");
  var searchInput = document.getElementById("search");
  var tbody = document.getElementById("barang-tbody");
  var emptyState = document.getElementById("empty-state");
  var grandTotalEl = document.getElementById("grand-total");

  var fields = {
    id: document.getElementById("barang-id"),
    kode: document.getElementById("kode"),
    nama: document.getElementById("nama"),
    kategori: document.getElementById("kategori"),
    jumlah: document.getElementById("jumlah"),
    satuan: document.getElementById("satuan"),
    harga: document.getElementById("harga"),
  };

  // ---- Persistence ----------------------------------------------------------

  function loadItems() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Gagal memuat data barang:", e);
      return [];
    }
  }

  function saveItems() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Gagal menyimpan data barang:", e);
    }
  }

  // ---- Helpers --------------------------------------------------------------

  function formatRupiah(value) {
    var n = Number(value) || 0;
    return "Rp " + n.toLocaleString("id-ID");
  }

  function generateId() {
    return "id-" + Math.random().toString(36).slice(2, 9) + "-" + items.length;
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  // ---- Validasi -------------------------------------------------------------

  function setError(name, message) {
    var el = document.querySelector('.error[data-for="' + name + '"]');
    if (el) el.textContent = message || "";
    if (fields[name]) {
      fields[name].classList.toggle("invalid", !!message);
    }
  }

  function clearErrors() {
    setError("kode", "");
    setError("nama", "");
    setError("jumlah", "");
  }

  function validate(data) {
    var ok = true;
    clearErrors();

    if (!data.kode) {
      setError("kode", "Kode barang wajib diisi.");
      ok = false;
    } else {
      // Cek duplikat kode (selain item yang sedang diedit)
      var dup = items.some(function (it) {
        return it.kode.toLowerCase() === data.kode.toLowerCase() && it.id !== editingId;
      });
      if (dup) {
        setError("kode", "Kode barang sudah digunakan.");
        ok = false;
      }
    }

    if (!data.nama) {
      setError("nama", "Nama barang wajib diisi.");
      ok = false;
    }

    if (data.jumlah === "" || data.jumlah == null || isNaN(data.jumlah) || Number(data.jumlah) < 0) {
      setError("jumlah", "Jumlah harus berupa angka >= 0.");
      ok = false;
    }

    return ok;
  }

  // ---- Form -----------------------------------------------------------------

  function readForm() {
    return {
      kode: fields.kode.value.trim(),
      nama: fields.nama.value.trim(),
      kategori: fields.kategori.value,
      jumlah: fields.jumlah.value === "" ? "" : Number(fields.jumlah.value),
      satuan: fields.satuan.value.trim(),
      harga: fields.harga.value === "" ? 0 : Number(fields.harga.value),
    };
  }

  function resetForm() {
    form.reset();
    fields.id.value = "";
    editingId = null;
    clearErrors();
    formTitle.textContent = "Tambah Barang";
    submitBtn.textContent = "Simpan";
  }

  function fillForm(item) {
    fields.id.value = item.id;
    fields.kode.value = item.kode;
    fields.nama.value = item.nama;
    fields.kategori.value = item.kategori || "";
    fields.jumlah.value = item.jumlah;
    fields.satuan.value = item.satuan || "";
    fields.harga.value = item.harga || 0;
    editingId = item.id;
    formTitle.textContent = "Edit Barang";
    submitBtn.textContent = "Perbarui";
  }

  function onSubmit(e) {
    e.preventDefault();
    var data = readForm();
    if (!validate(data)) return;

    if (editingId) {
      var idx = items.findIndex(function (it) {
        return it.id === editingId;
      });
      if (idx !== -1) {
        items[idx] = Object.assign({}, items[idx], data);
      }
    } else {
      data.id = generateId();
      items.push(data);
    }

    saveItems();
    render();
    resetForm();
  }

  // ---- Aksi tabel -----------------------------------------------------------

  function onTableClick(e) {
    var btn = e.target.closest("button[data-action]");
    if (!btn) return;

    var id = btn.getAttribute("data-id");
    var action = btn.getAttribute("data-action");

    if (action === "edit") {
      var item = items.find(function (it) {
        return it.id === id;
      });
      if (item) {
        fillForm(item);
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else if (action === "delete") {
      var target = items.find(function (it) {
        return it.id === id;
      });
      var nama = target ? target.nama : "barang ini";
      if (window.confirm('Hapus "' + nama + '" dari daftar?')) {
        items = items.filter(function (it) {
          return it.id !== id;
        });
        if (editingId === id) resetForm();
        saveItems();
        render();
      }
    }
  }

  // ---- Render ---------------------------------------------------------------

  function getVisibleItems() {
    var q = searchInput.value.trim().toLowerCase();
    if (!q) return items;
    return items.filter(function (it) {
      return (
        it.kode.toLowerCase().indexOf(q) !== -1 ||
        it.nama.toLowerCase().indexOf(q) !== -1
      );
    });
  }

  function render() {
    var visible = getVisibleItems();
    tbody.innerHTML = "";

    var grandTotal = 0;

    visible.forEach(function (it) {
      var total = (Number(it.jumlah) || 0) * (Number(it.harga) || 0);
      grandTotal += total;

      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + escapeHtml(it.kode) + "</td>" +
        "<td>" + escapeHtml(it.nama) + "</td>" +
        "<td>" + escapeHtml(it.kategori || "-") + "</td>" +
        '<td class="num">' + (Number(it.jumlah) || 0).toLocaleString("id-ID") + "</td>" +
        "<td>" + escapeHtml(it.satuan || "-") + "</td>" +
        '<td class="num">' + formatRupiah(it.harga) + "</td>" +
        '<td class="num">' + formatRupiah(total) + "</td>" +
        '<td><div class="row-actions">' +
        '<button class="btn btn-sm btn-edit" data-action="edit" data-id="' + it.id + '">Edit</button>' +
        '<button class="btn btn-sm btn-delete" data-action="delete" data-id="' + it.id + '">Hapus</button>' +
        "</div></td>";
      tbody.appendChild(tr);
    });

    // Total mencerminkan semua item (bukan hanya yang difilter)
    var fullTotal = items.reduce(function (sum, it) {
      return sum + (Number(it.jumlah) || 0) * (Number(it.harga) || 0);
    }, 0);
    grandTotalEl.textContent = formatRupiah(fullTotal);

    var hasItems = items.length > 0;
    var hasVisible = visible.length > 0;
    emptyState.classList.toggle("hidden", hasItems);
    if (hasItems && !hasVisible) {
      emptyState.classList.remove("hidden");
      emptyState.textContent = "Tidak ada barang yang cocok dengan pencarian.";
    } else if (!hasItems) {
      emptyState.textContent = "Belum ada data barang. Silakan tambahkan melalui form di atas.";
    }
  }

  // ---- Init -----------------------------------------------------------------

  form.addEventListener("submit", onSubmit);
  resetBtn.addEventListener("click", resetForm);
  searchInput.addEventListener("input", render);
  tbody.addEventListener("click", onTableClick);

  render();
})();
