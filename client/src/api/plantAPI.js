import axios from './axiosInstance';

export const growPlant = async () => {
  try {
    const res = await axios.post('/api/plant-growth/grow');
    return res.data;
  } catch (err) {
    console.error('Failed to grow plant:', err);
    return { grown: false };
  }
};
