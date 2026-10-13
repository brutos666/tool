export class NotificationMessage {
  constructor(
    private success: string,
    private failure: string,
  ) {}

  getSuccess(): string {
    return this.success;
  }
  getFailure(): string {
    return this.failure;
  }
}
