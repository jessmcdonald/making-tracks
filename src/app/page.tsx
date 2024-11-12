'use client';

import { useEffect, useState } from 'react';
import ActivityMap from './activity-map';

export default function Home() {
  const [gpxData, setGpxData] = useState<string | null>(null);

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
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl sm:text-5xl font-bold text-center sm:text-left">
          MAKING TRACKS
        </h1>
        {gpxData ? (
          <ActivityMap gpxData={gpxData} />
        ) : (
          <p>Loading GPX Data...</p>
        )}
      </main>
    </div>
  );
}
