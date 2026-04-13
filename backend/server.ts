import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY as string;
const SERPER_API_KEY = process.env.SERPER_API_KEY as string;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

// ── Startup checks ────────────────────────────────────────────────────────
if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.length < 20) {
  console.error("[STARTUP] ERROR: OPENROUTER_API_KEY is missing or invalid in backend/.env!");
} else {
  console.log(`[STARTUP] OpenRouter API key loaded: ${OPENROUTER_API_KEY.substring(0, 12)}...`);
}
if (!SERPER_API_KEY) {
  console.error("[STARTUP] ERROR: SERPER_API_KEY is missing in backend/.env!");
} else {
  console.log(`[STARTUP] Serper API key loaded: ${SERPER_API_KEY.substring(0, 12)}...`);
}

// Health check route
app.get("/", (_req, res) => {
  res.send({ status: "online", message: "Vastu AI Backend is running" });
});

// Single model configuration — no fallbacks
const TEXT_MODEL = "nvidia/nemotron-nano-12b-v2-vl:free";  // Vision text analysis
const IMAGE_MODEL = "google/gemini-2.5-flash-image";        // Image generation

const HEURISTIC_BOUNDING_BOXES: Record<string, { x: number; y: number; width: number; height: number }> = {
  sofa: { x: 10, y: 50, width: 40, height: 30 },
  "coffee table": { x: 25, y: 65, width: 20, height: 15 },
  lamp: { x: 75, y: 30, width: 10, height: 25 },
  rug: { x: 10, y: 70, width: 60, height: 25 },
  chair: { x: 60, y: 55, width: 20, height: 25 },
  table: { x: 20, y: 60, width: 30, height: 20 },
  bed: { x: 15, y: 45, width: 50, height: 40 },
  pendant: { x: 40, y: 5, width: 20, height: 20 },
  "wall art": { x: 30, y: 20, width: 25, height: 25 },
  painting: { x: 30, y: 20, width: 25, height: 25 },
  plant: { x: 5, y: 40, width: 15, height: 30 },
  mirror: { x: 35, y: 25, width: 20, height: 20 },
  curtain: { x: 80, y: 15, width: 15, height: 60 },
  shelf: { x: 5, y: 15, width: 20, height: 50 },
  wardrobe: { x: 5, y: 10, width: 25, height: 75 },
  cabinet: { x: 70, y: 50, width: 20, height: 30 },
};

const KEYWORD_MAP: Record<string, string> = {
  sofa: "seating",
  chair: "seating",
  table: "table",
  "coffee table": "table",
  lamp: "lighting",
  pendant: "lighting",
  bed: "bedroom",
  rug: "decor",
  "wall art": "decor",
  painting: "decor",
  curtain: "decor",
  plant: "decor",
  mirror: "decor",
  shelf: "storage",
  wardrobe: "storage",
  cabinet: "storage",
};

// ── helpers ────────────────────────────────────────────────────────────────

async function openrouterChat(
  model: string,
  messages: object[],
  extraBody: object = {}
): Promise<any> {
  console.log(`[OpenRouter] Requesting model: ${model}...`);
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://vastu-ai-studio.app",
      "X-Title": "Vastu AI Designer",
    },
    body: JSON.stringify({ model, messages, ...extraBody }),
  });

  if (!response.ok) {
    const status = response.status;
    const errText = await response.text();
    console.error(`[OpenRouter] Error ${status}: ${errText}`);
    
    // Check if it's a known error type
    let parsedErr;
    try { parsedErr = JSON.parse(errText); } catch { /* ignore */ }
    
    const message = parsedErr?.error?.message || errText || "Unknown OpenRouter Error";
    throw new Error(`OpenRouter ${status}: ${message}`);
  }

  const data = await response.json();
  console.log(`[OpenRouter] Success for model: ${model}`);
  return data;
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
    const imageUrl = image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`;

    // ── Prompts ───────────────────────────────────────────────────────────
    const analysisPrompt = `You are a master interior designer and certified Vastu Shastra consultant. Analyze this ${roomType || "room"} photo for a ${ownership || "homeowner"} in ${location || "the city"}. Desired style: ${style || "Modern"}, primary facing direction: ${direction || "North"}, budget: ₹${budget || "50000"}.

Respond with the following sections in EXACTLY this order, using ### headings:

### Design Analysis
Describe the overall design concept, aesthetic direction, mood, and visual language that suits this ${roomType || "room"} in ${style || "Modern"} style. 2-3 paragraphs.

### Vastu Compliance Details
Provide an EXTREMELY detailed, room-specific Vastu Shastra analysis for this ${roomType || "room"} facing ${direction || "North"}. You MUST include all of the following sub-sections:

