import { LocalEmbeddings } from "./embeddings.js";

/**
 * A simple in-memory vector store.
 * Stores document chunks alongside their embedding vectors
 * and performs cosine similarity search for retrieval.
 * No external database or flaky LangChain imports needed.
 */
export class SimpleVectorStore {
  constructor(embeddings) {
    this.embeddings = embeddings;
    this.documents = []; // { pageContent, metadata }
    this.vectors = [];   // number[][]
  }

  static async fromDocuments(docs, embeddings) {
    const store = new SimpleVectorStore(embeddings);
    const texts = docs.map((d) => d.pageContent);

    // Embed all documents in batches to avoid memory issues
    const batchSize = 20;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchVectors = await embeddings.embedDocuments(batch);
      store.vectors.push(...batchVectors);
    }

    store.documents = docs.map((d) => ({
      pageContent: d.pageContent,
      metadata: d.metadata || {},
    }));

    return store;
  }

  async similaritySearch(query, k = 5) {
    const queryVector = await this.embeddings.embedQuery(query);

    // Calculate cosine similarity between query and all stored vectors
    const scores = this.vectors.map((vec, idx) => ({
      score: cosineSimilarity(queryVector, vec),
      index: idx,
    }));

    // Sort by highest similarity and return top-k
    scores.sort((a, b) => b.score - a.score);
    const topK = scores.slice(0, k);

    return topK.map((s) => this.documents[s.index]);
  }
}

function cosineSimilarity(a, b) {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
