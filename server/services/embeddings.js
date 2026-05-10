import { Embeddings } from "@langchain/core/embeddings";
import { pipeline } from "@xenova/transformers";

/**
 * Custom Embeddings class that runs the all-MiniLM-L6-v2 model
 * locally on the CPU using Xenova/transformers.
 * No external API keys required.
 */
let extractor = null;

async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return extractor;
}

export class LocalEmbeddings extends Embeddings {
  constructor() {
    super({});
  }

  async embedDocuments(documents) {
    const ext = await getExtractor();
    const embeddings = [];
    for (const doc of documents) {
      const output = await ext(doc, { pooling: "mean", normalize: true });
      embeddings.push(Array.from(output.data));
    }
    return embeddings;
  }

  async embedQuery(query) {
    const ext = await getExtractor();
    const output = await ext(query, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  }
}
