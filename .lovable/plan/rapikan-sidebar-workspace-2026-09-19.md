# Rapikan Sidebar Workspace

## Perubahan
- Sisakan tiga tombol utama pada ribbon: File Explorer, Graph View, dan Settings.
- Hapus tombol Vault Manager, Account, Import/Export, dan Editor Settings dari ribbon.
- Ubah Settings menjadi panel samping yang bisa dibuka-tutup dengan tombol yang sama, seperti File Explorer.
- Tampilkan navigasi Settings dalam grup yang dapat dibuka-tutup:
  - Account & Profile: Account & Profile
  - Vault Management: Vault Management
  - System & Sync: System & Sync, Features, Configuration Vault
  - Editor & Schema: Editor, Properties & Schema
  - Visual: Visual Graph Engine
  - Collaboration: User Roles
- Saat item dipilih, buka atau fokuskan tab Settings dan tampilkan komponen yang sesuai tanpa menutup panel samping.

## Detail teknis
- Jadikan daftar bagian Settings sebagai sumber bersama agar panel samping dan halaman Settings selalu konsisten.
- Simpan bagian Settings yang dipilih pada state tab workspace, sehingga pilihan tetap benar saat tab difokuskan kembali.
- Pertahankan panel yang dapat diubah lebarnya dan tombol tutup yang sudah ada.

## Verifikasi
- Pastikan setiap grup bisa dibuka dan ditutup.
- Pastikan tombol Settings membuka dan menutup panel tanpa reload.
- Pastikan setiap item membuka komponen Settings yang benar.
- Pastikan File Explorer dan Graph View tetap bekerja.
