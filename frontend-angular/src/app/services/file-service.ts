// file.service.ts
import { InjectionToken } from '@angular/core';

export interface FileService {
  pick(accept: string): Promise<File | null>;
  saveAs(name: string, blob: Blob): Promise<string>;
  save(name: string, blob: Blob): Promise<void>;
}

export const FILE_SERVICE = new InjectionToken<FileService>('FILE_SERVICE');
