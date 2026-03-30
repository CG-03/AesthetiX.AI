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
          "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct/v1/chat/completions",
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

    // 2. Image Generation using FLUX.1-schnell
    const generateImage = async (promptText: string, label: string) => {
      try {
        console.log(`\n[FLUX - ${label}] Sending prompt: ${promptText}`);
        const response = await fetch(
          "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
          {
            headers: {
              "Authorization": `Bearer ${process.env.FLUX_API}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ inputs: promptText }),
          }
        );

        if (!response.ok) {
          const errText = await response.text();
          console.error(`[FLUX - ${label}] API Error (${response.status}):\n`, errText);
          return null; // Frontend hides the box if null
        }
        
        const buffer = await response.arrayBuffer();
        console.log(`[FLUX - ${label}] Success! Received image buffer of size: ${buffer.byteLength} bytes`);
        const base64Img = Buffer.from(buffer).toString('base64');
        return `data:image/jpeg;base64,${base64Img}`;
      } catch (err: any) {
        console.error(`[FLUX - ${label}] Network/Fetch Exception:`, err.message);
        return null;
      }
    };

    // Parallel Execution - wrapped so exceptions here don't break the server
    console.log("\nStarting parallel AI tasks...");
    const [analysisResultText, daylightImage, nighttimeImage] = await Promise.all([
      generateText(analysisPrompt),
      generateImage(daylightPrompt, "Daylight"),
      generateImage(nighttimePrompt, "Nighttime")
    ]);

    // Send successful response to client (STRUCTURED JSON)
    res.status(200).json({
      text: analysisResultText,
      daylightImage: daylightImage,
      nighttimeImage: nighttimeImage
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
