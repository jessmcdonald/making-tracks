'use client';

import { useEffect, useState } from 'react';
import ActivityMap from './activity-map';
import Playlist, { SpotifyPlaylist, SpotifyTrack } from './playlist';
import { samplePlaylistData } from './samplePlaylisData';

export default function Home() {
  const [gpxData, setGpxData] = useState<string | null>(null);
  const playlistData = samplePlaylistData;
  const [activityStartTime, setActivityStartTime] = useState<Date | null>(null);
  const [activityType, setActivityType] = useState<string | null>(null);

  const parseGpx = (gpxContent: string): Document | null => {
    try {
      const parser = new DOMParser();
      const gpxDoc = parser.parseFromString(gpxContent, 'application/xml');
      const errorNode = gpxDoc.querySelector('parsererror');

      if (errorNode) {
        console.error('Error parsing GPX file:', errorNode.textContent);
        return null;
      }

      return gpxDoc;
    } catch (error) {
      console.error('Error processing GPX file:', error);
      return null;
    }
  };

  const getStartTimeFromGpx = (gpxContent: string): Date | null => {
    const gpxDoc = parseGpx(gpxContent);
    if (!gpxDoc) return null;

    const timeElement = gpxDoc.querySelector('trk > trkseg > trkpt > time');

    if (timeElement?.textContent) {
      return new Date(timeElement.textContent);
    } else {
      console.warn('No <time> element found in the GPX file.');
      return null;
    }
  };

  const getActivityTypeFromGpx = (gpxContent: string): string | null => {
    const gpxDoc = parseGpx(gpxContent);
    if (!gpxDoc) return null;

    const typeElement = gpxDoc.querySelector('trk > type');

    if (typeElement?.textContent) {
      return typeElement.textContent;
    } else {
      console.warn('No <type> element found in the GPX file.');
      return null;
    }
  };

  function getTrackAtTimestamp(
    // playlist: SpotifyPlaylist,
    // startTime: string,
    timestamp: string
  ): SpotifyTrack | null {
    const playlist = playlistData;
    const startTime = activityStartTime ? activityStartTime : 0;

    // Parse the start time and timestamp into Date objects
    const start = new Date(startTime).getTime();
    const target = new Date(timestamp).getTime();

    // Calculate the elapsed time in milliseconds
    const elapsedTime = target - start;

    if (elapsedTime < 0) {
      // Timestamp is before the start time
      return null;
    }

    let accumulatedTime = 0;

    // Iterate through the tracks in order
    for (const trackItem of playlist.tracks.items) {
      const track = trackItem.track;

      // Add the current track's duration to the accumulated time
      accumulatedTime += track.duration_ms;

      if (elapsedTime < accumulatedTime) {
        // If the elapsed time falls within the duration of the current track, return it
        return track;
      }
    }

    // If the timestamp is after the last track finishes, return null
    return null;
  }

  useEffect(() => {
    fetch('/run.gpx')
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.statusText}`
          );
        }
        return response.text();
      })
      .then((data) => {
        if (data !== gpxData) {
          setGpxData(data);
          if (data) {
            setActivityStartTime(getStartTimeFromGpx(data));
            setActivityType(getActivityTypeFromGpx(data));
          }
        }
      })
      .catch((error) => console.error('Error fetching GPX data:', error));
  }, [gpxData]);

  return (
    <div className="font-[family-name:var(--font-geist-sans)] h-screen overflow-hidden">
      <main className="flex flex-col h-full gap-8 p-6">
        <div className="w-full">
          <h1 className="text-4xl sm:text-5xl font-bold text-center sm:text-left">
            {'// MAKING TRACKS'}
          </h1>
        </div>
        <div className="flex flex-row flex-1 overflow-hidden gap-">
          <Playlist playlistData={playlistData} />
          {gpxData ? (
            <div className="flex flex-column flex-wrap flex-1 w-full h-full">
              <div className="w-full">
                <p>Activity start time: {activityStartTime?.toISOString()}</p>
                <p>Activity type: {activityType}</p>
              </div>
              <ActivityMap
                gpxData={gpxData}
                onPointClick={getTrackAtTimestamp}
              />
            </div>
          ) : (
            <p>Loading GPX Data...</p>
          )}
        </div>
      </main>
    </div>
  );
}
