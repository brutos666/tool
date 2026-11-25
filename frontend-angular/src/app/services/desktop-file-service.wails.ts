// Adapte le chemin à ce que wails3 génère réellement dans bindings/
import * as FS from '../../../bindings/goTool/cmd/desktop/services/fileservice';
import { FileService } from './file-service.js';

export class DesktopFileService implements FileService {
  async pick(accept = '*'): Promise<File | null> {
    const r = await FS.Pick(accept);
    if (!r) return null;
    const bytes = Uint8Array.from(atob(r.content as unknown as string), (c) => c.charCodeAt(0));
    return new File([bytes], r.name);
  }

  save(name: string, content: string) {
    return FS.SaveFile(name, content);
  }
}
