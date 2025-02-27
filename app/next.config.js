/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5328/api/:path*", // Proxy to Flask
      },
    ];
  },
};

module.exports = nextConfig;
