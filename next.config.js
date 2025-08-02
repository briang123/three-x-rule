const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/app': path.resolve(__dirname, './app'),
      '@/docs': path.resolve(__dirname, './docs'),
      '@/test': path.resolve(__dirname, './test'),
      '@/examples': path.resolve(__dirname, './examples'),
      '@/scripts': path.resolve(__dirname, './scripts'),
    };
    return config;
  },
};

module.exports = nextConfig;
