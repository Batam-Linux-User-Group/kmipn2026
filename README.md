<div align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=40&pause=1000&color=3BCFA6&center=true&vCenter=true&width=600&lines=JEDA+App;Mental+Health+for+Traders;KMIPN+2026+Project" alt="Typing SVG" />

  <br />

  <p align="center">
    <strong>Aplikasi Pertolongan Pertama Emosional untuk Investor & Trader (Saham & Kripto)</strong>
    <br />
    <br />
    <a href="#-fitur-utama">Fitur</a>
    ·
    <a href="#%EF%B8%8F-arsitektur--tech-stack">Tech Stack</a>
    ·
    <a href="#-alur-aplikasi-dag">Cara Kerja</a>
    ·
    <a href="#-tutorial-instalasi--penggunaan">Instalasi</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
    <img src="https://img.shields.io/badge/Golang-00ADD8?style=for-the-badge&logo=go&logoColor=white" alt="Golang" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Zustand-4D4D4D?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />
    <img src="https://img.shields.io/badge/KMIPN-2026-FFB000?style=for-the-badge" alt="KMIPN 2026" />
  </p>
</div>

<hr />

## 📖 Tentang Proyek
**JEDA** adalah aplikasi inovatif yang dirancang untuk menjaga kesehatan mental para pelaku pasar finansial (Saham, Kripto Futures, dan Spot). Menyadari tingginya tingkat stres saat menghadapi *Cutloss*, *Nyangkut (Floating Loss)*, atau *Margin Call*, JEDA hadir untuk memberikan intervensi instan melalui asesmen psikologis harian dan latihan pernapasan terkontrol.

Proyek ini dikembangkan secara komprehensif untuk diikutsertakan dalam kompetisi **KMIPN (Kompetisi Mahasiswa Informatika Politeknik Nasional) 2026**.

<br />

## 🚀 Fitur Utama

<table align="center">
  <tr>
    <td align="center"><strong>Asesmen Berbasis DAG</strong></td>
    <td align="center"><strong>Breathing Lockdown (30s)</strong></td>
    <td align="center"><strong>Self Journal & Streak</strong></td>
  </tr>
  <tr>
    <td><img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif" width="250" alt="DAG Flow Animation" /></td>
    <td><img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif" width="250" alt="Breathing Animation" /></td>
    <td><img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjEx.../giphy.gif" width="250" alt="Journal Animation" /></td>
  </tr>
</table>

- 🧠 **Decision Tree Assessment (DAG):** Logika asesmen cerdas yang bercabang secara spesifik menyesuaikan instrumen pengguna (Saham vs Kripto) dan kondisi portofolio (Cutloss, Hold/Nyangkut, Tidak Entry).
- 🫁 **Panic Intervention (Breathing Screen):** Jika pengguna terdeteksi *Panik Berat*, aplikasi akan mengunci layar (*lockdown*) selama 30 detik untuk memandu pernapasan menggunakan animasi mulus dari *Reanimated*.
- ✍️ **Self Journaling:** Integrasi input jurnal harian di setiap langkah asesmen.
- 🔥 **Daily Streak & Risk Scoring:** Kalkulasi skor otomatis (Aman, Rentan, Adiksi Tinggi) dan pencatatan *streak* harian.

<br />

## 🛠️ Arsitektur & Tech Stack

JEDA mengimplementasikan arsitektur *Middleware* yang memisahkan *Client* dari *Database* menggunakan *Backend* REST API, memastikan keamanan tinggi dan manipulasi data terpusat.

### Frontend (Mobile App)
* **Framework:** React Native (Expo)
* **State Management:** Zustand (Local persistence & Global state)
* **Animation:** React Native Reanimated (Untuk siklus pernapasan dinamis)
* **UI/UX:** Custom Light Mint Theme (`#C5E3DE`, `#1A886A`, `#3BCFA6`) dengan *White Rounded Pill Buttons*.

### Backend (REST API)
* **Language:** Golang
* **Framework:** Gin
* **ORM:** GORM (PostgreSQL Driver)
* **Security:** Custom Middleware untuk verifikasi JWT dari Supabase. Atomic Transactions untuk kalkulasi *streak* & *score*.

### Database & Auth
* **Provider:** Supabase (PostgreSQL)
* **Auth:** Google Sign-In terintegrasi dengan Supabase Auth.

<br />

## 🧭 Alur Aplikasi (DAG)

Logika JEDA dirancang menggunakan *Directed Acyclic Graph* (DAG) dengan 8 skenario utama:

```mermaid
graph TD
    A[Start: Pilih Instrumen] -->|Saham| B[Saham Flow]
    A -->|Crypto/Forex| C[Crypto Flow]
    
    B --> D{Portofolio Hari Ini?}
    D -->|Cutloss| E[Tindakan: Panik/Move-on]
    D -->|Nyangkut| F[Solusi: Avg Down/Hold]
    D -->|Tidak Entry| G[Emosi Hari Ini?]
    
    C --> H{Jenis?}
    H -->|Futures| I[Kondisi: Margin Call / Floating]
    H -->|Spot| J[Flow mirip Saham]
    
    E -->|Trigger Panik Berat| K((Breathing Screen 30s))
    I -->|Trigger Panik Berat| K
    J -->|Trigger Panik| K
    
    K --> L[Result & Rekomendasi]
    F --> L
    G --> L
