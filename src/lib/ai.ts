// MiniMax API client — Anthropic API compatible format

const MINIMAX_API_URL = import.meta.env.VITE_MINIMAX_API_URL || "https://api.minimax.io/anthropic";
const MINIMAX_API_KEY = import.meta.env.VITE_MINIMAX_API_KEY;

export interface MiniMaxMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface MiniMaxChatRequest {
  model: string;
  max_tokens: number;
  system?: string;
  messages: Array<{
    role: string;
    content: string | Array<{ type: string; text: string }>;
  }>;
  temperature?: number;
}

export interface MiniMaxChatResponse {
  id: string;
  content: Array<{
    type: string;
    text?: string;
    thinking?: string;
  }>;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Chat completion using MiniMax's Anthropic-compatible API.
 * Endpoint: POST {BASE_URL}/v1/messages
 * Auth: Bearer token
 */
export async function chatCompletion(
  messages: MiniMaxMessage[],
  options: { model?: string; temperature?: number; max_tokens?: number; system?: string } = {}
): Promise<string> {
  if (!MINIMAX_API_KEY) {
    throw new Error("VITE_MINIMAX_API_KEY no está configurada en el archivo .env");
  }

  const {
    model = "MiniMax-M2.7",
    temperature = 0.7,
    max_tokens = 8192,
    system,
  } = options;

  // Build messages in Anthropic format
  const anthropicMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content:
        typeof m.content === "string"
          ? m.content
          : m.content,
    }));

  const requestBody: MiniMaxChatRequest = {
    model,
    max_tokens,
    messages: anthropicMessages,
    ...(system && { system }),
    ...(temperature !== undefined && { temperature }),
  };

  const response = await fetch(`${MINIMAX_API_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`MiniMax API error ${response.status}: ${errorText}`);
  }

  const data: MiniMaxChatResponse = await response.json();

  // Find the text content block
  const textBlock = data.content?.find((block) => block.type === "text");
  if (!textBlock || !textBlock.text) {
    throw new Error("No se recibió respuesta de texto del modelo");
  }

  return textBlock.text;
}
