import { Injectable, Logger } from '@nestjs/common';
import { UserModel } from '@prisma/client';
import { randomBytes } from 'node:crypto';

import { AuthProvider, UserRole } from '@app/src/common/enums';

import { getFindFunction, replaceCyrillicWithLatin } from '@sync-ukd-service/common/functions';
import { DecanatPlusPlusService } from '@sync-ukd-service/src/decanat-plus-plus/decanat-plus-plus.service';
import { UsersService } from '@sync-ukd-service/src/main-backend-modules/users/users.service';

@Injectable()
export class SyncUkdTeachersService {
  private readonly logger = new Logger(SyncUkdTeachersService.name);

  constructor(
    private readonly decanatPlusPlusService: DecanatPlusPlusService,
    private readonly usersService: UsersService,
  ) {}

  async sync() {
    this.logger.log('The process of synchronizing teachers with UKD data has begun');

    const { created, updated } = await this.process();

    const createdTeachers = JSON.stringify(created.map(({ fullname }) => fullname));
    const updatedTeachers = JSON.stringify(updated.map(({ id, fullname }) => ({ id, fullname })));

    this.logger.warn(
      `Successfully created ${created.length} and updated ${updated.length} teachers created: "${createdTeachers}", updated: "${updatedTeachers}".`,
    );
  }

  private async process(): Promise<{ created: UserModel[]; updated: UserModel[] }> {
    const [teachers, users] = await Promise.all([
      this.decanatPlusPlusService.getTeachers(),
      this.usersService.findAll(),
    ]);

    const findTeacherFn = getFindFunction(users.map((user) => user.fullname));
    const actions = { created: [], updated: [], plannedNewTeacher: [] };

    for (const teacher of teachers) {
      const foundTeacher = findTeacherFn(teacher.fullname);

      if (!foundTeacher) {
        actions.plannedNewTeacher.push(this.createEmptyTeacher(teacher.fullname));
        continue;
      }

      const user = users.find((user) => user.fullname === foundTeacher);

      if (!user.roles.includes(UserRole.Teacher)) {
        const newRoles = [...user.roles, UserRole.Teacher];

        if (newRoles.includes(UserRole.Student)) {
          const index = newRoles.indexOf(UserRole.Student);
          if (index !== -1) newRoles.splice(index, 1);
        }

        await this.usersService.update({ id: user.id, roles: newRoles });
        actions.updated.push({ ...user, roles: newRoles });
      }
    }

    actions.created = await this.usersService.createMany(actions.plannedNewTeacher);
    delete actions.plannedNewTeacher;

    return actions;
  }

  createEmptyTeacher(fullname: string) {
    return {
      email: `null_${randomBytes(10).toString('hex')}@ukd.edu.ua`,
      authProvider: AuthProvider.Internal,
      fullname: fullname,
      roles: [UserRole.Teacher],
    };
  }
}
