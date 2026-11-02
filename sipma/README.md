# SIPMA — Sistem Informasi Pemantauan Akademik (Implementasi Desain Figma)

Implementasi HTML + CSS + sedikit JavaScript dari dokumen `DESIGN_FIGMA_WEBSITE_SIPMA.docx`
untuk tiga role: **Admin Prodi**, **Dosen PA**, dan **Mahasiswa** (16 halaman, 8 pop-up).

## Cara menjalankan
Buka `index.html` di browser (klik dua kali). Tidak perlu server atau instalasi.
Pada halaman login pilih role (Admin / Dosen PA / Mahasiswa), isi email & password
apa saja (mode demo), lalu klik **Login**.
Font Inter dimuat dari Google Fonts (perlu internet); tanpa internet tampilan memakai font sistem.

## Struktur folder
```
sipma/
├── index.html                  Login (pilih role)
├── admin/                      Role Admin Prodi
│   ├── beranda.html            Ringkasan + donut distribusi + aktivitas terbaru
│   ├── kelola-pengguna.html    Tabel + filter + pop-up Edit & Hapus
│   ├── data-akademik.html      Tabel + pop-up KHS & Hapus
│   ├── verifikasi-klasifikasi.html  Proses Naive Bayes + hasil + pop-up Verifikasi
│   └── rekapitulasi-risiko.html     Statistik + grafik tren + rekap prodi
├── dosen/                      Role Dosen PA
│   ├── beranda.html · mahasiswa-bimbingan.html · detail-mahasiswa.html
│   └── tindak-lanjut.html (+ pop-up Ubah Waktu) · profil.html (+ pop-up Edit Profil)
├── mahasiswa/                  Role Mahasiswa
│   ├── beranda.html · data-akademik.html (tab Riwayat / Upload KHS)
│   └── status-risiko.html · tindak-lanjut.html · profil.html (+ pop-up Edit Profil)
├── css/
│   ├── base.css        Design tokens (warna, font, spasi), reset, tipografi
│   ├── layout.css      Kerangka: sidebar, topbar, grid konten, responsif
│   ├── components.css  Komponen dipakai ulang: card, stat, badge, button, form, table, modal, dll.
│   └── pages.css       Hanya yang khusus halaman: login, donut, grafik, timeline, upload
└── js/app.js           Interaksi: sidebar, modal, tab, filter tabel, form
```

## Pemetaan ke indikator penilaian

### 1. Struktur Dokumen HTML
- Setiap halaman: `<!doctype html>`, `lang="id"`, `<meta viewport>`, `<title>` unik.
- Elemen semantik: `<header>`, `<aside>` (sidebar), `<nav>` + `<ul>` (menu), `<main>`, `<section>`
  (kartu), `<article>`/`<ul>` (statistik), `<table>` dengan `<caption>`, `<thead>`, `<th scope="col">`,
  `<form>`, `<fieldset>/<legend>`, `<label for>`, `<dialog>` (pop-up), `<time>`, `<figure>`, `<dl>`.
- Hierarki heading: **satu `<h1>` per halaman** (judul halaman) → `<h2>` judul kartu/seksi → `<h3>` sub-judul. Tidak ada loncat level.
- Validitas: tidak ada `id` ganda; semua `aria-labelledby`, `for`, `aria-controls` mengarah ke id yang ada.
  Uji lewat https://validator.w3.org/ (unggah file) — hasil yang diharapkan tanpa error.
- Aksesibilitas dasar: *skip link*, `aria-current="page"` pada menu aktif, teks `sr-only` untuk tombol ikon.

### 2. Implementasi Layout (Flexbox, Grid, positioning, alignment, spacing)
| Bagian | Teknik | Lokasi kode |
|---|---|---|
| Kerangka halaman (sidebar + konten) | **CSS Grid** `grid-template-columns: 15rem 1fr` | `layout.css` → `.app` |
| Isi sidebar (logo, menu, tombol keluar di bawah) | **Flexbox** kolom, `flex:1` pada nav | `layout.css` → `.sidebar` |
| Topbar (hamburger kiri, identitas kanan) | **Flexbox** `justify-content: space-between` | `layout.css` → `.topbar` |
| Kartu statistik 4–5 kolom | **Grid** `repeat(auto-fit, minmax(10.5rem,1fr))` | `layout.css` → `.stats` |
| Dua kartu berdampingan | **Grid** 2 kolom → 1 kolom di layar kecil | `layout.css` → `.grid-2` |
| Toolbar pencarian + filter | **Flexbox** `flex-wrap` + `gap` | `layout.css` → `.toolbar` |
| Sidebar tetap saat scroll | **positioning** `position: sticky` | `.sidebar` |
| Ikon di dalam input | **positioning** `relative` + `absolute` | `components.css` → `.input-icon` |
| Pop-up | elemen `<dialog>` + `::backdrop` | `components.css` → `.modal` |
| Timeline | `position:absolute` pada `::before` | `pages.css` → `.timeline` |
| Spasi | skala `--space-1…6` (kelipatan 4px) | `base.css` |

Responsif: pada lebar ≤ 900px sidebar menjadi panel geser, grid 2 kolom menjadi 1 kolom, tabel di-scroll horizontal.

### 3. Tipografi
**Font: Inter** (fallback: system-ui, Segoe UI, Roboto, Arial). Alasan:
1. Inter adalah font bawaan Figma, sehingga hasil kode sama dengan tampilan wireframe.
2. Dirancang khusus untuk antarmuka layar: *x-height* tinggi sehingga tetap terbaca pada ukuran kecil (12–14px) di tabel padat.
3. Angka *tabular* (`font-variant-numeric: tabular-nums`) membuat kolom angka (IPK, SKS, NPM) rata dan mudah dibandingkan.
4. Tersedia banyak ketebalan (400–700) untuk membedakan heading, label, dan isi tanpa mengganti font.

