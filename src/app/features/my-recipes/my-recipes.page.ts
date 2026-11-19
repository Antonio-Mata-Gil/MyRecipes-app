import { Component, OnInit } from '@angular/core';
import { ApiServiceService } from 'src/app/core/services/api-service.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { RecipesApiResponse } from 'src/app/core/services/recipes.models';

@Component({
  selector: 'app-my-recipes',
  templateUrl: './my-recipes.page.html',
  styleUrls: ['./my-recipes.page.scss'],
})
export class MyRecipesPage implements OnInit {
  public myRecipes: RecipesApiResponse [] = [];
  public currentUserUid: string | null = null;

  constructor(private apiService: ApiServiceService, private authService: AuthService) { }

  ngOnInit() {
    this.authService.getCurrentUserData().subscribe((userData) => {
      this.currentUserUid = userData?.uid ?? null;
      this.getRecipesList();
    });
  }
  public getRecipesList() {
    if (!this.currentUserUid) return;
    this.apiService.getRecipe(this.currentUserUid).subscribe(recipes => {
      this.myRecipes = recipes.filter(recipe => recipe.uid === this.currentUserUid);
      
    });
  }

  handleRefresh(ev: any) {
    this.getRecipesList();
    setTimeout(() => {
      ev.target.complete();
    }, 1000);
  }
}
