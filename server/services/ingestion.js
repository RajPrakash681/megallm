import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { LocalEmbeddings } from "./embeddings.js";
import { SimpleVectorStore } from "./vectorstore.js";
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

  // 2. Chunk Document using RecursiveCharacterTextSplitter
  // This strategy tries to split on paragraphs first, then newlines, then sentences,
  // then words — keeping chunks semantically meaningful.
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await splitter.splitDocuments(docs);

  // 3. Embed and Store
  const embeddings = new LocalEmbeddings();
  const collectionId = `doc-${uuidv4()}`;

  vectorStores[collectionId] = await SimpleVectorStore.fromDocuments(chunks, embeddings);

  console.log(`Indexed "${file.originalname}" — ${chunks.length} chunks into [${collectionId}]`);

  return {
    collectionId,
    chunkCount: chunks.length,
    pageCount,
  };
}
