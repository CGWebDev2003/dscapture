import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const remotePatterns =
  supabaseUrl && supabaseUrl.length > 0
    ? [
        {
          protocol: "https",
          hostname: new URL(supabaseUrl).hostname,
          pathname: "/storage/v1/object/public/**",
        },
      ]
    : [];

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
