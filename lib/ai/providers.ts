/**
 * Pluggable AI provider interfaces for extraction.
 * Implement VisionProvider and DocumentExtractor for your chosen AI provider.
 */

/** Vision provider: image analysis (e.g. OpenAI Vision, Anthropic, etc.) */
export interface VisionProvider {
  analyzeImage(params: {
    imageBytes: Uint8Array;
    mimeType: string;
    prompt: string;
  }): Promise<{ text: string; raw?: unknown }>;
}

/** Document extractor: blood test PDF/image text extraction */
export interface DocumentExtractor {
  extractText(params: {
    bytes: Uint8Array;
    mimeType: string;
    filename?: string;
  }): Promise<{ text: string; raw?: unknown }>;
}

/** Stub implementations - replace with real providers */
export const stubVisionProvider: VisionProvider = {
  async analyzeImage() {
    return {
      text: "Stub: No vision analysis. Implement VisionProvider with your AI provider.",
    };
  },
};

export const stubDocumentExtractor: DocumentExtractor = {
  async extractText() {
    return {
      text: "Stub: No text extraction. Implement DocumentExtractor for PDF/OCR.",
    };
  },
};
