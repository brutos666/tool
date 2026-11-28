import { FileService } from './file-service.js';

export class BrowserFileService implements FileService {
  pick(accept = '*') {
    return new Promise<File | null>((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.onchange = () => resolve(input.files?.[0] ?? null);
      input.click();
    });
  }

  async saveAs(name: string, blob: Blob) {
    const url = window.URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: name });
    a.click();

    window.URL.revokeObjectURL(url);
    return name;
  }

  save(): never {
    throw new Error('Desktop only');
  }
}
