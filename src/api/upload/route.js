import {NextResponse} from "next/server";
import {writeFile} from "fs/promises";
import path from "path";

export async function POST(request) {
  try {
    const data = await request.formData();
    const files = data.getAll("files"); // 'files' é a chave do array de arquivos

    if (!files || files.length === 0) {
      return NextResponse.json(
        {success: false, message: "Nenhum arquivo recebido."},
        {status: 400},
      );
    }

    const uploadedFileUrls = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Cria um nome de arquivo único para evitar colisões
      const filename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
      const uploadDir = path.join(process.cwd(), "public/uploads");
      const filePath = path.join(uploadDir, filename);

      // Escreve o arquivo no servidor
      await writeFile(filePath, buffer);

      // Armazena a URL pública para retornar ao cliente
      uploadedFileUrls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({success: true, urls: uploadedFileUrls});
  } catch (error) {
    console.error("Erro no upload de arquivos:", error);
    return NextResponse.json({success: false, message: "Falha no upload."});
  }
}
