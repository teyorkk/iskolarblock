import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack fallback for production builds
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  // Allow images from Supabase storage
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fuecadlwggbsrwkvwqkd.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
