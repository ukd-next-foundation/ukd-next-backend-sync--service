import { AuthProvider, UserRole } from '@app/src/common/enums';
import { UserEntity } from '@app/src/core/users/entities/user.entity';
import { Injectable, Logger } from '@nestjs/common';
import { hashString, replaceCyrillicWithLatin } from '@sync-ukd-service/common/functions';
import { UkdScheduleApiService } from '@sync-ukd-service/src/ukd-schedule-api';
import { UsersService } from '@sync-ukd-service/src/users/users.service';

@Injectable()
export class SyncUkdTeachersService {
  private readonly logger = new Logger(SyncUkdTeachersService.name);

  constructor(
    private readonly ukdScheduleApiService: UkdScheduleApiService,
    private readonly usersService: UsersService,
  ) {}

  async sync() {
    this.logger.log('The process of synchronizing teachers with UKD data has begun');

    const result = await this.process();

    if (result.length) {
      this.logger.warn(
        `Successfully synchronized ${result.length} teachers such as: ${result.map((t) => t.fullname)}.`,
      );
    } else {
      this.logger.log('No new teachers found to synchronize');
    }

    return result;
  }

  private async process() {
    const [internalTeachers, externalTeachers] = await Promise.all([
      this.usersService.findAll({ role: UserRole.Teacher }).then((users) => users.map((user) => user.fullname)),
      this.ukdScheduleApiService.getTeachers(),
    ]);

    const result: UserEntity[] = [];
    const missingTeachers = externalTeachers
      .map((t) => t.replaceAll('`', '’'))
      .filter((t) => !internalTeachers.includes(t));

    for (const fullname of missingTeachers) {
      const email = `${replaceCyrillicWithLatin(fullname).replaceAll(' ', '.')}@ukd.edu.ua`;
      const authProvider = AuthProvider.Internal;
      const roles = [UserRole.Teacher];
      result.push(await this.usersService.create({ authProvider, fullname, email, roles }));
    }

    return result;
  }
}
