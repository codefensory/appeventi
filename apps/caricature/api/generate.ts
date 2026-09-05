import OpenAI, { toFile } from "openai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export const maxDuration = 60;

const prompts = [
  "A very funny black and white caricature with exaggerated features. Identify the flaws and make them even bigger. Make it very funny. White and gray gradient background. Don't make it so ugly, make it pretty but very funny. Digital art. Portrait photo type",
  "A very funny black and white caricature with exaggerated features. Identify the flaws and make them even bigger. Make it very funny. White and gray gradient background. Don't make it so ugly, make it pretty but very funny. Digital art Draw only from the waist up.",
];

let openai: OpenAI | undefined;

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta OPENAI_API_KEY");
  }

  return (openai ??= new OpenAI({ apiKey }));
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
    const imageDataUrl = body.image;

    if (typeof imageDataUrl !== "string") {
      return res.status(400).json({ error: "Falta la imagen" });
    }

    const match = imageDataUrl.match(
      /^data:(image\/(?:png|jpe?g|webp));base64,([A-Za-z0-9+/=\s]+)$/i,
    );

    if (!match) {
      return res.status(400).json({ error: "Formato de imagen inválido" });
    }

    const mimeType = match[1].toLowerCase() === "image/jpg"
      ? "image/jpeg"
      : match[1].toLowerCase();
    const imageBytes = Buffer.from(match[2].replace(/\s/g, ""), "base64");

    // Mantiene la petición dentro del límite de Vercel y evita abusos obvios.
    if (imageBytes.length > 4_000_000) {
      return res.status(413).json({ error: "La imagen es demasiado grande" });
    }

    const fileName = mimeType === "image/png" ? "captured_image.png" : "captured_image.jpg";
    const client = getOpenAI();

    const results = await Promise.all(
      prompts.map(async (prompt) => {
        const imageFile = await toFile(imageBytes, fileName, { type: mimeType });
        return client.images.edit({
          model: "gpt-image-1",
          image: imageFile,
          prompt,
          quality: "medium",
          size: "1024x1024",
          output_format: "jpeg",
          output_compression: 85,
        });
      }),
    );

    const images = results.map((result) => result.data?.[0]?.b64_json);

    if (images.some((image) => !image)) {
      throw new Error("OpenAI no devolvió las imágenes");
    }

    return res.status(200).json({
      images: images.map((image) => `data:image/jpeg;base64,${image}`),
    });
  } catch (error) {
    console.error("Error generando imágenes:", error);
    return res.status(500).json({ error: "No se pudieron generar las imágenes" });
  }
}
