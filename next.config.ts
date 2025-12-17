import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "sutlq5p46mcdakbr.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
    qualities: [100],
  },
  webpack: (config, { isServer }) => {
    // Excluir módulos nativos de Node.js del bundle del cliente
    if (!isServer) {
      config.externals.push('tls', 'net', 'dns');
    }
    return config;
  },
};
export default nextConfig;
