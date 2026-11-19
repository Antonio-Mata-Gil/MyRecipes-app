import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {}

  async onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'circular',
    });
    await loading.present();

    try {
      const { email, password } = this.loginForm.value;
      // El authService ahora maneja el almacenamiento del token en cookies
      // y user-data en storage automáticamente
      await this.authService.login(email, password);

      await loading.dismiss();
      this.router.navigate(['/tabs/home']);
    } catch (error: any) {
      await loading.dismiss();
      const toast = await this.toastController.create({
        message: error.message || 'Error al iniciar sesión',
        duration: 3000,
        position: 'bottom',
        color: 'danger',
      });
      toast.present();
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
