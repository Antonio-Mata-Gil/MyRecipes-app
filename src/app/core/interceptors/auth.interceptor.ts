import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from '../services/storage.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private storageService: StorageService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return new Observable((observer) => {
      this.storageService.getToken('auth-token').then((token) => {
        if (token) {
          const authReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
          next.handle(authReq).subscribe({
            next: (event) => observer.next(event),
            error: (error) => observer.error(error),
            complete: () => observer.complete()
          });
        } else {
          next.handle(req).subscribe({
            next: (event) => observer.next(event),
            error: (error) => observer.error(error),
            complete: () => observer.complete()
          });
        }
      }).catch((error) => {
        console.error('Error getting token in interceptor:', error);
        next.handle(req).subscribe({
          next: (event) => observer.next(event),
          error: (error) => observer.error(error),
          complete: () => observer.complete()
        });
      });
    });
  }
}
