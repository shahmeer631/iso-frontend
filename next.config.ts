import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./next-intl.config.ts");

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mygreendot.co.in",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "thumbs.dreamstime.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s3.eu-north-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.citypng.com",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
