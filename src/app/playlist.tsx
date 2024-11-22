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
    <div style={{ width: '50%', height: '500px' }}>
      <img src={playlistData.images[1].url} />
      <div className="overflow-scroll">
        {playlistData.tracks.items.map((item) => (
          <div key={item.track.name}>{item.track.name}</div>
        ))}
      </div>
    </div>
  );
};

export default Playlist;
