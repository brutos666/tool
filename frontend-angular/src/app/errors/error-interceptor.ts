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
        let errorMessage = '';
        switch (err.status) {
          case 404:
            errorMessage =
              'Ressource non trouvée : la requête http existe-t-elle ? <br>Le fichier demandé existe-t-il sur le serveur ?';
            break;
          case 502:
            errorMessage = 'Serveur introuvable : le serveur a-t-il été démarré ?';
            break;
          default:
            errorMessage = response.error;
            break;
        }
        const failedMessage = req.context.get(ErrorInterceptor.notificationMessage).getFailure();
        notificationService.addNotification(`${failedMessage}. <p>${errorMessage}</p>`, 'error');
        console.error(err);
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
