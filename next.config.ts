import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js blocks cross-origin requests to dev-only assets (JS bundles,
  // the next/image optimizer, RSC payloads) by default — this is what broke
  // playback and covers when opening the site from a phone via the LAN IP
  // instead of localhost. Add every LAN address the dev server might be
  // reached at.
  // CIDR ranges aren't supported here — only exact hosts or subdomain
  // wildcards — so list the LAN IP explicitly. If your machine's IP changes
  // (e.g. DHCP), update this to match.
  allowedDevOrigins: ["192.168.100.38"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
