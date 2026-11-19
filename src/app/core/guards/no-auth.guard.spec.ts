import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NoAuthGuard } from './no-auth.guard';
import { StorageService } from '../services/storage.service';

describe('NoAuthGuard', () => {
  let guard: NoAuthGuard;
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
        NoAuthGuard,
        { provide: StorageService, useValue: storageSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(NoAuthGuard);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access to login/register when not authenticated', async () => {
    storageService.getToken.and.returnValue(null);
    storageService.getSecureData.and.returnValue(Promise.resolve(null));

    const result = await guard.canActivate();

    expect(result).toBe(true);
  });

  it('should allow access when token exists but userData is missing', async () => {
    storageService.getToken.and.returnValue('valid-token');
    storageService.getSecureData.and.returnValue(Promise.resolve(null));

    const result = await guard.canActivate();

    expect(result).toBe(true);
  });

  it('should redirect to home when both token and userData exist', async () => {
    storageService.getToken.and.returnValue('valid-token');
    storageService.getSecureData.and.returnValue(Promise.resolve({ uid: '123', email: 'test@test.com', emailVerified: false }));
    router.createUrlTree.and.returnValue({} as any);

    const result = await guard.canActivate();

    expect(router.createUrlTree).toHaveBeenCalledWith(['/tabs/home']);
  });

  it('should redirect to home when userData exists but token is missing', async () => {
    storageService.getToken.and.returnValue(null);
    storageService.getSecureData.and.returnValue(Promise.resolve({ uid: '123', email: 'test@test.com', emailVerified: false }));
    router.createUrlTree.and.returnValue({} as any);

    const result = await guard.canActivate();

    expect(router.createUrlTree).toHaveBeenCalledWith(['/tabs/home']);
  });
});