**Direction & Zone Analysis**
Explain what the ${direction || "North"}-facing orientation means specifically for a ${roomType || "room"} according to Vastu. Identify which zone (NE, NW, SE, SW, centre Brahmasthana) this direction activates and what energies it governs.

**Five Element Placement (Pancha Bhuta)**
Map each of the 5 Vastu elements to specific room zones: Earth (SW – heavy furniture & stability), Water (NE – water features, mirrors, blues), Fire (SE – lighting, electronics, reds), Air (NW – windows, fans, light decor), Space (centre – keep clear). Give concrete placement advice for THIS ${roomType || "room"}.

**Ideal Furniture Placement by Direction**
List exactly which furniture pieces should go in which directions and why. For example (adapt to ${roomType || "room"} type): bed head facing South/East, study desk facing North/East, wardrobe in SW, etc. Be specific to the ${roomType || "room"}.

**Vastu Dos for this ${roomType || "room"}**
Provide 6-8 actionable dos that are specific to a ${direction || "North"}-facing ${roomType || "room"}. Cover colours, materials, lighting positions, door placement, mirror placement, plants, and artefacts.

**Vastu Don'ts for this ${roomType || "room"}**
Provide 6-8 strict don'ts for the same space. Include what NOT to place in the SW corner, what colours to avoid on which walls, structural violations, and harmful placements.

**Vastu Corrections Needed**
Based on what you can see in the uploaded image, identify 3-5 specific Vastu violations or energy imbalances present, and give a precise corrective action for each.

**Vastu Score: X/10**
Rate the current room layout and design out of 10 for Vastu compliance, with a justification.

### Lighting Suggestions
Natural and artificial lighting recommendations specific to a ${direction || "North"}-facing ${roomType || "room"}: ideal colour temperatures, placement zones, Vastu-aligned lighting rules (never place main light in centre, etc.).

### Cost Breakdown
Detailed budget allocation for a ₹${budget || "50000"} renovation of this ${roomType || "room"}: what percentage for furniture, civil work, lighting, paint, accessories. Give specific ₹ values.

### Next Steps
A prioritised action checklist of 5-7 concrete steps to implement this design immediately.

