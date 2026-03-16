import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

enum ThinkingLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateLLMItinerary(data: any) {
  const prompt = `
You are a professional travel planner AI.

Create a smart, fully timed itinerary for the trip.

Destination: ${data.destination}
Dates: ${data.startDate} to ${data.endDate} (${data.days} days)
Arrival Time: ${data.arrival}
Budget: ${data.budget}
Primary Interests: ${data.tripType || "leisure"}
Companion: ${data.companion || "Solo"}
Travel Pace: ${data.pace || "Moderate"}
Dietary Restrictions: ${data.dietary || "None"}
Preferred Intercity Transit: ${data.transitMode || "Any"}

Additional User Requests/Notes:
${data.customNotes ? data.customNotes : "None"}

Include hotels, food breaks, and local attractions based on the provided data.
Consider travel time, traffic, and weather.
Optimize stay duration per place according to the "Travel Pace" and avoid hectic schedules unless the pace is "Fast-paced".
Adjust activities appropriately for the "Companion" type (e.g., kid-friendly for Family, romantic for Couple).
Ensure all restaurant recommendations align with the stated "Dietary Restrictions".
If the user provided "Additional User Requests/Notes", you must prioritize those instructions significantly and tailor the itinerary exactly to those whims.
Provide intercity transport recommendations if traveling between major areas.
For each activity, provide ADDON data like an explanation, suggested map search links, or photo descriptions.

Places:
${JSON.stringify(data.places)}

Restaurants:
${JSON.stringify(data.restaurants)}

Hotels:
${JSON.stringify(data.hotels)}

Return ONLY valid JSON in this exact format with no additional text or markdown:

{
 "day1":[
  {
    "time":"10:00",
    "activity":"Arrive at station",
    "description":"Detailed advice or photo description",
    "mapLink":"https://maps.google.com/?q=Station",
    "transit":"Recommended mode to reach here"
  },
  {
    "time":"10:30",
    "activity":"Reach hotel",
    "description":"Check in and relax",
    "mapLink":"https://maps.google.com/?q=Hotel",
    "transit":"Walk 5 mins"
  }
 ],
 "day2": [...]
}
`;

  const config = {
    thinkingConfig: {
      thinkingLevel: ThinkingLevel.HIGH,
    },
    tools: [
      {
        googleSearch: {},
      },
    ],
    responseMimeType: 'text/plain',
  };

  const model = "gemini-3.1-pro-preview";
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