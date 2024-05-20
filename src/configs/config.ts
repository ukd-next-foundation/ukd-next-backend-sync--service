export function config() {
  const ENV = process.env;

  return {
    apiUrl: ENV.API_URL,
    apiRefreshToken: ENV.API_REFRESH_TOKEN,
    decanatPlusPlusUrl: ENV.DECANAT_PLUS_PLUS_URL,
    googleClientId: ENV.GOOGLE_CLIENT_ID,
    googleClientSecret: ENV.GOOGLE_CLIENT_SECRET,
    googleClientRefreshToken: ENV.GOOGLE_CLIENT_REFRESH_TOKEN,
    apiAccessToken: '',
  } as const;
}