| Elemen | Ukuran | Berat | Line-height | Variabel |
|---|---|---|---|---|
| `h1` judul halaman | 24px (1.5rem) | 700 | 1.3 | `--fs-xl` |
| `h2` judul kartu/seksi | 18px (1.125rem) | 700 | 1.3 | `--fs-lg` |
| `h3` sub-judul | 16px (1rem) | 600 | 1.3 | `--fs-md` |
| Teks isi, tabel, form | 14px (0.875rem) | 400 | 1.55 | `--fs-sm` |
| Keterangan, badge, header tabel | 12px (0.75rem) | 400–700 | 1.55 | `--fs-xs` |
| Angka besar kartu statistik | 32px (2rem) | 700 | 1.3 | `--fs-2xl` |

Ukuran memakai `rem` agar mengikuti pengaturan ukuran font pengguna. Semua nilai ada di `base.css` bagian *Design tokens*.

### 4. Styling dan Konsistensi Visual
- **Warna** didefinisikan sekali sebagai variabel di `base.css` (`--navy`, `--blue`, `--bg-page`, …).
  Warna risiko selalu sama di badge, donut, grafik, dan bar: hijau `--risk-low`, kuning `--risk-mid`, merah `--risk-high`.
- **Komponen identik antar role**: sidebar, topbar, kartu, tabel, tombol, pop-up memakai class yang sama,
  hanya isi menu yang berbeda per role.
- Jarak, radius (`--radius-sm/md/lg`), dan bayangan (`--shadow-card`) memakai token yang sama.
- Kontras: teks utama `#0f172a` di atas putih/biru muda; badge memakai pasangan warna gelap-di-atas-terang.

### 5. Kualitas Kode dan Kerapian
- **HTML dan CSS terpisah** total: tidak ada tag `<style>`; satu-satunya atribut `style` adalah *custom property*
  data (`--value`, `--s1`, `--s2`) untuk panjang bar & donut.
- **Modular**: 4 file CSS dengan tanggung jawab jelas (fondasi → layout → komponen → halaman), diurutkan dari umum ke khusus.
- **Penamaan class BEM**: `.blok`, `.blok__elemen`, `.blok--varian` (mis. `.sidebar__link--active`, `.badge--low`).
- **Selector rendah-spesifisitas**: class tunggal; tidak ada `id` untuk styling, tidak ada `!important` (kecuali `[hidden]`).
- **Minim duplikasi**: komponen dipakai lintas role; variasi lewat modifier & variabel CSS (mis. `.stat--low` hanya mengubah `--tone`).
- Komentar penjelas di awal tiap file/bagian CSS, JS, dan penanda `<!-- ===== SIDEBAR ===== -->` di HTML.

## Penjelasan part-part program (untuk presentasi)
| Part | Fungsi | HTML | CSS |
|---|---|---|---|
| Sidebar | Navigasi per role, menu aktif disorot | `<aside class="sidebar">` | `layout.css` |
| Topbar | Tombol buka/tutup menu + identitas pengguna | `<header class="topbar">` | `layout.css` |
| Stat | Kartu angka ringkasan | `<li class="stat stat--low">` | `components.css` |
| Card | Wadah putih berisi satu topik | `<section class="card">` | `components.css` |
| Tabel + Pagination | Data tabular | `<table class="table">`, `<nav class="pagination">` | `components.css` |
| Toolbar filter | Cari + dropdown (berfungsi lewat `app.js`) | `<form class="toolbar" data-filter>` | `layout.css` |
| Badge | Status risiko/verifikasi | `<span class="badge badge--low">` | `components.css` |
| Modal | Edit / Hapus / Verifikasi / Ubah waktu / Edit profil | `<dialog class="modal">` | `components.css` |
| Donut & grafik | Distribusi dan tren risiko | `.donut` (conic-gradient), `<svg class="chart">` | `pages.css` |
| Tabs | Riwayat Akademik / Upload KHS | `role="tablist"` | `components.css` |

## Cara menguji bagian-bagian kode
1. **Struktur & markup**: unggah tiap `.html` ke https://validator.w3.org/#validate_by_upload.
2. **Layout/responsif**: buka DevTools (F12) → ikon device toolbar → coba lebar 1280, 768, 390 px.
3. **Tipografi**: DevTools → tab *Computed* pada `h1`/`h2`/`p` → cek `font-family`, `font-size`, `line-height`.
4. **Konsistensi**: ubah satu variabel di `base.css` (mis. `--navy`) → semua halaman ikut berubah.
5. **Modularitas**: nonaktifkan `pages.css` di DevTools → hanya login/donut/grafik/timeline yang berubah.
6. **Interaksi**: klik hamburger, ikon pensil/tempat sampah/mata, ketik di kolom cari, ganti dropdown, ganti tab Upload KHS.

## Catatan penyesuaian terhadap wireframe
- Wireframe Admin menulis "Menunggu Verifikasi 20 → 5%"; di sini dihitung **20%** (20 dari 100 mahasiswa).
- Wireframe Mahasiswa menulis "Upload **KRS**" pada teks tab Upload KHS; di sini diseragamkan menjadi **KHS**.
- Data pada tabel adalah data contoh (dummy) dan belum terhubung ke database/backend.
