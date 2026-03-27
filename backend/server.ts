import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/api/analyze', async (req, res) => {
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

    const base64Data = image.split(',')[1];
    const mimeType = "image/jpeg";

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType
      }
    };

    // 1. Generate Analysis Text
    const analysisPrompt = `
      You are an expert AI Interior Designer specializing in Indian homes. 
      Analyze this room image and provide a comprehensive redesign plan for a ${roomType} in "${style}" style.
      
      Context:
      - Room Type: ${roomType}
      - Style: ${style}
      - Budget: ₹${budget}
      - Ownership: ${ownership}
      - Facing Direction: ${direction} (Crucial for Vastu and Lighting)
      - Location: ${location} (For local labor and product availability)
      - Pinterest/Inspiration: ${pinterestUrl ? `User likes this vibe: ${pinterestUrl}` : 'Use standard style guidelines'}

      Consider:
      - Room layout and dimensions
      - Lighting direction and natural light based on ${direction} facing windows
      - Furniture placement and ergonomics
      - Vastu Shastra principles for ${roomType} facing ${direction}
      - Renter vs owner constraints (${ownership})
      - Indian product availability (IKEA India, Pepperfry, Urban Ladder, Amazon.in, local markets)
      - Budget optimization (₹${budget} total)

      Return output in this exact format:

      ROOM ANALYSIS
      Describe current layout, identify the current design style, and highlight issues/strengths. Mention how the ${direction} direction affects the space.

      DESIGN PLAN
      Suggest improved layout strategy and overall vision for the ${style} style.

      COLOR PALETTE
      Recommend wall and decor colors that are strictly Vastu-compliant for a ${direction} facing ${roomType}. Use warm, inviting tones (e.g., specific Asian Paints shades like 'Morning Glory' or 'Warm Shell').

      LIGHTING PLAN
      Suggest lighting improvements (ambient, task, and accent). Distinguish between natural light optimization and artificial lighting.

      FURNITURE SUGGESTIONS
      Recommend budget-friendly furniture items within the ₹${budget} budget.

      COMPREHENSIVE COST ESTIMATION
      - Ready-Made Route: Total cost of retail products + local labor/renovation (Mumbai/Local rates).
      - Custom-Built Route: Estimate for hiring a local carpenter to custom-build furnishings, breaking down raw material vs labor.

      SHOPPING CHECKLIST
      Provide an itemized list of products featured in the renders with direct purchase links (placeholders) and prices.
    `;

    // 2. Generate Renders (Prompts)
    const daylightPrompt = `Redesign this ${roomType} in a "${style}" style. 
    DAYLIGHT RENDER: Show the reimagined space illuminated by bright natural light coming from the ${direction} direction.
    The redesign should follow Vastu principles and use warm, inviting color tones.
    The redesign should look modern, professional, and realistic. 
    Incorporate a budget of ₹${budget} for furniture and decor. 
    Ensure the lighting is improved and the layout is optimized for the ${style} aesthetic. 
    Keep the core structural elements but transform the furniture, wall colors, and decor.`;

    const nighttimePrompt = `Redesign this ${roomType} in a "${style}" style. 
    NIGHTTIME RENDER: Show the reimagined space illuminated by suggested artificial lighting (warm lamps, ceiling lights, ambient LEDs).
    The redesign should follow Vastu principles and use warm, inviting color tones.
    The redesign should look modern, professional, and realistic. 
    Incorporate a budget of ₹${budget} for furniture and decor. 
    Ensure the lighting is improved and the layout is optimized for the ${style} aesthetic. 
    Keep the core structural elements but transform the furniture, wall colors, and decor.`;

    // Run calls in parallel for better performance
    const [analysisResult, daylightResult, nighttimeResult] = await Promise.all([
      model.generateContent([analysisPrompt, imagePart]),
      model.generateContent([daylightPrompt, imagePart]),
      model.generateContent([nighttimePrompt, imagePart])
    ]);

    const getImageUrl = (result: any) => {
      const response = result.response;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    };

    res.json({
      text: analysisResult.response.text(),
      daylightImage: getImageUrl(daylightResult),
      nighttimeImage: getImageUrl(nighttimeResult)
    });

  } catch (error: any) {
    console.error('Error analyzing room:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
