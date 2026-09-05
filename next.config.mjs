/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { formats: ['image/avif','image/webp'] },
  outputFileTracingIncludes: {
    '/*': ['./public/downloads/*.md'],
  },
};
export default nextConfig;
