/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        // port: '', //
        pathname: '/**', // 
      },
        {
        protocol: 'http', // Adds support for http
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
     unoptimized: process.env.NODE_ENV === 'development', //Чтобы лок сервер не тормозил на картинках, в next.config.js можно временно (или для dev-режима) прописать:
  },
  staticPageGenerationTimeout: 120, // Increase to 120 seconds
  
}

export default nextConfig;
 