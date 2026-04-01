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
    const analysisPrompt = `You are an expert AI Interior Designer. Analyze this photo of a ${roomType || "room"} for a ${ownership || "homeowner"} in ${location || "the city"}. The desired style is ${style || "modern"}, facing ${direction || "North"}, with a budget of ₹${budget || "50000"}${pinterestUrl ? ` (Pinterest inspiration: ${pinterestUrl})` : ""}. Please provide a detailed design analysis, layout design, Vastu-compliant color palette, lighting suggestions, shoppable furniture links, and a cost estimation. Use your vision capabilities to accurately identify existing structures.
CRITICAL: At the very end of your response, output a strict JSON array of 4 distinct suggested furniture/decor products formatted EXACTLY like this: [PRODUCTS_JSON_START][{"id": 1, "name": "Minimalist Chair", "brand": "DesignCo", "price": 450, "image": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop"}][PRODUCTS_JSON_END]`;

    const designPrompt = `REDESIGN RENDER: ${roomType || "room"}, ${style || "modern"} style interior design, tailored for a ${ownership || "homeowner"} in ${location || "the city"}. High quality, realistic, professional architecture visualization, 8k resolution. 
CRITICAL ARCHITECTURAL LOCK: Use the provided image as the ABSOLUTE structural template. PRESERVE EXACTLY all walls, windows, doors, pillars, ceiling height, and floor boundaries. Do NOT add new windows, shift walls, or change room dimensions. This is an interior decor replacement ONLY. Structural accuracy is the highest priority.`;
    
    const nightPrompt = `TRANSFORM TO NIGHTTIME: Maintain the EXACT interior design, layout, and furniture from the daylight image. Modify ONLY the lighting. Create a warm, dramatic nighttime ambient scene. Turn on all interior lamps, accent lights, and LEDs. Windows should show a dark night exterior. No structural changes.`;

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
    console.log("[OpenRouter] Generating redesign images via Gemini 2.5 Flash Image...");

    const combinedDayPrompt = `${designPrompt}\n\nBased on your analysis of the original room:\n${analysisResultText.substring(0, 500)}`;

    const generateImage = async (promptText: string, customImageUrl: string) => {
      let imageBase64 = "";
      
      const imageData = await openrouterChat(
        "google/gemini-2.5-flash-image",
        [
          {
            role: "system",
            content: "You are a professional interior design image generation engine. Generate an image based on the provided photo and visual description. Output ONLY the generated image. Do NOT provide text reasoning, JSON, or parameters."
          },
          {
            role: "user",
            content: [
              { type: "text", text: `GENERATE REDESIGN: ${promptText}` },
              { type: "image_url", image_url: { url: customImageUrl } },
            ],
          },
        ],
        { modalities: ["image", "text"] }
      );
      const message = imageData?.choices?.[0]?.message;
      const content = message?.content;
      const images = message?.images;

      if (Array.isArray(images) && images.length > 0) {
        for (const img of images) {
          if (img?.type === "image_url" && img?.image_url?.url) {
            const url = img.image_url.url;
            imageBase64 = url.startsWith("data:") ? url : `data:image/jpeg;base64,${url}`;
            break;
          }
        }
      }

      if (!imageBase64 && Array.isArray(content)) {
        for (const part of content) {
          if (part?.type === "image_url" && part?.image_url?.url) {
            const url = part.image_url.url;
            imageBase64 = url.startsWith("data:") ? url : `data:image/jpeg;base64,${url}`;
            break;
          }
        }
      } 
      else if (!imageBase64 && typeof content === "string" && content.trim()) {
        const trimmed = content.trim();
        const dataUrlMatch = trimmed.match(/data:image\/[a-zA-Z]*;base64,[^\s"']*/);
        if (dataUrlMatch) {
          imageBase64 = dataUrlMatch[0];
        } else if (!trimmed.includes(" ") && trimmed.length > 1000) {
          imageBase64 = `data:image/jpeg;base64,${trimmed}`;
        }
      }

      if (!imageBase64) {
        console.error("[OpenRouter] Failed to extract image. Response message:", JSON.stringify(message, null, 2));
      }

      return imageBase64;
    };

    // Sequential generation to ensure consistency
    const daylightImage = await generateImage(combinedDayPrompt, imageUrl);
    if (!daylightImage) throw new Error("Daylight Image Generation Error: failed to extract base64");

    console.log("[OpenRouter] Daylight stable. Generating matching nighttime variant...");

    const nighttimeImage = await generateImage(nightPrompt, daylightImage).catch(e => { 
      console.error("Night render sequential fallback failed", e); 
      return daylightImage; 
    });

    // Extract products
    let parsedProducts = [];
    try {
      if (analysisResultText.includes("[PRODUCTS_JSON_START]") && analysisResultText.includes("[PRODUCTS_JSON_END]")) {
        const jsonStr = analysisResultText.split("[PRODUCTS_JSON_START]")[1].split("[PRODUCTS_JSON_END]")[0];
        parsedProducts = JSON.parse(jsonStr.trim());
      }
    } catch {
       console.warn("Failed to parse products cleanly.");
    }

    // ── Response ──────────────────────────────────────────────────────────
    res.status(200).json({
      text: analysisResultText,
      image: imageUrl, // Fixed payload assignment returning exact original
      redesignedImage: daylightImage,
      nighttimeImage: nighttimeImage || daylightImage,
      products: parsedProducts,
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

// ── POST /api/remediate ──────────────────────────────────────────────────────

app.post("/api/remediate", async (req, res) => {
  console.log("\n--- AI Remediation Request Received ---");
  try {
    const { image, promptOverrides } = req.body;
    if (!image) return res.status(400).json({ error: "Image required" });

    const cleanBase64 = image.includes(",") ? image.split(",")[1] : image;
    const imageUrl = `data:image/jpeg;base64,${cleanBase64}`;

    const remediatePrompt = `REDESIGN RENDER: Apply the following user modifications: "${promptOverrides || "Improve the design subtly"}". CRITICAL INSTRUCTION: Use the provided image as the exact structural base. PRESERVE ALL walls, windows, doors, pillars, ceiling height, and room dimensions. Do NOT generate a new room. Redesign ONLY the interior decor to match the requested modification. High quality, realistic architecture visualization, 8k resolution.`;

    console.log(`[OpenRouter] Editing via Gemini... Prompt: ${promptOverrides}`);

    let imageBase64 = "";
    const imageData = await openrouterChat(
      "google/gemini-2.5-flash-image", 
      [
        {
          role: "system",
          content: "You are a professional interior design image generation engine. Generate the redesign image based on the provided photo and modification description. Output ONLY the generated image. Do NOT provide text reasoning, JSON, or parameters."
        },
        { 
          role: "user", 
          content: [
            { type: "text", text: `REMEDIATE RENDER: ${promptOverrides || "Improve the design subtly"}` }, 
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
      { modalities: ["image", "text"] }
    );
    
    const message = imageData?.choices?.[0]?.message;
    const content = message?.content;
    const images = message?.images;

    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        if (img?.type === "image_url" && img?.image_url?.url) {
          const url = img.image_url.url;
          imageBase64 = url.startsWith("data:") ? url : `data:image/jpeg;base64,${url}`;
          break;
        }
      }
    }

    if (!imageBase64 && Array.isArray(content)) {
      for (const part of content) {
         if (part?.type === "image_url" && part?.image_url?.url) {
           const url = part.image_url.url;
           imageBase64 = url.startsWith("data:") ? url : `data:image/jpeg;base64,${url}`;
           break;
         }
      }
    } else if (!imageBase64 && typeof content === "string" && content.trim()) {
        const trimmed = content.trim();
        const dataUrlMatch = trimmed.match(/data:image\/[a-zA-Z]*;base64,[^\s"']*/);
        if (dataUrlMatch) {
          imageBase64 = dataUrlMatch[0];
        } else if (!trimmed.includes(" ") && trimmed.length > 1000) {
          imageBase64 = `data:image/jpeg;base64,${trimmed}`;
        }
    }

    if (!imageBase64) throw new Error("Failed to extract remediated base64 payload");

    res.status(200).json({ redesignedImage: imageBase64 });
    console.log("--- Remediation Successful ---");
  } catch (error: any) {
    console.error("Remediation failed", error);
    res.status(500).json({ error: "Remediation failed", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
