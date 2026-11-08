# mikrotik-mcp

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![RouterOS](https://img.shields.io/badge/RouterOS-v7.x%20(v7.21%2B)-004d80?logo=mikrotik&logoColor=white)](https://mikrotik.com/)
[![MCP](https://img.shields.io/badge/Protocol-Model%20Context%20Protocol-8A2BE2)](https://modelcontextprotocol.io/)
[![Security](https://img.shields.io/badge/Security-Strictly%20Read--Only-green.svg)](#-zero-mutation-security-guarantee)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

**Secure, Strictly Read-Only Model Context Protocol (MCP) Server for MikroTik RouterOS v7 REST API.**

[Features](#-features--available-tools) • [RouterOS Requirements](#-mikrotik-routeros-setup) • [Configuration](#-configuration) • [Client Setup](#-client-integration) • [Docker](#-docker-deployment) • [Security](#-zero-mutation-security-guarantee)

</div>

---

## 📌 Overview

`mikrotik-mcp` is an official [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that seamlessly connects AI assistants (such as **Claude Desktop**, **Cursor**, **Antigravity**, **Cline**, or other MCP-compatible clients) to **MikroTik RouterOS v7** devices via the native REST API.

Engineered specifically for **network observability, performance monitoring, diagnostics, and configuration inspection**, this server follows a strict **zero-mutation security model** to eliminate any risk of accidental router modifications.

### 🛡️ Zero-Mutation Security Guarantee
1. **100% Read-Only:** All exposed tools perform read-only inspection operations (HTTP `GET` only).
2. **Hardened HTTP Client:** The internal HTTP client enforces `GET` requests exclusively at the source-code level. Methods for `POST`, `PUT`, `PATCH`, and `DELETE` do not exist in the client.
3. **No Arbitrary Execution:** No arbitrary REST endpoints, CLI command execution, terminal sessions, or script evaluations are exposed.
4. **Least-Privilege Friendly:** Requires only `read` and `rest-api` policies on the router. It never requires `write`, `policy`, `password`, or `sensitive` permissions.

---

## ⚡ Features & Available Tools

All tools return structured, LLM-friendly JSON output:

| Tool Name | Category | Parameters | Description |
| :--- | :--- | :--- | :--- |
| `mikrotik_get_system_resource` | **System** | `-` | Retrieves hardware and OS resources: CPU load, free/total RAM, storage, uptime, board name, and RouterOS version. |
| `mikrotik_get_system_routerboard` | **System** | `-` | Fetches RouterBOARD hardware details: model, serial number, current firmware, and factory firmware. |
| `mikrotik_get_system_identity` | **System** | `-` | Retrieves the router's identity / hostname. |
| `mikrotik_list_interfaces` | **Interfaces** | `type` *(optional)* | Lists network interfaces with their operational status (running/disabled), MAC address, MTU, and Tx/Rx traffic stats. Filterable by type (e.g. `ether`, `bridge`, `vlan`). |
| `mikrotik_get_interface_details` | **Interfaces** | `nameOrId` *(required)* | Returns complete configuration and live stats for a specific interface by name (`ether1`) or ID (`*1`). |
| `mikrotik_get_ip_addresses` | **IP & Routing** | `interfaceName` *(optional)* | Lists all configured IP addresses, subnet masks, and their assigned interfaces. |
| `mikrotik_get_ip_routes` | **IP & Routing** | `activeOnly` *(optional)* | Retrieves routing table entries (static, connected, and dynamic routes). |
| `mikrotik_get_arp_table` | **IP & Routing** | `interfaceName`, `ipAddress` *(optional)* | Inspects the ARP table (IP-to-MAC address mapping). |
| `mikrotik_get_dhcp_leases` | **DHCP** | `hostname`, `status` *(optional)* | Lists active DHCP server leases: assigned IP, client MAC, host-name, status (`bound`, `waiting`), and lease expiration time. |
| `mikrotik_get_firewall_filter_rules` | **Firewall** | `chain` *(optional)* | Lists firewall filter rules with hit counters (packets and bytes) and rule comments. Filterable by chain (`input`, `forward`, `output`). |
| `mikrotik_get_firewall_nat_rules` | **Firewall** | `chain` *(optional)* | Lists firewall NAT rules (masquerade, dstnat, srcnat, and port forwardings). |
| `mikrotik_get_system_logs` | **Logs** | `limit`, `topic` *(optional)* | Fetches recent router system log entries with optional topic filtering (e.g. `error`, `firewall`, `system`, `warning`). |

---

## 🚀 MikroTik RouterOS Setup

### 1. Enable the REST API Service
Ensure the `www-ssl` service (HTTPS - port 443) or `www` service (HTTP - port 80) is enabled on your RouterOS v7 device:

```routeros
# Check service status
/ip service print

# Enable www-ssl (strongly recommended)
/ip service enable www-ssl
```

### 2. Create a Dedicated Read-Only User (Best Practice)
Create a dedicated group and user restricted to read-only API access:

```routeros
# 1. Create a group with minimal policies: 'read' and 'rest-api' (or 'api')
/user group add name=mcp-readonly policy=read,api,web,rest-api

# 2. Create a dedicated user for the MCP server
/user add name=mcp-agent group=mcp-readonly password="ReplaceWithStrongPassword123!"
```

---

## ⚙️ Configuration

The server can be configured via Environment Variables, CLI arguments, or a `.env` file (automatically loaded in Node.js 20+):

| Variable | CLI Flag | Default | Description |
| :--- | :--- | :--- | :--- |
| `MIKROTIK_HOST` | `--host` | `192.168.88.1` | IP address or hostname of the MikroTik router |
| `MIKROTIK_PORT` | `--port` | `443` *(if SSL)* / `80` | RouterOS REST API port |
| `MIKROTIK_USERNAME` | `--user` / `-u` | `admin` | MikroTik login username |
| `MIKROTIK_PASSWORD` | `--pass` / `-p` | `""` | MikroTik login password |
| `MIKROTIK_USE_SSL` | `--ssl` / `--no-ssl` | `true` | Use HTTPS (`true`) or plain HTTP (`false`) |
| `MIKROTIK_ALLOW_INSECURE_SSL` | `--insecure` | `true` | Allow self-signed internal SSL certificates |
| `MIKROTIK_TIMEOUT` | `--timeout` | `15000` | Request timeout in milliseconds |

---

## 🧩 Client Integration

### 1. Claude Desktop
Add the server entry to your Claude Desktop configuration file:
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
        "MIKROTIK_PASSWORD": "ReplaceWithStrongPassword123!",
        "MIKROTIK_USE_SSL": "true",
        "MIKROTIK_ALLOW_INSECURE_SSL": "true"
      }
    }
  }
}
```

### 2. Cursor / Antigravity / OpenCode / Cline
Add the server block to your MCP client configuration:

```json
{
  "mcpServers": {
    "mikrotik": {
      "command": "npx",
      "args": ["-y", "@reyhanfahlevi/mikrotik-mcp"],
      "env": {
        "MIKROTIK_HOST": "192.168.88.1",
        "MIKROTIK_USERNAME": "mcp-agent",
        "MIKROTIK_PASSWORD": "ReplaceWithStrongPassword123!"
      }
    }
  }
}
```

> **Note:** If running directly from a local clone before publishing to npm, you can point directly to the local folder:
> ```json
> "command": "npx",
> "args": ["-y", "/absolute/path/to/mikrotik-mcp"]
> ```

---

## 🐳 Docker Deployment

The image utilizes a minimal, multi-stage Alpine build without development dependencies and runs under an unprivileged `node` user.

### Build the Image
```bash
docker build -t mikrotik-mcp:latest .
```

### Run with Security Hardening
```bash
docker run -i --rm \
  --read-only \
  --cap-drop=ALL \
  --security-opt=no-new-privileges:true \
  -e MIKROTIK_HOST="192.168.88.1" \
  -e MIKROTIK_USERNAME="mcp-agent" \
  -e MIKROTIK_PASSWORD="ReplaceWithStrongPassword123!" \
  mikrotik-mcp:latest
```

### Using Docker Compose
Copy [`.env.example`](.env.example) to `.env`, adjust your credentials, and start the service:
```bash
docker compose run --rm mikrotik-mcp
```

---

## 💻 Local Development

```bash
# 1. Clone repository
git clone https://github.com/reyhanfahlevi/mikrotik-mcp.git
cd mikrotik-mcp

# 2. Install dependencies
npm install

# 3. Start development server with hot-reload (tsx)
npm run dev

# 4. Build TypeScript to production JavaScript
npm run build
```

---

## 📄 License & Maintainer

- **Author:** [Reyhan Fahlevi](https://github.com/reyhanfahlevi)
- **Repository:** [https://github.com/reyhanfahlevi/mikrotik-mcp](https://github.com/reyhanfahlevi/mikrotik-mcp)
- **License:** [MIT License](LICENSE)
