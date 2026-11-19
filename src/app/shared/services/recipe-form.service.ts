import { Injectable } from '@angular/core';
import { ApiServiceService } from 'src/app/core/services/api-service.service';
import { ImageUploadService } from 'src/app/core/services/image-upload.service';
import { RecipesApiResponse } from 'src/app/core/services/recipes.models';

export type RecipePayload = Omit<RecipesApiResponse, 'id'>;

@Injectable({ providedIn: 'root' })
export class RecipeFormService {
  constructor(
    private apiService: ApiServiceService,
    private imageService: ImageUploadService
  ) {}

  /**
   * Persiste receta (crear o actualizar)
   */
  async saveRecipe(
    recipeData: RecipePayload,
    recipeId?: string
  ): Promise<string> {
    if (recipeId) {
      await this.apiService.editRecipes(
        recipeId,
        recipeData as RecipesApiResponse
      );
      return recipeId;
    }
    const docRef = await this.apiService.addReceipes(
      recipeData as RecipesApiResponse
    );
    return docRef.id;
  }

  /**
   * Procesa y sube imagen de receta
   */
  async handleRecipeImage(
    documentId: string,
    file: File | null,
    existingImageUrl?: string
  ): Promise<string | undefined> {
    if (!file && !existingImageUrl) return undefined;

    if (file) {
      await this.imageService.uploadImage(documentId, file);
      return await this.imageService.getImageUrl(documentId);
    }

    return existingImageUrl;
  }

  /**
   * Actualiza URL de imagen en receta
   */
  async updateRecipeImage(
    documentId: string,
    imageUrl: string
  ): Promise<void> {
    if (imageUrl) {
      await this.apiService.editRecipes(documentId, {
        img: imageUrl,
      } as RecipesApiResponse);
    }
  }

  /**
   * Elimina receta
   */
  deleteRecipe(recipeId: string): void {
    this.apiService.deleteRecipeById(recipeId);
  }
}
