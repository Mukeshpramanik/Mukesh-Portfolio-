/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,

  // For GitHub Pages: set to '/Mukesh-Portfolio' if deploying to
  // https://<username>.github.io/Mukesh-Portfolio/
  // Leave empty string if deploying to https://<username>.github.io/
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',

  images: {
    unoptimized: true,
  },

  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH || '',
  },
};

export default nextConfig;
