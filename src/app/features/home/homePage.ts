import { Component } from '@angular/core';
import { ApiServiceService } from 'src/app/core/services/api-service.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { RecipesApiResponse } from 'src/app/core/services/recipes.models';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public ApiRecipes?: RecipesApiResponse[] = [];
  public filteredRecipes?: RecipesApiResponse[] = [];
  public currentUserUid: string | null = null;

  constructor(
    private recipesApi: ApiServiceService,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    this.authService.getCurrentUserData().subscribe((userData) => {
      this.currentUserUid = userData?.uid ?? null;
      if (this.currentUserUid) {
        this.getRecipesList(this.currentUserUid);
      }
    });
  }

  public getRecipesList(uid: string, event?: any) {
    this.recipesApi.getRecipe(uid).subscribe(
      (recipes) => {
        this.ApiRecipes = recipes;
        this.filteredRecipes = this.ApiRecipes.slice(0, 10);
        this.segmentChanged(event);
      },
      (error) => {
        console.error('Error al cargar recetas:', error);
      }
    );
  }

  public segmentChanged(event?: any) {
    if (!this.ApiRecipes) return;

    const selectedSegment = event?.detail?.value ?? 'Popular';

    if (selectedSegment === 'Popular') {
      this.filteredRecipes = this.ApiRecipes.slice(0, 10);
    } else if (selectedSegment === 'new') {
      this.filteredRecipes = this.ApiRecipes.slice(-10);
    } else if (selectedSegment === 'My-recipes') {
      this.filteredRecipes = this.ApiRecipes.filter(
        (recipe) => recipe.uid === this.currentUserUid
      );
    }
  }

  handleRefresh(ev: any) {
    if (this.currentUserUid) {
      this.getRecipesList(this.currentUserUid);
    }
    setTimeout(() => {
      ev.target.complete();
    }, 1000);
  }
}
