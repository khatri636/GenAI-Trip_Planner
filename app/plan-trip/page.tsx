/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ItineraryCard from "../../components/ItineraryCard";
import MapView from "../../components/Map";
import LoadingOverlay from "../../components/LoadingOverlay";
// @ts-ignore - react-icons submodules
import { HiSparkles } from "react-icons/hi2";
// @ts-ignore - react-icons submodules
import { FaMapLocationDot, FaCalendar, FaMoneyBillWave, FaClock, FaUser, FaLeaf, FaUtensils, FaFloppyDisk } from "react-icons/fa6";
// @ts-ignore - react-icons submodules
import { MdFlightTakeoff, MdDirectionsRun } from "react-icons/md";

type Place = {
  name: string;
  rating?: number;
  photo_reference?: string | null;
  location?: { lat: number; lng: number } | null;
};

function PlanTripContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("Moderate");

  // Create current date and date 3 days from now for defaults
  const today = new Date();
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(formatDate(today));
  const [endDate, setEndDate] = useState(formatDate(threeDaysFromNow));

  const [arrivalTime, setArrivalTime] = useState("10:00");
  const [tripTypes, setTripTypes] = useState<string[]>(["Leisure"]);
  const [companion, setCompanion] = useState("Solo");
  const [pace, setPace] = useState("Moderate");

  // New options
  const [dietary, setDietary] = useState("None");
  const [transitMode, setTransitMode] = useState("Any");
  const [customNotes, setCustomNotes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [generatedDays, setGeneratedDays] = useState<number[]>([]);
  const [hotels, setHotels] = useState<Place[]>([]);
  const [restaurants, setRestaurants] = useState<Place[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [aiPlan, setAiPlan] = useState<any>({});
  const [activeDay, setActiveDay] = useState<number>(1);

  const cleanName = (name: string) => name.split("|")[0].trim();

  // Helper function to find restaurants by area/location
  const findRestaurantByArea = (activityStr: string): Place | undefined => {
    // Extract area names (after @ or last capitalized word sequence)
    const areaPatterns = [
      /@\s*([A-Za-z\s]+?)(?:\s*-|,|$)/,  // @Jia Sarai
      /(?:at|in)\s+([A-Z][A-Za-z\s]+?)(?:\s*-|,|$)/,  // at Jia Sarai
    ];
    
    for (const pattern of areaPatterns) {
      const match = activityStr.match(pattern);
      if (match && match[1]) {
        const areaName = match[1].trim().toLowerCase();
        // Search in restaurants and places for area mentions
        const found = restaurants.find(r => 
          r.name.toLowerCase().includes(areaName)
        );
        if (found) return found;
      }
    }
    
    // Try to find restaurants that are in the same general category (food/dining)
    if (activityStr.toLowerCase().includes('lunch') || 
        activityStr.toLowerCase().includes('dinner') || 
        activityStr.toLowerCase().includes('breakfast') ||
        activityStr.toLowerCase().includes('eat')) {
      return restaurants[0]; // Return first restaurant as fallback for food activities
    }
    
    return undefined;
  };

  useEffect(() => {
    const tripId = searchParams.get("tripId");
    if (tripId) {
      setIsLoading(true);
      fetch(`/api/trips?id=${tripId}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            setDestination(data.destination || "");
            setStartDate(data.startDate || formatDate(today));
            setEndDate(data.endDate || formatDate(threeDaysFromNow));
            setBudget(data.budget || "Moderate");
            setArrivalTime(data.arrival || "10:00");
            setTripTypes(data.tripType ? data.tripType.split(", ") : ["Leisure"]);
            setCompanion(data.companion || "Solo");
            setPace(data.pace || "Moderate");
            setDietary(data.dietary || "None");
            setTransitMode(data.transitMode || "Any");
            setCustomNotes(data.customNotes || "");
            setHotels(data.hotels || []);
            setAiPlan(data.aiPlan || {});
            const totalDays = data.days || Object.keys(data.aiPlan || {}).length;
            setGeneratedDays(Array.from({ length: totalDays }, (_, i) => i + 1));
          }
        })
        .catch(err => {
          console.error("Error loading trip:", err);
          setError("Failed to load saved trip.");
        })
        .finally(() => setIsLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const saveTrip = async () => {
    if (!destination || generatedDays.length === 0 || Object.keys(aiPlan).length === 0) return;
    
    setIsSaving(true);
    try {
      const tripData = {
        destination,
        startDate,
        endDate,
        arrival: arrivalTime,
        days: generatedDays.length,
        tripType: tripTypes.join(", "),
        companion,
        pace,
        budget,
        dietary,
        transitMode,
        customNotes,
        hotels,
        aiPlan
      };

      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripData),
      });

      if (!res.ok) throw new Error("Failed to save");
      
      const data = await res.json();
      router.replace(`/plan-trip?tripId=${data.id}`);
      alert("Trip saved successfully! You can share this URL.");
    } catch (err) {
      console.error(err);
      alert("Failed to save trip.");
    } finally {
      setIsSaving(false);
    }
  };

  const getMapLocations = useMemo(() => {
    if (!aiPlan[`day${activeDay}`]) return [];
    
    const locations: any[] = [];
    
    if (activeDay === 1 && hotels.length > 0 && hotels[0].location) {
      locations.push({
        lat: hotels[0].location.lat,
        lng: hotels[0].location.lng,
        name: hotels[0].name
      });
    }

    const dayPlan = aiPlan[`day${activeDay}`] || [];
    
    dayPlan.forEach((item: any) => {
      const match = [...places, ...restaurants].find(p => 
        item.activity.toLowerCase().includes(p.name.toLowerCase()) || 
        p.name.toLowerCase().includes(item.activity.toLowerCase())
      );
      
      if (match && match.location) {
        locations.push({
          lat: match.location.lat,
          lng: match.location.lng,
          name: match.name
        });
      }
    });

    return locations;
  }, [aiPlan, activeDay, hotels, places, restaurants]);

  const handleEditActivity = async (dayString: string, itemIdx: number, customPrompt: string) => {
    try {
      const dayPlan = aiPlan[dayString];
      const itemToEdit = dayPlan[itemIdx];

      // Optimistic or loading could be added here
      
      const res = await fetch("/api/edit-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentActivity: itemToEdit,
          time: itemToEdit.time,
          day: dayString,
          destination,
          customPrompt
        })
      });

      if (!res.ok) throw new Error("Failed to edit activity");
      const newActivity = await res.json();

      setAiPlan((prevStr: any) => {
        const copy = JSON.parse(JSON.stringify(prevStr));
        copy[dayString][itemIdx] = newActivity;
        return copy;
      });

    } catch (err) {
      console.error(err);
      alert("Failed to edit activity. Please try again.");
    }
  };

  const enrichActivity = (item: any) => {
    const activityStr = item.activity || "";
    const allLocations = [...places, ...restaurants, ...hotels];
    
    // Enhanced matching logic with multiple strategies
    let match = null;
    const activityLower = activityStr.toLowerCase();
    const activityWords = activityStr.split(/[\s,@.-]+/).filter((w: string) => w.length > 2);
    
    // 1. Try exact substring match
    match = allLocations.find(p => 
      activityLower.includes(p.name.toLowerCase()) || 
      p.name.toLowerCase().includes(activityLower)
    );
    
    // 2. If no exact match, try @ symbol splitting (e.g., "Dilli6@Jia Sarai")
    if (!match && activityStr.includes('@')) {
      const parts = activityStr.split('@');
      for (const part of parts) {
        const partTrim = part.trim().toLowerCase();
        match = allLocations.find(p => 
          p.name.toLowerCase().includes(partTrim) ||
          partTrim.includes(p.name.toLowerCase())
        );
        if (match) break;
      }
    }
    
    // 3. Extract place name from common meal/activity phrases
    if (!match) {
      const phrases = ['at ', 'in ', 'visit ', 'explore ', 'reach ', 'check-in at ', 'lunch at ', 'dinner at ', 'breakfast at ', 'hotel ', 'stay at ', 'go to '];
      for (const phrase of phrases) {
        const idx = activityLower.indexOf(phrase);
        if (idx !== -1) {
          let placeName = activityStr.substring(idx + phrase.length).split(/[,;]/)[0].trim();
          // Remove @ and everything after it if present
          if (placeName.includes('@')) {
            placeName = placeName.split('@')[0].trim();
          }
          if (placeName.length > 2) {
            match = allLocations.find(p => 
              p.name.toLowerCase().includes(placeName.toLowerCase()) ||
              placeName.toLowerCase().includes(p.name.toLowerCase())
            );
            if (match) break;
          }
        }
      }
    }
    
    // 4. Try matching with individual words (prioritize longer words)
    if (!match) {
      const sortedWords = [...activityWords].sort((a, b) => b.length - a.length);
      for (const word of sortedWords) {
        const wordLower = word.toLowerCase();
        match = allLocations.find(p => {
          const pNameLower = p.name.toLowerCase();
          return pNameLower.includes(wordLower) || wordLower.includes(pNameLower);
        });
        if (match) break;
      }
    }
    
    // 5. Try partial word matching (at least 70% match of word)
    if (!match) {
      for (const word of activityWords) {
        match = allLocations.find(p => {
          const pWords = p.name.split(/[\s,-]+/).map(w => w.toLowerCase());
          return pWords.some(pw => pw.startsWith(word.toLowerCase().substring(0, 3)));
        });
        if (match) break;
      }
    }
    
    // 6. Final fallback - try area-based search for food activities
    if (!match) {
      const areaMatch = findRestaurantByArea(activityStr);
      if (areaMatch) match = areaMatch;
    }
    
    if (match) {
      return {
        name: activityStr,
        rating: match.rating,
        photo_reference: match.photo_reference,
        location: match.location,
        description: item.description,
        mapLink: item.mapLink,
        transit: item.transit
      };
    }
    return {
      name: activityStr,
      description: item.description,
      mapLink: item.mapLink,
      transit: item.transit
    };
  };

  const calculateDays = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 1 : diffDays; // Minimum 1 day
  };

  const toggleInterest = (type: string) => {
    setTripTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const generateItinerary = async () => {
    const totalDays = calculateDays();
    if (!destination || totalDays <= 0) {
      setError(
        "Please fill in the destination and ensure end date is after start date.",
      );
      return;
    }

    setIsGenerating(true);
    setIsLoading(true);
    setError("");
    setGeneratedDays(Array.from({ length: totalDays }, (_, i) => i + 1));
    setAiPlan({});
    setHotels([]);

    try {
      // Fetch top options from APIs
      const [placesRes, hotelsRes, foodRes] = await Promise.all([
        fetch(`/api/places?destination=${destination}`),
        fetch(`/api/hotels?destination=${destination}`),
        fetch(`/api/restaurants?destination=${destination}`),
      ]);

      const [placesData, hotelsData, foodData] = await Promise.all([
        placesRes.ok ? placesRes.json() : [],
        hotelsRes.ok ? hotelsRes.json() : [],
        foodRes.ok ? foodRes.json() : [],
      ]);

      setPlaces(Array.isArray(placesData) ? placesData : []);
      setHotels(Array.isArray(hotelsData) ? hotelsData : []);
      setRestaurants(Array.isArray(foodData) ? foodData : []);

      // Pick top-rated options
      const topPlaces = (placesData || [])
        .sort((a: Place, b: Place) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10);
      const topRestaurants = (foodData || [])
        .sort((a: Place, b: Place) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 10);
      const topHotels = (hotelsData || [])
        .sort((a: Place, b: Place) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 5);

      // Call LLM API
      const aiRes = await fetch("/api/ai-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          arrival: arrivalTime,
          days: totalDays,
          tripType: tripTypes.join(", "),
          companion,
          pace,
          budget,
          dietary,
          transitMode,
          customNotes,
          places: topPlaces,
          restaurants: topRestaurants,
          hotels: topHotels,
        }),
      });

      if (!aiRes.ok) throw new Error("Failed to generate itinerary");

      const llmPlan = await aiRes.json();
      setAiPlan(llmPlan);
    } catch (err) {
      console.error("Error generating itinerary:", err);
      setError("Failed to generate itinerary. Please try again.");
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-black dark:via-slate-900 dark:to-black text-white p-6 md:p-12 font-sans relative overflow-hidden">
      <LoadingOverlay isOpen={isGenerating} destination={destination} />
      
      {/* Animated background elements */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MdFlightTakeoff className="text-5xl text-blue-400" />
          </div>
          <h1 className="text-6xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">
            Design Your Perfect Trip
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">Let AI create a personalized itinerary tailored to your style</p>
        </div>

        <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-10 shadow-2xl mb-12 relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl"></div>
          
          <div className="relative z-10">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 text-red-200 rounded-xl border border-red-500/50 backdrop-blur">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-200 uppercase tracking-wide">
                <FaMapLocationDot className="text-blue-400" />
                Where are you going?
              </label>
              <input
                placeholder="e.g. Kyoto, Japan or Paris, France"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-200 uppercase tracking-wide">
                <FaCalendar className="text-green-400" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-200 uppercase tracking-wide">
                <FaCalendar className="text-orange-400" />
                End Date
              </label>
              <input
                type="date"
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-200 uppercase tracking-wide">
                <FaMoneyBillWave className="text-yellow-400" />
                Budget
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15 appearance-none cursor-pointer"
              >
                <option value="Budget" className="bg-slate-800">Budget / Backpacker</option>
                <option value="Moderate" className="bg-slate-800">Moderate / Standard</option>
                <option value="Luxury" className="bg-slate-800">Luxury / Premium</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-200 uppercase tracking-wide">
                <FaClock className="text-pink-400" />
                Arrival Time
              </label>
              <input
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15"
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-200 uppercase tracking-wide">
                <MdDirectionsRun className="text-red-400" />
                Travel Pace
              </label>
              <div className="flex gap-3">
                {["Relaxed", "Moderate", "Fast-paced"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPace(p)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${
                      pace === p
                        ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/30 scale-105"
                        : "bg-white/10 border border-white/20 text-gray-200 hover:bg-white/15 backdrop-blur-sm"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-200 uppercase tracking-wide">
                <FaUser className="text-cyan-400" />
                Who&apos;s Going?
              </label>
              <div className="flex flex-wrap gap-3">
                {["Solo", "Couple", "Family", "Friends", "Business"].map(
                  (c) => (
                    <button
                      key={c}
                      onClick={() => setCompanion(c)}
                      className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all transform hover:scale-110 ${
                        companion === c
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 scale-110"
                          : "bg-white/10 border border-white/20 text-gray-200 hover:bg-white/15 backdrop-blur-sm"
                      }`}
                    >
                      {c}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-200 uppercase tracking-wide">
                <FaLeaf className="text-green-400" />
                Primary Interests (Select multiple)
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  "Leisure",
                  "Adventure",
                  "Culture",
                  "Food & Drink",
                  "Nature",
                  "Nightlife",
                  "Shopping",
                ].map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleInterest(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105 ${
                      tripTypes.includes(type)
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
                        : "bg-white/10 border border-white/20 text-gray-200 hover:bg-white/15 backdrop-blur-sm"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 md:col-span-2 mt-8 pt-8 border-t border-white/20">
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 uppercase tracking-wider">
                ✨ Additional Options
              </h3>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-200 uppercase tracking-wide">
                <FaUtensils className="text-orange-400" />
                Dietary Restrictions
              </label>
              <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15 appearance-none cursor-pointer"
              >
                <option value="None" className="bg-slate-800">None</option>
                <option value="Vegetarian" className="bg-slate-800">Vegetarian</option>
                <option value="Vegan" className="bg-slate-800">Vegan</option>
                <option value="Gluten-Free" className="bg-slate-800">Gluten-Free</option>
                <option value="Halal" className="bg-slate-800">Halal</option>
                <option value="Kosher" className="bg-slate-800">Kosher</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Preferred Transit Mode
              </label>
              <select
                value={transitMode}
                onChange={(e) => setTransitMode(e.target.value)}
                className="w-full p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              >
                <option value="Any">Any / Mixed</option>
                <option value="Public Transit">Public Transit (Subway/Bus)</option>
                <option value="Walking">Walking / Pedestrian</option>
                <option value="Driving / Rental Car">Driving / Rental Car</option>
                <option value="Rideshare / Taxi">Rideshare / Taxi</option>
              </select>
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-bold text-gray-200 uppercase tracking-wide">
                💡 Custom Notes / Special Requests
              </label>
              <textarea
                placeholder="e.g. I hate mornings, please start days after 11am. I really want to visit the Ghibli Museum. Keep walking to a minimum."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all backdrop-blur-sm hover:bg-white/15 resize-none min-h-[100px]"
              />
            </div>
          </div>

          <div className="mt-10 pt-8 flex flex-col sm:flex-row gap-4 justify-between items-center relative z-10">
            <p className="text-gray-300 text-sm">Ready to explore new destinations?</p>
            <button
              onClick={generateItinerary}
              disabled={isLoading || !destination}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold text-lg hover:scale-105 active:scale-95 transition-all transform duration-200 disabled:opacity-50 disabled:hover:scale-100 shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 w-full sm:w-auto relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-current"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="relative z-10">Creating Magic...</span>
                </>
              ) : (
                <span className="flex items-center gap-2 relative z-10">
                  Generate Itinerary <HiSparkles className="text-xl" />
                </span>
              )}
            </button>
          </div>
        </div>
        </div>

        {/* Results Section */}
        {generatedDays.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-12 lg:max-w-[60%]">
              <div className="flex justify-between mb-4 items-center">
                <div className="flex gap-2 bg-zinc-200 dark:bg-zinc-800 p-1 rounded-xl overflow-x-auto">
                  {generatedDays.map(d => (
                    <button
                      key={d}
                      onClick={() => setActiveDay(d)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                        activeDay === d ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700/50'
                      }`}
                    >
                      Day {d}
                    </button>
                  ))}
                </div>
                <button
                  onClick={saveTrip}
                  disabled={isSaving || Object.keys(aiPlan).length === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-green-600 text-white font-bold hover:bg-green-500 transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : <><FaFloppyDisk /> Save</>}
                </button>
              </div>

              {generatedDays.map((day) => {
                const dayPlan = aiPlan[`day${day}`];

                return (
                  <div
                    key={day}
                    style={{ display: activeDay === day ? 'block' : 'none' }}
                    className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-10 shadow-sm border border-zinc-200 dark:border-zinc-800 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 rounded-l-3xl"></div>

                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
                      <span className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                        {day}
                      </span>
                      Day {day} in {destination}
                    </h2>

                    <div className="space-y-6">
                      {/* Hotel Option Header */}
                      {day === 1 && hotels.length > 0 && (
                        <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                          <ItineraryCard
                            time="Base"
                            duration="Stay"
                            options={hotels.map((h: Place) => ({
                              name: `${cleanName(h.name)}`,
                              rating: h.rating,
                              photo_reference: h.photo_reference,
                            }))}
                          />
                        </div>
                      )}

                      {/* AI Scheduled Items */}
                      {!dayPlan && isLoading && (
                        <div className="animate-pulse space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-2xl"
                            ></div>
                          ))}
                        </div>
                      )}

                      {dayPlan && dayPlan.length === 0 && (
                        <p className="text-zinc-500 italic">
                          No activities planned for this day yet.
                        </p>
                      )}

                      {dayPlan &&
                        dayPlan.map((item: any, idx: number) => (
                          <ItineraryCard
                            key={idx}
                            time={item.time}
                            duration={item.duration || "Activity"}
                            options={[enrichActivity(item)]}
                            isLast={idx === dayPlan.length - 1}
                            onEdit={(prompt) => handleEditActivity(`day${day}`, idx, prompt)}
                          />
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="lg:w-[40%]">
              <div className="sticky top-6 h-[600px] w-full rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg">
                <MapView 
                  apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""} 
                  locations={getMapLocations} 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlanTrip() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">Loading planner...</div>}>
      <PlanTripContent />
    </Suspense>
  );
}
