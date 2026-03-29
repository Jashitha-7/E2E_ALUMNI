const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

export const getApiBase = () => {
  const metaEnv = (import.meta as { env?: { VITE_API_URL?: string } }).env;
  const configured = metaEnv?.VITE_API_URL?.trim();

  if (configured) {
    return trimTrailingSlashes(configured);
  }

  if (typeof window === "undefined") {
    return "/api/v1";
  }

  const { hostname, port, protocol } = window.location;
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";

  if (protocol === "file:") {
    return "http://localhost:5000/api/v1";
  }

  if (isLocalHost) {
    const proxyPorts = new Set(["3000", "5173", "4173"]);
    if (proxyPorts.has(port)) {
      return "/api/v1";
    }

    return "http://localhost:5000/api/v1";
  }

  return "/api/v1";
};