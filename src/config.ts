// Environment configuration — keys must be set in .env
import { EDM_TRAIN_API_KEY, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '@env';

export const config = {
  edmTrainApiKey: EDM_TRAIN_API_KEY,
  spotify: {
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
  },
};
