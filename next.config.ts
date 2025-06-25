import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // เพิ่ม configuration สำหรับ environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // ถ้าใช้ HTTPS ใน production อาจต้องเพิ่ม
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
  reactStrictMode: true,
  images: {
    domains: [
      "api.omise.co",
      "localhost",
      "omise.co",
      "cdn.omise.co",
      "images.ctfassets.net",
      "res.cloudinary.com",
      "lh3.googleusercontent.com",
      "avatars.githubusercontent.com",
      "www.gravatar.com",
      "cdn.pixabay.com",
      "cdn.shopify.com",
      "images.unsplash.com",
      "i.imgur.com",
    ],
  },
};

export default nextConfig;
