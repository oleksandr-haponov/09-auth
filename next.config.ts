import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Разрешаем аватары с любого https-домена и локальную разработку
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
};

export default nextConfig;
