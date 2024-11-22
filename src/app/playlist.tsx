import React, { useEffect, useRef } from 'react';

type SpotifyImage = {
  url: string;
  height: number;
  width: number;
};

type SpotifyArtist = {
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  name: string;
  uri: string;
};

type SpotifyTrack = {
  preview_url: string;
  artists: SpotifyArtist[];
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  name: string;
  uri: string;
};

type SpotifyPlaylist = {
  images: SpotifyImage[];
  name: string;
  tracks: {
    href: string;
    items: { track: SpotifyTrack }[];
  };
};

interface PlaylistProps {
  playlistData: SpotifyPlaylist;
}

const Playlist: React.FC<PlaylistProps> = ({ playlistData }) => {
  return (
    <div className="flex flex-col  gap-5 h-full">
      <img className="rounded-md" src={playlistData.images[1].url} />
      <div className="overflow-auto flex flex-col gap-2 flex-grow">
        {playlistData.tracks.items.map((item) => (
          <div
            key={item.track.name}
            className="bg-[#222222] rounded-md p-2 flex flex-row gap-2"
          >
            <p>{item.track.name}</p>
            <p>{item.track.artists.map((artist) => artist.name).join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Playlist;
