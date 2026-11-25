export interface AiModelOption {
  id: string;
  name: string;
  tier: string;
  description: string;
  provider: "openai" | "anthropic";
}

export const AI_MODELS: AiModelOption[] = [
  {
    id: "model-a-medium",
    name: "Model A",
    tier: "Sedang",
    description: "Seimbang untuk penulisan, analisis, dan tugas harian",
    provider: "anthropic",
  },
  {
    id: "model-b-fast",
    name: "Model B",
    tier: "Cepat",
    description: "Respons instan untuk tanya jawab ringan dan ringkasan",
    provider: "openai",
  },
  {
    id: "model-c-reasoning",
    name: "Model C",
    tier: "Penalaran",
    description: "Analisis mendalam untuk arsitektur, riset, dan pemrograman",
    provider: "anthropic",
  },
];

export const DEFAULT_MODEL_ID = AI_MODELS[0].id;
