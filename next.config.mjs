/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_AUTH_EMAIL: process.env.AUTH_EMAIL,
    NEXT_PUBLIC_AUTH_PASSWORD: process.env.AUTH_PASSWORD,
    NEXT_PUBLIC_AUTH_NAME: process.env.AUTH_NAME,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
