import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { NotificationService } from '../services/notification-service.js';
import { NotificationMessage } from './notification-messages.js';

export class ErrorInterceptor {
  static notificationMessage = new HttpContextToken<NotificationMessage>(
    () => new NotificationMessage('Opération effectuée avec succès', 'Une erreur est survenue'),
  );

  static notify(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    const notificationService = inject(NotificationService);
    return next(req).pipe(
      catchError((err: HttpErrorResponse) => {
        //if (err.status === 401) inject(Router).navigate(['/login']);
        const response = err.error;
        const failedMessage = req.context.get(ErrorInterceptor.notificationMessage).getFailure();
        notificationService.addNotification(`${failedMessage} (${response.error})`, 'error');
        return throwError(() => err);
      }),
      tap((event) => {
        if (event.type === HttpEventType.Response) {
          const successMessage = req.context.get(ErrorInterceptor.notificationMessage).getSuccess();
          notificationService.addNotification(successMessage, 'success');
        }
      }),
    );
  }
}
