const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/flask-api/:path*',
        destination: 'http://localhost:5000/:path*',
      },
    ];
  },
};

export default nextConfig;
