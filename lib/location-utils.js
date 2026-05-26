import { State, City } from "country-state-city";

/**
 * Parse and validate location slug (format: city-state)
 * @param {string} slug - The URL slug (e.g., "gurugram-haryana")
 * @returns {Object} - { city, state, isValid }
 */
export function parseLocationSlug(slug) {
 if (!slug) return { city: null, state: null, isValid: false };

   // 1. Separate the city block from the state block
  const parts = slug.split("__");

  // Must have at least 2 parts (city-state)
  if (parts.length < 2) {
    return { city: null, state: null, isValid: false };
  }

  let rawCity = parts[0];
  let rawState = parts[1];

  // 2. Return tildes back into spaces leaving original hyphens untouched
  rawCity = rawCity.replace(/~/g, " ")
  rawState = rawState.replace(/~/g, " ")



  // // Parse city (first part)
  // const cityName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);

  // // Parse state (remaining parts joined)
  // const stateName = parts
  //   .slice(1)
  //   .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
  //   .join(" ");

  // Get all Indian states
  // const indianStates = State.getStatesOfCountry("IN");

  // Validate state exists
  // const stateObj = indianStates.find(
  //   (s) => s.name.toLowerCase() === stateName.toLowerCase()
  // );

  // if (!stateObj) {
  //   return { city: null, state: null, isValid: false };
  // }
  console.log(rawCity, rawState)
  
  return  {
    city: rawCity, 
    state: rawState, 
    isValid: true
  }
  // if (cityName == "Anycity" ){
  //   return { city: cityName, state: stateName, isValid: true };
  // }
  // // Validate city exists in that state
  // const cities = City.getCitiesOfState("IN", stateObj.isoCode);
  // const cityExists = cities.some(
  //   (c) => c.name.toLowerCase() === cityName.toLowerCase()
  // );

  // if (!cityExists) {
  //   return { city: null, state: null, isValid: false };
  // }

  // return { city: cityName, state: stateName, isValid: true };
}

/**
 * Create location slug from city and state
 * @param {string} city - City name
 * @param {string} state - State name
 * @returns {string} - URL slug (e.g., "gurugram-haryana")
 */
export function createLocationSlug(city, state) {
 

  const cityPart = city? city.trim() : "Anycity";
  const statePart = state? state.trim() : "";


  // Convert spaces to tildes (~), leave real hyphens perfectly alone
  // Example: "New York" -> "New~York", "Creek-on-crook" -> "Creek-on-crook"
  const citySlug = cityPart.replace(/\s+/g, "~");
  const stateSlug = statePart.replace(/\s+/g, "~");

  return `${citySlug}__${stateSlug}`;
}