CRITICAL: At the very end of your response, output a strict JSON array of 4 distinct suggested furniture/decor products formatted EXACTLY like this: [PRODUCTS_JSON_START][{"id": 1, "name": "Minimalist Chair", "brand": "DesignCo", "price": 450, "image": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop"}][PRODUCTS_JSON_END]`;

    const designPrompt = `CRITICAL ARCHITECTURAL LOCK: Use the provided uploaded image as the ONLY structural template. PRESERVE EXACTLY all walls, windows, doors, pillars, ceiling height, and floor boundaries. Do NOT add new windows, shift walls, or change room dimensions. This is an interior decor replacement ONLY. Structural accuracy is the highest priority.
REDESIGN RENDER: ${roomType || "room"}, ${style || "modern"} style interior design, tailored for a ${ownership || "homeowner"} in ${location || "the city"}. High quality, realistic, professional architecture visualization, 8k resolution.`;
    
    const nightPrompt = `ULTRA-REALISTIC NIGHTTIME TRANSFORMATION: 
    1. Maintain the EXACT interior architecture, furniture layout, and materials from the daylight image. 
    2. TOTAL DARKNESS OUTSIDE: Remove all natural daylight. Windows must NOT cast any blue or white daylight into the room. 
    3. ARTIFICIAL LIGHTING: Activate all interior artificial light sources including lamps, ceiling lights, and wall sconces. 
    4. LIGHT & SHADOW: Create warm, golden/amber interior light pools with soft realistic falloff. Ensure high-contrast lighting with deep, rich shadows in unlit corners and under furniture.
    5. EXTERIOR VIEW: Windows should show a deep, cool navy blue night sky with realistic city lights or distant stars. 
    6. AMBIANCE: Create a cozy, cinematic, and immersive nighttime atmosphere. Professional architectural night photography style. 
    7. NO structural changes.`;

    console.log("\nStarting AI tasks...");

    // ── 1. Text Analysis ─────────────────────────────────────────────────
    console.log(`[OpenRouter] Starting Text Analysis via ${TEXT_MODEL}...`);

    let analysisResultText = "";
    try {
      const chatData = await openrouterChat(
        TEXT_MODEL,
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
      if (!analysisResultText) throw new Error("Model returned empty text response.");
      console.log(`[OpenRouter] Text Analysis complete.`);
    } catch (err: any) {
      console.error(`[OpenRouter] Text Analysis failed: ${err.message}`);
      throw new Error(`Text analysis failed: ${err.message}`);
    }

    // ── 2. Image Generation ───────────────────────────────────────────────
    console.log(`[OpenRouter] Generating redesign images via ${IMAGE_MODEL}...`);

    const combinedDayPrompt = `${designPrompt}\n\nBased on your analysis of the original room:\n${analysisResultText.substring(0, 500)}\n\nCRITICAL ARCHITECTURAL LOCK: You MUST use the provided uploaded image as the ONLY structural template. Do NOT generate a new room. PRESERVE EXACTLY all walls, windows, doors, pillars, ceiling height, and room dimensions from the uploaded photo. Structural accuracy is the highest priority!`;

    const generateImage = async (promptText: string, customImageUrl: string): Promise<string> => {
      let imageBase64 = "";
      try {
        console.log(`[OpenRouter] Calling ${IMAGE_MODEL}...`);
        const imageData = await openrouterChat(
          IMAGE_MODEL,
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
          { 
            // Some newer multimodal models work better with explicit response_modalities 
            // for image generation. However,Nano Banana (2.5 flash image) uses 
            // standard chat completions but might require this for certain features.
            // Keeping it flexible but safer.
            response_modalities: ["text", "image"] 
          }
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

        if (!imageBase64) {
          throw new Error(`${IMAGE_MODEL} returned a response but no image data could be extracted.`);
        }

        console.log(`[OpenRouter] Image generation successful.`);
        return imageBase64;
      } catch (err: any) {
        const msg = err.message || "Unknown error";
        if (msg.includes("403") || msg.includes("402") || msg.includes("429") || msg.includes("credit") || msg.includes("limit")) {
          throw new Error(`Image generation quota exceeded on ${IMAGE_MODEL}. Please check your OpenRouter billing or increase the model limit. Details: ${msg}`);
        }
        throw new Error(`Image generation failed on ${IMAGE_MODEL}: ${msg}`);
      }
    };

    // Sequential generation to ensure consistency
    const daylightImage = await generateImage(combinedDayPrompt, imageUrl);
    if (!daylightImage) throw new Error("Daylight Image Generation Error: Failed to generate or extract base64 rendering.");

    console.log("[OpenRouter] Daylight stable. Generating matching nighttime variant...");

    const nighttimeImage = await generateImage(nightPrompt, daylightImage).catch(e => { 
      console.error("Night render sequential fallback failed", e); 
      return daylightImage; 
    });

    // Extract products (Robust Regex Parser)
    let parsedProducts = [];
    try {
      // Find content between markers [PRODUCTS_JSON_START] and [PRODUCTS_JSON_END]
      const productMatch = analysisResultText.match(/\[PRODUCTS_JSON_START\]([\s\S]*?)\[PRODUCTS_JSON_END\]/);
      
      if (productMatch && productMatch[1]) {
        let jsonStr = productMatch[1].trim();
        
        // Remove markdown backticks if present
        jsonStr = jsonStr.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
        
        parsedProducts = JSON.parse(jsonStr);
        console.log(`[Parser] Successfully extracted ${parsedProducts.length} products.`);
      } else {
        console.log("[Parser] No product markers found in analysis text.");
      }
    } catch (parseErr: any) {
       console.warn(`[Parser] Failed to parse products cleanly: ${parseErr.message}`);
       // Log the actual string that failed for debugging
       const startIdx = analysisResultText.indexOf("[PRODUCTS_JSON_START]");
       if (startIdx !== -1) {
         const preview = analysisResultText.substring(startIdx, startIdx + 100);
         console.warn(`[Parser] Context near start: ${preview}...`);
       }
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
    
    const msg = error?.message || String(error);
    
    // Explicitly handle OpenRouter billing/quota errors
    if (msg.includes("API_QUOTA_EXCEEDED") || msg.includes("403") || msg.includes("402") || msg.includes("limit exceeded")) {
      return res.status(429).json({
        error: "Quota Exceeded",
        details: "AI API limit exceeded. Please ensure your OpenRouter account has active credits and hasn't hit rate limits."
      });
    }

    res.status(500).json({
      error: "AI generation failed",
      details: msg || "An unknown error occurred during AI analysis.",
    });
  }
});

// ── POST /api/remediate ──────────────────────────────────────────────────────

app.post("/api/remediate", async (req, res) => {
  console.log("\n--- AI Remediation Request Received ---");
  try {
    const { image, promptOverrides } = req.body;
    if (!image) return res.status(400).json({ error: "Image required" });

    const imageUrl = image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`;

    const remediatePrompt = `REDESIGN RENDER: Apply the following user modifications: "${promptOverrides || "Improve the design subtly"}". CRITICAL INSTRUCTION: Use the provided image as the exact structural base. PRESERVE ALL walls, windows, doors, pillars, ceiling height, and room dimensions. Do NOT generate a new room. Redesign ONLY the interior decor to match the requested modification. High quality, realistic architecture visualization, 8k resolution.`;

    console.log(`[OpenRouter] Editing via Gemini... Prompt: ${promptOverrides}`);

    let imageBase64 = "";
    try {
      console.log(`[OpenRouter] Remediation attempt via ${IMAGE_MODEL}...`);
      const imageData = await openrouterChat(
        IMAGE_MODEL, 
        [
          {
            role: "system",
            content: "You are a professional interior design image generation engine. Generate the redesign image based on the provided photo and modification description. Output ONLY the generated image. Do NOT provide text reasoning, JSON, or parameters."
          },
          { 
            role: "user", 
            content: [
              { type: "text", text: `REMEDIATE RENDER: Modify the provided interior design by applying these requested changes: "${promptOverrides}". 
              CRITICAL: 
              1. Use the provided image as the EXACT structural template. 
              2. High-Fidelity Preservation: Maintain the current furniture layout, flooring, and architecture unless explicitly asked to change them.
              3. Incremental Edit: Apply ONLY the requested changes (e.g., if asked for wall color, only change the walls). 
              4. Realistic Output: Professional 8k interior visualization.` }, 
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

      if (!imageBase64) throw new Error(`${IMAGE_MODEL} returned no image data for remediation.`);
      console.log(`[OpenRouter] Remediation successful via ${IMAGE_MODEL}.`);
    } catch (err: any) {
      throw new Error(`Remediation failed on ${IMAGE_MODEL}: ${err.message}`);
    }

    if (!imageBase64) throw new Error("Failed to extract remediated base64 payload");

    res.status(200).json({ redesignedImage: imageBase64 });
    console.log("--- Remediation Successful ---");
  } catch (error: any) {
    console.error("Remediation failed", error);
    res.status(500).json({ error: "Remediation failed", details: error.message });
  }
});

// ── POST /api/detect-objects ──────────────────────────────────────────────

app.post("/api/detect-objects", async (req, res) => {
  console.log("\n--- New Object Detection Request Received (YOLO11-seg) ---");
  try {
    const { redesignedImage } = req.body;
    if (!redesignedImage) return res.status(200).json([]); // Never break frontend

    const imageUrl = redesignedImage.startsWith("data:") ? redesignedImage : `data:image/jpeg;base64,${redesignedImage}`;

    console.log(`[YOLO] Sending request to Python microservice at localhost:8000...`);
    
    // Call Python microservice
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
    
    try {
      const response = await fetch("http://localhost:8000/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageUrl }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Python microservice returned status: ${response.status}`);
      }
      
      const detections = await response.json();
      console.log(`[YOLO] Detection complete. Found ${detections.length} items.`);
      res.status(200).json(detections);
      
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      console.error(`[YOLO] Microservice unavailable or failed: ${fetchErr.message}`);
      console.log("[YOLO] Falling back to graceful empty response (project continues working)");
      res.status(200).json([]);
    }

  } catch (error: any) {
    console.error("\n--- OBJECT DETECTION ERROR (FORCED SUCCESS) ---");
    console.error(error);
    res.status(200).json([]); // Always return empty array [] to prevent frontend 500 crashes
  }
});

