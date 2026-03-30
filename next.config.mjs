/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  /*
   * Se sua aplicação é servida a partir de um sub-caminho, você precisa configurar o `basePath`.
   * Por exemplo, se seu aplicativo estiver em https://myfit.systechdev.com.br/myfit,
   * você descomentaria a seguinte linha:
   *
   * basePath: '/myfit',
   */

  // Adicione a configuração de headers para corrigir problemas de Content Security Policy
  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https://firebasestorage.googleapis.com https://lh3.googleusercontent.com;
      font-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      frame-src 'self' https://myfit-ad4cc.firebaseapp.com;
      connect-src 'self' *.google.com *.googleapis.com *.firebaseapp.com *.firebaseio.com;
    `
      .replace(/\s{2,}/g, " ")
      .trim();

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
