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
      // ADD THIS PATTERN FOR CONVEX STORAGE FILES
      {
        protocol: 'https',
        // Looks for your deployment URL hostname dynamically from your ENV file
        // e.g. "quiet-wolf-123.convex.cloud" or "your-project.convex.site"
        hostname: process.env.NEXT_PUBLIC_CONVEX_URL
          ? process.env.NEXT_PUBLIC_CONVEX_URL.replace('https://', '')
          : '*.convex.cloud', 
        pathname: '/api/storage/**',
      },
    ],
    // unoptimized: process.env.NODE_ENV === 'development', 
    unoptimized: false
  },
  staticPageGenerationTimeout: 120, 
}

export default nextConfig;