// ── POST /api/search-products ──────────────────────────────────────────────

app.post("/api/search-products", async (req, res) => {
  const { productName, color, style, material, location } = req.body;
  console.log(`\n--- Product Search: ${style} ${color} ${productName} in ${location} ---`);

  if (!SERPER_API_KEY) {
    return res.status(500).json({ error: "Serper API key not configured" });
  }

  try {
    const query = `${color} ${style} ${productName} ${material} furniture India`.trim();
    
    const serperResponse = await fetch("https://google.serper.dev/shopping", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        gl: "in",
        location: "India",
      }),
    });

    const data = await serperResponse.json();
    const topResults = (data.shopping || []).slice(0, 5).map((item: any) => ({
      name: item.title,
      price: item.price,
      image: item.imageUrl,
      link: item.link,
      rating: item.rating || (Math.random() * 1.5 + 3.5).toFixed(1),
      seller: item.source || "Marketplace"
    }));

    // Pre-computed platform links
    const searchEncoded = encodeURIComponent(query);
    const platformLinks = {
      amazon: `https://www.amazon.in/s?k=${searchEncoded}`,
      flipkart: `https://www.flipkart.com/search?q=${searchEncoded}`,
      pepperfry: `https://www.pepperfry.com/site_product/search?q=${searchEncoded}`,
      urbanladder: `https://www.urbanladder.com/products/search?keywords=${searchEncoded}`,
      indiamart: `https://www.indiamart.com/search.mp?ss=${searchEncoded}`,
      nearby: `https://www.google.com/maps/search/furniture+stores+near+${encodeURIComponent(location || 'me')}`
    };

    res.status(200).json({
      products: topResults,
      platformLinks
    });

  } catch (error: any) {
    console.error("Serper Search Error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
