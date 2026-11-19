import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { StorageService } from '../services/storage.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let storageService: jasmine.SpyObj<StorageService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const storageSpy = jasmine.createSpyObj('StorageService', [
      'getToken',
      'getSecureData'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: StorageService, useValue: storageSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when both token and userData exist', async () => {
    storageService.getToken.and.returnValue('valid-token');
    storageService.getSecureData.and.returnValue(Promise.resolve({ uid: '123', email: 'test@test.com', emailVerified: false }));

    const result = await guard.canActivate();

    expect(result).toBe(true);
  });

  it('should redirect to login when token is missing', async () => {
    storageService.getToken.and.returnValue(null);
    storageService.getSecureData.and.returnValue(Promise.resolve({ uid: '123', email: 'test@test.com', emailVerified: false }));
    router.createUrlTree.and.returnValue({} as any);

    const result = await guard.canActivate();

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to login when userData is missing', async () => {
    storageService.getToken.and.returnValue('valid-token');
    storageService.getSecureData.and.returnValue(Promise.resolve(null));
    router.createUrlTree.and.returnValue({} as any);

    const result = await guard.canActivate();

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to login when both token and userData are missing', async () => {
    storageService.getToken.and.returnValue(null);
    storageService.getSecureData.and.returnValue(Promise.resolve(null));
    router.createUrlTree.and.returnValue({} as any);

    const result = await guard.canActivate();

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
