import { Logger } from '@nestjs/common';
import { AxiosError } from 'axios';

export function axiosErrorHandler(logger: Logger) {
  return (error: AxiosError) => {
    logger.error(error?.response?.data ? JSON.stringify(error.response.data) : error);

    throw error;
  };
}
