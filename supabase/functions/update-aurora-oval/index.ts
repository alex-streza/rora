// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Function to convert the given data to GeoJSON, excluding features with aurora = 0
function convertToGeoJSON(data: any) {
  const geojson = {
    type: "FeatureCollection",
    features: [],
  };

  // Extract the coordinates
  const coordinates = data.coordinates;

  // Create a feature for each coordinate, excluding those with aurora = 0
  coordinates.forEach((coord: number[]) => {
    if (coord[2] !== 0) {  // Only include features where aurora is not 0
      const feature = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [coord[0], coord[1]],
        },
        properties: {
          aurora: coord[2],
          observationTime: data["Observation Time"],
          forecastTime: data["Forecast Time"],
        },
      };
      geojson.features.push(feature);
    }
  });

  return JSON.stringify(geojson);
}

Deno.serve(async (req: Request) => {
  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // 1. Fetch JSON data
    const response = await fetch("https://services.swpc.noaa.gov/json/ovation_aurora_latest.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // 2. Convert to optimized GeoJSON
    const geojsonResult = convertToGeoJSON(data);

    // 3. Delete existing file if it exists
    const fileName = 'aurora_forecast.geojson';
    const { error: deleteError } = await supabaseClient.storage
      .from('geojsons')
      .remove([fileName]);

    if (deleteError) {
      console.log('No existing file to delete or delete failed:', deleteError.message);
      // We'll continue even if delete fails, as it might be because the file doesn't exist
    }

    // 4. Insert new GeoJSON file in Supabase storage
    const { data: upload, error: uploadError } = await supabaseClient.storage
      .from('geojsons')
      .upload(fileName, geojsonResult, {
        contentType: 'application/geo+json',
        cacheControl: '3600',
      });

    if (uploadError) {
      throw new Error('Failed to upload the file: ' + uploadError.message);
    }

    return new Response(
      JSON.stringify({
        message: "Optimized Aurora oval data inserted successfully",
        path: upload.path
      }),
      { 
        status: 201, // Changed back to 201 as we're creating a new resource
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
