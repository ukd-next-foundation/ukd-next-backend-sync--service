import { ConfigType, registerAs } from '@nestjs/config';

import { config } from '@sync-ukd-service/src/configs';

export const GlobalConfig = registerAs('global', config).KEY;
export type GlobalConfigType = ConfigType<typeof config>;
