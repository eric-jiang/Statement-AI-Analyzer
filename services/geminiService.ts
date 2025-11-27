import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ParsedTransaction } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We define the schema for the output we expect from Gemini
const transactionSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      date: { type: Type.STRING, description: "The date of the transaction (YYYY-MM-DD)" },
      originalDescription: { type: Type.STRING, description: "The original description from the CSV" },
      supplier: { type: Type.STRING, description: "The extracted supplier name." },
      project: { type: Type.STRING, nullable: true, description: "The project name if found in the description, otherwise null." },
      amount: { type: Type.NUMBER, description: "The absolute amount of the transaction." },
    },
    required: ["originalDescription", "supplier", "amount"],
  },
};

export const analyzeTransactionsChunk = async (
  csvHeader: string,
  csvRows: string[],
  knownProjects: string[]
): Promise<ParsedTransaction[]> => {
  if (csvRows.length === 0) return [];

  const model = "gemini-2.5-flash";
  
  // Construct a prompt that includes the header to help identify columns
  const csvBlock = [csvHeader, ...csvRows].join("\n");
  
  const prompt = `
    You are an expert financial data analyst. 
    Analyze the following CSV bank statement fragment.
    
    Tasks:
    1. Extract the 'Amount'. Look specifically for a column named 'Debit'. If 'Debit' exists, use it. Ignore 'Credit' unless 'Debit' is missing. Return as a positive number.
    2. Extract the 'Supplier' from the description.
       Heuristic: The supplier is usually at the start of the description followed by a number (e.g., invoice number, store ID).
       Extract the text before this number.
       Example: "AMZN Mktp US*13423" -> "AMZN Mktp US" (or better "Amazon" if recognizable).
       Example: "Starbucks Store #222" -> "Starbucks".
    3. Project Classification: Look up in the description to find one of the following Project names: ${JSON.stringify(knownProjects)}.
       If the description contains the exact project name, extract it. If not, set project to null.
    4. Return the data as a JSON array matching the schema.

    CSV Data:
    ${csvBlock}
  `;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: transactionSchema,
        temperature: 0.1, // Low temperature for deterministic extraction
      },
    });

    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text) as ParsedTransaction[];
    return data;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

// Orchestrates the batch processing
export const processStatementWithGemini = async (
  csvContent: string,
  projects: string[],
  onProgress: (progress: number) => void
): Promise<ParsedTransaction[]> => {
  const lines = csvContent.split(/\r?\n/).filter(l => l.trim() !== "");
  if (lines.length < 2) return [];

  const header = lines[0];
  const dataRows = lines.slice(1);
  const BATCH_SIZE = 15; // Small batch size to ensure we don't hit output token limits per response
  const results: ParsedTransaction[] = [];

  for (let i = 0; i < dataRows.length; i += BATCH_SIZE) {
    const batch = dataRows.slice(i, i + BATCH_SIZE);
    const progress = Math.round((i / dataRows.length) * 100);
    onProgress(progress);

    try {
      const batchResults = await analyzeTransactionsChunk(header, batch, projects);
      results.push(...batchResults);
    } catch (e) {
      console.error(`Failed to process batch ${i}`, e);
      // Determine strategy: skip or retry? For this demo, we skip to avoid infinite loops
    }
  }

  onProgress(100);
  return results;
};
