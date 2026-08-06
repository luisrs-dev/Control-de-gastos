import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: {
    remotePatterns: [
      {
        // Vercel Blob storage
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        // Fallback for any CDN (adjust as needed)
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
