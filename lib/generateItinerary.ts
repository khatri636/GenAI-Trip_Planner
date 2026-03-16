const aiRes = await fetch("/api/ai-itinerary", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    destination,
    arrival: arrivalTime,
    days: totalDays,
    places: placesData,
    restaurants: foodData,
    hotels: hotelsData
  })
})

const llmPlan = await aiRes.json()

setAiPlan(llmPlan)