import React, { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import { GPX } from 'ol/format';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { LineString, MultiLineString, Point } from 'ol/geom';
import { Style, Fill } from 'ol/style';
import XYZ from 'ol/source/XYZ';

import 'ol/ol.css';
import { Feature } from 'ol';
import CircleStyle from 'ol/style/Circle';

interface MapProps {
  gpxData: string | null;
  onPointClick: (
    // playlist: SpotifyPlaylist,
    // startTime: string,
    timestamp: string
  ) => void;
}

const ActivityMap: React.FC<MapProps> = ({ gpxData, onPointClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);

  // const [mapColorSetting, setMapColorSetting] = useState<'heart-rate' | 'pace'>(
  //   'heart-rate'
  // );

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
    const minHeartRate = Math.min(...heartRateValues);
    const maxHeartRate = Math.max(...heartRateValues);

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

    // calculate pace values
    // const toRadians = (deg: number) => (deg * Math.PI) / 180;
    // const calculateDistance = (
    //   lat1: number,
    //   lon1: number,
    //   lat2: number,
    //   lon2: number
    // ): number => {
    //   const R = 6371e3; // Earth's radius in m 🤓
    //   const φ1 = toRadians(lat1);
    //   const φ2 = toRadians(lat2);
    //   const Δφ = toRadians(lat2 - lat1);
    //   const Δλ = toRadians(lon2 - lon1);
    //   const a =
    //     Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    //     Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    //   return R * c; // distance in m
    // };

    // const paceValues: number[] = [];
    // for (let i = 1; i < trackPoints.length; i++) {
    //   const prevPoint = trackPoints[i - 1];
    //   const currPoint = trackPoints[i];

    //   const lat1 = parseFloat(prevPoint.getAttribute('lat')!);
    //   const lon1 = parseFloat(prevPoint.getAttribute('lon')!);
    //   const lat2 = parseFloat(currPoint.getAttribute('lat')!);
    //   const lon2 = parseFloat(currPoint.getAttribute('lon')!);

    //   const distance = calculateDistance(lat1, lon1, lat2, lon2);
    //   const prevTime = new Date(
    //     prevPoint.getElementsByTagName('time')[0]?.textContent!
    //   ).getTime();
    //   const currTime = new Date(
    //     currPoint.getElementsByTagName('time')[0]?.textContent!
    //   ).getTime();

    //   const timeGapInSeconds = (currTime - prevTime) / 1000; // Convert to seconds

    //   // console.log({ distance, timeGapInSeconds });

    //   if (distance === 0 || timeGapInSeconds === 0) {
    //     paceValues.push(Infinity);
    //     continue;
    //   }
    //   const pace = timeGapInSeconds / (distance / 1000);
    //   // Filter out unrealistic paces
    //   if (pace < 2 || pace > 20) {
    //     console.warn('Unrealistic pace detected; skipping.', { pace });
    //     continue;
    //   }
    //   paceValues.push(pace);
    // }
    // const validPaceValues = paceValues.filter(
    //   (pace) => isFinite(pace) && !isNaN(pace)
    // );
    // const minPace = Math.min(...validPaceValues);
    // const maxPace = Math.max(...validPaceValues);

    // console.log({ paceValues, minPace, maxPace });

    // const calculatePaceColor = (pace: number): string => {
    //   const normalizedPace =
    //     maxPace === minPace ? 0 : (pace - minPace) / (maxPace - minPace);
    //   const paletteIndex = Math.min(
    //     Math.floor(normalizedPace * (colorPalette.length - 1)),
    //     colorPalette.length - 1
    //   );
    //   return colorPalette[paletteIndex];
    // };

    // Process features and add points
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

        // const pace = paceValues[lineIndex + coordIndex - 1] || 0;

        const color =
          // mapColorSetting === 'heart-rate'
          // ?
          calculateHeartRateColor(heartRate);
        // : calculatePaceColor(pace);

        point.setStyle(
          new Style({
            image: new CircleStyle({
              radius: 4,
              fill: new Fill({ color }),
            }),
          })
        );

        const timeElement =
          trackPoints[lineIndex + coordIndex]?.getElementsByTagName('time')[0];
        if (timeElement) {
          point.set('time', timeElement.textContent);
        }

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
            console.log(onPointClick(timestamp));
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

  return (
    <div className="w-full h-full">
      <div className="flex flex-row gap-2 py-2">
        {/* TODO: pace formula is buggy */}
        {/* <button
          className={`bg-[#222222] w-[50%] px-2 py-1 rounded-md ${
            mapColorSetting === 'heart-rate' ? 'border-2 border-white' : ''
          }`}
          onClick={() => setMapColorSetting('heart-rate')}
        >
          Heart Rate
        </button> */}
        {/* <button
          className={`bg-[#222222] w-[50%] px-2 py-1 rounded-md ${
            mapColorSetting === 'pace' ? 'border-2 border-white' : ''
          }`}
          onClick={() => setMapColorSetting('pace')}
        >
          Pace
        </button> */}
      </div>

      <div ref={mapRef} className="w-[400px] h-[400px]" />
    </div>
  );
};

export default ActivityMap;
