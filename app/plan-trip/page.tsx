"use client";

import { useState } from "react";
import ItineraryCard from "../../components/ItineraryCard";

type Place = { name: string; rating?: number };

export default function PlanTrip() {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("");
  const [arrivalTime, setArrivalTime] = useState("10:00");
  const [tripType, setTripType] = useState("Solo");

  const [generatedDays, setGeneratedDays] = useState<number[]>([]);
  const [hotels, setHotels] = useState<Place[]>([]);
  const [restaurants, setRestaurants] = useState<Place[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [aiPlan, setAiPlan] = useState<any>({});

  const cleanName = (name: string) => name.split("|")[0].trim();

  // Time helper
  const addMinutes = (time: string, mins: number) => {
    const [h, m] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(h);
    date.setMinutes(m + mins);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const generateItinerary = async () => {
    const totalDays = Number(days);
    if (!destination || !totalDays) return;

    setGeneratedDays(Array.from({ length: totalDays }, (_, i) => i + 1));

    try {
      // Fetch top options from APIs
      const [placesRes, hotelsRes, foodRes] = await Promise.all([
        fetch(`/api/places?destination=${destination}`),
        fetch(`/api/hotels?destination=${destination}`),
        fetch(`/api/restaurants?destination=${destination}`),
      ]);

      const [placesData, hotelsData, foodData] = await Promise.all([
        placesRes.json(),
        hotelsRes.json(),
        foodRes.json(),
      ]);

      setPlaces(Array.isArray(placesData) ? placesData : []);
      setHotels(Array.isArray(hotelsData) ? hotelsData : []);
      setRestaurants(Array.isArray(foodData) ? foodData : []);

      // Pick top-rated options
      const topPlaces = (placesData || [])
        .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10);
      const topRestaurants = (foodData || [])
        .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10);
      const topHotels = (hotelsData || [])
        .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 5);

      // Call LLM API
      const aiRes = await fetch("/api/ai-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          arrival: arrivalTime,
          days: totalDays,
          tripType,
          budget,
          places: topPlaces,
          restaurants: topRestaurants,
          hotels: topHotels,
        }),
      });

      const llmPlan = await aiRes.json();
      setAiPlan(llmPlan);
    } catch (err) {
      console.error("Error generating itinerary:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-8">Plan Your Trip</h1>

      <div className="flex flex-col gap-4 max-w-md">
        <input
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="p-3 rounded bg-gray-800"
        />
        <input
          placeholder="Budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="p-3 rounded bg-gray-800"
        />
        <input
          placeholder="Number of Days"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="p-3 rounded bg-gray-800"
        />
        <input
          type="time"
          value={arrivalTime}
          onChange={(e) => setArrivalTime(e.target.value)}
          className="p-3 rounded bg-gray-800"
        />
        <select
          value={tripType}
          onChange={(e) => setTripType(e.target.value)}
          className="p-3 rounded bg-gray-800"
        >
          <option>Solo</option>
          <option>Group</option>
        </select>
        <button
          onClick={generateItinerary}
          className="bg-blue-500 p-3 rounded hover:bg-blue-600"
        >
          Generate Itinerary
        </button>
      </div>

      <div className="mt-12 max-w-md space-y-10">
        {generatedDays.map((day) => {
          const dayPlan = aiPlan[`day${day}`] || [];

          return (
            <div key={day} className="space-y-4">
              <h2 className="text-2xl font-semibold">
                Day {day} – {destination}
              </h2>

              <ItineraryCard
                time="Stay"
                duration="Hotel"
                options={
                  hotels.length
                    ? hotels.map(
                        (h) => `${cleanName(h.name)} ⭐ ${h.rating ?? "4.0"}`
                      )
                    : ["Loading hotels..."]
                }
              />

              {dayPlan.map((item: any, idx: number) => (
                <ItineraryCard
                  key={idx}
                  time={item.time}
                  duration={item.duration || "1h"}
                  options={[item.activity]}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}