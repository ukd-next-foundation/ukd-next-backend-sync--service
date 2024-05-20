import { AxiosInterceptorManager, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export type AxiosInterceptors = {
  request: AxiosInterceptorManager<InternalAxiosRequestConfig>;
  response: AxiosInterceptorManager<AxiosResponse>;
};
