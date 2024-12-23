import React, { useEffect, useRef } from 'react';

export type SpotifyImage = {
  url: string;
  height: number;
  width: number;
};

export type SpotifyArtist = {
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  name: string;
  uri: string;
};

export type SpotifyTrack = {
  preview_url: string;
  artists: SpotifyArtist[];
  album: {
    name: string;
    images: SpotifyImage[];
  };
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
};

export type SpotifyPlaylist = {
  images: SpotifyImage[];
  name: string;
  owner: {
    display_name: string;
  };
  tracks: {
    href: string;
    items: { track: SpotifyTrack }[];
  };
};

interface PlaylistProps {
  playlistData: SpotifyPlaylist;
  highlightedTrackIndex: number | null;
}

const convertMilliseconds = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const paddedSeconds = String(seconds).padStart(2, '0');

  return `${minutes}:${paddedSeconds}`;
};

const Playlist: React.FC<PlaylistProps> = ({
  playlistData,
  highlightedTrackIndex,
}) => {
  const trackRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (
      highlightedTrackIndex !== null &&
      trackRefs.current[highlightedTrackIndex]
    ) {
      trackRefs.current[highlightedTrackIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    }
  }, [highlightedTrackIndex]);

  return (
    <div className="flex flex-col gap-5 h-full w-[45%]">
      <img className="rounded-md h-64 w-64" src={playlistData.images[1].url} />
      <p className="text-xl font-bold">
        {`${playlistData.name} // ${playlistData.owner.display_name}`}
      </p>
      <div className="overflow-auto scrollbar-thin scrollbar-thumb-[#222222] scrollbar-track-[#636363] flex flex-col gap-2 flex-grow pr-2">
        {playlistData.tracks.items.map((item, index) => (
          <div
            key={item.track.name}
            ref={(el) => {
              trackRefs.current[index] = el!;
            }}
            className={`rounded-md p-2 flex items-center ${
              index === highlightedTrackIndex ? 'bg-indigo-600' : 'bg-[#222222]'
            }`}
          >
            <img
              src={item.track.album.images[1].url}
              className="rounded-sm h-8 w-8"
            />
            <div className="flex flex-1 items-center pl-2">
              <div className="flex flex-col flex-[2]">
                <p className="text-sm font-semibold">{item.track.name}</p>
                <p className="text-xs">
                  {item.track.artists.map((artist) => artist.name).join(', ')}
                </p>
              </div>
              <p className="text-xs flex-1 text-right truncate">
                {item.track.album.name}
              </p>
              <p className="text-xs flex-shrink-0 pl-4">
                {convertMilliseconds(item.track.duration_ms)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Playlist;
