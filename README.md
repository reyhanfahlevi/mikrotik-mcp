# mikrotik-mcp

Model Context Protocol (MCP) Server **Read-Only** untuk **MikroTik RouterOS v7.x** (didukung v7.21+) via REST API.

Server ini dirancang khusus untuk keperluan **monitoring, observabilitas, inspeksi konfigurasi, dan troubleshooting jaringan** secara aman oleh AI assistant (Claude Desktop, Cursor, Antigravity, OpenCode, dll.) tanpa risiko mengubah konfigurasi router, merusak state, atau melakukan tindakan berbahaya (100% Read-Only, hanya metode HTTP GET).

---

## ⚡ Fitur / Tools Read-Only yang Disediakan

| Tool Name | Deskripsi |
| :--- | :--- |
| `mikrotik_get_system_resource` | Cek CPU load, free memory, total memory, uptime, RouterOS version. |
| `mikrotik_get_system_routerboard` | Detail hardware RouterBOARD (model, serial number, firmware version). |
| `mikrotik_get_system_identity` | Cek hostname / identity router. |
| `mikrotik_list_interfaces` | List semua network interface beserta status (running/disabled), MAC, type, dan traffic stats. |
| `mikrotik_get_interface_details` | Detail lengkap satu interface berdasarkan nama atau ID. |
| `mikrotik_get_ip_addresses` | List alamat IP yang terpasang di interface. |
| `mikrotik_get_ip_routes` | Cek routing table (aktif/dinamis/statis). |
| `mikrotik_get_arp_table` | Inspect ARP table (IP to MAC mapping). |
| `mikrotik_get_dhcp_leases` | List client connected di DHCP Server (IP, MAC, Hostname, status, expire). |
| `mikrotik_get_firewall_filter_rules` | List firewall filter rules beserta hit counters (bytes & packets). |
| `mikrotik_get_firewall_nat_rules` | List firewall NAT rules. |
| `mikrotik_get_system_logs` | Tarik system logs terbaru dengan filter topik (system, firewall, error, dll). |

---

## 🚀 Persyaratan di Sisi MikroTik

Pastikan service `www-ssl` (atau `www`) aktif di RouterOS v7:

```routeros
# Cek status service
/ip service print

# Pastikan www-ssl aktif (port 443) atau www (port 80)
/ip service enable www-ssl
```

Pastikan user MikroTik memiliki privilege **`read`** dan **`api`** (atau **`rest-api`** di RouterOS v7). Tidak memerlukan privilege `write`.

---

## ⚙️ Konfigurasi Environment Variables

| Variable | Default | Keterangan |
| :--- | :--- | :--- |
| `MIKROTIK_HOST` | `192.168.88.1` | IP address atau hostname router |
| `MIKROTIK_PORT` | `443` (atau `80`) | Port REST API |
| `MIKROTIK_USERNAME` | `admin` | Username login MikroTik |
| `MIKROTIK_PASSWORD` | `""` (kosong) | Password login MikroTik |
| `MIKROTIK_USE_SSL` | `true` | Gunakan HTTPS (`true`) atau HTTP biasa (`false`) |
| `MIKROTIK_ALLOW_INSECURE_SSL` | `true` | Izinkan self-signed certificate SSL router |
| `MIKROTIK_TIMEOUT` | `15000` | Timeout request dalam milidetik |

Atau bisa juga menggunakan CLI flags:
`--host 192.168.88.1 --user admin --pass secret --port 443 --insecure`

---

## 🛠️ Cara Penggunaan

### 1. Jalankan langsung dengan NPX (Setelah di-publish / Link local)

```bash
# Setup secara local:
npm install
npm run build
npm link

# Run via npx / binary:
MIKROTIK_HOST=192.168.88.1 MIKROTIK_USERNAME=admin MIKROTIK_PASSWORD=secret npx mikrotik-mcp
```

### 2. Jalankan di dalam Docker (Direkomendasikan untuk Workload Isolation)

Build image:
```bash
docker build -t mikrotik-mcp:latest .
```

Jalankan langsung dengan security hardening:
```bash
docker run -i --rm \
  --read-only \
  --cap-drop=ALL \
  --security-opt=no-new-privileges:true \
  -e MIKROTIK_HOST=192.168.88.1 \
  -e MIKROTIK_USERNAME=admin \
  -e MIKROTIK_PASSWORD=secret \
  mikrotik-mcp:latest
```

Atau jika digabungkan dengan **Infisical CLI**:
```bash
infisical run --env=prod -- docker run -i --rm \
  --read-only \
  --cap-drop=ALL \
  --security-opt=no-new-privileges:true \
  -e MIKROTIK_HOST \
  -e MIKROTIK_USERNAME \
  -e MIKROTIK_PASSWORD \
  mikrotik-mcp:latest
```

---

### 3. Konfigurasi di MCP Client (Claude Desktop / Cursor / Antigravity)

Tambahkan konfigurasi berikut ke file konfigurasi MCP (misal: `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "mikrotik": {
      "command": "node",
      "args": ["/home/personal/workspace/mikrotik-mcp/dist/index.js"],
      "env": {
        "MIKROTIK_HOST": "192.168.88.1",
        "MIKROTIK_USERNAME": "admin",
        "MIKROTIK_PASSWORD": "password_kamu",
        "MIKROTIK_USE_SSL": "true",
        "MIKROTIK_ALLOW_INSECURE_SSL": "true"
      }
    }
  }
}
```

Jika sudah publish ke npm:
```json
{
  "mcpServers": {
    "mikrotik": {
      "command": "npx",
      "args": ["-y", "mikrotik-mcp"],
      "env": {
        "MIKROTIK_HOST": "192.168.88.1",
        "MIKROTIK_USERNAME": "admin",
        "MIKROTIK_PASSWORD": "password_kamu"
      }
    }
  }
}
```

---

## 🧑‍💻 Development

```bash
# Install dependencies
npm install

# Run TypeScript build
npm run build

# Run dalam watch mode
npm run dev
```

---

## 📄 License
MIT
