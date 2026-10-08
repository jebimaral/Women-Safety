import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy GoogleGenAI initialization
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing");
  }
  return new GoogleGenAI({ apiKey });
}

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "AuraGuard Safety Server" });
});

// AI Threat Analysis Endpoint
app.post("/api/ai/analyze-threat", async (req, res) => {
  try {
    const { text, location, language = "en" } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text description is required" });
    }

    const ai = getGenAI();
    const prompt = `You are AuraGuard AI, an expert women and child safety threat evaluator.
Analyze the following user situation description:
"${text}"
User Location Context: ${location ? JSON.stringify(location) : "Unknown"}
Language requested: ${language}

Perform a threat assessment and respond ONLY in valid JSON matching this schema:
{
  "threatLevel": "SAFE" | "SUSPICIOUS" | "HIGH_DANGER" | "CRITICAL_EMERGENCY",
  "riskScore": 85,
  "recommendSOS": true,
  "summary": "Brief 1-sentence assessment",
  "immediateActions": ["Step 1", "Step 2", "Step 3"],
  "deescalationTips": ["Tip 1", "Tip 2"],
  "policeContactRecommended": true
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text || "{}";
    const parsed = JSON.parse(resultText);
    return res.json({ success: true, analysis: parsed });
  } catch (error: any) {
    console.warn("AI Threat analysis fallback triggered:", error?.message);
    const lower = (req.body.text || "").toLowerCase();
    const isCritical = lower.includes("follow") || lower.includes("knife") || lower.includes("gun") || lower.includes("help") || lower.includes("danger") || lower.includes("chasing");
    return res.json({
      success: true,
      analysis: {
        threatLevel: isCritical ? "CRITICAL_EMERGENCY" : "SUSPICIOUS",
        riskScore: isCritical ? 92 : 55,
        recommendSOS: isCritical,
        summary: isCritical ? "Critical safety threat detected based on urgency keywords." : "Suspicious activity reported. Stay vigilant and move to open public areas.",
        immediateActions: [
          "Move towards well-lit public places or nearest populated store.",
          "Keep phone unlocked with Emergency SOS ready.",
          "Share live tracking link with primary trusted contact."
        ],
        deescalationTips: [
          "Do not engage or isolate yourself.",
          "Trigger Fake Call to create immediate caller distraction."
        ],
        policeContactRecommended: isCritical
      }
    });
  }
});

// AI Assistant Chat Endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, history = [], language = "en" } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getGenAI();
    const systemInstruction = `You are AuraGuard Safety Assistant, a compassionate, alert, and practical AI counselor for Women & Child Safety, emergency protocols, self-defense awareness, legal rights, and crisis de-escalation. Language: ${language}. Keep responses clean, empathetic, concise, and structured.`;

    const contents = [
      { role: "user", parts: [{ text: systemInstruction }] },
      ...history.map((h: any) => ({
        role: h.sender === "user" ? "user" : "model",
        parts: [{ text: h.text }]
      })),
      { role: "user", parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents as any,
    });

    return res.json({ success: true, reply: response.text });
  } catch (error: any) {
    console.warn("AI Chat fallback triggered:", error?.message);
    return res.json({
      success: true,
      reply: "I am here to protect you. If you feel unsafe or pursued, tap the bright Red SOS button at the top right immediately. Stay in well-lit public areas and notify your trusted contacts."
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AuraGuard] Safety server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
