export function config() {
  const ENV = process.env;

  return {
    apiUrl: ENV.API_URL,
    apiAccessToken: ENV.API_ACCESS_TOKEN,
    ukdScheduleApiUrl: ENV.UKD_SCHEDULE_API_URL,
    decanatPlusPlusUrl: ENV.DECANAT_PLUS_PLUS_URL,
  } as const;
}
