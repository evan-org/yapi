import type { NextConfig } from "next";

/**
 * Next.js 配置：开发/生产均将 /api 代理到 Hono 后端
 */
const apiTarget = process.env.YAPI_API_URL || "http://127.0.0.1:3001";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** 与 Hono 同域部署时可设 basePath */
  basePath: process.env.NEXT_BASE_PATH || "",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
