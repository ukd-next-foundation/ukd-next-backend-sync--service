import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

import { CreateJournalDto } from '@app/src/api/journals/dto/create-journal.dto';
import { FindAllJournalDto } from '@app/src/api/journals/dto/find-all-journal.dto';
import { UpdateJournalDto } from '@app/src/api/journals/dto/update-journal.dto';
import { JournalsController } from '@app/src/api/journals/journals.controller';

import { sleep } from '@sync-ukd-service/common/functions';
import { authMainBackendInterceptor, errorInterceptor } from '@sync-ukd-service/common/interceptors';

@Injectable()
export class JournalsService implements JournalsController {
  private readonly logger = new Logger(JournalsService.name);
  private readonly axios = this.httpService.axiosRef;

  constructor(private readonly httpService: HttpService) {
    authMainBackendInterceptor(this.axios.interceptors);
    errorInterceptor(this.axios.interceptors, this.logger);
  }

  // @ts-ignore
  async createMany(
    payloads: CreateJournalDto[],
    errCount?: number,
  ): Promise<ReturnType<JournalsController['createMany']>> {
    if (!payloads.length) return [];

    try {
      const request = await this.axios.post('/many', payloads);
      return request.data;
    } catch (error) {
      if (errCount >= 3) throw error;

      this.logger.error(error);
      await sleep(100);
      return this.createMany(payloads, errCount + 1);
    }
  }

  // @ts-ignore
  async findAll(params?: FindAllJournalDto) {
    const request = await this.axios.get('', { params });
    return request.data as ReturnType<JournalsController['findAll']>;
  }

  // @ts-ignore
  async findOne(id: string) {
    const request = await this.axios.get(`/${id}`);
    return request.data as ReturnType<JournalsController['findOne']>;
  }

  // @ts-ignore
  async updateMany(payloads: UpdateJournalDto[]) {
    if (!payloads.length) return [];
    const request = await this.axios.patch('/many', payloads);
    return request.data as ReturnType<JournalsController['updateMany']>;
  }

  // @ts-ignore
  async removeMany(ids: string[]) {
    if (!ids.length) return [];
    const request = await this.axios.delete(`/many`, { data: ids });
    return request.data as ReturnType<JournalsController['removeMany']>;
  }
}
