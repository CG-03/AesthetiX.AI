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

    // Define Prompts
    const analysisPrompt = `Expert AI Interior Designer: Analyze ${roomType || 'room'} in ${style || 'modern'} style. Facing ${direction || 'North'} in ${location || 'city'}. Budget ₹${budget || '50000'}. Return analysis, layout design, color palette (Vastu), lighting, furniture links, and cost estimation.`;
    const daylightPrompt = `REDESIGN RENDER: ${roomType || 'room'}, ${style || 'modern'} style, bright natural light from ${direction || 'North'}. Professional, realistic interior design.`;
    const nighttimePrompt = `REDESIGN RENDER: ${roomType || 'room'}, ${style || 'modern'} style, artificial ambient lighting. Professional, realistic interior design.`;

    // 1. Text Analysis using Qwen2.5-72B-Instruct
    const generateText = async (promptText: string) => {
      try {
        console.log(`[QWEN] Generating text analysis...`);
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
          console.error(`[QWEN] API Error (${response.status}):`, errText);
          return `AI Analysis unavailable right now. Error: ${response.status} - ${errText}`;
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
      } catch (err: any) {
        console.error(`[QWEN] Network/Fetch Exception:`, err.message);
        return "Internal error analyzing text.";
      }
    };

    // 2. Image Generation using FLUX.1-schnell
    const generateImage = async (promptText: string, label: string) => {
      try {
        console.log(`[FLUX - ${label}] Generating image...`);
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
          console.error(`[FLUX - ${label}] API Error (${response.status}):`, errText);
          return null;
        }
        
        const buffer = await response.arrayBuffer();
        const base64Img = Buffer.from(buffer).toString('base64');
        return `data:image/jpeg;base64,${base64Img}`;
      } catch (err: any) {
        console.error(`[FLUX - ${label}] Network/Fetch Exception:`, err.message);
        return null;
      }
    };

    // Parallel Execution - wrapped so exceptions here don't break the server
    console.log("Starting parallel AI tasks...");
    const [analysisResultText, daylightImage, nighttimeImage] = await Promise.all([
      generateText(analysisPrompt),
      generateImage(daylightPrompt, "Daylight"),
      generateImage(nighttimePrompt, "Nighttime")
    ]);

    // Send successful response to client
    res.status(200).json({
      text: analysisResultText,
      daylightImage,
      nighttimeImage
    });

    console.log("--- Request Completed ---\n");

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
