import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack fallback for production builds
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  // Enhanced image optimization configuration
  images: {
    // Remote image patterns (Supabase storage)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fuecadlwggbsrwkvwqkd.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Image formats to optimize (AVIF is newer and better, WebP is widely supported)
    formats: ["image/avif", "image/webp"],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum quality for optimized images (1-100, default is 75)
    minimumCacheTTL: 60, // Cache optimized images for 60 seconds
    // Enable image optimization
    dangerouslyAllowSVG: true, // Allow SVG optimization (for scholarblock.svg)
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Content Disposition for SVGs
    contentDispositionType: "attachment",
  },
};

export default nextConfig;
