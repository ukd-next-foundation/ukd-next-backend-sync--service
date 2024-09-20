import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

import { Timer } from '@app/src/common/functions/timer';

import { sleep } from '@sync-ukd-service/common/functions';

import { ServiceAccountService } from '../service-account/service-account.service';

@Injectable()
export class GoogleSheetsService {
  private googleSheets = google.sheets({ version: 'v4' });

  getTableId(url: string) {
    const id = url.split('/')[5];

    if (id) {
      return id;
    } else {
      throw Error(`failed to get id from table reference: '${url}'`);
    }
  }

  tableToObj(rows: string[][]) {
    const headers = rows.shift();

    return rows.map((column) => {
      const obj = {};

      column.forEach((value, index) => {
        obj[headers[index]] = value;
      });

      return obj;
    });
  }

  async getTableDate(spreadsheetId: string) {
    const accessToken = ServiceAccountService.currentGoogleAccessToken;

    const table = await this.getTableInfo(accessToken, spreadsheetId);

    const ranges = table.data.sheets.map((sheet) => sheet.properties.title);
    const sheets = await this.getTableSheets(accessToken, spreadsheetId, ranges);

    return sheets.data;
  }

  private async getTableInfo(access_token: string, spreadsheetId: string) {
    const timer = new Timer().start();

    try {
      const table = await this.googleSheets.spreadsheets.get({
        spreadsheetId,
        access_token,
      });

      await sleep(1000 - timer.end().result());
      return table;
    } catch (error) {
      await sleep(1000 - timer.end().result());
      throw error;
    }
  }

  private async getTableSheets(access_token: string, spreadsheetId: string, ranges: string[]) {
    const timer = new Timer().start();

    try {
      const sheets = await this.googleSheets.spreadsheets.values.batchGet({
        access_token,
        spreadsheetId,
        ranges,
      });

      await sleep(1000 - timer.end().result());
      return sheets;
    } catch (error) {
      await sleep(1000 - timer.end().result());
      throw error;
    }
  }
}
