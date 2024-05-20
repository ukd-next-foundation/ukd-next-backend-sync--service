import { CreateJournalDto } from '@app/src/core/journals/dto/create-journal.dto';
import { FindAllJournalDto } from '@app/src/core/journals/dto/find-all-journal.dto';
import { UpdateJournalDto } from '@app/src/core/journals/dto/update-journal.dto';
import { JournalEntity } from '@app/src/core/journals/entities/journal.entity';
import { JournalsController } from '@app/src/core/journals/journals.controller';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { sleep } from '@sync-ukd-service/common/functions';
import { authMainBackendInterceptor, errorInterceptor } from '@sync-ukd-service/common/interceptors';

@Injectable()
export class JournalsService extends JournalsController {
  private readonly logger = new Logger(JournalsService.name);
  private readonly axios = this.httpService.axiosRef;

  constructor(private readonly httpService: HttpService) {
    // @ts-ignore
    super();
    authMainBackendInterceptor(this.axios.interceptors);
    errorInterceptor(this.axios.interceptors, this.logger);
  }

  async create(payloads: CreateJournalDto[], errCount?: number) {
    if (!payloads.length) return [];

    try {
      const request = await this.axios.post<JournalEntity[]>('', payloads);
      return request.data;
    } catch (error) {
      if (errCount >= 3) throw error;

      this.logger.error(error);
      await sleep(100);
      return this.create(payloads, errCount + 1);
    }
  }

  async findAll(params?: FindAllJournalDto) {
    const request = await this.axios.get<JournalEntity[]>('', { params });
    return request.data;
  }

  async findOne(id: number) {
    const request = await this.axios.get<JournalEntity>(`/${id}`);
    return request.data;
  }

  async updateMany(payloads: UpdateJournalDto[]) {
    if (!payloads.length) return [];
    const request = await this.axios.patch('/many', payloads);
    return request.data;
  }

  async removeMany(ids: number[]) {
    if (!ids.length) return [];
    const request = await this.axios.delete(`/many`, { data: ids });
    return request.data;
  }
}
