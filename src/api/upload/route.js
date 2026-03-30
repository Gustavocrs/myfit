import {NextResponse} from "next/server";
import path from "path";
import {writeFile, mkdir, unlink, readdir} from "fs/promises";

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get("file");

    if (!file) {
      return NextResponse.json(
        {error: "Nenhum arquivo enviado"},
        {status: 400},
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Salvar em public/uploads (servido estaticamente pelo Next.js/Nginx)
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Garantir que o diretório existe
    await mkdir(uploadDir, {recursive: true});

    // Nome único para evitar colisão
    const timestamp = Date.now();
    const originalName = file.name || "arquivo";
    const ext = path.extname(originalName).toLowerCase() || ".bin";

    let prefix = "FILE";
    if (
      [".png", ".jpg", ".jpeg", ".bmp", ".gif", ".webp", ".svg"].includes(ext)
    ) {
      prefix = "IMG";
    }

    const fileName = `${prefix}-${timestamp}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    // Usa a rota de API dedicada para contornar o cache de arquivos estáticos do Next.js standalone
    const url = `/api/files/${fileName}`;

    return NextResponse.json({
      fileName,
      url,
      fileUrl: url,
      downloadURL: url,
    });
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    return NextResponse.json(
      {error: "Erro interno no servidor"},
      {status: 500},
    );
  }
}

export async function DELETE(request) {
  try {
    const {searchParams} = new URL(request.url);
    const fileName = searchParams.get("file");

    if (!fileName) {
      return NextResponse.json(
        {error: "Nenhum arquivo especificado"},
        {status: 400},
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, fileName);

    // Evitar path traversal
    if (!filePath.startsWith(uploadDir)) {
      return NextResponse.json({error: "Caminho inválido"}, {status: 400});
    }

    try {
      await unlink(filePath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    return NextResponse.json({success: true});
  } catch (error) {
    console.error("Erro ao deletar arquivo:", error);
    return NextResponse.json(
      {error: "Erro interno no servidor"},
      {status: 500},
    );
  }
}

export async function GET(request) {
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    try {
      await mkdir(uploadDir, {recursive: true});
    } catch (e) {}

    const files = await readdir(uploadDir);
    return NextResponse.json({files});
  } catch (error) {
    console.error("Erro ao listar arquivos:", error);
    return NextResponse.json(
      {error: "Erro interno no servidor"},
      {status: 500},
    );
  }
}
