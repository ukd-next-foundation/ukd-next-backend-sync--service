import { Logger } from '@nestjs/common';
import { AxiosError } from 'axios';

import { AxiosInterceptors } from '../types';

export function errorInterceptor(interceptors: AxiosInterceptors, logger: Logger) {
  interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      logger.error(error?.response?.data ? JSON.stringify(error.response.data) : error);
      throw error?.response;
    },
  );
}
