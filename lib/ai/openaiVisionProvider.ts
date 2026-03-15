import OpenAI from "openai";
import type { VisionProvider } from "./providers";

let cachedClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for scalp image analysis.");
  }
  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}

function toDataUrl(bytes: Uint8Array, mimeType: string): string {
  return `data:${mimeType};base64,${Buffer.from(bytes).toString("base64")}`;
}

export class OpenAIVisionProvider implements VisionProvider {
  async analyzeImage(params: {
    imageBytes: Uint8Array;
    mimeType: string;
    prompt: string;
    jsonSchema?: {
      name: string;
      schema: Record<string, unknown>;
    };
  }): Promise<{ text: string; raw?: unknown }> {
    const client = getOpenAIClient();
    const model = process.env.OPENAI_VISION_MODEL ?? "gpt-4.1-mini";
    const response = await client.chat.completions.create({
      model,
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: params.prompt },
            {
              type: "image_url",
              image_url: {
                url: toDataUrl(params.imageBytes, params.mimeType),
              },
            },
          ],
        },
      ],
      response_format: params.jsonSchema
        ? {
            type: "json_schema",
            json_schema: {
              name: params.jsonSchema.name,
              strict: true,
              schema: params.jsonSchema.schema,
            },
          }
        : { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (!text) {
      throw new Error("OpenAI returned an empty image analysis response.");
    }
    return { text, raw: response };
  }
}

export function getDefaultVisionProvider(): VisionProvider {
  return new OpenAIVisionProvider();
}
