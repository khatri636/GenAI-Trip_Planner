import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

enum ThinkingLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export async function generateLLMItinerary(data: any) {
  const prompt = `
You are a professional travel planner AI.

Create a smart, fully timed itinerary for the trip.

Destination: ${data.destination}
Arrival Time: ${data.arrival}
Days: ${data.days}
Trip Type: ${data.tripType || "leisure"}

Include hotels, food breaks, and local attractions.
Consider travel time, traffic, and weather.
Optimize stay duration per place and avoid hectic schedules.

Places:
${JSON.stringify(data.places)}

Restaurants:
${JSON.stringify(data.restaurants)}

Hotels:
${JSON.stringify(data.hotels)}

Return ONLY valid JSON in this exact format with no additional text or markdown:

{
 "day1":[
  {"time":"10:00","activity":"Arrive at station"},
  {"time":"10:30","activity":"Reach hotel"},
  {"time":"11:15","activity":"Breakfast"},
  {"time":"12:30","activity":"Visit local attraction"}
 ],
 "day2": [...]
}
`;

  const config = {
    tools: [
      {
        googleSearch: {},
      },
    ],
  };

  const model = "gemini-3-flash-preview";
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: prompt,
        },
      ],
    },
  ];

  let fullText = "";
  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });

  for await (const chunk of response) {
    if (chunk.text) {
      fullText += chunk.text;
    }
  }

  // Extract JSON from response (handles thinking blocks, markdown, etc.)
  const jsonMatch = fullText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in response: " + fullText.substring(0, 200));
  }
  
  const cleaned = jsonMatch[0];
  return JSON.parse(cleaned);
}