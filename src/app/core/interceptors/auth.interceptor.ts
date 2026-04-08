import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { UsersService } from '../services/users/users';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);
  const userService = inject(UsersService);

  const token = localStorage.getItem('token');

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = 'Ocurrió un error inesperado';
      let errorSummary = 'Error';

      if (error) {
        if (error.error?.data[0]?.message.toLowerCase().includes('token')) {
          userService.logout().subscribe({
            next: (response) => {
              errorMsg =
                error.error?.data[0]?.message || 'Ocurrió un error inesperado. Inténtalo de nuevo.';
              errorSummary = 'Error';
              location.reload();
              return throwError(() => error);
            },
          });
        }

        errorMsg =
          error.error?.data[0]?.message || 'Ocurrió un error inesperado. Inténtalo de nuevo.';
        errorSummary = 'Error';
      }

      messageService.add({
        severity: 'error',
        summary: errorSummary,
        detail: errorMsg,
        life: 5000,
      });

      return throwError(() => error);
    }),
  );
};
