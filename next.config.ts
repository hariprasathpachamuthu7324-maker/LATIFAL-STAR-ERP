import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "true" || !!process.env.CF_PAGES;

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export" } : {}),
  typescript: { ignoreBuildErrors: true },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
