import axios from 'axios';

const getPlaylist = async (playlistId: string) => {
  const response = await axios.get('/api/data');
  console.log(response.data);
};
