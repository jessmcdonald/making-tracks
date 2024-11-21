'use client';

import { useEffect, useState } from 'react';
import ActivityMap from './activity-map';
import Playlist from './playlist';
import { samplePlaylistData } from './samplePlaylisData';

export default function Home() {
  const [gpxData, setGpxData] = useState<string | null>(null);
  const playlistData = samplePlaylistData;

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
        }
      })
      .catch((error) => console.error('Error fetching GPX data:', error));
  }, [gpxData]);

  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-row flex-wrap gap-8 row-start-2 items-center sm:items-start">
        <div className="w-full">
          <h1 className="text-4xl sm:text-5xl font-bold text-center sm:text-left">
            MAKING TRACKS
          </h1>
        </div>

        <Playlist playlistData={playlistData} />
        {gpxData ? (
          <ActivityMap gpxData={gpxData} />
        ) : (
          <p>Loading GPX Data...</p>
        )}
      </main>
    </div>
  );
}
