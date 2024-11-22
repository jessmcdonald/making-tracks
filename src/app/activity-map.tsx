import React, { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import { GPX } from 'ol/format';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { LineString, MultiLineString, Point } from 'ol/geom';
import { Style, Stroke, Fill } from 'ol/style';
import XYZ from 'ol/source/XYZ';

import 'ol/ol.css';
import { Feature } from 'ol';
import CircleStyle from 'ol/style/Circle';

interface MapProps {
  gpxData: string | null;
}

const ActivityMap: React.FC<MapProps> = ({ gpxData }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || !gpxData) return;

    const colorPalette = [
      '#53C296',
      '#99D973',
      '#F1BA05',
      '#DD6000',
      '#CA1F34',
    ];

    const trackSource = new VectorSource();
    const pointSource = new VectorSource();

    const features = new GPX().readFeatures(gpxData, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxData, 'application/xml');
    const trackPoints = Array.from(xmlDoc.getElementsByTagName('trkpt'));

    // extract heart rate values
    const heartRateValues: number[] = trackPoints.map((point) => {
      const heartRateElement =
        point.getElementsByTagName('ns3:hr')[0]?.textContent;
      return heartRateElement ? parseInt(heartRateElement, 10) : 0;
    });

    // calculate min and max heart rate
    const minHeartRate = Math.min(...heartRateValues);
    const maxHeartRate = Math.max(...heartRateValues);

    console.log({ minHeartRate, maxHeartRate, heartRateValues });

    // map heart rate to color palette
    const calculateHeartRateColor = (heartRate: number): string => {
      const normalizedHeartRate =
        maxHeartRate === minHeartRate
          ? 0
          : (heartRate - minHeartRate) / (maxHeartRate - minHeartRate);
      const paletteIndex = Math.min(
        Math.floor(normalizedHeartRate * (colorPalette.length - 1)),
        colorPalette.length - 1
      );
      return colorPalette[paletteIndex];
    };

    features.forEach((feature, featureIndex) => {
      const geometry = feature.getGeometry();

      if (geometry instanceof LineString) {
        trackSource.addFeature(feature);
        addPointsFromLineString(geometry, trackPoints, featureIndex);
      } else if (geometry instanceof MultiLineString) {
        const lineStrings = geometry.getLineStrings();
        lineStrings.forEach((lineString, lineIndex) => {
          const lineFeature = new Feature({ geometry: lineString });
          trackSource.addFeature(lineFeature);
          addPointsFromLineString(lineString, trackPoints, lineIndex);
        });
      }
    });

    function addPointsFromLineString(
      line: LineString,
      trackPoints: Element[],
      lineIndex: number
    ) {
      const coordinates = line.getCoordinates();

      coordinates.forEach((coord, coordIndex) => {
        const point = new Feature({
          geometry: new Point(coord),
        });

        const heartRateElement =
          trackPoints[lineIndex + coordIndex]?.getElementsByTagName(
            'ns3:hr'
          )[0];
        const heartRate = heartRateElement
          ? parseInt(heartRateElement.textContent!, 10)
          : 0;

        const heartRateColor = calculateHeartRateColor(heartRate);

        point.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 4,
              fill: new Fill({ color: heartRateColor }),
            }),
          })
        );

        pointSource.addFeature(point);
      });
    }

    const pointLayer = new VectorLayer({
      source: pointSource,
    });

    const stamenLayer = new TileLayer({
      source: new XYZ({
        url: 'https://cartodb-basemaps-{a-d}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
      }),
    });

    map.current = new Map({
      target: mapRef.current,
      layers: [stamenLayer, pointLayer],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 10,
      }),
    });

    if (trackSource.getFeatures().length > 0) {
      map.current
        .getView()
        .fit(trackSource.getExtent(), { padding: [50, 50, 50, 50] });
    } else {
      console.warn('No features found in trackSource to fit the extent');
    }

    map.current.on('click', (event) => {
      map.current!.forEachFeatureAtPixel(event.pixel, (feature) => {
        const geometry = feature.getGeometry();
        if (geometry instanceof Point) {
          const timestamp = feature.get('time');
          if (timestamp) {
            console.log('Timestamp:', timestamp);
          } else {
            console.log('No timestamp found for this point');
          }
        }
        return true;
      });
    });

    return () => map.current?.setTarget(undefined);
  }, [gpxData]);

  return <div ref={mapRef} className="w-[400px] h-[400px]" />;
};

export default ActivityMap;
