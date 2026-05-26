import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalyzeResponse } from "../model/ai-analyze-model";
import { Priority, TicketCategory } from "../src/generated/prisma/enums";

export class AiService {
  static async analyzeTicket(description: string): Promise<AnalyzeResponse> {
    try {
      // 1. Guard Clause: Ensure the necessary orchestration API Key is available
      if (!process.env.GEMINI_API_KEY) {
        throw new Error(
          "GEMINI_API_KEY is not defined in environment variables.",
        );
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      const model = genAI.getGenerativeModel({
        model: "gemini-3.1-flash-lite",
      });

      // 2. Structured Prompt Engineering: Provide system boundaries and expected enums
      const prompt = `
        Your task is to analyze a school facility complaint description (provided in Indonesian) and determine the most appropriate PRIORITY and CATEGORY for the IT Helpdesk.

        PRIORITY Options: "${Priority.LOW}", "${Priority.MEDIUM}", "${Priority.HIGH}"
        CATEGORY Options: "${TicketCategory.ELECTRICAL}", "${TicketCategory.FACILITIES}", "${TicketCategory.HARDWARE}", "${TicketCategory.NETWORK}", "${TicketCategory.OTHERS}", "${TicketCategory.SOFTWARE}"

        Complaint Description: "${description}"

        Return the result strictly as a pure JSON object with the following structure. Do not include markdown formatting or any other text.
        {
          "priority": "PRIORITY_VALUE",
          "category": "CATEGORY_VALUE"
        }
      `;

      // 3. Dispatch execution to Gemini cluster with runtime constraint instructions
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const responseText = result.response.text();

      // 4. Sanitization: Strip out markdown formatting fences (```json ... ```)
      const cleanJson = responseText
        .replace(/```json/gi, "")
        .replace(/```/gi, "")
        .trim();

      return JSON.parse(cleanJson);
    } catch (error) {
      // 5. Fault-Tolerance Fallback Strategy:
      return { priority: Priority.LOW, category: TicketCategory.OTHERS };
    }
  }
}
