import { FileService } from './file-service.js';

export class DesktopFileService implements FileService {
  pick(): never {
    throw new Error('Desktop only');
  }
  save(): never {
    throw new Error('Desktop only');
  }
}
