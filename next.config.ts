import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ["discord.js", "@discordjs/ws"],
};

export default nextConfig;
