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

// ── Startup checks ────────────────────────────────────────────────────────
if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.length < 20) {
  console.error("[STARTUP] ERROR: OPENROUTER_API_KEY is missing or invalid in backend/.env!");
} else {
  console.log(`[STARTUP] OpenRouter API key loaded: ${OPENROUTER_API_KEY.substring(0, 12)}...`);
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

    const designPrompt = `REDESIGN RENDER: ${roomType || "room"}, ${style || "modern"} style interior design, tailored for a ${ownership || "homeowner"} in ${location || "the city"}. High quality, realistic, professional architecture visualization, 8k resolution. 
CRITICAL ARCHITECTURAL LOCK: Use the provided image as the ABSOLUTE structural template. PRESERVE EXACTLY all walls, windows, doors, pillars, ceiling height, and floor boundaries. Do NOT add new windows, shift walls, or change room dimensions. This is an interior decor replacement ONLY. Structural accuracy is the highest priority.`;
    
    const nightPrompt = `TRANSFORM TO NIGHTTIME: Maintain the EXACT interior design, layout, and furniture from the daylight image. Modify ONLY the lighting. Create a warm, dramatic nighttime ambient scene. Turn on all interior lamps, accent lights, and LEDs. Windows should show a dark night exterior. No structural changes.`;

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

    const combinedDayPrompt = `${designPrompt}\n\nBased on your analysis of the original room:\n${analysisResultText.substring(0, 500)}`;

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
      details: msg,
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
  console.log("\n--- New Object Detection Request Received ---");
  try {
    const { redesignedImage, analysisText } = req.body;
    if (!redesignedImage) return res.status(400).json({ error: "Image required" });

    const imageUrl = redesignedImage.startsWith("data:") ? redesignedImage : `data:image/jpeg;base64,${redesignedImage}`;

    // 1. Vision Detection via TEXT_MODEL
    const visionPrompt = "Look at this interior design image. Provide a JSON array of all furniture and decor items you see. For each item include: name, color, style, and a boundingBox object with 'x', 'y', 'width', 'height' representing the object's position and size in percentages (0-100) relative to the image dimensions. Return ONLY the JSON array.";

    let visionDetected: any[] = [];
    try {
      console.log(`[SAM] Starting Vision Detection via ${TEXT_MODEL}...`);
      const visionResult = await openrouterChat(
        TEXT_MODEL,
        [
          {
            role: "user",
            content: [
              { type: "text", text: visionPrompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ]
      );
      
      const content = visionResult?.choices?.[0]?.message?.content || "[]";
      const jsonStr = content.includes("```json") 
        ? content.split("```json")[1].split("```")[0].trim()
        : content.includes("```") 
          ? content.split("```")[1].split("```")[0].trim()
          : content.trim();
      
      const parsed = JSON.parse(jsonStr);
      visionDetected = Array.isArray(parsed) ? parsed : (parsed.items || []);
      console.log(`[SAM] Vision Success via ${TEXT_MODEL}.`);
    } catch (err: any) {
      console.warn(`[SAM] Vision detection failed: ${err.message}. Falling back to text analysis only.`);
    }

    // 2. Text-based Keyword Extraction (Fallback/Supplementary)
    const textDetected: any[] = [];
    if (analysisText) {
      const lowerText = analysisText.toLowerCase();
      Object.keys(HEURISTIC_BOUNDING_BOXES).forEach(keyword => {
        if (lowerText.includes(keyword)) {
          // Simple color/style lookup around keyword (best effort)
          const words = lowerText.split(/\s+/);
          const index = words.indexOf(keyword);
          const context = words.slice(Math.max(0, index - 3), index + 3).join(" ");
          
          textDetected.push({
            name: `${keyword}`,
            label: keyword,
            context: context
          });
        }
      });
    }

    // 3. Merge and Assign Bounding Boxes
    const finalObjects: any[] = [];
    const seenLabels = new Set();
    let idCounter = 1;

    // Process vision results first as they are more accurate to current image
    visionDetected.forEach((item: any) => {
      const label = item.name || item.label || "item";
      const catKey = Object.keys(KEYWORD_MAP).find(k => label.toLowerCase().includes(k)) || "decor";
      const category = KEYWORD_MAP[catKey] || "decor";
      
      let box = HEURISTIC_BOUNDING_BOXES[catKey] || HEURISTIC_BOUNDING_BOXES["wall art"];
      if (item.boundingBox && typeof item.boundingBox.x === 'number') {
        box = {
          x: item.boundingBox.x,
          y: item.boundingBox.y,
          width: item.boundingBox.width || 20,
          height: item.boundingBox.height || 20
        };
      }

      finalObjects.push({
        id: idCounter++,
        label: label.toLowerCase(),
        category: category,
        color: item.color || "unknown",
        style: item.style || "modern",
        position: item.position || "center",
        boundingBox: box
      });
      seenLabels.add(label.toLowerCase());
    });

    // Add text-based items if they weren't caught by vision
    textDetected.forEach((item: any) => {
      if (!Array.from(seenLabels).some(l => (l as string).includes(item.label))) {
        const catKey = item.label;
        const category = KEYWORD_MAP[catKey] || "decor";
        const box = HEURISTIC_BOUNDING_BOXES[catKey] || HEURISTIC_BOUNDING_BOXES["wall art"];

        finalObjects.push({
          id: idCounter++,
          label: item.label,
          category: category,
          color: "matching",
          style: "modern",
          position: "center",
          boundingBox: box
        });
      }
    });

    console.log(`[SAM] Detected objects: ${finalObjects.map((o: any) => o.label).join(", ")}`);
    res.status(200).json(finalObjects);

  } catch (error: any) {
    console.error("\n--- OBJECT DETECTION ERROR ---");
    console.error(error);
    res.status(500).json({ error: "Detection failed", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
