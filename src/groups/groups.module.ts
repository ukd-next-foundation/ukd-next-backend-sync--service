import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { HttpModule } from '@nestjs/axios';
import { GlobalConfig, GlobalConfigType } from '@sync-ukd-service/src/configs';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [GlobalConfig],
      useFactory: (config: GlobalConfigType) => ({
        baseURL: `${config.apiUrl}/groups`,
        headers: { Authorization: `Bearer ${config.apiAccessToken}` },
      }),
    }),
  ],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
