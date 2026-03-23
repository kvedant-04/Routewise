/**
 * Phase 2 - Safe Data Mapping
 * Converts markdown itinerary into a structured temporal model
 * { day: 1, date: "2026-03-20", events: [{ id, title, timeSlot, duration, location, cost, meta }] }
 */
export function parseTemporalItinerary(markdown) {
  if (!markdown || typeof markdown !== "string") {
    throw new Error("Invalid markdown");
  }

  try {
    const days = [];
    const sections = markdown.split(/(?=## Day |### Day |Day \d+:)/i);
    const daySections = sections.filter(s => /Day \d+/i.test(s));

    let globalEventId = 1;

    daySections.forEach((section, idx) => {
      const dayMatch = section.match(/Day (\d+):?\s*(.*)/i);
      const dayNum = dayMatch ? parseInt(dayMatch[1], 10) : idx + 1;
      
      const events = [];
      const slots = ['Morning', 'Afternoon', 'Evening', 'Night'];

      slots.forEach((slot) => {
        const slotRegex = new RegExp(`\\*\\*${slot}\\*\\*:(.*?)(?=\\*\\*|###|##|$)`, 'is');
        const slotMatch = section.match(slotRegex);

        if (slotMatch) {
          const content = slotMatch[1].trim();
          const lines = content.split('\n');
          const titleLine = lines[0].replace(/^[*-]\s*/, '').trim();
          
          const locMatch = content.match(/Location:\s*\*\*?(.*?)\*\*?/i);
          const costMatch = content.match(/Cost:\s*.*?(\d+)/i);

          events.push({
            id: `evt_${dayNum}_${globalEventId++}`,
            title: titleLine,
            timeSlot: slot,
            duration: 90, // Default duration in minutes
            location: locMatch ? locMatch[1].trim() : "",
            cost: costMatch ? parseFloat(costMatch[1]) : 0,
            meta: {
              type: "activity",
              bookable: true,
              externalId: null
            }
          });
        }
      });

      if (events.length > 0) {
        days.push({
          day: dayNum,
          date: `Day ${dayNum}`, // Can be mapped to real dates if selected
          events
        });
      }
    });

    return days;
  } catch (e) {
    console.warn("Temporal Parsing Error:", e);
    throw new Error("Failed to parse itinerary into temporal events");
  }
}
