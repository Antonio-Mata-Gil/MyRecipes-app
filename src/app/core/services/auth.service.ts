import { Injectable } from "@angular/core";
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "@angular/fire/auth";
import { StorageService } from "./storage.service";
import { BehaviorSubject, Observable } from "rxjs";
import { Router } from "@angular/router";

interface UserData {
  uid: string;
  email: string | null;
  emailVerified: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<UserData | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();
    private readonly TOKEN_KEY = 'auth-token';
    private readonly USER_DATA_KEY = 'user-data';
    private isInitialized = false;

    constructor(
      private auth: Auth,
      private storageService: StorageService,
      private router: Router
    ) {}

    async initializeAuthState(): Promise<boolean> {
      if (this.isInitialized) {
        return this.isAuthenticated();
      }

      try {
        const userData = await this.storageService.getSecureData(this.USER_DATA_KEY);
        const token = await this.storageService.getToken(this.TOKEN_KEY);

        if (userData && token) {
          this.currentUserSubject.next(userData);
          this.isInitialized = true;
          return true;
        }

        this.isInitialized = true;
        return false;
      } catch (error) {
        console.error('Error initializing auth state:', error);
        this.isInitialized = true;
        return false;
      }
    }

    async signUp(email: string, password: string) {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const token = await userCredential.user.getIdToken();

      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        emailVerified: userCredential.user.emailVerified
      };

      await this.storageService.setToken(this.TOKEN_KEY, token);
      await this.storageService.setSecureData(this.USER_DATA_KEY, userData);
      this.currentUserSubject.next(userData);

      return userCredential;
    }

    async login(email: string, password: string) {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const token = await userCredential.user.getIdToken();

      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        emailVerified: userCredential.user.emailVerified
      };

      await this.storageService.setToken(this.TOKEN_KEY, token);
      await this.storageService.setSecureData(this.USER_DATA_KEY, userData);
      this.currentUserSubject.next(userData);

      return userCredential;
    }

    async logout() {
      try {
        await signOut(this.auth);
        await this.storageService.removeToken(this.TOKEN_KEY);
        await this.storageService.removeSecureData(this.USER_DATA_KEY);
        await this.storageService.clearSecureData();
        this.currentUserSubject.next(null);
        this.isInitialized = false;
        await this.router.navigate(['/login']);
      } catch (error) {
        console.error('Error during logout:', error);
        throw error;
      }
    }

    async getUser(): Promise<UserData | null> {
      return await this.storageService.getSecureData(this.USER_DATA_KEY);
    }

    async getToken(): Promise<string | null> {
      return await this.storageService.getToken(this.TOKEN_KEY);
    }

    isAuthenticated(): boolean {
      return this.currentUserSubject.value !== null;
    }

    getCurrentUserData(): Observable<UserData | null> {
      return this.currentUser$;
    }

}