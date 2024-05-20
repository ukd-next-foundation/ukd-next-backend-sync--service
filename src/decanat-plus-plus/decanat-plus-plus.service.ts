import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConvertWin1254 } from '@sync-ukd-service/common/utils';
import { IClassroomType, IRozkladItem } from './interfaces';
import {
  ExportClassroomTypesType,
  ExportClassroomsType,
  ExportGroupsType,
  ExportRozkladType,
  ExportTeachersType,
} from './types';
import { errorInterceptor } from '@sync-ukd-service/common/interceptors';

@Injectable()
export class DecanatPlusPlusService {
  private readonly logger = new Logger(DecanatPlusPlusService.name);
  private readonly axios = this.httpService.axiosRef;

  constructor(private readonly httpService: HttpService) {
    errorInterceptor(this.axios.interceptors, this.logger);
  }

  async getGroups(): Promise<string[]> {
    const params = { req_type: 'obj_list', req_mode: 'group' };
    const response = await this.axios.get<ExportGroupsType>('/timetable_export.cgi', { params });

    return response.data.psrozklad_export.departments
      .map((d) => d.objects)
      .flat()
      .map((g) => this.clearText(g.name));
  }

  async getTeachers() {
    const params = { req_type: 'obj_list', req_mode: 'teacher' };
    const response = await this.axios.get<ExportTeachersType>('/timetable_export.cgi', { params });

    return response.data.psrozklad_export.departments
      .map((departmen) => {
        const departmentName = departmen.name.charAt(0).toUpperCase() + departmen.name.slice(1);

        return departmen.objects.map((teacher) => ({
          fullname: this.clearText(`${teacher.P} ${teacher.I} ${teacher.B}`),
          department: departmentName.length < 2 ? null : this.clearText(departmentName),
        }));
      })
      .flat();
  }

  async getClassrooms(): Promise<string[]> {
    const params = { req_type: 'obj_list', req_mode: 'room' };
    const response = await this.axios.get<ExportClassroomsType>('/timetable_export.cgi', { params });

    return response.data.psrozklad_export.blocks
      .map((d) => d.objects)
      .flat()
      .map((g) => this.clearText(g.name));
  }

  async getClassroomsTypes(): Promise<IClassroomType[]> {
    const params = { req_type: 'room_type_list', req_mode: 'room' };
    const response = await this.axios.get<ExportClassroomTypesType>('/timetable_export.cgi', {
      params,
    });
    return response.data.psrozklad_export.objects;
  }

  async getSchedule(groupName: string, from: Date, to: Date) {
    const params = {
      req_type: 'rozklad',
      req_mode: 'group',
      ros_text: 'separated',
      all_stream_components: 'yes',
      OBJ_name: ConvertWin1254.toURI(groupName),
      end_date: this.convertDateForPSRozklad(to),
      begin_date: this.convertDateForPSRozklad(from),
    };

    const strParams = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    const response = await this.axios.get<string>(`/timetable_export.cgi?${strParams}`);
    const data: ExportRozkladType = JSON.parse(
      JSON.stringify(response.data).replaceAll('} {', '}, {').replaceAll('`', '’'),
    );

    const result = data.psrozklad_export.roz_items.map((item) => ({
      ...item,
      date: item.date.split('.').reverse().join('-'),
    }));

    return JSON.parse(this.clearText(JSON.stringify(result))) as IRozkladItem[];
  }

  private clearText(text: string) {
    return text.replaceAll(`'`, '’').replaceAll('‘', '’').replaceAll('`', '’');
  }

  private convertDateForPSRozklad(date: Date) {
    return date.toISOString().split('T')[0].split('-').reverse().join('.');
  }
}
