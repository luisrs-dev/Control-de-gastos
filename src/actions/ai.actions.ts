"use server";

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import type { AiExtractedData } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    merchant: {
      type: SchemaType.STRING,
      description: "Nombre del comercio, tienda o proveedor",
    },
    amount: {
      type: SchemaType.NUMBER,
      description: "Monto total del comprobante en números",
    },
    date: {
      type: SchemaType.STRING,
      description: "Fecha del comprobante en formato ISO 8601 (YYYY-MM-DD)",
    },
    expenseType: {
      type: SchemaType.STRING,
      enum: ["SUPERMARKET", "RECEIPT", "INVOICE", "OTHER"],
      description:
        "Tipo de comprobante: SUPERMARKET para supermercados, RECEIPT para boletas, INVOICE para facturas, OTHER para otros",
    },
  },
  required: ["merchant", "amount", "date", "expenseType"],
};

export async function analyzeExpenseImage(
  imageUrl: string
): Promise<{ data?: AiExtractedData; error?: string }> {
  const session = await auth();
  if (!session) return { error: "No autorizado" };

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as any,
      },
    });

    // Fetch the image and convert to base64
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) throw new Error("Could not fetch image");

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

    const prompt = `Analiza esta imagen de un comprobante de compra (boleta, factura, ticket o voucher) y extrae la siguiente información:
    
1. Nombre del comercio o proveedor (merchant)
2. Monto total pagado (amount) - solo el número, sin símbolo de moneda
3. Fecha de la transacción (date) - en formato YYYY-MM-DD
4. Tipo de comprobante (expenseType): 
   - SUPERMARKET: si es de un supermercado
   - RECEIPT: si es una boleta
   - INVOICE: si es una factura  
   - OTHER: si es otro tipo

Si no puedes leer algún campo con certeza, usa valores razonables basándote en el contexto visible.
Para el monto, si hay varios valores, usa el total final.
Para la fecha, si no está clara, usa la fecha de hoy.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType as "image/jpeg" | "image/png" | "image/webp",
          data: base64Image,
        },
      },
      { text: prompt },
    ]);

    const responseText = result.response.text();
    const parsed = JSON.parse(responseText) as AiExtractedData;

    return { data: parsed };
  } catch (error) {
    console.error("AI analysis error:", error);
    return { error: "No se pudo analizar la imagen. Por favor, completa los datos manualmente." };
  }
}
