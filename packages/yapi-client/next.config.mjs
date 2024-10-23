/** @type {import('next').NextConfig} */
import webpack from "webpack";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//
const mode = process.env.BUILD_MODE ?? "standalone";
console.log("[Next] build mode:", mode);
const disableChunk = !!process.env.DISABLE_CHUNK || mode === "export";
console.log("[Next] build with chunk:", !disableChunk);
//
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    if (disableChunk) {
      config.plugins.push(
        new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
      );
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "./src"),
      "@theme": path.resolve(__dirname, "./theme"),
    }
    // console.log("config.resolve.alias:", config.resolve.alias)
    config.resolve.fallback = {
      child_process: false,
    };
    return config;
  },
  output: mode,
  images: {
    unoptimized: mode === "export",
  },
  experimental: {
    forceSwcTransforms: true,
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')], //我这里是不行哈
  },
  redirects() {
    return [
      {
        source: '/other', //默认地址
        destination: '/other/about', //重定向地址
        permanent: true,
      },
      // {
      //   source: '/',
      //   destination: '/login',
      //   permanent: true,
      // },
      {
        source: '/home/:slug', //:slug不写也是一样，替换指定路由
        destination: '/other/:slug',
        permanent: true,
      },
    ];
  },
  reactStrictMode: false, //去掉严格模式，例如 antd这个模式导入使用就会报红，但不影响使用
};
const CorsHeaders = [
  { key: "Access-Control-Allow-Credentials", value: "true" },
  { key: "Access-Control-Allow-Origin", value: "*" },
  {
    key: "Access-Control-Allow-Methods",
    value: "*",
  },
  {
    key: "Access-Control-Allow-Headers",
    value: "*",
  },
  {
    key: "Access-Control-Max-Age",
    value: "86400",
  },
];
if (mode !== "export") {
  nextConfig.headers = async() => {
    return [
      {
        source: "/api/:path*",
        headers: CorsHeaders,
      },
    ];
  };
  nextConfig.rewrites = async() => {
    const ret = [
      {
        // https://{resource_name}.openai.azure.com/openai/deployments/{deploy_name}/chat/completions
        source: "/api/proxy/azure/:resource_name/deployments/:deploy_name/:path*",
        destination: "https://:resource_name.openai.azure.com/openai/deployments/:deploy_name/:path*",
      },
      {
        source: "/api/proxy/google/:path*",
        destination: "https://generativelanguage.googleapis.com/:path*",
      },
      {
        source: "/api/proxy/openai/:path*",
        destination: "https://api.openai.com/:path*",
      },
      {
        source: "/api/proxy/anthropic/:path*",
        destination: "https://api.anthropic.com/:path*",
      },
      {
        source: "/google-fonts/:path*",
        destination: "https://fonts.googleapis.com/:path*",
      },
      {
        source: "/sharegpt",
        destination: "https://sharegpt.com/api/conversations",
      },
    ];
    return {
      beforeFiles: ret,
      fallback: [
        {
          source: "/api/:path*",
          destination: `http://127.0.0.1:3030/:path*`,
        },
      ]
    };
  };
}
export default nextConfig;
