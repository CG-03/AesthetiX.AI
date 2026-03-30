import 'dotenv/config'; // Ensure dotenv is first to load keys before anything else

import express from 'express';
import cors from 'cors';
import { Buffer } from 'buffer';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check route
app.get('/', (req, res) => {
  res.send({ status: 'online', message: 'VastuVision AI Backend is running' });
});

app.post('/api/analyze', async (req, res) => {
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
      pinterestUrl
    } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Define Prompts combining all requested inputs
    const analysisPrompt = `Expert AI Interior Designer: You are analyzing a ${roomType || 'room'} for a ${ownership || 'homeowner'} in ${location || 'the city'}. The desired style is ${style || 'modern'}, facing ${direction || 'North'}, with a budget of ₹${budget || '50000'}. Please provide a detailed design analysis, layout design, Vastu-compliant color palette, lighting suggestions, shoppable furniture links, and a cost estimation.`;
    const daylightPrompt = `${roomType || 'room'}, ${style || 'modern'} style interior design, tailored for a ${ownership || 'homeowner'} in ${location || 'the city'}. Bright natural sunlight from ${direction || 'North'} facing window. High quality, realistic, professional architecture visualization, 8k resolution.`;
    const nighttimePrompt = `${roomType || 'room'}, ${style || 'modern'} style interior design, tailored for a ${ownership || 'homeowner'} in ${location || 'the city'}. Cinematic artificial evening lighting, cozy ambiance. High quality, realistic, professional architecture visualization, 8k resolution.`;

    // 1. Text Analysis using Qwen2.5-72B-Instruct
    const generateText = async (promptText: string) => {
      try {
        console.log(`\n[QWEN] Sending prompt: ${promptText}`);
        const response = await fetch(
          "https://router.huggingface.co/v1/chat/completions",
          {
            headers: {
              "Authorization": `Bearer ${process.env.QWEN_API}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              model: "Qwen/Qwen2.5-72B-Instruct",
              messages: [{ role: "user", content: promptText }],
              max_tokens: 1500,
            }),
          }
        );

        if (!response.ok) {
          const errText = await response.text();
          console.error(`[QWEN] API Error (${response.status}):\n`, errText);
          return `AI Analysis unavailable right now. Error: ${response.status} - ${errText}`;
        }

        const data = await response.json();
        console.log(`[QWEN] Success! Response JSON preview:\n`, JSON.stringify(data).substring(0, 200) + '...');
        return data.choices && data.choices[0] ? data.choices[0].message.content : JSON.stringify(data);
      } catch (err: any) {
        console.error(`[QWEN] Network/Fetch Exception:`, err.message);
        return "Internal error analyzing text.";
      }
    };

    const designPrompt = `REDESIGN RENDER: ${roomType || 'room'}, ${style || 'modern'} style interior design, tailored for a ${ownership || 'homeowner'} in ${location || 'the city'}. High quality, realistic, professional architecture visualization, 8k resolution.`;

    const generateDepthMap = async (baseImage: string) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000); // 120 seconds timeout
      try {
        console.log(`\n[ControlNet - Step 1] Extracting depth map...`);
        // User requested calling lllyasviel/sd-controlnet-depth for depth extraction
        const response = await fetch(
          "https://router.huggingface.co/hf-inference/models/lllyasviel/sd-controlnet-depth",
          {
            headers: {
              "Authorization": `Bearer ${process.env.FLUX_API}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              inputs: baseImage
            }),
            signal: controller.signal
          }
        );

        clearTimeout(timeout);

        if (!response.ok) {
          const errText = await response.text();
          console.error(`[ControlNet - Step 1] API Error (${response.status}):\n`, errText);
          return null;
        }

        const resBuffer = await response.arrayBuffer();
        console.log(`[ControlNet - Step 1] Success! Depth buffer size: ${resBuffer.byteLength} bytes`);
        return Buffer.from(resBuffer).toString('base64');
      } catch (err: any) {
        clearTimeout(timeout);
        console.error(`[ControlNet - Step 1] Network/Fetch Exception:`, err.message);
        return null;
      }
    };

    const generateRedesign = async (depthBase64: string, promptText: string) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000); // 120 seconds timeout
      try {
        console.log(`\n[ControlNet - Step 2] Generating redesign from depth map...`);
        const response = await fetch(
          "https://router.huggingface.co/hf-inference/models/lllyasviel/sd-controlnet-depth",
          {
            headers: {
              "Authorization": `Bearer ${process.env.FLUX_API}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              inputs: depthBase64,
              parameters: { prompt: promptText }
            }),
            signal: controller.signal
          }
        );

        clearTimeout(timeout);

        if (!response.ok) {
          const errText = await response.text();
          console.error(`[ControlNet - Step 2] API Error (${response.status}):\n`, errText);
          return null;
        }

        const resBuffer = await response.arrayBuffer();
        console.log(`[ControlNet - Step 2] Success! Redesign buffer size: ${resBuffer.byteLength} bytes`);
        return Buffer.from(resBuffer).toString('base64');
      } catch (err: any) {
        clearTimeout(timeout);
        console.error(`[ControlNet - Step 2] Network/Fetch Exception:`, err.message);
        return null;
      }
    };

    // Sequential & Parallel Execution
    console.log("\nStarting AI tasks...");

    // Base64 manipulation: strip data header if present for HF APIs that expect pure base64
    const cleanBase64 = image.includes(",") ? image.split(",")[1] : image;

    // 1. Start Qwen Analysis and Depth Extraction in parallel
    const textPromise = generateText(analysisPrompt);
    const depthBase64 = await generateDepthMap(cleanBase64);

    // 2. Once Depth is extracted, run ControlNet redesign using the depth map
    let redesignBase64 = null;
    if (depthBase64) {
      redesignBase64 = await generateRedesign(depthBase64, designPrompt);
    } else {
      console.error("Skipping redesign because depth map extraction failed.");
    }

    const analysisResultText = await textPromise;

    // Send successful response to client returning depth and styled image
    res.status(200).json({
      text: analysisResultText,
      depthMapImage: depthBase64 ? `data:image/jpeg;base64,${depthBase64}` : null,
      redesignedImage: redesignBase64 ? `data:image/jpeg;base64,${redesignBase64}` : null
    });

    console.log("\n--- Request Completed Successfully ---");

  } catch (error: any) {
    console.error('\n--- CRITICAL ENDPOINT ERROR ---');
    console.error(error);
    // Safely send the error to frontend instead of breaking connection
    res.status(500).json({
      error: 'Endpoint internal crash',
      details: error?.message || String(error)
    });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
