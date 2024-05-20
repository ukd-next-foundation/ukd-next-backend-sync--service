import { ServiceAccountService } from '@sync-ukd-service/src/service-account/service-account.service';
import { AxiosInterceptors } from '../types';

export function authMainBackendInterceptor(interceptors: AxiosInterceptors) {
  interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${ServiceAccountService.currentApiAccessToken}`;
    return config;
  });
}
