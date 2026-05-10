import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "@langchain/core/vectorstores/memory";
import { vectorStores } from "../store.js";

export async function ingestDocument(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  let docs;

  // 1. Load Document
  if (ext === ".pdf") {
    const loader = new PDFLoader(file.path, { splitPages: true });
    docs = await loader.load();
  } else {
    // Plain text
    const content = fs.readFileSync(file.path, "utf-8");
    docs = [{ pageContent: content, metadata: { source: file.originalname, page: 1 } }];
  }

  const pageCount = docs.length;

  // 2. Chunk Document
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await splitter.splitDocuments(docs);

  // 3. Embed and Store using Local Memory and CPU
  const embeddings = new HuggingFaceTransformersEmbeddings({
    modelName: "Xenova/all-MiniLM-L6-v2",
  });

  const collectionId = `doc-${uuidv4()}`;

  // Store the embedded chunks in the global memory dictionary
  vectorStores[collectionId] = await MemoryVectorStore.fromDocuments(chunks, embeddings);

  console.log(`Indexed "${file.originalname}" — ${chunks.length} chunks into [${collectionId}]`);

  return {
    collectionId,
    chunkCount: chunks.length,
    pageCount,
  };
}
