/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    loader: 'custom',
    loaderFile: './image-loader.js',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**', 
      },
      {
        protocol: 'http', 
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      // 1. Pattern for Convex Subdomain Traffic (Fallback/Direct)
      {
        protocol: 'https',
        hostname: 'brave-dinosaur-650.convex.cloud',
        pathname: '/api/storage/**',
      },
      // 2. Pattern for your Kazakhstan Proxy Image Endpoint (Crucial for Production)
      {
        protocol: 'https',
        hostname: 'proxy.bereg-go.ru',
        pathname: '/event-images/**', // <--- Matches your loader output
      },
      {
        protocol: 'https',
        hostname: 'proxy.bereg-go.ru',
        pathname: '/unsplash/**', // 👈 MAKE SURE THIS IS PRESENT
      },
    ],
    unoptimized: false
  },
  staticPageGenerationTimeout: 120, 
}

export default nextConfig;
