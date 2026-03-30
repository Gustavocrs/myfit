/** @type {import('next').NextConfig} */
const nextConfig = {
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
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data:;
      font-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
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
