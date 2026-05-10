import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import fs from "fs";

import { ingestDocument } from "./services/ingestion.js";
import { answerQuestion } from "./services/rag.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Setup static file serving for the frontend
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(cors());

// Configure Multer for file uploads
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// API Routes
app.post("/api/upload", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    // Pass to ingestion service
    const stats = await ingestDocument(req.file);
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    res.json({ success: true, ...stats });
  } catch (error) {
    console.error("Upload error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message || "Failed to process document" });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { question, collectionId } = req.body;
    
    if (!question || !collectionId) {
      return res.status(400).json({ error: "Missing question or collectionId" });
    }
    
    const result = await answerQuestion(question, collectionId);
    res.json(result);
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message || "Failed to answer question" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
