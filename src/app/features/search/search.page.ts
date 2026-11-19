import { Component, OnInit } from '@angular/core';
import { ApiServiceService } from 'src/app/core/services/api-service.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { RecipesApiResponse } from 'src/app/core/services/recipes.models';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  public ApiRecipes?: RecipesApiResponse[] = [];
  public currentUserUid: string | null = null;

  constructor(
    private recipesApi: ApiServiceService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.getCurrentUserData().subscribe((userData) => {
      this.currentUserUid = userData?.uid || null;
      this.getRecipesList();
    });
  }
  public getRecipesList() {
    if (!this.currentUserUid) return;
    this.recipesApi.getRecipe(this.currentUserUid).subscribe((recipes) => {
      this.ApiRecipes = recipes;
    });
  }
}
