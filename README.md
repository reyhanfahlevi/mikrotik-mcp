# mikrotik-mcp

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![RouterOS](https://img.shields.io/badge/RouterOS-v7.x%20(v7.21%2B)-004d80?logo=mikrotik&logoColor=white)](https://mikrotik.com/)
[![MCP](https://img.shields.io/badge/Protocol-Model%20Context%20Protocol-8A2BE2)](https://modelcontextprotocol.io/)
[![Security](https://img.shields.io/badge/Security-Strictly%20Read--Only-green.svg)](#-zero-mutation-security-guarantee)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

**Secure, Strictly Read-Only Model Context Protocol (MCP) Server for MikroTik RouterOS v7 REST API.**

[Fitur](#-fitur--tools) • [Persyaratan](#-persyaratan-di-sisi-mikrotik) • [Konfigurasi](#-konfigurasi-environment) • [Instalasi & Integrasi](#-instalasi--integrasi-klien-mcp) • [Docker](#-menjalankan-dengan-docker) • [Keamanan](#-zero-mutation-security-guarantee)

</div>

---

## 📌 Ringkasan

`mikrotik-mcp` adalah server [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) yang menghubungkan AI Assistant (seperti **Claude Desktop**, **Cursor**, **Antigravity**, **Cline**, atau agent berbasis MCP lainnya) dengan router **MikroTik RouterOS v7** melalui antarmuka REST API resmi.

Server ini didesain khusus untuk keperluan **observabilitas jaringan, monitoring performa, troubleshooting, dan inspeksi konfigurasi** dengan filosofi **keamanan tanpa risiko (zero-mutation)**.

### 🛡️ Zero-Mutation Security Guarantee
1. **100% Read-Only:** Seluruh tool yang disediakan hanya melakukan pembacaan data (metode HTTP `GET`).
2. **Hardened HTTP Client:** Client internal dikunci di level kode sehingga tidak memiliki method `POST`, `PUT`, `PATCH`, atau `DELETE`. Panggilan mutasi secara teknis tidak mungkin dieksekusi.
3. **No Arbitrary Execution:** Tidak ada fitur untuk menjalankan arbitrary terminal script, remote command, atau custom API call bebas.
4. **Minimal Privileges:** Cukup gunakan akun MikroTik dengan izin `read` dan `rest-api`. Tidak memerlukan izin `write`, `policy`, `password`, atau `sensitive`.

---

## ⚡ Fitur & Tools

Semua tool mengembalikan data terstruktur dalam format JSON yang mudah dipahami oleh LLM:

| Tool Name | Kategori | Parameter | Deskripsi |
| :--- | :--- | :--- | :--- |
| `mikrotik_get_system_resource` | **System** | `-` | Mengambil data resource router: CPU load, free/total memory, uptime, board name, dan versi RouterOS. |
| `mikrotik_get_system_routerboard` | **System** | `-` | Mengambil detail hardware RouterBOARD: model, serial number, firmware saat ini, dan factory firmware. |
| `mikrotik_get_system_identity` | **System** | `-` | Mengambil nama host / identitas router. |
| `mikrotik_list_interfaces` | **Interfaces** | `type` *(opsional)* | Menampilkan seluruh interface jaringan beserta status (running/disabled), MAC address, MTU, dan statistik traffic. |
| `mikrotik_get_interface_details` | **Interfaces** | `nameOrId` *(wajib)* | Mengambil detail konfigurasi lengkap dari suatu interface berdasarkan nama (contoh: `ether1`) atau ID (`*1`). |
| `mikrotik_get_ip_addresses` | **IP & Routing** | `interfaceName` *(opsional)* | Menampilkan daftar alamat IP yang terpasang pada interface router. |
| `mikrotik_get_ip_routes` | **IP & Routing** | `activeOnly` *(opsional)* | Menampilkan routing table (rute dinamis, terhubung langsung, maupun statis). |
| `mikrotik_get_arp_table` | **IP & Routing** | `interfaceName`, `ipAddress` *(opsional)* | Menginspeksi tabel ARP (pemetaan alamat IP ke MAC address). |
| `mikrotik_get_dhcp_leases` | **DHCP** | `hostname`, `status` *(opsional)* | Menampilkan daftar client yang terhubung ke DHCP Server, status binding, host-name, dan waktu kedaluwarsa lease. |
| `mikrotik_get_firewall_filter_rules` | **Firewall** | `chain` *(opsional)* | Menampilkan aturan firewall filter beserta hit counter (packet & byte counters) dan deskripsi komentarnya. |
| `mikrotik_get_firewall_nat_rules` | **Firewall** | `chain` *(opsional)* | Menampilkan aturan firewall NAT (srcnat, dstnat, masquerade, port forwarding). |
| `mikrotik_get_system_logs` | **Logs** | `limit`, `topic` *(opsional)* | Menarik log aktivitas sistem terbaru dengan filter topik (contoh: `error`, `firewall`, `warning`, `system`). |

---

## 🚀 Persyaratan di Sisi MikroTik

### 1. Aktifkan Service REST API
Pastikan service `www-ssl` (HTTPS - port 443) atau `www` (HTTP - port 80) aktif di RouterOS v7:

```routeros
# Cek status service
/ip service print

# Aktifkan www-ssl (direkomendasikan)
/ip service enable www-ssl
```

### 2. Buat User Khusus Read-Only (Rekomendasi Best Practice)
Buat group dan user khusus dengan hak akses minimal:

```routeros
# 1. Buat grup dengan hanya privilege 'read' dan 'rest-api' (atau 'api')
/user group add name=mcp-readonly policy=read,api,web,rest-api

# 2. Buat user untuk MCP server
/user add name=mcp-agent group=mcp-readonly password="GantiPasswordKuatIni123!"
```

---

## ⚙️ Konfigurasi Environment

Server dapat dikonfigurasi menggunakan Environment Variables atau file `.env`:

| Variable | CLI Flag | Default | Keterangan |
| :--- | :--- | :--- | :--- |
| `MIKROTIK_HOST` | `--host` | `192.168.88.1` | IP address atau hostname router MikroTik |
| `MIKROTIK_PORT` | `--port` | `443` *(jika SSL)* / `80` | Port REST API MikroTik |
| `MIKROTIK_USERNAME` | `--user` / `-u` | `admin` | Username akun MikroTik |
| `MIKROTIK_PASSWORD` | `--pass` / `-p` | `""` | Password akun MikroTik |
| `MIKROTIK_USE_SSL` | `--ssl` / `--no-ssl` | `true` | Gunakan HTTPS (`true`) atau HTTP biasa (`false`) |
| `MIKROTIK_ALLOW_INSECURE_SSL` | `--insecure` | `true` | Izinkan sertifikat SSL self-signed internal router |
| `MIKROTIK_TIMEOUT` | `--timeout` | `15000` | Batas waktu request dalam milidetik (ms) |

---

## 🧩 Instalasi & Integrasi Klien MCP

### 1. Claude Desktop
Tambahkan konfigurasi berikut ke file konfigurasi Claude Desktop Anda:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mikrotik": {
      "command": "node",
      "args": ["/path/to/mikrotik-mcp/dist/index.js"],
      "env": {
        "MIKROTIK_HOST": "192.168.88.1",
        "MIKROTIK_PORT": "443",
        "MIKROTIK_USERNAME": "mcp-agent",
        "MIKROTIK_PASSWORD": "GantiPasswordKuatIni123!",
        "MIKROTIK_USE_SSL": "true",
        "MIKROTIK_ALLOW_INSECURE_SSL": "true"
      }
    }
  }
}
```

### 2. Cursor / Antigravity / OpenCode
Tambahkan blok server pada file konfigurasi MCP klien:

```json
{
  "mcpServers": {
    "mikrotik": {
      "command": "npx",
      "args": ["-y", "mikrotik-mcp"],
      "env": {
        "MIKROTIK_HOST": "192.168.88.1",
        "MIKROTIK_USERNAME": "mcp-agent",
        "MIKROTIK_PASSWORD": "GantiPasswordKuatIni123!"
      }
    }
  }
}
```

---

## 🐳 Menjalankan dengan Docker

Image docker didesain menggunakan multi-stage build Alpine Linux yang sangat ringan, tanpa dependensi dev, dan dijalankan dengan user non-root (`node`).

### Build Image
```bash
docker build -t mikrotik-mcp:latest .
```

### Jalankan Container dengan Hardening Keamanan Maksimal
```bash
docker run -i --rm \
  --read-only \
  --cap-drop=ALL \
  --security-opt=no-new-privileges:true \
  -e MIKROTIK_HOST="192.168.88.1" \
  -e MIKROTIK_USERNAME="mcp-agent" \
  -e MIKROTIK_PASSWORD="GantiPasswordKuatIni123!" \
  mikrotik-mcp:latest
```

### Menggunakan Docker Compose
Salin file [`.env.example`](.env.example) menjadi `.env`, sesuaikan isinya, lalu jalankan:
```bash
docker compose run --rm mikrotik-mcp
```

---

## 💻 Pengembangan Lokal

```bash
# 1. Clone repository
git clone https://github.com/reyhanfahlevi/mikrotik-mcp.git
cd mikrotik-mcp

# 2. Install dependencies
npm install

# 3. Jalankan development server (menggunakan tsx)
npm run dev

# 4. Build TypeScript ke JavaScript produksi
npm run build
```

---

## 📄 Lisensi & Kontributor

- **Author:** [Reyhan Fahlevi](https://github.com/reyhanfahlevi)
- **Repository:** [https://github.com/reyhanfahlevi/mikrotik-mcp](https://github.com/reyhanfahlevi/mikrotik-mcp)
- **Lisensi:** [MIT License](LICENSE)
