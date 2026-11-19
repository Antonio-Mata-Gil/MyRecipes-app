import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private storageService: StorageService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean | UrlTree> {
    try {
      const token = await this.storageService.getToken('auth-token');
      const userData = await this.storageService.getSecureData('user-data');

      if (token && userData) {
        return true;
      }

      return this.router.createUrlTree(['/login']);
    } catch (error) {
      console.error('Error in AuthGuard:', error);
      return this.router.createUrlTree(['/login']);
    }
  }
}
