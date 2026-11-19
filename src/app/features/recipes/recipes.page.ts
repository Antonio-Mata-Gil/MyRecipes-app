import { Component, OnInit } from '@angular/core';
import { ApiServiceService } from 'src/app/core/services/api-service.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { RecipesApiResponse } from 'src/app/core/services/recipes.models';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.page.html',
  styleUrls: ['./recipes.page.scss'],
})
export class RecipesPage implements OnInit {
  
  public ApiRecipes: RecipesApiResponse[] = [];
  public filterText: string = '';
  public currentUserUid: string | null = null;

  constructor(private recipesApi: ApiServiceService, private authService: AuthService) { }

  ngOnInit() {
    this.authService.getCurrentUserData().subscribe(userData => {
      this.currentUserUid = userData?.uid || null;
    });
    this.getRecipesList();
  }
  public getRecipesList() {
    if (!this.currentUserUid) return;
    this.recipesApi.getRecipe(this.currentUserUid).subscribe(recipes => {
      this.ApiRecipes = recipes;
      
    });
}
onFilterTextChange(event: string) {
  this.filterText = event
  
}

handleRefresh(ev: any) {
  this.getRecipesList();
  setTimeout(() => {
    ev.target.complete();
  }, 1000);
}

}