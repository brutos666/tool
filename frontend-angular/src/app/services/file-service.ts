// file.service.ts
import { InjectionToken } from '@angular/core';

export interface FileService {
  pick(accept: string): Promise<File | null>;
  save(name: string, content: string): Promise<boolean>;
}

export const FILE_SERVICE = new InjectionToken<FileService>('FILE_SERVICE');
