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
  res.send({ status: "online", message: "Vastu AI Backend is running" });
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
      "X-Title": "Vastu AI",
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
    const imageUrl = `data:image/jpeg;base64,${cleanBase64}`;

    // ── Prompts ───────────────────────────────────────────────────────────
    const analysisPrompt = `You are an expert AI Interior Designer. Analyze this photo of a ${roomType || "room"} for a ${ownership || "homeowner"} in ${location || "the city"}. The desired style is ${style || "modern"}, facing ${direction || "North"}, with a budget of ₹${budget || "50000"}${pinterestUrl ? ` (Pinterest inspiration: ${pinterestUrl})` : ""}. Please provide a detailed design analysis, layout design, Vastu-compliant color palette, lighting suggestions, shoppable furniture links, and a cost estimation. Use your vision capabilities to accurately identify existing structures.`;

    const designPrompt = `REDESIGN RENDER: ${roomType || "room"}, ${style || "modern"} style interior design, tailored for a ${ownership || "homeowner"} in ${location || "the city"}. High quality, realistic, professional architecture visualization, 8k resolution. Use the provided image as the base structure.`;

    console.log("\nStarting AI tasks...");

    // ── 1. Text Analysis ─ NVIDIA Nemotron (Vision) ──────────────────────
    console.log("[OpenRouter] Sending vision prompt to NVIDIA Nemotron...");

    let analysisResultText = "";
    try {
      const chatData = await openrouterChat(
        "nvidia/nemotron-nano-12b-v2-vl:free",
        [
          {
            role: "user",
            content: [
              { type: "text", text: analysisPrompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ]
      );
      analysisResultText = chatData?.choices?.[0]?.message?.content ?? "";
      console.log("[OpenRouter] Text analysis generated successfully.");
    } catch (err: any) {
      console.error("Text analysis failed:", err.message);
      throw new Error(`Text Analysis Error: ${err.message}`);
    }

    // ── 2. Image Generation ─ Gemini 2.5 Flash Image ────────────────────
    console.log("[OpenRouter] Generating redesign image via Gemini 2.5 Flash Image...");

    const combinedPrompt = `${designPrompt}\n\nBased on your analysis of the original room:\n${analysisResultText.substring(0, 1000)}`;

    let generatedImageBase64 = "";
    try {
      const imageData = await openrouterChat(
        "google/gemini-2.5-flash-image",
        [
          {
            role: "user",
            content: [
              { type: "text", text: combinedPrompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ]
      );

      // Robust extraction for Gemini 2.5 Image response
      const message = imageData?.choices?.[0]?.message;
      const content = message?.content;

      console.log("[OpenRouter] Response content type:", typeof content);

      // Case 1: content is an array (OpenAI-compatible multi-part)
      if (Array.isArray(content)) {
        for (const part of content) {
          if (part?.type === "image_url" && part?.image_url?.url) {
            const url = part.image_url.url;
            generatedImageBase64 = url.startsWith("data:") ? url : `data:image/jpeg;base64,${url}`;
            break;
          }
        }
      }
      // Case 2: content is a string (might be raw base64, data URL, or Markdown)
      else if (typeof content === "string" && content.trim()) {
        const trimmed = content.trim();

        // 2a: Check for embedded Markdown or data URL
        const dataUrlMatch = trimmed.match(/data:image\/[a-zA-Z]*;base64,[^\s"']*/);
        if (dataUrlMatch) {
          generatedImageBase64 = dataUrlMatch[0];
        }
        // 2b: Check for raw base64 (long string, no spaces)
        else if (!trimmed.includes(" ") && trimmed.length > 1000) {
          generatedImageBase64 = `data:image/jpeg;base64,${trimmed}`;
        }
        // 2c: Last resort - just try it
        else {
          console.warn("[OpenRouter] Extraction: Content received but no clear image pattern found.");
        }
      }

      if (!generatedImageBase64) {
        console.error("[OpenRouter] FAILED to extract image. Full response structure:", JSON.stringify(imageData, null, 2));
      } else {
        console.log("[OpenRouter] Redesign image generated and extracted successfully.");
      }
    } catch (err: any) {
      console.error("Image generation failed:", err.message);
      throw new Error(`Image Generation Error: ${err.message}`);
    }

    if (!generatedImageBase64) {
      console.warn("No image found in AI response.");
    }

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
