/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Compiler para otimizações automáticas
  reactCompiler: true,

  // Otimizações de imagem
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Gzip compression
  compress: true,

  // Production source maps (desabilitar se não precisar para debug)
  productionBrowserSourceMaps: false,

  // Poweredby header
  poweredByHeader: false,

  // Versioning de assets
  generateEtags: true,

  // Trailing slash
  trailingSlash: false,

  // Headers customizados
  async headers() {
    return [
      {
        source: "/api/files/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // Rewrites para proxy de uploads
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/uploads/:path*",
          destination: "/api/files/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
