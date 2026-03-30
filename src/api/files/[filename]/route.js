import {NextResponse} from "next/server";
import path from "path";
import {readFile} from "fs/promises";

/**
 * API Route para servir arquivos do diretório de uploads
 * Utilizado para contornar o cache de arquivos estáticos do Next.js em modo standalone
 *
 * Uso: GET /api/files/[filename]
 * Exemplo: /api/files/IMG-1701234567890.jpg
 */
export async function GET(request, {params}) {
  try {
    const {filename} = await params;

    if (!filename) {
      return NextResponse.json(
        {error: "Nenhum arquivo especificado"},
        {status: 400},
      );
    }

    // Validar nome do arquivo (evitar path traversal)
    if (
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return NextResponse.json(
        {error: "Nome de arquivo inválido"},
        {status: 400},
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, filename);

    // Garantir que o arquivo está dentro do diretório de uploads
    if (!filePath.startsWith(uploadDir)) {
      return NextResponse.json({error: "Acesso negado"}, {status: 403});
    }

    try {
      const fileBuffer = await readFile(filePath);

      // Detectar tipo de conteúdo baseado na extensão
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
        ".pdf": "application/pdf",
        ".txt": "text/plain",
        ".json": "application/json",
      };

      const contentType = mimeTypes[ext] || "application/octet-stream";

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Disposition": `inline; filename="${filename}"`,
        },
      });
    } catch (error) {
      if (error.code === "ENOENT") {
        return NextResponse.json(
          {error: "Arquivo não encontrado"},
          {status: 404},
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Erro ao servir arquivo:", error);
    return NextResponse.json(
      {error: "Erro interno no servidor"},
      {status: 500},
    );
  }
}
