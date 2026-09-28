import 'dotenv/config';
import express from 'express';
import { analyzeTextClaim } from './textAnalysis.js';

const app = express();

app.use(express.json());

app.post("/api/analyze-text", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: "Text is required",
      });
    }

    const result = await analyzeTextClaim(text);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Text analysis failed",
    });
  }
});

app.listen(5000, () => {
  console.log("TruthLens backend running on port 5000");
});
