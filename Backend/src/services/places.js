const URL = "https://places.googleapis.com/v1/places:searchText";


async function searchPlaces({ place_type, place_ubi, place_max_distance, place_preferencies = [] }) {
  console.log(" Llamando la funcion searchPlaces con:", { place_type, place_ubi, place_max_distance, place_preferencies });

  if (!process.env.GOOGLE_PLACES_API_KEY) {
    throw new Error("Falta GOOGLE_PLACES_API_KEY en el archivo .env");
  }

  // Juntamos los criterios en un texto: "cafetería wifi terraza en Barcelona"
  const textQuery = [place_type, ...place_preferencies].filter(Boolean).join(" ") +
    (place_ubi ? ` en ${place_ubi}` : "");

  const response = await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
      // Obligatorio: solo pedimos los campos que necesitamos
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.googleMapsUri"
    },
    body: JSON.stringify({
      textQuery,
      languageCode: "es",
      maxResultCount: 5
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error de Google Places:", response.status, errorText);
    return { error: "No se pudo consultar Google Places" };
  }

  const data = await response.json();

  // Si no hay resultados, Google devuelve {} sin "places"
  return (data.places || []).map(p => ({
    id: p.id,
    name: p.displayName?.text,
    address: p.formattedAddress,
    lat: p.location?.latitude,
    lng: p.location?.longitude,
    rating: p.rating,
    reviews: p.userRatingCount,
    maps_url: p.googleMapsUri
  }));
}

module.exports = { searchPlaces };