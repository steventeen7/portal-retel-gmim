# Panduan Deployment Portal RETEL GMIM (Supabase & Vercel)

Dokumen ini berisi panduan selangkah demi selangkah untuk memindahkan lokal project **Portal RETEL GMIM** ke **Git (GitHub)**, menghubungkan database ke **Supabase**, dan mendeploynya secara gratis ke **Vercel**.

---

## 1. Persiapan Database (Supabase)

Karena aplikasi Anda sudah menggunakan package `@supabase/supabase-js` dan file `supabase.ts` sudah siap, langkah pertama adalah membuat database online.

### Membangun Project di Supabase
1. Buka browser dan Daftar/Login ke **[Supabase](https://supabase.com)**.
2. Klik tombol **New Project**, pilih organisasi Anda (atau buat baru).
3. Beri nama project, misalnya `portal-retel`.
4. Buat dan *simpan* **Database Password** yang kuat dengan aman.
5. Pilih Region (pilih Singapore untuk latency terbaik dari Indonesia), lalu klik **Create New Project**. Tunggu 1-2 menit hingga project selesai dibuat.

### Menyimpan Kredensial (API Keys)
1. Buka Project Supabase yang sudah jadi.
2. Ke menu **Project Settings** (ikon roda gigi) di sidebar paling bawah, lalu klik menu **API**.
3. Temukan dan **Catat 2 nilai ini**:
   - **Project URL** (Kita sebut ini: `NEXT_PUBLIC_SUPABASE_URL`)
   - **Project API Keys - anon / public** (Kita sebut ini: `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### Membuat Tabel Database (Migrasi SQL)
1. Buka menu **SQL Editor** di panel kiri Supabase.
2. Klik **New Query**.
3. *Copy* dan *Paste* script SQL yang ada di lokal Anda (biasanya ada di file `supabase/seed.sql` atau script DDL untuk `profiles`, `soal_tes`, dll).
4. Klik **Run** di pojok kanan bawah editor untuk mengeksekusi script.
5. Pastikan tabel seperti `profiles`, `soal_tes`, `nilai_user`, `soal_wawancara`, `materi_belajar`, `kata_kunci`, `soal_tiga_besar`, dan `activity_logs` muncul di menu **Table Editor**.

> **Penting (Row Level Security):** Pastikan akses ke tabel diizinkan untuk sementara, atau set RLS (Row Level Security) dengan `Policies` yang memperbolehkan akses *select* dan *insert* dari aplikasi (karena aplikasi ini mengambil role admin mandiri dari server).
> Cara cepat menonaktifkannya (Peringatan: tidak untuk produksi skala besar): `ALTER TABLE nama_tabel DISABLE ROW LEVEL SECURITY;`.

---

## 2. Persiapan Git Repository (Lokal ke GitHub)

Sebelum bisa di-deploy ke Vercel, kode kita harus ada di Cloud Repository seperti GitHub.

1. Buka akun **[GitHub](https://github.com)** Anda, lalu klik tombol **New repository**.
2. Beri nama **`portal-retel-gmim`**.
3. Anda bisa mengatur Visibility menjadi **Private** (agar kode tidak dilihat publik) atau **Public**.
4. **Jangan mencentang apapun** (Initialize this repository with: Add a README / .gitignore). Biarkan kosong.
5. Klik **Create repository**.

Kembali ke VS Code (Terminal):
1. Buka terminal baru di VS Code, pastikan terminal terbuka di folder `portal-retel-gmim`.
2. Jalankan rangkaian perintah ini baris demi baris:

```bash
# Inisialisasi Git lokal (lewat langkah ini jika Git sudah ada)
git init

# Menambahkan semua modifikasi file ke index Git
git add .

# Menyimpan riwayat awal (Commit)
git commit -m "Initial commit: Supabase setup untuk Vercel deploy"

# Menjadikan branch ini sebagai branch utama bernama 'main'
git branch -M main

# Menghubungkan repo lokal ke repo GitHub yang baru dibuat
# CONTOH (GANTI USERNAME_ANDA DENGAN USERNAME DI GITHUB):
git remote add origin https://github.com/USERNAME_ANDA/portal-retel-gmim.git

# Mengunggah (Mendorong) kode ke GitHub Anda
git push -u origin main
```

---

## 3. Deploy ke Vercel

Dengan kode yang sekarang berada di GitHub, Vercel dapat membaca dan mem-build project Anda secara otomatis.

### Menghubungkan Repository
1. Buka dan Daftar/Login di **[Vercel](https://vercel.com/)**. Gunakan opsi **Continue with GitHub**.
2. Di dashboard Vercel, klik tombol hitam **Add New...** dan pilih **Project**.
3. Di bawah sub-judul *Import Git Repository*, Anda akan melihat list project GitHub Anda. Cari `portal-retel-gmim` dan klik **Import**.
4. (Opsional) Jika repo tidak muncul, klik **Adjust GitHub App Permissions** untuk memberikan izin akses ke repository `portal-retel-gmim` ke Vercel.

### Konfigurasi Project dan Environment Variables
1. **Project Name**: Akan terisi secara otomatis (`portal-retel-gmim`).
2. **Framework Preset**: Vercel otomatis mendeteksi project Anda menggunakan **Next.js**. Biarkan secara default.
3. Buka tab accordion bernama **Environment Variables**:
   Inilah saatnya mengambil 2 poin konfigurasi Supabase dari Langkah 1.
   
   Tambahkan variabel pertama:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: `https://xxxxxxxxxxxxxxxxxxxx.supabase.co` (Didapat dari Supabase)
   - Klik Add.

   Tambahkan variabel kedua:
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: `eyJhbGciOiJIUzI1...` (Didapat dari Supabase)
   - Klik Add.

4. Setelah dua environment tersetting, cukup klik tombol besar **Deploy**.

---

## 4. Selesai

Vercel akan memulai proses instalasi package NodeJS, dan mem-build Next.js (proses ini memakan waktu kurang lebih **1 hingga 3 menit**). Akan muncul log berkedip-kedip.

Setelah selesai:
- Anda akan melihat tampilan layar kembang api / Confetti.
- Klik **Continue to Dashboard** atau **Visit**.
- Vercel akan otomatis menyertakan ekstensi domain gratis seperti: `https://portal-retel-gmim.vercel.app`.

### Catatan Penting
- **Pembaruan Otomatis**: Jika nanti ada perubahan sintax/UI, Anda cukup mengerjakan di komputer lokal, dan jalankan perintah: 
  `git add .`, 
  `git commit -m "Update tampilan"`, dan 
  `git push origin main`.
  Vercel akan mendeteksi `push` tersebut secara real-time dan mendeploy pembaruan terbaru **secara otomatis**.
- **Koneksi Database**: Semua interaksi Create, Read, Update, Delete yang ditangani oleh *fungsi Fetch* melalui `supabase.ts` sekarang mengakses infrastruktur online langsung. Karena file `.env.local` Anda yang berisi environment tidak ikut di-commit ke Git (karena ada perintah di `.gitignore`), *Environment Variables* di dashboard Vercel mengambil alih peran itu semua.
