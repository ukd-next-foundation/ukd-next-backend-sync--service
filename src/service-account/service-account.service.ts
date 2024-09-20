import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { sleep } from '@sync-ukd-service/common/functions';
import { errorInterceptor } from '@sync-ukd-service/common/interceptors';

import { GlobalConfig, GlobalConfigType } from '../configs';
import { updateGoogleAccessTokenType } from './types/update-google-access-token.type';

@Injectable()
export class ServiceAccountService implements OnModuleInit {
  private readonly logger = new Logger(ServiceAccountService.name);
  private readonly axios = this.httpService.axiosRef;

  static currentApiAccessToken: string;
  static currentGoogleAccessToken: string;

  constructor(
    @Inject(GlobalConfig)
    private readonly config: GlobalConfigType,
    private readonly httpService: HttpService,
  ) {
    errorInterceptor(this.axios.interceptors, this.logger);
  }

  async onModuleInit() {
    this.googleSessionManager();
    this.apiSessionManager();
    await sleep(2 * 1000);
  }

  private async apiSessionManager() {
    while (true) {
      const token = await this.updateApiAccessToken();
      const { exp } = jwt.decode(token) as { exp: number };
      await sleep((exp - 2) * 1000 - Date.now());
    }
  }

  private async googleSessionManager() {
    while (true) {
      const { expires_in } = await this.updateGoogleAccessToken();
      await sleep((expires_in - 2) * 1000);
    }
  }

  private async updateApiAccessToken(): Promise<string> {
    const cookie = `refresh_token=${this.config.apiRefreshToken}`;
    const { data } = await this.axios.get(`${this.config.apiUrl}/auth/refresh`, { headers: { cookie } });

    ServiceAccountService.currentApiAccessToken = data.accessToken;
    this.logger.log('Updated api access token');

    return data.accessToken;
  }

  private async updateGoogleAccessToken() {
    const { data } = await this.axios.post<updateGoogleAccessTokenType>('https://www.googleapis.com/oauth2/v4/token', {
      grant_type: 'refresh_token',
      client_id: this.config.googleClientId,
      client_secret: this.config.googleClientSecret,
      refresh_token: this.config.googleClientRefreshToken,
    });

    ServiceAccountService.currentGoogleAccessToken = data.access_token;
    this.logger.log('Updated google access token');

    return data;
  }
}
