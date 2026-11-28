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
    "Une erreur est survenue lors de l'initialisation",
  );

  constructor() {
    this.loadInfos();
  }

  public loadInfos() {
    const request = this.http
      .get<FileInfoData[]>(
        '/api/infos',
        this.requestService.getJsonOptions(this.infosNotificationMessage),
      )
      .pipe(catchError(() => []));
    this.requestService.get(request).then((files) => {
      this.files.set(files);
    });
  }
}
