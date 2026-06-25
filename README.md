# pendataan-barang

Aplikasi sederhana untuk pendataan barang (inventaris).

## Fitur (AUT-11) — Form input & daftar barang

- Form input barang: kode, nama, kategori, jumlah, satuan, harga satuan.
- Validasi: kode & nama wajib, kode unik, jumlah angka >= 0.
- Daftar barang dalam tabel dengan kalkulasi total nilai per item & keseluruhan.
- Edit & hapus barang.
- Pencarian berdasarkan kode / nama.
- Data tersimpan di `localStorage` browser.

## Menjalankan

Buka `index.html` langsung di browser. Tidak memerlukan build tool atau dependency.

## Struktur

- `index.html` — markup form & tabel.
- `styles.css` — tampilan.
- `app.js` — logika form, validasi, render daftar, dan penyimpanan.
