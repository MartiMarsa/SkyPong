export const SERVER_CONNECTION = {
  HOST:
    typeof window !== "undefined"
      ? window.location.hostname || process.env.NEXT_PUBLIC_GAME_SERVER_HOST || "localhost"
      : process.env.NEXT_PUBLIC_GAME_SERVER_HOST || "localhost",
  PORT: parseInt(process.env.NEXT_PUBLIC_GAME_SERVER_PORT || "2567", 10),
  PROTOCOL:
    (process.env.NEXT_PUBLIC_GAME_SERVER_PROTOCOL as "ws" | "wss" | undefined) ||
    (typeof window !== "undefined" && window.location.protocol === "https:" ? "wss" : "ws"),

  USE_NGINX_PROXY: process.env.NEXT_PUBLIC_USE_NGINX_WS_PROXY !== "false",


  get WS_URL() {
    // Check if we should use nginx proxy via environment variable
    // In production (Docker), set NEXT_PUBLIC_USE_NGINX_WS_PROXY=true
    // In local development, leave unset or set to 'false'
    const useNginxProxy = typeof window !== 'undefined' 
      ? process.env.NEXT_PUBLIC_USE_NGINX_WS_PROXY === 'true'
      : false;
    
    if (useNginxProxy && typeof window !== 'undefined') {
      // Production/Docker: use nginx /ws/ proxy
      const url = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws/`;
      console.log("[ServerConfig] Using nginx proxy (same-origin):", url);
      return url;
    }

    const protocol = this.PROTOCOL;
    const host = this.HOST;
    const port = this.PORT;
    let url: string;
    if (port === 443 || port === 80) {
      url = `${protocol}://${host}/`;
    } else {
      url = `${protocol}://${host}:${port}/`;
    }
    return url;
  },

  ROOMS: {
    GAME_ROOM: "game_room",
    AI_GAME_ROOM: "ai_game_room",
    PVP_ROOM: "pvp_room",
  },
} as const;
