import fs from "fs";

const inputData = fs.readFileSync("Aurora_Latest.json", "utf8");

// Function to convert the given data to GeoJSON
function convertToGeoJSON(data) {
  const geojson = {
    type: "FeatureCollection",
    features: [],
  };

  // Parse the JSON string
  const parsedData = JSON.parse(data);

  // Extract the coordinates
  const coordinates = parsedData.coordinates;

  // Create a feature for each coordinate
  coordinates.forEach((coord, index) => {
    const feature = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [coord[0], coord[1]],
      },
      properties: {
        aurora: coord[2],
        observationTime: parsedData["Observation Time"],
        forecastTime: parsedData["Forecast Time"],
      },
    };
    geojson.features.push(feature);
  });

  return JSON.stringify(geojson, null, 2);
}

const geojsonResult = convertToGeoJSON(inputData);
fs.writeFileSync("aurora_forecast.geojson", geojsonResult);

// Output the result
console.log(geojsonResult);
