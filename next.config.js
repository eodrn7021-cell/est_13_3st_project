/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.pollinations.ai",
      },
      {
        protocol: "https",
        hostname: "lkkxpciwrtlnpoptrcms.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;
