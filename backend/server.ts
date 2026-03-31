import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY as string;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

// Health check route
app.get("/", (_req, res) => {
  res.send({ status: "online", message: "VastuVision AI Backend is running" });
});

// ── helpers ────────────────────────────────────────────────────────────────

async function openrouterChat(
  model: string,
  messages: object[],
  extraBody: object = {}
): Promise<any> {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5000",
      "X-Title": "VastuVision AI",
    },
    body: JSON.stringify({ model, messages, ...extraBody }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter request failed [${response.status}]: ${errText}`);
  }

  return response.json();
}

// ── POST /api/analyze ──────────────────────────────────────────────────────

app.post("/api/analyze", async (req, res) => {
  console.log("\n--- New Analysis Request Received ---");
  try {
    const {
      image,
      roomType,
      style,
      budget,
      ownership,
      direction,
      location,
      pinterestUrl,
    } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    // ── Normalise incoming base64 ─────────────────────────────────────────
    const cleanBase64 = image.includes(",") ? image.split(",")[1] : image;

    // ── Prompts ───────────────────────────────────────────────────────────
    const analysisPrompt = `You are an expert AI Interior Designer. You are analyzing a ${roomType || "room"} for a ${ownership || "homeowner"} in ${location || "the city"}. The desired style is ${style || "modern"}, facing ${direction || "North"}, with a budget of ₹${budget || "50000"}${pinterestUrl ? ` (Pinterest inspiration: ${pinterestUrl})` : ""}. Please provide a detailed design analysis, layout design, Vastu-compliant color palette, lighting suggestions, shoppable furniture links, and a cost estimation.`;

    const designPrompt = `REDESIGN RENDER: ${roomType || "room"}, ${style || "modern"} style interior design, tailored for a ${ownership || "homeowner"} in ${location || "the city"}. High quality, realistic, professional architecture visualization, 8k resolution.`;

    console.log("\nStarting AI tasks...");

    // ── 1. Text Analysis ─ Hugging Face Qwen ─────────────────────────────
    console.log("[Hugging Face] Sending prompt to Qwen...");
    
    const textResponse = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        headers: {
          "Authorization": `Bearer ${process.env.QWEN_API}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-72B-Instruct",
          messages: [{ role: "user", content: analysisPrompt }],
          max_tokens: 1500,
        }),
      }
    );

    if (!textResponse.ok) {
      const errText = await textResponse.text();
      throw new Error(`Hugging Face Qwen request failed [${textResponse.status}]: ${errText}`);
    }

    const textData = await textResponse.json();
    const analysisResultText = textData?.choices?.[0]?.message?.content ?? "";
    console.log("[Hugging Face] Text analysis generated successfully.");

    // ── 2. Image Generation ─ Gemini 2.5 Flash (OpenRouter) ──────────────
    console.log("[OpenRouter] Generating redesign image via Gemini...");

    const combinedPrompt = `${designPrompt}\n\nBased on the analysis:\n${analysisResultText.substring(0, 1000)}`;

    const imageData = await openrouterChat(
      "google/gemini-2.0-flash-exp:free",
      [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: combinedPrompt,
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${cleanBase64}` },
            },
          ],
        },
      ],
      { modalities: ["text", "image"] }
    );

    // Extract generated image
    let generatedImageBase64 = "";
    const parts = imageData?.choices?.[0]?.message?.content ?? [];

    if (Array.isArray(parts)) {
      for (const part of parts) {
        if (part?.type === "image_url" && part?.image_url?.url) {
          const url = part.image_url.url;
          generatedImageBase64 = url.startsWith("data:") ? url : `data:image/jpeg;base64,${url}`;
          break;
        }
      }
    }

    if (!generatedImageBase64) {
      const textContent = typeof parts === "string" ? parts : imageData?.choices?.[0]?.message?.content ?? "";
      if (typeof textContent === "string" && textContent.trim()) {
        const raw = textContent.trim();
        generatedImageBase64 = raw.startsWith("data:") ? raw : `data:image/jpeg;base64,${raw}`;
      }
    }
    
    console.log("[OpenRouter] Redesign image generated successfully.");

    // ── Response ──────────────────────────────────────────────────────────
    res.status(200).json({
      text: analysisResultText,
      image: generatedImageBase64,
      redesignedImage: generatedImageBase64,
      depthMapImage: null,
    });

    console.log("\n--- Request Completed Successfully ---");
  } catch (error: any) {
    console.error("\n--- CRITICAL BACKEND ENDPOINT ERROR ---");
    console.error(error);
    res.status(500).json({
      error: "AI generation failed",
      details: error?.message || String(error),
    });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
