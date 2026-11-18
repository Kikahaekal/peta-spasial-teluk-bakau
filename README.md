# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Supabase dan admin

Aplikasi membaca data publik dari tabel `public.peta_spasial`. Struktur tabel:

| Kolom | Tipe | Fungsi |
| --- | --- | --- |
| `filename` | `uuid` | Primary key dan ID GeoJSON; dibuat otomatis |
| `geojson` | `jsonb` | GeoJSON mentah dalam format `FeatureCollection` |
| `created_at` | `timestamptz` | Waktu pembuatan; diisi otomatis |

1. Pastikan `.env.local` memiliki `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` (anon/publishable key, bukan service-role key).
2. Jalankan SQL pada `supabase/peta_spasial.sql` melalui Supabase SQL Editor. Skrip ini mengaktifkan RLS, memberi akses baca publik, dan membatasi perubahan data untuk admin.
3. Buat akun admin melalui Supabase Authentication. Tetapkan `role: admin` pada **App Metadata** akun tersebut (bukan User Metadata, karena User Metadata dapat diubah pemilik akun). Jika mengaturnya lewat SQL Editor, gunakan:

   ```sql
   UPDATE auth.users
   SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
   WHERE email = 'email-admin-anda';
   ```

   Setelah role diperbarui, keluar lalu masuk kembali agar token sesi memuat role terbaru.
4. Buka `/admin` dan masuk dengan akun tersebut. Jika tabel masih kosong, tombol **Impor 6 data publik** menyalin GeoJSON dari `public/data` ke database. Setelah itu peta utama membaca data langsung dari Supabase. Pengelolaan mendukung tambah, edit, dan hapus GeoJSON.

Database hanya menyimpan GeoJSON mentah, UUID, dan waktu pembuatan; nama kategori/berkas asal tidak disimpan. Karena itu, peta menampilkan setiap baris sebagai satu lapisan dengan UUID-nya.

## Deploy ke cPanel

Jalankan `npm run build`, lalu unggah **isi folder `dist`** ke document root domain di cPanel (biasanya `public_html`). Pastikan file `.htaccess` ikut diunggah; file tersebut mengarahkan route aplikasi seperti `/peta` ke `index.html`, sehingga halaman peta tetap dapat dibuka langsung atau saat halaman dimuat ulang.

Jika `/peta` masih menampilkan 404, periksa bahwa Apache mengaktifkan `mod_rewrite`, `.htaccess` diizinkan pada document root, dan file `.htaccess` tidak tersembunyi atau terlewat saat proses upload.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
