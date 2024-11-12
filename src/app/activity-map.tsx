import React, { useEffect, useRef } from 'react';

import Map from 'ol/Map';
import View from 'ol/View';
import { GPX } from 'ol/format';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { Style, Stroke } from 'ol/style';
import XYZ from 'ol/source/XYZ';

import 'ol/ol.css';

interface MapProps {
  gpxData: string | null;
}

const ActivityMap: React.FC<MapProps> = ({ gpxData }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const vectorSource = new VectorSource({
      features: new GPX().readFeatures(gpxData, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      }),
    });

    const trackStyle = new Style({
      stroke: new Stroke({
        color: 'indigo',
        width: 4,
      }),
    });

    const gpxTrackVector = new VectorLayer({
      source: vectorSource,
      style: trackStyle,
    });

    const stamenLayer = new TileLayer({
      source: new XYZ({
        url: 'https://cartodb-basemaps-{a-d}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
      }),
    });

    const map = new Map({
      target: mapRef.current,
      layers: [stamenLayer, gpxTrackVector],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 10,
      }),
    });

    map.getView().fit(vectorSource.getExtent(), { padding: [50, 50, 50, 50] });

    return () => map.setTarget(undefined);
  }, [gpxData]);

  return <div ref={mapRef} style={{ width: '100%', height: '500px' }} />;
};

export default ActivityMap;
