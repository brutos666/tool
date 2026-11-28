import { Component, inject } from '@angular/core';
import { InfosService } from '../../services/infos-service.js';

@Component({
  imports: [],
  selector: 'file-infos',
  styleUrl: './file-infos.scss',
  templateUrl: './file-infos.html',
})
export class FileInfos {
  infosService = inject(InfosService);
}
