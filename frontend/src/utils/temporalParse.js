/**
 * Routewise Temporal Parsing Engine (Hardened)
 * 
 * Extracts CLEAN, structured itinerary data from AI-generated markdown.
 * Enforces a zero-trust policy: discards garbage and strips noise words.
 */

export function parseItinerary(markdown, destination = "") {
  if (!markdown || typeof markdown !== "string") return [];

  // 1. DISCARD NOISE: Strip standard AI conversational filler
  const cleanMarkdown = markdown.replace(/Certainly!|Here is your itinerary:|Enjoy your trip!/gi, "");

  try {
    const events = [];
    // Split by Day headings (e.g., # Day 1, Day 1:)
    const sections = cleanMarkdown.split(/(?=#{1,4}\s*Day\s+\d+|Day\s+\d+:)/i);
    const daySections = sections.filter(s => /Day \d+/i.test(s));

    daySections.forEach((section, idx) => {
      const dayMatch = section.match(/Day (\d+)/i);
      const dayNum = dayMatch ? parseInt(dayMatch[1], 10) : idx + 1;
      
      const slots = ['Morning', 'Afternoon', 'Evening', 'Night'];
      
      slots.forEach(slot => {
        // NON-GREEDY LOOKAHEAD: Stops at next slot, next Day, or end of string
        const slotRegex = new RegExp(`(?:\\*\\*)?${slot}(?:\\*\\*)?\\s*[:\\-]?\\s*([\\s\\S]*?)(?=(?:\\*\\*)?(?:Morning|Afternoon|Evening|Night)(?:\\*\\*)?\\s*[:\\-]|#{1,4}|Day\\s+\\d+|$)`, 'i');
        const slotMatch = section.match(slotRegex);

        if (slotMatch) {
          let content = slotMatch[1].trim();
          if (!content) return;

          const lines = content.split('\n');
          const description = lines[0].replace(/^[*-]\s*/, '').trim();
          
          // Try to find a explicit location line first, fallback to first line
          const locMatch = content.match(/Location:\s*([^\n]*)/i);
          let rawPlace = locMatch ? locMatch[1].trim() : description;

          // --- CLEANING GATE (Resilient) ---
          let cleanPlace = rawPlace;

          // 1. Remove text inside parentheses (e.g., "(2 hours)")
          cleanPlace = cleanPlace.replace(/\([^)]*\)/g, "");

          // 2. Remove currency symbols and "Free" instead of discarding
          cleanPlace = cleanPlace.replace(/[\$€₹£¥]|Free/gi, "");

          // 3. Remove common prefixes and noise words
          cleanPlace = cleanPlace.replace(/^[a-z]:\s*/i, ""); 
          cleanPlace = cleanPlace.replace(/^(?:Cost:|Price:|Location:|Visit|Experience|Enjoy|Explore|Discover|Go to|See|Head to|Check out|Spend some time at|Wander through|Recommended)\s*:?\s*/i, "");

          // 4. Remove leading/trailing numbers or symbols
          cleanPlace = cleanPlace.replace(/^\d+[\s.:-]*|[\s.:-]+$/g, "");

          // 5. Final trim and collapse whitespace
          cleanPlace = cleanPlace.trim().replace(/\s+/g, " ");

          // --- VALIDATION GATE ---
          if (cleanPlace.length < 2) return; // Allow shorter valid names

          if (description && cleanPlace) {
            events.push({
              id: `evt-${dayNum}-${slot.toLowerCase()}-${Math.random().toString(36).substr(2, 5)}`,
              day: dayNum,
              time: slot,
              place: cleanPlace,
              activity: description,
              city: destination,
              exactTime: slot === 'Morning' ? '09:00' : slot === 'Afternoon' ? '13:00' : slot === 'Evening' ? '19:00' : '22:00',
              duration: 120
            });
          }
        }
      });
    });

    // --- FAIL-SAFE FALLBACK ---
    if (events.length === 0 && markdown.length > 50) {
      events.push({
        id: "fallback-recovery",
        day: 1,
        time: "Morning",
        place: destination || "City Center",
        activity: "Explore the local attractions and hidden gems.",
        city: destination,
        exactTime: "09:00",
        duration: 240
      });
    }

    return events;
  } catch (e) {
    console.error("TemporalParse Failure:", e);
    return [];
  }
}
