import { MikroTikConfig } from "./types.js";

export function loadConfig(): MikroTikConfig {
  // Try loading .env file if it exists (Node 20+)
  try {
    if (typeof (process as any).loadEnvFile === "function") {
      (process as any).loadEnvFile();
    }
  } catch {
    // Ignore if .env doesn't exist
  }

  const args = process.argv.slice(2);
  const getArg = (names: string[]): string | undefined => {
    for (let i = 0; i < args.length; i++) {
      for (const name of names) {
        if (args[i] === name && i + 1 < args.length) {
          return args[i + 1];
        }
        if (args[i].startsWith(`${name}=`)) {
          return args[i].substring(name.length + 1);
        }
      }
    }
    return undefined;
  };

  const hasArg = (names: string[]): boolean => {
    return args.some((arg) => names.includes(arg) || names.some((n) => arg.startsWith(`${n}=`)));
  };

  const host =
    getArg(["--host", "-h"]) ||
    process.env.MIKROTIK_HOST ||
    "192.168.88.1";

  const useSsl = hasArg(["--http"])
    ? false
    : process.env.MIKROTIK_USE_SSL !== undefined
    ? process.env.MIKROTIK_USE_SSL !== "false" && process.env.MIKROTIK_USE_SSL !== "0"
    : true;

  const defaultPort = useSsl ? 443 : 80;
  const portStr = getArg(["--port", "-p"]) || process.env.MIKROTIK_PORT;
  const port = portStr ? parseInt(portStr, 10) : defaultPort;

  const username =
    getArg(["--user", "-u"]) ||
    process.env.MIKROTIK_USERNAME ||
    process.env.MIKROTIK_USER ||
    "admin";

  const password =
    getArg(["--pass", "-P"]) ||
    process.env.MIKROTIK_PASSWORD ||
    process.env.MIKROTIK_PASS ||
    "";

  // By default, MikroTik routers use self-signed certificates.
  // Allow insecure SSL unless explicitly set to reject unauthorized.
  const allowInsecure =
    hasArg(["--insecure", "-k"]) ||
    process.env.MIKROTIK_ALLOW_INSECURE_SSL === "true" ||
    process.env.MIKROTIK_ALLOW_INSECURE_SSL === "1" ||
    process.env.MIKROTIK_REJECT_UNAUTHORIZED === "false" ||
    process.env.MIKROTIK_REJECT_UNAUTHORIZED === "0" ||
    true; // Default to true because local routers usually don't have public CA certs

  const rejectUnauthorized = !allowInsecure;

  const timeoutStr = getArg(["--timeout"]) || process.env.MIKROTIK_TIMEOUT;
  const timeoutMs = timeoutStr ? parseInt(timeoutStr, 10) : 15000;

  return {
    host,
    port,
    username,
    password,
    useSsl,
    rejectUnauthorized,
    timeoutMs,
  };
}
