/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//
const baseUrl = process.env.REACT_APP_BASE_URL;
console.log('process.env', process.env);
//
const nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')], //我这里是不行哈
  },
  rewrites() {
    return [
      // 当请求路径符合 /api 时，将请求转发到代理服务器
      {
        source: '/api/:path*', //':path*'通配符
        destination: `${baseUrl}/api/:path*`,
      },
    ];
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
export default nextConfig;
