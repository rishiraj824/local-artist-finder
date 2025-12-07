// Environment configuration
// For production, use react-native-dotenv or similar
export const config = {
  edmTrainApiKey: '44285611-0590-491d-9320-4041b9c1c6cf',
  spotify: {
    clientId: '68c5a42f94b44f4f9d70cbeb7f213dff',
    clientSecret: '70232e25e7024a16bc8387280697c9a5',
  },
  // Backend API URL
  backendApiUrl: __DEV__
    ? 'http://localhost:3000/api'
    : 'https://your-production-api.com/api',
};
