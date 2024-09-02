/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // distDir: 'build', // Custom output directory

  images: {
    domains: ['localhost', 'trueconfess.com', 'trueconfess.vercel.app'], // Add your domains here
  },
};

export default nextConfig;
