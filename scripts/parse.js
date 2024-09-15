import fs from "fs";

const inputData = JSON.parse(fs.readFileSync("source.json", "utf8"));

const geojson = {
  type: "FeatureCollection",
  features: [],
};

inputData.coordinates.forEach(([lon, lat, aurora]) => {
  geojson.features.push({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [lon, lat],
    },
    properties: {
      aurora,
    },
  });
});

fs.writeFileSync("output.geojson", JSON.stringify(geojson, null, 2));
