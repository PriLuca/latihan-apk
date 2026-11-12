# Ruang TKA — Demo Web

Aplikasi demo latihan TKA berbasis HTML, CSS, dan JavaScript tanpa instalasi atau build step.

## Fitur

- Mode siswa dan rekap guru.
- Pilihan ganda biasa, pilihan ganda kompleks, dan benar/salah.
- Timer 20 menit; latihan otomatis dikumpulkan saat waktu habis.
- Nilai otomatis, detail jawaban, pembahasan, filter kelas, dan ekspor CSV.
- Hasil tersimpan di `localStorage` browser.

## Membuka aplikasi

Buka `index.html` di browser. Jika browser membatasi penyimpanan untuk file lokal, jalankan server statis dari folder ini, misalnya dengan Python:

```bash
python -m http.server 8000
```

Lalu buka `http://localhost:8000`.

Alternatifnya, aktifkan GitHub Pages untuk repository ini dari **Settings → Pages**, pilih branch `main` dan folder `/ (root)`. Setelah deploy selesai, URL situs akan tampil di pengaturan Pages.

## Batasan demo

Data hanya tersimpan di browser/perangkat tempat latihan dikerjakan. Mode guru tidak terlindungi login dan belum bisa membaca hasil dari perangkat siswa lain. Untuk penggunaan kelas sungguhan diperlukan backend/database, autentikasi guru/siswa, serta pengamanan kunci jawaban di server.
