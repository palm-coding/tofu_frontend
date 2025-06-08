import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
