/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // на Vercel иногда сыпется rushstack-патч — отключаем линт на билде
  eslint: {
    ignoreDuringBuilds: true,
  },

  // если аватары/картинки приходят с внешних доменов
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
