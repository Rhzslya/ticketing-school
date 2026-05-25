import { api } from "@/lib/axios";
import type { AnalyzeResponse } from "@/model/ai-analyze-model";

export class AiService {
  static async analyzeTicket(description: string): Promise<AnalyzeResponse> {
    const response = await api.post("/tickets/analyze", { description });
    return response.data.data;
  }
}
