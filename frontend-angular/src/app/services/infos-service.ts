import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { NotificationMessage } from '../errors/notification-messages.js';
import { FileInfoData } from '../data/file-info-data.js';
import { catchError } from 'rxjs';
import { RequestService } from './request-service.js';

@Service()
export class InfosService {
  private requestService = inject(RequestService);

  files = signal<FileInfoData[]>([]);
  currentFileName = computed(() => this.files()[0]?.name || '');

  private http = inject(HttpClient);
  private infosNotificationMessage = new NotificationMessage(
    '',
    'Une erreur est survenue lors de la récupération des informations sur les fichiers ouverts',
  );
  private registerNotificationMessage = new NotificationMessage(
    '',
    'Une erreur est survenue lors du stockage du fichier ouvert',
  );

  constructor() {
    this.loadInfos();
  }

  public loadInfos() {
    const request = this.http
      .get<FileInfoData[]>(
        '/api/file/infos',
        this.requestService.getJsonOptions(this.infosNotificationMessage),
      )
      .pipe(catchError(() => []));
    this.requestService.get(request).then((files) => {
      this.files.set(files);
    });
  }

  public registerFile(fileName: string) {
    const fileInfosData = new FileInfoData();
    fileInfosData.name = fileName;
    const request = this.http.post<FileInfoData>(
      `/api/file/register`,
      fileInfosData,
      this.requestService.getJsonOptions(this.registerNotificationMessage),
    );
    this.requestService.get(request).then((file) => {
      this.files.set([file, ...this.files()]);
    });
  }
}
