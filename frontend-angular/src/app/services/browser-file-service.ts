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

  async save(name: string, content: string) {
    const url = URL.createObjectURL(new Blob([content]));
    const a = Object.assign(document.createElement('a'), { href: url, download: name });
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }
}
