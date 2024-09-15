"use client";
``;

import { useRef } from "react";
import { Layer, Map, Source } from "react-map-gl";

import {
  clusterCountLayer,
  clusterLayer,
  unclusteredPointLayer,
} from "./layers";

import type { GeoJSONSource, MapRef } from "react-map-gl";
import { env } from "~/env";

export default function AuroraMap() {
  const mapRef = useRef<MapRef>(null);

  const onClick = (event) => {
    const feature = event.features[0];
    const clusterId = feature.properties.cluster_id;

    const mapboxSource = mapRef.current.getSource(
      "earthquakes",
    ) as GeoJSONSource;

    mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) {
        return;
      }

      mapRef.current.easeTo({
        center: feature.geometry.coordinates,
        zoom,
        duration: 500,
      });
    });
  };

  return (
    <div className="fixed inset-0 h-screen w-screen">
      <Map
        initialViewState={{
          latitude: 64.52068144781897,
          longitude: 7.495084840116542,
          zoom: 3,
        }}
        mapStyle="mapbox://styles/alex-snowfox/cm0zstydj01cp01o3hyyh9rlb"
        mapboxAccessToken={env.NEXT_PUBLIC_MAPBOX_TOKEN}
        interactiveLayerIds={[clusterLayer.id]}
        onClick={onClick}
        ref={mapRef}
      >
        {/* <Source
          id="earthquakes"
          type="geojson"
          data="https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson"
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source> */}
      </Map>
    </div>
  );
}
