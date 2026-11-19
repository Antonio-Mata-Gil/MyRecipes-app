import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { ApiServiceService } from 'src/app/core/services/api-service.service';
import { RecipeFormService, RecipePayload } from 'src/app/shared/services/recipe-form.service';
import { RecipesApiResponse } from 'src/app/core/services/recipes.models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-recipe-form',
  templateUrl: './recipe-form.component.html',
  styleUrls: ['./recipe-form.component.scss'],
})
export class RecipeFormComponent implements OnInit, OnDestroy {
  @Input() recipe?: RecipesApiResponse;

  recipeForm!: FormGroup;
  recipeId: string | null = null;
  selectedFile: File | null = null;
  isSubmitting = false;
  currentUserUid: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private recipeService: ApiServiceService,
    private formService: RecipeFormService,
    private route: ActivatedRoute,
    private router: Router,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit(): void {
    this.subscribeToUserData();
    this.buildForm();
    this.loadRecipeIfEditing();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Se suscribe a los datos del usuario actual
   */
  private subscribeToUserData(): void {
    this.authService
      .getCurrentUserData()
      .pipe(takeUntil(this.destroy$))
      .subscribe((userData) => {
        this.currentUserUid = userData?.uid ?? null;
      });
  }

  /**
   * Construye el formulario reactivo
   */
  private buildForm(): void {
    this.recipeForm = this.fb.group({
      img: '',
      title: [this.recipe?.title ?? '', [Validators.maxLength(50)]],
      description: [this.recipe?.description ?? '', [Validators.maxLength(150)]],
      category: [this.recipe?.category ?? '', Validators.required],
      time: [this.recipe?.time ?? '', Validators.required],
      ingredientes: this.fb.array([]),
      steps: this.fb.array([]),
      uid: [this.currentUserUid ?? ''],
      isPublic: [this.recipe?.isPublic ?? false],
    });

    if (this.recipe) {
      this.populateArrays();
    }
  }

  /**
   * Carga datos de receta si se está editando
   */
  private loadRecipeIfEditing(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        if (params['id']) {
          this.recipeId = params['id'];
          this.recipeService
            .getRecipeById(this.recipeId!)
            .pipe(takeUntil(this.destroy$))
            .subscribe((recipes) => {
              this.recipe = recipes[0];
              this.buildForm();
            });
        }
      });
  }

  /**
   * Llena arrays de ingredientes y pasos desde la receta
   */
  private populateArrays(): void {
    if (this.recipe?.ingredientes) {
      this.recipe.ingredientes.forEach(({ nombre, cantidad }) =>
        this.addIngredient(nombre, cantidad)
      );
    }

    if (this.recipe?.steps) {
      this.recipe.steps.forEach(({ step }, index) => {
        this.addStep(step);
        this.getSteps.at(index).get('number')?.setValue(index + 1);
      });
    }
  }

  /**
   * Getter para FormArray de ingredientes
   */
  get getIngredients(): FormArray {
    return this.recipeForm.get('ingredientes') as FormArray;
  }

  /**
   * Getter para FormArray de pasos
   */
  get getSteps(): FormArray {
    return this.recipeForm.get('steps') as FormArray;
  }

  /**
   * Añade ingrediente al formulario
   */
  addIngredient(nombre = '', cantidad = ''): void {
    this.getIngredients.push(
      this.fb.group({
        nombre: [nombre, Validators.required],
        cantidad: [cantidad, Validators.required],
      })
    );
  }

  /**
   * Elimina último ingrediente
   */
  removeLastIngredient(): void {
    const { length } = this.getIngredients;
    if (length > 0) {
      this.getIngredients.removeAt(length - 1);
    }
  }

  /**
   * Añade paso al formulario
   */
  addStep(stepText = ''): void {
    this.getSteps.push(
      this.fb.group({
        number: this.getSteps.length + 1,
        step: [stepText, Validators.required],
      })
    );
  }

  /**
   * Elimina último paso
   */
  removeLastStep(): void {
    const { length } = this.getSteps;
    if (length > 0) {
      this.getSteps.removeAt(length - 1);
      this.updateStepNumbers();
    }
  }

  /**
   * Actualiza números de pasos
   */
  private updateStepNumbers(): void {
    this.getSteps.controls.forEach((control, index) => {
      control.get('number')?.setValue(index + 1);
    });
  }
  /**
   * Maneja selección de imagen
   */
  onImageSelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    this.selectedFile = files?.length ? files[0] : null;
  }

  /**
   * Orquestador principal del guardado
   */
  async onSubmit(): Promise<void> {
    if (!this.isValid()) return;

    this.isSubmitting = true;
    try {
      const recipeData = this.buildRecipePayload();
      const docId = await this.formService.saveRecipe(
        recipeData,
        this.recipeId ?? undefined
      );

      const imageUrl = await this.formService.handleRecipeImage(
        docId,
        this.selectedFile,
        this.recipe?.img
      );

      if (imageUrl) {
        await this.formService.updateRecipeImage(docId, imageUrl);
      }

      await this.showAlert(
        'Receta Subida',
        'Tu receta ha sido subida con éxito',
        () => this.navigateAfterSuccess()
      );
    } catch (error) {
      console.error('Error al guardar la receta:', error);
      await this.showAlert(
        'Error',
        'Ocurrió un error al guardar la receta. Intenta de nuevo.',
        undefined
      );
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Valida que el formulario sea válido y usuario esté autenticado
   */
  private isValid(): boolean {
    if (!this.recipeForm.valid || !this.currentUserUid) {
      console.error('Formulario no válido o usuario no autenticado');
      return false;
    }
    return true;
  }

  /**
   * Construye el payload de la receta
   */
  private buildRecipePayload(): RecipePayload {
    return {
      ...this.recipeForm.value,
      uid: this.currentUserUid,
    };
  }

  /**
   * Muestra alerta genérica
   */
  private async showAlert(
    header: string,
    message: string,
    handler?: () => void
  ): Promise<void> {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: [
        {
          text: handler ? 'Volver al home' : 'Aceptar',
          handler,
        },
      ],
    });
    await alert.present();
  }

  /**
   * Navega después de guardar exitosamente
   */
  private navigateAfterSuccess(): void {
    this.recipeId
      ? this.router.navigate(['/tabs'])
      : this.modalCtrl.dismiss(null, 'cancel');
  }

  /**
   * Muestra alerta de confirmación para eliminar
   */
  async deleteAlert(recipeId: string): Promise<void> {
    if (!this.recipe) return;

    const alert = await this.alertCtrl.create({
      header: 'Se eliminará la receta',
      message: '¿Estás seguro de que deseas eliminar esta receta?',
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Sí',
          handler: () => this.delete(recipeId),
        },
      ],
    });
    await alert.present();
  }

  /**
   * Elimina la receta y navega
   */
  private delete(recipeId: string): void {
    this.formService.deleteRecipe(recipeId);
    this.router.navigate(['/tabs']);
  }

  /**
   * Formateador de tiempo para el rango
   */
  formatTime = (value: number): string => `${value} min`;
}
