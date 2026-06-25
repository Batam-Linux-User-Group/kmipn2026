<div align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=40&pause=1000&color=3BCFA6&center=true&vCenter=true&width=600&lines=JEDA+App;Mental+Health+for+Traders;KMIPN+2026+Project" alt="Typing SVG" />

  <br />

  <p align="center">
    <strong>Aplikasi Pertolongan Pertama Emosional untuk Investor & Trader (Saham & Kripto)</strong>
    <br />
    <br />
    <a href="#-fitur-utama">Fitur</a>
    ·
    <a href="#%EF%B8%8F-arsitektur-sistem">Arsitektur</a>
    ·
    <a href="#-alur-asesmen-dag">Cara Kerja</a>
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
    <td align="center"><strong>Asesmen Cerdas (DAG)</strong></td>
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

## ⚙️ Arsitektur Sistem

JEDA mengimplementasikan arsitektur *Middleware* menggunakan **Golang** yang bertindak sebagai jembatan aman antara **Mobile App** dan **Database Supabase**. 

Berikut adalah topologi arsitektur sistem JEDA:

```mermaid
graph LR
    subgraph Client
        RN[📱 React Native<br/>Mobile App]
    end

    subgraph Backend
        GO[⚙️ Golang Gin<br/>API RESTful Middleware]
    end

    subgraph Cloud Service
        SA[🔐 Supabase Auth<br/>Google Sign-In]
        DB[(🗄️ Supabase<br/>PostgreSQL)]
        GCP[☁️ Google Cloud<br/>OAuth Provider]
    end

    %% Relasi Client ke Auth
    RN -->|1. Login Request| SA
    SA <-->|2. Validasi OAuth| GCP
    
    %% Relasi Client ke Backend
    RN <-->|3. HTTP Request JWT| GO
    
    %% Relasi Backend ke DB & Auth
    GO -.->|4. Verifikasi JWT| SA
    GO <-->|5. CRUD via GORM| DB

    %% Styling
    style RN fill:#20232a,stroke:#61dafb,color:#fff
    style GO fill:#00add8,stroke:#00add8,color:#fff
    style SA fill:#3ecf8e,stroke:#3ecf8e,color:#fff
    style DB fill:#3ecf8e,stroke:#3ecf8e,color:#fff
    style GCP fill:#4285F4,stroke:#4285F4,color:#fff
