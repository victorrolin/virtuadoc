import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  serverExternalPackages: ["mercadopago"],
  experimental: {
    serverActions: {
      allowedOrigins: ["virtuadoc.automatech.tech", "localhost:3000"]
    }
  },
  async rewrites() {
    return [
      // Intercepta /r/qualquer-coisa.pdf e redireciona para /r/qualquer-coisa
      // Isso impede o Next.js de tratar .pdf como arquivo estático
      {
        source: '/r/:id.pdf',
        destination: '/r/:id',
      },
    ]
  },
};

export default nextConfig;
