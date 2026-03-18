const config = {
  API_URL: import.meta.env.VITE_API_URL || '',
  COGNITO_USER_POOL_ID: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
  COGNITO_CLIENT_ID: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
  REGION: import.meta.env.VITE_AWS_REGION || 'eu-west-1',
};

export default config;
