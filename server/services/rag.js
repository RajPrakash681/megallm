import { ChatGroq } from "@langchain/groq";
import { vectorStores } from "../store.js";

export async function answerQuestion(question, collectionId) {
  // 1. Retrieve the vector store from memory
  const vectorStore = vectorStores[collectionId];

  if (!vectorStore) {
    throw new Error("Document session not found. Please upload the document again.");
  }

  // 2. Retrieve top relevant chunks via cosine similarity
  const relevantChunks = await vectorStore.similaritySearch(question, 5);

  if (!relevantChunks.length) {
    return {
      answer: "I couldn't find any relevant information in the document for that question.",
      sources: [],
    };
  }

  // 3. Build context
  const contextBlocks = relevantChunks.map((chunk, i) => {
    const page = chunk.metadata?.page ?? chunk.metadata?.loc?.pageNumber ?? "?";
    return `[Chunk ${i + 1} | Page ${page}]\n${chunk.pageContent}`;
  });

  const context = contextBlocks.join("\n\n---\n\n");

  // 4. Call Groq LLM with a strict grounding prompt
  const systemPrompt = `You are a helpful assistant. Answer the user's question using strictly the following context from their uploaded document.

Rules:
- Only answer based on the available context.
- If the answer is not in the context, clearly say so. Do not hallucinate or use external knowledge.
- Mention the page numbers if available.

Context:
${context}`;

  const chatModel = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama3-8b-8192",
    temperature: 0.2,
  });

  const response = await chatModel.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: question },
  ]);

  const answer = response.content;

  // Extract source page numbers
  const sources = [
    ...new Set(
      relevantChunks
        .map((c) => c.metadata?.page ?? c.metadata?.loc?.pageNumber)
        .filter((p) => p !== undefined && p !== null)
    ),
  ].sort((a, b) => a - b);

  return { answer, sources };
}
