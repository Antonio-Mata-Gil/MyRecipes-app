import { Component, ViewChild, OnInit } from '@angular/core';
import { Platform, AlertController, IonRouterOutlet } from '@ionic/angular';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild(IonRouterOutlet, { static: true }) routerOutlet: IonRouterOutlet | any;

  constructor(
    private platform: Platform,
    private alertController: AlertController,
    private location: Location,
    private authService: AuthService,
    private router: Router
  ) {
    this.backButtonEvent();
  }

  ngOnInit(): void {
    this.initializeApp();
  }

  async initializeApp(): Promise<void> {
    try {
      const isAuthenticated = await this.authService.initializeAuthState();

      if (isAuthenticated) {
        this.router.navigate(['/tabs/home']);
      } else {
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      this.router.navigate(['/login']);
    }
  }

  backButtonEvent(): void {
    this.platform.backButton.subscribeWithPriority(10, () => {
      if (!this.routerOutlet.canGoBack()) {
        this.backButtonAlert();
      } else {
        this.location.back();
      }
    });
  }

  async backButtonAlert(): Promise<void> {
    const alert = await this.alertController.create({
      message: '¿Quieres salir de MyRecipes?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salir',
          handler: () => {
            App.exitApp();
          }
        }
      ]
    });
    await alert.present();
  }
}
