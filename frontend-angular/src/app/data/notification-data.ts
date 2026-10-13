import { Data } from './data.js';

export class NotificationData extends Data {
  constructor(
    id: string,
    private message: string,
    private type: 'error' | 'success' | 'warning' | 'info',
    private shortLived: boolean,
  ) {
    super(id);
  }

  getType(): 'error' | 'success' | 'warning' | 'info' {
    return this.type;
  }

  getMessage(): string {
    return this.message;
  }

  isShortLived(): boolean {
    return this.shortLived;
  }
}
